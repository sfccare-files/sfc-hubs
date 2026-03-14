var map = L.map('map').setView([23.6850, 90.3563], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

var markers = L.markerClusterGroup();
var hubMarkers = [];
var allHubs = [];

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
    map.setView(filteredHubs[0].marker.getLatLng(), 12);
    return;
  }

  const group = L.featureGroup(filteredHubs.map(h => h.marker));
  map.fitBounds(group.getBounds(), { padding: [30, 30] });
}