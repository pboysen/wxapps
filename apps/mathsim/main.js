let MQ = MathQuill.getInterface(2)
let field = $('#math_field')[0]
function submit() {
	console.log(answer.latex() + " submitted")
}
let answer = MQ.MathField(field, {
	handlers: {
	    enter: () => { submit() }
	}
})
field.style.width = ($(window).width()-20)+"px"
field.style.height = ($(window).height()-20)+"px"
window.onblur = () => { submit() }
