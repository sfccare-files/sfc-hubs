var activeFilters = {
  division: "",
  district: "",
  zone: ""
};

function getSearchValue() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return "";
  return searchBox.value.toLowerCase().trim();
}

function getFilteredHubs() {
  const searchValue = getSearchValue();

  return allHubs.filter(hub => {
    const matchDivision = !activeFilters.division || hub.division === activeFilters.division;
    const matchDistrict = !activeFilters.district || hub.district === activeFilters.district;
    const matchZone = !activeFilters.zone || hub.zone === activeFilters.zone;
    const matchSearch = !searchValue || hub.name.toLowerCase().includes(searchValue);

    return matchDivision && matchDistrict && matchZone && matchSearch;
  });
}

function applyFilters() {
  const filtered = getFilteredHubs();

  updateVisibleMarkers(filtered);
  renderHubTree(filtered);
  fitMapToFilteredHubs(filtered);
}

function clearLowerFilters(level) {
  if (level === "division") {
    activeFilters.district = "";
    activeFilters.zone = "";
  }

  if (level === "district") {
    activeFilters.zone = "";
  }
}

function setDivisionFilter(value) {
  activeFilters.division = value;
  clearLowerFilters("division");
  applyFilters();
}

function setDistrictFilter(value) {
  activeFilters.district = value;
  clearLowerFilters("district");
  applyFilters();
}

function setZoneFilter(value) {
  activeFilters.zone = value;
  applyFilters();
}

function clearAllFilters() {
  activeFilters.division = "";
  activeFilters.district = "";
  activeFilters.zone = "";

  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.value = "";
  }

  updateVisibleMarkers(allHubs);
  renderHubTree(allHubs);
  fitMapToFilteredHubs(allHubs);
}

function initClearFilters() {
  const clearBtn = document.getElementById("clearFiltersBtn");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", function() {
    clearAllFilters();
  });
}