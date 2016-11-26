import {Graph, getStore} from "../utils"
import {Url} from "url"

let mtnsim_results = "mtnsim_results", LAPSE_RATE = -9.8
let store = getStore(),searchParams = new URLSearchParams(window.location.search.substring(1))
let tool = searchParams.get('tool')

if (tool == "readout") {
	let dp = document.getElementById("dp")
	dp.style.display = "inline-block"
	let readout = document.getElementById("readout")
	readout.style.display = "block"
}

createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])
createjs.Ticker.frameRate = 20
function teten(T,a,b) { return 6.1078*Math.exp(a*T/(T+273.16-b)) }
function saturation(temp) { return teten(temp,17.269,35.86) }
function icesaturation(temp) { return teten(temp,21.874,7.66) }
function dewpoint(vapor) { return 2354.0/(9.4041-Math.log10(vapor))-273.0 }
function pressure(alt) { return 1000-125*alt }

function getCol(val) {
	let td = document.createElement("td")
	td.appendChild(document.createTextNode(val))
	return td
}

function getDelete(row) {
	let td = document.createElement("td")
	let img = document.createElement("img")
	img.setAttribute("src","assets/delete.jpg")
	img.setAttribute("class","delete_img")
	img.setAttribute("alt","Delete row")
	img.setAttribute("title","Delete row")
	img.addEventListener("click", event => {
		if (confirm("Delete row?")) {
			// <tr><td><img...
			let node = event.target.parentNode.parentNode
			mtnsim.mtn.deleteTrial(Array.prototype.indexOf.call(node.parentNode.childNodes,node)-4)
		}
	})
	td.appendChild(img)
	return td
}

function getRow(json,row) {
	let tr = document.createElement("tr")
	tr.appendChild(getCol(json.start.temp.toFixed(1)))
	tr.appendChild(getCol(json.start.vapor.toFixed(1)))
	tr.appendChild(getCol(json.start.dewpoint.toFixed(1)))
	tr.appendChild(getCol(json.temp.toFixed(1)))
	tr.appendChild(getCol(json.vapor.toFixed(1)))
	tr.appendChild(getCol(json.dewpoint.toFixed(1)))
	tr.appendChild(getCol(json.cloudbase > 0?json.cloudbase.toFixed(1):"Clear"))
	tr.appendChild(getDelete(row))
	return tr
}


class Trial {
	constructor() {
		this.start = null
	    this.cloudbase = 0
	    this.temp = 0
	    this.altitude = 0
	    this.vapor = 0
	    this.dewpoint = 0
	    this.lapse = 0
	}
	
	toJSON() {
		return {
			start: this.start,
		    cloudbase: this.cloudbase,
		    temp: this.temp,
		    altitude: this.altitude,
		    vapor: this.vapor,
		    dewpoint: this.dewpoint
		}
	}
	
	init(start) {
		this.start = start
	    this.cloudbase = 0
	    this.temp = start.temp
	    this.altitude = 0
	    this.vapor = start.vapor
	    this.dewpoint = start.dewpoint
	    this.lapse = LAPSE_RATE
	}
}

class Readout {
	constructor() {
		this.altitude = document.getElementById("altitudereadout")
		this.temp = document.getElementById("tempreadout")
		this.vapor = document.getElementById("vaporreadout")
		this.dewpoint = document.getElementById("dewpointreadout")
	}
	
	update(trial) {
		this.altitude.value = trial.altitude.toFixed(1)
		this.temp.value = trial.temp.toFixed(1)
		this.vapor.value = trial.vapor.toFixed(1)
		this.dewpoint.value = trial.dewpoint.toFixed(1)
	}
}

class Settings {
	constructor() {
		this.readout = new Readout()
		this.temp = document.getElementById("temp")
		this.vapor = document.getElementById("vapor")
		this.dewpoint = document.getElementById("dewpoint")
		this.tempout = document.getElementById("tempout")
		this.vaporout = document.getElementById("vaporout")
		this.dewpointout = document.getElementById("dewpointout")
		this.mute = document.getElementById("mute")
		this.listener = null
		function slidef(e,input, out, f) {
	    	e.stopPropagation()
	    	out.value = input.valueAsNumber
	    	if (f) f(input)
		}
		// IE doesn't have an input event but a change event
		let event = /msie|trident/g.test(window.navigator.userAgent.toLowerCase())?"change":"input"
		this.temp.addEventListener(event, e => slidef(e,this.temp,this.tempout,this.listener))
		this.vapor.addEventListener(event, e => slidef(e,this.vapor,this.vaporout,this.listener))
		this.dewpoint.addEventListener(event, e => slidef(e,this.dewpoint,this.dewpointout,this.listener))
	}
	
	getTemp() { return this.temp.valueAsNumber }

