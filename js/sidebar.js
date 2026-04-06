function safeReadStoredList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse localStorage list for key:", key, error);
    return [];
  }
}

let recentHubs = safeReadStoredList("sfc_recent_hubs");
let favoriteHubs = safeReadStoredList("sfc_favorite_hubs");

function saveStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to write localStorage list for key:", key, error);
  }
}

function renderTrees() {
  const data = getCrossFilteredValues();

  renderClickableTree("divisionTree", data.divisions, setDivisionFilter, "division");
  renderClickableTree("districtTree", data.districts, setDistrictFilter, "district");
  renderClickableTree("policeStationTree", data.policeStations, setPoliceStationFilter, "police_station");
  renderHubTree(data.hubs);

  updateSidebarCounts(data);
  updateQuickAccessPreview();
}

function renderHubTree(hubs) {
  const hubTree = document.getElementById("hubTree");
  if (!hubTree) return;

  hubTree.innerHTML = "";

  if (!Array.isArray(allHubs) || allHubs.length === 0) {
    hubTree.innerHTML =
      '<div class="tree-item empty-tree">Hub data is not available yet.</div>';
    return;
  }

  if (!hubs.length) {
    hubTree.innerHTML =
      '<div class="tree-item empty-tree">' +
        'No hubs found.<br>Try hub, division, district or police station.' +
      "</div>";
    return;
  }

  hubs.forEach(function(hub) {
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

  if (!Array.isArray(allHubs) || allHubs.length === 0) {
    container.innerHTML = '<div class="tree-item empty-tree">No data</div>';
    return;
  }

  if (items.length === 0) {
    container.innerHTML = '<div class="tree-item empty-tree">No data</div>';
    return;
  }

  items.forEach(function(itemValue) {
    const row = document.createElement("div");
    row.className = "tree-item";

    const link = document.createElement("span");
    link.className = "tree-link";
    link.textContent = itemValue;

    if (type === "division" && activeFilters.division.includes(itemValue)) {
      link.classList.add("active-item");
    }

    if (type === "district" && activeFilters.district.includes(itemValue)) {
      link.classList.add("active-item");
    }

    if (type === "police_station" && activeFilters.police_station.includes(itemValue)) {
      link.classList.add("active-item");
    }

    link.addEventListener("click", function() {
      clickHandler(itemValue);
    });

    row.appendChild(link);
    container.appendChild(row);
  });
}

function addRecentHub(hub) {
  if (!hub || !hub.name) return;

  recentHubs = recentHubs.filter(function(item) {
    return item.name !== hub.name;
  });

  recentHubs.unshift({
    name: hub.name,
    district: hub.district || "",
    police_station: hub.police_station || ""
  });

  if (recentHubs.length > 5) {
    recentHubs.pop();
  }

  saveStoredList("sfc_recent_hubs", recentHubs);
}

function isFavoriteHub(hubName) {
  return favoriteHubs.some(function(h) {
    return h.name === hubName;
  });
}

function toggleFavoriteHub(hub) {
  if (!hub || !hub.name) return;

  const index = favoriteHubs.findIndex(function(item) {
    return item.name === hub.name;
  });

  if (index > -1) {
    favoriteHubs.splice(index, 1);
  } else {
    favoriteHubs.unshift({
      name: hub.name,
      district: hub.district || "",
      police_station: hub.police_station || ""
    });
  }

  saveStoredList("sfc_favorite_hubs", favoriteHubs);
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
    favoriteList.innerHTML = '<div class="quick-empty">No favorite hubs yet</div>';
    return;
  }

  favoriteHubs.forEach(function(hub) {
    const item = document.createElement("div");
    item.className = "quick-list-item";
    item.innerHTML =
      '<div class="quick-list-item-name">' + escapeSidebarText(hub.name || "") + "</div>" +
      '<div class="quick-list-item-meta">' +
        escapeSidebarText(hub.district || "") +
        (hub.police_station ? " • " + escapeSidebarText(hub.police_station) : "") +
      "</div>";

    item.addEventListener("click", function() {
      const target = allHubs.find(function(h) {
        return h.name === hub.name;
      });

      if (!target) {
        showMapToast("This favorite hub is not available in current data.");
        return;
      }

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
    recentList.innerHTML = '<div class="quick-empty">No recent hubs yet</div>';
    return;
  }

  recentHubs.forEach(function(hub) {
    const item = document.createElement("div");
    item.className = "quick-list-item";
    item.innerHTML =
      '<div class="quick-list-item-name">' + escapeSidebarText(hub.name || "") + "</div>" +
      '<div class="quick-list-item-meta">' +
        escapeSidebarText(hub.district || "") +
        (hub.police_station ? " • " + escapeSidebarText(hub.police_station) : "") +
      "</div>";

    item.addEventListener("click", function() {
      const target = allHubs.find(function(h) {
        return h.name === hub.name;
      });

      if (!target) {
        showMapToast("This recent hub is not available in current data.");
        return;
      }

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
  setCount("policeStationTreeCount", data.policeStations.length);
  setCount("hubTreeCount", data.hubs.length);

  setCount("divisionRailCount", data.divisions.length);
  setCount("districtRailCount", data.districts.length);
  setCount("policeStationRailCount", data.policeStations.length);
  setCount("hubRailCount", data.hubs.length);
}

function setCount(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

function initTreeToggles() {
  document.querySelectorAll(".tree-toggle").forEach(function(toggle) {
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
  document.querySelectorAll(".sidebar-panel-toggle").forEach(function(toggle) {
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

    try {
      localStorage.setItem(
        "sfc_sidebar_collapsed",
        sidebar.classList.contains("collapsed")
      );
    } catch (error) {
      console.warn("Failed to persist sidebar state.", error);
    }

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

  railButtons.forEach(function(btn) {
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

      try {
        localStorage.setItem("sfc_sidebar_collapsed", "false");
      } catch (error) {
        console.warn("Failed to persist sidebar rail state.", error);
      }

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

  const toggle = document.querySelector('.tree-toggle[data-target="' + targetId + '"]');
  if (toggle) {
    toggle.classList.add("active");
  }
}

function closeSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.classList.add("hidden");

  const toggle = document.querySelector('.tree-toggle[data-target="' + targetId + '"]');
  if (toggle) {
    toggle.classList.remove("active");
  }
}

function expandAllSections() {
  openSection("divisionTree");
  openSection("districtTree");
  openSection("policeStationTree");
  openSection("hubTree");
}

function collapseAllSections() {
  closeSection("divisionTree");
  closeSection("districtTree");
  closeSection("policeStationTree");
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
  if (!hubTree || !name) return;

  openSection("hubTree");

  setTimeout(function() {
    if (!window.CSS || typeof window.CSS.escape !== "function") return;

    const el = hubTree.querySelector('[data-hub-name="' + window.CSS.escape(name) + '"]');

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, 100);
}

function escapeSidebarText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}