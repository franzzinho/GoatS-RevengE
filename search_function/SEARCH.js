// SETTAGGIO PERCORSO BASE PER GITHUB PAGES
const base = "/GoatS-RevengE";

// Pagine da includere nella ricerca
const pages = [
  { url: `${base}/index.html`, title: "Home" },
  { url: `${base}/ABOUT.html`, title: "About" },
  { url: `${base}/VIDEO IDEAS.html`, title: "Video Ideas" },
  { url: `${base}/UTILITY.html`, title: "Utility" },
  { url: `${base}/TERMINI.html`, title: "Termini" },
  { url: `${base}/TEAM.html`, title: "Team" },
  { url: `${base}/COMING SOON.html`, title: "Coming Soon" }
];

// GESTIONE DEL FORM DI RICERCA
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const queryInput = document.getElementById("searchQuery");
    if (!queryInput) return;
    const newQuery = queryInput.value.trim();
    if (!newQuery) return;

    window.location.href =
      `${base}/search_function/SEARCH.html?q=` + encodeURIComponent(newQuery);
  });
}

// FUNZIONE PRINCIPALE DI RICERCA
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  
  if (!query) {
    document.getElementById('results').innerHTML = '<p>Inserisci un termine di ricerca.</p>';
    return;
  }

  // Imposta il valore nella search bar
  const searchInput = document.getElementById('searchQuery');
  if (searchInput) {
    searchInput.value = query;
  }

  try {
    const results = await performSearch(query);
    displayResults(results, query);
  } catch (error) {
    console.error('Errore durante la ricerca:', error);
    document.getElementById('results').innerHTML = '<p>Errore durante la ricerca. Riprova più tardi.</p>';
  }
});

// FUNZIONE PER EFFETTUARE LA RICERCA
async function performSearch(query) {
  const results = [];
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

  for (const page of pages) {
    try {
      const response = await fetch(page.url);
      if (!response.ok) continue;
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Rimuovi script e style dal contenuto
      const scripts = doc.querySelectorAll('script, style, nav, header, footer');
      scripts.forEach(el => el.remove());
      
      const textContent = doc.body.textContent || '';
      const lowerContent = textContent.toLowerCase();
      
      // Controlla se la pagina contiene almeno uno dei termini di ricerca
      let hasMatch = false;
      let matchCount = 0;
      
      for (const term of searchTerms) {
        const regex = new RegExp(escapeRegExp(term), 'gi');
        const matches = textContent.match(regex);
        if (matches) {
          hasMatch = true;
          matchCount += matches.length;
        }
      }
      
      if (hasMatch) {
        // Crea uno snippet del contenuto
        const snippet = createSnippet(textContent, searchTerms);
        results.push({
          title: page.title,
          url: page.url,
          snippet: snippet,
          matchCount: matchCount
        });
      }
    } catch (error) {
      console.error(`Errore nel caricare ${page.url}:`, error);
    }
  }
  
  // Ordina per numero di match (più rilevanti prima)
  return results.sort((a, b) => b.matchCount - a.matchCount);
}

// FUNZIONE PER CREARE LO SNIPPET
function createSnippet(content, searchTerms) {
  const maxLength = 200;
  let bestPosition = -1;
  let bestTerm = '';
  
  // Trova la prima occorrenza di qualsiasi termine di ricerca
  for (const term of searchTerms) {
    const position = content.toLowerCase().indexOf(term.toLowerCase());
    if (position !== -1 && (bestPosition === -1 || position < bestPosition)) {
      bestPosition = position;
      bestTerm = term;
    }
  }
  
  let snippet = '';
  if (bestPosition !== -1) {
    const start = Math.max(0, bestPosition - 60);
    const end = Math.min(content.length, bestPosition + 140);
    snippet = content.substring(start, end);
    
    // Aggiungi ellissi se necessario
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
  } else {
    // Se non trova termini specifici, prendi l'inizio del contenuto
    snippet = content.substring(0, maxLength);
    if (content.length > maxLength) snippet += '...';
  }
  
  return snippet;
}

// FUNZIONE PER VISUALIZZARE I RISULTATI
function displayResults(results, query) {
  const resultsContainer = document.getElementById('results');
  const resultsCount = document.getElementById('results-count');
  
  if (results.length === 0) {
    resultsCount.textContent = 'Nessun risultato trovato per: ' + query;
    resultsContainer.innerHTML = '<p>Prova con parole chiave diverse o più generali.</p>';
    return;
  }
  
  resultsCount.textContent = `Trovati ${results.length} risultati per: ${query}`;
  
  const resultsHTML = results.map(result => `
    <div class="result">
      <h3><a href="${result.url}?q=${encodeURIComponent(query)}">${highlightText(result.title, query)}</a></h3>
      <p class="snippet">${highlightText(result.snippet, query)}</p>
    </div>
  `).join('');
  
  resultsContainer.innerHTML = resultsHTML;
}

// FUNZIONE PER EVIDENZIARE IL TESTO
function highlightText(text, query) {
  if (!query) return text;
  
  const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
  let highlightedText = text;
  
  for (const term of searchTerms) {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  }
  
  return highlightedText;
}

// FUNZIONE UTILITY PER ESCAPE REGEX
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
