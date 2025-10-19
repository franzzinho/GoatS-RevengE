// percorso corretto delle pagine relativo alla posizione del file corrente
const isInSearch = window.location.pathname.includes("search_function");
const pages = [
  { url: isInSearch ? "../index.html" : "index.html", title: "Home" },
  { url: isInSearch ? "../ABOUT.html" : "ABOUT.html", title: "About" },
  { url: isInSearch ? "../SOCIAL IDEAS.html" : "SOCIAL IDEAS.html", title: "Social Ideas" }
];

function norm(s){ return (s||"").toString().normalize("NFC").toLowerCase(); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function getQuery(){ const p=new URLSearchParams(window.location.search); const raw=p.get("q")||""; try{return decodeURIComponent(raw);}catch{return raw;} }
function makeAnchorId(q,i){ return `match_${encodeURIComponent(q)}_${i}`; }

async function searchSite(){
  const queryRaw = getQuery();
  const qNorm = norm(queryRaw);
  const resultsDiv = document.getElementById("results");
  const countEl = document.getElementById("results-count");
  const inputEl = document.getElementById("searchQuery");

  if(!qNorm){ resultsDiv.innerHTML = "<p>Digita qualcosa per cercare 🔍</p>"; countEl.textContent=""; return; }
  inputEl.value = queryRaw;
  resultsDiv.innerHTML = "<p>Sto cercando...</p>";

  let totalMatches = 0;
  const allResults = [];

  for(const page of pages){
    try{
      const res = await fetch(page.url);
      if(!res.ok) continue;
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
      let node; let visible = "";
      while(walker.nextNode()){
        node = walker.currentNode;
        const chunk = node.nodeValue.replace(/\s+/g," ");
        visible += chunk + " ";
      }
      const visibleNorm = norm(visible);
      let idx = visibleNorm.indexOf(qNorm);
      const occ = [];
      while(idx !== -1){ occ.push(idx); idx = visibleNorm.indexOf(qNorm, idx + Math.max(1, qNorm.length)); }
      if(occ.length === 0) continue;
      totalMatches += occ.length;
      const snippets = occ.map((pos, occIndex) => {
        const start = Math.max(0, pos - 60);
        const end = Math.min(visible.length, pos + qNorm.length + 120);
        const rawSnippet = visible.substring(start, end).replace(/\s+/g," ");
        const anchorId = makeAnchorId(queryRaw, occIndex);
        const matchedPart = visible.substring(pos, pos + qNorm.length);
        const re = new RegExp(escapeRegExp(matchedPart), "i");
        const safeSnippet = escapeHtml(rawSnippet);
        return safeSnippet.replace(re, (m)=> `<a href="${page.url}#${anchorId}" class="snippet-link"><mark>${m}</mark></a>`);
      });
      allResults.push(`<div class="result"><h3><a href="${page.url}">${page.title}</a></h3>${snippets.map(s=>`<p class="snippet">${s}</p>`).join("")}</div>`);
    }catch(e){ console.error("Errore su", page.url, e); }
  }

  if(allResults.length === 0){ resultsDiv.innerHTML = `<p>Nessun risultato per “${escapeHtml(queryRaw)}” 😕</p>`; countEl.textContent = ""; }
  else{ resultsDiv.innerHTML = allResults.join(""); countEl.textContent = `${totalMatches} risultato${totalMatches>1 ? "i" : ""} trovati per “${escapeHtml(queryRaw)}”`; }
}

// ===== Redirect universale GOAT SAFE =====
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const queryInput = document.getElementById("searchQuery");
    if (!queryInput) return;
    const newQuery = queryInput.value.trim();
    if (!newQuery) return;
    const isInSearch = window.location.pathname.includes("search_function");
    const base = isInSearch ? "../" : "";
    const target = (isInSearch ? "" : "search_function/") + "SEARCH.html";
    let href = base + target + "?q=" + encodeURIComponent(newQuery);
    href = href.replace(/([^:]\/)\/+/g,"$1");
    window.location.href = href;
  });
}

searchSite();

// ===== SEARCH.js - Redirect universale GOAT SAFE =====

// Prendiamo il form solo se esiste
const searchForm = document.getElementById("searchForm");
if (searchForm) { // ✅ Controllo: se non esiste il form, non fa crash
  searchForm.addEventListener("submit", e => {
    e.preventDefault(); // ✅ Previene il comportamento standard del form (reload pagina)

    const queryInput = document.getElementById("searchQuery");
    if (!queryInput) return; // ✅ Sicurezza: se non trova l'input, esce

    const newQuery = queryInput.value.trim();
    if (!newQuery) return; // ✅ Se il campo è vuoto, non fa nulla

    // Determiniamo se siamo già dentro SEARCH.html
    const isInSearch = window.location.pathname.includes("search_function");

    // Base path da aggiungere se siamo in SEARCH.html o in altre pagine
    const base = isInSearch ? "../" : "";

    // Target sempre "SEARCH.html" nella cartella search_function
    const target = (isInSearch ? "" : "search_function/") + "SEARCH.html";

    // Costruzione finale dell'URL con query param
    let href = base + target + "?q=" + encodeURIComponent(newQuery);

    // Rimuove eventuali doppie slash nell'URL (ad esempio "../search_function//SEARCH.html")
    href = href.replace(/([^:]\/)\/+/g,"$1");

    // ✅ Redirect vero e proprio
    window.location.href = href;
  });
}
