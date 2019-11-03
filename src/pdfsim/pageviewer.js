/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFPageView) {
  alert('Please build the pdfjs-dist library using\n' +
        '  `gulp dist-install`');
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'node_modules/pdfjs-dist/build/pdf.worker.js';

// Some PDFs need external cmaps.
//
var CMAP_URL = 'node_modules/pdfjs-dist/cmaps/';
var CMAP_PACKED = true;

var DEFAULT_URL = 'examples.pdf';
var PAGE_TO_VIEW = 1;
var DEFAULT_SCALE = 1.0;

var container = document.getElementById('viewerContainer');
var pdfLinkService = new pdfjsViewer.PDFLinkService();
var currentDocument = null;
var currentCase = null;
var currentTool = null;
var currentPhase = 0;
let menu = null;
let bullet = null;
var dragged = null;
var alayer = null;
var page = null;
var testPhases = ["History", "CBC", "Uranalysis", "Lipid Panel","Expert Path","Expert Path Answer","Diagnosis","test","test","test","test","test","test","test","test","test"];
 
var pdfFindController = new pdfjsViewer.PDFFindController({
  linkService: pdfLinkService,
});

//let's get started
loadDocument(DEFAULT_URL);

function loadDocument(url) {
	var loadingTask = pdfjsLib.getDocument({
	  url: url,
	  cMapUrl: CMAP_URL,
	  cMapPacked: CMAP_PACKED,
	});
	loadingTask.promise.then(function(document) {
		currentDocument = document;
		currentCase = getCase(url,document.numPages);
		showPhase(1);
	});
}

function getCase(url,nphases) {
// get the object from browser store.  If not create object below
	var phases = [];
	var state = "viewing";
	for (var i = 0; i < nphases; i++) {
		var phase = {
			"title": "phase title",
			"widgets": [],
			"tools": [],
			"state": state,
		}
		phases.push(phase);
		state = "locked";
	};
	return {
		"title": "case title",
		"url": url,
		"phases": phases
	}
}

function saveCase() {
	// save case
}

function showPhase(pindex) {
	// clear out viewer canvas for new page
	container.innerHTML = '';
	currentPhase = pindex;
	page = currentDocument.getPage(pindex).then(function (pdfPage) {
	    var pdfPageView = new pdfjsViewer.PDFPageView({
	      container: container,
	      id: pindex,
	      scale: DEFAULT_SCALE,
	      defaultViewport: pdfPage.getViewport({scale:DEFAULT_SCALE}),
	        linkService: pdfLinkService,
	        findController: pdfFindController,
	        textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
	        annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
	        renderInteractiveForms: true,
	    });
	    // Associates the actual page with the view, and drawing it
	    pdfPageView.setPdfPage(pdfPage);
	    pdfPageView.draw();
	    fillPhasePanel();
	    fillToolMenu();
	  });
	document.getElementById("phase-title").value = currentCase.phases[pindex-1].title;
};

function updateTitles() {
	console.log("update titles");
}

window.addEventListener("contextmenu", e => { 
	e.preventDefault(); 
});

function fillPhasePanel() {
	var phasepanel = document.getElementById("phasePanel");
	var index = 1;
	currentCase.phases.forEach(function entry(phase) {
		var item = document.createElement("div");
		item.className = "phase";
		var button = document.createElement("button");
		button.type = "button";
		button.innerHTML = phase.title;
		button.value = index++;
		button.onclick = function(e) { showPhase(button.value)};
		item.appendChild(button);
		phasepanel.appendChild(item);
	});
}

function setPosition(pageX,pageY) {
    menu.style.left = pageX+'px';
    menu.style.top = pageY+'px';
};

function toggleMenu(command){
  if (!menu) return;
  if (command === "show")
	  menu.style.display = "block";
  else {
	  toggleError(menu,"hide");
	  menu.style.display = "none";
	  menu = null;
  }
};

function toggleError(menu,command) {
	var error = menu.getElementsByClassName("error").item(0);
	error.style.display = command === "show"? "block": "none"; 	
}

/* 
 * Handle creation of multiple choice and checklist widgets
 */
container.onmousedown = function(e) {
	if (e.target.tagName === "SELECT") { 
		e.preventDefault();
		return;
	}
	if (e.target.textContent === "•") {
		bullet = e.target;
		menu = document.getElementById("addList");
		toggleMenu("show");
		return;
	};
}

function getListType() {
	var radios = document.getElementsByName('listType');
	for (var i = 0, length = radios.length; i < length; i++)
	   if (radios[i].checked) return radios[i].value;
	return "multiplechoice";
}

function makeList(name,type,bullet) {
	var first = bullet;
	var index = 1;
	alayer = document.getElementsByClassName("annotationLayer").item(0);
	while (parseInt(bullet.style.left,10) >= parseInt(first.style.left,10)) {
		if (parseInt(bullet.style.left,10) == parseInt(first.style.left,10)) {
			var widget = document.createElement("section");
			var item = document.createElement("input");
			item.type = type;
			item.name = name;
			item.value = index++;
		    widget.appendChild(item);
			widget.style.left = (parseInt(bullet.style.left,10)-5)+"px";
			widget.style.top = (parseInt(bullet.style.top,10)) + "px";
		    alayer.appendChild(widget);
		};
		bullet = bullet.nextElementSibling;
	};
}
function saveList() {
	var name = document.getElementById("listName").value;
	if (!name) {
		toggleError(menu,"show");
		return;
	}
	var type = getListType();
	makeList(name,type,bullet);
	bullet = null;
	toggleMenu("hide");
}

function deleteList() {
	// use bullet location to delete items
}

/*
 * Functions to process widget operations
 */
document.getElementById("widgetPanel").onmousedown = function(e) { makeWidget(e);}

function makeWidget(e){
    var element;
    var fullScreen = false;
    var wtype = e.target.title;
    switch(wtype) {
    case "textfield":
        element = document.createElement('input');
        element.type = 'text';
        element.placeholder="Enter text";
    	break;
    case "checkbox":
        element = document.createElement('input');
        element.type = 'checkbox';
   	break;
    case "textarea":
        element = document.createElement('textarea');
        element.placeholder="Enter paragraph";
        break;
    case "select":
        element = document.createElement('select');
        var option = document.createElement("option");
        option.disabled = "disabled";
        option.selected = "selected";
        option.text = "Select item";
        element.add(option);
        break;
    case "carryforward":
        element = document.createElement('div');
        element.className = "carryforward";
        break;
    case "media":
        element = document.createElement('div');
        element.className = "media";
        break;
    case "diagnosticpath":
        element = document.createElement('div');
        element.className = "diagnosticpath";
        fullScreen = true;
        break;
    default:
    	return;
   }
    
	alayer = document.getElementsByClassName("annotationLayer").item(0);
	var widget = document.createElement("section");
	// place new widget directly below menu
    if (fullScreen) {
    	widget.style.left = "0px";
       	widget.style.top = "0px";    	
    } else
    	placeWidget(widget,e,5,30);
    widget.className = "widget";
    widget.setAttribute("widgetType",wtype);
    widget.onclick = function(e) {
    	if (e.shiftKey) {
    		/* display properties dialog */
        	menu = document.getElementById(widget.getAttribute("widgetType"));
        	if (!menu)  return;
        	menu.style.top = "120px";
        	toggleMenu("show");
        	return;
    	};
    	if (e.altKey) {
    		/* copy */
    		var newCopy = widget.cloneNode(true);
    		placeWidget(newCopy,e,5,5);
    		newCopy.onclick = widget.onclick;
    	    newCopy.setAttribute("widgetType",widget.widgetType);
    	    setDraggable(newCopy);
    	    alayer.appendChild(newCopy);
    	    return;
    	};
    	if (e.ctrlKey) {
    		widget = e.target.parentNode;
    		widget.parentNode.removeChild(widget);
    		// update json
    	};
  	
    };
    widget.appendChild(element);
    setDraggable(widget);
    alayer.appendChild(widget);
}

function placeWidget(widget,e,offsetX,offsetY) {
	widget.style.left = (e.pageX+offsetX)+"px";
    widget.style.top = (e.pageY+offsetY+container.scrollTop-container.offsetTop) +'px';
	
}

function setDraggable(widget) {  
  widget.onmousedown = function(e) {
	  if (e.ctrlKey || e.shiftKey) return;
	  widget.style.position = 'absolute';
	  var left = widget.offsetLeft;
	  var top = widget.offsetTop;
	  var width = widget.offsetWidth;
	  var height = widget.offsetHeight;
	  var offsetX = e.pageX - left;
	  var offsetY = e.pageY - top;
	  
	  moveAt(this.pageX, this.pageY);
	  
	  function moveAt(pageX, pageY) {
	    widget.style.left = pageX - offsetX + 'px';
	    widget.style.top = pageY - offsetY + 'px';			
	  }

	  window.onmousemove = function onMouseMove(e) {
		  // don't move if resizing
		  if (widget.clientWidth == width && widget.clientHeight == height)
			  moveAt(e.pageX, e.pageY);
	  }

	  widget.onmouseup = function() {
	    window.onmousemove = null;
	  };
  };  
}

function saveTextfield() {}
function deleteTextfield() {}


/*
 * Functions to process toolbox operations
 */
var toolMenu = document.getElementById("toolMenu");

function fillToolMenu() {
	toolMenu.innerHTML = "";
	currentCase.phases[currentPhase].tools.forEach(function entry(title) { addToolTab(title,"toolTab");});
	addToolTab("+","addTab");
}

toolMenu.addEventListener("mousedown", function(e) {
	e.preventDefault();
	if (e.target.tagName === "IMG")
		showToolsDialog(e);
	else
		selectTool(e.target);
});

function addToolTab(title,className) {
	var item = document.createElement("div");
	item.className = className;
	var element = null;
	if (title === "+") {
		element = document.createElement("img");
		element.src = "images/toolbox.png";
		element.alt = "Configure tools";
		element.title = "Configure tools";
	} else {
		element = document.createElement("span");
		element.textContent = title;		
	};
	item.appendChild(element);
	toolMenu.appendChild(item);
}

function selectTool(tab) {
	var newTool = document.getElementById(tab.textContent);
	if (currentTool) {
		currentTool.style.display = "none";
		tab.parentElement.removeAttribute("state");
	};
	if (newTool != currentTool) {
		currentTool = newTool;
		currentTool.style.display = "block";
		tab.parentElement.setAttribute("state","showing");
	};
}; 

function showToolsDialog(e) {
	if (menu) return;
	menu = document.getElementById("toolsDialog");
	setPosition(e.pageX+50,e.pageY+50);
	toggleMenu("show");	
}

function saveTools() {
	menu = document.getElementById("toolsDialog");
	var tools = [];
	var nodes = menu.children;
	for (let i = 0; i< nodes.length; i++) {
		if (nodes[i].type === "checkbox" && nodes[i].checked) tools.push(nodes[i].value);
	};
	currentCase.phases[currentPhase].tools = tools;
	saveCase();
	if (currentTool) {
		currentTool.style.display = "none";
		currentTool.setAttribute("state","none");
		currentTool = null;
	}
	toggleMenu("hide");
	fillToolMenu();
}
