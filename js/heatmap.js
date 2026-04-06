function getHeatmapPoints() {
  if (!Array.isArray(getState().allHubs) || getState().allHubs.length === 0) {
    return [];
  }

  return getState().allHubs
    .filter(function(hub) {
      return hub && hub.marker && typeof hub.marker.getLatLng === "function";
    })
    .map(function(hub) {
      const latLng = hub.marker.getLatLng();
      return [latLng.lat, latLng.lng, 0.8];
    });
}

function buildHeatmapLayer() {
  const heatPoints = getHeatmapPoints();

  if (!heatPoints.length) {
    getState().hubHeatmapLayer = null;
    return null;
  }

  getState().hubHeatmapLayer = L.heatLayer(heatPoints, {
    radius: 24,
    blur: 18,
    maxZoom: 13
  });

  return getState().hubHeatmapLayer;
}

function refreshHeatmapData() {
  const heatPoints = getHeatmapPoints();

  if (!heatPoints.length) {
    if (
      getState().hubHeatmapLayer &&
      getState().map &&
      getState().map.hasLayer(getState().hubHeatmapLayer)
    ) {
      getState().map.removeLayer(getState().hubHeatmapLayer);
    }

    getState().hubHeatmapLayer = null;
    getState().mapLayerState.heatmapEnabled = false;

    if (typeof setHeatmapButtonState === "function") {
      setHeatmapButtonState(false);
    }

    return;
  }

  if (!getState().hubHeatmapLayer) {
    buildHeatmapLayer();
    return;
  }

  getState().hubHeatmapLayer.setLatLngs(heatPoints);
}

function showHeatmap() {
  if (!getState().map) return;

  if (!getState().hubHeatmapLayer) {
    buildHeatmapLayer();
  }

  if (
    getState().hubHeatmapLayer &&
    !getState().map.hasLayer(getState().hubHeatmapLayer)
  ) {
    getState().map.addLayer(getState().hubHeatmapLayer);
  }
}

function hideHeatmap() {
  if (
    getState().hubHeatmapLayer &&
    getState().map &&
    getState().map.hasLayer(getState().hubHeatmapLayer)
  ) {
    getState().map.removeLayer(getState().hubHeatmapLayer);
  }
}

function isHeatmapVisible() {
  return !!(
    getState().hubHeatmapLayer &&
    getState().map &&
    getState().map.hasLayer(getState().hubHeatmapLayer)
  );
}