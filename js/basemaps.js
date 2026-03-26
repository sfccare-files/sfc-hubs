var currentBaseMap = null;
var currentLabelLayer = null;

var baseMaps = {
  standard: {
    layer: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri"
      }
    )
  },

  satellite: {
    layer: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri"
      }
    )
  },

  hybrid: {
    layer: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri"
      }
    ),
    labels: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri"
      }
    )
  }
};

function saveBaseMap(type) {
  localStorage.setItem("sfc_selected_basemap", type);
}

function getSavedBaseMap() {
  return localStorage.getItem("sfc_selected_basemap") || "standard";
}

function removeCurrentBaseMap() {
  if (currentBaseMap && map.hasLayer(currentBaseMap)) {
    map.removeLayer(currentBaseMap);
  }

  if (currentLabelLayer && map.hasLayer(currentLabelLayer)) {
    map.removeLayer(currentLabelLayer);
  }

  currentBaseMap = null;
  currentLabelLayer = null;
}

function setBaseMap(type) {
  if (!baseMaps[type]) return;

  removeCurrentBaseMap();

  currentBaseMap = baseMaps[type].layer;
  currentBaseMap.addTo(map);

  if (baseMaps[type].labels) {
    currentLabelLayer = baseMaps[type].labels;
    currentLabelLayer.addTo(map);
  }

  saveBaseMap(type);
  updateBaseMapUI(type);
}

function updateBaseMapUI(activeType) {
  document.querySelectorAll(".map-view-option").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.basemap === activeType);
  });
}

function initBaseMapDropdown() {
  const mapViewBtn = document.getElementById("mapViewBtn");
  const mapViewDropdown = document.getElementById("mapViewDropdown");

  if (!mapViewBtn || !mapViewDropdown) return;

  mapViewBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    mapViewDropdown.classList.toggle("hidden");
  });

  document.querySelectorAll(".map-view-option").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const selected = this.dataset.basemap;
      setBaseMap(selected);
      mapViewDropdown.classList.add("hidden");
      showMapToast("Map view: " + this.textContent);
    });
  });

  document.addEventListener("click", function(e) {
    if (!mapViewDropdown.contains(e.target) && e.target !== mapViewBtn) {
      mapViewDropdown.classList.add("hidden");
    }
  });
}

function initBaseMaps() {
  const saved = getSavedBaseMap();
  setBaseMap(saved);
  initBaseMapDropdown();
}