	getVapor() { return this.vapor.valueAsNumber }

	getDewpoint() { return this.dewpoint.valueAsNumber }
	
	setTemp(value) {
		this.temp.value = value
		this.tempout.value = value.toFixed(1)
		this.readout.temp.value = this.tempout.value
	}
	
	setVapor(value) {
		this.vapor.value = value
		this.vaporout.value = value.toFixed(1)
		this.readout.vapor.value = this.vaporout.value
	}
 	
	setDewpoint(value) {
		this.dewpoint.value = value
		this.dewpointout.value = value.toFixed(1)
		this.readout.dewpoint.value = this.dewpointout.value
	}
 	
	updateReadout(trial) {
		this.readout.update(trial)
	}
	
	addListener(listener) { this.listener = listener }
}

class Buttons {
	constructor() {
		this.run = document.getElementById("run")
		this.pause = document.getElementById("pause")
		this.restart = document.getElementById("restart")
		this.mute = document.getElementById("mute")
	}
	
	addListener(listener) { 
		this.run.addEventListener("click", e => listener(e))
		this.pause.addEventListener("click", e => listener(e))
		this.restart.addEventListener("click", e => listener(e))
	}
	
	mute() { return this.mute.checked }
}

class ETGraph extends Graph {
	constructor(stage,settings) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Temperature(C)",
			ylabel: "Vapor Pressure(mb)",
			xscale: "linear",
			yscale: "linear",
			minX: -20,
			maxX: 30,
			minY: 0,
			maxY: 50,
			majorX: 10,
			minorX: 5,
			majorY: 10,
			minorY: 5
		})
		this.settings = settings
		this.lasth = 0
		this.leaf = new createjs.Bitmap("assets/leaf.gif")
		this.marker = new createjs.Shape()
		this.marker.graphics.beginFill("#000").drawRect(this.xaxis.getLoc(this.temp)-2,this.yaxis.getLoc(this.vapor)-2,4,4)
		stage.addChild(this.leaf)
		stage.addChild(this.marker)
		this.settings.addListener(slider => {
            if (slider.id == "temp") {
                this.temp = slider.valueAsNumber
                this.settings.setTemp(slider.valueAsNumber)
            } else if (slider.id == "vapor") {
                this.vapor = slider.valueAsNumber
                this.settings.setVapor(this.vapor)
                this.settings.setDewpoint(dewpoint(this.vapor))
            } else if (slider.id == "dewpoint") {
                this.dewpoint = slider.valueAsNumber
                this.settings.setDewpoint(this.dewpoint)
                this.vapor = vapor(this.dewpoint)
                this.settings.setVapor(this.vapor)
            }
            this.moveMarker(true)
		})
		this.icegraph = new IceGraph(stage)
	}
	
	render() {
		this.temp = this.settings.getTemp()
		this.vapor = this.settings.getVapor()
		super.render()
		this.plotSaturation()
		this.icegraph.render()
		this.moveMarker(true)
	}
	
	plotSaturation() {
        for (let t = this.xaxis.min; t < 0; t++) this.plot(t,icesaturation(t))
        for (let t = 0; t <= this.xaxis.max; t++) this.plot(t,saturation(t))
        this.endPlot()
	}
	
	clear() {
		super.clear()
		this.stage.addChild(this.leaf)
	}
	
	moveLeaf(x,y) {
		this.leaf.x = x-10
		this.leaf.y = y-10
	}
	
	showLeaf() {
       let x = this.xaxis.getLoc(this.temp)
       let y = this.yaxis.getLoc(this.vapor)
       this.moveLeaf(x,y)
	}
		
    moveMarker(updateSettings) {
        let sat = saturation(this.temp)
        if (this.vapor > sat) {
        	this.vapor = sat
        	if (updateSettings === true) {
        		this.settings.setTemp(this.temp)
        		this.settings.setVapor(sat)
        		this.settings.setDewpoint(dewpoint(sat))
        	}
        }
        let x = this.xaxis.getLoc(this.temp)
        let y = this.yaxis.getLoc(this.vapor)
        this.marker.x = x - 2
        this.marker.y = y - 2
        if (updateSettings === true) this.moveLeaf(x,y)
    }
    
	update(trial) {
		this.temp = trial.temp
		this.vapor = trial.vapor
		this.plot(trial.temp,trial.vapor)
		this.moveMarker(false)
		this.showLeaf()
	}
}
 
class ATGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			w: 200,
			h: 200,
			xlabel: "Temperature(C)",
			ylabel: "Altitude(km)",
			xscale: "linear",
			yscale: "linear",
			minX: -20,
			maxX: 30,
			minY: 0,
			maxY: 4,
			majorX: 10,
			minorX: 5,
			majorY: 1,
			minorY: 0.5
		})
		this.temp = 20
		this.altitude = 0
		this.cloudbase = 0
	}
	
	update(trial) {
		this.plot(trial.temp,trial.altitude)
	}
}
    
class IceGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			x: 60,
			y: 110,
			w: 75,
			h: 100,
			xlabel: "C",
			xscale: "linear",
			yscale: "linear",
			minX: -15,
			maxX: 1,
			minY: 1,
			maxY: 5,
			majorX: 5,
			majorY: 1,
			background: "#EEE"
		})
		let liquid = new createjs.Text("Liquid","10px Arial","#000")
		liquid.x = 65
		liquid.y = 40
		stage.addChild(liquid)
		let ice = new createjs.Text("Ice","10px Arial","#000")
		ice.x = 90
		ice.y = 70
		stage.addChild(ice)
	}
	
	render() {
		super.render()
        for (let t = this.xaxis.min; t <= this.xaxis.max; t++) this.plot(t,saturation(t))
        this.endPlot()
        for (let t = this.xaxis.min; t <= this.xaxis.max; t++) this.plot(t,icesaturation(t))
        this.endPlot()
	}
	
}

class Mtn {
	constructor(stage, settings, finish) {
		this.stage = stage
		this.settings = settings
		this.finish = finish
		createjs.Sound.registerSound({id: "thunder", src:"assets/thunder.mp3"})
		createjs.Sound.registerSound({id: "wind", src:"assets/wind.mp3"})
		this.wind = null
		this.thunder = null
		this.mtn = new createjs.Bitmap("assets/mountain.png")
		this.leaf = new createjs.Bitmap("assets/leaf.gif")
		this.cloud = new createjs.Bitmap("assets/thundercloud.png")
		this.bolt = new createjs.Bitmap("assets/lightning.png")
		this.leaftween = null
		this.mtn.x = 0
		this.mtn.y = 0
		this.mtn.scaleX = 0.5
		this.mtn.scaleY = 0.5
		this.bolt.x = -100
		this.bolt.scaleX = 0.015
		this.bolt.scaleY = 0.015
		this.running = false
		this.lightning = false
		this.lighttick = 0
		//this.path = [50,165, 60,155, 74,152, 80,140, 90,131, 100,125, 112,122, 120,110, 137,92, 140,75, 151,64, 150,60, 173,56, 185,60, 204,70, 210,80, 221,92, 221,95, 224,105, 230,110, 246,121, 250,130, 268,141, 280,165, 290,165]
		this.path = [50,165, 60,155, 74,152, 80,140, 90,131, 100,125, 112,122, 120,110, 137,92, 140,75, 151,66, 150,66, 173,66, 185,66, 204,70, 210,80, 221,92, 221,95, 224,105, 230,110, 246,121, 250,130, 268,141, 280,165, 290,165]
		this.results = document.getElementById("results_table")
		document.getElementById("delete_all").addEventListener("click",event => {
			if (confirm("Delete all data?")) this.deleteResults()
		})
		this.reset()
		this.showResults()
	}
	
	render() {
		this.stage.addChild(this.mtn)
		this.stage.addChild(this.leaf)
		this.stage.addChild(this.cloud)
		this.stage.addChild(this.bolt)
		this.leaf.x = 50
		this.leaf.y = 165
		this.cloud.x = -1000
		this.cloud.y = 0
		this.lastalt = 0
		this.cloud.scaleX = 0.1
		this.cloud.scaleY = 0.05
	}
	
	clear() {
		this.stage.removeAllChildren()
		this.render()
	}
	play() {
		this.reset()
		this.leaftween = createjs.Tween.get(this.leaf).to({guide:{path:this.path}},10000)
		this.leaftween.call(() => {
			if (this.wind) this.wind.stop()
			this.running = false
			this.addTrial()
			if (this.finish) this.finish()
		})
		this.running = true
		this.leaftween.play()
		this.playSound("wind")
	}
	
	showResults() {
		for (let i = this.results.children.length-1; i > 1 ; i--) this.results.removeChild(this.results.children[i])
		let trials = store.get(mtnsim_results)
		if (trials) {
			trials.forEach(json => this.results.appendChild(getRow(json)))
		} else
			store.set(mtnsim_results,[])
	}
	
	addTrial() {
		let trials = store.get(mtnsim_results)
		let json = this.trial.toJSON()
		store.set(mtnsim_results,trials.concat(json))
		this.results.appendChild(getRow(json))
	}
	
	deleteTrial(row) {
		let trials = store.get(mtnsim_results)
		trials.splice(row,1)
		store.set(mtnsim_results,trials)
		this.showResults()
	}
	
	deleteResults() {
		store.set(mtnsim_results,[])
		this.showResults()
	}

