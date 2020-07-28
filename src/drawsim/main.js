import {getStore} from "../utils"   
import {Url} from "url" 
 
let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))
 
let image = searchParams.get('img')
if (!image) image = prompt("Enter image url:","")
let transform = searchParams.get('transform') || "false"
let edit = searchParams.get('mode') == "edit"
let scale = searchParams.get('scale') || 1.0
let tool = searchParams.get('tool') || "pressure"
let ex = searchParams.get('ex') || ""
let width = searchParams.get('w') || 20
let height = searchParams.get('h') || 20
let opt = searchParams.get('opt') || "all"

let linetypes = {
	dry:{w:1,c:"#000"},
	highT:{w:1,c:"#F00"},
	highTd:{w:1,c:"#0F0"},
	jet850:{w:5,c:"#F00"},
	jet300:{w:5,c:"#800080"}
}

let linetype = "dry" 
let linetypeButton = null

createjs.MotionGuidePlugin.install()

//Lines with symbols for a dry line, moisture axis, thermal ridge, low level jet and upper level jet 

function dist(p1,p2) { 
	let dx = p1.x - p2.x, dy = p1.y - p2.y
	return Math.sqrt(dx*dx + dy*dy)
}

function angle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function componentToHex(c) {
	  var hex = c.toString(16);
	  return hex.length == 1 ? "0" + hex : hex;
	}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getMid(start, end) {
	let mid = Math.abs((end - start) / 2);
	return (start < end) ? start + mid : end + mid;
}

var descIsOpen = false;

function getDesc(pt, json, cb) {
	descIsOpen = true;
	var editor = document.getElementById("editor");
	editor.style.left = pt.x + "px";
	editor.style.top = pt.y + "px";
	editor.style.visibility = "visible";
	document.getElementById("desc_editor").value = json.desc;
	document.getElementById("save").addEventListener('click',function () {
		descIsOpen = false;
		json.desc = document.getElementById("desc_editor").value;
		editor.style.visibility = "hidden";
		cb();
	});
}

function getSymbols() {
	let symbols = store.get(image+ex)
	if (!symbols) {
		symbols = []
		store.set(image+ex,symbols)
	}
	return symbols
}

function addSymbol(symbol) {
	let symbols = getSymbols()
	store.set(image+ex,symbols.concat(symbol))
}

