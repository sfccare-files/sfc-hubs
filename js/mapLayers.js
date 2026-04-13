function setHeatmapButtonState(isActive) {
  const btn = document.getElementById("heatmapToggleBtn");
  if (!btn) return;

  btn.textContent = isActive ? "Heatmap On" : "Heatmap";
  btn.classList.toggle("active", !!isActive);
  btn.setAttribute("aria-pressed", isActive ? "true" : "false");
}

function toggleHeatmapLayer() {
  if (!Array.isArray(getState().allHubs) || getState().allHubs.length === 0) {
    showMapToast("No hub data is available.");
    return;
  }

  if (!getState().mapLayerState.heatmapEnabled) {
    showHeatmap();
    getState().mapLayerState.heatmapEnabled = true;
    setHeatmapButtonState(true);
    showMapToast("Heatmap enabled.");
    return;
  }

  hideHeatmap();
  getState().mapLayerState.heatmapEnabled = false;
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

  setHeatmapButtonState(!!getState().mapLayerState.heatmapEnabled);
}