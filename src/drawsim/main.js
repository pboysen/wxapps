import {getStore} from "../utils"   
import {Url} from "url" 
 
let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))

let image = searchParams.get('img')
if (!image) image = prompt("Enter image url:","")
let back = new createjs.Bitmap(image)
let edit = searchParams.get('mode') == "edit"
let scale = searchParams.get('scale') || 1.0
let tool = searchParams.get('tool') || "pressure"
let width = searchParams.get('w') || 20
let height = searchParams.get('h') || 20
let opt = searchParams.get('opt') || "all"
let colors = searchParams.get('colors') || "black"

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

function getColor() {
    var radio = document.getElementsByName('color');       
    for(let i = 0; i < radio.length; i++) {
        if(radio[i].checked)
        	return radio[i].value
    }
    return "black"
}

var saveparms = [];

document.getElementById("save").addEventListener('click', e => {
	e.stopPropagation()
	let [symbol, cb] = saveparms
	let desc_editor = document.getElementById("desc_editor")
	removeSymbol(symbol)
	symbol.desc = desc_editor.value
	addSymbol(symbol)
	editor.style.visibility = "hidden"
	cb(true)
});
document.getElementById("delete").addEventListener('click', e => {
	e.stopPropagation()
	let [symbol, cb] = saveparms
	removeSymbol(symbol)
	editor.style.visibility = "hidden"
	cb(false)
});


function getDesc(pt, symbol, cb) {
	let editor = document.getElementById("editor")
	let desc_editor = document.getElementById("desc_editor")
	let canvas = document.getElementById("maincanvas")
	desc_editor.value = symbol.desc
	editor.style.left = (pt[0] + canvas.offsetLeft) + "px"
	editor.style.top = (pt[1] + canvas.offsetTop) + "px"
	editor.style.visibility = "visible"
	editor.focus()
	saveparms = [symbol, cb]
}

function getMid(pts) {
	let [start, end] = [pts[0], pts[pts.length - 1]]
	let [midx, midy] = [0, 0]
	if (start.x < end.x) midx = start.x + (end.x - start.x) / 2 - 20;
	else midx = end.x + (start.x - end.x) / 2 - 20; 
	if (start.y < end.y) midy = start.y + (end.y - start.y) / 2;
	else midy = end.y + (start.y - end.y) / 2;
	return [midx, midy];
}

function addLabel(path, mid, symbol, cb) {
	let desc = new createjs.Text(symbol.desc,"14px Arial","#000")
	desc.x = mid[0] 
	desc.y = mid[1]
    var rect = new createjs.Shape();
	rect.graphics.beginFill("white");
    rect.graphics.drawRect(desc.x, desc.y, desc.getMeasuredWidth(), desc.getMeasuredHeight());
    rect.graphics.endFill();
    rect.cursor = "text"
    path.addChild(rect);
	path.addChild(desc);
	rect.addEventListener("click", e => {
		e.stopPropagation()
		getDesc(mid, symbol, cb)
	})
}

function getSymbols() {
	let symbols = store.get(image + "." + tool)
	if (!symbols) {
		symbols = {cnt: 1, data: {}}
		store.set(image + "." + tool, symbols)
	}
	return symbols
}

function addSymbol(symbol) {
	let symbols = getSymbols()
	symbol.id = symbols.cnt++;
	symbols.data[symbol.id] = symbol
	store.set(image + "." + tool, symbols)
}

function updateSymbol(symbol) {
	let symbols = getSymbols()
	symbols.data[symbol.id] = symbol
	store.set(image + "." + tool, symbols)	
}

function removeSymbol(symbol) {
	let symbols = getSymbols()
	if (symbol.id) delete symbols.data[symbol.id]
	store.set(image + "." + tool, symbols)
}

function removeSymbols() {
	symbols = {cnt: 1, data: {}}
	store.set(image + "." + tool,symbols)
}

