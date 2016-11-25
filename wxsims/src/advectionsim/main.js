import {Graph} from "../utils"
 
createjs.MotionGuidePlugin.install()
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin])

const ncontour = 15, pixpermile = .25, milesperknot = 1.15

function toRadians(degree) { return degree * (Math.PI / 180)}

let contour = [
	{degree:"<35",color:"#008080"},
    {degree:"40",color:"#08F"},
    {degree:"45",color:"#8FF"},
    {degree:"50",color:"#64E986"},
    {degree:"55",color:"#FFDB58"},
    {degree:"60",color:"#C68E17"},
    {degree:"65",color:"#CCC"},
    {degree:"70",color:"#AAA"},
    {degree:"75",color:"#888"},
    {degree:"80",color:"#844"},
    {degree:"85",color:"#F84"},
    {degree:"90",color:"#F88"},
    {degree:"95",color:"#F08"},
    {degree:"100",color:"#F00"},
    {degree:">100",color:"#444"}
]

let city = [
    {name: "Des Moines, IA", x: 383, y:142},
    {name: "Seattle, WA", x: 63, y:31},
    {name: "Los Angeles, CA", x: 47, y:228},
    {name: "Denver, CO", x: 245, y:175},
    {name: "Dallas, TX", x: 314, y:295},
    {name: "Chicago, IL", x: 454, y:137},
    {name: "New York, NY", x: 627, y:136},
    {name: "Atlanta, GA", x: 528, y:268}
]
 
class Settings {
	constructor(change) {
		this.wind = document.getElementById("wind")
		this.windout = document.getElementById("windout")
		this.wdir = document.getElementById("wdir")
		this.duration = document.getElementById("duration")
		this.durationout = document.getElementById("durationout")
		this.spacing = document.getElementById("spacing")
		this.mute = document.getElementById("mute")
		this.listener = null
		function slidef(e,input, out, f) {
	    	e.stopPropagation()
	    	out.value = input.valueAsNumber
	    	if (f) f(input)
		}
		// IE doesn't have an input event but a change event
		let event = /msie|trident/g.test(window.navigator.userAgent.toLowerCase())?"change":"input"
		this.wind.addEventListener(event, e => slidef(e,this.wind,this.windout,this.listener))
		this.duration.addEventListener(event, e => slidef(e,this.duration,this.durationout,this.listener))
		this.setWind(5)
		this.setDuration(5)
	}

	addChangeListener(listener) {
		this.wdir.addEventListener("change", e => {
	    	e.stopPropagation()
	    	if (listener) listener.changeDir()
		})
		this.spacing.addEventListener("change", e => {
	    	e.stopPropagation()
	    	if (listener) listener.changeSpacing()
		})
	}

	addMuteListener(listener) {
		this.mute.addEventListener("click", e => {
	    	e.stopPropagation()
	    	if (listener) listener.changeMute()
		})
	}

	getWind() { return this.wind.valueAsNumber }
	
	setWind(w) {
		this.wind.value = w
		this.windout.value = w
	}

	getDir() { return parseInt(this.wdir.options[this.wdir.selectedIndex].value) }

	getDuration() { return this.duration.valueAsNumber }
	
	setDuration(d) {
		this.duration.value = d
		this.durationout.value = d
	}

	getSpacing() { return parseInt(this.spacing.options[this.spacing.selectedIndex].value) }

	getMute() { return this.mute.checked }

	addListener(listener) { this.listener = listener }
}

class Buttons {
	constructor() {
		this.run = document.getElementById("run")
		this.pause = document.getElementById("pause")
		this.reset = document.getElementById("reset")
	}
	
	addListener(listener) { 
		this.run.addEventListener("click", e => listener(e))
		this.pause.addEventListener("click", e => listener(e))
		this.reset.addEventListener("click", e => listener(e))
	}
}

class Cities {
	constructor(stage,contours,dir) {
		this.contours = contours
		this.temps = []
		this.winds = []
		city.forEach(c => {
			let s = new createjs.Shape()
			s.graphics.setStrokeStyle(2).beginStroke("#000").beginFill("#000").drawCircle(c.x,c.y,2).endStroke()
			stage.addChild(s)
			let t = new createjs.Text(c.name,"10px Arial","#000")
			t.x = c.x - 20
			t.y = c.y - 30
			stage.addChild(t)
			let temp = new createjs.Text("","10px Arial","#000")
			temp.x = c.x - 15
			temp.y = c.y - 15
			stage.addChild(temp)
			this.temps.push(temp)
			let wind = new createjs.Shape()
			stage.addChild(wind)
			this.winds.push(wind)
		})
		this.updateTemps()
		this.updateDir(dir)
	}
	
	updateDir(dir) {
		let radians = toRadians(dir)
		let dx = Math.floor(20*Math.cos(radians))
		let dy = Math.floor(20*Math.sin(radians))
		for (let i = 0; i < city.length; i++) {
			let c = city[i], w = this.winds[i]
			let x = Math.floor(c.x+dx)
			let y = Math.floor(c.y+dy)
			w.graphics.clear().setStrokeStyle(2).beginStroke("#000").mt(c.x,c.y).lineTo(x,y).endStroke()
		}
	}
	
