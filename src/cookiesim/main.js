import {Graph, getStore} from "../utils"
import {Url} from "url"

let store = getStore(), searchParams = new URLSearchParams(window.location.search.substring(1)), frames = 30

let edit = searchParams.get('mode') == "edit"
let ingredient = searchParams.get('ingredient') || "butter"
let dir = searchParams.get('dir') || "case1"

let cookiedim = {
	control:{w:10.5,h:0.87},
	sugar50:{w:8.7,h:1.78},
	sugar150:{w:11.8,h:0.52},
	allwhite:{w:11.0,h:0.68},
	allbrown:{w:9.9,h:0.98},
	cornsyrup:{w:9.5,h:1.42},
	butter50:{w:9.6,h:0.87},
	butter100:{w:10.5,h:0.87},
	butter150:{w:11.9,h:0.70},
	buttermelted:{w:10.4,h:0.82},
	doughrefr:{w:10.2,h:0.82},
	flour50:{w:13.6,h:0.43},
	flour150:{w:7.6,h:1.68},
	flourcake:{w:10.8,h:0.72},
	flourbread:{w:10.2,h:0.88},
	leaveningnone:{w:9.4,h:1.12},
	leaveningsoda:{w:10.4,h:0.77},
	leaveningsodapowder:{w:10.4,h:0.77}
}
	
function getDeleteRow() {
	let td = document.createElement("td")
	td.setAttribute("class","delete_col")
	let img = document.createElement("img")
	img.setAttribute("src","assets/delete.jpg")
	img.setAttribute("class","delete_img")
	img.setAttribute("alt","Delete this result")
	img.setAttribute("title","Delete this result")
	img.addEventListener("click", event => {
		// <tr><td><img...
		let node = event.target.parentNode.parentNode
		let row = Array.prototype.indexOf.call(node.parentNode.childNodes,node)-4
		let name = store.get(ingredient)[row]
		let title = cookiesim.ingredient.getTitle(name)
		if (confirm("Delete "+title+" cookie?")) {
			cookiesim.deleteResult(row)
		}
	})
	td.appendChild(img)
	return td
}

