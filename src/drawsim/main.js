import {getStore} from "../utils"
import {Url} from "url"

let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))

let image = searchParams.get('img')
if (!image) image = prompt("Enter image url:","")
let edit = searchParams.get('mode') == "edit"
let scale = searchParams.get('scale') || 1.0
let tool = searchParams.get('tool') || "vectors"

createjs.MotionGuidePlugin.install()

function dist(p1,p2) { 
	let dx = p1.x - p2.x, dy = p1.y - p2.y
	return Math.sqrt(dx*dx + dy*dy)
}

function getSymbols() {
	let symbols = store.get(image)
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


class Vector extends createjs.Container {
	static showSymbol(stage,json) {
		let map = new createjs.Bitmap(json.img)
		map.x = json.pt.x
		map.y = json.pt.y
		map.regX = 12
		map.regY = 12
    	map.rotation = json.rot
    	map.cursor = "not-allowed"
		map.addEventListener("click", e => {
			removeSymbol(json)
			map.stage.removeChild(map)
		})
		stage.addChild(map)
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.img != json2.img) return false
		if (json1.pt.x != json2.pt.x) return false
		if (json1.pt.y != json2.pt.y) return false
		return true
	}
	
	constructor(x,rot,img,drawsim) {
		super()
		this.x = x
		this.y = 0
		this.img = img
		this.rot = rot
		let select = new createjs.Shape()
		select.graphics.beginFill("#CCC").drawRoundRect(0,0,26,26,2,2,2,2).endStroke()
		this.addChild(select)
		let map = new createjs.Bitmap(img)
		map.x = 13
		map.y = 13
		map.regX = 12
		map.regY = 12
    	map.rotation = rot
    	this.setBounds(x,0,26,26)
    	this.addChild(map)
		select.alpha = 0
		this.addEventListener("mouseover", e => select.alpha = 0.5)
		this.addEventListener("mouseout", e => select.alpha = 0)
		this.addEventListener("click", e => drawsim.toolbar.select(this))
	}
	
	toJSON(x,y) {
		return {type:"vector", img: this.img, rot: this.rot, pt:{x:x,y:y}}
	}		
}

class PressureRegion extends createjs.Container {
	static showSymbol(stage,json) {
		let region = new createjs.Container()
		let txt = new createjs.Text(json.high?"H":"L","bold 24px Arial",json.high?"#00F":"#F00")
		txt.x = json.pt.x - 12
		txt.y = json.pt.y - 12
		let circle = new createjs.Shape()
		circle.graphics.beginFill(json.high?"#0F0":"#FF0").drawCircle(json.pt.x,json.pt.y,24).endFill()
		circle.alpha = 0.5
		region.addChild(circle)
		region.addChild(txt)
		region.addEventListener("click", e => {
			removeSymbol(json)
			region.stage.removeChild(region)
		})
    	region.cursor = "not-allowed"
		stage.addChild(region)
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.high != json2.high) return false
		if (json1.pt.x != json2.pt.x) return false
		if (json1.pt.y != json2.pt.y) return false
		return true
	}
	
	constructor(x,high,drawsim) {
		super()
		this.high = high
		let txt = new createjs.Text(high?"H":"L","bold 24px Arial",high?"#00F":"#F00")
		txt.x = x + 2
		txt.y = 2
		let select = new createjs.Shape()
		select.graphics.beginFill("#CCC").drawRoundRect(x,0,26,26,2,2,2,2).endStroke()
		this.addChild(select)
		let circle = new createjs.Shape()
		circle.graphics.beginFill(high?"#0F0":"#FF0").drawCircle(x+12,12,13).endFill()
		circle.alpha = 0.3
		this.addChild(circle,txt)
    	this.setBounds(x,0,26,26)
		select.alpha = 0
		this.addEventListener("mouseover", e => select.alpha = 0.5)
		this.addEventListener("mouseout", e => select.alpha = 0)
		this.addEventListener("click", e => drawsim.toolbar.select(this))
	}

	toJSON(x,y) {
		return {type:"region", high: this.high, pt:{x:x,y:y}}
	}		
}

class Pressures extends createjs.Container {
	constructor(x,drawsim) {
		super()
		this.x = x
		this.y = 2
		for (let i = 0; i < 8; i++) {
			let v = new Vector(x,45*i,"assets/left-arrow.png",drawsim)
			this.addChild(v)
			x += 30
		}
		this.addChild(new PressureRegion(x,true,drawsim))
		x += 30
		this.addChild(new PressureRegion(x,false,drawsim))
		x += 30
	}
	
