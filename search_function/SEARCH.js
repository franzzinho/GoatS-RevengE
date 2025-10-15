// 🔍 Pagine incluse nella ricerca
const pages = [
  { url: "index.html", title: "Home" },
  { url: "ABOUT.html", title: "About" },
  { url: "SOCIAL IDEAS.html", title: "Contatti" },
  // 👇 puoi aggiungere altre pagine qui
  // { url: "../shop.html", title: "Shop" },
];

// ✅ Ottieni la query dalla barra (?q=)
function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") ? decodeURIComponent(params.get("q")).toLowerCase() : "";
}

// ✅ Funzione principale
async function searchSite() {
  const query = getQuery();
  const resultsDiv = document.getElementById("results");
  const countEl = document.getElementById("results-count");
  const inputEl = document.getElementById("searchQuery");

  if (!query) {
    resultsDiv.innerHTML = "<p>Digita qualcosa per cercare 🔍</p>";
    countEl.textContent = "";
    return;
  }

  inputEl.value = query;
  let totalMatches = 0;
  resultsDiv.innerHTML = "<p>Sto cercando...</p>";

  const resultsHTML = [];

  for (const page of pages) {
    try {
      const res = await fetch(page.url);
      if (!res.ok) continue;
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const bodyText = doc.body.textContent.toLowerCase();

      // cerca tutte le occorrenze, non solo la prima
      const matches = [];
      let index = bodyText.indexOf(query);
      while (index !== -1) {
        const start = Math.max(0, index - 60);
        const end = Math.min(bodyText.length, index + 120);
        const snippet = doc.body.textContent
          .substring(start, end)
          .replace(/\s+/g, " ");
        matches.push(snippet);
        index = bodyText.indexOf(query, index + query.length);
      }

      if (matches.length > 0) {
        totalMatches += matches.length;

        // prepara blocco HTML per i risultati
        const snippetsHTML = matches
          .map(
            snip =>
              `<p>${snip.replace(
                new RegExp(query, "gi"),
                match => `<mark>${match}</mark>`
              )}</p>`
          )
          .join("");

        const resultBlock = `
          <div style="margin-bottom:25px; border-bottom:1px solid #ddd; padding-bottom:10px;">
            <h3 style="margin:0 0 8px 0;">
              <a href="${page.url}" style="color:#0066cc; text-decoration:none;">
                ${page.title}
              </a>
            </h3>
            ${snippetsHTML}
          </div>
        `;

        resultsHTML.push(resultBlock);
      }
    } catch (err) {
      console.error("Errore caricando", page.url, err);
    }
  }

  if (resultsHTML.length === 0) {
    resultsDiv.innerHTML = `<p>Nessun risultato per “${query}” 😕</p>`;
    countEl.textContent = "";
  } else {
    resultsDiv.innerHTML = resultsHTML.join("");
    countEl.textContent = `${totalMatches} risultato${
      totalMatches > 1 ? "i" : ""
    } trovati per “${query}”`;
  }
}

// ✅ Gestisci nuove ricerche dalla navbar
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const newQuery = document.getElementById("searchQuery").value.trim();
  if (newQuery) {
    window.location.href = "search_function/SEARCH.html?q=" + encodeURIComponent(newQuery);
  }
});

// ✅ Avvia ricerca al caricamento
searchSite();
