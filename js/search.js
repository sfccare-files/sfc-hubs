function hasSearchableHubData() {
  return Array.isArray(getState().allHubs) && getState().allHubs.length > 0;
}

function shouldSkipSearchMapFit(filtered, value) {
  if (!value) return false;
  if (!Array.isArray(filtered) || filtered.length === 0) return false;
  if (filtered.length > 25) return true;

  if (
    getState().selection.type === "hub" &&
    filtered.length === 1 &&
    filtered[0].name === getState().selection.value
  ) {
    return true;
  }

  return false;
}

function buildNoResultMessage() {
  const searchValue = getSearchValue();
  const hasSearch = !!searchValue;
  const hasDivision = getState().filters.division.length > 0;
  const hasDistrict = getState().filters.district.length > 0;
  const hasPoliceStation = getState().filters.police_station.length > 0;

  if (hasSearch || hasDivision || hasDistrict || hasPoliceStation) {
    return "No matches found for current search/filter.";
  }

  return "No results found.";
}

function handleSearchInput() {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;

  const value = searchBox.value.toLowerCase().trim();

  if (!hasSearchableHubData()) {
    getState().search.currentSuggestions = [];
    renderSearchSuggestions([], true);
    return;
  }

  const filtered = getFilteredHubs();

  renderFilterDrivenView(filtered);

  if (value === "") {
    hideSearchSuggestions();

    if (filtered.length === 0) {
      hideHubDetailsPanel();
    }

    return;
  }

  if (filtered.length === 0) {
    hideHubDetailsPanel();
  } else if (!shouldSkipSearchMapFit(filtered, value)) {
    fitMapToFilteredHubs(filtered);
  }

  getState().search.currentSuggestions = getState().allHubs
    .filter(function(hub) {
      const name = (hub.name || "").toLowerCase();
      const division = (hub.division || "").toLowerCase();
      const district = (hub.district || "").toLowerCase();
      const policeStation = (hub.police_station || "").toLowerCase();

      return (
        name.includes(value) ||
        division.includes(value) ||
        district.includes(value) ||
        policeStation.includes(value)
      );
    })
    .sort(function(a, b) {
      return (a.name || "").localeCompare(b.name || "");
    })
    .slice(0, getConfig().search.suggestionLimit);

  renderSearchSuggestions(getState().search.currentSuggestions, false);
}

function initSearch() {
  const searchBox = document.getElementById("searchBox");
  const suggestionsBox = document.getElementById("searchSuggestions");

  if (!searchBox || !suggestionsBox) return;

  const debouncedHandleInput = debounce(
    handleSearchInput,
    getConfig().search.debounceMs
  );

  searchBox.addEventListener("input", debouncedHandleInput);

  searchBox.addEventListener("focus", function() {
    const value = searchBox.value.toLowerCase().trim();

    if (!value) return;
    if (!hasSearchableHubData()) {
      renderSearchSuggestions([], true);
      return;
    }

    if (getState().search.currentSuggestions.length > 0) {
      renderSearchSuggestions(getState().search.currentSuggestions, false);
    }
  });

  searchBox.addEventListener("keydown", function(e) {
    if (getState().search.currentSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      getState().search.activeSuggestionIndex = Math.min(
        getState().search.activeSuggestionIndex + 1,
        getState().search.currentSuggestions.length - 1
      );
      updateSuggestionActiveState();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      getState().search.activeSuggestionIndex = Math.max(
        getState().search.activeSuggestionIndex - 1,
        0
      );
      updateSuggestionActiveState();
    }

    if (e.key === "Enter") {
      if (
        getState().search.activeSuggestionIndex >= 0 &&
        getState().search.currentSuggestions[getState().search.activeSuggestionIndex]
      ) {
        e.preventDefault();
        selectSearchSuggestion(
          getState().search.currentSuggestions[getState().search.activeSuggestionIndex]
        );
      }
    }

    if (e.key === "Escape") {
      hideSearchSuggestions();
    }
  });

  document.addEventListener("click", function(e) {
    if (!suggestionsBox.contains(e.target) && e.target !== searchBox) {
      hideSearchSuggestions();
    }
  });
}

function renderSearchSuggestions(suggestions, noDataMode) {
  const suggestionsBox = document.getElementById("searchSuggestions");
  if (!suggestionsBox) return;

  suggestionsBox.innerHTML = "";
  getState().search.activeSuggestionIndex = -1;

  if (noDataMode) {
    suggestionsBox.innerHTML =
      '<div class="search-suggestion-item search-suggestion-static">' +
        '<div class="search-suggestion-title">Hub data not ready</div>' +
        '<div class="search-suggestion-meta">Please wait for data to load</div>' +
      '</div>';

    suggestionsBox.classList.remove("hidden");
    return;
  }

  if (!suggestions.length) {
    suggestionsBox.innerHTML =
      '<div class="search-suggestion-item search-suggestion-static">' +
        '<div class="search-suggestion-title">No results found</div>' +
        '<div class="search-suggestion-meta">' + escapeHtmlText(buildNoResultMessage()) + '</div>' +
      '</div>';

    suggestionsBox.classList.remove("hidden");
    return;
  }

  suggestions.forEach(function(hub, index) {
    const item = document.createElement("div");
    item.className = "search-suggestion-item";
    item.setAttribute("role", "option");

    item.innerHTML =
      '<div class="search-suggestion-title">' + escapeHtmlText(hub.name || "") + "</div>" +
      '<div class="search-suggestion-meta">' +
        escapeHtmlText(hub.district || "-") + " • " +
        escapeHtmlText(hub.division || "-") + " • " +
        escapeHtmlText(hub.police_station || "-") +
      "</div>";

    item.addEventListener("click", function() {
      selectSearchSuggestion(hub);
    });

    item.addEventListener("mouseenter", function() {
      getState().search.activeSuggestionIndex = index;
      updateSuggestionActiveState();
    });

    item.addEventListener("touchstart", function() {
      getState().search.activeSuggestionIndex = index;
      updateSuggestionActiveState();
    }, { passive: true });

    suggestionsBox.appendChild(item);
  });

  suggestionsBox.classList.remove("hidden");
}

function updateSuggestionActiveState() {
  const items = document.querySelectorAll(".search-suggestion-item:not(.search-suggestion-static)");

  items.forEach(function(item, index) {
    item.classList.toggle("active", index === getState().search.activeSuggestionIndex);
  });
}

function hideSearchSuggestions() {
  const suggestionsBox = document.getElementById("searchSuggestions");
  if (!suggestionsBox) return;

  suggestionsBox.classList.add("hidden");
  suggestionsBox.innerHTML = "";
  getState().search.activeSuggestionIndex = -1;
  getState().search.currentSuggestions = [];
}

function selectSearchSuggestion(hub) {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox || !hub) return;

  searchBox.value = hub.name || "";
  hideSearchSuggestions();

  getState().selection.type = "hub";
  getState().selection.value = hub.name || "";

  updateVisibleMarkers([hub]);
  renderTrees();
  focusHubOnMap(hub, getConfig().map.nearestZoom);
  scrollToHubTreeItem(hub.name);
}