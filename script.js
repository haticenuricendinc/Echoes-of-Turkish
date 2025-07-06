const API_URL = "https://api.sheetbest.com/sheets/1MnYzEVaMEpMqkNQ3Chh0Uwo_F_x01F2M0SLRnfUhnF8";
const container = document.getElementById("word-container");

fetch(API_URL)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    data.forEach(row => {
      const box = document.createElement("div");
      box.className = "word-box";

      const main = row['Kelime'] || row['Word'] || Object.values(row)[0];
      const meaning = row['Anlam'] || row['Meaning'] || "";

      const mainEl = document.createElement("div");
      mainEl.className = "main-word";
      mainEl.textContent = main + (meaning ? ` — ${meaning}` : "");
      box.appendChild(mainEl);

      // Türev sütunlarını döngüyle yaz
      Object.keys(row).forEach(k => {
        if (k === 'Kelime' || k === 'Word' || k === 'Anlam' || k === 'Meaning') return;
        const val = row[k];
        if (!val) return;
        const subEl = document.createElement("div");
        subEl.className = "sub-word";
        subEl.textContent = val;
        box.appendChild(subEl);
      });

      container.appendChild(box);
    });

    if (data.length === 0) {
      container.innerHTML = "<p>Sheet’te veri bulunamadı.</p>";
    }
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p>Veri yüklenirken hata oluştu. Konsolu kontrol et.</p>";
  });