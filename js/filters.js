function setActiveSelection(type, value) {
  getState().selection.type = type;
  getState().selection.value = value;
}

function clearActiveSelection(type) {
  if (getState().selection.type === type) {
    getState().selection.type = "";
    getState().selection.value = "";
  }
}

function getSearchValue() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return "";
  return searchBox.value.toLowerCase().trim();
}

function matchesSearch(hub, searchValue) {
  if (!searchValue) return true;

  const hubName = (hub.name || "").toLowerCase();
  const hubDivision = (hub.division || "").toLowerCase();
  const hubDistrict = (hub.district || "").toLowerCase();
  const hubPoliceStation = (hub.police_station || "").toLowerCase();

  return (
    hubName.includes(searchValue) ||
    hubDivision.includes(searchValue) ||
    hubDistrict.includes(searchValue) ||
    hubPoliceStation.includes(searchValue)
  );
}

function getFilteredHubs() {
  if (!Array.isArray(getState().allHubs) || getState().allHubs.length === 0) {
    return [];
  }

  const searchValue = getSearchValue();

  return getState().allHubs.filter(function(hub) {
    const matchDivision =
      getState().filters.division.length === 0 ||
      getState().filters.division.includes(hub.division);

    const matchDistrict =
      getState().filters.district.length === 0 ||
      getState().filters.district.includes(hub.district);

    const matchPoliceStation =
      getState().filters.police_station.length === 0 ||
      getState().filters.police_station.includes(hub.police_station);

    const matchSearch = matchesSearch(hub, searchValue);

    return matchDivision && matchDistrict && matchPoliceStation && matchSearch;
  });
}

function getCrossFilteredValues() {
  if (!Array.isArray(getState().allHubs) || getState().allHubs.length === 0) {
    return {
      divisions: [],
      districts: [],
      policeStations: [],
      hubs: []
    };
  }

  const searchValue = getSearchValue();
  const filtered = getFilteredHubs();

  const divisionScopedHubs = getState().allHubs.filter(function(hub) {
    const matchDivision =
      getState().filters.division.length === 0 ||
      getState().filters.division.includes(hub.division);

    const matchDistrict =
      getState().filters.district.length === 0 ||
      getState().filters.district.includes(hub.district);

    const matchPoliceStation =
      getState().filters.police_station.length === 0 ||
      getState().filters.police_station.includes(hub.police_station);

    return matchDivision && matchDistrict && matchPoliceStation && matchesSearch(hub, searchValue);
  });

  const districtScopedHubs = getState().allHubs.filter(function(hub) {
    const matchDivision =
      getState().filters.division.length === 0 ||
      getState().filters.division.includes(hub.division);

    const matchPoliceStation =
      getState().filters.police_station.length === 0 ||
      getState().filters.police_station.includes(hub.police_station);

    return matchDivision && matchPoliceStation && matchesSearch(hub, searchValue);
  });

  const policeStationScopedHubs = getState().allHubs.filter(function(hub) {
    const matchDivision =
      getState().filters.division.length === 0 ||
      getState().filters.division.includes(hub.division);

    const matchDistrict =
      getState().filters.district.length === 0 ||
      getState().filters.district.includes(hub.district);

    return matchDivision && matchDistrict && matchesSearch(hub, searchValue);
  });

  const districts = [
    ...new Set(
      districtScopedHubs
        .map(function(hub) {
          return hub.district;
        })
        .filter(Boolean)
    )
  ].sort();

  const divisions = [
    ...new Set(
      divisionScopedHubs
        .map(function(hub) {
          return hub.division;
        })
        .filter(Boolean)
    )
  ].sort();

  const policeStations = [
    ...new Set(
      policeStationScopedHubs
        .map(function(hub) {
          return hub.police_station;
        })
        .filter(Boolean)
    )
  ].sort();

  return {
    divisions: divisions,
    districts: districts,
    policeStations: policeStations,
    hubs: filtered.slice().sort(function(a, b) {
      return (a.name || "").localeCompare(b.name || "");
    })
  };
}

function applyFilters() {
  const filtered = getFilteredHubs();

  updateVisibleMarkers(filtered);
  renderTrees();

  if (filtered.length > 0) {
    fitMapToFilteredHubs(filtered);
  } else {
    hideHubDetailsPanel();
  }
}

function toggleArrayFilter(filterKey, value) {
  const list = getState().filters[filterKey];
  if (!Array.isArray(list)) return;

  const index = list.indexOf(value);

  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(value);
  }
}

function removeInvalidDependentFilters() {
  if (!Array.isArray(getState().allHubs) || getState().allHubs.length === 0) {
    getState().filters.district = [];
    getState().filters.police_station = [];
    return;
  }

  const searchValue = getSearchValue();

  const validDistricts = new Set(
    getState().allHubs
      .filter(function(hub) {
        const matchDivision =
          getState().filters.division.length === 0 ||
          getState().filters.division.includes(hub.division);

        const matchPoliceStation =
          getState().filters.police_station.length === 0 ||
          getState().filters.police_station.includes(hub.police_station);

        return matchDivision && matchPoliceStation && matchesSearch(hub, searchValue);
      })
      .map(function(hub) {
        return hub.district;
      })
      .filter(Boolean)
  );

  const validPoliceStations = new Set(
    getState().allHubs
      .filter(function(hub) {
        const matchDivision =
          getState().filters.division.length === 0 ||
          getState().filters.division.includes(hub.division);

        const matchDistrict =
          getState().filters.district.length === 0 ||
          getState().filters.district.includes(hub.district);

        return matchDivision && matchDistrict && matchesSearch(hub, searchValue);
      })
      .map(function(hub) {
        return hub.police_station;
      })
      .filter(Boolean)
  );

  getState().filters.district = getState().filters.district.filter(function(district) {
    return validDistricts.has(district);
  });

  getState().filters.police_station = getState().filters.police_station.filter(function(policeStation) {
    return validPoliceStations.has(policeStation);
  });
}

function setDivisionFilter(value) {
  toggleArrayFilter("division", value);
  removeInvalidDependentFilters();
  clearActiveSelection("hub");
  applyFilters();
}

function setDistrictFilter(value) {
  toggleArrayFilter("district", value);
  removeInvalidDependentFilters();
  clearActiveSelection("hub");
  applyFilters();
}

function setPoliceStationFilter(value) {
  toggleArrayFilter("police_station", value);
  removeInvalidDependentFilters();
  clearActiveSelection("hub");
  applyFilters();
}

function clearAllFilters() {
  getState().filters.division = [];
  getState().filters.district = [];
  getState().filters.police_station = [];

  getState().selection.type = "";
  getState().selection.value = "";

  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.value = "";
  }

  hideSearchSuggestions();
  hideHubDetailsPanel();

  if (Array.isArray(getState().allHubs) && getState().allHubs.length > 0) {
    updateVisibleMarkers(getState().allHubs);
    renderTrees();
    fitMapToFilteredHubs(getState().allHubs);
  } else {
    updateVisibleMarkers([]);
    renderTrees();
  }

  resetAllSections();
}

function initClearFilters() {
  const clearBtn = document.getElementById("clearFiltersBtn");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", function() {
    clearAllFilters();
  });
}