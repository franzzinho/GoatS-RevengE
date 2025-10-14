// 🔍 Elenco delle pagine dove cercare
const pages = [
  { url: "../index.html", title: "Home" },
  { url: "../pages/about.html", title: "About" },
  { url: "../pages/contact.html", title: "Contatti" }
];

// ✅ Ottieni il parametro ?q=
function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") ? decodeURIComponent(params.get("q")).toLowerCase() : "";
}

// ✅ Mostra i risultati
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
  resultsDiv.innerHTML = "";

  for (const page of pages) {
    try {
      const res = await fetch(page.url);
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const bodyText = doc.body.textContent.toLowerCase();

      if (bodyText.includes(query)) {
        totalMatches++;

        const snippetIndex = bodyText.indexOf(query);
        const start = Math.max(0, snippetIndex - 60);
        const end = Math.min(bodyText.length, snippetIndex + 120);
        const snippet = doc.body.textContent.substring(start, end).replace(/\s+/g, " ");

        const resultHTML = `
          <div style="margin-bottom:20px; border-bottom:1px solid #ccc; padding-bottom:10px;">
            <h3><a href="${page.url}" style="color:#0073e6; text-decoration:none;">${page.title}</a></h3>
            <p>${snippet.replace(new RegExp(query, "gi"), match => `<mark>${match}</mark>`)}</p>
          </div>
        `;
        resultsDiv.insertAdjacentHTML("beforeend", resultHTML);
      }
    } catch (err) {
      console.error("Errore caricando", page.url, err);
    }
  }

  countEl.textContent = totalMatches
    ? `${totalMatches} risultato${totalMatches > 1 ? "i" : ""} trovati per “${query}”`
    : `Nessun risultato per “${query}” 😕`;
}

// ✅ Gestisci nuove ricerche
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const newQuery = document.getElementById("searchQuery").value.trim();
  if (newQuery) {
    window.location.href = "search.html?q=" + encodeURIComponent(newQuery);
  }
});

// ✅ Avvia ricerca al caricamento
searchSite();
