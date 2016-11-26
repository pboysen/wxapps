import {Graph} from "../utils"
 
createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])
createjs.Ticker.framerate = 10

const points = 17, balloon_x = 200, balloon_y = 270

const surface_times = ["sand-day","plowed-day","grass-day","snow-day","sand-night","plowed-night","grass-night","snow-night"]
                      
function getData() {
	return {
		"pressure": [1000,990,980,970,960,950,940,930,920,910,900,890,880,870,860,850,840],
		"altitude": [0,80.97,162.85,245.69,329.48,414.24,499.99,586.75,674.48,763.11,852.64,942.95,1034.00,1125.84,1218.44,1311.81,1405.99],
		"sand-day": [285,284.2,283.4,282.5,281.7,280.9,280,279.2,278.3,277.4,276.5,275.5,274.8,274,273,272.2,271.3],
		"sand-night": [278.4,278.5,278.7,278.8,279.5,280.1,280,279.2,278.3,277.4,276.5,275.2,274.8,274,273,272.2,271.3],
		"plowed-day": [283,282.2,281.4,280.5,279.7,278.9,278,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"plowed-night": [276.4,276.5,276.7,276.8,277.5,278.1,278,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"grass-day": [281,280.2,279.4,278.6,277.7,276.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"grass-night": [274.4,274.5,274.7,274.9,275.5,276.1,276.8,277.2,277,276.8,276.5,275.2,274.8,274,273,272.2,271.3],
		"snow-day": [273,273.2,273.4,273.7,274.6,275.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3],
		"snow-night": [268,270,271.8,273.2,274.6,275.9,276.8,277.2,277,276.8,276.5,275.5,274.8,274,273,272.2,271.3]
	}
}

function toFahrenheit(kelvin) {
	return (kelvin - 273.15) * 9 / 5 + 32
}

function toCentigrade(kelvin) {
	return (kelvin - 273.15)
}

class Image {
	constructor(prefix) {
		this.day = new createjs.Bitmap(prefix+".jpg")
		this.day.x = -1000
		this.day.y = 0
		this.night = new createjs.Bitmap(prefix+"-night.jpg")
		this.night.x = -1000
		this.night.y = 0
	}
	
	show(time) {
		if (time == "day")
			this.day.x = 0 
		else
			this.night.x = 0
	}
	
	hide() { 
		this.day.x = this.night.x = -1000
	}
}

class Settings {
	constructor() {
		this.setValue(document.querySelector('input[name="choice"]:checked').value)
		this.listener = null
		let radios = document.querySelectorAll('input[name="choice"]')
		for (let i = 0; i < radios.length; i++) {
			radios[i].addEventListener("change", e => {
				this.setValue(e.target.value)
				if (this.listener) this.listener(this.surface,this.time)
			})
		}
	}
	
	setValue(value) {
		this.value = value
		let v = value.split("-")
		this.surface = v[0]
		this.time = v[1]
		let radios = document.querySelectorAll('input[name="choice"]')
  		for (let i = 0; i < radios.length; i++) {
			let radio = radios[i]
			if (radio.value == value) radio.checked = true
		}
	}
 	
	getValue() { return this.value }
	
	getSurface() { return this.surface }

	getTime() { return this.time }

	addListener(listener) { this.listener = listener }
}

class Buttons {
	constructor() {
		this.plot = document.getElementById("plot")
		this.clearLast = document.getElementById("clearLast")
		this.clearAll = document.getElementById("clearAll")
		this.plot.disabled = false
		this.clearLast.disabled = false
		this.clearAll.disabled = false
	}
	
	addListener(listener) { 
		this.plot.addEventListener("click", e => listener(e))
		this.clearLast.addEventListener("click", e => listener(e))
		this.clearAll.addEventListener("click", e => listener(e))
	}
}

class ATGraph extends Graph {
	constructor(stage) {
		super({
			stage: stage,
			w: 300,
			h: 300,
			xlabel: "Temperature(C)",
			ylabel: "Height (m)",
			xscale: "linear",
			yscale: "linear",
			minX: -8,
			maxX: 12,
			minY: 0,
			maxY: 1500,
			majorX: 2,
			minorX: 1,
			majorY: 100,
			minorY: 50
		})
	}
	
	render() {
		super.render()
		this.color = "#888"
		this.dotted = false
		for (let t = -8; t < 14; t += 2) {
            let x = this.xaxis.getLoc(t)
            let y = this.yaxis.getLoc(0)
			this.drawLine(x,y,x,this.yaxis.getLoc(1500))
		}
		for (let z = 0; z < 1500; z += 100) {
            let x = this.xaxis.getLoc(-8)
            let y = this.yaxis.getLoc(z)
			this.drawLine(x,y,this.xaxis.getLoc(12),y)
		}
		let day = new createjs.Text("Day","9px Arial","#000")
		day.x = 10
		day.y = 285
		let dayline = new createjs.Shape()
		dayline.graphics.setStrokeStyle(3).beginStroke("#000").moveTo(35,290).lineTo(50,290).endStroke()
		let night = new createjs.Text("Night","9px Arial","#000")
		night.x = 70
		night.y = 285
		let nightline = new createjs.Shape()
		nightline.graphics.setStrokeStyle(1).beginStroke("#000").moveTo(100,290).lineTo(115,290).endStroke()
		this.stage.addChild(day)
		this.stage.addChild(dayline)
		this.stage.addChild(night)
		this.stage.addChild(nightline)
	}
}

class Rad {
	constructor(stage, settings, atgraph) {
		this.stage = stage
		this.settings = settings
		this.atgraph = atgraph
		this.images = [
		    new Image("assets/desert"),
		    new Image("assets/plowed"),
		    new Image("assets/grass"),
		    new Image("assets/snow")
		]
		this.lastImage = this.images[0]
		this.surfaces = ["sand","plowed","grass","snow"]
		this.colors = {sand:"#8A4117",plowed: /*"#A52A2A"*/"#000", grass: "#667C26", snow: "#0000FF"}
		this.plotted = {
			"sand-day":[],"sand-night":[],"plowed-day": [], "plowed-night":[],
			"grass-day":[],"grass-night":[],"snow-day": [], "snow-night":[]
		}
		this.clearProfiles()
		this.profiles = []
		              
		this.balloon = new createjs.Bitmap("assets/balloon.png")
		this.balloon.x = balloon_x
		this.balloon.y = balloon_y
		this.balloon.scaleX = 0.15
		this.balloon.scaleY = 0.15
		this.height = new createjs.Text("","12px Arial","#FFF")
		this.data = getData()
		this.sun = new createjs.Shape().set({x:420,y:20})
		this.sun.graphics.beginFill("#FFFF00").drawCircle(0,0,10)
		this.moon = new createjs.Shape().set({x:420,y:20})
		this.moon.graphics.beginFill("#FFFFFF").drawCircle(0,0,10)
		this.settings.addListener((s,t) => this.changeSetting(s,t))
		this.balloon.addEventListener("pressmove", e => {
			e.nativeEvent.preventDefault()
			if (e.stageY < balloon_y) this.showBalloon(e.stageY)
		})
		this.balloon.addEventListener("pressup", e => {
			e.nativeEvent.preventDefault()
			let i = this.getAltIndex(), alt = this.data.altitude[i]
			let y = this.atgraph.yaxis.getLoc(alt)
			this.showBalloon(y)
		})
		this.changeSetting(this.settings.getSurface(),this.settings.getTime())
	}
	
	render() {
		this.addChildren()
		this.showBalloon(balloon_y)
	}
	
	showBalloon(y) {
		this.balloon.x = balloon_x
		this.balloon.y = y
	    this.height.x = balloon_x + 20
	    this.height.y = y+10
	    this.height.text = parseInt(this.atgraph.yaxis.getValue(y))
	}
		
	addChildren() {
		this.images.forEach(img => {
			this.stage.addChild(img.day)
			this.stage.addChild(img.night)
		})
		this.stage.addChild(this.balloon)
		this.stage.addChild(this.height)
		this.stage.addChild(this.sun)
		this.stage.addChild(this.moon)
	}
	
	clearProfiles() {
		surface_times.forEach(st => this.clearProfile(st))
		this.profiles = []
	}
	
	clearProfile(st) {
		this.plotted[st] = []
		for (let i = 0; i < points; i++) this.plotted[st].push(false)
	}
	
	hasPlots(st) {
		for (let i = 0; i < points; i++) if(this.plotted[st][i]) return true
		return false
	}
	
	changeSetting(surface,time) {
		this.lastImage.hide()
		this.lastImage = this.images[this.surfaces.indexOf(surface)]		                             
		this.lastImage.show(time)
		this.showTime()
		this.atgraph.setColor(this.colors[surface])
		this.atgraph.setDotted(time == "night")
		this.showBalloon(balloon_y)
		this.profiles.push(surface+"-"+time)
	}
	
	showTime() {
		let path = [420,20, 400,20, 380,20]
		if (this.settings.getTime() == "day") {
			this.moon.x = 420
			createjs.Tween.get(this.sun).to({guide:{path:path}},500).play()
		} else {
			this.sun.x = 420
			createjs.Tween.get(this.moon).to({guide:{path:path}},500).play()
		}
	}

	getAltIndex() {
		let alt = 1500.0 * (balloon_y-this.balloon.y)/balloon_y
		let i = points - 1
		while(this.data.altitude[i] > alt) i--
		return i
	}
	
	plot() {
		this.plotted[this.settings.getValue()][this.getAltIndex()] = true
		this.plotProfiles()
	}
	
	plotProfiles() { 
		this.atgraph.clear()
		this.atgraph.render()
		surface_times.forEach(st => {
			let v = st.split("-")
			this.atgraph.setColor(this.colors[v[0]])
			this.atgraph.setWidth(v[1] == "night"? 1: 3)
			let alts = this.data.altitude
			let temps = this.data[st]
			for(let i = 0; i < points; i++) {
				if (this.plotted[st][i] === true) {
					this.atgraph.plot(toCentigrade(temps[i]),alts[i])
				}
			}
		})
	}
	
	clear() {
		this.stage.removeAllChildren()
		this.clearProfiles()
		this.render()
	}
	
	clearLast() {
		this.showBalloon(balloon_y)
		if (!this.profiles.length) return
		let st = this.profiles[this.profiles.length-1]
		if (!this.hasPlots(st)) {
			this.profiles.pop()
			st = this.profiles[this.profiles.length-1]
			this.settings.setValue(st)
			this.atgraph.setColor(this.settings.getSurface())
			this.atgraph.setDotted(this.settings.getTime() == "night")
		}
		this.clearProfile(st)
		this.plotProfiles()
	}
	
	clearAll() {
		this.showBalloon(balloon_y)
		this.clearProfiles()
		this.plotProfiles()
	}
}

class RadSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		createjs.Touch.enable(this.mainstage)
		this.atstage = new createjs.Stage("atgraph")
		this.buttons = new Buttons()
		this.settings = new Settings()
		this.atgraph = new ATGraph(this.atstage)
		this.rad = new Rad(this.mainstage, this.settings, this.atgraph)
		this.rad.render()
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "plot":
				this.rad.plot()
				break
			case "clearLast":
				this.rad.clearLast()
				break;
			case "clearAll":
				this.rad.clearAll()
				break;
			}
		})
	}
		
	render() {
		this.atgraph.render()
		this.rad.render()
		createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED
		createjs.Ticker.addEventListener("tick", e => {
			this.atstage.update()
			this.mainstage.update()
		})
	}
}

(new RadSim()).render()
