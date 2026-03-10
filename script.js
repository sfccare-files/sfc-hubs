// Initialize map
var map = L.map('map').setView([23.6850, 90.3563], 7);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '© OpenStreetMap'
}).addTo(map);

// Marker cluster group
var markers = L.markerClusterGroup();
var hubMarkers = [];

// Load data from Google Sheets CSV
fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv")
.then(response => response.text())
.then(csv => {

const rows = csv.split("\n").slice(1);

rows.forEach(row => {

const cols = row.split(",");

// Skip empty rows
if(cols.length < 10) return;

// Hub object
const hub = {
 name: cols[0],
 hub_id: cols[1],
 zone: cols[2],
 district: cols[3],
 division: cols[4],
 lat: parseFloat(cols[5]),
 lng: parseFloat(cols[6]),
 address: cols[7],
 hub_ip: cols[8],
 hub_phone: cols[9],
 manager: cols[10],
 manager_phone: cols[11],
 assistant_manager: cols[12],
 assistant_manager_phone: cols[13],
 hub_assistant: cols[14],
 hub_assistant_phone: cols[15]
};

// Create marker
var marker = L.marker([hub.lat, hub.lng]);

// Popup HTML
var popup = `
<div class="hub-popup">

<h2 class="title">Hub Details</h2>

<div class="box full"><b>Name:</b> ${hub.name}</div>

<div class="box full"><b>Address:</b> ${hub.address}</div>

<div class="grid2">
<div class="box"><b>Hub ID:</b> ${hub.hub_id}</div>
<div class="box"><b>Zone:</b> ${hub.zone}</div>
</div>

<div class="grid2">
<div class="box"><b>District:</b> ${hub.district}</div>
<div class="box"><b>Division:</b> ${hub.division}</div>
</div>

<div class="box full">
<b>Coordinates:</b> ${hub.lat}, ${hub.lng}
</div>

<hr>

<div class="section">Contact Details</div>

<div class="grid2">
<div class="box"><b>Hub IP:</b> ${hub.hub_ip}</div>
<div class="box"><b>Hub Phone:</b> ${hub.hub_phone}</div>
</div>

<div class="grid2">
<div class="box"><b>Manager:</b> ${hub.manager}</div>
<div class="box"><b>Phone:</b> ${hub.manager_phone}</div>
</div>

<div class="grid2">
<div class="box"><b>Asst. Manager:</b> ${hub.assistant_manager}</div>
<div class="box"><b>Phone:</b> ${hub.assistant_manager_phone}</div>
</div>

<div class="grid2">
<div class="box"><b>Hub Asst:</b> ${hub.hub_assistant}</div>
<div class="box"><b>Phone:</b> ${hub.hub_assistant_phone}</div>
</div>

<hr>

<div style="text-align:center;">
<a class="direction-btn"
target="_blank"
href="https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}">
Get Directions
</a>
</div>

</div>
`;

// Bind popup with responsive width
marker.bindPopup(popup,{
 maxWidth:350,
 minWidth:280
});

// Store hub name for search
marker.hubName = hub.name.toLowerCase();

// Add to cluster
markers.addLayer(marker);
hubMarkers.push(marker);

});

// Add markers to map
map.addLayer(markers);

});

// Search functionality
document.getElementById("searchBox").addEventListener("keyup",function(){

var value = this.value.toLowerCase();

hubMarkers.forEach(marker=>{

 if(marker.hubName.includes(value)){
  map.setView(marker.getLatLng(),12);
  marker.openPopup();
 }

});

});