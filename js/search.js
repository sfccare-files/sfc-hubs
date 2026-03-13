function initSearch() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;

  searchBox.addEventListener("input", function() {
    const filtered = getFilteredHubs();

    updateVisibleMarkers(filtered);
    renderTrees(allHubs);
    fitMapToFilteredHubs(filtered);
    updateStats(filtered);

    if (this.value.trim() !== "") {
      openSection("hubTree");
    }
  });
}