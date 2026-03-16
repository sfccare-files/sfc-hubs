function updateDateTime() {
  const timeEl = document.getElementById("liveDateTime");
  if (!timeEl) return;

  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  };

  timeEl.textContent = now.toLocaleString("en-US", options);
}

function restoreMapSession() {
  if (typeof map === "undefined") return;

  const savedCenter = localStorage.getItem("sfc_map_center");
  const savedZoom = localStorage.getItem("sfc_map_zoom");

  if (!savedCenter || !savedZoom) return;

  try {
    const center = JSON.parse(savedCenter);
    const zoom = parseInt(savedZoom, 10);

    if (
      Array.isArray(center) &&
      center.length === 2 &&
      !isNaN(center[0]) &&
      !isNaN(center[1]) &&
      !isNaN(zoom)
    ) {
      map.setView(center, zoom);
    }
  } catch (e) {}
}

function saveMapSession() {
  if (typeof map === "undefined") return;

  const center = map.getCenter();
  localStorage.setItem("sfc_map_center", JSON.stringify([center.lat, center.lng]));
  localStorage.setItem("sfc_map_zoom", map.getZoom());
}

function restoreSidebarScroll() {
  const scrollArea = document.querySelector(".sidebar-scroll-area");
  const savedScroll = localStorage.getItem("sfc_sidebar_scroll");
  if (!scrollArea || savedScroll === null) return;

  scrollArea.scrollTop = parseInt(savedScroll, 10) || 0;
}

function saveSidebarScroll() {
  const scrollArea = document.querySelector(".sidebar-scroll-area");
  if (!scrollArea) return;

  localStorage.setItem("sfc_sidebar_scroll", scrollArea.scrollTop);
}

function applySearchValue(value) {
  const searchBox = document.getElementById("searchBox");
  if (!searchBox) return;

  searchBox.value = value || "";

  if (typeof renderTrees === "function") {
    renderTrees();
  }

  if (typeof getFilteredHubs === "function" && typeof updateVisibleMarkers === "function") {
    const filtered = getFilteredHubs();
    updateVisibleMarkers(filtered);

    if (typeof fitMapToFilteredHubs === "function" && filtered.length > 0) {
      fitMapToFilteredHubs(filtered);
    }
  }
}

function handleURLNavigation() {
  if (typeof allHubs === "undefined" || !Array.isArray(allHubs) || allHubs.length === 0) return;

  const params = new URLSearchParams(window.location.search);

  if (params.has("search")) {
    applySearchValue(params.get("search"));
  }

  if (params.has("hub")) {
    const hubName = params.get("hub");
    const targetHub = allHubs.find(function(hub) {
      return (hub.name || "").toLowerCase() === (hubName || "").toLowerCase();
    });

    if (targetHub) {
      focusHubOnMap(targetHub, 13);
      return;
    }
  }

  if (params.has("lat") && params.has("lng") && typeof map !== "undefined") {
    const lat = parseFloat(params.get("lat"));
    const lng = parseFloat(params.get("lng"));

    if (!isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 13);
    }
  }
}

function restoreLastSelectedHub() {
  if (typeof allHubs === "undefined" || !Array.isArray(allHubs) || allHubs.length === 0) return;

  const savedHubName = localStorage.getItem("sfc_last_hub");
  if (!savedHubName) return;

  const targetHub = allHubs.find(function(hub) {
    return hub.name === savedHubName;
  });

  if (!targetHub) return;

  if (typeof setActiveSelection === "function") {
    setActiveSelection("hub", targetHub.name);
  } else if (typeof activeSelection !== "undefined") {
    activeSelection.type = "hub";
    activeSelection.value = targetHub.name;
  }

  if (typeof renderTrees === "function") {
    renderTrees();
  }

  if (typeof scrollToHubTreeItem === "function") {
    scrollToHubTreeItem(targetHub.name);
  }
}

function restorePhase2StateWhenReady() {
  let tries = 0;
  const maxTries = 80;

  const timer = setInterval(function() {
    const hubsReady =
      typeof allHubs !== "undefined" &&
      Array.isArray(allHubs) &&
      allHubs.length > 0;

    if (hubsReady) {
      clearInterval(timer);

      if (typeof restoreFilterState === "function") {
        restoreFilterState();
      }

      if (typeof renderTrees === "function") {
        renderTrees();
      }

      if (typeof getFilteredHubs === "function" && typeof updateVisibleMarkers === "function") {
        const filtered = getFilteredHubs();
        updateVisibleMarkers(filtered);

        if (typeof fitMapToFilteredHubs === "function" && filtered.length > 0) {
          fitMapToFilteredHubs(filtered);
        }
      }

      restoreMapSession();
      restoreSidebarScroll();

      handleURLNavigation();

      if (!window.location.search) {
        restoreLastSelectedHub();
      }

      if (typeof renderFavoritesList === "function") {
        renderFavoritesList();
      }

      if (typeof renderRecentHubList === "function") {
        renderRecentHubList();
      }

      if (typeof updateQuickAccessPreview === "function") {
        updateQuickAccessPreview();
      }

      return;
    }

    tries += 1;
    if (tries >= maxTries) {
      clearInterval(timer);
    }
  }, 150);
}

updateDateTime();
setInterval(updateDateTime, 1000);

initTreeToggles();

if (typeof initSidebarPanel === "function") {
  initSidebarPanel();
}

if (typeof initSidebarPanels === "function") {
  initSidebarPanels();
}

if (typeof initSidebarCollapse === "function") {
  initSidebarCollapse();
}

if (typeof initSidebarRail === "function") {
  initSidebarRail();
}

initSearch();
initClearFilters();
loadHubData();
resetAllSections();

restorePhase2StateWhenReady();

const hubDetailsClose = document.getElementById("hubDetailsClose");
if (hubDetailsClose) {
  hubDetailsClose.addEventListener("click", function() {
    hideHubDetailsPanel();
  });
}

const overlay = document.getElementById("mapOverlay");
if (overlay) {
  overlay.addEventListener("click", hideHubDetailsPanel);
}

const resetMapBtn = document.getElementById("resetMapBtn");
if (resetMapBtn) {
  resetMapBtn.addEventListener("click", resetMapView);
}

const myLocationBtn = document.getElementById("myLocationBtn");
if (myLocationBtn) {
  myLocationBtn.addEventListener("click", goToMyLocation);
}

const sidebarScrollArea = document.querySelector(".sidebar-scroll-area");
if (sidebarScrollArea) {
  sidebarScrollArea.addEventListener("scroll", saveSidebarScroll);
}

window.addEventListener("beforeunload", function() {
  saveMapSession();
  saveSidebarScroll();
});

window.addEventListener("resize", function() {
  if (typeof map !== "undefined") {
    map.invalidateSize();
  }

  if (typeof hideMarkerHover === "function") {
    hideMarkerHover();
  }
});