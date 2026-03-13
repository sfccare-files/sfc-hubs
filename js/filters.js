var activeFilters = {
  division: "",
  district: "",
  zone: ""
};

function applyFilters() {
  const filtered = allHubs.filter(hub => {
    const matchDivision = !activeFilters.division || hub.division === activeFilters.division;
    const matchDistrict = !activeFilters.district || hub.district === activeFilters.district;
    const matchZone = !activeFilters.zone || hub.zone === activeFilters.zone;
    return matchDivision && matchDistrict && matchZone;
  });

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
  applyFilters();
}