// SEARCH.js - GOAT final
const pages = [
  { url: "../index.html", title: "Home" },
  { url: "../ABOUT.html", title: "About" },
  { url: "../SOCIAL IDEAS.html", title: "Social Ideas" }
];

function norm(s){ return (s||"").toString().normalize("NFC").toLowerCase(); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function getQuery(){ const p=new URLSearchParams(window.location.search); const raw=p.get("q")||""; try{return decodeURIComponent(raw);}catch{return raw;} }

// helper: build safe anchor id (no spaces, predictable)
function makeAnchorId(q,i){ return `match_${encodeURIComponent(q)}_${i}`; }

// main
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

      // parse and extract visible text only (no attributes, no html)
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      // Walk text nodes to build a continuous visible text with positions
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
      let node;
      let visible = "";
      const nodes = []; // {node, start, end}
      while(walker.nextNode()){
        node = walker.currentNode;
        const chunk = node.nodeValue.replace(/\s+/g," ");
        const start = visible.length;
        visible += chunk + " ";
        const end = visible.length;
        nodes.push({nodeValue: chunk, start, end, node});
      }
      const visibleNorm = norm(visible);

      // find occurrences (indices) in normalized text
      let idx = visibleNorm.indexOf(qNorm);
      const occ = [];
      while(idx !== -1){
        occ.push(idx);
        idx = visibleNorm.indexOf(qNorm, idx + Math.max(1, qNorm.length));
      }

      if(occ.length === 0) continue;
      totalMatches += occ.length;

      // For each occurrence create snippet (use substring from visible using start/end)
      const snippets = occ.map((pos, occIndex) => {
        const start = Math.max(0, pos - 60);
        const end = Math.min(visible.length, pos + qNorm.length + 120);
        const rawSnippet = visible.substring(start, end).replace(/\s+/g," ");
        const anchorId = makeAnchorId(queryRaw, occIndex);
        // Replace only the matched substring in the snippet with anchor+mark (escaped)
        // Build a regex to match the original substring (case-insensitive). We want to avoid injecting HTML from page.
        const matchedPart = visible.substring(pos, pos + qNorm.length);
        // find the exact substring in rawSnippet: we will mark the first occurrence inside snippet (case-insensitive)
        const re = new RegExp(escapeRegExp(matchedPart), "i");
        const safeSnippet = escapeHtml(rawSnippet);
        const highlighted = safeSnippet.replace(re, (m)=> `<a href="${page.url}#${anchorId}" class="snippet-link"><mark>${m}</mark></a>`);
        return highlighted;
      });

      // Build result block for this page: title + snippets
      const snippetsHTML = snippets.map(s => `<p class="snippet">${s}</p>`).join("");
      allResults.push(`
        <div class="result">
          <h3><a href="${page.url}">${page.title}</a></h3>
          ${snippetsHTML}
        </div>
      `);

    }catch(e){
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

// redirect universal (works when submitting from SEARCH.html or any other page)
document.getElementById("searchForm").addEventListener("submit", e=>{
  e.preventDefault();
  const newQuery = document.getElementById("searchQuery").value.trim();
  if(!newQuery) return;
  const isInSearch = window.location.pathname.includes("search_function");
  const base = isInSearch ? "../" : "";
  // normalize target path so it always points to search_function/SEARCH.html absolute-ish from current dir
  const target = (isInSearch ? "" : "search_function/") + "SEARCH.html";
  const href = base + target + "?q=" + encodeURIComponent(newQuery);
  // remove duplicate slashes
  window.location.href = href.replace(/([^:]\/)\/+/g,"$1");
});

searchSite();
