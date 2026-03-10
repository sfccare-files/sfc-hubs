var map = L.map('map').setView([23.6850, 90.3563], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
 attribution:'© OpenStreetMap'
}).addTo(map);

var markers = L.markerClusterGroup();

var hubMarkers = [];

fetch("hubs.json")
.then(response => response.json())
.then(data => {

data.forEach(hub => {

var marker = L.marker([hub.lat,hub.lng]);

var popupContent = `
<b>${hub.name}</b><br>
Address: ${hub.address}<br>
Hub Phone: ${hub.hub_phone}<br>
Manager: ${hub.manager}<br>
Manager Phone: ${hub.manager_phone}<br><br>

<a target="_blank"
href="https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}">
Get Directions
</a>
`;

marker.bindPopup(popupContent);

marker.hubName = hub.name.toLowerCase();

markers.addLayer(marker);

hubMarkers.push(marker);

});

map.addLayer(markers);

});

document.getElementById("searchBox").addEventListener("keyup",function(){

var value = this.value.toLowerCase();

hubMarkers.forEach(marker=>{

if(marker.hubName.includes(value)){

map.setView(marker.getLatLng(),12);

marker.openPopup();

}

});

});