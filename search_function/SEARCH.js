// SEARCH.js - GOAT-FINAL
// ==========================

// Percorso corretto delle pagine relativo a dove si trova SEARCH.html
const isInSearch = window.location.pathname.includes("search_function");
const pages = [
  { url: isInSearch ? "../index.html" : "index.html", title: "Home" },
  { url: isInSearch ? "../ABOUT.html" : "ABOUT.html", title: "About" },
  { url: isInSearch ? "../SOCIAL IDEAS.html" : "SOCIAL IDEAS.html", title: "Social Ideas" }
];

// Funzioni helper
function norm(s) { return (s||"").toString().normalize("NFC").toLowerCase(); }
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, s => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s])); }
function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function getQuery() { const p = new URLSearchParams(window.location.search); const raw = p.get("q") || ""; try { return decodeURIComponent(raw); } catch { return raw; } }
function makeAnchorId(q,i){ return `match_${encodeURIComponent(q)}_${i}`; }

// Funzione principale di ricerca
async function searchSite(){
  const queryRaw = getQuery();         // testo originale
  const qNorm = norm(queryRaw);        // testo normalizzato
  const resultsDiv = document.getElementById("results");
  const countEl = document.getElementById("results-count");
  const inputEl = document.getElementById("searchQuery");

  if(!qNorm){ if(inputEl) inputEl.value = ""; resultsDiv.innerHTML = "<p>Digita qualcosa per cercare 🔍</p>"; countEl.textContent = ""; return; }
  if(inputEl) inputEl.value = queryRaw;
  resultsDiv.innerHTML = "<p>Sto cercando...</p>";

  let totalMatches = 0;
  const allResults = [];

for(const page of pages){
  try{
    const res = await fetch(page.url);
    console.log("Provo a fare fetch su:", page.url, "OK?", res.ok);
    if(!res.ok) continue;
    const text = await res.text();
    console.log("Testo della pagina:", text.slice(0,200));

      // TreeWalker solo testo visibile
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
          if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if(["SCRIPT","STYLE","NOSCRIPT"].includes(node.parentNode.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let node, visible = "";
      const nodes = [];
      while(walker.nextNode()){
        node = walker.currentNode;
        const chunk = node.nodeValue.replace(/\s+/g," ");
        const start = visible.length;
        visible += chunk + " ";
        const end = visible.length;
        nodes.push({nodeValue: chunk, start, end, node});
      }

      const visibleNorm = norm(visible);

      // Trova occorrenze
      let idx = visibleNorm.indexOf(qNorm);
      const occ = [];
      while(idx !== -1){ occ.push(idx); idx = visibleNorm.indexOf(qNorm, idx + Math.max(1,qNorm.length)); }
      if(occ.length === 0) continue;
      totalMatches += occ.length;

      // Genera snippet con highlight e link all'anchor
      const snippets = occ.map((pos, occIndex)=>{
        const start = Math.max(0, pos-60);
        const end = Math.min(visible.length, pos + qNorm.length + 120);
        const rawSnippet = visible.substring(start,end).replace(/\s+/g," ");
        const anchorId = makeAnchorId(queryRaw, occIndex);
        const matchedPart = visible.substring(pos,pos+qNorm.length);
        const re = new RegExp(escapeRegExp(matchedPart),"i");
        const safeSnippet = escapeHtml(rawSnippet);
        return safeSnippet.replace(re, m=> `<a href="${page.url}#${anchorId}" class="snippet-link"><mark>${m}</mark></a>`);
      });

      const snippetsHTML = snippets.map(s=>`<p class="snippet">${s}</p>`).join("");
      allResults.push(`<div class="result"><h3><a href="${page.url}">${page.title}</a></h3>${snippetsHTML}</div>`);

    }catch(e){ console.error("Errore su", page.url, e); }
  }

  if(allResults.length === 0){ resultsDiv.innerHTML = `<p>Nessun risultato per “${escapeHtml(queryRaw)}” 😕</p>`; countEl.textContent = ""; }
  else{ resultsDiv.innerHTML = allResults.join(""); countEl.textContent = `${totalMatches} risultato${totalMatches>1 ? "i" : ""} trovati per “${escapeHtml(queryRaw)}”`; }
}

// Redirect universale GOAT-SAFE
const searchForm = document.getElementById("searchForm");
if(searchForm){
  searchForm.addEventListener("submit", e=>{
    e.preventDefault();
    const queryInput = document.getElementById("searchQuery");
    if(!queryInput) return;
    const newQuery = queryInput.value.trim();
    if(!newQuery) return;

    const isInSearch = window.location.pathname.includes("search_function");
    const base = isInSearch ? "../" : "";
    const target = (isInSearch ? "" : "search_function/") + "SEARCH.html";
    let href = base + target + "?q=" + encodeURIComponent(newQuery);
    href = href.replace(/([^:]\/)\/+/g,"$1"); // rimuove doppie slash
    window.location.href = href;
  });
}

searchSite();
