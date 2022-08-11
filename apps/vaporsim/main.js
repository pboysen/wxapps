let Random = require("prosemirror/node_modules/random-js")
createjs.MotionGuidePlugin.install()

const maxAtoms = 100, initialSpeed = 2, framerate = 60, startWater = 2

let particles = [], water_level = 120

let random = new Random(Random.engines.mt19937().autoSeed())

function toRadians(degree) { return degree * (Math.PI / 180)}

function randomBetween(min,max) { return random.integer(min,max)}

function dotProduct(ax, ay, bx, by) { return ax * bx + ay * by }

function activeWater() {
	let cnt = 0
	for (let i = maxAtoms; i < particles.length; i++) if (!particles[i].condensed) cnt++
	return cnt
}

class Particle {
	constructor(burner,r,color) {
		this.burner = burner
	    this.r = r
	    this.mass = this.r * this.r
		this.dot = 	new createjs.Shape()
		this.dot.graphics.beginStroke("#666").beginFill(color).setStrokeStyle(1).drawCircle(0,0,r).endStroke()
		this.condensed = false
	}

	place(vapor) {
		let ty = vapor? 118: randomBetween(0,water_level)
		this.x = randomBetween(190-ty/2,210+ty/2)
		this.y = ty + 120
		this.dx = initialSpeed * (random.real(0,1) - 0.5) / this.r
		if (vapor) {
			this.dy = -.3
		} else 
			this.dy = initialSpeed * (random.real(0,1) - 0.5) / this.r
		this.bounce()
		this.move()
	}

	move() {
	    this.x += this.dx
	    this.y += this.dy
	    this.dot.x = this.x
	    this.dot.y = this.y
	}

	bounce() {
		let dx = (this.y-120)/2
		if (this.x < (186-dx)) {
			wall.set(184-dx,this.y)
			this.collide(wall)
		} else if (this.x > (214+dx)) {
			wall.set(216+dx,this.y)
			this.collide(wall)
		}
		if (this.y <= 122) {
			this.y = 122
			if (this.dy)
				this.dy *= -1
			else
				this.dy = .2
		} else if (this.y >= 236) {
			this.y = 236
			if (this.dy)
				this.dy *= -1
			else
				this.dy = -.2
			// add some heat energy
			if (this.burner.isOn()) {
				this.dx += this.dx > 0?.2:-.2
				this.dy -= .2
			}
			if (this.r > 1) this.condense()
		}
	}

	collide(that) {
		if (that.condensed) return
	    let dx = this.x - that.x
	    let dy = this.y - that.y
	    let dr = this.r + that.r
	    let d = dx * dx + dy * dy	    
	    if (d >= dr * dr) return
        // Particles collide
        let collisionDist = Math.sqrt(d + 0.1)
        
        // Find unit vector in direction of collision
        let collisionVi = dx / collisionDist
        let collisionVj = dy / collisionDist
        
        // Find velocity of particle projected on to collision vector
        let collisionV1 = dotProduct(this.dx, this.dy, dx, dy) / collisionDist
        let collisionV2 = dotProduct(that.dx, that.dy, dx, dy) / collisionDist
        
        // Find velocity of particle perpendicular to collision vector
        let perpV1 = dotProduct(this.dx, this.dy, -dy, dx) / collisionDist
        let perpV2 = dotProduct(that.dx, that.dy, -dy, dx) / collisionDist
        
        // Find movement in direction of collision
        let sumMass = this.mass + that.mass
        let diffMass = this.mass - that.mass
        let v1p = (diffMass * collisionV1 + 2 * that.mass * collisionV2) / sumMass
        let v2p = (2 * this.mass * collisionV1 - diffMass * collisionV2) / sumMass
        
        // Update velocities
        this.dx = v1p * collisionVi - perpV1 * collisionVj
        this.dy = v1p * collisionVj + perpV1 * collisionVi
        that.dx = v2p * collisionVi - perpV2 * collisionVj
        that.dy = v2p * collisionVj + perpV2 * collisionVi
        
        // Move to avoid overlap
        let overlap = dr + 1 - collisionDist
        let p1 = overlap * that.mass / sumMass
        let p2 = overlap * this.mass / sumMass
        this.x += collisionVi * p1
        this.y += collisionVj * p1
        that.x -= collisionVi * p2
        that.y -= collisionVj * p2
	}
	
	condense() {
		this.condensed = true
		this.dot.y = 1000
	}
	
