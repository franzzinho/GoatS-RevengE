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
      
      // Controlla TUTTE le occorrenze di TUTTI i termini
      let totalMatches = 0;
      let allMatches = [];
      
      for (const term of searchTerms) {
        const regex = new RegExp(escapeRegExp(term), 'gi');
        let match;
        while ((match = regex.exec(textContent)) !== null) {
          totalMatches++;
          allMatches.push({
            term: term,
            position: match.index,
            text: match[0]
          });
        }
      }
      
      if (totalMatches > 0) {
        // Crea snippet con MULTIPLE evidenziazioni
        const snippet = createDetailedSnippet(textContent, searchTerms, allMatches);
        results.push({
          title: page.title,
          url: page.url,
          snippet: snippet,
          matchCount: totalMatches,
          allMatches: allMatches,
          searchQuery: query
        });
      }
    } catch (error) {
      console.error(`Errore nel caricare ${page.url}:`, error);
    }
  }
  
  // Ordina per numero di match (più rilevanti prima)
  return results.sort((a, b) => b.matchCount - a.matchCount);
}

// FUNZIONE PER CREARE SNIPPET DETTAGLIATO CON TUTTE LE OCCORRENZE
function createDetailedSnippet(content, searchTerms, matches) {
  const maxLength = 300;
  
  if (matches.length === 0) {
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }
  
  // Ordina matches per posizione
  matches.sort((a, b) => a.position - b.position);
  
  // Prendi l'area attorno alla PRIMA occorrenza, ma mostra più contesto
  const firstMatch = matches[0];
  const start = Math.max(0, firstMatch.position - 80);
  const end = Math.min(content.length, start + maxLength);
  
  let snippet = content.substring(start, end);
  
  // Aggiungi ellissi se necessario
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}

// FUNZIONE PER VISUALIZZARE I RISULTATI CON LINK CLICCABILI SOLO SULLE PAROLE
function displayResults(results, query) {
  const resultsContainer = document.getElementById('results');
  const resultsCount = document.getElementById('results-count');
  
  if (results.length === 0) {
    resultsCount.textContent = 'Nessun risultato trovato per: ' + query;
    resultsContainer.innerHTML = '<p>Prova con parole chiave diverse o più generali.</p>';
    return;
  }
  
  resultsCount.textContent = `Trovati ${results.length} pagine con risultati per: ${query}`;
  
  const resultsHTML = results.map(result => `
    <div class="result">
      <h3>${result.title}</h3>
      <div class="snippet">
        ${createClickableSnippet(result.snippet, query, result.url, result.searchQuery)}
      </div>
    </div>
  `).join('');
  
  resultsContainer.innerHTML = resultsHTML;
}

// FUNZIONE PER CREARE SNIPPET CON PAROLE CLICCABILI
function createClickableSnippet(snippet, query, pageUrl, searchQuery) {
  const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
  let clickableSnippet = snippet;
  
  for (const term of searchTerms) {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    clickableSnippet = clickableSnippet.replace(regex, 
      `<a href="${pageUrl}?q=${encodeURIComponent(searchQuery)}&highlight=all" 
          class="clickable-word" 
          title="Clicca per vedere tutte le occorrenze di '${term}' in questa pagina">
        <mark>$1</mark>
      </a>`
    );
  }
  
  return clickableSnippet;
}

// FUNZIONE UTILITY PER ESCAPE REGEX
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