	updateTemps() {
		for (let i = 0; i < city.length; i++) {
			let t = this.temps[i], c = city[i]
			t.text = this.contours.getDegrees(c.x,c.y)
		}
	}	
}

class Contours {
	constructor(stage,spacing) {
		this.stage = stage
		this.contours = new createjs.Container()
		stage.addChild(this.contours)
		this.render(spacing)
		this.reset()
	}
	
	reset() {
		this.contours.x = 0
		this.contours.y = -50
	}
	
	render(spacing) {
		spacing = spacing/4 // convert to pixel height
		let y = spacing/2 + 50
		for (let i = 0; i < ncontour; i++) {
			let c = new createjs.Shape()
			c.graphics.setStrokeStyle(spacing).beginStroke(contour[i].color).mt(-100,y).lt(800,y).endStroke()
			this.contours.addChild(c)
			y += spacing
		}
	}
	
	getDegrees(x,y) {
		x -= this.contours.x
		y -= this.contours.y
		for (let i = 0; i < ncontour; i++) {
			let c = this.contours.getChildAt(i)
			if (c.hitTest(x,y)) return contour[i].degree
		}
		return contour[ncontour-1].degree
	}
	
	updateSpacing(spacing) {
		this.contours.removeAllChildren()
		this.render(spacing)
	}
	
	move(dx,dy) {
		this.contours.x += dx
		this.contours.y += dy
	}
}

class USMap {
	constructor(stage, settings, finish) {
		this.stage = stage
		this.settings = settings
		this.finish = finish
		this.time = 0
		this.dx = 0
		this.dy = 0
		this.settings.addChangeListener(this)
		this.map = new createjs.Bitmap("assets/usmap.jpg")
		this.map.scaleY = 0.9
		this.map.alpha = .3
		this.contours = new Contours(stage,settings.getSpacing())
		this.stage.addChild(this.map)
		let y = 10
		for (let i = 0; i < ncontour; i++) {
			let r = new createjs.Shape()
			r.graphics.setStrokeStyle(1).beginStroke("#000").beginFill(contour[i].color).rect(670,y,30,25).endStroke()
			let t = new createjs.Text(contour[i].degree,"bold 10px Arial","#FFF")
			t.x = 675
			t.y = y+7
			stage.addChild(r)
			stage.addChild(t)
			y += 25
		}
		this.cities = new Cities(stage, this.contours, settings.getDir())
		this.updateVelocity()
	}
	
	reset() {
		this.contours.reset()
		this.cities.updateTemps()
		this.time = 0
	}
	
	changeDir() {
		this.cities.updateDir(this.settings.getDir())
		this.updateVelocity()
	}
	
	changeSpacing() {
		this.contours.updateSpacing(this.settings.getSpacing())
		this.cities.updateTemps()
		this.updateVelocity()
	}
	
	updateVelocity() {
		let radians = toRadians(this.settings.getDir()+180)
		let speed = milesperknot * pixpermile * this.settings.getWind()
		this.dx = speed*Math.cos(radians)
		this.dy = speed*Math.sin(radians)
	}
	
	update() {
		if (this.time < this.settings.getDuration()) {
			this.contours.move(this.dx,this.dy)
			this.cities.updateTemps()
			this.time++
		} else if (this.finish) 
			this.finish()
	}
}

class AdvectionSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		this.buttons = new Buttons()
		this.settings = new Settings()
		this.usmap = new USMap(this.mainstage, this.settings, () => {
			this.buttons.reset.disabled = false
			this.buttons.pause.disabled = true
			this.wind.paused = true
		})
		createjs.Sound.registerSound({id: "wind", src:"assets/wind.mp3"})
		createjs.Sound.on("fileload", e => {
			this.wind = createjs.Sound.play("wind",{loop: -1})
			this.wind.paused = true
		})
		this.running = false
		this.buttons.addListener(e => {
			switch(e.target.id) {
			case "run":
				this.enablePlay(false)
				this.buttons.pause.value = "Pause"
				this.running = true
				this.usmap.updateVelocity()
				this.playAudio(true)
				break
			case "pause":
				this.running = !this.running
				e.target.value = this.running? "Pause":"Resume"
				this.playAudio(this.running)
				break
			case "reset":
				this.reset()
				this.playAudio(false)
				break
			}
		})
		this.settings.addMuteListener(this)
	}
	
	playAudio(value) {
		if (this.settings.getMute()) return
		this.wind.paused = !value
	}
	
	changeMute() {
		if (this.settings.getMute())
			this.wind.paused = true
		else if (this.running) 
			this.wind.paused = false
	}
	
	reset() {
		this.enablePlay(true)
		this.running = false
		this.usmap.reset()
	}
	
	enablePlay(play) {
		this.buttons.run.disabled = !play
		this.buttons.pause.disabled = play
	}
	
	run() {
		this.settings.mute.checked = false
		this.buttons.run.disabled = false
		this.buttons.pause.disabled = true
		this.buttons.reset.disabled = false
		createjs.Ticker.framerate = 2
		let tick = 0
		createjs.Ticker.addEventListener("tick", e => {
			if (this.running) this.usmap.update()
			this.mainstage.update()
			tick++
		})
	}
}

(new AdvectionSim()).run()
