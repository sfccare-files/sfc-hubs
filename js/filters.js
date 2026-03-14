var activeFilters = {
  division: "",
  district: "",
  zone: ""
};

var activeSelection = {
  type: "",
  value: ""
};

function setActiveSelection(type, value) {
  activeSelection.type = type;
  activeSelection.value = value;
}

function clearActiveSelection(type) {
  if (activeSelection.type === type) {
    activeSelection.type = "";
    activeSelection.value = "";
  }
}

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

function getCrossFilteredValues() {
  const filtered = getFilteredHubs();

  return {
    divisions: [...new Set(filtered.map(h => h.division).filter(Boolean))].sort(),
    districts: [...new Set(filtered.map(h => h.district).filter(Boolean))].sort(),
    zones: [...new Set(filtered.map(h => h.zone).filter(Boolean))].sort(),
    hubs: filtered
  };
}

function applyFilters() {
  const filtered = getFilteredHubs();

  updateVisibleMarkers(filtered);
  renderTrees();
  fitMapToFilteredHubs(filtered);
}

function setDivisionFilter(value) {
  if (activeFilters.division === value) {
    activeFilters.division = "";
    activeFilters.district = "";
    activeFilters.zone = "";
    clearActiveSelection("division");
    clearActiveSelection("district");
    clearActiveSelection("zone");
    clearActiveSelection("hub");
    applyFilters();
    return;
  }

  activeFilters.division = value;
  setActiveSelection("division", value);
  applyFilters();
}

function setDistrictFilter(value) {
  if (activeFilters.district === value) {
    activeFilters.district = "";
    activeFilters.zone = "";
    clearActiveSelection("district");
    clearActiveSelection("zone");
    clearActiveSelection("hub");
    applyFilters();
    return;
  }

  activeFilters.district = value;
  setActiveSelection("district", value);
  applyFilters();
}

function setZoneFilter(value) {
  if (activeFilters.zone === value) {
    activeFilters.zone = "";
    clearActiveSelection("zone");
    clearActiveSelection("hub");
    applyFilters();
    return;
  }

  activeFilters.zone = value;
  setActiveSelection("zone", value);
  applyFilters();
}

function clearAllFilters() {
  activeFilters.division = "";
  activeFilters.district = "";
  activeFilters.zone = "";

  activeSelection.type = "";
  activeSelection.value = "";

  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.value = "";
  }

  updateVisibleMarkers(allHubs);
  renderTrees();
  fitMapToFilteredHubs(allHubs);
  resetAllSections();
}

function initClearFilters() {
  const clearBtn = document.getElementById("clearFiltersBtn");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", function() {
    clearAllFilters();
  });
}