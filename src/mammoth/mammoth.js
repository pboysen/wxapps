import md5 from "md5";
import mammoth from "C:/Users/pboysen/git/mammoth.js/lib/index.js";

const inputElement = document.getElementById("input");
inputElement.addEventListener("change", readFile, false);

function readFile() {
  var reader = new FileReader();
  reader.onload = function(e) {
		mammoth.convertToHtml({arrayBuffer: reader.result}, options)
	    .then(function(result) {
	    	let value = transform(result.value);
	        document.getElementById("content").innerHTML = value
	        console.log(value.split("<p><page /></p>"));
	    })
	    .done();
  };
  reader.readAsArrayBuffer(this.files[0]);
}

var widgetProps = {
		fb122b7ad0194a68d3708ea5a1ace9af: { type: "textfield", length: 10,  etc: "" }
}

var options = {
    styleMap: [
    	"p[style-name='MultipleChoice'] => ul.mchoice > li:fresh", 
    	"p[style-name='Checklist'] => ul.chklist > li:fresh"
    ]
};

function inputHTML(inputType, name, value) {
	return ["<input type=\"", inputType, "\" name=\"",name,"\" value=\"", value, "\">"].join("");
}

function liInputs(listItems, inputType, name) {
	var liRE = /<li>(.*?)<\/li>/g;
	let value = 1;
	return listItems.replaceAll(liRE, (match, liText) => {
		let choiceName = inputType == "checkbox"? name + "." + value : name;
		return ["<li>", inputHTML(inputType, choiceName, value++), liText, "</li>"].join("");
	});
}

function transformList(html, type, inputType, prefix) {
	var ulRE = new RegExp("<ul class=\"" + type + "\">(.*?)<\/ul>","g");
	let quest = 1;
	return html.replaceAll(ulRE, (match, listItems) => {
		return ["<ul class=\"", type, "\">", liInputs(listItems, inputType, prefix + quest++), "</ul>", ].join("");
	});
}

var replacements = [
	{ from: /<td([^>]*)><p[^>]*>([^<]*)<\/p>(<p>[^<]*<\/p>)*<\/td>/g,
	  to: "<td$1>$2$3</td>" },
	{ from: /<img src="data:([^;]*);base64,([^"]*)"[^\/]*\/>/g,
	  to: (match, type, data) => {
		var props = widgetProps[md5(data)];
		return props ? "<div class=\"widget\" props=\""+JSON.stringify(props)+"\"></div>" : match; 
	  }
	}
]

function transform(html) {
	let result = replacements.reduce((result, repl) => result.replace(repl.from, repl.to), html);
	result = transformList(result, "mchoice", "radio", "mc");	
	result = transformList(result, "chklist", "checkbox", "cl");
	return result;
}