	evaporate() {
		this.condensed = false
		this.y = 234
		this.x = randomBetween(130,270)
		this.dy = -.3
		this.move()
	}
}

class Wall {
	constructor() {
		this.x = 0
		this.y = 0
		this.dx = 0
		this.dy = 0
		this.r = 1
		this.mass = 1000000
		this.condensed = false
	}
	
	set(x,y) {
		this.x = x
		this.y = y
		// return some energy back
		this.dx = x < 200?.05:-.05
		this.dy = .05
	}
}

let wall = new Wall()

class Thermometer {
	constructor(stage,x,y) {
		this.y = y
		this.tube = new createjs.Shape()
		this.tube.graphics.beginStroke("#000").beginFill("#FFF").drawRect(x,y,6,100).endStroke()
		this.bulb = new createjs.Shape()
		this.bulb.graphics.beginStroke("#000").beginFill("#F00").drawCircle(x+3,y+105,8).endStroke()
		this.fluid = new createjs.Shape()
		this.fluid.graphics.beginStroke("#000").beginFill("#F00").drawRect(x+1,y+50,4,50).endStroke()
		this.fluid.setBounds(x+1,y+50,4,50)
		this.warn = new createjs.Text("Overheating...please reset","14px Arial","#C00")
		this.warn.x = 700
		this.warn.y = 10
		stage.addChild(this.tube)
		stage.addChild(this.bulb)
		stage.addChild(this.fluid)
		for (let h = 0; h < 100; h += 10) {
			let hash = new createjs.Shape()
			hash.graphics.beginStroke("#888").setStrokeStyle(1).moveTo(x,y+h).lineTo(x+6,y+h).endStroke()
			stage.addChild(hash)
		}
		stage.addChild(this.warn)
	}
	
	heat() {
		let r = this.fluid.getBounds()
		this.fluid.graphics.clear().beginStroke("#000").beginFill("#F00").drawRect(r.x,r.y-1,r.width,r.height+1).endStroke()
		this.fluid.setBounds(r.x,r.y-1,r.width,r.height+1)
	}
	
	getTemp() { return this.fluid.getBounds().height}
	
	overheat() { 
		if (this.fluid.getBounds().y <= this.y) {
			this.warn.x = 100
			this.warn.y = 10
			return true
		} else
			return false
	}
}

class Gauge {
	constructor(stage,x,y) {
		this.angle = toRadians(270)
		this.x = x
		this.y = y
		this.face = new createjs.Shape()
		this.face.graphics.beginStroke("#000").beginFill("#FFF").drawCircle(x,y,15).endStroke()
		this.tube = new createjs.Shape()
		this.tube.graphics.beginStroke("#000").drawRect(x-5,y,6,80).endStroke()
		this.arrow = new createjs.Shape()
		this.arrow.graphics.beginStroke("#080").setStrokeStyle(2).moveTo(this.x,this.y).lineTo(this.x,this.y-15).endStroke()
		stage.addChild(this.tube)
		stage.addChild(this.face)
		for (let i = 0; i < 360; i += 30) {
			let rad = toRadians(270 + i)
			let sx = this.x + 12*Math.cos(rad)
			let sy = this.y + 12*Math.sin(rad)
			let x = this.x + 15*Math.cos(rad)
			let y = this.y + 15*Math.sin(rad)
			let hash = new createjs.Shape()
			hash.graphics.beginStroke("#000").setStrokeStyle(1).moveTo(sx,sy).lineTo(x,y).endStroke()
			stage.addChild(hash)
		}
		stage.addChild(this.arrow)
	}
	
	update() {
		let value = Math.floor(activeWater()/2)
		this.angle = toRadians(270+value)
		let x = this.x + 15*Math.cos(this.angle)
		let y = this.y + 15*Math.sin(this.angle)
		this.arrow.graphics.clear().beginStroke("#080").setStrokeStyle(2).moveTo(this.x,this.y).lineTo(x,y).endStroke()
	}
}

