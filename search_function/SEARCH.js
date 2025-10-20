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
