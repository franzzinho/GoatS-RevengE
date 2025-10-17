// 🔍 Pagine incluse nella ricerca
const pages = [
  { url: "../index.html", title: "Home" },
  { url: "../ABOUT.html", title: "About" },
  { url: "../SOCIAL IDEAS.html", title: "Contatti" }
];

function norm(s) { return (s || "").toString().normalize("NFC").toLowerCase(); }
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s]));
}
function escapeRegExp(string) { return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("q") || "";
  try { return decodeURIComponent(raw); } catch { return raw; }
}

async function searchSite() {
  const queryRaw = getQuery();
  const query = norm(queryRaw);
  const resultsDiv = document.getElementById("results");
  const countEl = document.getElementById("results-count");
  const inputEl = document.getElementById("searchQuery");

  if (!query) {
    resultsDiv.innerHTML = "<p>Digita qualcosa per cercare 🔍</p>";
    countEl.textContent = "";
    return;
  }

  inputEl.value = queryRaw;
  resultsDiv.innerHTML = "<p>Sto cercando...</p>";
  let totalMatches = 0;
  const allResults = [];

  for (const page of pages) {
    try {
      const res = await fetch(page.url);
      if (!res.ok) continue;
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const bodyText = norm(doc.body.textContent);

      const matches = [];
      let index = bodyText.indexOf(query);
      while (index !== -1) {
        const snippetStart = Math.max(0, index - 60);
        const snippetEnd = Math.min(bodyText.length, index + 120);
        const snippet = doc.body.textContent.substring(snippetStart, snippetEnd).replace(/\s+/g, " ");
        matches.push(snippet);
        index = bodyText.indexOf(query, index + query.length);
      }

      if (matches.length > 0) {
        totalMatches += matches.length;
        const snippetHTML = matches.map(snip =>
          `<p>${escapeHtml(snip).replace(
            new RegExp(escapeRegExp(queryRaw), "gi"),
            match => `<mark>${match}</mark>`
          )}</p>`
        ).join("");

        allResults.push(`
          <div class="result">
            <h3><a href="${page.url}" target="_self">${page.title}</a></h3>
            ${snippetHTML}
          </div>
        `);
      }
    } catch (err) {
      console.error("Errore su", page.url, err);
    }
  }

  if (allResults.length === 0) {
    resultsDiv.innerHTML = `<p>Nessun risultato per “${escapeHtml(queryRaw)}” 😕</p>`;
    countEl.textContent = "";
  } else {
    resultsDiv.innerHTML = allResults.join("");
    countEl.textContent = `${totalMatches} risultato${totalMatches > 1 ? "i" : ""} trovati per “${escapeHtml(queryRaw)}”`;
  }
}

searchSite();
