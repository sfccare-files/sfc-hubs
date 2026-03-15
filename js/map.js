var map = L.map('map').setView([23.6850, 90.3563], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

var markers = L.markerClusterGroup({
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  removeOutsideVisibleBounds: true,
  animate: true,
  animateAddingMarkers: true,
  maxClusterRadius: 45
});

var hubMarkers = [];
var allHubs = [];
var activePulseMarker = null;

map.addLayer(markers);

function updateVisibleMarkers(filteredHubs) {
  markers.clearLayers();

  filteredHubs.forEach(hub => {
    if (hub.marker) {
      markers.addLayer(hub.marker);
    }
  });
}

function fitMapToFilteredHubs(filteredHubs) {
  if (!filteredHubs || filteredHubs.length === 0) return;

  if (filteredHubs.length === 1) {
    map.flyTo(filteredHubs[0].marker.getLatLng(), 12, {
      duration: 0.8
    });
    return;
  }

  const group = L.featureGroup(filteredHubs.map(h => h.marker));
  map.flyToBounds(group.getBounds(), {
    padding: [30, 30],
    duration: 0.8
  });
}

function focusHubOnMap(hub, zoomLevel) {
  if (!hub || !hub.marker) return;

  map.flyTo(hub.marker.getLatLng(), zoomLevel || 12, {
    duration: 0.8
  });

  setTimeout(function() {
    showHubDetailsPanel(hub);
    pulseMarker(hub.marker);
  }, 350);
}

function pulseMarker(marker) {
  if (!marker || !marker._icon) return;

  if (activePulseMarker && activePulseMarker._icon) {
    activePulseMarker._icon.classList.remove("selected-hub-marker");
  }

  activePulseMarker = marker;
  marker._icon.classList.add("selected-hub-marker");

  setTimeout(function() {
    if (marker && marker._icon) {
      marker._icon.classList.remove("selected-hub-marker");
    }
  }, 3000);
}

function showHubDetailsPanel(hub) {
  const panel = document.getElementById("hubDetailsPanel");
  const content = document.getElementById("hubDetailsContent");
  const overlay = document.getElementById("mapOverlay");

  if (!panel || !content || !hub) return;

  content.innerHTML = buildPopup(
    hub.raw || hub,
    hub.marker.getLatLng().lat,
    hub.marker.getLatLng().lng
  );

  panel.classList.remove("hidden");

  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function hideHubDetailsPanel() {
  const panel = document.getElementById("hubDetailsPanel");
  const overlay = document.getElementById("mapOverlay");

  if (panel) {
    panel.classList.add("hidden");
  }

  if (overlay) {
    overlay.classList.add("hidden");
  }
}