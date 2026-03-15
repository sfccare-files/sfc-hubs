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

updateDateTime();
setInterval(updateDateTime, 1000);

initTreeToggles();
initSidebarCollapse();
initSidebarRail();
initSearch();
initClearFilters();
loadHubData();
resetAllSections();

const hubDetailsClose = document.getElementById("hubDetailsClose");
if (hubDetailsClose) {
  hubDetailsClose.addEventListener("click", function() {
    hideHubDetailsPanel();
  });
}

const overlay = document.getElementById("mapOverlay");
if (overlay) {
  overlay.addEventListener("click", hideHubDetailsPanel);
}

window.addEventListener("resize", function() {
  if (typeof map !== "undefined") {
    map.invalidateSize();
  }
});