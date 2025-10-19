const pages = [
{ url: isInSearch ? "../index.html" : "index.html", title: "Home" },
  { url: isInSearch ? "../ABOUT.html" : "ABOUT.html", title: "About" },
  { url: isInSearch ? "../VIDEO IDEAS.html" : "VIDEO IDEAS.html", title: "Video Ideas" },
  { url: isInSearch ? "../UTILITY.html" : "UTILITY.html", title: "Utility" },
  { url: isInSearch ? "../TERMINI.html" : "TERMINI.html", title: "Termini" },
  { url: isInSearch ? "../TEAM.html" : "TEAM.html", title: "Team" },
  { url: isInSearch ? "../COMING SOON.html" : "COMING SOON.html", title: "Coming Soon" }
];

// ======== FUNZIONI UTILI ========
function norm(s) { return (s||"").toString().normalize("NFC").toLowerCase(); }
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[s])); }
function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function getQuery() { const p = new URLSearchParams(window.location.search); const raw = p.get("q") || ""; try { return decodeURIComponent(raw); } catch { return raw; } }
function makeAnchorId(q,i){ return `match_${encodeURIComponent(q)}_${i}`; }

// ======== FUNZIONE PRINCIPALE DI RICERCA ========
async function searchSite() {
  const queryRaw = getQuery();
  const qNorm = norm(queryRaw);
  const resultsDiv = document.getElementById("results");
  const countEl = document.getElementById("results-count");
  const inputEl = document.getElementById("searchQuery");

  if(!qNorm){
    if(inputEl) inputEl.value = "";
    resultsDiv.innerHTML = "<p>Digita qualcosa per cercare 🔍</p>";
    countEl.textContent = "";
    return;
  }

  if(inputEl) inputEl.value = queryRaw;
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
      let idx = visibleNorm.indexOf(qNorm);
      const occ = [];
      while(idx !== -1){
        occ.push(idx);
        idx = visibleNorm.indexOf(qNorm, idx + Math.max(1,qNorm.length));
      }

      if(occ.length === 0) continue;
      totalMatches += occ.length;

      const snippets = occ.map((pos, occIndex)=>{
        const start = Math.max(0,pos-60);
        const end = Math.min(visible.length,pos + qNorm.length + 120);
        const rawSnippet = visible.substring(start,end).replace(/\s+/g," ");
        const anchorId = makeAnchorId(queryRaw, occIndex);
        const matchedPart = visible.substring(pos,pos+qNorm.length);
        const re = new RegExp(escapeRegExp(matchedPart),"i");
        const safeSnippet = escapeHtml(rawSnippet);
        return safeSnippet.replace(re, m=> `<a href="${page.url}#${anchorId}" class="snippet-link"><mark>${m}</mark></a>`);
      });

      const snippetsHTML = snippets.map(s=>`<p class="snippet">${s}</p>`).join("");
      allResults.push(`<div class="result"><h3><a href="${page.url}">${page.title}</a></h3>${snippetsHTML}</div>`);

    } catch(e){
      console.error("Errore su", page.url, e);
    }
  }

  if(allResults.length === 0){
    resultsDiv.innerHTML = `<p>Nessun risultato per “${escapeHtml(queryRaw)}” 😕</p>`;
    countEl.textContent = "";
  } else {
    resultsDiv.innerHTML = allResults.join("");
    countEl.textContent = `${totalMatches} risultato${totalMatches>1 ? "i" : ""} trovati per “${escapeHtml(queryRaw)}”`;
  }
}

const searchForm = document.getElementById("searchForm");
if(searchForm){
  searchForm.addEventListener("submit", e=>{
    e.preventDefault();
    const queryInput = document.getElementById("searchQuery");
    if(!queryInput) return;
    const newQuery = queryInput.value.trim();
    if(!newQuery) return;

    // Redirect **assoluto dalla root** → non rompe mai
const base = "/my-repo-name"; // <-- qui metti il nome del tuo repository

searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const queryInput = document.getElementById("searchQuery");
  if (!queryInput) return;
  const newQuery = queryInput.value.trim();
  if (!newQuery) return;

  const href = `${base}/search_function/SEARCH.html?q=` + encodeURIComponent(newQuery);
  window.location.href = href;
});
}

// ======== AVVIO RICERCA ========
searchSite();
