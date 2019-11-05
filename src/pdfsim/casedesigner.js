'use strict';

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFPageView) {
  alert('Please build the pdfjs-dist library using\n' +
        '  `gulp dist-install`');
}

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'node_modules/pdfjs-dist/build/pdf.worker.js';

var CMAP_URL = 'node_modules/pdfjs-dist/cmaps/';
var CMAP_PACKED = true;

var DEFAULT_URL = 'designerhelp.pdf';
var PAGE_TO_VIEW = 1;
var DEFAULT_SCALE = 1.0;

var pdfLinkService = new pdfjsViewer.PDFLinkService();
var phases = [null];
var currentPDF = null;
var currentCase = null;
var currentTool = null;
var currentPhase = 1;
let menu = null;
let bullet = null;
var dragged = null;
var alayer = null;
var page = null;
 
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
		currentPDF = document;
		currentCase = getCase(url,document.numPages);
	    fillPhasePanel();
	    fillToolMenu();
	    showPhase(currentPhase);
	});
}

function getCase(url,nphases) {
	var state = "viewing";
	for (var i = 1; i <= nphases; i++) {
		var phase = {
			id: i,
			page: currentPDF.getPage(i),
			view: getNewView(),
			properties: {
				"title": "noname",
				"state": state,
				"widgets": [],
				"tools": []
			}
		};
		state = "locked";
		loadPhase(phase);
	};
 // get the object from browser store.  If not create object below
	return {
		"title": "case title",
		"url": url,
		"phases": []
	}
}

function getNewView() {
	var view = document.createElement("div");
	view.id = "viewerContainer";
	view.onmousedown = function(e) {
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
	return view;
}

function loadPhase(phase) {
	phases.push(phase);
	phase.page.then(function (pdfPage) {
	    var pdfPageView = new pdfjsViewer.PDFPageView({
	      container: phase.view,
	      id: phase.id,
	      scale: DEFAULT_SCALE,
	      defaultViewport: pdfPage.getViewport({scale:DEFAULT_SCALE}),
	        linkService: pdfLinkService,
	        findController: pdfFindController,
	        textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
	        annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
	        renderInteractiveForms: true,
	    });
	    pdfPageView.setPdfPage(pdfPage);
	    pdfPageView.draw();
	    // if there are no annotations the annotationLayer will not be added by pdf.js so add one.
	    var layer = phase.view.getElementsByClassName("annotationLayer").item[0];
	    if (!layer) {
		    var pageView = phase.view.getElementsByClassName("page").item(0);
	    	layer = document.createElement("div");
	    	layer.className = "annotationLayer";
	    	pageView.appendChild(layer);
	    }
	});	
}
// swap phase views 
function showPhase(pindex) {
	var wrapper = document.getElementById("viewerWrapper");
	wrapper.replaceChild(phases[pindex].view,wrapper.children[0]);
	document.getElementById("phase-title").value = phases[pindex].properties.title;
	currentPhase = pindex;
}

function saveCase() {
	console.log("saveCase");
}

function updateTitles() {
	var caseTitle = document.getElementById("case-title").value;
	var phaseTitle = document.getElementById("phase-title").value;
	currentCase.title = caseTitle;
	phases[currentPhase].properties.title = phaseTitle;
	document.getElementById("ptitle"+currentPhase).innerHTML = phaseTitle;
}

function fillPhasePanel() {
	var phasePanel = document.getElementById("phasePanel");
	for (var i = 1; i < phases.length; i++) {
		var item = document.createElement("div");
		item.className = "phase";
		var button = document.createElement("button");
		button.id = "ptitle"+i;
		button.innerHTML = phases[i].properties.title;
		button.value = i;
		button.onclick = function(e) { showPhase(this.value)};
		item.appendChild(button);
		phasePanel.appendChild(item);
	};
}

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

function setPosition(pageX,pageY) {
    menu.style.left = pageX+'px';
    menu.style.top = pageY+'px';
};


function placeWidget(widget,e,offsetX,offsetY) {
	let view = phases[currentPhase].view;
	widget.style.left = (e.pageX+offsetX)+"px";
    widget.style.top = (e.pageY+offsetY+view.scrollTop-view.offsetTop) +'px';
	
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
	phases[currentPhase].properties.tools.forEach(function entry(title) { 
		addToolTab(title,"toolTab");
	});
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
	phases[currentPhase].tools = tools;
	saveCase();
	if (currentTool) {
		currentTool.style.display = "none";
		currentTool.setAttribute("state","none");
		currentTool = null;
	}
	toggleMenu("hide");
	fillToolMenu();
}
