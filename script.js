// =========================
// MAP INIT
// =========================
var map = L.map('map').setView([23.6850, 90.3563], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

var markers = L.markerClusterGroup();
var allHubs = [];

// =========================
// LIVE TIME
// =========================
function updateDateTime(){
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  document.getElementById('liveDateTime').textContent =
    now.toLocaleString('en-US', options);
}
updateDateTime();
setInterval(updateDateTime, 1000);

// =========================
// GOOGLE SHEET CSV
// =========================
const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv";

// =========================
// LOAD DATA
// =========================
Papa.parse(sheetURL, {
  download: true,
  header: true,
  complete: function(results) {
    const hubs = results.data;

    hubs.forEach(hub => {
      if (!hub.lat || !hub.lng) return;

      const lat = parseFloat(hub.lat);
      const lng = parseFloat(hub.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng]);

      const popup = `
        <div class="hub-popup">
          <h2 class="title">Hub Details</h2>

          <div class="box"><b>Name:</b> ${hub.name || ""}</div>
          <div class="box"><b>Address:</b> ${hub.address || ""}</div>

          <div class="grid2">
            <div class="box"><b>Hub ID:</b> ${hub.hub_id || ""}</div>
            <div class="box"><b>Zone:</b> ${hub.zone || ""}</div>
          </div>

          <div class="grid2">
            <div class="box"><b>District:</b> ${hub.district || ""}</div>
            <div class="box"><b>Division:</b> ${hub.division || ""}</div>
          </div>

          <div class="box"><b>Coordinates:</b> ${lat}, ${lng}</div>

          <hr>

          <div class="section">Contact Details</div>

          <div class="grid2">
            <div class="box"><b>Hub IP:</b> ${hub.hub_ip || ""}</div>
            <div class="box"><b>Hub Phone:</b> ${hub.hub_phone || ""}</div>
          </div>

          <div class="grid2">
            <div class="box"><b>Manager:</b> ${hub.manager || ""}</div>
            <div class="box"><b>Phone:</b> ${hub.manager_phone || ""}</div>
          </div>

          <div class="grid2">
            <div class="box"><b>Asst. Manager:</b> ${hub.assistant_manager || ""}</div>
            <div class="box"><b>Phone:</b> ${hub.assistant_manager_phone || ""}</div>
          </div>

          <div class="grid2">
            <div class="box"><b>Hub Asst:</b> ${hub.hub_assistant || ""}</div>
            <div class="box"><b>Phone:</b> ${hub.hub_assistant_phone || ""}</div>
          </div>

          <hr>

          <div style="text-align:center;">
            <button class="direction-btn" onclick="openDirections(${lat},${lng})">
              📍 Get Directions
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popup, {
        maxWidth: 360,
        minWidth: 360,
        className: "custom-popup"
      });

      markers.addLayer(marker);

      allHubs.push({
        name: hub.name || "",
        zone: hub.zone || "",
        district: hub.district || "",
        division: hub.division || "",
        marker: marker
      });
    });

    map.addLayer(markers);
    renderHubList(allHubs);
    renderMiniLists(allHubs);
  }
});

// =========================
// SIDEBAR RENDER
// =========================
function renderHubList(hubs){
  const hubList = document.getElementById("hubList");
  hubList.innerHTML = "";

  if(hubs.length === 0){
    hubList.innerHTML = `<div class="hub-item">No hubs found</div>`;
    return;
  }

  hubs.forEach(hub => {
    const item = document.createElement("div");
    item.className = "hub-item";

    item.innerHTML = `
      <span class="hub-link">▣ ${hub.name}</span>
    `;

    item.addEventListener("click", function(){
      map.setView(hub.marker.getLatLng(), 12);
      hub.marker.openPopup();
    });

    hubList.appendChild(item);
  });
}

function renderMiniLists(hubs){
  const zones = [...new Set(hubs.map(h => h.zone).filter(Boolean))].sort();
  const districts = [...new Set(hubs.map(h => h.district).filter(Boolean))].sort();
  const divisions = [...new Set(hubs.map(h => h.division).filter(Boolean))].sort();

  document.getElementById("zoneList").innerHTML =
    zones.map(z => `<div class="mini-item">▣ ${z}</div>`).join("");

  document.getElementById("districtList").innerHTML =
    districts.map(d => `<div class="mini-item">▣ ${d}</div>`).join("");

  document.getElementById("divisionList").innerHTML =
    divisions.map(d => `<div class="mini-item">▣ ${d}</div>`).join("");
}

// =========================
// SEARCH
// =========================
document.getElementById("searchBox").addEventListener("keyup", function(){
  const value = this.value.toLowerCase().trim();

  const filtered = allHubs.filter(hub =>
    hub.name.toLowerCase().includes(value)
  );

  renderHubList(filtered);
});

// =========================
// DIRECTIONS
// =========================
function openDirections(lat, lng){
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
}