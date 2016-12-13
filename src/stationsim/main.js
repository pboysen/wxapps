import {Graph, getStore} from "../utils"
import {Url} from "url"

let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1))

let edit = searchParams.get('mode') == "edit", pressures = ["500","700","850","surface"]
let stations = {}
stations["200"] = {h:12, t:0, dpd:0, d:0, s: 0}
stations["300"] = {h:9.3, t:0, dpd:0, d:0, s: 0}
stations["500"] = {h:5.5, t:0, dpd:0, d:0, s: 0}
stations["700"] = {h:3, t:0, dpd:0, d:0, s: 0}
stations["850"] = {h:1.5, t:0, dpd:0, d:0, s: 0}
stations["surface"] = {h:0, t:0, dpd:0, d:0, s: 0}

createjs.MotionGuidePlugin.install()
createjs.Ticker.frameRate = 1

class StationValues {
	constructor() {
	}
	
	get() {
		let s = store.get("stations")
		if (s) stations = s
		pressures.forEach(p => {
			["t","dpd","d","s"].forEach(v => {
				let id = p+v
				let elem = document.getElementById(id)
				elem.value = stations[p][v]
			})
		})
	}
	
	update() {
		let valid = true
		pressures.forEach(p => {
			["t","dpd","d","s"].forEach(v => {
				let id = p+v
				let elem = document.getElementById(id)
				if (elem.checkValidity()) {
					stations[p][v] = elem.value
				} else
					valid = false
			})
		})
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
		if (speed > 50) {
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
	constructor(stage, x, y, p, s) {
		let border = new createjs.Shape()
		border.graphics.beginStroke("#87cefa").drawRect(x-45,y-35,85,70).endStroke()
		let circle = new createjs.Shape()
		circle.graphics.beginStroke("#000").beginFill("#000").drawCircle(x,y,5).endStroke()
		let temp = new createjs.Text(s.t,"11px Arial","#000")
		temp.x = x - 40
		temp.y = y - 30
		let press = new createjs.Text(p,"11px Arial","#000")
		press.x = x + 20
		press.y = y - 30
		let ttd = new createjs.Text(s.dpd-s.t,"11px Arial","#000")
		ttd.x = x - 40
		ttd.y = y + 10
		let wind = new WindVector(x,y,s.d,s.s)
		stage.addChild(border,circle,temp,press,ttd,wind)
	}
}

class StationGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			x: 200,
			y: 550,
			w: 580,
			h: 540,
			xlabel: "Temperature(C)",
			ylabel: "Height(km)",
			xscale: "linear",
			yscale: "linear",
			minX: -30,
			maxX: 30,
			minY: 0,
			maxY: 12,
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
			let txt = p == "surface"?"1 atm": p + " mb"
			let t = new createjs.Text(txt,"11px Arial","#000")
			t.x = 205
			t.y = y - 10
			this.stage.addChild(t)
			if (p > 300) new Station(this.stage,80,y,p,s)
		}
		let sfc = new createjs.Text("Surface","11px Arial","#000")
		sfc.x = 140
		sfc.y = 545
		this.stage.addChild(sfc)
		this.setColor("#0F0")
		this.drawLine(300,590,350,590)
		// plots of T and T - Td
		let tmp = new createjs.Text("T","11px Arial","#000")
		tmp.x = 360
		tmp.y = 585
		this.stage.addChild(tmp)
		this.plot(stations["500"].t,stations["500"].h)
		this.plot(stations["700"].t,stations["700"].h)
		this.plot(stations["850"].t,stations["850"].h)
		this.plot(stations["surface"].t,stations["surface"].h)
		this.endPlot()
		this.setColor("#00F")
		this.drawLine(400,590,450,590)
		tmp = new createjs.Text("T - Td","11px Arial","#000")
		tmp.x = 460
		tmp.y = 585
		this.stage.addChild(tmp)
		this.plot(stations["500"].dpd,stations["500"].h)
		this.plot(stations["700"].dpd,stations["700"].h)
		this.plot(stations["850"].dpd,stations["850"].h)
		this.plot(stations["surface"].t,stations["surface"].h)
		this.endPlot()
		// adiabats
		this.setColor("#888")
		this.dotted = true
		this.drawLine(520,590,570,590)
		tmp = new createjs.Text("Dry Adiabat","11px Arial","#000")
		tmp.x = 580
		tmp.y = 585
		this.stage.addChild(tmp)
		for (let t = -20; t <= 30; t+= 10) {
			this.plot(t,0)
			this.plot(-30,(t+30)/10)
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