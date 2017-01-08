import {Graph, getStore} from "../utils"
import {Url} from "url"

let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))

let edit = searchParams.get('mode') == "edit"
let hcode = {12:"200", 9.3:"930", 5.5:"550", 3: "000", 1.5: "500", 0: "000"}
let wet = [
	[10,1000, 0,800, -10,660, -20,550, -30,460],
	[20,1000, 10,770, 0,650, -10,480, -20,400],
	[30,1000, 20,730, 10,540, 0,410, -10,325]
]
//Ln (P1/P2) = g(Z1-Z2)/(RdT) where Rd = 287, g = 9.8, T is an average temp for the layer. 
//There might be a minus sign missing and some multiples of 10 to get the units correct. 
//You have to work up from the surface where P1 = 1000 and Z1 = 0.
function height(t,p) { return (Math.log(1000/p)*287*((t+273+10+273)/2)/9.8)/1000 }

let stations = {}
stations["200"] = {h:12, t:0, dpd:"N/A", d:0, s: 0}
stations["300"] = {h:9.3, t:0, dpd:"N/A", d:0, s: 0}
stations["500"] = {h:5.5, t:0, dpd:0, d:0, s: 0}
stations["700"] = {h:3, t:0, dpd:0, d:0, s: 0}
stations["850"] = {h:1.5, t:0, dpd:0, d:0, s: 0}
stations["1000"] = {h:0, t:0, dpd:0, d:0, s: 0}
	
createjs.MotionGuidePlugin.install()
createjs.Ticker.frameRate = 1

class StationValues {
	constructor() {
	}
	
	get() {
		let s = store.get("stations")
		if (s) stations = s
		for(let p in stations) {
			["t","dpd","d","s"].forEach(v => {
				let id = p+v
				let elem = document.getElementById(id)
				elem.value = stations[p][v]
			})
		}
	}
	
	update() {
		let valid = true
		for(let p in stations) {
			["t","dpd","d","s"].forEach(v => {
				let id = p+v
				let elem = document.getElementById(id)
				if (elem.checkValidity()) {
					stations[p][v] = elem.value
				} else
					valid = false
			})
		}
		if (valid)
			store.set("stations",stations)
		return valid
	}
}

class WindVector {
	constructor(x,y,dir,speed) {
		let cont = new createjs.Container()
		cont.x = x
		cont.y = y
		let tip = -30
		let w = new createjs.Shape()
		w.graphics.beginStroke("#000").moveTo(0,0).lineTo(0,tip).endStroke()
		cont.addChild(w)
		if (speed >= 50) {
			w = new createjs.Shape()
			w.graphics.beginStroke("#000").beginFill("#000").moveTo(0,tip).lineTo(8,tip+4).lineTo(0,tip+8).lineTo(0,tip).endStroke()
			cont.addChild(w)
			tip += 12
			speed -= 50
		}
		while(speed >= 10) {
			w = new createjs.Shape()
			w.graphics.beginStroke("#000").moveTo(0,tip).lineTo(8,tip-4).endStroke()
			cont.addChild(w)
			tip += 4
			speed -= 10
		}
		if (speed > 0) {
			w = new createjs.Shape()
			w.graphics.beginStroke("#000").moveTo(0,tip).lineTo(4,tip-2).endStroke()
			cont.addChild(w)
		}
		cont.rotation = 45 * dir
		return cont
	}
}

class Station {
	constructor(stage, x, y, s) {
		let border = new createjs.Shape()
		border.graphics.beginStroke("#87cefa").drawRect(x-45,y-35,85,70).endStroke()
		let circle = new createjs.Shape()
		circle.graphics.beginStroke("#000").beginFill("#000").drawCircle(x,y,5).endStroke()
		let temp = new createjs.Text(s.t,"11px Arial","#000")
		temp.x = x - 40
		temp.y = y - 30
		//let press = new createjs.Text(hcode[s.h],"11px Arial","#000")
		//press.x = x + 20
		//press.y = y - 30
		let ttd = new createjs.Text(s.dpd,"11px Arial","#000")
		ttd.x = x - 40
		ttd.y = y + 10
		let wind = new WindVector(x,y,s.d,s.s)
		stage.addChild(border,circle,temp,ttd,wind)
	}
}

class StationGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			x: 200,
			y: 650,
			w: 580,
			h: 640,
			xlabel: "Temperature(C)",
			ylabel: "Height(km)",
			xscale: "linear",
			yscale: "linear",
			minX: -30,
			maxX: 30,
			minY: 0,
			maxY: 13,
			majorX: 10,
			minorX: 5,
			majorY: 1,
			minorY: 0.5
		})
		this.values = new StationValues()
		this.values.get()
	}
	
	render() {
		super.render()
		for (let p in stations) {
			let s = stations[p]
			let y = this.yaxis.getLoc(s.h)
			this.drawLine(200,y,780,y)
			let t = new createjs.Text(p + " mb","11px Arial","#000")
			t.x = 205
			t.y = y - 10
			this.stage.addChild(t)
			new Station(this.stage,80,y,s)
		}
		let sfc = new createjs.Text("Surface","11px Arial","#000")
		sfc.x = 140
		sfc.y = 645
		this.stage.addChild(sfc)
		this.setColor("#0F0")
		this.drawLine(200,690,250,690)
		// plots of T and T - Td
		let tmp = new createjs.Text("T","11px Arial","#000")
		tmp.x = 260
		tmp.y = 685
		this.stage.addChild(tmp)
		this.dotted = false
		this.plot(stations["500"].t,stations["500"].h)
		this.plot(stations["700"].t,stations["700"].h)
		this.plot(stations["850"].t,stations["850"].h)
		this.plot(stations["1000"].t,stations["1000"].h)
		this.endPlot()
		this.setColor("#00F")
		this.drawLine(300,690,350,690)
		tmp = new createjs.Text("T - Td","11px Arial","#000")
		tmp.x = 360
		tmp.y = 685
		this.stage.addChild(tmp)
		this.plot(stations["500"].dpd,stations["500"].h)
		this.plot(stations["700"].dpd,stations["700"].h)
		this.plot(stations["850"].dpd,stations["850"].h)
		this.plot(stations["1000"].dpd,stations["1000"].h)
		this.endPlot()
		// adiabats
		this.setColor("#888")
		this.dotted = true
		this.drawLine(420,690,470,690)
		tmp = new createjs.Text("Dry Adiabat","11px Arial","#000")
		tmp.x = 480
		tmp.y = 685
		this.stage.addChild(tmp)
		for (let t = -20; t <= 0; t+= 10) {
			this.plot(t,0)
			this.plot(-30,(t+30)/10)
			this.endPlot()
		}
		this.setColor("#00F")
		this.dotted = true
		this.drawLine(570,690,620,690)
		tmp = new createjs.Text("Wet Adiabat","11px Arial","#000")
		tmp.x = 630
		tmp.y = 685
		this.stage.addChild(tmp)
		for (let i = 0; i < wet.length; i++) {
			for (let p = 0; p < wet[i].length; p += 2) {
				this.plot(wet[i][p],height(wet[i][p],wet[i][p+1]))
			}
			this.endPlot()
		}
		this.dotted.false
	}

	update() {
		if (this.values.update()) {
			this.stage.removeAllChildren()
			this.render()
		} else
			alert("Please correct values marked in red.")
	}
}
    

class StationSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		createjs.Touch.enable(this.mainstage)
		this.stationgraph = new StationGraph(this.mainstage)
		let inst = document.getElementById("instruct")
		let plot = document.getElementById("plot")
		let table = document.getElementById("wxtable")
		if (edit) {
			this.mainstage.enableMouseOver()
			inst.innerHTML = "Enter requested map values. Click <strong>Plot</strong> to view station models on graph."
			plot.addEventListener("click", e => this.stationgraph.update())
			table.style.display = "block"
		} else {
			inst.style.display = "none"
			plot.style.display = "none"
			table.style.display = "none"
		}
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
		let tick = 1
		this.stationgraph.render()
		createjs.Ticker.addEventListener("tick", e => {
			this.mainstage.update()
			tick++
		})
	}
}

(new StationSim()).run()