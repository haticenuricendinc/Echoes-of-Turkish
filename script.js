// Kelime ve anlamı aynı string'den ayıran yardımcı fonksiyon
function parseWordMeaning(fullString) {
    if (!fullString) {
        return { word: '', meaning: '' };
    }

    let word = fullString.trim();
    let meaning = '';
    let separatorIndex = -1;

    // Önce iki nokta üst üste (:) arıyoruz
    separatorIndex = word.indexOf(':');
    if (separatorIndex === -1) {
        // Eğer iki nokta üst üste yoksa, boşluklu tire (" - ") arıyoruz
        separatorIndex = word.indexOf(' - ');
        if (separatorIndex === -1) {
            // Eğer boşluklu tire de yoksa, tek tire ("-") arıyoruz,
            // ama bu tire kelimenin sonunda değilse veya bir boşlukla ayrılmıyorsa
            // "aç-" gibi köklerdeki tireleri kelimenin parçası olarak bırakmak için dikkatli olmalıyız.
            // Görseldeki 'aç- to buy' gibi örneklerde tireden sonra boşluk var.
            let firstSpaceIndex = word.indexOf(' ');
            if (firstSpaceIndex !== -1 && word.substring(0, firstSpaceIndex).endsWith('-')) {
                separatorIndex = firstSpaceIndex -1; // tirenin konumunu al
                // Bu durumda separator 'tire + boşluk'tur.
            } else {
                // Eğer belirgin bir ayırıcı yoksa, tüm string'i kelime olarak kabul et
                return { word: fullString.trim(), meaning: '' };
            }
        }
    }


    if (separatorIndex !== -1) {
        word = fullString.substring(0, separatorIndex).trim();
        // Ayırıcıdan sonraki kısmı anlam olarak al
        // Ayırıcının uzunluğuna göre substring başlangıcını ayarla (örn: ':' için 1, ' - ' için 3, '- ' için 2)
        let effectiveSeparatorLength = 1; // Default for ':' or single '-'
        if (fullString.substring(separatorIndex, separatorIndex + 3) === ' - ') {
            effectiveSeparatorLength = 3;
        } else if (fullString.substring(separatorIndex, separatorIndex + 2) === '- ') {
            effectiveSeparatorLength = 2;
        }
        meaning = fullString.substring(separatorIndex + effectiveSeparatorLength).trim();
    }

    return { word, meaning: meaning || '' };
}


document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    // BURAYA SİZİN Sheetbest API URL'nizi yapıştırın
    const sheetbestApiUrl = 'https://api.sheetbest.com/sheets/64ea120f-9c2e-451b-9d58-bb525e2d9308';

    fetch(sheetbestApiUrl)
        .then(response => {
            if (!response.ok) {
                // HTTP hatası durumunda detaylı bilgi ver
                return response.text().then(text => { throw new Error(`HTTP error! status: ${response.status}, message: ${text}`); });
            }
            return response.json();
        })
        .then(data => {
            contentDiv.innerHTML = ''; // "Veriler yükleniyor..." yazısını kaldır

            // Her satırı (veri kaydını) işleyerek bir kelime kutusu oluştur
            data.forEach(row => {
                // KÖK sütunu boşsa bu satırı atla
                if (!row.KÖK || typeof row.KÖK !== 'string' || row.KÖK.trim() === '') {
                    return;
                }

                const wordBox = document.createElement('div');
                wordBox.classList.add('word-box');

                // --- Ana Kelime ve Anlamı ---
                const mainWordContainer = document.createElement('div');
                mainWordContainer.classList.add('main-word-container');

                const mainParsed = parseWordMeaning(row.KÖK); // KÖK sütunundaki değeri ayrıştır
                const mainWordSpan = document.createElement('span');
                mainWordSpan.classList.add('main-word');
                mainWordSpan.textContent = mainParsed.word;

                const mainWordMeaningSpan = document.createElement('span');
                mainWordMeaningSpan.classList.add('main-word-meaning');
                mainWordMeaningSpan.textContent = mainParsed.meaning ? ` (${mainParsed.meaning})` : '';

                mainWordContainer.appendChild(mainWordSpan);
                mainWordContainer.appendChild(mainWordMeaningSpan);
                wordBox.appendChild(mainWordContainer);

                // --- Türetilen Kelimeler ve Anlamları (t1'den t15'e kadar) ---
                const derivedWordsList = document.createElement('ul');
                derivedWordsList.classList.add('derived-words-list');

                // t1'den başlayarak t15'e kadar her sütunu bir türetilmiş kelime-anlam çifti olarak alıyoruz
                for (let i = 1; i <= 15; i++) {
                    const columnKey = `t${i}`;
                    const fullText = row[columnKey];

                    // Sütun doluysa ve bir string ise işleme devam et
                    if (fullText && typeof fullText === 'string' && fullText.trim() !== '') {
                        const parsed = parseWordMeaning(fullText); // Her sütundaki değeri ayrıştır
                        const derivedWord = parsed.word;
                        const derivedMeaning = parsed.meaning;

                        const derivedWordItem = document.createElement('li');
                        derivedWordItem.classList.add('derived-word-item');
                        derivedWordItem.innerHTML = `<span class="derived-word">${derivedWord}</span>` +
                                                    (derivedMeaning ? ` <span class="derived-word-meaning">(${derivedMeaning})</span>` : '');
                        derivedWordsList.appendChild(derivedWordItem);
                    }
                }

                wordBox.appendChild(derivedWordsList);
                contentDiv.appendChild(wordBox);
            });
        })
        .catch(error => {
            console.error('Veri çekme hatası:', error);
            contentDiv.innerHTML = '<p>Veriler yüklenirken bir hata oluştu. Lütfen Sheetbest API URL\'nizin doğru olduğundan ve Google E-Tablonuzun herkese açık olarak paylaşıldığından emin olun. Hata detayları için tarayıcınızın konsolunu kontrol edin.</p>';
        });
});