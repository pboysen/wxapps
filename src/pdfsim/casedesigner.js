'use strict';

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFPageView) {
  alert('Please build the pdfjs-dist library using\n' +
        '  `gulp dist-install`');
}

pdfjsLib.GlobalWorkerOptions.workerSrc ='node_modules/pdfjs-dist/build/pdf.worker.js';

var CMAP_URL = 'node_modules/pdfjs-dist/cmaps/';
var CMAP_PACKED = true;

var DEFAULT_URL = 'designerhelp.pdf';
var PAGE_TO_VIEW = 1;
var DEFAULT_SCALE = 1.0;

var pdfLinkService = new pdfjsViewer.PDFLinkService();
var phaseViews = [null];
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

if (typeof(Storage) === "undefined") {
	alert("Local storage not supported. Use another browser.");
};

loadDocument(DEFAULT_URL);

function loadDocument(url) {
	var loadingTask = pdfjsLib.getDocument({
	  url: url,
	  cMapUrl: CMAP_URL,
	  cMapPacked: CMAP_PACKED,
	});
	loadingTask.promise.then(function(document) {
		currentPDF = document;
		getCase(url,document.numPages);
	    fillPhasePanel();
	    fillToolMenu();
	    showPhase(currentPhase);
	});
}

function getCase(url,nphases) {
	currentCase = JSON.parse(localStorage.getItem(url));
	if (!currentCase) {
		currentCase = getNewCase(url,nphases);
		saveCase();
	};
	for (var i = 1; i < currentCase.phases.length; i++)
		loadPhase(currentCase.phases[i]);
}

function getNewCase(url,nphases) {
	var state = "viewing";
	var phases = [null]
	for (var i = 1; i <= nphases; i++) {
		var phase = {
			"id": i,
			"title": "empty",
			"submit": "submit",
			"state": state,
			"widgets": {},
			"tools": []
		};
		phases.push(phase);
		state = "locked";
	};
	return {
		"url": url,
		"wid": 1,
		"phases": phases
	}
}

function saveCase() {
	localStorage.setItem(currentCase.url, JSON.stringify(currentCase));
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
			menu.style.left = bullet.style.left;
		    menu.style.top = bullet.style.top;		    		
			toggleMenu("visible");
			return;
		};
	}
	return view;
}

