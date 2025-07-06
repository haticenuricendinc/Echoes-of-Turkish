document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const sheetbestApiUrl = 'https://api.sheetbest.com/sheets/64ea120f-9c2e-451b-9d58-bb525e2d9308';
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

                // Ana kelime (ilk sütun)
                const mainWordContainer = document.createElement('div');
                mainWordContainer.classList.add('main-word-container');

                const mainWordSpan = document.createElement('span');
                mainWordSpan.classList.add('main-word');
                mainWordSpan.textContent = row.KÖK; // 'kelime1' yerine ilk sütununuzun başlığını kullanın

                const mainWordMeaningSpan = document.createElement('span');
                mainWordMeaningSpan.classList.add('main-word-meaning');
                mainWordMeaningSpan.textContent = ` (${row.KÖK})`; // 'anlam1' yerine ilk kelimenin anlamının sütun başlığını kullanın

                mainWordContainer.appendChild(mainWordSpan);
                mainWordContainer.appendChild(mainWordMeaningSpan);
                wordBox.appendChild(mainWordContainer);

                // Türetilen kelimeler (kalan sütunlar)
                const derivedWordsList = document.createElement('ul');
                derivedWordsList.classList.add('derived-words-list');

                // Sütunlarınızı Sheetbest'in API'sinden geldiği şekliyle burada döngüye sokun
                // Örnek: kelime2, anlam2, kelime3, anlam3...
                // Google Sheet'inizdeki sütun başlıklarına göre bu kısmı özelleştirmeniz gerekecek.
                // Örneğin, sheet'inizde "Kelime", "Anlam", "TüretilmişKelime1", "Anlam1"... gibi başlıklar varsa,
                // bunları 'row.TüretilmişKelime1' gibi kullanmanız gerekecektir.
                // Burada örnek olarak 2. ve 3. kelimeleri ekliyorum, daha fazlası için döngüyü genişletin.
                if (row.kelime2 && row.anlam2) {
                    const derivedWordItem = document.createElement('li');
                    derivedWordItem.classList.add('derived-word-item');
                    derivedWordItem.innerHTML = `<span class="derived-word">${row.kelime2}</span> <span class="derived-word-meaning">(${row.anlam2})</span>`;
                    derivedWordsList.appendChild(derivedWordItem);
                }
                if (row.kelime3 && row.anlam3) {
                    const derivedWordItem = document.createElement('li');
                    derivedWordItem.classList.add('derived-word-item');
                    derivedWordItem.innerHTML = `<span class="derived-word">${row.kelime3}</span> <span class="derived-word-meaning">(${row.anlam3})</span>`;
                    derivedWordsList.appendChild(derivedWordItem);
                }
                // Diğer kelimeler için benzer 'if' blokları ekleyin
                // Örneğin:
                // if (row.kelime4 && row.anlam4) { ... }


                wordBox.appendChild(derivedWordsList);
                contentDiv.appendChild(wordBox);
            });
        })
        .catch(error => {
            console.error('Veri çekme hatası:', error);
            contentDiv.innerHTML = '<p>Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>';
        });
});