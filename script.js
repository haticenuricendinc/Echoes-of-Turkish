const API_URL = "https://api.sheetbest.com/sheets/64ea120f-9c2e-451b-9d58-bb525e2d9308";
const container = document.getElementById("word-container");

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    data.forEach(row => {
      const box = document.createElement("div");
      box.className = "word-box";

      const keys = Object.keys(row).filter(k => row[k]); // boş olmayanlar

      if (keys.length > 0) {
        const main = document.createElement("div");
        main.className = "main-word";
        main.textContent = row[keys[0]];
        box.appendChild(main);

        for (let i = 1; i < keys.length; i++) {
          const sub = document.createElement("div");
          sub.className = "sub-word";
          sub.textContent = row[keys[i]];
          box.appendChild(sub);
        }

        container.appendChild(box);
      }
    });
  })
  .catch(error => {
    container.innerHTML = "<p>Veriler yüklenirken hata oluştu.</p>";
    console.error(error);
  });