import {Axis} from "./axis"
export class Graph {
	constructor(spec) {
		this.stage = spec.stage
		this.xaxis = new Axis({
			stage: this.stage,
			label: spec.xlabel,
			dim: { x: spec.x, y: spec.y, w: spec.w, h: spec.h, min: spec.minX, max: spec.maxX },
			orient: "horizontal",
			scale: spec.xscale,
			major: spec.majorX,
			minor: spec.minorX,
			precision: spec.precisionX
		})
		this.yaxis = new Axis({
			stage: this.stage,
			label: spec.ylabel,
			dim: { x: spec.x, y: spec.y, w: spec.w, h: spec.h, min: spec.minY, max: spec.maxY },
			orient: "vertical",
			scale: spec.yscale,
			major: spec.majorY,
			minor: spec.minorY,
			precision: spec.precisionY
		})
		this.width = 1
		this.last = null
		this.marker = null
		this.color = "#000"
		this.dotted = false
		if (spec.background) {
			let b = new createjs.Shape()
			b.graphics.beginStroke("#AAA").beginFill(spec.background).drawRect(spec.x,spec.y-spec.h,spec.w,spec.h).endStroke()
			b.alpha = 0.3
			spec.stage.addChild(b)
		}
	}
	
	setWidth(width) {
		this.width = width
	}
	
	setDotted(dotted) {
		this.dotted = dotted
	}
	
	setColor(color) {
		this.color = color
		this.endPlot()
		this.marker = new createjs.Shape()
    	this.marker.graphics.beginStroke(color).beginFill(color).drawRect(0,0,4,4)
    	this.marker.x = -10
    	this.stage.addChild(this.marker)
	}

    render() {
    	this.xaxis.render()
    	this.yaxis.render()
    }

    clear() {
    	this.stage.removeAllChildren()
    	this.endPlot()
    }

    moveMarker(x,y) {
    	if (this.marker) {
    		this.marker.x = x-2
    		this.marker.y = y-2

    	}
    }

	drawLine(x1,y1,x2,y2) {
		let line = new createjs.Shape()
		if (this.dotted === true)
			line.graphics.setStrokeDash([2,2]).setStrokeStyle(this.width).beginStroke(this.color).moveTo(x1, y1).lineTo(x2, y2).endStroke()
		else
			line.graphics.setStrokeStyle(this.width).beginStroke(this.color).moveTo(x1, y1).lineTo(x2, y2).endStroke()
		this.stage.addChild(line)
	}
	
    plot(xv,yv) {
        if (xv >= this.xaxis.min && xv <= this.xaxis.max && yv >= this.yaxis.min && yv <= this.yaxis.max) {                
            let x = this.xaxis.getLoc(xv)
            let y = this.yaxis.getLoc(yv)
            if (this.last)  {
                this.moveMarker(this.last.x,this.last.y)
                this.drawLine(this.last.x,this.last.y,x,y)
            }
            this.last = new createjs.Point(x,y)
            this.moveMarker(x,y)
        }
    }
    
    endPlot() { this.last = null }
    
}
