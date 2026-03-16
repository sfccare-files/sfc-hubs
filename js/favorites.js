let favoriteHubs = JSON.parse(localStorage.getItem("sfc_favorites") || "[]")

function toggleFavoriteHub(hub){

const index = favoriteHubs.findIndex(h=>h.name === hub.name)

if(index > -1){

favoriteHubs.splice(index,1)

}else{

favoriteHubs.push({
name:hub.name,
district:hub.district,
zone:hub.zone
})

}

localStorage.setItem("sfc_favorites",JSON.stringify(favoriteHubs))

renderFavorites()

}

function renderFavorites(){

const list = document.getElementById("favoriteHubList")
const count = document.getElementById("favoriteHubCount")

if(!list || !count) return

list.innerHTML = ""

count.textContent = favoriteHubs.length + " hubs"

if(favoriteHubs.length === 0){

list.innerHTML = `<div class="quick-empty">No favorite hubs yet</div>`
return

}

favoriteHubs.forEach(h=>{

const el = document.createElement("div")
el.className = "quick-list-item"

el.innerHTML = `
<div class="quick-list-item-name">${h.name}</div>
<div class="quick-list-item-meta">${h.district}</div>
`

el.onclick = function(){

const hub = allHubs.find(x=>x.name === h.name)

if(hub){
focusHubOnMap(hub,12)
}

}

list.appendChild(el)

})

}