	getLength() { return 10*30+2 }

	getInst() {
		return "<p>Click location and select a vector or region to add. Click vector or region to delete.</p>"
	}
}

class Airmass extends createjs.Container {
	static showSymbol(stage,json) {
		let airmass = new createjs.Container()
		airmass.x = json.pt.x
		airmass.y = json.pt.y
		let circle = new createjs.Shape()
		circle.graphics.beginFill("#FFF").beginStroke("#000").drawCircle(14,14,14).endStroke()
		airmass.addChild(circle)
		let txt = new createjs.Text(json.name,"12px Arial","#000")
		txt.x = 6
		txt.y = 10
		airmass.addChild(txt)
    	airmass.cursor = "not-allowed"
			airmass.addEventListener("click", e => {
			removeSymbol(json)
			airmass.stage.removeChild(airmass)
		})
    	stage.addChild(airmass)
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.name != json2.name) return false
		if (json1.pt.x != json2.pt.x) return false
		if (json1.pt.y != json2.pt.y) return false
		return true
	}
	
	constructor(x,name,drawsim) {
		super()
		this.x = x
		this.y = 2
		this.name = name
		let circle = new createjs.Shape()
		circle.graphics.beginFill("#FFF").beginStroke("#000").drawCircle(14,14,14).endStroke()
		this.addChild(circle)
		let txt = new createjs.Text(name,"12px Arial","#000")
		txt.x = 6
		txt.y = 10
		this.addChild(txt)
		let select = new createjs.Shape()
		select.graphics.beginFill("#CCC").drawCircle(14,14,14).endStroke()
		this.addChild(select)
		select.alpha = 0
		this.addEventListener("mouseover", e => {
			select.alpha = 0.5
		})
		this.addEventListener("mouseout", e => {
			select.alpha = 0
		})
		this.addEventListener("click", e => {
			drawsim.toolbar.select(this)
		})
	}
	
	toJSON(x,y) {
		return {type:"airmass", name: this.name, pt:{x:x,y:y}}
	}		
}

class Airmasses extends createjs.Container {
	constructor(x,toolbar) {
		super()
		let masses = ["cP","mP","cT","mT","cE","mE","cA","mA"]
		masses.forEach(name => {
			this.addChild(new Airmass(x,name,toolbar))
			x += 30
		})
	}
	
	getLength() { return 8*30+2 }

	getInst() {
		return "<p>Click location and select airmass to add. Click airmass to delete.</p>"
	}
}