	pause(pause) { 
		this.leaftween.setPaused(pause) 
		if (this.wind) this.wind.paused = pause
		if (this.thunder) this.thunder.paused = pause
		this.running = !pause
	}
	
	playSound(sound) {
		if (!this.settings.mute.checked) {
			switch(sound) {
			case "wind":
				this.wind = createjs.Sound.play(sound,{loop: 2})
				break
			case "thunder":
				this.thunder = createjs.Sound.play(sound)
				break
			}
		}
	}
 	 
	update(trial) {
		let oldA = trial.altitude, oldT = trial.temp
		trial.altitude = 4*(165 - this.leaf.y)/165
		if (trial.altitude < 0) trial.altitude = 0
		trial.vapor *= pressure(trial.altitude)/pressure(oldA)
		trial.temp += trial.lapse * (trial.altitude - oldA)
		trial.dewpoint = dewpoint(trial.vapor)
		let sat = saturation(trial.temp)
		if (trial.vapor > sat) {
			this.animateClouds()
			trial.vapor = sat
			trial.lapse = -6.0
		}
		if (trial.temp > oldT) trial.lapse = LAPSE_RATE
		this.settings.updateReadout(trial)
	}
	
	animateClouds() {
		if (this.trial.cloudbase == 0) {
			this.trial.cloudbase = this.trial.altitude
			this.cloud.x = this.leaf.x - 2
			this.cloud.y = this.leaf.y
			this.bolt.y = this.cloud.y + 20
			this.lasty = this.leaf.y
		}
		if ((this.trial.altitude - this.lastalt) > .1) {
			this.lastalt = this.trial.altitude
			this.cloud.scaleX += .021
			this.cloud.scaleY += .02
			this.cloud.y = this.leaf.y
		}
		if (!this.lightning && this.leaf.x < 140 && this.trial.temp <= -5 && (this.trial.altitude - this.trial.cloudbase) > .5) {
			this.lighttick = 0
			this.lightning = true
		}
	}
	
	reset() {
		this.trial = new Trial()
		this.temp = this.settings.getTemp()
		this.vapor = this.settings.getVapor()
		this.lapse_rate = LAPSE_RATE
		this.lastalt = 0
		this.trial.init({
			temp: this.temp,
			vapor: this.vapor,
			dewpoint: dewpoint(this.vapor)		
		})
		this.settings.updateReadout(this.trial)
	}
	
	tick(etgraph, atgraph) {
		if (this.running === true) {
			this.update(this.trial)
			etgraph.update(this.trial)
			atgraph.update(this.trial)
			if (this.lightning === true) {
				switch(this.lighttick) {
				case 0:
					this.bolt.x = this.cloud.x + 10					
					break
				case 5:
					this.bolt.x += 10
					break
				case 7:
					this.bolt.x += 10
					break
				case 10:
					this.bolt.x = -100
					break
				case 60:
					this.playSound("thunder")
					this.lightning = false
					break
				}
				this.lighttick++
			}
		}
	}
}

class MtnSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		this.etstage = new createjs.Stage("etgraph")
		this.atstage = new createjs.Stage("atgraph")
		this.buttons = new Buttons()
		this.settings = new Settings()
		this.etgraph = new ETGraph(this.etstage,this.settings)
		this.atgraph = new ATGraph(this.atstage)
		this.mtn = new Mtn(this.mainstage, this.settings, () => {
			this.buttons.restart.disabled = false
			this.buttons.pause.disabled = true
		})
		this.pause = false
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "run":
				this.enablePlay(false)
				this.buttons.pause.value = "Pause"
				this.pause = false
				this.mtn.play()
				break
			case "pause":
				this.pause = !this.pause
				this.mtn.pause(this.pause)
				e.target.value = this.pause? "Resume":"Pause"
				break
			case "restart":
				this.reset()
				this.mtn.clear()
				this.etgraph.clear()
				this.atgraph.clear()
				this.etgraph.render()
				this.atgraph.render()
				this.mtn.reset()
				break;
			}
		})
	}
		
	reset() {
		this.enablePlay(true)
	}
	
	enablePlay(play) {
		this.buttons.run.disabled = !play
		this.buttons.pause.disabled = play
		this.buttons.restart.disabled = !play
	}
	
	render() {
		this.buttons.run.disabled = false
		this.buttons.mute.checked = false
		this.buttons.pause.disabled = true
		this.buttons.restart.disabled = true
		this.reset()
		this.etgraph.render()
		this.atgraph.render()
		this.mtn.render()
		createjs.Ticker.addEventListener("tick", e => {
			this.mtn.tick(this.etgraph, this.atgraph)
			this.etstage.update()
			this.atstage.update()
			this.mainstage.update()
		})
	}
}

let mtnsim = new MtnSim()
mtnsim.render()
