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

      if (typeof renderTrees === "function") renderTrees();
      if (typeof updateVisibleMarkers === "function") updateVisibleMarkers(getState().allHubs);
      if (typeof resetMapView === "function") resetMapView();
      if (typeof resetAllSections === "function") resetAllSections();
      if (typeof updateQuickAccessPreview === "function") updateQuickAccessPreview();
      if (typeof refreshHeatmapData === "function") refreshHeatmapData();

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
    if (overlayEl && !overlayEl.classList.contains("hidden")) {
      e.preventDefault();
      e.stopPropagation();

      if (typeof hideHubDetailsPanel === "function") {
        hideHubDetailsPanel();
      }
    }
  });
}

function initResizeHandler() {
  window.addEventListener("resize", function() {
    if (typeof map !== "undefined" && map && map.invalidateSize) {
      map.invalidateSize();
    }

    if (typeof hideMarkerHover === "function") {
      hideMarkerHover();
    }
  });
}

/* =========================
   🔥 FIX: RELIABLE POPUP OPEN
========================= */

function openHubPopup(hub, lat, lng, distanceFromUser) {
  const panel = document.getElementById("hubDetailsPanel");
  const content = document.getElementById("hubDetailsContent");
  const overlay = document.getElementById("mapOverlay");

  if (!panel || !content || !overlay) return;

  // STEP 1: inject HTML first
  content.innerHTML = buildPopup(hub, lat, lng, distanceFromUser);

  // STEP 2: force layout paint (THIS is what fixes mobile header issue)
  panel.style.display = "block";
  overlay.style.display = "block";

  // STEP 3: ensure browser paints before visibility transition
  setTimeout(() => {
    panel.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }, 0);
}

function closeHubPopup() {
  const panel = document.getElementById("hubDetailsPanel");
  const overlay = document.getElementById("mapOverlay");

  if (panel) panel.classList.add("hidden");
  if (overlay) overlay.classList.add("hidden");
}

/* ========================= */

function bootApp() {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  safeCall("initTreeToggles");
  safeCall("initSidebarPanel");
  safeCall("initSidebarCollapse");
  safeCall("initSidebarRail");
  safeCall("initFilterToolbar");

  if (typeof initSearch !== "function") return;
  if (typeof initClearFilters !== "function") return;
  if (typeof loadHubData !== "function") return;

  initSearch();
  initClearFilters();
  loadHubData();

  if (typeof resetAllSections === "function") resetAllSections();
  safeCall("initMapLayerControls");

  initFreshHomeWhenReady();

  bindMapToolButton("resetMapBtn", function() {
    if (typeof resetMapView === "function") resetMapView();
  });

  bindMapToolButton("myLocationBtn", function() {
    if (typeof goToMyLocation === "function") goToMyLocation();
  });

  bindMapToolButton("nearestHubBtn", function() {
    if (typeof goToNearestHub === "function") goToNearestHub();
  });

  initOverlayActions();
  initResizeHandler();
}

bootApp();