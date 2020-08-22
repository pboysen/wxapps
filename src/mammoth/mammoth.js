import md5 from "md5";
 
function getWidget(imageBuffer) {
	var hash = md5(imageBuffer);
	return {
		type: "textfield",
		length: 10,
		etc: ""
	}
}
 
var options = {
    convertImage: mammoth.images.imgElement(function(image) {
    	image.altText = "";
        return image.read("base64").then(function(imageBuffer) {
        	var props = getWidget(imageBuffer);
        	if (props) return {
            	"class": "widget",
            	props: JSON.stringify(props)
        	}
        	else return {
        		alt: "whatever",
        		src: "data:" + image.contentType + ";base64," + imageBuffer
            };
        });
    }),
    styleMap: [
    	"p[style-name='MultipleChoice'] => ul > li.mchoice:fresh", 
    	"p[style-name='Checklist'] => ul > li.chklist:fresh",
    	"br[type='page'] => div.page:fresh"
    ]
};

const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);

function handleList(listType, inputType, prefix) {
	let nameIdx = 1;
	let valueIdx = 1;
	let nodes = document.getElementsByClassName(listType);
	for (var i = 0, len = nodes.length; i < len; i++) {
		let li = nodes[i];
		var input = document.createElement("input");
		input.setAttribute("type", inputType);
		input.setAttribute("name", prefix + nameIdx);
		input.setAttribute("value", valueIdx++);
		li.prepend(input);
		if (listType == "chklist") nameIdx++;
		if (!li.nextSibling) valueIdx = 1;
	};
}

function handleWidgets() {
	var nodes = document.getElementsByClassName("widget");
	for (var i = 0, len = nodes.length; i < len; i++) {
		var img = nodes[i];
		var div = document.createElement("div");
		div.setAttribute("props", img.getAttribute("props"));
		div.setAttribute("class", "widget");
		img.parentNode.replaceChild(div, img);
	}
}

function handleTD(src) {
	return src.replace(/<td><p>/g, "<td>").replace(/<\/p><\/td>/g, "</td>");
}

function handleFiles() {
  var reader = new FileReader();
  reader.onload = function(e) { 
		mammoth.convertToHtml({arrayBuffer: reader.result}, options)
	    .then(function(result) {
	        document.getElementById("content").innerHTML = handleTD(result.value);
	        handleList("mchoice", "radio", "mc");
	        handleList("chklist", "checkbox", "cl");
	        handleWidgets()
	        console.log(document.getElementById("content").innerHTML);
	    })
	    .done();
  };
  reader.readAsArrayBuffer(this.files[0]);
}