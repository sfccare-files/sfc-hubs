let activeSelection = {
type: "",
value: ""
}

function setActiveSelection(type,value){

activeSelection.type = type
activeSelection.value = value

localStorage.setItem("sfc_last_selection",JSON.stringify(activeSelection))

updateSelectedHubLabel()

}

function restoreSelection(){

const saved = localStorage.getItem("sfc_last_selection")

if(!saved) return

const data = JSON.parse(saved)

activeSelection = data

if(data.type === "hub"){

const hub = allHubs.find(h=>h.name===data.value)

if(hub){
focusHubOnMap(hub,12)
}

}

}

function updateSelectedHubLabel(){

const label = document.getElementById("selectedHubLabel")

if(!label) return

if(activeSelection.type === "hub"){
label.textContent = activeSelection.value
}else{
label.textContent = "None selected"
}

}