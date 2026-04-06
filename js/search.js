function hasSearchableHubData() {
  return Array.isArray(getState().allHubs) && getState().allHubs.length > 0;
}

function initSearch() {
  const searchBox = document.getElementById("searchBox");
  const suggestionsBox = document.getElementById("searchSuggestions");

  if (!searchBox || !suggestionsBox) return;

  const handleInput = debounce(function() {
    const value = searchBox.value.toLowerCase().trim();

    if (!hasSearchableHubData()) {
      getState().search.currentSuggestions = [];
      renderSearchSuggestions([], true);
      return;
    }

    const filtered = getFilteredHubs();

    updateVisibleMarkers(filtered);
    renderTrees();

    if (value === "") {
      hideSearchSuggestions();

      if (filtered.length > 0) {
        fitMapToFilteredHubs(filtered);
      } else {
        hideHubDetailsPanel();
      }

      return;
    }

    if (filtered.length > 0) {
      fitMapToFilteredHubs(filtered);
    } else {
      hideHubDetailsPanel();
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
  }, getConfig().search.debounceMs);

  searchBox.addEventListener("input", handleInput);

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
      '<div class="search-suggestion-item">' +
        '<div class="search-suggestion-title">Hub data not ready</div>' +
        '<div class="search-suggestion-meta">Please wait for data to load</div>' +
      '</div>';

    suggestionsBox.classList.remove("hidden");
    return;
  }

  if (!suggestions.length) {
    suggestionsBox.innerHTML =
      '<div class="search-suggestion-item">' +
        '<div class="search-suggestion-title">No results found</div>' +
        '<div class="search-suggestion-meta">Try hub, division, district or police station</div>' +
      '</div>';

    suggestionsBox.classList.remove("hidden");
    return;
  }

  suggestions.forEach(function(hub, index) {
    const item = document.createElement("div");
    item.className = "search-suggestion-item";

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

    suggestionsBox.appendChild(item);
  });

  suggestionsBox.classList.remove("hidden");
}

function updateSuggestionActiveState() {
  const items = document.querySelectorAll(".search-suggestion-item");

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