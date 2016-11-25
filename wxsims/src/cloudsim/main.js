import {getStore} from "../utils"
import {Url} from "url"

createjs.MotionGuidePlugin.install()
let searchParams = new URLSearchParams(window.location.search.substring(1))

let tool = searchParams.get('tool') || "grid"

let store = getStore()
let init_grid_clouds = [
	"altocumulus1","cumulonimbus1","cirrocumulus1","nimbostratus1","blank",
	"cumulonimbus2","stratus1","nimbostratus2","cirrus1","cirrostratus1",
	"stratocumulus1","altostratus1","cumulonimbus3","blank","blank"
]

let init_stability_clouds = [
	"altocumulus1","cumulus1","stratus1","cirrostratus1","nimbostratus1", 
	"cirrus1","cumulonimbus3","cumulus2", "altostratus1","altocumulus2"
                    ]
let clouds = []
let forms = ["streaks","sheets","heaps","rain","rain"]

function getClouds() {
	let clouds = store.get(tool+"_clouds")
	if (!clouds) {
		clouds = tool == "grid"? init_grid_clouds: init_stability_clouds
		store.set(tool+"_clouds",clouds)
	}
	return clouds
}

function updateClouds() {
	// sort clouds by y location (reversed) and x
	let map = []
	clouds.forEach(c => {
		map = map.concat({name:c.name,x:c.x,y:c.y})
	})
	map.sort(tool == "grid"?
		function compare(a,b) {
			// y is in reverse order
			if (a.y > b.y) return 1
			if (a.y < b.y) return -1
			if (a.x > b.x) return 1
			if (a.x < b.x) return -1
			return 0
		}:
			function compare(a,b) {
			if (a.y > 200 && b.y < 200) return 1
			if (a.y < b.y) return -1
			return 1
		}
	)
			
	let newclouds = []
	map.forEach(c => { newclouds = newclouds.concat(c.name) })
	store.set(tool+"_clouds",newclouds)
}

function removeClouds() {
	store.remove(tool+"_clouds")
}

class Cloud {
	constructor(stage,name,x,y) {
		let cloud = new createjs.Container()
		cloud.x = x
		cloud.y = y
		cloud.cursor = "grab"
		cloud.name = name
		let bmap = new createjs.Bitmap("assets/"+name+".png")
		bmap.scaleX = 0.5
		bmap.scaleY = 0.5
		let txt = new createjs.Text(name.slice(0,-1),"12px Arial","#FFF")
		txt.x = 15
		txt.y = 85
		cloud.addChild(bmap)
		cloud.addChild(txt)
		let ofx = 0, ofy = 0, orgx = 0, orgy = 0
		bmap.addEventListener("mousedown", e => {
		    ofx = cloud.x - e.stageX
		    ofy = cloud.y - e.stageY
		    orgx = cloud.x
		    orgy = cloud.y
		    cloud.cursor = "grabbing"
		    stage.setChildIndex( cloud, stage.getNumChildren()-1)
		});
		bmap.addEventListener("pressmove", e => {
		    cloud.x = e.stageX + ofx
		    cloud.y = e.stageY + ofy
		});
		bmap.addEventListener("pressup", e => {
		    cloud.cursor = "grab"
		    let dropped = null
		    clouds.forEach(c => {
		    	let r = new createjs.Rectangle(c.x,c.y,100,100)
		    	if (r.contains(e.stageX,e.stageY) && c.name != cloud.name) dropped = c
		    })
		    if (dropped) {
		    	// swap clouds
		    	let dx = dropped.x, dy = dropped.y
		    	dropped.x = orgx
		    	dropped.y = orgy
		    	cloud.x = dx
		    	cloud.y = dy
		    	updateClouds()
		    } else {
		    	cloud.x = orgx
		    	cloud.y = orgy
		    }
		})
		return cloud
	}
}

