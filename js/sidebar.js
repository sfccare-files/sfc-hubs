let recentHubs = JSON.parse(localStorage.getItem("sfc_recent_hubs") || "[]");
let favoriteHubs = JSON.parse(localStorage.getItem("sfc_favorite_hubs") || "[]");

function renderTrees() {
  const data = getCrossFilteredValues();

  renderClickableTree("divisionTree", data.divisions, setDivisionFilter, "division");
  renderClickableTree("districtTree", data.districts, setDistrictFilter, "district");
  renderClickableTree("zoneTree", data.zones, setZoneFilter, "zone");
  renderHubTree(data.hubs);

  updateSidebarCounts(data);
  updateQuickAccessPreview();
}

function renderHubTree(hubs) {
  const hubTree = document.getElementById("hubTree");
  if (!hubTree) return;

  hubTree.innerHTML = "";

  if (hubs.length === 0) {
    hubTree.innerHTML = `
      <div class="tree-item empty-tree">
        No hubs found.<br>Try clearing filters or searching differently.
      </div>
    `;
    return;
  }

  hubs.forEach(hub => {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.dataset.hubName = hub.name;

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
        hideHubDetailsPanel();
        renderTrees();
        return;
      }

      focusHubOnMap(hub, 12);
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

    if (type === "division" && activeFilters.division.includes(item)) {
      link.classList.add("active-item");
    }

    if (type === "district" && activeFilters.district.includes(item)) {
      link.classList.add("active-item");
    }

    if (type === "zone" && activeFilters.zone.includes(item)) {
      link.classList.add("active-item");
    }

    link.addEventListener("click", function() {
      clickHandler(item);
    });

    row.appendChild(link);
    container.appendChild(row);
  });
}

function addRecentHub(hub) {
  recentHubs = recentHubs.filter(h => h.name !== hub.name);

  recentHubs.unshift({
    name: hub.name,
    district: hub.district,
    zone: hub.zone
  });

  if (recentHubs.length > 5) {
    recentHubs.pop();
  }

  localStorage.setItem("sfc_recent_hubs", JSON.stringify(recentHubs));
}

function isFavoriteHub(hubName) {
  return favoriteHubs.some(function(h) {
    return h.name === hubName;
  });
}

function toggleFavoriteHub(hub) {
  const index = favoriteHubs.findIndex(h => h.name === hub.name);

  if (index > -1) {
    favoriteHubs.splice(index, 1);
  } else {
    favoriteHubs.unshift({
      name: hub.name,
      district: hub.district,
      zone: hub.zone
    });
  }

  localStorage.setItem("sfc_favorite_hubs", JSON.stringify(favoriteHubs));
  updateQuickAccessPreview();

  if (activeSelection.type === "hub" && activeSelection.value === hub.name) {
    showHubDetailsPanel(hub);
  }
}

function renderFavoritesList() {
  const favoriteList = document.getElementById("favoriteHubList");
  if (!favoriteList) return;

  favoriteList.innerHTML = "";

  if (favoriteHubs.length === 0) {
    favoriteList.innerHTML = `<div class="quick-empty">No favorite hubs yet</div>`;
    return;
  }

  favoriteHubs.forEach(hub => {
    const item = document.createElement("div");
    item.className = "quick-list-item";
    item.innerHTML = `
      <div class="quick-list-item-name">${hub.name}</div>
      <div class="quick-list-item-meta">${hub.district || ""}</div>
    `;

    item.addEventListener("click", function() {
      const target = allHubs.find(h => h.name === hub.name);
      if (!target) return;
      focusHubOnMap(target, 12);
    });

    favoriteList.appendChild(item);
  });
}

function renderRecentHubList() {
  const recentList = document.getElementById("recentHubList");
  if (!recentList) return;

  recentList.innerHTML = "";

  if (recentHubs.length === 0) {
    recentList.innerHTML = `<div class="quick-empty">No recent hubs yet</div>`;
    return;
  }

  recentHubs.forEach(hub => {
    const item = document.createElement("div");
    item.className = "quick-list-item";
    item.innerHTML = `
      <div class="quick-list-item-name">${hub.name}</div>
      <div class="quick-list-item-meta">${hub.district || ""}</div>
    `;

    item.addEventListener("click", function() {
      const target = allHubs.find(h => h.name === hub.name);
      if (!target) return;
      focusHubOnMap(target, 12);
    });

    recentList.appendChild(item);
  });
}

