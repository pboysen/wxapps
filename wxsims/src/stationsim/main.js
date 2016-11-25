import {getStore} from "../utils"
import {Url} from "url"

let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))

let edit = searchParams.get('mode') == "edit"
let title = searchParams.get('title') || "missing title"

createjs.MotionGuidePlugin.install()

function dist(p1,p2) { 
	let dx = p1.x - p2.x, dy = p1.y - p2.y
	return Math.sqrt(dx*dx + dy*dy)
}

function getSymbols() {
	let symbols = store.get(title)
	if (!symbols) {
		symbols = []
		store.set(image,symbols)
	}
	return symbols
}

function addSymbol(symbol) {
	let symbols = getSymbols()
	store.set(image,symbols.concat(symbol))
}

function removeSymbol(symbol) {
	let symbols = getSymbols()
	for (let i = 0; i < symbols.length; i++) {
		let json = symbols[i]
		switch (json.type) {
		case "vector":
			if (Vector.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image,symbols)
				return
			}
			break
		case "region":
			if (PressureRegion.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image,symbols)
				return
			}
			break
		case "airmass":
			if (Airmass.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image,symbols)
				return
			}
			break
		case "isopath":
			if (IsoPath.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image,symbols)
				return
			}
			break;
		}
	}
}

function deleteSymbols() {
	store.set(image,[])
}


class StationSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		createjs.Touch.enable(this.mainstage)
		let back = new createjs.Bitmap(image)
		back.x = 40
		back.y = 40
		this.mainstage.addChild(back)
		back.onload = function() {
			let bnd = back.getBounds()
			this.mainstage.canvas.width = bnd.width + 40
			this.mainstage.canvas.height = bnd.height + 40
			let panel = document.getElementById("panel")
			panel.width = bnd.width + 40
		}
		this.showSymbols()
		if (edit) {
			this.mainstage.enableMouseOver()
			let inst = document.getElementById("instruct")
			switch (tool) {
			case "pressure":
				let pressures = new Pressures(2,this)
				this.toolbar = new Toolbar(pressures,this)
				inst.innerHTML = pressures.getInst()
				back.addEventListener("mousedown", e => this.toolbar.show(e))
				this.mainstage.addChild(this.toolbar)
				break
			case "airmass":
				let airmasses = new Airmasses(2,this)
				this.toolbar = new Toolbar(airmasses,this)
				inst.innerHTML = airmasses.getInst()
				back.addEventListener("mousedown", e => this.toolbar.show(e))
				this.mainstage.addChild(this.toolbar)
				break
			case "isopath":
				this.isopath = new IsoPath(back,this)
				inst.innerHTML = this.isopath.getInst()
				break
			}
		}
		// handle download
		let dl = document.getElementById("download")
		dl.addEventListener("click", e => {
			let dt = this.mainstage.canvas.toDataURL('image/png')
			/* Change MIME type to trick the browser to downlaod the file instead of displaying it */
			dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
			/* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
			dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=map.png');
			dl.href = dt;
		})
	}
	
	run() {
		let tick = 0
		createjs.Ticker.addEventListener("tick", e => {
			this.mainstage.update()
			tick++
		})
	}
}

(new StationSim()).run()