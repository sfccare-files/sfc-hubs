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

function safeCall(fnName) {
  if (typeof window[fnName] === "function") {
    window[fnName]();
    return true;
  }
  return false;
}

function initFreshHomeWhenReady() {
  let tries = 0;

  const timer = setInterval(function() {
    const hubsReady =
      Array.isArray(getState().allHubs) &&
      getState().allHubs.length > 0;

    if (hubsReady) {
      clearInterval(timer);

      if (typeof renderTrees === "function") {
        renderTrees();
      }

      if (typeof updateVisibleMarkers === "function") {
        updateVisibleMarkers(getState().allHubs);
      }

      if (typeof resetMapView === "function") {
        resetMapView();
      }

      if (typeof resetAllSections === "function") {
        resetAllSections();
      }

      if (typeof updateQuickAccessPreview === "function") {
        updateQuickAccessPreview();
      }

      if (typeof refreshHeatmapData === "function") {
        refreshHeatmapData();
      }

      return;
    }

    tries += 1;

    if (tries >= getConfig().app.startupMaxTries) {
      clearInterval(timer);

      if (getState().loadStats && getState().loadStats.validRows === 0) {
        console.warn("Hub data did not become ready during startup.");
      }
    }
  }, getConfig().app.startupCheckIntervalMs);
}

function bindMapToolButton(id, handler) {
  const btn = document.getElementById(id);
  if (!btn || typeof handler !== "function") return;

  btn.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    handler();
  });
}

function initOverlayActions() {
  document.addEventListener("click", function(e) {
    const closeBtn = e.target.closest("#hubDetailsClose");
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();

      if (typeof hideHubDetailsPanel === "function") {
        hideHubDetailsPanel();
      }
      return;
    }

    const overlayEl = e.target.closest("#mapOverlay");
    if (
      overlayEl &&
      !overlayEl.classList.contains("hidden") &&
      typeof hideHubDetailsPanel === "function"
    ) {
      e.preventDefault();
      e.stopPropagation();
      hideHubDetailsPanel();
    }
  });
}

function initResizeHandler() {
  window.addEventListener("resize", function() {
    if (typeof map !== "undefined" && map && typeof map.invalidateSize === "function") {
      map.invalidateSize();
    }

    if (typeof hideMarkerHover === "function") {
      hideMarkerHover();
    }
  });
}

function bootApp() {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  safeCall("initTreeToggles");
  safeCall("initSidebarPanel");
  safeCall("initSidebarCollapse");
  safeCall("initSidebarRail");
  safeCall("initFilterToolbar");

  if (typeof initSearch !== "function") {
    console.error("Critical boot error: initSearch is not defined.");
    if (typeof showLoadError === "function") {
      showLoadError("App boot failed: search module missing.");
    }
    return;
  }

  if (typeof initClearFilters !== "function") {
    console.error("Critical boot error: initClearFilters is not defined.");
    if (typeof showLoadError === "function") {
      showLoadError("App boot failed: filter module missing.");
    }
    return;
  }

  if (typeof loadHubData !== "function") {
    console.error("Critical boot error: loadHubData is not defined.");
    if (typeof showLoadError === "function") {
      showLoadError("App boot failed: data module missing.");
    }
    return;
  }

  initSearch();
  initClearFilters();
  loadHubData();

  if (typeof resetAllSections === "function") {
    resetAllSections();
  }

  safeCall("initMapLayerControls");
  initFreshHomeWhenReady();

  bindMapToolButton("resetMapBtn", function() {
    if (typeof resetMapView === "function") {
      resetMapView();
    }
  });

  bindMapToolButton("myLocationBtn", function() {
    if (typeof goToMyLocation === "function") {
      goToMyLocation();
    }
  });

  bindMapToolButton("nearestHubBtn", function() {
    if (typeof goToNearestHub === "function") {
      goToNearestHub();
    }
  });

  initOverlayActions();
  initResizeHandler();
}

bootApp();