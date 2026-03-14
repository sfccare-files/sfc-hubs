function renderTrees() {
  const data = getCrossFilteredValues();

  renderClickableTree("divisionTree", data.divisions, setDivisionFilter, "division");
  renderClickableTree("districtTree", data.districts, setDistrictFilter, "district");
  renderClickableTree("zoneTree", data.zones, setZoneFilter, "zone");
  renderHubTree(data.hubs);
  updateSidebarCounts(data);
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

    if (activeSelection.type === "hub" && activeSelection.value === hub.name) {
      link.classList.add("active-item");
    }

    link.addEventListener("click", function() {
      if (activeSelection.type === "hub" && activeSelection.value === hub.name) {
        activeSelection.type = "";
        activeSelection.value = "";
        renderTrees();
        return;
      }

      setActiveSelection("hub", hub.name);
      renderTrees();
      map.setView(hub.marker.getLatLng(), 12);
      hub.marker.openPopup();
    });

    item.appendChild(link);
    hubTree.appendChild(item);
  });
}

function renderClickableTree(containerId, items, clickHandler, type) {
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

    if (activeSelection.type === type && activeSelection.value === item) {
      link.classList.add("active-item");
    }

    link.addEventListener("click", function() {
      clickHandler(item);
    });

    row.appendChild(link);
    container.appendChild(row);
  });
}

function updateSidebarCounts(data) {
  const divisionTreeCount = document.getElementById("divisionTreeCount");
  const districtTreeCount = document.getElementById("districtTreeCount");
  const zoneTreeCount = document.getElementById("zoneTreeCount");
  const hubTreeCount = document.getElementById("hubTreeCount");

  const divisionRailCount = document.getElementById("divisionRailCount");
  const districtRailCount = document.getElementById("districtRailCount");
  const zoneRailCount = document.getElementById("zoneRailCount");
  const hubRailCount = document.getElementById("hubRailCount");

  const divisionCount = data.divisions.length;
  const districtCount = data.districts.length;
  const zoneCount = data.zones.length;
  const hubCount = data.hubs.length;

  if (divisionTreeCount) divisionTreeCount.textContent = divisionCount;
  if (districtTreeCount) districtTreeCount.textContent = districtCount;
  if (zoneTreeCount) zoneTreeCount.textContent = zoneCount;
  if (hubTreeCount) hubTreeCount.textContent = hubCount;

  if (divisionRailCount) divisionRailCount.textContent = divisionCount;
  if (districtRailCount) districtRailCount.textContent = districtCount;
  if (zoneRailCount) zoneRailCount.textContent = zoneCount;
  if (hubRailCount) hubRailCount.textContent = hubCount;
}

function initTreeToggles() {
  const toggles = document.querySelectorAll(".tree-toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function() {
      const targetId = this.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return;

      const isHidden = target.classList.contains("hidden");

      if (isHidden) {
        openSection(targetId);
      } else {
        closeSection(targetId);
      }
    });
  });
}

function initSidebarCollapse() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener("click", function() {
    sidebar.classList.toggle("collapsed");

    setTimeout(function() {
      if (typeof map !== "undefined") {
        map.invalidateSize();
      }
    }, 260);
  });
}

function initSidebarRail() {
  const sidebar = document.getElementById("sidebar");
  const railButtons = document.querySelectorAll(".rail-btn");

  if (!sidebar || railButtons.length === 0) return;

  railButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const action = this.getAttribute("data-rail-action");
      const target = this.getAttribute("data-rail-target");

      if (action === "clear") {
        clearAllFilters();
        return;
      }

      if (!target) return;

      sidebar.classList.remove("collapsed");

      setTimeout(function() {
        openSection(target);

        if (typeof map !== "undefined") {
          map.invalidateSize();
        }
      }, 260);
    });
  });
}

function openSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.classList.remove("hidden");

  const toggle = document.querySelector(`.tree-toggle[data-target="${targetId}"]`);
  if (toggle) {
    toggle.classList.add("active");
  }
}

function closeSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.classList.add("hidden");

  const toggle = document.querySelector(`.tree-toggle[data-target="${targetId}"]`);
  if (toggle) {
    toggle.classList.remove("active");
  }
}

function resetAllSections() {
  closeSection("divisionTree");
  closeSection("districtTree");
  closeSection("zoneTree");
  closeSection("hubTree");
}