function findNearestHub(lat,lng){

let nearest = null
let minDistance = Infinity

allHubs.forEach(h=>{

const d = getDistance(lat,lng,h.lat,h.lng)

if(d < minDistance){

minDistance = d
nearest = h

}

})

return nearest

}

function getDistance(lat1,lon1,lat2,lon2){

const R = 6371

const dLat = (lat2-lat1)*Math.PI/180
const dLon = (lon2-lon1)*Math.PI/180

const a =
Math.sin(dLat/2)*Math.sin(dLat/2) +
Math.cos(lat1*Math.PI/180) *
Math.cos(lat2*Math.PI/180) *
Math.sin(dLon/2)*Math.sin(dLon/2)

const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))

return R*c

}

function locateAndOpenNearest(){

if(!navigator.geolocation) return

navigator.geolocation.getCurrentPosition(function(pos){

const lat = pos.coords.latitude
const lng = pos.coords.longitude

map.setView([lat,lng],12)

const hub = findNearestHub(lat,lng)

if(hub){

focusHubOnMap(hub,13)

}

})

}