function saveMapSession(){

const center = map.getCenter()

localStorage.setItem("sfc_map_center",JSON.stringify(center))
localStorage.setItem("sfc_map_zoom",map.getZoom())

}

function restoreMapSession(){

const center = localStorage.getItem("sfc_map_center")
const zoom = localStorage.getItem("sfc_map_zoom")

if(center && zoom){

const c = JSON.parse(center)

map.setView(c,parseInt(zoom))

}

}

window.addEventListener("beforeunload",saveMapSession)