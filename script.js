// Initialize map
var map = L.map('map').setView([23.6850, 90.3563], 7);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
 attribution:'© OpenStreetMap'
}).addTo(map);

// Marker cluster
var markers = L.markerClusterGroup();
var hubMarkers = [];

// Google Sheet CSV
const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSYDLFsB6QUf0Vf0kL-COmVR3eh0jXOLnBG1r6stjL7hVf8-kvpV-KjCAv9R9QKAO0C6E00XGfw7I0q/pub?output=csv";

// Parse CSV
Papa.parse(sheetURL,{
 download:true,
 header:true,

 complete:function(results){

 const hubs = results.data;

 hubs.forEach(hub=>{

 if(!hub.lat || !hub.lng) return;

 const lat = parseFloat(hub.lat);
 const lng = parseFloat(hub.lng);

 if(isNaN(lat) || isNaN(lng)) return;

 var marker = L.marker([lat,lng]);

 var popup = `
 <div class="hub-popup">

 <h2 class="title">Hub Details</h2>

 <div class="box"><b>Name:</b> ${hub.name}</div>

 <div class="box"><b>Address:</b> ${hub.address}</div>

 <div class="grid2">
 <div class="box"><b>Hub ID:</b> ${hub.hub_id}</div>
 <div class="box"><b>Zone:</b> ${hub.zone}</div>
 </div>

 <div class="grid2">
 <div class="box"><b>District:</b> ${hub.district}</div>
 <div class="box"><b>Division:</b> ${hub.division}</div>
 </div>

 <div class="box">
 <b>Coordinates:</b> ${lat}, ${lng}
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
 <button class="direction-btn"
 onclick="openDirections(${lat},${lng})">
 📍 Get Directions
 </button>
 </div>

 </div>
 `;

 marker.bindPopup(popup,{
 maxWidth:360,
 minWidth:360,
 className:"custom-popup"
 });

 marker.hubName = (hub.name || "").toLowerCase();

 markers.addLayer(marker);
 hubMarkers.push(marker);

 });

 map.addLayer(markers);

 }
});

// Search function
document.getElementById("searchBox").addEventListener("keyup",function(){

var value = this.value.toLowerCase();

hubMarkers.forEach(marker=>{

 if(marker.hubName.includes(value)){
  map.setView(marker.getLatLng(),12);
  marker.openPopup();
 }

});

});

// Google Maps direction
function openDirections(lat,lng){

const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

window.open(url,"_blank");

}