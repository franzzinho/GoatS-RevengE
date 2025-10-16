// 🔍 Pagine incluse nella ricerca (metti qui i nomi ESATTI come sono nel repo)
const pages = [
  { url: "index.html", title: "Home" },
  { url: "ABOUT.html", title: "About" },
  { url: "SOCIAL IDEAS.html", title: "Contatti" }
];

// Normalize helper (gestisce accenti/emoji in modo più stabile)
function norm(s) {
  return (s || "").toString().normalize("NFC").toLowerCase();
}

// Prendi query ?q=
function getQueryRaw() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}
function getQuery() {
  try {
    return decodeURIComponent(getQueryRaw());
  } catch (e) {
    return getQueryRaw(); // fallback se decode falla
  }
}

// Funzione principale
async function searchSite() {
  const rawQuery = getQuery();
  const query = norm(rawQuery);
  const resultsDiv = document.getElementById("results");
  const countEl = document.getElementById("results-count");
  const inputEl = document.getElementById("searchQuery");

  if (!query) {
    resultsDiv.innerHTML = "<p>Digita qualcosa per cercare 🔍</p>";
    countEl.textContent = "";
    return;
  }

  inputEl.value = rawQuery;
  let totalMatches = 0;
  resultsDiv.innerHTML = "<p>Sto cercando...</p>";

  const resultsHTML = [];

  for (const page of pages) {
    try {
      // usa encodeURI per gestire spazi e caratteri nei nomi file
      const fetchUrl = encodeURI(page.url);
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        console.warn("Non trovato:", fetchUrl, res.status);
        continue;
      }
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const bodyText = norm(doc.body ? doc.body.textContent : "");

      // cerca tutte le occorrenze
      const matches = [];
      let index = bodyText.indexOf(query);
      while (index !== -1) {
        const start = Math.max(0, index - 60);
        const end = Math.min(bodyText.length, index + 120);
        const rawSnippet = (doc.body ? doc.body.textContent : "").substring(start, end).replace(/\s+/g, " ");
        matches.push(rawSnippet);
        index = bodyText.indexOf(query, index + Math.max(1, query.length));
      }

      if (matches.length > 0) {
        totalMatches += matches.length;

        const snippetsHTML = matches
          .map(snip => `<p>${snip.replace(new RegExp(escapeRegExp(rawQuery), "gi"), match => `<mark>${match}</mark>`)}</p>`)
          .join("");

        // link relativo: manteniamo esatto page.url (userà lo stesso path)
        const safeHref = encodeURI(page.url);

        const resultBlock = `
          <div class="result">
            <h3 style="margin:0 0 8px 0;">
              <a href="${safeHref}" style="color:#00e5ff; text-decoration:none; text-shadow:0 0 10px #00e5ff;">
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
    resultsDiv.innerHTML = `<p>Nessun risultato per “${escapeHtml(rawQuery)}” 😕</p>`;
    countEl.textContent = "";
  } else {
    resultsDiv.innerHTML = resultsHTML.join("");
    countEl.textContent = `${totalMatches} risultato${totalMatches > 1 ? "i" : ""} trovati per “${escapeHtml(rawQuery)}”`;
  }
}

// utility: escape html
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
}

// utility: escape regex metacharacters
function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Gestisci submit: redirect robusto (funziona sia da / che da /search_function/)
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const newQuery = document.getElementById("searchQuery").value.trim();
  if (!newQuery) return;

  // scegli path alla pagina di ricerca in modo "intelligente"
  let searchPath;
  if (window.location.pathname.includes("search_function")) {
    // già nella cartella della search -> apri SEARCH.html relativa
    searchPath = "SEARCH.html";
  } else {
    // siamo in root (o altrove) -> punta alla cartella search_function
    searchPath = "search_function/SEARCH.html";
  }

  // build final href (non usare window.location.origin + path perché su GH pages può avere subpath)
  const base = window.location.pathname.replace(/\/[^\/]*$/, ""); // directory corrente
  const href = (base === "/" ? "" : base) + "/" + searchPath + "?q=" + encodeURIComponent(newQuery);

  // normalizza doppie slash
  window.location.href = href.replace(/([^:]\/)\/+/g, "$1");
});

// Avvia ricerca se siamo su SEARCH.html
searchSite();