class IsoPath {
	static showSymbol(stage,json) {
		let pts = json.pts
		let path = new createjs.Container()
		let shape = new createjs.Shape()
	    shape.graphics.beginStroke("#00F")
		let oldX = pts[0].x
		let oldY = pts[0].y
		let oldMidX = oldX
		let oldMidY = oldY
	    json.pts.forEach(pt => {
			let midPoint = new createjs.Point(oldX + pt.x >> 1, oldY+pt.y >> 1)
	        shape.graphics.setStrokeStyle(4).moveTo(midPoint.x, midPoint.y)
	        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY)
	        oldX = pt.x
	        oldY = pt.y
	        oldMidX = midPoint.x
	        oldMidY = midPoint.y
	    })
		path.addChild(shape)
		let first = pts[0], last = pts[pts.length-1]
		let label = IsoPath.getLabel(json.value,first.x - 10,first.y + (first.y < last.y? -24: 0))
		label.addEventListener("click", e => {
			removeSymbol(json)
			stage.removeChild(path)
		})
		path.addChild(label)
		if (dist(first,last) > 10) {
			let label = IsoPath.getLabel(json.value,last.x - 10,last.y + (first.y < last.y? 0 : -24))
			label.addEventListener("click", e => {
				removeSymbol(json)
				stage.removeChild(path)
			})
			path.addChild(label)
		}
		stage.addChild(path)
	}
	
	static getLabel(name,x,y) {
		let label = new createjs.Container()
		let txt = new createjs.Text(name,"bold 24px Arial","#00F")
		txt.x = x
		txt.y = y
		let circle = new createjs.Shape()
		circle.graphics.beginFill("#FFF").drawCircle(x + 12,y + 12,20).endFill()
		label.addChild(circle)
		label.addChild(txt)
		return label
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.value != json2.value) return false
		if (json1.pts[0].x != json2.pts[0].x) return false
		if (json1.pts[0].y != json2.pts[0].y) return false
		return true
	}
	
	constructor(back,drawsim) {
		createjs.Ticker.framerate = 10
		this.back = back
		this.mouseDown = false
		drawsim.mainstage.addEventListener("stagemousedown", e => {
			this.currentShape = new createjs.Shape()
		    this.currentShape.graphics.beginStroke("#00F")
			drawsim.mainstage.addChild(this.currentShape)
		    this.oldX = this.oldMidX = e.stageX
		    this.oldY = this.oldMidY = e.stageY
			this.mouseDown = true
			this.pts = []
		})
		drawsim.mainstage.addEventListener("stagemousemove", e => {
			if (this.mouseDown == false) return
	        this.pt = new createjs.Point(e.stageX, e.stageY)
			this.pts = this.pts.concat({x:e.stageX,y:e.stageY})
			let midPoint = new createjs.Point(this.oldX + this.pt.x >> 1, this.oldY+this.pt.y >> 1)
	        this.currentShape.graphics.setStrokeStyle(4).moveTo(midPoint.x, midPoint.y)
	        this.currentShape.graphics.curveTo(this.oldX, this.oldY, this.oldMidX, this.oldMidY)
	        this.oldX = this.pt.x
	        this.oldY = this.pt.y
	        this.oldMidX = midPoint.x
	        this.oldMidY = midPoint.y
		})
		drawsim.mainstage.addEventListener("stagemouseup", e => {
			this.mouseDown = false
			drawsim.mainstage.removeChild(this.currentShape)
			if (this.pts.length < 3) return
			let value = prompt("Enter value:",1)
			if (value) {
				let symbol = {type:"isopath",value: value, pts: this.pts}
				IsoPath.showSymbol(drawsim.mainstage,symbol)
				addSymbol(symbol)
			}
		})
	}
	
	getInst() {
		return "<p>Click and drag to draw line. Supply value when prompted.  Click value to delete.</p>"
	}
}

class Toolbar extends createjs.Container {
	constructor(tool,drawsim) {
		super()
		createjs.Ticker.framerate = 20
		let border = new createjs.Shape()
		this.addChild(border)
		let w = 2
		this.addChild(tool)
		w += tool.getLength()
		this.cancel = new Vector(w,0,"assets/cross.png",drawsim)
		this.cancel.y = 2
		this.addChild(this.cancel)
		w += 30
		this.x = 0
		this.y = -100
		this.w = w
		border.graphics.beginFill("#FFF").beginStroke("#AAA").drawRoundRect(0,0,w,30,5,5,5,5).endStroke()
	}
	
	select(obj) {
		this.y = -100
		if (obj == this.cancel) return
		let json = null
		if (obj instanceof Vector) { 
			json = obj.toJSON(this.e.stageX,this.e.stageY)
			Vector.showSymbol(this.stage,json)
		}
		if (obj instanceof Airmass) {
			json = obj.toJSON(this.e.stageX-14,this.e.stageY-14)
			Airmass.showSymbol(this.stage,json)
		}
		if (obj instanceof PressureRegion) {
			json = obj.toJSON(this.e.stageX,this.e.stageY)
			PressureRegion.showSymbol(this.stage,json)
		}
		addSymbol(json)
		this.stage.setChildIndex( this, this.stage.getNumChildren()-1)
	}
	
	show(e) {
		if (!e.relatedTarget && this.y < 0) {
			this.x = e.stageX - this.w/2
			this.y = e.stageY - 30
			this.e = e
		}
	}
}

class DrawSim {
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
	
	showSymbols() {
		let symbols = getSymbols()
		symbols.forEach(json => {
			switch (json.type) {
			case "vector":
				Vector.showSymbol(this.mainstage,json)
				break
			case "region":
				PressureRegion.showSymbol(this.mainstage,json)
				break
			case "airmass":
				Airmass.showSymbol(this.mainstage,json)
				break
			case "isopath":
				IsoPath.showSymbol(this.mainstage,json)
				break;
			}
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

let drawsim = new DrawSim()
drawsim.run()