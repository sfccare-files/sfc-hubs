function handleURLNavigation(){

const params = new URLSearchParams(window.location.search)

if(params.has("hub")){

const name = decodeURIComponent(params.get("hub"))

const hub = allHubs.find(h=>h.name === name)

if(hub){

focusHubOnMap(hub,13)

}

}

if(params.has("lat") && params.has("lng")){

const lat = parseFloat(params.get("lat"))
const lng = parseFloat(params.get("lng"))

map.setView([lat,lng],13)

}

}