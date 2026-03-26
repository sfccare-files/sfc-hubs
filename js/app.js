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

function initFreshHomeWhenReady() {
  let tries = 0;
  const maxTries = 80;

  const timer = setInterval(function() {
    const hubsReady =
      typeof allHubs !== "undefined" &&
      Array.isArray(allHubs) &&
      allHubs.length > 0;

    if (hubsReady) {
      clearInterval(timer);

      if (typeof renderTrees === "function") {
        renderTrees();
      }

      updateVisibleMarkers(allHubs);
      resetMapView();
      resetAllSections();

      if (typeof updateQuickAccessPreview === "function") {
        updateQuickAccessPreview();
      }

      if (typeof refreshHeatmapData === "function") {
        refreshHeatmapData();
      }

      return;
    }

    tries += 1;

    if (tries >= maxTries) {
      clearInterval(timer);
    }
  }, 150);
}

function initMapControls() {
  const resetMapBtn = document.getElementById("resetMapBtn");
  const myLocationBtn = document.getElementById("myLocationBtn");
  const nearestHubBtn = document.getElementById("nearestHubBtn");
  const heatmapToggleBtn = document.getElementById("heatmapToggleBtn");

  if (resetMapBtn) {
    resetMapBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      resetMapView();
    });
  }

  if (myLocationBtn) {
    myLocationBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      goToMyLocation();
    });
  }

  if (nearestHubBtn) {
    nearestHubBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      goToNearestHub();
    });
  }

  if (heatmapToggleBtn) {
    heatmapToggleBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (typeof toggleHeatmap === "function") {
        toggleHeatmap();
      }
    });
  }
}

function initQuickAccessPanelDefault() {
  const quickAccessContent = document.getElementById("quickAccessContent");
  const quickAccessIcon = document.getElementById("quickAccessToggleIcon");

  if (quickAccessContent) {
    quickAccessContent.classList.add("hidden");
  }

  if (quickAccessIcon) {
    quickAccessIcon.textContent = "+";
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);

if (typeof initBaseMaps === "function") {
  initBaseMaps();
}

initTreeToggles();

if (typeof initSidebarPanel === "function") {
  initSidebarPanel();
}

if (typeof initSidebarCollapse === "function") {
  initSidebarCollapse();
}

if (typeof initSidebarRail === "function") {
  initSidebarRail();
}

if (typeof initFilterToolbar === "function") {
  initFilterToolbar();
}

initSearch();
initClearFilters();
loadHubData();
resetAllSections();
initQuickAccessPanelDefault();
initMapControls();

if (typeof initMapLayerControls === "function") {
  initMapLayerControls();
}

initFreshHomeWhenReady();

document.addEventListener("click", function(e) {
  const closeBtn = e.target.closest("#hubDetailsClose");
  if (closeBtn) {
    e.preventDefault();
    e.stopPropagation();
    hideHubDetailsPanel();
    return;
  }

  const overlayEl = e.target.closest("#mapOverlay");
  if (overlayEl && !overlayEl.classList.contains("hidden")) {
    e.preventDefault();
    e.stopPropagation();
    hideHubDetailsPanel();
  }
});

window.addEventListener("resize", function() {
  if (typeof map !== "undefined") {
    map.invalidateSize();
  }

  if (typeof hideMarkerHover === "function") {
    hideMarkerHover();
  }
});