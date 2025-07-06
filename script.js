// Kelime ve anlamı aynı string'den ayıran yardımcı fonksiyon
function parseWordMeaning(fullString) {
    if (!fullString) {
        return { word: '', meaning: '' };
    }

    let word = fullString.trim();
    let meaning = '';
    let sepChar = '';
    let sepPos = -1;

    // Ayırıcıları öncelik sırasına göre kontrol et
    // 1. İki nokta üst üste (:)
    let possibleSep1 = fullString.indexOf(':');
    // 2. Boşluk-tire-boşluk (" - ")
    let possibleSep2 = fullString.indexOf(' - ');

    // En erken bulunan ve geçerli olan ayırıcıyı belirle
    if (possibleSep1 !== -1 && (possibleSep2 === -1 || possible1 < possibleSep2)) {
        sepPos = possibleSep1;
        sepChar = ':';
    } else if (possibleSep2 !== -1) {
        sepPos = possibleSep2;
        sepChar = ' - ';
    }
    // NOT: "aç-: to open" gibi durumlarda, "aç-" kelimenin kendisi olduğu için
    // tireyi ayırıcı olarak otomatik algılamaması için daha spesifik ayırıcılar kullanıldı.
    // Bu fonksiyon, ilk bulduğu geçerli ayırıcıya göre bölme yapacaktır.

    if (sepPos !== -1) {
        word = fullString.substring(0, sepPos).trim();
        meaning = fullString.substring(sepPos + sepChar.length).trim();
    } else {
        word = fullString.trim(); // Eğer belirgin bir ayırıcı yoksa, tüm string'i kelime olarak kabul et
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
                // JSON çıktısında "KÖK " anahtarının sonunda bir boşluk olduğuna dikkat!
                const mainRootKey = "KÖK ";
                if (!row[mainRootKey] || typeof row[mainRootKey] !== 'string' || row[mainRootKey].trim() === '') {
                    return; // KÖK sütunu boşsa bu satırı atla
                }

                const wordBox = document.createElement('div');
                wordBox.classList.add('word-box');

                // --- Ana Kelime ve Anlamı ---
                const mainWordContainer = document.createElement('div');
                mainWordContainer.classList.add('main-word-container');

                // Anahtar olarak "KÖK " kullanın
                const mainParsed = parseWordMeaning(row[mainRootKey]);
                const mainWordSpan = document.createElement('span');
                mainWordSpan.classList.add('main-word');
                mainWordSpan.textContent = mainParsed.word;

                const mainWordMeaningSpan = document.createElement('span');
                mainWordMeaningSpan.classList.add('main-word-meaning');
                mainWordMeaningSpan.textContent = mainParsed.meaning ? ` (${mainParsed.meaning})` : '';

                mainWordContainer.appendChild(mainWordSpan);
                mainWordContainer.appendChild(mainWordMeaningSpan);
                wordBox.appendChild(mainWordContainer);

                // --- Türetilen Kelimeler ve Anlamları (t1'den t16'ya kadar) ---
                const derivedWordsList = document.createElement('ul');
                derivedWordsList.classList.add('derived-words-list');

                // Döngüyü t16'ya kadar devam ettirin
                for (let i = 1; i <= 16; i++) {
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