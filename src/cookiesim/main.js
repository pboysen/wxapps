import {Graph, getStore} from "../utils"
import {Url} from "url"

let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))

let edit = searchParams.get('mode') == "edit"
let recipe = searchParams.get('recipe') || 1

let cookiedim = {
	control:{w:10.5,h:0.87},
	sugar50:{w:8.7,h:1.78},
	sugar150:{w:11.8,h:0.52},
	allwhite:{w:11.0,h:0.68},
	allbrown:{w:9.9,h:0.98},
	cornsyrup:{w:9.5,h:1.42},
	butter50:{w:9.6,h:0.87},
	butter150:{w:11.9,h:0.70},
	buttermelted:{w:10.4,h:0.82},
	doughrefr:{w:10.2,h:0.82},
	flour50:{w:13.6,h:0.43},
	flour150:{w:7.6,h:1.68},
	flourcake:{w:10.8,h:0.72},
	flourbread:{w:10.2,h:0.88},
	leaveningnone:{w:9.4,h:1.12},
	leaveningsoda:{w:10.4,h:0.77},
	leaveningsodapowder:{w:10.4,h:0.77}
}
	
function getDeleteRow() {
	let td = document.createElement("td")
	td.setAttribute("class","delete_col")
	let img = document.createElement("img")
	img.setAttribute("src","assets/delete.jpg")
	img.setAttribute("class","delete_img")
	img.setAttribute("alt","Delete this result")
	img.setAttribute("title","Delete this result")
	img.addEventListener("click", event => {
		if (confirm("Delete this result?")) {
			// <tr><td><img...
			let node = event.target.parentNode.parentNode
			cookiesim.deleteResult(Array.prototype.indexOf.call(node.parentNode.childNodes,node)-4)
		}
	})
	td.appendChild(img)
	return td
}

function getRow(ingr) {
	let path = "assets/case"+recipe+"/"+ingr+"/"
	let names = ["dough.png","structure.png","top.png","side.png"]
	let tr = document.createElement("tr")
	names.forEach(name => {
		let td = document.createElement("td")
		let img = document.createElement("img")
		img.setAttribute("src",path+name)
		td.appendChild(img)
		if (name == "top.png") {
			let div = document.createElement("div")
			div.appendChild(document.createTextNode("Width: "+cookiedim[ingr].w+"cm"))
			td.appendChild(div)
		}
		if (name == "side.png") {
			let div = document.createElement("div")
			div.appendChild(document.createTextNode("Height: "+cookiedim[ingr].h+"cm"))
			td.appendChild(div)
		}
		tr.appendChild(td)
	})
	tr.appendChild(getDeleteRow())
	return tr
}

function getIngredient() {
	let ingr = null
	let dup = false
	for (let i = 1; i < 5; i++) {
		let v = document.getElementById("ingr"+i).value
		if (v == "Control") continue
		if (ingr) dup = true
		else ingr = v
	}
	if (dup) {
		alert("select only one ingredient.")
		return null
	}
	return ingr
}

function resetIngredients() {
	for (let i = 1; i < 5; i++)
		document.getElementById("ingr"+i).value = "Control"
}

class CookieSim {
	constructor() {
		this.bakeButton = document.getElementById("bake")
		this.bakeButton.addEventListener("click", e => this.bake() )
		this.table = document.getElementById("results").children[0]
		let inst = document.getElementById("instruct")
		inst.innerHTML = "Change one ingredient at a time and click on <strong>Bake</strong> to see the resulting cookie."
		document.getElementById("delete_all").addEventListener("click",e => {
			if (confirm("Delete all results?")) this.deleteResults()
		})
		this.showResults()
	}
	
	bake() {
		let ingr = getIngredient()
		if (ingr) {
			this.addResult(ingr)
			resetIngredients()
		} else
			alert("Select an ingredient value.")
	}
	
	addResult(ingr) {
		this.table.appendChild(getRow(ingr))
		let trials = store.get(recipe)
		if (!trials) trials = []
		store.set(recipe,trials.concat(ingr))
	}

	deleteResult(row) {
		let trials = store.get(recipe)
		// adjust for permanent rows in table
		trials.splice(row,1)
		store.set(recipe,trials)
		this.showResults()
	}
	
	deleteResults() {
		store.set(recipe,[])
		this.showResults()
	}
	
	showResults() {
		for (let i = this.table.children.length-1; i > 1 ; i--) this.table.removeChild(this.table.children[i])
		let trials = store.get(recipe)
		if (trials) {
			trials.forEach(ingr => this.table.appendChild(getRow(ingr)))
		} else
			store.set(recipe,[])
	}
	

}

let cookiesim = new CookieSim()