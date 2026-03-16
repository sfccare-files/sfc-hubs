let recentHubs = JSON.parse(localStorage.getItem("sfc_recent") || "[]")

function addRecentHub(hub){

recentHubs = recentHubs.filter(h=>h.name !== hub.name)

recentHubs.unshift({
name:hub.name,
district:hub.district,
zone:hub.zone
})

if(recentHubs.length > 5){
recentHubs.pop()
}

localStorage.setItem("sfc_recent",JSON.stringify(recentHubs))

renderRecent()

}

function renderRecent(){

const list = document.getElementById("recentHubList")
const count = document.getElementById("recentHubCount")

if(!list || !count) return

list.innerHTML = ""

count.textContent = recentHubs.length + " hubs"

if(recentHubs.length === 0){

list.innerHTML = `<div class="quick-empty">No recent hubs yet</div>`
return

}

recentHubs.forEach(h=>{

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