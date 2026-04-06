const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv";

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (!loadingScreen) return;
  loadingScreen.style.display = "none";
}

function showLoadError() {
  const loadingText = document.querySelector(".loading-text");
  const loadingSpinner = document.querySelector(".loading-spinner");

  if (loadingText) {
    loadingText.textContent = "Failed to load hub data";
  }

  if (loadingSpinner) {
    loadingSpinner.style.display = "none";
  }

  const hubTree = document.getElementById("hubTree");
  if (hubTree) {
    hubTree.innerHTML = `<div class="tree-item empty-tree">Failed to load hub data</div>`;
  }
}

function normalizeHeaderKey(key) {
  return String(key || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeHubRow(row) {
  const normalized = {};

  Object.keys(row || {}).forEach(function(key) {
    normalized[normalizeHeaderKey(key)] = row[key];
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

function loadHubData() {
  Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const hubs = results.data || [];

      hubs.forEach(function(rawHub) {
        const hub = normalizeHubRow(rawHub);

        if (!hub.lat || !hub.lng) return;

        const lat = parseFloat(hub.lat);
        const lng = parseFloat(hub.lng);

        if (isNaN(lat) || isNaN(lng)) return;

        var marker = L.marker([lat, lng]);

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

        marker.hubName = (hub.name || "").toLowerCase();
        marker.hubData = hub;

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
      });

      renderTrees();
      updateVisibleMarkers(allHubs);

      if (typeof refreshHeatmapData === "function") {
        refreshHeatmapData();
      }

      hideLoadingScreen();
    },
    error: function() {
      showLoadError();
    }
  });
}