class Beaker {
	constructor(stage,burner,x,y) {
		this.stage = stage
		this.burner = burner
		this.beaker = new createjs.Shape()
		this.beaker.graphics.ss(1).beginStroke("#000").beginFill("#87CEFA").mt(x-20,y).lt(x-20,y+20).arcTo(x-100,y+200,x,y+200,10).lt(x+50,y+200).arcTo(x+100,y+200,x+20,y+20,10).lt(x+20,y+20).lt(x+20,y).endStroke()
		this.beaker.alpha = 0.6
		this.water = new createjs.Shape()
		this.water.graphics.ss(1).beginFill("#87CEFA").mt(x-73,y+140).lt(x-80,y+160).arcTo(x-100,y+200,x,y+200,10).lt(x+50,y+200).arcTo(x+100,y+200,x+20,y+20,10).lt(x+73,y+140).endStroke()
		this.stopper = new createjs.Shape()
		this.stopper.graphics.beginFill("#008").drawRect(x-18,y-5,36,22).endStroke()
		stage.addChild(this.stopper)
		stage.addChild(this.beaker)
		stage.addChild(this.water)
	}
	
	addParticle(r,color,vapor) {
		let p = new Particle(this.burner,r,color)
		p.place(vapor)
		particles.push(p)
		this.stage.addChild(p.dot)
		return p
	}
	
	populate() {
		for (let i = 0; i < maxAtoms; i++) this.addParticle(1,"#444",false)
		for (let i = 0; i < startWater; i++) this.addParticle(2,"#FFF",false)
	}
	
	update() {
        for (let i = 0; i < particles.length; i++) {
        	let p = particles[i]
        	if (!p.condensed) for (let j = i + 1; j < particles.length; j++) p.collide(particles[j])
        }
		particles.forEach(p => { if (!p.condensed) { p.move(); p.bounce() }})
	}
}

class Bunsen {
	constructor(stage,x,y) {
		this.bunsen = new createjs.Bitmap("assets/bunsen.png")
		this.bunsen.x = x
		this.bunsen.y = y
		this.bunsen.scaleX = .3
		this.bunsen.scaleY = .15
		this.flamecover = new createjs.Shape()
		this.flamecover.graphics.beginFill("#FFF").drawRect(x,y,100,35).endStroke()
		stage.addChild(this.bunsen)
		stage.addChild(this.flamecover)
	}
	
	toggle() {
		this.flamecover.alpha = this.flamecover.alpha?0:1
	}
	
	isOn() {
		return this.flamecover.alpha == 0
	}
}

class Buttons {
	constructor(listener) {
		this.run = document.getElementById("run")
		this.burner = document.getElementById("burner")
		this.reset = document.getElementById("reset")
		this.run.addEventListener("click",() => listener.press("run"))
		this.burner.addEventListener("click",() => listener.press("burner"))
		this.reset.addEventListener("click",() => listener.press("reset"))
	}
	
	disableBurner(value) {
		this.burner.disabled = value
	}
}

class VaporSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		this.buttons = new Buttons(this) 
		this.running = false
	}	
	render() {
		this.gauge = new Gauge(this.mainstage,210,70)
		this.thermometer = new Thermometer(this.mainstage,190,30)
		this.bunsen = new Bunsen(this.mainstage,150,302)
		this.beaker = new Beaker(this.mainstage,this.bunsen,200,100)
		this.beaker.populate()
		this.beaker.update()
		this.gauge.update()
	}
	
	getParticle() {
		for (let i = maxAtoms; i < particles.length; i++)
			if (particles[i].condensed) return particles[i]
	    return this.beaker.addParticle(2,"#FFF",true)
	}
	
	evaporate() {
		let inc = this.thermometer.getTemp() - 49
		for (let i = 0; i < inc; i++) this.getParticle().evaporate()
	}
	
	run() {
		this.render()
		createjs.Ticker.framerate = framerate
		let tick = 0
		createjs.Ticker.addEventListener("tick", e => {
			this.mainstage.update()
			if (!this.running) return
			for (let i = 0; i < 2; i++) this.beaker.update()
			if (tick % framerate == 0) {
				if (this.bunsen.isOn()) this.heat()
				this.evaporate()
				this.gauge.update()
			}
			tick++
		})
	}
	
	reset() {
		this.running = false
		this.mainstage.removeAllChildren()
		particles = []
		this.render()
		this.buttons.disableBurner(true)
	}
	
	heat() {
		if (this.thermometer.overheat())
			this.bunsen.toggle()
		else
			this.thermometer.heat()
	}
	
	press(cmd) {
		if (cmd == "run") { 
			this.running = true
			this.buttons.disableBurner(false)
		}
		if (cmd == "burner") {
			this.bunsen.toggle()
		}		
		if (cmd == "reset") this.reset()
	}
}

(new VaporSim()).run()