function updateQuickAccessPreview() {
  const selectedHubLabel = document.getElementById("selectedHubLabel");
  const favoriteHubCount = document.getElementById("favoriteHubCount");
  const recentHubCount = document.getElementById("recentHubCount");

  if (selectedHubLabel) {
    selectedHubLabel.textContent =
      activeSelection.type === "hub"
        ? activeSelection.value
        : "None selected";
  }

  if (favoriteHubCount) {
    favoriteHubCount.textContent = favoriteHubs.length + " hubs";
  }

  if (recentHubCount) {
    recentHubCount.textContent = recentHubs.length + " hubs";
  }

  renderFavoritesList();
  renderRecentHubList();
}

function updateSidebarCounts(data) {
  setCount("divisionTreeCount", data.divisions.length);
  setCount("districtTreeCount", data.districts.length);
  setCount("zoneTreeCount", data.zones.length);
  setCount("hubTreeCount", data.hubs.length);

  setCount("divisionRailCount", data.divisions.length);
  setCount("districtRailCount", data.districts.length);
  setCount("zoneRailCount", data.zones.length);
  setCount("hubRailCount", data.hubs.length);
}

function setCount(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function initTreeToggles() {
  document.querySelectorAll(".tree-toggle").forEach(toggle => {
    toggle.addEventListener("click", function() {
      const id = this.dataset.target;
      const el = document.getElementById(id);
      if (!el) return;

      el.classList.toggle("hidden");
      this.classList.toggle("active");
    });
  });
}

function initSidebarPanel() {
  document.querySelectorAll(".sidebar-panel-toggle").forEach(toggle => {
    toggle.addEventListener("click", function() {
      const targetId = this.getAttribute("data-panel-target");
      const target = document.getElementById(targetId);
      const icon = this.querySelector(".sidebar-panel-toggle-icon");

      if (!target) return;

      target.classList.toggle("hidden");

      if (icon) {
        icon.textContent = target.classList.contains("hidden") ? "+" : "−";
      }
    });
  });
}

function initSidebarCollapse() {
  const sidebar = document.getElementById("sidebar");
  const btn = document.getElementById("sidebarToggleBtn");

  if (!sidebar || !btn) return;

  const saved = localStorage.getItem("sfc_sidebar_collapsed");

  if (saved === "true") {
    sidebar.classList.add("collapsed");
  }

  btn.addEventListener("click", function() {
    sidebar.classList.toggle("collapsed");

    localStorage.setItem(
      "sfc_sidebar_collapsed",
      sidebar.classList.contains("collapsed")
    );

    setTimeout(function() {
      if (typeof map !== "undefined") {
        map.invalidateSize();
      }
    }, 250);
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
        if (typeof clearAllFilters === "function") {
          clearAllFilters();
        }
        return;
      }

      if (!target) return;

      sidebar.classList.remove("collapsed");
      localStorage.setItem("sfc_sidebar_collapsed", "false");

      setTimeout(function() {
        const quickPanel = document.getElementById("quickAccessPanel");

        if (target === "quickAccessPanel" && quickPanel) {
          quickPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
          return;
        }

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

function expandAllSections() {
  openSection("divisionTree");
  openSection("districtTree");
  openSection("zoneTree");
  openSection("hubTree");
}

function collapseAllSections() {
  closeSection("divisionTree");
  closeSection("districtTree");
  closeSection("zoneTree");
  closeSection("hubTree");
}

function resetAllSections() {
  collapseAllSections();
}

function initFilterToolbar() {
  const expandBtn = document.getElementById("expandAllBtn");
  const collapseBtn = document.getElementById("collapseAllBtn");

  if (expandBtn) {
    expandBtn.addEventListener("click", function() {
      expandAllSections();
    });
  }

  if (collapseBtn) {
    collapseBtn.addEventListener("click", function() {
      collapseAllSections();
    });
  }
}

function scrollToHubTreeItem(name) {
  const hubTree = document.getElementById("hubTree");
  if (!hubTree) return;

  openSection("hubTree");

  setTimeout(() => {
    const el = hubTree.querySelector(`[data-hub-name="${CSS.escape(name)}"]`);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, 100);
}