const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv";

window.hubLoadStats = {
  totalRows: 0,
  validRows: 0,
  invalidRows: 0,
  duplicateRows: 0,
  blankRows: 0,
  invalidCoordRows: 0,
  missingNameRows: 0,
  parseErrors: 0
};

function resetHubLoadStats() {
  window.hubLoadStats = {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    duplicateRows: 0,
    blankRows: 0,
    invalidCoordRows: 0,
    missingNameRows: 0,
    parseErrors: 0
  };
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (!loadingScreen) return;
  loadingScreen.style.display = "none";
}

function showLoadError(message) {
  const finalMessage = message || "Failed to load hub data";
  const loadingText = document.querySelector(".loading-text");
  const loadingSpinner = document.querySelector(".loading-spinner");

  if (loadingText) {
    loadingText.textContent = finalMessage;
  }

  if (loadingSpinner) {
    loadingSpinner.style.display = "none";
  }

  const hubTree = document.getElementById("hubTree");
  if (hubTree) {
    hubTree.innerHTML =
      '<div class="tree-item empty-tree">' + finalMessage + "</div>";
  }

  if (typeof showMapToast === "function") {
    showMapToast(finalMessage);
  }
}

function normalizeHeaderKey(key) {
  return String(key || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeHubRow(row) {
  const normalized = {};

  Object.keys(row || {}).forEach(function(key) {
    normalized[normalizeHeaderKey(key)] = normalizeCellValue(row[key]);
  });

  return {
    name: normalized.name || "",
    hub_id: normalized.hub_id || "",
    police_station: normalized.police_station || "",
    district: normalized.district || "",
    division: normalized.division || "",
    lat: normalized.lat || "",
    lng: normalized.lng || "",
    address: normalized.address || "",
    hub_ip: normalized.hub_ip || "",
    zonal: normalized.zonal || "",
    phone: normalized.phone || "",
    hub_phone: normalized.hub_phone || "",
    manager: normalized.manager || "",
    manager_phone: normalized.manager_phone || "",
    assistant_manager: normalized.assistant_manager || "",
    assistant_manager_phone: normalized.assistant_manager_phone || "",
    team_leader: normalized.team_leader || "",
    team_leader_phone: normalized.team_leader_phone || "",
    whatsapp_group: normalized.whatsapp_group || ""
  };
}

function isCompletelyBlankHubRow(hub) {
  return !(
    hub.name ||
    hub.hub_id ||
    hub.police_station ||
    hub.district ||
    hub.division ||
    hub.lat ||
    hub.lng ||
    hub.address
  );
}

function parseCoordinate(value) {
  if (value === "") return NaN;
  return parseFloat(String(value).replace(/,/g, "").trim());
}

function isValidLatitude(lat) {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

function buildDuplicateKey(hub, lat, lng) {
  return [
    (hub.name || "").toLowerCase(),
    lat.toFixed(6),
    lng.toFixed(6)
  ].join("|");
}

function clearExistingHubData() {
  if (typeof markers !== "undefined" && markers && typeof markers.clearLayers === "function") {
    markers.clearLayers();
  }

  if (Array.isArray(hubMarkers)) {
    hubMarkers.length = 0;
  }

  if (Array.isArray(allHubs)) {
    allHubs.length = 0;
  }
}

function showLoadSummary(stats) {
  if (!stats) return;
  if (typeof showMapToast !== "function") return;

  if (stats.validRows === 0) {
    showMapToast("No valid hub data found.");
    return;
  }

  if (stats.invalidRows > 0 || stats.duplicateRows > 0) {
    showMapToast(
      "Loaded " +
        stats.validRows +
        " hubs. Skipped " +
        (stats.invalidRows + stats.duplicateRows) +
        " bad row(s)."
    );
  }
}

function logLoadSummary(stats) {
  if (!stats) return;

  console.groupCollapsed("Hub data load summary");
  console.log("Total rows:", stats.totalRows);
  console.log("Valid rows:", stats.validRows);
  console.log("Blank rows:", stats.blankRows);
  console.log("Invalid rows:", stats.invalidRows);
  console.log("Invalid coordinate rows:", stats.invalidCoordRows);
  console.log("Missing name rows:", stats.missingNameRows);
  console.log("Duplicate rows:", stats.duplicateRows);
  console.log("Parse errors:", stats.parseErrors);
  console.groupEnd();
}

function attachMarkerEvents(marker) {
  marker.on("click", function() {
    const matchedHub = allHubs.find(function(item) {
      return item.marker === marker;
    });

    if (matchedHub) {
      setActiveSelection("hub", matchedHub.name);
      renderTrees();
      showHubDetailsPanel(matchedHub);
      pulseMarker(marker);
    }
  });

  marker.on("mouseover", function(e) {
    const matchedHub = allHubs.find(function(item) {
      return item.marker === marker;
    });

    if (matchedHub) {
      showMarkerHover(matchedHub, e.originalEvent);
    }
  });

  marker.on("mousemove", function(e) {
    const matchedHub = allHubs.find(function(item) {
      return item.marker === marker;
    });

    if (matchedHub) {
      showMarkerHover(matchedHub, e.originalEvent);
    }
  });

  marker.on("mouseout", function() {
    hideMarkerHover();
  });
}

function loadHubData() {
  resetHubLoadStats();
  clearExistingHubData();

  Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const rows = Array.isArray(results.data) ? results.data : [];
      const duplicateTracker = new Set();

      window.hubLoadStats.totalRows = rows.length;

      rows.forEach(function(rawHub, index) {
        const hub = normalizeHubRow(rawHub);

        if (isCompletelyBlankHubRow(hub)) {
          window.hubLoadStats.blankRows += 1;
          return;
        }

        if (!hub.name) {
          window.hubLoadStats.invalidRows += 1;
          window.hubLoadStats.missingNameRows += 1;
          console.warn("Skipped hub row with missing name at row:", index + 2, rawHub);
          return;
        }

        const lat = parseCoordinate(hub.lat);
        const lng = parseCoordinate(hub.lng);

        if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
          window.hubLoadStats.invalidRows += 1;
          window.hubLoadStats.invalidCoordRows += 1;
          console.warn(
            "Skipped hub row with invalid coordinates at row:",
            index + 2,
            { name: hub.name, lat: hub.lat, lng: hub.lng }
          );
          return;
        }

        const duplicateKey = buildDuplicateKey(hub, lat, lng);
        if (duplicateTracker.has(duplicateKey)) {
          window.hubLoadStats.duplicateRows += 1;
          console.warn("Skipped duplicate hub row at row:", index + 2, hub);
          return;
        }

        duplicateTracker.add(duplicateKey);

        const marker = L.marker([lat, lng]);
        marker.hubName = (hub.name || "").toLowerCase();
        marker.hubData = hub;

        attachMarkerEvents(marker);

        markers.addLayer(marker);
        hubMarkers.push(marker);

        allHubs.push({
          name: hub.name || "",
          police_station: hub.police_station || "",
          district: hub.district || "",
          division: hub.division || "",
          marker: marker,
          raw: hub
        });

        window.hubLoadStats.validRows += 1;
      });

      if (results.errors && results.errors.length) {
        window.hubLoadStats.parseErrors = results.errors.length;
        console.warn("Papa Parse errors:", results.errors);
      }

      logLoadSummary(window.hubLoadStats);

      if (allHubs.length === 0) {
        renderTrees();
        updateVisibleMarkers([]);
        showLoadError("No valid hub data found.");
        hideLoadingScreen();
        return;
      }

      renderTrees();
      updateVisibleMarkers(allHubs);

      if (typeof refreshHeatmapData === "function") {
        refreshHeatmapData();
      }

      showLoadSummary(window.hubLoadStats);
      hideLoadingScreen();
    },
    error: function(error) {
      console.error("Hub data load failed:", error);
      showLoadError("Failed to load hub data");
      hideLoadingScreen();
    }
  });
}