class Vector extends createjs.Container {
	static showSymbol(stage,json) {
		let map = new createjs.Bitmap(json.img)
		map.x = json.pt.x
		map.y = json.pt.y
		map.regX = 12
		map.regY = 12
    	map.rotation = json.rot
    	map.cursor = "url(assets/remove.png) 8 8, auto"
		map.addEventListener("click", e => {
			removeSymbol(json)
			map.stage.removeChild(map)
		})
		stage.addChild(map)
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
    	region.cursor = "url(assets/remove.png) 8 8, auto"
		stage.addChild(region)
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
    	airmass.cursor = "url(assets/remove.png) 8 8, auto"
			airmass.addEventListener("click", e => {
			removeSymbol(json)
			airmass.stage.removeChild(airmass)
		})
    	stage.addChild(airmass)
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
    	label.cursor = "url(assets/remove.png) 8 8, auto"
		label.addEventListener("click", e => {
			removeSymbol(json)
			stage.removeChild(path)
		})
		path.addChild(label)
		if (dist(first,last) > 10) {
			let label = IsoPleth.getLabel(json.value,last.x - 10,last.y + (first.y < last.y? 0 : -24))
			label.cursor = "url(assets/remove.png) 8 8, auto"
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
	
	constructor(drawsim) {
		createjs.Ticker.framerate = 10
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
	
	constructor(drawsim) {
		createjs.Ticker.framerate = 10
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
}

class Ellipse extends createjs.Container {
	static showSymbol(stage,json) {
		let ellipse = new createjs.Shape()
		ellipse.graphics.setStrokeStyle(2).beginFill("#FFF").beginStroke("#F00").drawEllipse(Math.round(json.pt.x-json.w/2),Math.round(json.pt.y-json.h/2),Math.round(json.w),Math.round(json.h)).endStroke()
		ellipse.alpha = 0.5
    	ellipse.cursor = "url(assets/remove.png) 8 8, auto"
		ellipse.addEventListener("click", e => {
			removeSymbol(json)
			stage.removeChild(ellipse)
		})
    	stage.addChild(ellipse)
	}
		
	constructor(drawsim) {
		super()
    	back.cursor = "pointer"
		back.addEventListener("click", e => {
			let symbol = this.toJSON(e.stageX,e.stageY)
			addSymbol(symbol)
			Ellipse.showSymbol(drawsim.mainstage,symbol)
		})
	}
	
	toJSON(x,y) {
		return {type:"ellipse", w:width, h:height, pt:{x:x,y:y}}
	}
}

class Field {
	static showSymbol(stage, json) {
		let pts = json.pts
	    if (pts.length == 0) return
		let shape = new createjs.Shape()
		let oldX = pts[0].x 
		let oldY = pts[0].y
		let oldMidX = oldX
		let oldMidY = oldY
		this.color = json.color;
	    shape.graphics.beginStroke(this.color);
	    json.pts.forEach(pt => {
			let midPoint = new createjs.Point(oldX + pt.x >> 1, oldY + pt.y >> 1)
	        shape.graphics.setStrokeStyle(2).moveTo(midPoint.x, midPoint.y)
	        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY)
	        oldX = pt.x
	        oldY = pt.y
	        oldMidX = midPoint.x
	        oldMidY = midPoint.y
	    })
		let path = new createjs.Container()
		path.addChild(shape)
	    if ((opt == 'head' || opt == "colorhead") && pts.length > 4) {
		    path.addChild(Field.drawHead(pts, json.color))
		    addLabel(path, getMid(pts), json, function(keep) {
	    		drawsim.mainstage.removeChild(path)
	    		if (keep) Field.showSymbol(drawsim.mainstage, json)		    	
		    })
	    }
    	shape.cursor = "url(assets/remove.png) 8 8, auto"
    	stage.addChild(path)
		shape.addEventListener("click", e => {
			removeSymbol(json)
			stage.removeChild(path)
		})
		return path
	}
	
	static drawHead(pts, color) {
    	let lastpt = pts[pts.length-6]
    	let endpt = pts[pts.length-1]
    	let head = new createjs.Shape()
	    head.graphics.f(color).setStrokeStyle(4).beginStroke(color).mt(4,0).lt(-4,-4).lt(-4,4).lt(4,0)
	    head.x = endpt.x
	    head.y = endpt.y
	    head.rotation = angle(lastpt,endpt)
	    return head
	}
	
	constructor(drawsim) {
		createjs.Ticker.framerate = 5
		this.mouseDown = false
		this.w = 1
		document.getElementById("delete").style.visibility = "hidden"
		drawsim.mainstage.addEventListener("stagemousedown", e => {
			if (document.getElementById("editor").style.visibility == "visible") return;
			this.shape = new createjs.Shape()
			drawsim.mainstage.addChild(this.shape)
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
		    this.shape.graphics.beginStroke(this.color)
		})
		drawsim.mainstage.addEventListener("stagemousemove", e => {
			if (this.mouseDown == false) return
	        this.pt = new createjs.Point(e.stageX, e.stageY)
			this.pts = this.pts.concat({x:e.stageX,y:e.stageY})
			let midPoint = new createjs.Point(this.oldX + this.pt.x >> 1, this.oldY + this.pt.y >> 1)
	        this.shape.graphics.setStrokeStyle(2).moveTo(midPoint.x, midPoint.y)
	        this.shape.graphics.curveTo(this.oldX, this.oldY, this.oldMidX, this.oldMidY)
	        this.oldX = this.pt.x
	        this.oldY = this.pt.y
	        this.oldMidX = midPoint.x
	        this.oldMidY = midPoint.y
		})
		drawsim.mainstage.addEventListener("stagemouseup", e => {
			this.mouseDown = false
			if (this.pts.length == 0) return
			let symbol = {type:"field", pts: this.pts, color: this.color, desc: ""}
		    if ((opt == 'head' || opt == "colorhead") && this.pts.length > 4) {
				let that = this;
		    	let head = Field.drawHead(this.pts, this.color)
		    	drawsim.mainstage.addChild(head)
		    	getDesc(getMid(this.pts), symbol, function(keep) {
		    		drawsim.mainstage.removeChild(that.shape)
		    		drawsim.mainstage.removeChild(head)
		    		if (keep) Field.showSymbol(drawsim.mainstage, symbol)
		    	});
		    }
		})
	} 
}

class Transform {
	static showSymbol(stage, symbol) {
		back.rotation = symbol.rotation;
		back.scaleX = symbol.flipH;
		back.scaleY = symbol.flipV;
	}
	
	constructor(drawsim) {
		createjs.Ticker.framerate = 5
		let symbols = getSymbols()
		if (symbols.cnt == 1) {
			let symbol = {type:"transform", rotation: 0, flipH: 1, flipV: 1}
			addSymbol(symbol)
		}
		if (edit) {
			document.getElementById("transform").style.visibility="visible";
			document.getElementById("rotate").addEventListener("click", function() {
				back.rotation = back.rotation < 360 ? back.rotation + 90 : 0
				let symbol = getSymbols().data[1]
				symbol.rotation = back.rotation
				updateSymbol(symbol)
				Transform.showSymbol(drawsim.stage, symbol)
			});
			document.getElementById("fliph").addEventListener("click", function() {
				back.scaleX = -back.scaleX
				let symbol = getSymbols().data[1]
				symbol.flipH = back.scaleX
				updateSymbol(symbol)				
				Transform.showSymbol(drawsim.stage, symbol)
			});
			document.getElementById("flipv").addEventListener("click", function() {
				back.scaleY = -back.scaleY
				let symbol = getSymbols().data[1]
				symbol.flipV = back.scaleY
				updateSymbol(symbol)		
				Transform.showSymbol(drawsim.stage, symbol)
			});
		}
	}
}

class Label {
	static showSymbol(stage, json) {
		let path = new createjs.Container()
		stage.addChild(path);
		addLabel(path, [json.x, json.y], json, function(show) {
			stage.removeChild(path);
    		if (show) Label.showSymbol(stage, json)
		})
	}
	constructor(drawsim) {
		drawsim.mainstage.addEventListener("click", e => {
			let symbol = {"type": "label", x: e.stageX, y: e.stageY, desc: ""}
			getDesc([symbol.x, symbol.y], symbol, function(show) {
	    		if (show) Label.showSymbol(drawsim.mainstage, symbol)
			})
		})		
	}		
}

class Arrow {
	static showSymbol(stage, json, showCursor) {
		let shape = new createjs.Shape()
		let w = Math.min(width, 5)
		let d = Math.hypot(json.start.x - json.end.x, json.start.y - json.end.y)
	    shape.graphics.ss(1).s(json.color).f(json.color).mt(0, 0).lt(0, w).lt(d, w).lt(d, 2 * w).lt(d + 2 * w, 0).lt(d, - 2 * w).lt(d, -w).lt(0, -w).lt(0, 0)
	    shape.x = json.start.x
	    shape.y = json.start.y
	    shape.rotation = angle(json.start, json.end)
		if (showCursor) shape.cursor = "url(assets/remove.png) 8 8, auto"
		shape.addEventListener("click", e => {
			e.stopPropagation()
			removeSymbol(json)
			stage.removeChild(shape)
		})
    	stage.addChild(shape)
		return shape
	}
	
	constructor(drawsim) {
		createjs.Ticker.framerate = 30
		let colorsdiv = document.getElementById("colors")
		colorsdiv.style.visibility = "visible"
		let checked = true
		colors.split(",").forEach(color => {
			var radio = document.createElement('input')
			  radio.type = 'radio'
			  radio.name = 'color'
			  radio.checked = checked;
			  radio.id = color
			  radio.value = color
			  colorsdiv.appendChild(radio)
			var label = document.createElement('label')
			  label.for = color
			label.style.color = color;
			colorsdiv.appendChild(label)
			var text = document.createTextNode(color)
			label.appendChild(text)
			checked = false
		})
		let symbol = {type:"arrow", start:{}, end: {}, color: getColor()}
		let mouseDown = false
		let shape = null
		drawsim.mainstage.addEventListener("stagemousedown", e => {
			let thing = drawsim.mainstage.getObjectUnderPoint(e.stageX, e.stageY)
			if (!thing || !thing.image) return
			mouseDown = true
			symbol.start = {x: e.stageX, y: e.stageY}
			symbol.end = {x: e.stageX, y: e.stageY}
			symbol.color = getColor()
			shape = Arrow.showSymbol(drawsim.mainstage, symbol, false);
		})
		drawsim.mainstage.addEventListener("stagemousemove", e => {
			if (mouseDown) {
				drawsim.mainstage.removeChild(shape)
				symbol.end = {x: e.stageX, y: e.stageY}
				shape = Arrow.showSymbol(drawsim.mainstage, symbol, false);
			}
		})
		drawsim.mainstage.addEventListener("stagemouseup", e => {
			if (mouseDown) {
				addSymbol(symbol)
				if (shape) shape.cursor = "url(assets/remove.png) 8 8, auto"
				mouseDown = false
			}
		})
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
		this.mainstage.cursor = "default"
		createjs.Touch.enable(this.mainstage)
		back.image.onload = function() {
			let bnd = back.getBounds()
			drawsim.mainstage.canvas.width = bnd.width + 40
			drawsim.mainstage.canvas.height = bnd.height + 40
			back.x = bnd.width / 2 + 20
			back.y = bnd.width / 2 + 20
		    back.regX = bnd.width / 2;
		    back.regY = bnd.height / 2;
		}
		this.mainstage.addChild(back)
		this.showSymbols()
		if (edit) {
			this.mainstage.enableMouseOver()
			switch (tool) {
			case "pressure":
				let pressures = new Pressures(2,this)
				this.toolbar = new Toolbar(pressures,this)
				back.addEventListener("mousedown", e => this.toolbar.show(e))
				this.mainstage.addChild(this.toolbar)
				break
			case "airmass":
				let airmasses = new Airmasses(2,this)
				this.toolbar = new Toolbar(airmasses,this)
				back.addEventListener("mousedown", e => this.toolbar.show(e))
				this.mainstage.addChild(this.toolbar)
				break
			case "isopleth":
				this.isopleth = new IsoPleth(this)
				break
			case "line":
				this.line = new Line(this)
				break
			case "ellipse":
				this.ellipse = new Ellipse(this)
				break
			case "field":
				this.field = new Field(this)
				break
			case "transform":
				this.transform = new Transform(this)
				break
			case "label":
				this.label = new Label(this)
				break;
			case "arrow":
				this.arrow = new Arrow(this)
				break;
			default:
				alert("Parameter tool should be pressure, airmass, isopleth, line, ellipse, field, transform or label")
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
	
	showSymbols() {
		let symbols = getSymbols()
		for (let key in symbols["data"]) {
			let json = symbols["data"][key]
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
			case "transform":
				Transform.showSymbol(this.mainstage,json)
				break;
			case "label":
				Label.showSymbol(this.mainstage,json)
				break;
			case "arrow":
				Arrow.showSymbol(this.mainstage,json, true)
				break;
			}
		}
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