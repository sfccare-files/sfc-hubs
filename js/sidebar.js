function renderTrees(hubs) {
  const divisions = [...new Set(hubs.map(h => h.division).filter(Boolean))].sort();
  const districts = [...new Set(hubs.map(h => h.district).filter(Boolean))].sort();
  const zones = [...new Set(hubs.map(h => h.zone).filter(Boolean))].sort();

  renderClickableTree("divisionTree", divisions, setDivisionFilter);
  renderClickableTree("districtTree", districts, setDistrictFilter);
  renderClickableTree("zoneTree", zones, setZoneFilter);
  renderHubTree(hubs);
}

function renderHubTree(hubs) {
  const hubTree = document.getElementById("hubTree");
  if (!hubTree) return;

  hubTree.innerHTML = "";

  if (hubs.length === 0) {
    hubTree.innerHTML = `<div class="tree-item empty-tree">No hubs found</div>`;
    return;
  }

  hubs.forEach(hub => {
    const item = document.createElement("div");
    item.className = "tree-item";

    const link = document.createElement("span");
    link.className = "tree-link";
    link.textContent = hub.name;

    link.addEventListener("click", function() {
      map.setView(hub.marker.getLatLng(), 12);
      hub.marker.openPopup();
    });

    item.appendChild(link);
    hubTree.appendChild(item);
  });
}

function renderClickableTree(containerId, items, clickHandler) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<div class="tree-item empty-tree">No data</div>`;
    return;
  }

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "tree-item";

    const link = document.createElement("span");
    link.className = "tree-link";
    link.textContent = item;

    link.addEventListener("click", function() {
      clickHandler(item);
    });

    row.appendChild(link);
    container.appendChild(row);
  });
}

function initTreeToggles() {
  const toggles = document.querySelectorAll(".tree-toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function() {
      const targetId = this.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return;

      target.classList.toggle("hidden");
      this.classList.toggle("active");
    });
  });
}