function getRow(name,ingr) {
	let path = "assets/"+dir+"/"+ingr+"/"
	let tr = document.createElement("tr")
	let td = document.createElement("td")
	td.appendChild(document.createTextNode(name))
	tr.appendChild(td)
	let names = ["structure.png","top.png","side.png"]
	names.forEach(name => {
		td = document.createElement("td")
		let img = document.createElement("img")
		img.setAttribute("src",path+name)
		td.appendChild(img)
		if (name == "top.png") {
			let div = document.createElement("div")
			div.appendChild(document.createTextNode("Width: "+cookiedim[ingr].w+"cm"))
			td.appendChild(div)
		}
		if (name == "side.png") {
			let div = document.createElement("div")
			div.appendChild(document.createTextNode("Height: "+cookiedim[ingr].h+"cm"))
			td.appendChild(div)
		}
		tr.appendChild(td)
	})
	tr.appendChild(getDeleteRow())
	return tr
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

class Dough {
	constructor(level) {
		this.level = level
	    this.ball = new createjs.Container()
		this.ball.x = 80
		this.ball.y = 30
		this.buildDough(level)
	}
	
	buildDough(level) {
		this.ball.removeAllChildren()
		this.shape = new createjs.Shape()
		this.shape.graphics.beginFill("#B5651D").beginStroke("#B5651D").drawEllipse(25,50,200,240)
		this.rect = new createjs.Rectangle(25,50,200,240)
	    this.ball.addChild(this.shape)
	}
	
	setIngredient(dim) {
		// compute width pixels to change for simulation (200 pixels wide * cookie_width/max_width of area)
		this.dw = 200*dim.w/14/frames
		this.dx = this.dw/2
		// compute pixels to change for simulation (240 pixels * cookie_height/max_height of area)
		this.dh = 400*dim.h/1.9/frames
		this.dy = this.dh
	}
	
	update() {
		this.shape.graphics.clear()
		this.rect.x -= this.dx
		this.rect.y += this.dy
		this.rect.width += this.dw
		this.rect.height -= this.dh
		this.shape.graphics.beginFill("#B5651D").beginStroke("#B5651D").drawEllipse(this.rect.x,this.rect.y,this.rect.width,this.rect.height)
	}
}

class Ingredient {
	constructor(titles,inst) {
		this.titles =  titles
		let level = document.getElementById("level")
		for (let v = 0; v < titles.length; v++) {
			let radio = document.createElement("input")
			radio.setAttribute("type","radio")
			radio.setAttribute("name","level")
			radio.setAttribute("value",v)
			if (v == 0) radio.setAttribute("checked","checked")
			level.appendChild(radio)
			let span = document.createElement("span")
			span.appendChild(document.createTextNode(titles[v]))
			level.appendChild(span)
			radio.addEventListener("click", e => cookiesim.render())
		}
		document.getElementById("instruct").innerHTML = inst
	}
	
	buildDoughs(ingredient_names) {
		this.ingredient_names = ingredient_names
		this.doughs = []
		for (let i = 0; i < ingredient_names.length; i++) {
			let dough = new Dough(i)
			this.doughs = this.doughs.concat(dough)
			dough.setIngredient(cookiedim[ingredient_names[i]])
			this.buildIngredients(dough)
			if (this.isBaked(i)) 
				for (let j = 0; j < frames; j++) this.update()
		}
	}
	
	getLevel() {
		return document.querySelector('input[name="level"]:checked').value;
	}
	
	getTitle(name) {
		return this.titles[this.ingredient_names.indexOf(name)]
	}
	
	isBaked(i) {
		let baked = store.get(ingredient)
		return baked.indexOf(this.ingredient_names[i]) > -1
	}
	
	render(stage) {
		let dough = this.doughs[this.getLevel()]
		stage.addChild(dough.ball)
		stage.update()
	}

		
	doneBaking() {
		let level = this.getLevel()
		cookiesim.addResult(this.titles[level],this.ingredient_names[level])
	}
	
	resetDough(level) {
		let dough = this.doughs[level]
		dough.buildDough(level)
		this.buildIngredients(dough,level)
	}
	
	resetAllDoughs() {
		for (let i = 0; i < this.ingredient_names.length; i++) this.resetDough(i)
	}
}

class Butter extends Ingredient {
	constructor() {
		super(["50% Butter","100% Butter","150% Butter"],"The brown dough is shown in the oven (side view). Select the level of butter and click Bake.<br/>" +
				"To show the animation again, delete the desired experimental result.")
		this.buildDoughs(["butter50","butter100","butter150"])
	}
	
	buildIngredients(dough) {
		let butter = new createjs.Container()
		butter.x = 25
		butter.y = 50
		for (let i = 0; i <= dough.level; i++) {
			let glob = new createjs.Container()
			glob.x = [75,25,125][i]
			glob.y = [50,100,150][i]
			for (let row = 0; row < 2; row++) {
				for (let j = 0; j < 5; j++) {
					let x = 8*j+4*row
					let crystal = new createjs.Shape()
					crystal.graphics.beginFill("yellow").drawCircle(x, row*8, 4)
					glob.addChild(crystal)
				}
			}
			butter.addChild(glob)
		}
		dough.ball.addChild(butter)
	}
	
	update() {
		let dough = this.doughs[this.getLevel()] 
		dough.update()
		dough.ball.getChildAt(1).children.forEach(glob => {
			if (glob.y <= dough.rect.y) glob.y += 5
			glob.children.forEach(crystal => {
				crystal.x += Math.random() < 0.5? 1:-1
				crystal.y += Math.random() < 0.5? 1:-1
			})
		})
	}
}

class Sugar extends Ingredient {
	constructor() {
		super(["50%","100%","150%"],"The brown dough is shown in the oven. Select the level of sugar and click Bake.<br/>" +
				"To show the animation again, delete the desired experimental result.")
		this.buildDoughs(["butter50","control","butter150"])
	}
	
		
	update() {
	}
}

class Flour extends Ingredient {
	constructor() {
		super(["50%","100%","150%","Cake","Bread"],"The dough is shown in the oven. Select the level of flour and click Bake.")
		this.buildDoughs(["sugar50","control","sugar150"])
	}

	update() {
	}
}

class Leavening extends Ingredient {
	constructor() {
		super(["none","soda","soda and baking powder"],"The dough is shown in the oven. Select the level of leavening and click Bake.")
		this.buildDoughs(["butter50","control","butter150"])
	}

	update() {
	}

}

class CookieSim {
	constructor() {
		this.bakeButton = document.getElementById("bake")
		this.bakeButton.addEventListener("click", e => this.bake())
		this.table = document.getElementById("results").children[0]
		document.getElementById("delete_all").addEventListener("click",e => {
			if (confirm("Delete all results?")) this.deleteResults()
		})
		this.mainstage = new createjs.Stage("maincanvas")
		switch(ingredient) {
		case "butter": {
			this.ingredient = new Butter()
			break;
		}
		case "sugar": {
			this.ingredient = new Sugar()
			break;
		}
		case "flour": {
			this.ingredient = new Flour()
			break;
		}
		case "leavening": {
			this.ingredient = new Leavening()
			break;
		}
		default: 
			alert("Unknown ingredient")
		}
		this.render()
		this.showResults()
		this.run()
	}
	
	render() {
		this.running = false
		this.mainstage.removeAllChildren()
		this.showGrid()
		this.ingredient.render(this.mainstage)
		this.bakeButton.disabled = this.ingredient.isBaked(this.ingredient.getLevel())
	}
	
	bake() {
		this.running = true
		this.bakeButton.disabled = true
	}
	
	update() {
		this.ingredient.update()
		this.mainstage.update()
	}
	
	showGrid() {
		for(let x = 0; x < 400; x+=20) {
			let horz = new createjs.Shape()
			horz.graphics.setStrokeDash([2,2])
			horz.graphics.beginStroke("#EEE").setStrokeStyle(1).moveTo(x,0)
			horz.graphics.lineTo(x,300)
			horz.graphics.endStroke()
			this.mainstage.addChild(horz)
		}
		for(let y = 0; y < 300; y+=20) {
			let vert = new createjs.Shape()
			vert.graphics.setStrokeDash([2,2])
			vert.graphics.beginStroke("#EEE").setStrokeStyle(1).moveTo(0,y)
			vert.graphics.lineTo(400,y)
			vert.graphics.endStroke()
			this.mainstage.addChild(vert)
		}
	}
	
	run() {
		createjs.Ticker.framerate = frames
		let tick = 0
		this.render()
		createjs.Ticker.addEventListener("tick", e => {
			if (this.running) {
				this.update(tick)
				tick++
				if (tick > frames) {
					this.running = false
					this.ingredient.doneBaking()
				}
			} else
				tick = 0
		})
	}
	
	addResult(name,ingr) {
		this.table.appendChild(getRow(name,ingr))
		let trials = store.get(ingredient)
		if (!trials) trials = []
		store.set(ingredient,trials.concat(ingr))
	}

	deleteResult(row) {
		let trials = store.get(ingredient)
		let name = trials[row]
		trials.splice(row,1) // adjust for permanent rows in table
		store.set(ingredient,trials)
		this.ingredient.resetDough(this.ingredient.ingredient_names.indexOf(name))
		this.render()
		this.showResults()
	}
	
	deleteResults() {
		store.set(ingredient,[])
		this.ingredient.resetAllDoughs()
		this.render(this.mainstage)
		this.showResults()
		this.render()
	}
	
	showResults() {
		for (let i = this.table.children.length-1; i > 1 ; i--) this.table.removeChild(this.table.children[i])
		let trials = store.get(ingredient)
		if (trials)
			trials.forEach(ingr => this.table.appendChild(getRow(this.ingredient.getTitle(ingr),ingr)))
		else
			store.set(ingredient,[])
	}
}

let cookiesim = new CookieSim()
