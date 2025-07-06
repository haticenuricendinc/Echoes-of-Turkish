document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    // BURAYA SİZİN Sheetbest API URL'nizi yapıştırın
    // Örnek: const sheetbestApiUrl = 'https://api.sheetbest.com/sheets/64ea120f-9c2e-451b-9d58-bb525e2d9308';
    const sheetbestApiUrl = 'https://api.sheetbest.com/sheets/64ea120f-9c2e-451b-9d58-bb525e2d9308'; // Sizin API URL'niz

    fetch(sheetbestApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            contentDiv.innerHTML = ''; // "Veriler yükleniyor..." yazısını kaldır

            // Her satırı işleyerek bir kelime kutusu oluştur
            data.forEach(row => {
                const wordBox = document.createElement('div');
                wordBox.classList.add('word-box');

                // Ana kelime (KÖK sütunu) ve anlamı (t1 sütunu)
                const mainWordContainer = document.createElement('div');
                mainWordContainer.classList.add('main-word-container');

                const mainWordSpan = document.createElement('span');
                mainWordSpan.classList.add('main-word');
                mainWordSpan.textContent = row.KÖK || ''; // KÖK sütunundaki değer

                const mainWordMeaningSpan = document.createElement('span');
                mainWordMeaningSpan.classList.add('main-word-meaning');
                mainWordMeaningSpan.textContent = row.t1 ? ` (${row.t1})` : ''; // t1 sütunundaki değer

                mainWordContainer.appendChild(mainWordSpan);
                mainWordContainer.appendChild(mainWordMeaningSpan);
                wordBox.appendChild(mainWordContainer);

                // Türetilen kelimeler ve anlamları (t2'den t15'e kadar çiftler halinde)
                const derivedWordsList = document.createElement('ul');
                derivedWordsList.classList.add('derived-words-list');

                // t2'den başlayarak her iki sütunda bir kelime ve anlam alıyoruz
                // Başlıklarınızdaki 't5' tekrarını dikkate alarak, t2, t3, t4, t5, t6, t7... olarak ilerliyoruz
                // Eğer Sheetbest 't5_1', 't5_2' gibi farklı isimler döndürürse, bu kısmı ayarlamanız gerekebilir.
                for (let i = 2; i <= 15; i += 2) {
                    const wordKey = `t${i}`;
                    const meaningKey = `t${i + 1}`; // Varsayım: her tX'ten sonra t(X+1) onun anlamıdır

                    const derivedWord = row[wordKey];
                    const derivedMeaning = row[meaningKey];

                    if (derivedWord) { // Kelime varsa listeye ekle
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
            contentDiv.innerHTML = '<p>Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya tarayıcınızın konsolunu kontrol edin.</p>';
        });
});