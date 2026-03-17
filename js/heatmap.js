var hubHeatmapLayer = null;

function buildHeatmapLayer() {
  if (!Array.isArray(allHubs) || allHubs.length === 0) return null;

  const heatPoints = allHubs.map(function(hub) {
    const latLng = hub.marker.getLatLng();
    return [latLng.lat, latLng.lng, 0.8];
  });

  hubHeatmapLayer = L.heatLayer(heatPoints, {
    radius: 24,
    blur: 18,
    maxZoom: 13
  });

  return hubHeatmapLayer;
}

function refreshHeatmapData() {
  if (!hubHeatmapLayer) {
    buildHeatmapLayer();
    return;
  }

  const heatPoints = allHubs.map(function(hub) {
    const latLng = hub.marker.getLatLng();
    return [latLng.lat, latLng.lng, 0.8];
  });

  hubHeatmapLayer.setLatLngs(heatPoints);
}

function showHeatmap() {
  if (!hubHeatmapLayer) {
    buildHeatmapLayer();
  }

  if (hubHeatmapLayer && !map.hasLayer(hubHeatmapLayer)) {
    map.addLayer(hubHeatmapLayer);
  }
}

function hideHeatmap() {
  if (hubHeatmapLayer && map.hasLayer(hubHeatmapLayer)) {
    map.removeLayer(hubHeatmapLayer);
  }
}

function isHeatmapVisible() {
  return !!(hubHeatmapLayer && map.hasLayer(hubHeatmapLayer));
}