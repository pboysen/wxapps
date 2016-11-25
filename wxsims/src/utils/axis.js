const marginX = 40, marginY = 30, endMargin = 5

export class Axis {
	constructor(spec) {
		this.spec = spec
		this.stage = spec.stage
		this.w = spec.dim.w || 100
		this.h = spec.dim.h || 100
		this.min = spec.dim.min || 0
		this.max = spec.dim.max || 100
		this.font = spec.font || "11px Arial"
		this.color = spec.color || "#000"
		this.label = spec.label
		this.major = spec.major || 10
		this.minor = spec.minor || spec.major
		this.precision = spec.precision || 0
		this.vertical = spec.orient && spec.orient == "vertical" || false
		this.linear = spec.scale && spec.scale == "linear" || false
		if (spec.dim.x) {
			this.originX = spec.dim.x
			this.endX = this.originX + this.w
		} else {
			this.originX = marginX
			this.endX = this.w - endMargin
		}
		if (spec.dim.y) {
			this.originY = spec.dim.y
			this.endY = this.originY - this.h + endMargin
		} else {
			this.originY = this.h - marginY
			this.endY = endMargin
		}
		this.scale = this.vertical ? Math.abs(this.endY - this.originY)/(this.max - this.min): Math.abs(this.endX - this.originX)/(this.max - this.min)
	}

	drawLine(x1,y1,x2,y2) {
		let line = new createjs.Shape()
		line.graphics.setStrokeStyle(1)
		line.graphics.beginStroke(this.color)
		line.graphics.moveTo(x1, y1)
		line.graphics.lineTo(x2, y2)
		line.graphics.endStroke();
		this.stage.addChild(line)
	}
	
	drawText(text,x,y) {
		text.x = x
		text.y = y
		if (this.vertical && text.text == this.label) text.rotation = 270
		this.stage.addChild(text)
		return text
	}

	getText(s) { return new createjs.Text(s,this.font,this.color) }

    render() {
    	let label = this.getText(this.label)
    	let label_bnds = label.getBounds()
        if (this.vertical) {
            this.drawLine(this.originX,this.originY,this.originX,this.endY)
            if (this.spec.label) {
	            let y = this.originY - (this.originY - label_bnds.width)/2
	            this.drawText(label, 4, y)
            }
            for (let val = this.min; val <= this.max; val += this.major) {
                let v = this.getLoc(val)
                this.drawLine(this.originX-4,v,this.originX+4,v)                
                let text = this.getText(val.toFixed(this.precision))
                let bnds = text.getBounds()
                this.drawText(text,this.originX-5-bnds.width,v+bnds.height/2-10)
            }
            for (let val = this.min; val <= this.max; val += this.minor) {
                let v = this.getLoc(val)
                this.drawLine(this.originX-2,v,this.originX+2,v)                
            }
        } else {
            this.drawLine(this.originX,this.originY, this.endX,this.originY)            
            if (this.spec.label) {
	            let x = (this.w - endMargin - label_bnds.width)/2
	            this.drawText(label, this.originX + x, this.originY + 15)
            }
            for (let val = this.min; val <= this.max; val += this.major)  {
                let v = this.getLoc(val)
                this.drawLine(v,this.originY-4,v,this.originY+4)              
                let text = this.getText(val.toFixed(this.precision))
                let bnds = text.getBounds()
                this.drawText(text,v-bnds.width/2,this.originY+4)
            }
            for (let val = this.min; val <= this.max; val += this.minor) {
                let v = this.getLoc(val)
                this.drawLine(v,this.originY-2,v,this.originY+2)              
            }
        }
    }

    getLoc(val) {
        let ival = this.linear? Math.round(this.scale*(val-this.min)): Math.round(Math.log(this.scale*(val-this.min)))
        return this.vertical?this.originY - ival:this.originX + ival
    }

    getValue(v) {
    	let factor = this.vertical? (this.originY - v)/this.originY:(v - this.originX)/(this.w - this.originX)
        return this.min + (this.max - this.min) * factor
    }

    isInside(v) {
        if (this.vertical)
            return v >= this.originY && v <= (this.originY + this.h)
        else
            return v >= this.originX && v <= (this.originY + this.w)
    }
}
