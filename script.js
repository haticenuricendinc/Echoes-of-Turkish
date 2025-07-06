// Kelime ve anlamı aynı string'den ayıran yardımcı fonksiyon
function parseWordMeaning(fullString) {
  if (!fullString || typeof fullString !== 'string') {
      return { word: '', meaning: '' };
  }

  let trimmedString = fullString.trim();
  let word = trimmedString;
  let meaning = '';

  let sepIndex = -1;
  let sepLength = 0;

  // Ayırıcıları öncelik sırasına göre kontrol et
  // 1. ": " (iki nokta üst üste ve boşluk)
  let colonSpaceIndex = trimmedString.indexOf(': ');
  if (colonSpaceIndex !== -1) {
      sepIndex = colonSpaceIndex;
      sepLength = 2;
  } else {
      // 2. ":" (sadece iki nokta üst üste)
      let colonIndex = trimmedString.indexOf(':');
      if (colonIndex !== -1) {
          sepIndex = colonIndex;
          sepLength = 1;
      } else {
          // 3. " - " (boşluk-tire-boşluk)
          let hyphenSpaceIndex = trimmedString.indexOf(' - ');
          if (hyphenSpaceIndex !== -1) {
              sepIndex = hyphenSpaceIndex;
              sepLength = 3;
          }
      }
  }

  if (sepIndex !== -1) {
      word = trimmedString.substring(0, sepIndex).trim();
      meaning = trimmedString.substring(sepIndex + sepLength).trim();
  }

  // Anlam parantez içinde başlıyorsa, parantezleri kaldır
  if (meaning.startsWith('(') && meaning.endsWith(')')) {
      meaning = meaning.substring(1, meaning.length - 1).trim();
  }

  return { word, meaning: meaning || '' };
}


document.addEventListener('DOMContentLoaded', () => {
  // HTML'deki <main> etiketiyle eşleşmesi için ID'yi "content" olarak düzeltiyoruz
  const contentDiv = document.getElementById('content');

  // Kullanıcının sağladığı ve JSON çıktısının geldiği doğru Sheetbest API URL'si
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
          // "Veriler yükleniyor..." mesajını temizle
          contentDiv.innerHTML = '';

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

              // Anahtar olarak "KÖK " kullanın ve parseWordMeaning fonksiyonu ile ayırın
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

              // Döngüyü t1'den t16'ya kadar devam ettirin
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

          // Eğer hiç veri yoksa uygun bir mesaj göster
          if (data.length === 0) {
              contentDiv.innerHTML = '<p>Sheet’te veri bulunamadı.</p>';
          }
      })
      .catch(error => {
          console.error('Veri çekme hatası:', error);
          contentDiv.innerHTML = '<p>Veriler yüklenirken bir hata oluştu. Lütfen Sheetbest API URL\'nizin doğru olduğundan ve Google E-Tablonuzun herkese açık olarak paylaşıldığından emin olun. Hata detayları için tarayıcınızın konsolunu kontrol edin.</p>';
      });
});