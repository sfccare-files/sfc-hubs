function initSearch() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;

  searchBox.addEventListener("input", function() {
    const value = this.value.toLowerCase().trim();

    const filtered = allHubs.filter(hub => {
      const matchesSearch = hub.name.toLowerCase().includes(value);
      const matchDivision = !activeFilters.division || hub.division === activeFilters.division;
      const matchDistrict = !activeFilters.district || hub.district === activeFilters.district;
      const matchZone = !activeFilters.zone || hub.zone === activeFilters.zone;

      return matchesSearch && matchDivision && matchDistrict && matchZone;
    });

    updateVisibleMarkers(filtered);
    renderHubTree(filtered);
    fitMapToFilteredHubs(filtered);
  });
}