function loadPhase(phase) {
	phaseViews.push(getNewView());
	currentPDF.getPage(phase.id).then(function (pdfPage) {
	    var pdfPageView = new pdfjsViewer.PDFPageView({
	      container: phaseViews[phase.id],
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
	    var layer = phaseViews[phase.id].getElementsByClassName("annotationLayer").item[0];
	    if (!layer) {
		    var pageView = phaseViews[phase.id].getElementsByClassName("page").item(0);
	    	layer = document.createElement("div");
	    	layer.className = "annotationLayer";
	    	pageView.appendChild(layer);
	    }
	    for (var key in phase.widgets) {
	    	var value = phase.widgets[key];
	    	var widget = getViewableWidget(value.type);
	    	placeWidget(widget,value.rect.x,value.rect.y);
	    };
	    moveWidgetMenus();
	});	
}
// swap phase views 
function showPhase(pindex) {
	var wrapper = document.getElementById("viewerWrapper");
	wrapper.replaceChild(phaseViews[pindex],wrapper.children[0]);
	// move menuLayer to active page so menus can scroll with content
	moveWidgetMenus();
	//document.getElementById("phase-title").value = currentCase.phases[pindex].title;
	currentPhase = pindex;
}

function fillPhasePanel() {
	var phasePanel = document.getElementById("phasePanel");
	var title = document.createElement("span");
	title.innerHTML ="Phases:";
	phasePanel.appendChild(title);
	for (var i = 1; i < currentCase.phases.length; i++) {
		var item = document.createElement("div");
		item.className = "phase";
		var button = document.createElement("button");
		button.id = "ptitle"+i;
		button.innerHTML = currentCase.phases[i].title;
		button.value = i;
		button.onclick = function(e) { showPhase(this.value)};
		item.appendChild(button);
		phasePanel.appendChild(item);
	};
}

function moveWidgetMenus() {
	var page = document.getElementsByClassName("page").item(0);
	/* page 1 may not be rendered yet when showPage is called.
	 * Menus will be moved when it is rendered.
	 */
	if (page) {
		var menuLayer = document.getElementById("menuLayer");
		menuLayer.parentNode.removeChild(menuLayer);
		page.appendChild(menuLayer);
	};
}

function updatePhaseTitle(title) {
	var input = document.getElementById(title);
    currentCase.phases[currentPhase].title = input.value;
    document.getElementById("ptitle"+currentPhase).innerHTML = input.value;
	saveCase();
}


function toggleMenu(command){
  if (!menu) return;
	menu.style.visibility = command;
	toggleError(menu,"hidden");
};

function toggleError(menu,command) {
	var error = menu.getElementsByClassName("error").item(0);
	error.style.visibility = command;
}

function getListType() {
	var radios = document.getElementsByName('listType');
	for (var i = 0, length = radios.length; i < length; i++)
	   if (radios[i].checked) return radios[i].value;
	return "list";
}

function makeList(type) {
	var firstLeft = parseInt(bullet.style.left,10);
	var firstTop = parseInt(bullet.style.top,10);
	var index = 1;
	var list = makeNewWidget(type,firstLeft,firstTop);
	console.log(list);
	var subtype = type === "multiplechoice"?"radio":"checkbox";
	var nextLeft = parseInt(bullet.style.left,10);
	while (nextLeft >= firstLeft) {
		if (nextLeft == firstLeft) {
			itemLeft = parseInt(bullet.style.left,10)-firstLeft-3;
			itemTop = parseInt(bullet.style.top,10)-firstTop+2;
			var item = makeNewWidget(subtype,itemLeft,itemTop);
			item.type = subtype;
			item.value = index++;
			item.style.left = itemLeft+"px";
			item.style.top = "px";
			list.appendChild(item);
		};
		bullet = bullet.nextElementSibling;
		nextLeft = parseInt(bullet.style.left,10);
	};
	return list;
}
function saveList() {
	var type = getListType();
	makeList(type);
	bullet = null;
	toggleMenu("hidden");
}

/*
 * Functions to process widget operations
 */
document.getElementById("widgetPanel").onmousedown = function(e) { 
	makeNewWidget(e.target.title,e.pageX,e.pageY);
}

function getViewableWidget(type) {
    var element;
    var draggable = true;
	var widget = document.createElement("section");
    widget.className = "widget";
    widget.setAttribute("widgetType",type);
    switch(type) {
    case "textfield":
        element = document.createElement('input');
        element.type = 'text';
        element.placeholder="Enter text";
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
        draggable = false;
        break;
    case "list":
        element = makeList(type);
        element.className = "list";
        draggable = false;
        break;
    default:
    	return;
   }    
    if (draggable) {
        setMenuHandler(widget);
    	setDraggable(widget);	
    };
    widget.appendChild(element);
    return widget;
}

function makeNewWidget(type,pageX,pageY){
	var widget = getViewableWidget(type);
	switch(type) {
	case "diagnosticpath":
    	placeWidget(widget,0,0);
    	break;
	case "list":
    	placeWidget(widget,pageX,pageY);
		break;
	default:
    	placeWidget(widget,pageX+5,pageY+30);
	}
	alayer = document.getElementsByClassName("annotationLayer").item(0);
    alayer.appendChild(widget);
    var id = currentCase.id++;
    widget.id = id;
    currentCase.phases[currentPhase].widgets[id] = {
    	"id": id,
    	"type": type,
    	"rect": widget.getBoundingClientRect(),
    	"value":"",
    	"optional": false,    	
    };
    saveCase();

}

function setMenuHandler(widget) {
    widget.onclick = function(e) {
 	 	var r = this.getBoundingClientRect();
	 	var view = document.getElementById("viewerContainer");
	 	var type = this.getAttribute("widgetType");
	    if (e.pageY > (r.top+16)) return;
	    if (e.pageX < (r.right - 53)) return;
	    // copy
		if (e.pageX < (r.right - 44)) {
			makeNewWidget(type,e.pageX-100,e.pageY-30);
		    return false;
		};
		/* display properties dialog */
	 	if (e.pageX < (r.right - 24)) {
	    	menu = document.getElementById(type);
	    	if (menu) {
	    		menu.style.left = widget.style.left;
	    	    menu.style.top = widget.style.top;		    		
		    	toggleMenu("visible");
	    	};
	    	return false;
		};
		/* delete */
		widget.parentNode.removeChild(widget);
		localStorage.removeItem(currentCase.phases[currentPhase].widgets[widget.id]);
		saveCase();
		return false;
    };
};

function showFileMenu(id) {
	var menu = document.getElementById(id);
	if (!menu) return;
	menu.style.left = "60%";
	menu.style.top = "5%";
	toggleMenu("visible");
}

function openPDF() {
	var dir = document.getElementById("opendirid").files[0].webkitRelativePath;
	toggleMenu("hidden");
}

function savePDF() {
}

function placeWidget(widget,pageX,pageY) {
	let view = phaseViews[currentPhase];
	widget.style.left = pageX+"px";
    widget.style.top = (pageY+view.scrollTop-view.offsetTop) +'px';	
}

function setDraggable(widget) {  
  widget.onmousedown = function(e) {
	  //widget.style.position = 'absolute';
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
		  currentCase.phases[currentPhase].widgets[widget.id].rect = widget.getBoundingClientRect();
		  saveCase();
	  };
  };  
}

function saveTextfield() {};
function saveTextarea() {};
function saveSelect() {};
function saveCarryforward() {};
function saveMedia() {};
/*
 * Functions to process toolbox operations
 */
var toolMenu = document.getElementById("toolMenu");

function fillToolMenu() {
	toolMenu.innerHTML = "";
	currentCase.phases[currentPhase].tools.forEach(function entry(title) { 
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
		element.src = "assets/toolbox.png";
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
	toggleMenu("visible");	
}

function saveTools() {
	menu = document.getElementById("toolsDialog");
	var tools = [];
	var nodes = menu.children;
	for (let i = 0; i< nodes.length; i++) {
		if (nodes[i].type === "checkbox" && nodes[i].checked) tools.push(nodes[i].value);
	};
	currentCase.phases[currentPhase].tools = tools;
	if (currentTool) {
		currentTool.style.display = "none";
		currentTool.setAttribute("state","none");
		currentTool = null;
	}
	toggleMenu("hidden");
	fillToolMenu();
	saveCase();
}
