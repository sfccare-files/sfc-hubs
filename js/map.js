var DEFAULT_MAP_CENTER = [23.6850, 90.3563];
var DEFAULT_MAP_ZOOM = 7;

var map = L.map("map").setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

var markers = L.markerClusterGroup({
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  removeOutsideVisibleBounds: true,
  animate: true,
  animateAddingMarkers: true,
  maxClusterRadius: 45
});

var hubMarkers = [];
var allHubs = [];
var activePulseMarker = null;
var userLocationMarker = null;
var lastKnownUserLocation = null;
var toastTimer = null;

map.addLayer(markers);

function hasLoadedHubs() {
  return Array.isArray(allHubs) && allHubs.length > 0;
}

function updateVisibleMarkers(filteredHubs) {
  markers.clearLayers();

  if (!Array.isArray(filteredHubs) || filteredHubs.length === 0) {
    return;
  }

  filteredHubs.forEach(function(hub) {
    if (hub && hub.marker) {
      markers.addLayer(hub.marker);
    }
  });
}

function fitMapToFilteredHubs(filteredHubs) {
  if (!Array.isArray(filteredHubs) || filteredHubs.length === 0) return;

  if (filteredHubs.length === 1) {
    map.flyTo(filteredHubs[0].marker.getLatLng(), 12, {
      duration: 0.8
    });
    return;
  }

  const group = L.featureGroup(
    filteredHubs
      .filter(function(hub) {
        return hub && hub.marker;
      })
      .map(function(hub) {
        return hub.marker;
      })
  );

  if (!group.getLayers().length) return;

  map.flyToBounds(group.getBounds(), {
    padding: [30, 30],
    duration: 0.8
  });
}

function focusHubOnMap(hub, zoomLevel) {
  if (!hub || !hub.marker) return;

  if (typeof setActiveSelection === "function") {
    setActiveSelection("hub", hub.name);
  } else if (typeof activeSelection !== "undefined") {
    activeSelection.type = "hub";
    activeSelection.value = hub.name;
  }

  addRecentHub(hub);

  if (typeof renderTrees === "function") {
    renderTrees();
  }

  map.flyTo(hub.marker.getLatLng(), zoomLevel || 12, {
    duration: 0.8
  });

  setTimeout(function() {
    showHubDetailsPanel(hub);
    pulseMarker(hub.marker);
    scrollToHubTreeItem(hub.name);

    if (lastKnownUserLocation) {
      const distance = getDistanceKm(
        lastKnownUserLocation.lat,
        lastKnownUserLocation.lng,
        hub.marker.getLatLng().lat,
        hub.marker.getLatLng().lng
      );

      showMapToast("Distance to " + hub.name + ": " + distance.toFixed(2) + " km");
    }
  }, 350);
}

function pulseMarker(marker) {
  if (!marker || !marker._icon) return;

  if (activePulseMarker && activePulseMarker._icon) {
    activePulseMarker._icon.classList.remove("selected-hub-marker");
  }

  activePulseMarker = marker;
  marker._icon.classList.add("selected-hub-marker");

  setTimeout(function() {
    if (marker && marker._icon) {
      marker._icon.classList.remove("selected-hub-marker");
    }
  }, 3000);
}

function getCurrentHubDistance(lat, lng) {
  if (!lastKnownUserLocation) return "";

  const distance = getDistanceKm(
    lastKnownUserLocation.lat,
    lastKnownUserLocation.lng,
    lat,
    lng
  );

  return distance.toFixed(2) + " km";
}

