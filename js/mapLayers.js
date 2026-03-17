var mapLayerState = {
  heatmapEnabled: false
};

function setHeatmapButtonState(isActive) {
  const btn = document.getElementById("heatmapToggleBtn");
  if (!btn) return;

  btn.textContent = isActive ? "Heatmap On" : "Heatmap";
}

function toggleHeatmapLayer() {
  if (!mapLayerState.heatmapEnabled) {
    showHeatmap();
    mapLayerState.heatmapEnabled = true;
    setHeatmapButtonState(true);
    showMapToast("Heatmap enabled.");
    return;
  }

  hideHeatmap();
  mapLayerState.heatmapEnabled = false;
  setHeatmapButtonState(false);
  showMapToast("Heatmap disabled.");
}

function initMapLayerControls() {
  const heatmapBtn = document.getElementById("heatmapToggleBtn");

  if (heatmapBtn) {
    heatmapBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleHeatmapLayer();
    });
  }

  setHeatmapButtonState(false);
}