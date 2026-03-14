function initSearch() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;

  searchBox.addEventListener("input", function() {
    const filtered = getFilteredHubs();

    updateVisibleMarkers(filtered);
    renderTrees();
    fitMapToFilteredHubs(filtered);
  });
}