function showHubDetailsPanel(hub) {
  const panel = document.getElementById("hubDetailsPanel");
  const content = document.getElementById("hubDetailsContent");
  const overlay = document.getElementById("mapOverlay");

  if (!panel || !content || !hub) return;

  const latLng = hub.marker ? hub.marker.getLatLng() : null;
  if (!latLng) return;

  const distanceFromUser = getCurrentHubDistance(latLng.lat, latLng.lng);

  content.innerHTML = buildPopup(
    hub.raw || hub,
    latLng.lat,
    latLng.lng,
    distanceFromUser
  );

  panel.classList.remove("hidden");

  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function hideHubDetailsPanel() {
  const panel = document.getElementById("hubDetailsPanel");
  const overlay = document.getElementById("mapOverlay");

  if (panel) {
    panel.classList.add("hidden");
  }

  if (overlay) {
    overlay.classList.add("hidden");
  }
}

function resetMapView() {
  hideHubDetailsPanel();

  if (typeof activeSelection !== "undefined") {
    activeSelection.type = "";
    activeSelection.value = "";
  }

  map.flyTo(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, {
    duration: 0.8
  });

  if (typeof renderTrees === "function") {
    renderTrees();
  }

  if (typeof hideHeatmap === "function") {
    hideHeatmap();
  }

  if (typeof mapLayerState !== "undefined") {
    mapLayerState.heatmapEnabled = false;
  }

  if (typeof setHeatmapButtonState === "function") {
    setHeatmapButtonState(false);
  }
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestHub(lat, lng) {
  if (!hasLoadedHubs()) return null;

  let nearestHub = null;
  let nearestDistance = Infinity;

  allHubs.forEach(function(hub) {
    if (!hub || !hub.marker) return;

    const hubLat = hub.marker.getLatLng().lat;
    const hubLng = hub.marker.getLatLng().lng;
    const distance = getDistanceKm(lat, lng, hubLat, hubLng);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestHub = hub;
    }
  });

  if (!nearestHub) return null;

  return {
    hub: nearestHub,
    distance: nearestDistance
  };
}

function clearUserLocationMarker() {
  if (userLocationMarker && map.hasLayer(userLocationMarker)) {
    map.removeLayer(userLocationMarker);
  }
}

function setUserLocationMarker(lat, lng) {
  clearUserLocationMarker();

  userLocationMarker = L.circleMarker([lat, lng], {
    radius: 8,
    weight: 3,
    color: "#169f64",
    fillColor: "#22c27a",
    fillOpacity: 0.9
  }).addTo(map);
}

function getGeolocationErrorMessage(error) {
  if (!error || typeof error.code === "undefined") {
    return "Unable to get your location.";
  }

  if (error.code === 1) {
    return "Location permission denied.";
  }

  if (error.code === 2) {
    return "Location information is unavailable.";
  }

  if (error.code === 3) {
    return "Location request timed out.";
  }

  return "Unable to get your location.";
}

function goToMyLocation() {
  if (!navigator.geolocation) {
    showMapToast("Location is not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      lastKnownUserLocation = { lat: lat, lng: lng };
      setUserLocationMarker(lat, lng);

      map.flyTo([lat, lng], 13, {
        duration: 0.8
      });

      if (!hasLoadedHubs()) {
        showMapToast("Your location found, but no hub data is loaded.");
        return;
      }

      const nearestData = findNearestHub(lat, lng);

      if (nearestData && nearestData.hub) {
        showMapToast(
          "Your location found. Nearest hub is " +
            nearestData.hub.name +
            " (" +
            nearestData.distance.toFixed(2) +
            " km)"
        );
      } else {
        showMapToast("Your location found.");
      }

      if (
        typeof activeSelection !== "undefined" &&
        activeSelection.type === "hub" &&
        activeSelection.value
      ) {
        const activeHub = allHubs.find(function(hub) {
          return hub.name === activeSelection.value;
        });

        if (activeHub) {
          showHubDetailsPanel(activeHub);
        }
      }
    },
    function(error) {
      showMapToast(getGeolocationErrorMessage(error));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

function goToNearestHub() {
  if (!hasLoadedHubs()) {
    showMapToast("No hub data is available.");
    return;
  }

  function openNearestFromLocation(lat, lng) {
    const nearestData = findNearestHub(lat, lng);

    if (nearestData && nearestData.hub) {
      focusHubOnMap(nearestData.hub, 13);
      showMapToast(
        "Nearest hub: " +
          nearestData.hub.name +
          " (" +
          nearestData.distance.toFixed(2) +
          " km)"
      );
    } else {
      showMapToast("No hub found.");
    }
  }

  if (lastKnownUserLocation) {
    openNearestFromLocation(lastKnownUserLocation.lat, lastKnownUserLocation.lng);
    return;
  }

  if (!navigator.geolocation) {
    showMapToast("Location is not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      lastKnownUserLocation = { lat: lat, lng: lng };
      setUserLocationMarker(lat, lng);
      openNearestFromLocation(lat, lng);
    },
    function(error) {
      showMapToast(getGeolocationErrorMessage(error));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

function showMarkerHover(hub, originalEvent) {
  if (window.innerWidth <= 768) return;

  const card = document.getElementById("markerHoverCard");
  if (!card || !hub || !originalEvent) return;

  const point = map.mouseEventToContainerPoint(originalEvent);
  const mapSize = map.getSize();

  let left = point.x + 16;
  let top = point.y - 14;

  if (left > mapSize.x - 190) {
    left = point.x - 190;
  }

  if (top > mapSize.y - 90) {
    top = mapSize.y - 90;
  }

  if (top < 10) {
    top = 10;
  }

  card.style.left = left + "px";
  card.style.top = top + "px";

  card.innerHTML =
    '<div class="marker-hover-title">' + (hub.name || "") + "</div>" +
    '<div class="marker-hover-meta">' +
      (hub.district || "-") + " • " + (hub.division || "-") +
    "</div>" +
    '<div class="marker-hover-meta">Police Station: ' + (hub.police_station || "-") + "</div>";

  card.classList.remove("hidden");
}

function hideMarkerHover() {
  const card = document.getElementById("markerHoverCard");
  if (!card) return;
  card.classList.add("hidden");
}

function showMapToast(message) {
  const toast = document.getElementById("mapToast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.classList.add("hidden");
  }, 2400);
}