class Grid {
	constructor(stage,xorg,yorg) {
		for (let y = yorg; y <= yorg+306; y += 102) {
			let horz = new createjs.Shape()
			horz.graphics.beginStroke("#000").moveTo(xorg,y).lineTo(xorg+510,y).endStroke()
			stage.addChild(horz)
			for (let x = xorg; x <= xorg+510; x += 102) {
				let vert = new createjs.Shape()
				vert.graphics.beginStroke("#000").moveTo(x,yorg).lineTo(x,yorg+306).endStroke()
				stage.addChild(vert)
			}
		}
		for (let i = 1 ; i <= 3; i++) {
			let level = new createjs.Text("Level "+(4-i),"12px Arial","#00F")
			level.x = 5
			level.y = yorg + 50 + 100*(i-1)
			stage.addChild(level)
		}
		let fx = xorg + 40
		forms.forEach(name => {
			let form = new createjs.Text(name,"12px Arial","#00F")
			form.x = fx
			form.y = yorg - 15
			fx += 100
			stage.addChild(form)
		})
		this.showClouds(stage,xorg,yorg)
	}
	
	showClouds(stage,xorg,yorg) {
		let x = xorg + 1
		let y = yorg + 1
		getClouds().forEach(name => {
			let c = new Cloud(stage,name,x,y)
			clouds = clouds.concat(c)
			stage.addChild(c)
			x+= 102
			if (x > (xorg+510)) {
				x = xorg + 1
				y += 102
			}
		})
	}
}

class WarmAirBox {
	constructor(stage,name,xorg,yorg) {
		let rec = new createjs.Shape()
		rec.graphics.beginStroke("#000").beginFill("#FFA07A").drawRect(xorg,yorg,580,180).endStroke()
		let front = new createjs.Shape()
		front.graphics.beginStroke("#000").beginFill("#D2B48C").drawRect(xorg,yorg+160,580,20).endStroke()
		let slope = new createjs.Shape()
		slope.graphics.beginStroke("#000").beginFill("#87CEFA").moveTo(xorg+20,yorg+160).lineTo(xorg+580,yorg+100).lineTo(xorg+580,yorg+160).lineTo(xorg+20,yorg+160).endStroke()
		let title = new createjs.Text(name,"bold 12px Arial","#00F")
		title.x = xorg+5
		title.y = yorg+10
		let sfront = new createjs.Text("surface front","bold 12px Arial","#000")
		sfront.x = xorg+25
		sfront.y = yorg+165
		let cool = new createjs.Text("cool air","bold 12px Arial","#000")
		cool.x = xorg+300
		cool.y = yorg+135
		stage.addChild(rec,front,slope,title,sfront,cool)
	}
}

class Stability {
	constructor(stage,xorg,yorg) {
		let top = new WarmAirBox(stage,"Warm Air(stable)",xorg,yorg)
		let bot = new WarmAirBox(stage,"Warm Air(unstable)",xorg,yorg+200)
		this.showClouds(stage,xorg,yorg)
	}
	
	showClouds(stage,xorg,yorg) {
		let x = xorg + 30
		let y = yorg + 50
		getClouds().forEach(name => {
			let c = new Cloud(stage,name,x,y)
			clouds = clouds.concat(c)
			stage.addChild(c)
			x += 103
			y -= 11
			if (x > (xorg+500)) {
				x = xorg + 40
				y = yorg + 245
			}
		})
	}
}

class CloudSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		createjs.Touch.enable(this.mainstage)
		this.mainstage.enableMouseOver()
		let inst = document.getElementById("instruct")
		let reset = document.getElementById("reset")
		switch (tool) {
			case "grid": {
				this.grid = new Grid(this.mainstage,50,50)
				inst.innerHTML = "Rearrange the clouds by dragging and dropping to the correct level and form.<br/>" +
					"Clouds with multiple copies should be placed in a rain column at the correct levels."
				reset.addEventListener("click", e => {
					removeClouds()
					clouds.forEach(c => this.mainstage.removeChild(c))
					this.grid.showClouds(this.mainstage,50,50)
				})
				break;
			}
			case "stability": {
				this.stability = new Stability(this.mainstage,10,10)
				inst.innerHTML = "Rearrange the clouds by dragging and dropping to the correct stability and altitude."
				reset.addEventListener("click", e => {
					removeClouds()
					clouds.forEach(c => this.mainstage.removeChild(c))
					this.stability.showClouds(this.mainstage,10,10)
				})
				break;
			}
		}
		let dl = document.getElementById("download")
		dl.addEventListener("click", e => {
			let dt = this.mainstage.canvas.toDataURL('image/png')
			/* Change MIME type to trick the browser to downlaod the file instead of displaying it */
			dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
			/* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
			dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=clouds.png');
			dl.href = dt;
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

(new CloudSim()).run()