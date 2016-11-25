import {Url} from "url"

createjs.MotionGuidePlugin.install()
let searchParams = new URLSearchParams(window.location.search.substring(1))

function dist(x1,y1,x2,y2) { return Math.hypot(x2-x1,y2-y1) }
/*
<iframe allowfullscreen="" frameborder="0" height="280" src="https://www.youtube.com/embed/WOEty4wIs8U" width="500">
{
	image: "",
	spots: [
	    {
		  x:5,
		  y:10,
		  radius:10, 
		  window: {
			url: "https://www.youtube.com/embed/WOEty4wIs8U",
			title: "",
			features: "height=570,width=520,scrollbars=yes",
			embed: { width: 570, height: 520 }
	      }
		}
    ]
}
*/

let map = null, mapurl = searchParams.get('map'), mode = searchParams.get('mode') || "view"

function getFileData(url,f) {
	if (!url) return
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
	    	f(xmlhttp.responseText)
	}
	xmlhttp.open("GET", url, true)
	xmlhttp.send()
}

class HotspotSim {
	constructor() {
		this.mainstage = new createjs.Stage("maincanvas")
		createjs.Touch.enable(this.mainstage)
		this.mainstage.enableMouseOver()
		let inst = document.getElementById("instruct")
		this.textarea = document.getElementById("maptext")
		if (mode === "view") {
			inst.innerHTML = "Click on a numbered circle to view content."
			let edit = document.getElementById("edit")
			edit.style.display = "none"
		} else {
			inst.innerHTML = "<ul><li>Click and drag on the image to create a hotspot</li><li>Edit the text editor to update the hotspot parameters</li><li>Click Update to view changes</li><li>Click Download to save hotspot map to a file</li></ul>"
			// button events
			let update = document.getElementById("update")
			update.addEventListener("click", e => this.update())
			// handle download
			let dl = document.getElementById("download")
			dl.addEventListener("click", e => {
			   let blob = new Blob([this.textarea.value], {type: 'application/json'})
			    if(window.navigator.msSaveOrOpenBlob) {
			        window.navigator.msSaveBlob(blob, "hotspot.json")
		        } else {
		        	let a = document.createElement('a')
		        	a.href = window.URL.createObjectURL(blob)
		        	a.download = "hotspot.json"
		        	document.body.appendChild(a)
		        	a.click()
		        	document.body.removeChild(a)
		        }
			})
		}
		// hotspot events
		this.mouseDown = false
		let spot = null, clickspot = -1
		this.mainstage.addEventListener("stagemousedown", e => {
			clickspot = this.inSpot(e.stageX,e.stageY)
			if (clickspot >= 0)
				this.mainstage.getChildAt(clickspot+1).alpha = 1.0
			else {
				spot = this.newSpot(map.spots.length+1,e.stageX,e.stageY,10)
				this.mainstage.addChild(spot)
				this.mouseDown = true
			}
		})
		this.mainstage.addEventListener("stagemousemove", e => {
			if (this.mouseDown) {
				this.resizeSpot(spot,dist(spot.x,spot.y,e.stageX,e.stageY))
			}
		})
		this.mainstage.addEventListener("stagemouseup", e => {
			if (this.mouseDown) {
				this.mainstage.removeChild(spot)
				map.spots = map.spots.concat(this.newSpotObj(spot))
				this.writeMap()
				this.updateMap()
				spot = null
			}
			if (clickspot >= 0) {
				this.mainstage.getChildAt(clickspot+1).alpha = 0.8
				this.clickSpot(map.spots[clickspot])
				clickspot = -1
			}
			this.mouseDown = false
		})
		if (mapurl) {
			getFileData(mapurl, source => {
				try {
					map = JSON.parse(source)
					this.initImage()
				} catch (e) {
					alert(e.message)
				}
			})
		} else {
			let image = prompt("Enter image url:","")
			if (!image) image = ""
			map = {
				image: image,
				spots: []
		    }
			this.initImage()
		}
	}
	
	initImage() {
		this.back = new createjs.Bitmap(map.image)
		this.back.x = 40
		this.back.y = 40
		this.back.onload = e => {
			let bnd = this.back.getBounds()
			this.mainstage.canvas.width = bnd.width + 40
			this.mainstage.canvas.height = bnd.height + 40
		}
		this.mainstage.addChild(this.back)
		this.writeMap()
		this.updateMap()
	}
	
	newSpotObj(spot) {
		return {
				x: Math.round(spot.x),
				y: Math.round(spot.y),
				radius: Math.round(spot.getChildAt(0).radius),
				window: {
					url: "",
					title: "",
					features: "height=400,width=400,toolbar=no,menubar=no,status=no,location=no,resizable=yes,scrollbars=yes",
					embed: false
				}
			}
	}
	
	resizeSpot(spot,radius) {
		let circle = spot.getChildAt(0)
		circle.radius = Math.round(radius)
		circle.graphics.clear()
		circle.graphics.beginStroke("#00F").setStrokeStyle(1).beginFill("#FFF").drawCircle(0,0,radius).endStroke()
		let label = spot.getChildAt(1)
	}
	
	newSpot(n,x,y,radius) {
		let circle = new createjs.Shape()
		circle.graphics.beginStroke("#00F").setStrokeStyle(1).beginFill("#FFF").drawCircle(0,0,radius).endStroke()
		let label = new createjs.Text(n,"bold 16px Arial","#00F")
		label.x = -6
		label.y = -6
		let container = new createjs.Container()
		container.addChild(circle,label)
		container.x = x
		container.y = y
		container.cursor = "pointer"
		container.alpha = 0.8
		return container
	}
	
	clickSpot(spot) {
		if (this.win) this.win.close()
		let left = spot.x - 100, top = spot.y, features = spot.window.features + ",top="+top+",left="+left
		let wobj = spot.window
		if (wobj.embed) {
			this.win = window.open("","_blank",features)
			let w = this.win.innerWidth - 20, h = this.win.innerHeight - 20
			this.win.document.body.innerHTML = '<iframe src="'+wobj.url+'" width="'+w+'" height="'+h+'" allowfullscreen="" frameborder="0" />'
		} else {
			this.win = window.open(wobj.url,"_blank",features)
		}
		this.win.document.title = wobj.title
	}
	
	inSpot(x,y) {
		for (let i = 0; i < map.spots.length; i++) {
			let s = map.spots[i]
			if (dist(x,y,s.x,s.y) < s.radius) return i
		}
		return -1
	}
	
	writeMap() {
		this.textarea.value = JSON.stringify(map,'false','\t')
	}
	
	updateMap() {
		this.mainstage.removeAllChildren()
		this.mainstage.addChild(this.back)
		let n = 1
		map.spots.forEach(s => {
			this.mainstage.addChild(this.newSpot(n++,s.x,s.y,s.radius))
		})
	}
	
	update() {
		try {
			map = JSON.parse(this.textarea.value)
			this.writeMap()
			this.updateMap()
		} catch (e) {
			alert(e.message)
		}
	}
	
	run() {
		createjs.Ticker.framerate = 10
		let tick = 0
		createjs.Ticker.addEventListener("tick", e => {
			this.mainstage.update()
			tick++
		})
	}
}

(new HotspotSim()).run()