function removeSymbol(symbol) {
	let symbols = getSymbols()
	for (let i = 0; i < symbols.length; i++) {
		let json = symbols[i]
		switch (json.type) {
		case "vector":
			if (Vector.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break
		case "region":
			if (PressureRegion.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break
		case "airmass":
			if (Airmass.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break
		case "isopleth":
			if (IsoPleth.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break
		case "line":
			if (Line.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break;
		case "ellipse":
			if (Ellipse.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break;
		case "field":
			if (Field.isSame(symbol,symbols[i])) {
				symbols.splice(i,1)
				store.set(image+ex,symbols)
				return
			}
			break;
		}
	}
}

function deleteSymbols() {
	store.set(image+ex,[])
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

	getLength() { return 2*30+2 }

	getInst() {
		return "<p>Click location and select an icon to add. Click icon in map to delete.</p>"
	}
}

class Pressures extends createjs.Container {
	constructor(x,drawsim) {
		super()
		this.x = x
		this.y = 2
		if (opt == "all" || opt == "arrows")
			for (let i = 0; i < 8; i++) {
				let v = new Vector(x,45*i,"assets/left-arrow.png",drawsim)
				this.addChild(v)
				x += 30
			}
		if (opt == "all" || opt == "hl") {
			this.addChild(new PressureRegion(x,true,drawsim))
			x += 30
			this.addChild(new PressureRegion(x,false,drawsim))
			x += 30
		}
	}
	
	getLength() {
		let n = opt == "all"?10:opt == "arrows"?8:2
		return n*30+2 
	}

	getInst() {
		return "<p>Click location and select an icon to add. Click icon in map to delete.</p>"
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

class IsoPleth {
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
		let label = IsoPleth.getLabel(json.value,first.x - 10,first.y + (first.y < last.y? -24: 0))
    	label.cursor = "not-allowed"
		label.addEventListener("click", e => {
			removeSymbol(json)
			stage.removeChild(path)
		})
		path.addChild(label)
		if (dist(first,last) > 10) {
			let label = IsoPleth.getLabel(json.value,last.x - 10,last.y + (first.y < last.y? 0 : -24))
			label.cursor = "not-allowed"
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
				let symbol = {type:"isopleth",value: value, pts: this.pts}
				IsoPleth.showSymbol(drawsim.mainstage,symbol)
				addSymbol(symbol)
			}
		})
	}
	
	getInst() {
		return "<p>Press and drag mouse to draw line. Release when done. Supply a value when prompted.  Click value to delete.</p>"
	}
}

class Line {
	static getLineShape(lt) {
		let shape = new createjs.Shape()
	    shape.graphics.setStrokeStyle(lt.w).beginStroke(lt.c)
	    return shape
	}
	
	static setButton(button,color) {
		let b = button.getChildAt(0)
		let border = new createjs.Shape()
		border.x = b.x
		border.graphics.setStrokeStyle(1).beginFill(color).beginStroke("#AAA").drawRoundRect(0,2,62,18,2,2,2,2).endStroke()
		button.removeChildAt(0)
		button.addChildAt(border,0)
	}
	
	static getButton(x,name) {
		let lt = linetypes[name]
		let button = new createjs.Container()
		button.cursor = "pointer"
		button.addEventListener("click",e => {
			if (name == linetype) return
			if (linetypeButton) Line.setButton(linetypeButton,"#FFF")
			Line.setButton(button,"#EEE")
			linetype = name
			linetypeButton = button			
		})
		let border = new createjs.Shape()
		border.graphics.setStrokeStyle(1).beginFill(name == linetype?"#EEE":"#FFF").beginStroke("#AAA").drawRoundRect(0,2,62,18,2,2,2,2).endStroke()
		if (name == linetype) linetypeButton = button
		border.x = x
		let txt = new createjs.Text(name,"bold 12px Arial","#000")
		txt.x = x+5
		txt.y = 5
		let line = Line.getLineShape(lt)
		let left = x + txt.getBounds().width+10
		line.graphics.moveTo(left,10).lineTo(left+15,10).endStroke()
		button.addChild(border,txt,line)
		return button
	}
	
	static showSymbol(stage,json) {
		let pts = json.pts
		let path = new createjs.Container()
		path.name = json.ltype
		let shape = Line.getLineShape(linetypes[json.ltype])
		let oldX = pts[0].x
		let oldY = pts[0].y
		let oldMidX = oldX
		let oldMidY = oldY
	    json.pts.forEach(pt => {
			let midPoint = new createjs.Point(oldX + pt.x >> 1, oldY+pt.y >> 1)
	        shape.graphics.moveTo(midPoint.x, midPoint.y)
	        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY)
	        oldX = pt.x
	        oldY = pt.y
	        oldMidX = midPoint.x
	        oldMidY = midPoint.y
	    })
	    path.addChild(shape)
	    stage.addChild(path)
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.ltype != json2.ltype) return false
		if (json1.pts[0].x != json2.pts[0].x) return false
		if (json1.pts[0].y != json2.pts[0].y) return false
		return true
	}
	
	constructor(back,drawsim) {
		createjs.Ticker.framerate = 10
		this.back = back
		this.mouseDown = false
		let x = 5
		for (let key in linetypes) {
			let b = Line.getButton(x,key)
			drawsim.mainstage.addChild(b)
			x += 65
		}
		drawsim.mainstage.addEventListener("stagemousedown", e => {
			this.currentShape = Line.getLineShape(linetypes[linetype])
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
	        this.currentShape.graphics.setStrokeStyle(linetypes[linetype].w).moveTo(midPoint.x, midPoint.y)
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
			drawsim.mainstage.removeChild(drawsim.mainstage.getChildByName(linetype))
			getSymbols().forEach(s => {
				if (s.ltype == linetype) removeSymbol(s)
			})
			let symbol = {type:"line",ltype: linetype, pts: this.pts}
			Line.showSymbol(drawsim.mainstage,symbol)
			addSymbol(symbol)
			
		})
	}
	
	getInst() {
		return "<p>Select a line type, then press and drag mouse to draw. Release when done.<br/>Drawing another line of the same type will replace the previous line.</p>"
	}
}

class Ellipse extends createjs.Container {
	static showSymbol(stage,json) {
		let ellipse = new createjs.Shape()
		ellipse.graphics.setStrokeStyle(2).beginFill("#FFF").beginStroke("#F00").drawEllipse(Math.round(json.pt.x-json.w/2),Math.round(json.pt.y-json.h/2),Math.round(json.w),Math.round(json.h)).endStroke()
		ellipse.alpha = 0.5
    	ellipse.cursor = "not-allowed"
		ellipse.addEventListener("click", e => {
			removeSymbol(json)
			stage.removeChild(ellipse)
		})
    	stage.addChild(ellipse)
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.ex != json2.ex) return false
		if (json1.w != json2.w) return false
		if (json1.h != json2.h) return false
		if (json1.pt.x != json2.pt.x) return false
		if (json1.pt.y != json2.pt.y) return false
		return true
	}
	
	constructor(back,drawsim) {
		super()
    	back.cursor = "pointer"
		back.addEventListener("click", e => {
			let symbol = this.toJSON(e.stageX,e.stageY)
			addSymbol(symbol)
			Ellipse.showSymbol(drawsim.mainstage,symbol)
		})
	}
	
	toJSON(x,y) {
		return {type:"ellipse", ex: ex, w:width, h:height, pt:{x:x,y:y}}
	}
	
	getInst() {
		return "<p>Click to add an ellipse. Click ellipse to delete.</p>"
	}
}

class Field {
	static showSymbol(stage,json) {
		let pts = json.pts
		let shape = new createjs.Shape()
	    if (pts.length == 0) return
		let oldX = pts[0].x
		let oldY = pts[0].y
		let oldMidX = oldX
		let oldMidY = oldY
		this.color = json.color;
	    shape.graphics.beginStroke(this.color);
	    json.pts.forEach(pt => {
			let midPoint = new createjs.Point(oldX + pt.x >> 1, oldY+pt.y >> 1)
	        shape.graphics.setStrokeStyle(4).moveTo(midPoint.x, midPoint.y)
	        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY)
	        oldX = pt.x
	        oldY = pt.y
	        oldMidX = midPoint.x
	        oldMidY = midPoint.y
	    })
		let path = new createjs.Container()
		path.addChild(shape)
	    if ((opt == 'head' || opt == "colorhead") && pts.length > 4) {
	    	let lastpt = pts[pts.length-6]
	    	let endpt = pts[pts.length-3]
	    	let head = new createjs.Shape()
		    head.graphics.f(this.color).setStrokeStyle(4).beginStroke(this.color).mt(4,0).lt(-4,-4).lt(-4,4).lt(4,0)
		    head.x = endpt.x
		    head.y = endpt.y
		    head.rotation = angle(lastpt,endpt)
		    path.addChild(head)
			let desc = new createjs.Text(json.desc,"14px Arial","#000")
	    	let mid = Math.trunc(pts.length/2)
	    	desc.x = json.pts[mid].x
	    	desc.y = json.pts[mid].y
	        var rect = new createjs.Shape();
	    	rect.graphics.beginFill("white");
            rect.graphics.drawRect(desc.x, desc.y, desc.getMeasuredWidth(), desc.getMeasuredHeight());
            rect.graphics.endFill();
            rect.alpha = 0.9;
            path.addChild(rect);
	    	path.addChild(desc);
	    }
    	path.cursor = "not-allowed"
		path.addEventListener("click", e => {
			removeSymbol(json)
			path.stage.removeChild(path)
		})
		stage.addChild(path)
	}
	
	static isSame(json1,json2) {
		if (json1.type != json2.type) return false
		if (json1.pts[0].x != json2.pts[0].x) return false
		if (json1.pts[0].y != json2.pts[0].y) return false
		return true
	}
	
	constructor(back,drawsim) {
		createjs.Ticker.framerate = 5
		this.back = back
		this.mouseDown = false
		this.w = 1
		drawsim.mainstage.addEventListener("stagemousedown", e => {
			this.currentShape = new createjs.Shape()
		    this.oldX = this.oldMidX = e.stageX
		    this.oldY = this.oldMidY = e.stageY
			this.mouseDown = true
			this.pts = []
			this.color = "#000"
			if (opt == "colorhead") {
				var ctx = document.getElementById("maincanvas").getContext("2d")
			    var data = ctx.getImageData(this.oldX, this.oldY, 1, 1).data
			    this.color = rgbToHex(data[0], data[1], data[2])
			}
		    this.currentShape.graphics.beginStroke(this.color)
			drawsim.mainstage.addChild(this.currentShape)
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
			if (this.pts.length == 0) return
			drawsim.mainstage.removeChild(this.currentShape)
			let symbol = {type:"field", pts: this.pts, color: this.color, desc: ""}
			Field.showSymbol(drawsim.mainstage, symbol)
		    if ((opt == 'head' || opt == "colorhead") && this.pts.length > 4) {
		    	symbol.desc = getDesc(this.pts[Math.trunc(this.pts.length/2)], symbol, function() {
					Field.showSymbol(drawsim.mainstage, symbol)
					addSymbol(symbol)		    		
		    	});
		    }
		})
	}
	
	getInst() {
		return opt?"<p>Press and drag mouse to draw a line. Release when done. Click on line when red cursor appears to delete.":"<p>Join horizontal field lines on left and right by drawing over top of image. Lines should not cross. <br/>Click on line when red cursor appears to delete.</p>"
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
		back.image.onload = function() {
			drawsim.resize(back)
			drawsim.mainstage.update();
		}
		this.mainstage.addChild(back)
		this.showSymbols()
		if (transform == "true") {
			document.getElementById("transform").style.visibility="visible";
			document.getElementById("rotate").addEventListener("click", e => drawsim.rotate(back, e));
			document.getElementById("fliph").addEventListener("click", e => drawsim.flipH(back, e));
			document.getElementById("flipv").addEventListener("click", e => drawsim.flipV(back, e));
		}
		if (edit) {
			this.mainstage.enableMouseOver()
			//let inst = document.getElementById("instruct")
			switch (tool) {
			case "pressure":
				let pressures = new Pressures(2,this)
				this.toolbar = new Toolbar(pressures,this)
				//inst.innerHTML = pressures.getInst()
				back.addEventListener("mousedown", e => this.toolbar.show(e))
				this.mainstage.addChild(this.toolbar)
				break
			case "airmass":
				let airmasses = new Airmasses(2,this)
				this.toolbar = new Toolbar(airmasses,this)
				//inst.innerHTML = airmasses.getInst()
				back.addEventListener("mousedown", e => this.toolbar.show(e))
				this.mainstage.addChild(this.toolbar)
				break
			case "isopleth":
				this.isopleth = new IsoPleth(back,this)
				//inst.innerHTML = this.isopleth.getInst()
				break
			case "line":
				this.line = new Line(back,this)
				//inst.innerHTML = this.line.getInst()
				break
			case "ellipse":
				this.ellipse = new Ellipse(back,this)
				//inst.innerHTML = this.ellipse.getInst()
				break
			case "field":
				this.field = new Field(back,this)
				//inst.innerHTML = this.field.getInst()
				break
			case "mindmap":
				this.field = new Field(back,this)
				//inst.innerHTML = this.field.getInst()
				break
			default: {
					alert("Parameter tool should be pressure, airmass, isopleth, line, ellipse or field")
				}
			}
		}
		// handle download
		let dl = document.getElementById("download")
		dl.addEventListener("click", e => {
			let dt = this.mainstage.canvas.toDataURL('image/png')
			/* Change MIME type to trick the browser to download the file instead of displaying it */
			dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
			/* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
			dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=map.png');
			dl.href = dt;
		})
	}
	
	resize(back) {
		let bnd = back.getBounds()
		this.mainstage.canvas.width = bnd.width + 40
		this.mainstage.canvas.height = bnd.height + 40
		back.x = bnd.width / 2 + 20
		back.y = bnd.width / 2 + 20
	    back.regX = bnd.width / 2;
	    back.regY = bnd.height / 2;
	}
	
	rotate(img, e) {
		img.rotation += 90;
		console.log(img.rotation);
	}
	
	flipH(img, e) {
		img.scaleX = img.scaleX == 1 ? -1 : 1;
	}

	flipV(img, e) {
		img.scaleY = img.scaleY == 1 ? -1 : 1;
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
			case "isopleth":
				IsoPleth.showSymbol(this.mainstage,json)
				break;
			case "line":
				Line.showSymbol(this.mainstage,json)
				break;
			case "ellipse":
				Ellipse.showSymbol(this.mainstage,json)
				break;
			case "field":
				Field.showSymbol(this.mainstage,json)
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