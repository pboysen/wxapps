(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _utils = require("../utils");

var _url = require("url");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var store = (0, _utils.getStore)(),
    searchParams = new URLSearchParams(window.location.search.substring(1));
var image = searchParams.get('img');
if (!image) image = prompt("Enter image url:", "");
var back = new createjs.Bitmap(image);
var edit = searchParams.get('mode') == "edit";
var scale = searchParams.get('scale') || 1.0;
var tool = searchParams.get('tool') || "pressure";
var width = searchParams.get('w') || 20;
var height = searchParams.get('h') || 20;
var opt = searchParams.get('opt') || "all";
var colors = searchParams.get('colors') || "black";
var linetypes = {
  dry: {
    w: 1,
    c: "#000"
  },
  highT: {
    w: 1,
    c: "#F00"
  },
  highTd: {
    w: 1,
    c: "#0F0"
  },
  jet850: {
    w: 5,
    c: "#F00"
  },
  jet300: {
    w: 5,
    c: "#800080"
  }
};
var linetype = "dry";
var linetypeButton = null;
createjs.MotionGuidePlugin.install(); //Lines with symbols for a dry line, moisture axis, thermal ridge, low level jet and upper level jet 

function dist(p1, p2) {
  var dx = p1.x - p2.x,
      dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function angle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getColor() {
  var radio = document.getElementsByName('color');

  for (var i = 0; i < radio.length; i++) {
    if (radio[i].checked) return radio[i].value;
  }

  return "black";
}

var saveparms = [];
document.getElementById("save").addEventListener('click', function (e) {
  e.stopPropagation();

  var _saveparms = saveparms,
      _saveparms2 = _slicedToArray(_saveparms, 2),
      symbol = _saveparms2[0],
      cb = _saveparms2[1];

  var desc_editor = document.getElementById("desc_editor");
  removeSymbol(symbol);
  symbol.desc = desc_editor.value;
  addSymbol(symbol);
  editor.style.visibility = "hidden";
  cb(true);
});
document.getElementById("delete").addEventListener('click', function (e) {
  e.stopPropagation();

  var _saveparms3 = saveparms,
      _saveparms4 = _slicedToArray(_saveparms3, 2),
      symbol = _saveparms4[0],
      cb = _saveparms4[1];

  removeSymbol(symbol);
  editor.style.visibility = "hidden";
  cb(false);
});

function getDesc(pt, symbol, cb) {
  var editor = document.getElementById("editor");
  var desc_editor = document.getElementById("desc_editor");
  var canvas = document.getElementById("maincanvas");
  desc_editor.value = symbol.desc;
  editor.style.left = pt[0] + canvas.offsetLeft + "px";
  editor.style.top = pt[1] + canvas.offsetTop + "px";
  editor.style.visibility = "visible";
  editor.focus();
  saveparms = [symbol, cb];
}

function getMid(pts) {
  var _ref = [pts[0], pts[pts.length - 1]],
      start = _ref[0],
      end = _ref[1];
  var midx = 0,
      midy = 0;
  if (start.x < end.x) midx = start.x + (end.x - start.x) / 2 - 20;else midx = end.x + (start.x - end.x) / 2 - 20;
  if (start.y < end.y) midy = start.y + (end.y - start.y) / 2;else midy = end.y + (start.y - end.y) / 2;
  return [midx, midy];
}

function addLabel(path, mid, symbol, cb) {
  var desc = new createjs.Text(symbol.desc, "14px Arial", "#000");
  desc.x = mid[0];
  desc.y = mid[1];
  var rect = new createjs.Shape();
  rect.graphics.beginFill("white");
  rect.graphics.drawRect(desc.x, desc.y, desc.getMeasuredWidth(), desc.getMeasuredHeight());
  rect.graphics.endFill();
  rect.cursor = "text";
  path.addChild(rect);
  path.addChild(desc);
  rect.addEventListener("click", function (e) {
    e.stopPropagation();
    getDesc(mid, symbol, cb);
  });
}

function getSymbols() {
  var symbols = store.get(image + "." + tool);

  if (!symbols) {
    symbols = {
      cnt: 1,
      data: {}
    };
    store.set(image + "." + tool, symbols);
  }

  return symbols;
}

function addSymbol(symbol) {
  var symbols = getSymbols();
  symbol.id = symbols.cnt++;
  symbols.data[symbol.id] = symbol;
  store.set(image + "." + tool, symbols);
}

function updateSymbol(symbol) {
  var symbols = getSymbols();
  symbols.data[symbol.id] = symbol;
  store.set(image + "." + tool, symbols);
}

function removeSymbol(symbol) {
  var symbols = getSymbols();
  if (symbol.id) delete symbols.data[symbol.id];
  store.set(image + "." + tool, symbols);
}

function removeSymbols() {
  symbols = {
    cnt: 1,
    data: {}
  };
  store.set(image + "." + tool, symbols);
}

var Vector = /*#__PURE__*/function (_createjs$Container) {
  _inherits(Vector, _createjs$Container);

  var _super = _createSuper(Vector);

  _createClass(Vector, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var map = new createjs.Bitmap(json.img);
      map.x = json.pt.x;
      map.y = json.pt.y;
      map.regX = 12;
      map.regY = 12;
      map.rotation = json.rot;
      map.cursor = "url(assets/remove.png) 8 8, auto";
      map.addEventListener("click", function (e) {
        removeSymbol(json);
        map.stage.removeChild(map);
      });
      stage.addChild(map);
    }
  }]);

  function Vector(x, rot, img, drawsim) {
    var _this;

    _classCallCheck(this, Vector);

    _this = _super.call(this);
    _this.x = x;
    _this.y = 0;
    _this.img = img;
    _this.rot = rot;
    var select = new createjs.Shape();
    select.graphics.beginFill("#CCC").drawRoundRect(0, 0, 26, 26, 2, 2, 2, 2).endStroke();

    _this.addChild(select);

    var map = new createjs.Bitmap(img);
    map.x = 13;
    map.y = 13;
    map.regX = 12;
    map.regY = 12;
    map.rotation = rot;

    _this.setBounds(x, 0, 26, 26);

    _this.addChild(map);

    select.alpha = 0;

    _this.addEventListener("mouseover", function (e) {
      return select.alpha = 0.5;
    });

    _this.addEventListener("mouseout", function (e) {
      return select.alpha = 0;
    });

    _this.addEventListener("click", function (e) {
      return drawsim.toolbar.select(_assertThisInitialized(_this));
    });

    return _this;
  }

  _createClass(Vector, [{
    key: "toJSON",
    value: function toJSON(x, y) {
      return {
        type: "vector",
        img: this.img,
        rot: this.rot,
        pt: {
          x: x,
          y: y
        }
      };
    }
  }]);

  return Vector;
}(createjs.Container);

var PressureRegion = /*#__PURE__*/function (_createjs$Container2) {
  _inherits(PressureRegion, _createjs$Container2);

  var _super2 = _createSuper(PressureRegion);

  _createClass(PressureRegion, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var region = new createjs.Container();
      var txt = new createjs.Text(json.high ? "H" : "L", "bold 24px Arial", json.high ? "#00F" : "#F00");
      txt.x = json.pt.x - 12;
      txt.y = json.pt.y - 12;
      var circle = new createjs.Shape();
      circle.graphics.beginFill(json.high ? "#0F0" : "#FF0").drawCircle(json.pt.x, json.pt.y, 24).endFill();
      circle.alpha = 0.5;
      region.addChild(circle);
      region.addChild(txt);
      region.addEventListener("click", function (e) {
        removeSymbol(json);
        region.stage.removeChild(region);
      });
      region.cursor = "url(assets/remove.png) 8 8, auto";
      stage.addChild(region);
    }
  }]);

  function PressureRegion(x, high, drawsim) {
    var _this2;

    _classCallCheck(this, PressureRegion);

    _this2 = _super2.call(this);
    _this2.high = high;
    var txt = new createjs.Text(high ? "H" : "L", "bold 24px Arial", high ? "#00F" : "#F00");
    txt.x = x + 2;
    txt.y = 2;
    var select = new createjs.Shape();
    select.graphics.beginFill("#CCC").drawRoundRect(x, 0, 26, 26, 2, 2, 2, 2).endStroke();

    _this2.addChild(select);

    var circle = new createjs.Shape();
    circle.graphics.beginFill(high ? "#0F0" : "#FF0").drawCircle(x + 12, 12, 13).endFill();
    circle.alpha = 0.3;

    _this2.addChild(circle, txt);

    _this2.setBounds(x, 0, 26, 26);

    select.alpha = 0;

    _this2.addEventListener("mouseover", function (e) {
      return select.alpha = 0.5;
    });

    _this2.addEventListener("mouseout", function (e) {
      return select.alpha = 0;
    });

    _this2.addEventListener("click", function (e) {
      return drawsim.toolbar.select(_assertThisInitialized(_this2));
    });

    return _this2;
  }

  _createClass(PressureRegion, [{
    key: "toJSON",
    value: function toJSON(x, y) {
      return {
        type: "region",
        high: this.high,
        pt: {
          x: x,
          y: y
        }
      };
    }
  }, {
    key: "getLength",
    value: function getLength() {
      return 2 * 30 + 2;
    }
  }]);

  return PressureRegion;
}(createjs.Container);

var Pressures = /*#__PURE__*/function (_createjs$Container3) {
  _inherits(Pressures, _createjs$Container3);

  var _super3 = _createSuper(Pressures);

  function Pressures(x, drawsim) {
    var _this3;

    _classCallCheck(this, Pressures);

    _this3 = _super3.call(this);
    _this3.x = x;
    _this3.y = 2;
    if (opt == "all" || opt == "arrows") for (var i = 0; i < 8; i++) {
      var v = new Vector(x, 45 * i, "assets/left-arrow.png", drawsim);

      _this3.addChild(v);

      x += 30;
    }

    if (opt == "all" || opt == "hl") {
      _this3.addChild(new PressureRegion(x, true, drawsim));

      x += 30;

      _this3.addChild(new PressureRegion(x, false, drawsim));

      x += 30;
    }

    return _this3;
  }

  _createClass(Pressures, [{
    key: "getLength",
    value: function getLength() {
      var n = opt == "all" ? 10 : opt == "arrows" ? 8 : 2;
      return n * 30 + 2;
    }
  }]);

  return Pressures;
}(createjs.Container);

var Airmass = /*#__PURE__*/function (_createjs$Container4) {
  _inherits(Airmass, _createjs$Container4);

  var _super4 = _createSuper(Airmass);

  _createClass(Airmass, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var airmass = new createjs.Container();
      airmass.x = json.pt.x;
      airmass.y = json.pt.y;
      var circle = new createjs.Shape();
      circle.graphics.beginFill("#FFF").beginStroke("#000").drawCircle(14, 14, 14).endStroke();
      airmass.addChild(circle);
      var txt = new createjs.Text(json.name, "12px Arial", "#000");
      txt.x = 6;
      txt.y = 10;
      airmass.addChild(txt);
      airmass.cursor = "url(assets/remove.png) 8 8, auto";
      airmass.addEventListener("click", function (e) {
        removeSymbol(json);
        airmass.stage.removeChild(airmass);
      });
      stage.addChild(airmass);
    }
  }]);

  function Airmass(x, name, drawsim) {
    var _this4;

    _classCallCheck(this, Airmass);

    _this4 = _super4.call(this);
    _this4.x = x;
    _this4.y = 2;
    _this4.name = name;
    var circle = new createjs.Shape();
    circle.graphics.beginFill("#FFF").beginStroke("#000").drawCircle(14, 14, 14).endStroke();

    _this4.addChild(circle);

    var txt = new createjs.Text(name, "12px Arial", "#000");
    txt.x = 6;
    txt.y = 10;

    _this4.addChild(txt);

    var select = new createjs.Shape();
    select.graphics.beginFill("#CCC").drawCircle(14, 14, 14).endStroke();

    _this4.addChild(select);

    select.alpha = 0;

    _this4.addEventListener("mouseover", function (e) {
      select.alpha = 0.5;
    });

    _this4.addEventListener("mouseout", function (e) {
      select.alpha = 0;
    });

    _this4.addEventListener("click", function (e) {
      drawsim.toolbar.select(_assertThisInitialized(_this4));
    });

    return _this4;
  }

  _createClass(Airmass, [{
    key: "toJSON",
    value: function toJSON(x, y) {
      return {
        type: "airmass",
        name: this.name,
        pt: {
          x: x,
          y: y
        }
      };
    }
  }]);

  return Airmass;
}(createjs.Container);

var Airmasses = /*#__PURE__*/function (_createjs$Container5) {
  _inherits(Airmasses, _createjs$Container5);

  var _super5 = _createSuper(Airmasses);

  function Airmasses(x, toolbar) {
    var _this5;

    _classCallCheck(this, Airmasses);

    _this5 = _super5.call(this);
    var masses = ["cP", "mP", "cT", "mT", "cE", "mE", "cA", "mA"];
    masses.forEach(function (name) {
      _this5.addChild(new Airmass(x, name, toolbar));

      x += 30;
    });
    return _this5;
  }

  _createClass(Airmasses, [{
    key: "getLength",
    value: function getLength() {
      return 8 * 30 + 2;
    }
  }]);

  return Airmasses;
}(createjs.Container);

var IsoPleth = /*#__PURE__*/function () {
  _createClass(IsoPleth, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var pts = json.pts;
      var path = new createjs.Container();
      var shape = new createjs.Shape();
      shape.graphics.beginStroke("#00F");
      var oldX = pts[0].x;
      var oldY = pts[0].y;
      var oldMidX = oldX;
      var oldMidY = oldY;
      json.pts.forEach(function (pt) {
        var midPoint = new createjs.Point(oldX + pt.x >> 1, oldY + pt.y >> 1);
        shape.graphics.setStrokeStyle(4).moveTo(midPoint.x, midPoint.y);
        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY);
        oldX = pt.x;
        oldY = pt.y;
        oldMidX = midPoint.x;
        oldMidY = midPoint.y;
      });
      path.addChild(shape);
      var first = pts[0],
          last = pts[pts.length - 1];
      var label = IsoPleth.getLabel(json.value, first.x - 10, first.y + (first.y < last.y ? -24 : 0));
      label.cursor = "url(assets/remove.png) 8 8, auto";
      label.addEventListener("click", function (e) {
        removeSymbol(json);
        stage.removeChild(path);
      });
      path.addChild(label);

      if (dist(first, last) > 10) {
        var _label = IsoPleth.getLabel(json.value, last.x - 10, last.y + (first.y < last.y ? 0 : -24));

        _label.cursor = "url(assets/remove.png) 8 8, auto";

        _label.addEventListener("click", function (e) {
          removeSymbol(json);
          stage.removeChild(path);
        });

        path.addChild(_label);
      }

      stage.addChild(path);
    }
  }, {
    key: "getLabel",
    value: function getLabel(name, x, y) {
      var label = new createjs.Container();
      var txt = new createjs.Text(name, "bold 24px Arial", "#00F");
      txt.x = x;
      txt.y = y;
      var circle = new createjs.Shape();
      circle.graphics.beginFill("#FFF").drawCircle(x + 12, y + 12, 20).endFill();
      label.addChild(circle);
      label.addChild(txt);
      return label;
    }
  }]);

  function IsoPleth(drawsim) {
    var _this6 = this;

    _classCallCheck(this, IsoPleth);

    createjs.Ticker.framerate = 10;
    this.mouseDown = false;
    drawsim.mainstage.addEventListener("stagemousedown", function (e) {
      _this6.currentShape = new createjs.Shape();

      _this6.currentShape.graphics.beginStroke("#00F");

      drawsim.mainstage.addChild(_this6.currentShape);
      _this6.oldX = _this6.oldMidX = e.stageX;
      _this6.oldY = _this6.oldMidY = e.stageY;
      _this6.mouseDown = true;
      _this6.pts = [];
    });
    drawsim.mainstage.addEventListener("stagemousemove", function (e) {
      if (_this6.mouseDown == false) return;
      _this6.pt = new createjs.Point(e.stageX, e.stageY);
      _this6.pts = _this6.pts.concat({
        x: e.stageX,
        y: e.stageY
      });
      var midPoint = new createjs.Point(_this6.oldX + _this6.pt.x >> 1, _this6.oldY + _this6.pt.y >> 1);

      _this6.currentShape.graphics.setStrokeStyle(4).moveTo(midPoint.x, midPoint.y);

      _this6.currentShape.graphics.curveTo(_this6.oldX, _this6.oldY, _this6.oldMidX, _this6.oldMidY);

      _this6.oldX = _this6.pt.x;
      _this6.oldY = _this6.pt.y;
      _this6.oldMidX = midPoint.x;
      _this6.oldMidY = midPoint.y;
    });
    drawsim.mainstage.addEventListener("stagemouseup", function (e) {
      _this6.mouseDown = false;
      drawsim.mainstage.removeChild(_this6.currentShape);
      if (_this6.pts.length < 3) return;
      var value = prompt("Enter value:", 1);

      if (value) {
        var symbol = {
          type: "isopleth",
          value: value,
          pts: _this6.pts
        };
        IsoPleth.showSymbol(drawsim.mainstage, symbol);
        addSymbol(symbol);
      }
    });
  }

  return IsoPleth;
}();

var Line = /*#__PURE__*/function () {
  _createClass(Line, null, [{
    key: "getLineShape",
    value: function getLineShape(lt) {
      var shape = new createjs.Shape();
      shape.graphics.setStrokeStyle(lt.w).beginStroke(lt.c);
      return shape;
    }
  }, {
    key: "setButton",
    value: function setButton(button, color) {
      var b = button.getChildAt(0);
      var border = new createjs.Shape();
      border.x = b.x;
      border.graphics.setStrokeStyle(1).beginFill(color).beginStroke("#AAA").drawRoundRect(0, 2, 62, 18, 2, 2, 2, 2).endStroke();
      button.removeChildAt(0);
      button.addChildAt(border, 0);
    }
  }, {
    key: "getButton",
    value: function getButton(x, name) {
      var lt = linetypes[name];
      var button = new createjs.Container();
      button.cursor = "pointer";
      button.addEventListener("click", function (e) {
        if (name == linetype) return;
        if (linetypeButton) Line.setButton(linetypeButton, "#FFF");
        Line.setButton(button, "#EEE");
        linetype = name;
        linetypeButton = button;
      });
      var border = new createjs.Shape();
      border.graphics.setStrokeStyle(1).beginFill(name == linetype ? "#EEE" : "#FFF").beginStroke("#AAA").drawRoundRect(0, 2, 62, 18, 2, 2, 2, 2).endStroke();
      if (name == linetype) linetypeButton = button;
      border.x = x;
      var txt = new createjs.Text(name, "bold 12px Arial", "#000");
      txt.x = x + 5;
      txt.y = 5;
      var line = Line.getLineShape(lt);
      var left = x + txt.getBounds().width + 10;
      line.graphics.moveTo(left, 10).lineTo(left + 15, 10).endStroke();
      button.addChild(border, txt, line);
      return button;
    }
  }, {
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var pts = json.pts;
      var path = new createjs.Container();
      path.name = json.ltype;
      var shape = Line.getLineShape(linetypes[json.ltype]);
      var oldX = pts[0].x;
      var oldY = pts[0].y;
      var oldMidX = oldX;
      var oldMidY = oldY;
      json.pts.forEach(function (pt) {
        var midPoint = new createjs.Point(oldX + pt.x >> 1, oldY + pt.y >> 1);
        shape.graphics.moveTo(midPoint.x, midPoint.y);
        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY);
        oldX = pt.x;
        oldY = pt.y;
        oldMidX = midPoint.x;
        oldMidY = midPoint.y;
      });
      path.addChild(shape);
      stage.addChild(path);
    }
  }]);

  function Line(drawsim) {
    var _this7 = this;

    _classCallCheck(this, Line);

    createjs.Ticker.framerate = 10;
    this.mouseDown = false;
    var x = 5;

    for (var key in linetypes) {
      var b = Line.getButton(x, key);
      drawsim.mainstage.addChild(b);
      x += 65;
    }

    drawsim.mainstage.addEventListener("stagemousedown", function (e) {
      _this7.currentShape = Line.getLineShape(linetypes[linetype]);
      drawsim.mainstage.addChild(_this7.currentShape);
      _this7.oldX = _this7.oldMidX = e.stageX;
      _this7.oldY = _this7.oldMidY = e.stageY;
      _this7.mouseDown = true;
      _this7.pts = [];
    });
    drawsim.mainstage.addEventListener("stagemousemove", function (e) {
      if (_this7.mouseDown == false) return;
      _this7.pt = new createjs.Point(e.stageX, e.stageY);
      _this7.pts = _this7.pts.concat({
        x: e.stageX,
        y: e.stageY
      });
      var midPoint = new createjs.Point(_this7.oldX + _this7.pt.x >> 1, _this7.oldY + _this7.pt.y >> 1);

      _this7.currentShape.graphics.setStrokeStyle(linetypes[linetype].w).moveTo(midPoint.x, midPoint.y);

      _this7.currentShape.graphics.curveTo(_this7.oldX, _this7.oldY, _this7.oldMidX, _this7.oldMidY);

      _this7.oldX = _this7.pt.x;
      _this7.oldY = _this7.pt.y;
      _this7.oldMidX = midPoint.x;
      _this7.oldMidY = midPoint.y;
    });
    drawsim.mainstage.addEventListener("stagemouseup", function (e) {
      _this7.mouseDown = false;
      drawsim.mainstage.removeChild(_this7.currentShape);
      if (_this7.pts.length < 3) return;
      drawsim.mainstage.removeChild(drawsim.mainstage.getChildByName(linetype));
      getSymbols().forEach(function (s) {
        if (s.ltype == linetype) removeSymbol(s);
      });
      var symbol = {
        type: "line",
        ltype: linetype,
        pts: _this7.pts
      };
      Line.showSymbol(drawsim.mainstage, symbol);
      addSymbol(symbol);
    });
  }

  return Line;
}();

var Ellipse = /*#__PURE__*/function (_createjs$Container6) {
  _inherits(Ellipse, _createjs$Container6);

  var _super6 = _createSuper(Ellipse);

  _createClass(Ellipse, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var ellipse = new createjs.Shape();
      ellipse.graphics.setStrokeStyle(2).beginFill("#FFF").beginStroke("#F00").drawEllipse(Math.round(json.pt.x - json.w / 2), Math.round(json.pt.y - json.h / 2), Math.round(json.w), Math.round(json.h)).endStroke();
      ellipse.alpha = 0.5;
      ellipse.cursor = "url(assets/remove.png) 8 8, auto";
      ellipse.addEventListener("click", function (e) {
        removeSymbol(json);
        stage.removeChild(ellipse);
      });
      stage.addChild(ellipse);
    }
  }]);

  function Ellipse(drawsim) {
    var _this8;

    _classCallCheck(this, Ellipse);

    _this8 = _super6.call(this);
    back.cursor = "pointer";
    back.addEventListener("click", function (e) {
      var symbol = _this8.toJSON(e.stageX, e.stageY);

      addSymbol(symbol);
      Ellipse.showSymbol(drawsim.mainstage, symbol);
    });
    return _this8;
  }

  _createClass(Ellipse, [{
    key: "toJSON",
    value: function toJSON(x, y) {
      return {
        type: "ellipse",
        ex: ex,
        w: width,
        h: height,
        pt: {
          x: x,
          y: y
        }
      };
    }
  }]);

  return Ellipse;
}(createjs.Container);

var Field = /*#__PURE__*/function () {
  _createClass(Field, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var pts = json.pts;
      if (pts.length == 0) return;
      var shape = new createjs.Shape();
      var oldX = pts[0].x;
      var oldY = pts[0].y;
      var oldMidX = oldX;
      var oldMidY = oldY;
      this.color = json.color;
      shape.graphics.beginStroke(this.color);
      json.pts.forEach(function (pt) {
        var midPoint = new createjs.Point(oldX + pt.x >> 1, oldY + pt.y >> 1);
        shape.graphics.setStrokeStyle(2).moveTo(midPoint.x, midPoint.y);
        shape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY);
        oldX = pt.x;
        oldY = pt.y;
        oldMidX = midPoint.x;
        oldMidY = midPoint.y;
      });
      var path = new createjs.Container();
      path.addChild(shape);

      if ((opt == 'head' || opt == "colorhead") && pts.length > 4) {
        path.addChild(Field.drawHead(pts, json.color));
        addLabel(path, getMid(pts), json, function (keep) {
          drawsim.mainstage.removeChild(path);
          if (keep) Field.showSymbol(drawsim.mainstage, json);
        });
      }

      shape.cursor = "url(assets/remove.png) 8 8, auto";
      stage.addChild(path);
      shape.addEventListener("click", function (e) {
        removeSymbol(json);
        stage.removeChild(path);
      });
      return path;
    }
  }, {
    key: "drawHead",
    value: function drawHead(pts, color) {
      var lastpt = pts[pts.length - 6];
      var endpt = pts[pts.length - 1];
      var head = new createjs.Shape();
      head.graphics.f(color).setStrokeStyle(4).beginStroke(color).mt(4, 0).lt(-4, -4).lt(-4, 4).lt(4, 0);
      head.x = endpt.x;
      head.y = endpt.y;
      head.rotation = angle(lastpt, endpt);
      return head;
    }
  }]);

  function Field(drawsim) {
    var _this9 = this;

    _classCallCheck(this, Field);

    createjs.Ticker.framerate = 5;
    this.mouseDown = false;
    this.w = 1;
    document.getElementById("delete").style.visibility = "hidden";
    drawsim.mainstage.addEventListener("stagemousedown", function (e) {
      if (document.getElementById("editor").style.visibility == "visible") return;
      _this9.shape = new createjs.Shape();
      drawsim.mainstage.addChild(_this9.shape);
      _this9.oldX = _this9.oldMidX = e.stageX;
      _this9.oldY = _this9.oldMidY = e.stageY;
      _this9.mouseDown = true;
      _this9.pts = [];
      _this9.color = "#000";

      if (opt == "colorhead") {
        var ctx = document.getElementById("maincanvas").getContext("2d");
        var data = ctx.getImageData(_this9.oldX, _this9.oldY, 1, 1).data;
        _this9.color = rgbToHex(data[0], data[1], data[2]);
      }

      _this9.shape.graphics.beginStroke(_this9.color);
    });
    drawsim.mainstage.addEventListener("stagemousemove", function (e) {
      if (_this9.mouseDown == false) return;
      _this9.pt = new createjs.Point(e.stageX, e.stageY);
      _this9.pts = _this9.pts.concat({
        x: e.stageX,
        y: e.stageY
      });
      var midPoint = new createjs.Point(_this9.oldX + _this9.pt.x >> 1, _this9.oldY + _this9.pt.y >> 1);

      _this9.shape.graphics.setStrokeStyle(2).moveTo(midPoint.x, midPoint.y);

      _this9.shape.graphics.curveTo(_this9.oldX, _this9.oldY, _this9.oldMidX, _this9.oldMidY);

      _this9.oldX = _this9.pt.x;
      _this9.oldY = _this9.pt.y;
      _this9.oldMidX = midPoint.x;
      _this9.oldMidY = midPoint.y;
    });
    drawsim.mainstage.addEventListener("stagemouseup", function (e) {
      _this9.mouseDown = false;
      if (_this9.pts.length == 0) return;
      var symbol = {
        type: "field",
        pts: _this9.pts,
        color: _this9.color,
        desc: ""
      };

      if ((opt == 'head' || opt == "colorhead") && _this9.pts.length > 4) {
        var that = _this9;
        var head = Field.drawHead(_this9.pts, _this9.color);
        drawsim.mainstage.addChild(head);
        getDesc(getMid(_this9.pts), symbol, function (keep) {
          drawsim.mainstage.removeChild(that.shape);
          drawsim.mainstage.removeChild(head);
          if (keep) Field.showSymbol(drawsim.mainstage, symbol);
        });
      }
    });
  }

  return Field;
}();

var Transform = /*#__PURE__*/function () {
  _createClass(Transform, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, symbol) {
      back.rotation = symbol.rotation;
      back.scaleX = symbol.flipH;
      back.scaleY = symbol.flipV;
    }
  }]);

  function Transform(drawsim) {
    _classCallCheck(this, Transform);

    createjs.Ticker.framerate = 5;
    var symbols = getSymbols();

    if (symbols.cnt == 1) {
      var symbol = {
        type: "transform",
        rotation: 0,
        flipH: 1,
        flipV: 1
      };
      addSymbol(symbol);
    }

    if (edit) {
      document.getElementById("transform").style.visibility = "visible";
      document.getElementById("rotate").addEventListener("click", function () {
        back.rotation = back.rotation < 360 ? back.rotation + 90 : 0;
        var symbol = getSymbols().data[1];
        symbol.rotation = back.rotation;
        updateSymbol(symbol);
        Transform.showSymbol(drawsim.stage, symbol);
      });
      document.getElementById("fliph").addEventListener("click", function () {
        back.scaleX = -back.scaleX;
        var symbol = getSymbols().data[1];
        symbol.flipH = back.scaleX;
        updateSymbol(symbol);
        Transform.showSymbol(drawsim.stage, symbol);
      });
      document.getElementById("flipv").addEventListener("click", function () {
        back.scaleY = -back.scaleY;
        var symbol = getSymbols().data[1];
        symbol.flipV = back.scaleY;
        updateSymbol(symbol);
        Transform.showSymbol(drawsim.stage, symbol);
      });
    }
  }

  return Transform;
}();

var Label = /*#__PURE__*/function () {
  _createClass(Label, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json) {
      var path = new createjs.Container();
      stage.addChild(path);
      addLabel(path, [json.x, json.y], json, function (show) {
        stage.removeChild(path);
        if (show) Label.showSymbol(stage, json);
      });
    }
  }]);

  function Label(drawsim) {
    _classCallCheck(this, Label);

    drawsim.mainstage.addEventListener("click", function (e) {
      var symbol = {
        "type": "label",
        x: e.stageX,
        y: e.stageY,
        desc: ""
      };
      getDesc([symbol.x, symbol.y], symbol, function (show) {
        if (show) Label.showSymbol(drawsim.mainstage, symbol);
      });
    });
  }

  return Label;
}();

var Arrow = /*#__PURE__*/function () {
  _createClass(Arrow, null, [{
    key: "showSymbol",
    value: function showSymbol(stage, json, showCursor) {
      var shape = new createjs.Shape();
      var w = Math.min(width, 5);
      var d = Math.hypot(json.start.x - json.end.x, json.start.y - json.end.y);
      shape.graphics.ss(1).s(json.color).f(json.color).mt(0, 0).lt(0, w).lt(d, w).lt(d, 2 * w).lt(d + 2 * w, 0).lt(d, -2 * w).lt(d, -w).lt(0, -w).lt(0, 0);
      shape.x = json.start.x;
      shape.y = json.start.y;
      shape.rotation = angle(json.start, json.end);
      if (showCursor) shape.cursor = "url(assets/remove.png) 8 8, auto";
      shape.addEventListener("click", function (e) {
        e.stopPropagation();
        removeSymbol(json);
        stage.removeChild(shape);
      });
      stage.addChild(shape);
      return shape;
    }
  }]);

  function Arrow(drawsim) {
    _classCallCheck(this, Arrow);

    createjs.Ticker.framerate = 30;
    var colorsdiv = document.getElementById("colors");
    var checked = true;
    colors.split(",").forEach(function (color) {
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'color';
      radio.checked = checked;
      radio.id = color;
      radio.value = color;
      colorsdiv.appendChild(radio);
      var label = document.createElement('label');
      label["for"] = color;
      label.style.color = color;
      colorsdiv.appendChild(label);
      var text = document.createTextNode(color);
      label.appendChild(text);
      checked = false;
    });
    var symbol = {
      type: "arrow",
      start: {},
      end: {},
      color: getColor()
    };
    var mouseDown = false;
    var shape = null;
    drawsim.mainstage.addEventListener("stagemousedown", function (e) {
      var thing = drawsim.mainstage.getObjectUnderPoint(e.stageX, e.stageY);
      if (!thing || !thing.image) return;
      mouseDown = true;
      symbol.start = {
        x: e.stageX,
        y: e.stageY
      };
      symbol.end = {
        x: e.stageX,
        y: e.stageY
      };
      symbol.color = getColor();
      shape = Arrow.showSymbol(drawsim.mainstage, symbol, false);
    });
    drawsim.mainstage.addEventListener("stagemousemove", function (e) {
      if (mouseDown) {
        drawsim.mainstage.removeChild(shape);
        symbol.end = {
          x: e.stageX,
          y: e.stageY
        };
        shape = Arrow.showSymbol(drawsim.mainstage, symbol, false);
      }
    });
    drawsim.mainstage.addEventListener("stagemouseup", function (e) {
      if (mouseDown) {
        addSymbol(symbol);
        if (shape) shape.cursor = "url(assets/remove.png) 8 8, auto";
        mouseDown = false;
      }
    });
  }

  return Arrow;
}();

var Toolbar = /*#__PURE__*/function (_createjs$Container7) {
  _inherits(Toolbar, _createjs$Container7);

  var _super7 = _createSuper(Toolbar);

  function Toolbar(tool, drawsim) {
    var _this10;

    _classCallCheck(this, Toolbar);

    _this10 = _super7.call(this);
    createjs.Ticker.framerate = 20;
    var border = new createjs.Shape();

    _this10.addChild(border);

    var w = 2;

    _this10.addChild(tool);

    w += tool.getLength();
    _this10.cancel = new Vector(w, 0, "assets/cross.png", drawsim);
    _this10.cancel.y = 2;

    _this10.addChild(_this10.cancel);

    w += 30;
    _this10.x = 0;
    _this10.y = -100;
    _this10.w = w;
    border.graphics.beginFill("#FFF").beginStroke("#AAA").drawRoundRect(0, 0, w, 30, 5, 5, 5, 5).endStroke();
    return _this10;
  }

  _createClass(Toolbar, [{
    key: "select",
    value: function select(obj) {
      this.y = -100;
      if (obj == this.cancel) return;
      var json = null;

      if (obj instanceof Vector) {
        json = obj.toJSON(this.e.stageX, this.e.stageY);
        Vector.showSymbol(this.stage, json);
      }

      if (obj instanceof Airmass) {
        json = obj.toJSON(this.e.stageX - 14, this.e.stageY - 14);
        Airmass.showSymbol(this.stage, json);
      }

      if (obj instanceof PressureRegion) {
        json = obj.toJSON(this.e.stageX, this.e.stageY);
        PressureRegion.showSymbol(this.stage, json);
      }

      addSymbol(json);
      this.stage.setChildIndex(this, this.stage.getNumChildren() - 1);
    }
  }, {
    key: "show",
    value: function show(e) {
      if (!e.relatedTarget && this.y < 0) {
        this.x = e.stageX - this.w / 2;
        this.y = e.stageY - 30;
        this.e = e;
      }
    }
  }]);

  return Toolbar;
}(createjs.Container);

var DrawSim = /*#__PURE__*/function () {
  function DrawSim() {
    var _this11 = this;

    _classCallCheck(this, DrawSim);

    this.mainstage = new createjs.Stage("maincanvas");
    this.mainstage.cursor = "default";
    createjs.Touch.enable(this.mainstage);

    back.image.onload = function () {
      var bnd = back.getBounds();
      drawsim.mainstage.canvas.width = bnd.width + 40;
      drawsim.mainstage.canvas.height = bnd.height + 40;
      back.x = bnd.width / 2 + 20;
      back.y = bnd.width / 2 + 20;
      back.regX = bnd.width / 2;
      back.regY = bnd.height / 2;
    };

    this.mainstage.addChild(back);
    this.showSymbols();

    if (edit) {
      this.mainstage.enableMouseOver();

      switch (tool) {
        case "pressure":
          var pressures = new Pressures(2, this);
          this.toolbar = new Toolbar(pressures, this);
          back.addEventListener("mousedown", function (e) {
            return _this11.toolbar.show(e);
          });
          this.mainstage.addChild(this.toolbar);
          break;

        case "airmass":
          var airmasses = new Airmasses(2, this);
          this.toolbar = new Toolbar(airmasses, this);
          back.addEventListener("mousedown", function (e) {
            return _this11.toolbar.show(e);
          });
          this.mainstage.addChild(this.toolbar);
          break;

        case "isopleth":
          this.isopleth = new IsoPleth(this);
          break;

        case "line":
          this.line = new Line(this);
          break;

        case "ellipse":
          this.ellipse = new Ellipse(this);
          break;

        case "field":
          this.field = new Field(this);
          break;

        case "transform":
          this.transform = new Transform(this);
          break;

        case "label":
          this.label = new Label(this);
          break;

        case "arrow":
          this.arrow = new Arrow(this);
          break;

        default:
          alert("Parameter tool should be pressure, airmass, isopleth, line, ellipse, field, transform or label");
      }
    } // handle download


    var dl = document.getElementById("download");
    dl.addEventListener("click", function (e) {
      var dt = _this11.mainstage.canvas.toDataURL('image/png');
      /* Change MIME type to trick the browser to download the file instead of displaying it */


      dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
      /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */

      dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=map.png');
      dl.href = dt;
    });
  }

  _createClass(DrawSim, [{
    key: "showSymbols",
    value: function showSymbols() {
      var symbols = getSymbols();

      for (var key in symbols["data"]) {
        var json = symbols["data"][key];

        switch (json.type) {
          case "vector":
            Vector.showSymbol(this.mainstage, json);
            break;

          case "region":
            PressureRegion.showSymbol(this.mainstage, json);
            break;

          case "airmass":
            Airmass.showSymbol(this.mainstage, json);
            break;

          case "isopleth":
            IsoPleth.showSymbol(this.mainstage, json);
            break;

          case "line":
            Line.showSymbol(this.mainstage, json);
            break;

          case "ellipse":
            Ellipse.showSymbol(this.mainstage, json);
            break;

          case "field":
            Field.showSymbol(this.mainstage, json);
            break;

          case "transform":
            Transform.showSymbol(this.mainstage, json);
            break;

          case "label":
            Label.showSymbol(this.mainstage, json);
            break;

          case "arrow":
            Arrow.showSymbol(this.mainstage, json, true);
            break;
        }
      }
    }
  }, {
    key: "run",
    value: function run() {
      var _this12 = this;

      var tick = 0;
      createjs.Ticker.addEventListener("tick", function (e) {
        _this12.mainstage.update();

        tick++;
      });
    }
  }]);

  return DrawSim;
}();

var drawsim = new DrawSim();
drawsim.run();

},{"../utils":4,"url":11}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Axis = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var marginX = 40,
    marginY = 30,
    endMargin = 5;

var Axis = /*#__PURE__*/function () {
  function Axis(spec) {
    _classCallCheck(this, Axis);

    this.spec = spec;
    this.stage = spec.stage;
    this.w = spec.dim.w || 100;
    this.h = spec.dim.h || 100;
    this.min = spec.dim.min || 0;
    this.max = spec.dim.max || 100;
    this.font = spec.font || "11px Arial";
    this.color = spec.color || "#000";
    this.label = spec.label;
    this.major = spec.major || 10;
    this.minor = spec.minor || spec.major;
    this.precision = spec.precision || 0;
    this.vertical = spec.orient && spec.orient == "vertical" || false;
    this.linear = spec.scale && spec.scale == "linear" || false;
    this.invert = spec.invert || false;

    if (spec.dim.x) {
      this.originX = spec.dim.x;
      this.endX = this.originX + this.w;
    } else {
      this.originX = marginX;
      this.endX = this.w - endMargin;
    }

    if (spec.dim.y) {
      this.originY = spec.dim.y;
      this.endY = this.originY - this.h + endMargin;
    } else {
      this.originY = this.h - marginY;
      this.endY = endMargin;
    }

    this.scale = this.vertical ? Math.abs(this.endY - this.originY) / (this.max - this.min) : Math.abs(this.endX - this.originX) / (this.max - this.min);
  }

  _createClass(Axis, [{
    key: "drawLine",
    value: function drawLine(x1, y1, x2, y2) {
      var line = new createjs.Shape();
      line.graphics.setStrokeStyle(1);
      line.graphics.beginStroke(this.color);
      line.graphics.moveTo(x1, y1);
      line.graphics.lineTo(x2, y2);
      line.graphics.endStroke();
      this.stage.addChild(line);
    }
  }, {
    key: "drawText",
    value: function drawText(text, x, y) {
      text.x = x;
      text.y = y;
      if (this.vertical && text.text == this.label) text.rotation = 270;
      this.stage.addChild(text);
      return text;
    }
  }, {
    key: "getText",
    value: function getText(s) {
      return new createjs.Text(s, this.font, this.color);
    }
  }, {
    key: "render",
    value: function render() {
      var label = this.getText(this.label);
      var label_bnds = label.getBounds();

      if (this.vertical) {
        this.drawLine(this.originX, this.originY, this.originX, this.endY);
        var minXLabel = this.originX;

        for (var val = this.min; val <= this.max; val += this.major) {
          var v = this.getLoc(val);
          this.drawLine(this.originX - 4, v, this.originX + 4, v);
          var text = this.getText(val.toFixed(this.precision));
          var bnds = text.getBounds();
          var x = this.originX - 5 - bnds.width;
          this.drawText(text, x, v + bnds.height / 2 - 10);
          if (x < minXLabel) minXLabel = x;
        }

        for (var _val = this.min; _val <= this.max; _val += this.minor) {
          var _v = this.getLoc(_val);

          this.drawLine(this.originX - 2, _v, this.originX + 2, _v);
        }

        if (this.spec.label) {
          var y = this.originY - (this.originY - label_bnds.width) / 2;
          this.drawText(label, minXLabel - label_bnds.height, y);
        }
      } else {
        this.drawLine(this.originX, this.originY, this.endX, this.originY);

        if (this.spec.label) {
          var _x = (this.w - endMargin - label_bnds.width) / 2;

          this.drawText(label, this.originX + _x, this.originY + 15);
        }

        for (var _val2 = this.min; _val2 <= this.max; _val2 += this.major) {
          var _v2 = this.getLoc(_val2);

          this.drawLine(_v2, this.originY - 4, _v2, this.originY + 4);

          var _text = this.getText(_val2.toFixed(this.precision));

          var _bnds = _text.getBounds();

          this.drawText(_text, _v2 - _bnds.width / 2, this.originY + 4);
        }

        for (var _val3 = this.min; _val3 <= this.max; _val3 += this.minor) {
          var _v3 = this.getLoc(_val3);

          this.drawLine(_v3, this.originY - 2, _v3, this.originY + 2);
        }
      }
    }
  }, {
    key: "getLoc",
    value: function getLoc(val) {
      var ival = this.linear ? Math.round(this.scale * (val - this.min)) : Math.round(Math.log(this.scale * (val - this.min)));
      return this.vertical ? this.originY - ival : this.originX + ival;
    }
  }, {
    key: "getValue",
    value: function getValue(v) {
      var factor = this.vertical ? (this.originY - v) / this.originY : (v - this.originX) / (this.w - this.originX);
      return this.min + (this.max - this.min) * factor;
    }
  }, {
    key: "isInside",
    value: function isInside(v) {
      if (this.vertical) return v >= this.originY && v <= this.originY + this.h;else return v >= this.originX && v <= this.originY + this.w;
    }
  }]);

  return Axis;
}();

exports.Axis = Axis;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Graph = void 0;

var _axis = require("./axis");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Graph = /*#__PURE__*/function () {
  function Graph(spec) {
    _classCallCheck(this, Graph);

    this.stage = spec.stage;
    this.xaxis = new _axis.Axis({
      stage: this.stage,
      label: spec.xlabel,
      dim: {
        x: spec.x,
        y: spec.y,
        w: spec.w,
        h: spec.h,
        min: spec.minX,
        max: spec.maxX
      },
      orient: "horizontal",
      scale: spec.xscale,
      major: spec.majorX,
      minor: spec.minorX,
      precision: spec.precisionX,
      invert: spec.xinvert
    });
    this.yaxis = new _axis.Axis({
      stage: this.stage,
      label: spec.ylabel,
      dim: {
        x: spec.x,
        y: spec.y,
        w: spec.w,
        h: spec.h,
        min: spec.minY,
        max: spec.maxY
      },
      orient: "vertical",
      scale: spec.yscale,
      major: spec.majorY,
      minor: spec.minorY,
      precision: spec.precisionY,
      invert: spec.yinvert
    });
    this.width = 1;
    this.last = null;
    this.marker = null;
    this.color = "#000";
    this.dotted = false;

    if (spec.background) {
      var b = new createjs.Shape();
      b.graphics.beginStroke("#AAA").beginFill(spec.background).drawRect(spec.x, spec.y - spec.h, spec.w, spec.h).endStroke();
      b.alpha = 0.3;
      spec.stage.addChild(b);
    }
  }

  _createClass(Graph, [{
    key: "setWidth",
    value: function setWidth(width) {
      this.width = width;
    }
  }, {
    key: "setDotted",
    value: function setDotted(dotted) {
      this.dotted = dotted;
    }
  }, {
    key: "setColor",
    value: function setColor(color) {
      this.color = color;
      this.endPlot();
      this.marker = new createjs.Shape();
      this.marker.graphics.beginStroke(color).beginFill(color).drawRect(0, 0, 4, 4);
      this.marker.x = -10;
      this.stage.addChild(this.marker);
    }
  }, {
    key: "render",
    value: function render() {
      this.xaxis.render();
      this.yaxis.render();
    }
  }, {
    key: "clear",
    value: function clear() {
      this.stage.removeAllChildren();
      this.endPlot();
    }
  }, {
    key: "moveMarker",
    value: function moveMarker(x, y) {
      if (this.marker) {
        this.marker.x = x - 2;
        this.marker.y = y - 2;
      }
    }
  }, {
    key: "drawLine",
    value: function drawLine(x1, y1, x2, y2) {
      var line = new createjs.Shape();
      if (this.dotted === true) line.graphics.setStrokeDash([2, 2]).setStrokeStyle(this.width).beginStroke(this.color).moveTo(x1, y1).lineTo(x2, y2).endStroke();else line.graphics.setStrokeStyle(this.width).beginStroke(this.color).moveTo(x1, y1).lineTo(x2, y2).endStroke();
      this.stage.addChild(line);
      return line;
    }
  }, {
    key: "plot",
    value: function plot(xv, yv) {
      if (xv >= this.xaxis.min && xv <= this.xaxis.max && yv >= this.yaxis.min && yv <= this.yaxis.max) {
        var x = this.xaxis.getLoc(xv);
        var y = this.yaxis.getLoc(yv);

        if (this.last) {
          this.moveMarker(this.last.x, this.last.y);
          this.drawLine(this.last.x, this.last.y, x, y);
        }

        this.last = new createjs.Point(x, y);
        this.moveMarker(x, y);
      }
    }
  }, {
    key: "endPlot",
    value: function endPlot() {
      this.last = null;
    }
  }]);

  return Graph;
}();

exports.Graph = Graph;

},{"./axis":2}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getParams = getParams;
exports.getStore = getStore;
Object.defineProperty(exports, "Graph", {
  enumerable: true,
  get: function get() {
    return _graph.Graph;
  }
});

var _graph = require("./graph");

var JSON = require("./json2");

var store = require("./store");

function getParams() {
  var params = {};

  if (location.search) {
    location.search.slice(1).split('&').forEach(function (part) {
      var pair = part.split('=');
      pair[0] = decodeURIComponent(pair[0]);
      pair[1] = decodeURIComponent(pair[1]);
      params[pair[0]] = pair[1] !== 'undefined' ? pair[1] : true;
    });
  }

  return params;
}

function getStore() {
  if (!store.enabled) {
    alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
    return;
  }

  return store;
}

},{"./graph":3,"./json2":5,"./store":6}],5:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
    json2.js
    2015-05-03

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse. This file is provides the ES5 JSON capability to ES3 systems.
    If a project might run on IE8 or earlier, then this file should be included.
    This file does nothing on ES5 systems.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 
                            ? '0' + n 
                            : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date 
                    ? 'Date(' + this[key] + ')' 
                    : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint 
    eval, for, this 
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if ((typeof JSON === "undefined" ? "undefined" : _typeof(JSON)) !== 'object') {
  JSON = {};
}

(function () {
  'use strict';

  var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g,
      rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  function this_value() {
    return this.valueOf();
  }

  if (typeof Date.prototype.toJSON !== 'function') {
    Date.prototype.toJSON = function () {
      return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
    };

    Boolean.prototype.toJSON = this_value;
    Number.prototype.toJSON = this_value;
    String.prototype.toJSON = this_value;
  }

  var gap, indent, meta, rep;

  function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string) ? '"' + string.replace(rx_escapable, function (a) {
      var c = meta[a];
      return typeof c === 'string' ? c : "\\u" + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {
    // Produce a string from holder[key].
    var i,
        // The loop counter.
    k,
        // The member key.
    v,
        // The member value.
    length,
        mind = gap,
        partial,
        value = holder[key]; // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && _typeof(value) === 'object' && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    } // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.


    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    } // What happens next depends on the value's type.


    switch (_typeof(value)) {
      case 'string':
        return quote(value);

      case 'number':
        // JSON numbers must be finite. Encode non-finite numbers as null.
        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':
        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce 'null'. The case is included here in
        // the remote chance that this gets fixed someday.
        return String(value);
      // If the type is 'object', we might be dealing with an object or an array or
      // null.

      case 'object':
        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.
        if (!value) {
          return 'null';
        } // Make an array to hold the partial results of stringifying this object value.


        gap += indent;
        partial = []; // Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {
          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.
          length = value.length;

          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          } // Join all of the elements together, separated with commas, and wrap them in
          // brackets.


          v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        } // If the replacer is an array, use it to select the members to be stringified.


        if (rep && _typeof(rep) === 'object') {
          length = rep.length;

          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);

              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {
          // Otherwise, iterate through all of the keys in the object.
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);

              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } // Join all of the member texts together, separated with commas,
        // and wrap them in braces.


        v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  } // If the JSON object does not yet have a stringify method, give it one.


  if (typeof JSON.stringify !== 'function') {
    meta = {
      // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    };

    JSON.stringify = function (value, replacer, space) {
      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.
      var i;
      gap = '';
      indent = ''; // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        } // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
        indent = space;
      } // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.


      rep = replacer;

      if (replacer && typeof replacer !== 'function' && (_typeof(replacer) !== 'object' || typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      } // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.


      return str('', {
        '': value
      });
    };
  } // If the JSON object does not yet have a parse method, give it one.


  if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text, reviver) {
      // The parse method takes a text and an optional reviver function, and returns
      // a JavaScript value if the text is a valid JSON text.
      var j;

      function walk(holder, key) {
        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.
        var k,
            v,
            value = holder[key];

        if (value && _typeof(value) === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);

              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }

        return reviver.call(holder, key, value);
      } // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.


      text = String(text);
      rx_dangerous.lastIndex = 0;

      if (rx_dangerous.test(text)) {
        text = text.replace(rx_dangerous, function (a) {
          return "\\u" + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      } // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with '()' and 'new'
      // because they can cause invocation, and '=' because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.
      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.


      if (rx_one.test(text.replace(rx_two, '@').replace(rx_three, ']').replace(rx_four, ''))) {
        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.
        j = eval('(' + text + ')'); // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function' ? walk({
          '': j
        }, '') : j;
      } // If the text is not JSON parseable, then a SyntaxError is thrown.


      throw new SyntaxError('JSON.parse');
    };
  }
})();

},{}],6:[function(require,module,exports){
(function (global){
"use strict";

module.exports = function () {
  // Store.js
  var store = {},
      win = typeof window != 'undefined' ? window : global,
      doc = win.document,
      localStorageName = 'localStorage',
      scriptTag = 'script',
      storage;
  store.disabled = false;
  store.version = '1.3.20';

  store.set = function (key, value) {};

  store.get = function (key, defaultVal) {};

  store.has = function (key) {
    return store.get(key) !== undefined;
  };

  store.remove = function (key) {};

  store.clear = function () {};

  store.transact = function (key, defaultVal, transactionFn) {
    if (transactionFn == null) {
      transactionFn = defaultVal;
      defaultVal = null;
    }

    if (defaultVal == null) {
      defaultVal = {};
    }

    var val = store.get(key, defaultVal);
    transactionFn(val);
    store.set(key, val);
  };

  store.getAll = function () {
    var ret = {};
    store.forEach(function (key, val) {
      ret[key] = val;
    });
    return ret;
  };

  store.forEach = function () {};

  store.serialize = function (value) {
    return JSON.stringify(value);
  };

  store.deserialize = function (value) {
    if (typeof value != 'string') {
      return undefined;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      return value || undefined;
    }
  }; // Functions to encapsulate questionable FireFox 3.6.13 behavior
  // when about.config::dom.storage.enabled === false
  // See https://github.com/marcuswestin/store.js/issues#issue/13


  function isLocalStorageNameSupported() {
    try {
      return localStorageName in win && win[localStorageName];
    } catch (err) {
      return false;
    }
  }

  if (isLocalStorageNameSupported()) {
    storage = win[localStorageName];

    store.set = function (key, val) {
      if (val === undefined) {
        return store.remove(key);
      }

      storage.setItem(key, store.serialize(val));
      return val;
    };

    store.get = function (key, defaultVal) {
      var val = store.deserialize(storage.getItem(key));
      return val === undefined ? defaultVal : val;
    };

    store.remove = function (key) {
      storage.removeItem(key);
    };

    store.clear = function () {
      storage.clear();
    };

    store.forEach = function (callback) {
      for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        callback(key, store.get(key));
      }
    };
  } else if (doc && doc.documentElement.addBehavior) {
    var storageOwner, storageContainer; // Since #userData storage applies only to specific paths, we need to
    // somehow link our data to a specific path.  We choose /favicon.ico
    // as a pretty safe option, since all browsers already make a request to
    // this URL anyway and being a 404 will not hurt us here.  We wrap an
    // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
    // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
    // since the iframe access rules appear to allow direct access and
    // manipulation of the document element, even for a 404 page.  This
    // document can be used instead of the current document (which would
    // have been limited to the current path) to perform #userData storage.

    try {
      storageContainer = new ActiveXObject('htmlfile');
      storageContainer.open();
      storageContainer.write('<' + scriptTag + '>document.w=window</' + scriptTag + '><iframe src="/favicon.ico"></iframe>');
      storageContainer.close();
      storageOwner = storageContainer.w.frames[0].document;
      storage = storageOwner.createElement('div');
    } catch (e) {
      // somehow ActiveXObject instantiation failed (perhaps some special
      // security settings or otherwse), fall back to per-path storage
      storage = doc.createElement('div');
      storageOwner = doc.body;
    }

    var withIEStorage = function withIEStorage(storeFunction) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(storage); // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
        // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx

        storageOwner.appendChild(storage);
        storage.addBehavior('#default#userData');
        storage.load(localStorageName);
        var result = storeFunction.apply(store, args);
        storageOwner.removeChild(storage);
        return result;
      };
    }; // In IE7, keys cannot start with a digit or contain certain chars.
    // See https://github.com/marcuswestin/store.js/issues/40
    // See https://github.com/marcuswestin/store.js/issues/83


    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");

    var ieKeyFix = function ieKeyFix(key) {
      return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
    };

    store.set = withIEStorage(function (storage, key, val) {
      key = ieKeyFix(key);

      if (val === undefined) {
        return store.remove(key);
      }

      storage.setAttribute(key, store.serialize(val));
      storage.save(localStorageName);
      return val;
    });
    store.get = withIEStorage(function (storage, key, defaultVal) {
      key = ieKeyFix(key);
      var val = store.deserialize(storage.getAttribute(key));
      return val === undefined ? defaultVal : val;
    });
    store.remove = withIEStorage(function (storage, key) {
      key = ieKeyFix(key);
      storage.removeAttribute(key);
      storage.save(localStorageName);
    });
    store.clear = withIEStorage(function (storage) {
      var attributes = storage.XMLDocument.documentElement.attributes;
      storage.load(localStorageName);

      for (var i = attributes.length - 1; i >= 0; i--) {
        storage.removeAttribute(attributes[i].name);
      }

      storage.save(localStorageName);
    });
    store.forEach = withIEStorage(function (storage, callback) {
      var attributes = storage.XMLDocument.documentElement.attributes;

      for (var i = 0, attr; attr = attributes[i]; ++i) {
        callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
      }
    });
  }

  try {
    var testKey = '__storejs__';
    store.set(testKey, testKey);

    if (store.get(testKey) != testKey) {
      store.disabled = true;
    }

    store.remove(testKey);
  } catch (e) {
    store.disabled = true;
  }

  store.enabled = !store.disabled;
  return store;
}();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],10:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":8,"./encode":9}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":12,"punycode":7,"querystring":10}],12:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9naXQvd3hhcHBzL3NyYy9kcmF3c2ltL21haW4uanMiLCIuLi9naXQvd3hhcHBzL3NyYy91dGlscy9heGlzLmpzIiwiLi4vZ2l0L3d4YXBwcy9zcmMvdXRpbHMvZ3JhcGguanMiLCIuLi9naXQvd3hhcHBzL3NyYy91dGlscy9pbmRleC5qcyIsIi4uL2dpdC93eGFwcHMvc3JjL3V0aWxzL2pzb24yLmpzIiwiLi4vZ2l0L3d4YXBwcy9zcmMvdXRpbHMvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvcHVueWNvZGUvcHVueWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZW5jb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwibm9kZV9tb2R1bGVzL3VybC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSSxLQUFLLEdBQUcsc0JBQVo7QUFBQSxJQUF3QixZQUFZLEdBQUcsSUFBSSxlQUFKLENBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCLENBQXVCLFNBQXZCLENBQWlDLENBQWpDLENBQXBCLENBQXZDO0FBRUEsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsS0FBakIsQ0FBWjtBQUNBLElBQUksQ0FBQyxLQUFMLEVBQVksS0FBSyxHQUFHLE1BQU0sQ0FBQyxrQkFBRCxFQUFvQixFQUFwQixDQUFkO0FBQ1osSUFBSSxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBYixDQUFvQixLQUFwQixDQUFYO0FBQ0EsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQWIs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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSBcIi4uL3V0aWxzXCIgICBcclxuaW1wb3J0IHtVcmx9IGZyb20gXCJ1cmxcIiBcclxuIFxyXG5sZXQgc3RvcmUgPSBnZXRTdG9yZSgpLCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKVxyXG5cclxubGV0IGltYWdlID0gc2VhcmNoUGFyYW1zLmdldCgnaW1nJylcclxuaWYgKCFpbWFnZSkgaW1hZ2UgPSBwcm9tcHQoXCJFbnRlciBpbWFnZSB1cmw6XCIsXCJcIilcclxubGV0IGJhY2sgPSBuZXcgY3JlYXRlanMuQml0bWFwKGltYWdlKVxyXG5sZXQgZWRpdCA9IHNlYXJjaFBhcmFtcy5nZXQoJ21vZGUnKSA9PSBcImVkaXRcIlxyXG5sZXQgc2NhbGUgPSBzZWFyY2hQYXJhbXMuZ2V0KCdzY2FsZScpIHx8IDEuMFxyXG5sZXQgdG9vbCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3Rvb2wnKSB8fCBcInByZXNzdXJlXCJcclxubGV0IHdpZHRoID0gc2VhcmNoUGFyYW1zLmdldCgndycpIHx8IDIwXHJcbmxldCBoZWlnaHQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdoJykgfHwgMjBcclxubGV0IG9wdCA9IHNlYXJjaFBhcmFtcy5nZXQoJ29wdCcpIHx8IFwiYWxsXCJcclxubGV0IGNvbG9ycyA9IHNlYXJjaFBhcmFtcy5nZXQoJ2NvbG9ycycpIHx8IFwiYmxhY2tcIlxyXG5cclxubGV0IGxpbmV0eXBlcyA9IHtcclxuXHRkcnk6e3c6MSxjOlwiIzAwMFwifSxcclxuXHRoaWdoVDp7dzoxLGM6XCIjRjAwXCJ9LFxyXG5cdGhpZ2hUZDp7dzoxLGM6XCIjMEYwXCJ9LFxyXG5cdGpldDg1MDp7dzo1LGM6XCIjRjAwXCJ9LFxyXG5cdGpldDMwMDp7dzo1LGM6XCIjODAwMDgwXCJ9XHJcbn1cclxuXHJcbmxldCBsaW5ldHlwZSA9IFwiZHJ5XCIgXHJcbmxldCBsaW5ldHlwZUJ1dHRvbiA9IG51bGxcclxuXHJcbmNyZWF0ZWpzLk1vdGlvbkd1aWRlUGx1Z2luLmluc3RhbGwoKVxyXG5cclxuLy9MaW5lcyB3aXRoIHN5bWJvbHMgZm9yIGEgZHJ5IGxpbmUsIG1vaXN0dXJlIGF4aXMsIHRoZXJtYWwgcmlkZ2UsIGxvdyBsZXZlbCBqZXQgYW5kIHVwcGVyIGxldmVsIGpldCBcclxuXHJcbmZ1bmN0aW9uIGRpc3QocDEscDIpIHsgXHJcblx0bGV0IGR4ID0gcDEueCAtIHAyLngsIGR5ID0gcDEueSAtIHAyLnlcclxuXHRyZXR1cm4gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFuZ2xlKHAxLCBwMikge1xyXG4gICAgcmV0dXJuIE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAyLnggLSBwMS54KSAqIDE4MCAvIE1hdGguUEk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXBvbmVudFRvSGV4KGMpIHtcclxuXHQgIHZhciBoZXggPSBjLnRvU3RyaW5nKDE2KTtcclxuXHQgIHJldHVybiBoZXgubGVuZ3RoID09IDEgPyBcIjBcIiArIGhleCA6IGhleDtcclxuXHR9XHJcblxyXG5mdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XHJcbiAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDb2xvcigpIHtcclxuICAgIHZhciByYWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdjb2xvcicpOyAgICAgICBcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCByYWRpby5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmKHJhZGlvW2ldLmNoZWNrZWQpXHJcbiAgICAgICAgXHRyZXR1cm4gcmFkaW9baV0udmFsdWVcclxuICAgIH1cclxuICAgIHJldHVybiBcImJsYWNrXCJcclxufVxyXG5cclxudmFyIHNhdmVwYXJtcyA9IFtdO1xyXG5cclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcblx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdGxldCBbc3ltYm9sLCBjYl0gPSBzYXZlcGFybXNcclxuXHRsZXQgZGVzY19lZGl0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NfZWRpdG9yXCIpXHJcblx0cmVtb3ZlU3ltYm9sKHN5bWJvbClcclxuXHRzeW1ib2wuZGVzYyA9IGRlc2NfZWRpdG9yLnZhbHVlXHJcblx0YWRkU3ltYm9sKHN5bWJvbClcclxuXHRlZGl0b3Iuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHRjYih0cnVlKVxyXG59KTtcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVcIikuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuXHRlLnN0b3BQcm9wYWdhdGlvbigpXHJcblx0bGV0IFtzeW1ib2wsIGNiXSA9IHNhdmVwYXJtc1xyXG5cdHJlbW92ZVN5bWJvbChzeW1ib2wpXHJcblx0ZWRpdG9yLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblx0Y2IoZmFsc2UpXHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldERlc2MocHQsIHN5bWJvbCwgY2IpIHtcclxuXHRsZXQgZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0b3JcIilcclxuXHRsZXQgZGVzY19lZGl0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NfZWRpdG9yXCIpXHJcblx0bGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbmNhbnZhc1wiKVxyXG5cdGRlc2NfZWRpdG9yLnZhbHVlID0gc3ltYm9sLmRlc2NcclxuXHRlZGl0b3Iuc3R5bGUubGVmdCA9IChwdFswXSArIGNhbnZhcy5vZmZzZXRMZWZ0KSArIFwicHhcIlxyXG5cdGVkaXRvci5zdHlsZS50b3AgPSAocHRbMV0gKyBjYW52YXMub2Zmc2V0VG9wKSArIFwicHhcIlxyXG5cdGVkaXRvci5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCJcclxuXHRlZGl0b3IuZm9jdXMoKVxyXG5cdHNhdmVwYXJtcyA9IFtzeW1ib2wsIGNiXVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRNaWQocHRzKSB7XHJcblx0bGV0IFtzdGFydCwgZW5kXSA9IFtwdHNbMF0sIHB0c1twdHMubGVuZ3RoIC0gMV1dXHJcblx0bGV0IFttaWR4LCBtaWR5XSA9IFswLCAwXVxyXG5cdGlmIChzdGFydC54IDwgZW5kLngpIG1pZHggPSBzdGFydC54ICsgKGVuZC54IC0gc3RhcnQueCkgLyAyIC0gMjA7XHJcblx0ZWxzZSBtaWR4ID0gZW5kLnggKyAoc3RhcnQueCAtIGVuZC54KSAvIDIgLSAyMDsgXHJcblx0aWYgKHN0YXJ0LnkgPCBlbmQueSkgbWlkeSA9IHN0YXJ0LnkgKyAoZW5kLnkgLSBzdGFydC55KSAvIDI7XHJcblx0ZWxzZSBtaWR5ID0gZW5kLnkgKyAoc3RhcnQueSAtIGVuZC55KSAvIDI7XHJcblx0cmV0dXJuIFttaWR4LCBtaWR5XTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkTGFiZWwocGF0aCwgbWlkLCBzeW1ib2wsIGNiKSB7XHJcblx0bGV0IGRlc2MgPSBuZXcgY3JlYXRlanMuVGV4dChzeW1ib2wuZGVzYyxcIjE0cHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRkZXNjLnggPSBtaWRbMF0gXHJcblx0ZGVzYy55ID0gbWlkWzFdXHJcbiAgICB2YXIgcmVjdCA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpO1xyXG5cdHJlY3QuZ3JhcGhpY3MuYmVnaW5GaWxsKFwid2hpdGVcIik7XHJcbiAgICByZWN0LmdyYXBoaWNzLmRyYXdSZWN0KGRlc2MueCwgZGVzYy55LCBkZXNjLmdldE1lYXN1cmVkV2lkdGgoKSwgZGVzYy5nZXRNZWFzdXJlZEhlaWdodCgpKTtcclxuICAgIHJlY3QuZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgcmVjdC5jdXJzb3IgPSBcInRleHRcIlxyXG4gICAgcGF0aC5hZGRDaGlsZChyZWN0KTtcclxuXHRwYXRoLmFkZENoaWxkKGRlc2MpO1xyXG5cdHJlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdFx0Z2V0RGVzYyhtaWQsIHN5bWJvbCwgY2IpXHJcblx0fSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U3ltYm9scygpIHtcclxuXHRsZXQgc3ltYm9scyA9IHN0b3JlLmdldChpbWFnZSArIFwiLlwiICsgdG9vbClcclxuXHRpZiAoIXN5bWJvbHMpIHtcclxuXHRcdHN5bWJvbHMgPSB7Y250OiAxLCBkYXRhOiB7fX1cclxuXHRcdHN0b3JlLnNldChpbWFnZSArIFwiLlwiICsgdG9vbCwgc3ltYm9scylcclxuXHR9XHJcblx0cmV0dXJuIHN5bWJvbHNcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkU3ltYm9sKHN5bWJvbCkge1xyXG5cdGxldCBzeW1ib2xzID0gZ2V0U3ltYm9scygpXHJcblx0c3ltYm9sLmlkID0gc3ltYm9scy5jbnQrKztcclxuXHRzeW1ib2xzLmRhdGFbc3ltYm9sLmlkXSA9IHN5bWJvbFxyXG5cdHN0b3JlLnNldChpbWFnZSArIFwiLlwiICsgdG9vbCwgc3ltYm9scylcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlU3ltYm9sKHN5bWJvbCkge1xyXG5cdGxldCBzeW1ib2xzID0gZ2V0U3ltYm9scygpXHJcblx0c3ltYm9scy5kYXRhW3N5bWJvbC5pZF0gPSBzeW1ib2xcclxuXHRzdG9yZS5zZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wsIHN5bWJvbHMpXHRcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3ltYm9sKHN5bWJvbCkge1xyXG5cdGxldCBzeW1ib2xzID0gZ2V0U3ltYm9scygpXHJcblx0aWYgKHN5bWJvbC5pZCkgZGVsZXRlIHN5bWJvbHMuZGF0YVtzeW1ib2wuaWRdXHJcblx0c3RvcmUuc2V0KGltYWdlICsgXCIuXCIgKyB0b29sLCBzeW1ib2xzKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVTeW1ib2xzKCkge1xyXG5cdHN5bWJvbHMgPSB7Y250OiAxLCBkYXRhOiB7fX1cclxuXHRzdG9yZS5zZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wsc3ltYm9scylcclxufVxyXG5cclxuY2xhc3MgVmVjdG9yIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSxqc29uKSB7XHJcblx0XHRsZXQgbWFwID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChqc29uLmltZylcclxuXHRcdG1hcC54ID0ganNvbi5wdC54XHJcblx0XHRtYXAueSA9IGpzb24ucHQueVxyXG5cdFx0bWFwLnJlZ1ggPSAxMlxyXG5cdFx0bWFwLnJlZ1kgPSAxMlxyXG4gICAgXHRtYXAucm90YXRpb24gPSBqc29uLnJvdFxyXG4gICAgXHRtYXAuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRtYXAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0bWFwLnN0YWdlLnJlbW92ZUNoaWxkKG1hcClcclxuXHRcdH0pXHJcblx0XHRzdGFnZS5hZGRDaGlsZChtYXApXHJcblx0fVxyXG5cdFx0XHJcblx0Y29uc3RydWN0b3IoeCxyb3QsaW1nLGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuXHRcdHRoaXMueCA9IHhcclxuXHRcdHRoaXMueSA9IDBcclxuXHRcdHRoaXMuaW1nID0gaW1nXHJcblx0XHR0aGlzLnJvdCA9IHJvdFxyXG5cdFx0bGV0IHNlbGVjdCA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRzZWxlY3QuZ3JhcGhpY3MuYmVnaW5GaWxsKFwiI0NDQ1wiKS5kcmF3Um91bmRSZWN0KDAsMCwyNiwyNiwyLDIsMiwyKS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5hZGRDaGlsZChzZWxlY3QpXHJcblx0XHRsZXQgbWFwID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChpbWcpXHJcblx0XHRtYXAueCA9IDEzXHJcblx0XHRtYXAueSA9IDEzXHJcblx0XHRtYXAucmVnWCA9IDEyXHJcblx0XHRtYXAucmVnWSA9IDEyXHJcbiAgICBcdG1hcC5yb3RhdGlvbiA9IHJvdFxyXG4gICAgXHR0aGlzLnNldEJvdW5kcyh4LDAsMjYsMjYpXHJcbiAgICBcdHRoaXMuYWRkQ2hpbGQobWFwKVxyXG5cdFx0c2VsZWN0LmFscGhhID0gMFxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGUgPT4gc2VsZWN0LmFscGhhID0gMC41KVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZSA9PiBzZWxlY3QuYWxwaGEgPSAwKVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBkcmF3c2ltLnRvb2xiYXIuc2VsZWN0KHRoaXMpKVxyXG5cdH1cclxuXHRcclxuXHR0b0pTT04oeCx5KSB7XHJcblx0XHRyZXR1cm4ge3R5cGU6XCJ2ZWN0b3JcIiwgaW1nOiB0aGlzLmltZywgcm90OiB0aGlzLnJvdCwgcHQ6e3g6eCx5Onl9fVxyXG5cdH1cdFx0XHJcbn1cclxuXHJcbmNsYXNzIFByZXNzdXJlUmVnaW9uIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSxqc29uKSB7XHJcblx0XHRsZXQgcmVnaW9uID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRsZXQgdHh0ID0gbmV3IGNyZWF0ZWpzLlRleHQoanNvbi5oaWdoP1wiSFwiOlwiTFwiLFwiYm9sZCAyNHB4IEFyaWFsXCIsanNvbi5oaWdoP1wiIzAwRlwiOlwiI0YwMFwiKVxyXG5cdFx0dHh0LnggPSBqc29uLnB0LnggLSAxMlxyXG5cdFx0dHh0LnkgPSBqc29uLnB0LnkgLSAxMlxyXG5cdFx0bGV0IGNpcmNsZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRjaXJjbGUuZ3JhcGhpY3MuYmVnaW5GaWxsKGpzb24uaGlnaD9cIiMwRjBcIjpcIiNGRjBcIikuZHJhd0NpcmNsZShqc29uLnB0LngsanNvbi5wdC55LDI0KS5lbmRGaWxsKClcclxuXHRcdGNpcmNsZS5hbHBoYSA9IDAuNVxyXG5cdFx0cmVnaW9uLmFkZENoaWxkKGNpcmNsZSlcclxuXHRcdHJlZ2lvbi5hZGRDaGlsZCh0eHQpXHJcblx0XHRyZWdpb24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0cmVnaW9uLnN0YWdlLnJlbW92ZUNoaWxkKHJlZ2lvbilcclxuXHRcdH0pXHJcbiAgICBcdHJlZ2lvbi5jdXJzb3IgPSBcInVybChhc3NldHMvcmVtb3ZlLnBuZykgOCA4LCBhdXRvXCJcclxuXHRcdHN0YWdlLmFkZENoaWxkKHJlZ2lvbilcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IoeCxoaWdoLGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuXHRcdHRoaXMuaGlnaCA9IGhpZ2hcclxuXHRcdGxldCB0eHQgPSBuZXcgY3JlYXRlanMuVGV4dChoaWdoP1wiSFwiOlwiTFwiLFwiYm9sZCAyNHB4IEFyaWFsXCIsaGlnaD9cIiMwMEZcIjpcIiNGMDBcIilcclxuXHRcdHR4dC54ID0geCArIDJcclxuXHRcdHR4dC55ID0gMlxyXG5cdFx0bGV0IHNlbGVjdCA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRzZWxlY3QuZ3JhcGhpY3MuYmVnaW5GaWxsKFwiI0NDQ1wiKS5kcmF3Um91bmRSZWN0KHgsMCwyNiwyNiwyLDIsMiwyKS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5hZGRDaGlsZChzZWxlY3QpXHJcblx0XHRsZXQgY2lyY2xlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGNpcmNsZS5ncmFwaGljcy5iZWdpbkZpbGwoaGlnaD9cIiMwRjBcIjpcIiNGRjBcIikuZHJhd0NpcmNsZSh4KzEyLDEyLDEzKS5lbmRGaWxsKClcclxuXHRcdGNpcmNsZS5hbHBoYSA9IDAuM1xyXG5cdFx0dGhpcy5hZGRDaGlsZChjaXJjbGUsdHh0KVxyXG4gICAgXHR0aGlzLnNldEJvdW5kcyh4LDAsMjYsMjYpXHJcblx0XHRzZWxlY3QuYWxwaGEgPSAwXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZSA9PiBzZWxlY3QuYWxwaGEgPSAwLjUpXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBlID0+IHNlbGVjdC5hbHBoYSA9IDApXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IGRyYXdzaW0udG9vbGJhci5zZWxlY3QodGhpcykpXHJcblx0fVxyXG5cclxuXHR0b0pTT04oeCx5KSB7XHJcblx0XHRyZXR1cm4ge3R5cGU6XCJyZWdpb25cIiwgaGlnaDogdGhpcy5oaWdoLCBwdDp7eDp4LHk6eX19XHJcblx0fVx0XHRcclxuXHJcblx0Z2V0TGVuZ3RoKCkgeyByZXR1cm4gMiozMCsyIH1cclxufVxyXG5cclxuY2xhc3MgUHJlc3N1cmVzIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRjb25zdHJ1Y3Rvcih4LGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuXHRcdHRoaXMueCA9IHhcclxuXHRcdHRoaXMueSA9IDJcclxuXHRcdGlmIChvcHQgPT0gXCJhbGxcIiB8fCBvcHQgPT0gXCJhcnJvd3NcIilcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuXHRcdFx0XHRsZXQgdiA9IG5ldyBWZWN0b3IoeCw0NSppLFwiYXNzZXRzL2xlZnQtYXJyb3cucG5nXCIsZHJhd3NpbSlcclxuXHRcdFx0XHR0aGlzLmFkZENoaWxkKHYpXHJcblx0XHRcdFx0eCArPSAzMFxyXG5cdFx0XHR9XHJcblx0XHRpZiAob3B0ID09IFwiYWxsXCIgfHwgb3B0ID09IFwiaGxcIikge1xyXG5cdFx0XHR0aGlzLmFkZENoaWxkKG5ldyBQcmVzc3VyZVJlZ2lvbih4LHRydWUsZHJhd3NpbSkpXHJcblx0XHRcdHggKz0gMzBcclxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgUHJlc3N1cmVSZWdpb24oeCxmYWxzZSxkcmF3c2ltKSlcclxuXHRcdFx0eCArPSAzMFxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnZXRMZW5ndGgoKSB7XHJcblx0XHRsZXQgbiA9IG9wdCA9PSBcImFsbFwiPzEwOm9wdCA9PSBcImFycm93c1wiPzg6MlxyXG5cdFx0cmV0dXJuIG4qMzArMiBcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEFpcm1hc3MgZXh0ZW5kcyBjcmVhdGVqcy5Db250YWluZXIge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLGpzb24pIHtcclxuXHRcdGxldCBhaXJtYXNzID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRhaXJtYXNzLnggPSBqc29uLnB0LnhcclxuXHRcdGFpcm1hc3MueSA9IGpzb24ucHQueVxyXG5cdFx0bGV0IGNpcmNsZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRjaXJjbGUuZ3JhcGhpY3MuYmVnaW5GaWxsKFwiI0ZGRlwiKS5iZWdpblN0cm9rZShcIiMwMDBcIikuZHJhd0NpcmNsZSgxNCwxNCwxNCkuZW5kU3Ryb2tlKClcclxuXHRcdGFpcm1hc3MuYWRkQ2hpbGQoY2lyY2xlKVxyXG5cdFx0bGV0IHR4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KGpzb24ubmFtZSxcIjEycHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRcdHR4dC54ID0gNlxyXG5cdFx0dHh0LnkgPSAxMFxyXG5cdFx0YWlybWFzcy5hZGRDaGlsZCh0eHQpXHJcbiAgICBcdGFpcm1hc3MuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRcdGFpcm1hc3MuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0YWlybWFzcy5zdGFnZS5yZW1vdmVDaGlsZChhaXJtYXNzKVxyXG5cdFx0fSlcclxuICAgIFx0c3RhZ2UuYWRkQ2hpbGQoYWlybWFzcylcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IoeCxuYW1lLGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuXHRcdHRoaXMueCA9IHhcclxuXHRcdHRoaXMueSA9IDJcclxuXHRcdHRoaXMubmFtZSA9IG5hbWVcclxuXHRcdGxldCBjaXJjbGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Y2lyY2xlLmdyYXBoaWNzLmJlZ2luRmlsbChcIiNGRkZcIikuYmVnaW5TdHJva2UoXCIjMDAwXCIpLmRyYXdDaXJjbGUoMTQsMTQsMTQpLmVuZFN0cm9rZSgpXHJcblx0XHR0aGlzLmFkZENoaWxkKGNpcmNsZSlcclxuXHRcdGxldCB0eHQgPSBuZXcgY3JlYXRlanMuVGV4dChuYW1lLFwiMTJweCBBcmlhbFwiLFwiIzAwMFwiKVxyXG5cdFx0dHh0LnggPSA2XHJcblx0XHR0eHQueSA9IDEwXHJcblx0XHR0aGlzLmFkZENoaWxkKHR4dClcclxuXHRcdGxldCBzZWxlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0c2VsZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIiNDQ0NcIikuZHJhd0NpcmNsZSgxNCwxNCwxNCkuZW5kU3Ryb2tlKClcclxuXHRcdHRoaXMuYWRkQ2hpbGQoc2VsZWN0KVxyXG5cdFx0c2VsZWN0LmFscGhhID0gMFxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGUgPT4ge1xyXG5cdFx0XHRzZWxlY3QuYWxwaGEgPSAwLjVcclxuXHRcdH0pXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBlID0+IHtcclxuXHRcdFx0c2VsZWN0LmFscGhhID0gMFxyXG5cdFx0fSlcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRkcmF3c2ltLnRvb2xiYXIuc2VsZWN0KHRoaXMpXHJcblx0XHR9KVxyXG5cdH1cclxuXHRcclxuXHR0b0pTT04oeCx5KSB7XHJcblx0XHRyZXR1cm4ge3R5cGU6XCJhaXJtYXNzXCIsIG5hbWU6IHRoaXMubmFtZSwgcHQ6e3g6eCx5Onl9fVxyXG5cdH1cdFx0XHJcbn1cclxuXHJcbmNsYXNzIEFpcm1hc3NlcyBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0Y29uc3RydWN0b3IoeCx0b29sYmFyKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHRsZXQgbWFzc2VzID0gW1wiY1BcIixcIm1QXCIsXCJjVFwiLFwibVRcIixcImNFXCIsXCJtRVwiLFwiY0FcIixcIm1BXCJdXHJcblx0XHRtYXNzZXMuZm9yRWFjaChuYW1lID0+IHtcclxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgQWlybWFzcyh4LG5hbWUsdG9vbGJhcikpXHJcblx0XHRcdHggKz0gMzBcclxuXHRcdH0pXHJcblx0fVxyXG5cdFxyXG5cdGdldExlbmd0aCgpIHsgcmV0dXJuIDgqMzArMiB9XHJcbn1cclxuXHJcbmNsYXNzIElzb1BsZXRoIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSxqc29uKSB7XHJcblx0XHRsZXQgcHRzID0ganNvbi5wdHNcclxuXHRcdGxldCBwYXRoID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRsZXQgc2hhcGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdCAgICBzaGFwZS5ncmFwaGljcy5iZWdpblN0cm9rZShcIiMwMEZcIilcclxuXHRcdGxldCBvbGRYID0gcHRzWzBdLnhcclxuXHRcdGxldCBvbGRZID0gcHRzWzBdLnlcclxuXHRcdGxldCBvbGRNaWRYID0gb2xkWFxyXG5cdFx0bGV0IG9sZE1pZFkgPSBvbGRZXHJcblx0ICAgIGpzb24ucHRzLmZvckVhY2gocHQgPT4ge1xyXG5cdFx0XHRsZXQgbWlkUG9pbnQgPSBuZXcgY3JlYXRlanMuUG9pbnQob2xkWCArIHB0LnggPj4gMSwgb2xkWStwdC55ID4+IDEpXHJcblx0ICAgICAgICBzaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSg0KS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHNoYXBlLmdyYXBoaWNzLmN1cnZlVG8ob2xkWCwgb2xkWSwgb2xkTWlkWCwgb2xkTWlkWSlcclxuXHQgICAgICAgIG9sZFggPSBwdC54XHJcblx0ICAgICAgICBvbGRZID0gcHQueVxyXG5cdCAgICAgICAgb2xkTWlkWCA9IG1pZFBvaW50LnhcclxuXHQgICAgICAgIG9sZE1pZFkgPSBtaWRQb2ludC55XHJcblx0ICAgIH0pXHJcblx0XHRwYXRoLmFkZENoaWxkKHNoYXBlKVxyXG5cdFx0bGV0IGZpcnN0ID0gcHRzWzBdLCBsYXN0ID0gcHRzW3B0cy5sZW5ndGgtMV1cclxuXHRcdGxldCBsYWJlbCA9IElzb1BsZXRoLmdldExhYmVsKGpzb24udmFsdWUsZmlyc3QueCAtIDEwLGZpcnN0LnkgKyAoZmlyc3QueSA8IGxhc3QueT8gLTI0OiAwKSlcclxuICAgIFx0bGFiZWwuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRsYWJlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdHJlbW92ZVN5bWJvbChqc29uKVxyXG5cdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChwYXRoKVxyXG5cdFx0fSlcclxuXHRcdHBhdGguYWRkQ2hpbGQobGFiZWwpXHJcblx0XHRpZiAoZGlzdChmaXJzdCxsYXN0KSA+IDEwKSB7XHJcblx0XHRcdGxldCBsYWJlbCA9IElzb1BsZXRoLmdldExhYmVsKGpzb24udmFsdWUsbGFzdC54IC0gMTAsbGFzdC55ICsgKGZpcnN0LnkgPCBsYXN0Lnk/IDAgOiAtMjQpKVxyXG5cdFx0XHRsYWJlbC5jdXJzb3IgPSBcInVybChhc3NldHMvcmVtb3ZlLnBuZykgOCA4LCBhdXRvXCJcclxuXHRcdFx0bGFiZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRcdHJlbW92ZVN5bWJvbChqc29uKVxyXG5cdFx0XHRcdHN0YWdlLnJlbW92ZUNoaWxkKHBhdGgpXHJcblx0XHRcdH0pXHJcblx0XHRcdHBhdGguYWRkQ2hpbGQobGFiZWwpXHJcblx0XHR9XHJcblx0XHRzdGFnZS5hZGRDaGlsZChwYXRoKVxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgZ2V0TGFiZWwobmFtZSx4LHkpIHtcclxuXHRcdGxldCBsYWJlbCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0bGV0IHR4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KG5hbWUsXCJib2xkIDI0cHggQXJpYWxcIixcIiMwMEZcIilcclxuXHRcdHR4dC54ID0geFxyXG5cdFx0dHh0LnkgPSB5XHJcblx0XHRsZXQgY2lyY2xlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGNpcmNsZS5ncmFwaGljcy5iZWdpbkZpbGwoXCIjRkZGXCIpLmRyYXdDaXJjbGUoeCArIDEyLHkgKyAxMiwyMCkuZW5kRmlsbCgpXHJcblx0XHRsYWJlbC5hZGRDaGlsZChjaXJjbGUpXHJcblx0XHRsYWJlbC5hZGRDaGlsZCh0eHQpXHJcblx0XHRyZXR1cm4gbGFiZWxcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IoZHJhd3NpbSkge1xyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmZyYW1lcmF0ZSA9IDEwXHJcblx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZWRvd25cIiwgZSA9PiB7XHJcblx0XHRcdHRoaXMuY3VycmVudFNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdCAgICB0aGlzLmN1cnJlbnRTaGFwZS5ncmFwaGljcy5iZWdpblN0cm9rZShcIiMwMEZcIilcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkQ2hpbGQodGhpcy5jdXJyZW50U2hhcGUpXHJcblx0XHQgICAgdGhpcy5vbGRYID0gdGhpcy5vbGRNaWRYID0gZS5zdGFnZVhcclxuXHRcdCAgICB0aGlzLm9sZFkgPSB0aGlzLm9sZE1pZFkgPSBlLnN0YWdlWVxyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IHRydWVcclxuXHRcdFx0dGhpcy5wdHMgPSBbXVxyXG5cdFx0fSlcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNlbW92ZVwiLCBlID0+IHtcclxuXHRcdFx0aWYgKHRoaXMubW91c2VEb3duID09IGZhbHNlKSByZXR1cm5cclxuXHQgICAgICAgIHRoaXMucHQgPSBuZXcgY3JlYXRlanMuUG9pbnQoZS5zdGFnZVgsIGUuc3RhZ2VZKVxyXG5cdFx0XHR0aGlzLnB0cyA9IHRoaXMucHRzLmNvbmNhdCh7eDplLnN0YWdlWCx5OmUuc3RhZ2VZfSlcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KHRoaXMub2xkWCArIHRoaXMucHQueCA+PiAxLCB0aGlzLm9sZFkrdGhpcy5wdC55ID4+IDEpXHJcblx0ICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSg0KS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLmdyYXBoaWNzLmN1cnZlVG8odGhpcy5vbGRYLCB0aGlzLm9sZFksIHRoaXMub2xkTWlkWCwgdGhpcy5vbGRNaWRZKVxyXG5cdCAgICAgICAgdGhpcy5vbGRYID0gdGhpcy5wdC54XHJcblx0ICAgICAgICB0aGlzLm9sZFkgPSB0aGlzLnB0LnlcclxuXHQgICAgICAgIHRoaXMub2xkTWlkWCA9IG1pZFBvaW50LnhcclxuXHQgICAgICAgIHRoaXMub2xkTWlkWSA9IG1pZFBvaW50LnlcclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZXVwXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0XHRpZiAodGhpcy5wdHMubGVuZ3RoIDwgMykgcmV0dXJuXHJcblx0XHRcdGxldCB2YWx1ZSA9IHByb21wdChcIkVudGVyIHZhbHVlOlwiLDEpXHJcblx0XHRcdGlmICh2YWx1ZSkge1xyXG5cdFx0XHRcdGxldCBzeW1ib2wgPSB7dHlwZTpcImlzb3BsZXRoXCIsdmFsdWU6IHZhbHVlLCBwdHM6IHRoaXMucHRzfVxyXG5cdFx0XHRcdElzb1BsZXRoLnNob3dTeW1ib2woZHJhd3NpbS5tYWluc3RhZ2Usc3ltYm9sKVxyXG5cdFx0XHRcdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBMaW5lIHtcclxuXHRzdGF0aWMgZ2V0TGluZVNoYXBlKGx0KSB7XHJcblx0XHRsZXQgc2hhcGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdCAgICBzaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZShsdC53KS5iZWdpblN0cm9rZShsdC5jKVxyXG5cdCAgICByZXR1cm4gc2hhcGVcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIHNldEJ1dHRvbihidXR0b24sY29sb3IpIHtcclxuXHRcdGxldCBiID0gYnV0dG9uLmdldENoaWxkQXQoMClcclxuXHRcdGxldCBib3JkZXIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Ym9yZGVyLnggPSBiLnhcclxuXHRcdGJvcmRlci5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgxKS5iZWdpbkZpbGwoY29sb3IpLmJlZ2luU3Ryb2tlKFwiI0FBQVwiKS5kcmF3Um91bmRSZWN0KDAsMiw2MiwxOCwyLDIsMiwyKS5lbmRTdHJva2UoKVxyXG5cdFx0YnV0dG9uLnJlbW92ZUNoaWxkQXQoMClcclxuXHRcdGJ1dHRvbi5hZGRDaGlsZEF0KGJvcmRlciwwKVxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgZ2V0QnV0dG9uKHgsbmFtZSkge1xyXG5cdFx0bGV0IGx0ID0gbGluZXR5cGVzW25hbWVdXHJcblx0XHRsZXQgYnV0dG9uID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRidXR0b24uY3Vyc29yID0gXCJwb2ludGVyXCJcclxuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixlID0+IHtcclxuXHRcdFx0aWYgKG5hbWUgPT0gbGluZXR5cGUpIHJldHVyblxyXG5cdFx0XHRpZiAobGluZXR5cGVCdXR0b24pIExpbmUuc2V0QnV0dG9uKGxpbmV0eXBlQnV0dG9uLFwiI0ZGRlwiKVxyXG5cdFx0XHRMaW5lLnNldEJ1dHRvbihidXR0b24sXCIjRUVFXCIpXHJcblx0XHRcdGxpbmV0eXBlID0gbmFtZVxyXG5cdFx0XHRsaW5ldHlwZUJ1dHRvbiA9IGJ1dHRvblx0XHRcdFxyXG5cdFx0fSlcclxuXHRcdGxldCBib3JkZXIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Ym9yZGVyLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKDEpLmJlZ2luRmlsbChuYW1lID09IGxpbmV0eXBlP1wiI0VFRVwiOlwiI0ZGRlwiKS5iZWdpblN0cm9rZShcIiNBQUFcIikuZHJhd1JvdW5kUmVjdCgwLDIsNjIsMTgsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdGlmIChuYW1lID09IGxpbmV0eXBlKSBsaW5ldHlwZUJ1dHRvbiA9IGJ1dHRvblxyXG5cdFx0Ym9yZGVyLnggPSB4XHJcblx0XHRsZXQgdHh0ID0gbmV3IGNyZWF0ZWpzLlRleHQobmFtZSxcImJvbGQgMTJweCBBcmlhbFwiLFwiIzAwMFwiKVxyXG5cdFx0dHh0LnggPSB4KzVcclxuXHRcdHR4dC55ID0gNVxyXG5cdFx0bGV0IGxpbmUgPSBMaW5lLmdldExpbmVTaGFwZShsdClcclxuXHRcdGxldCBsZWZ0ID0geCArIHR4dC5nZXRCb3VuZHMoKS53aWR0aCsxMFxyXG5cdFx0bGluZS5ncmFwaGljcy5tb3ZlVG8obGVmdCwxMCkubGluZVRvKGxlZnQrMTUsMTApLmVuZFN0cm9rZSgpXHJcblx0XHRidXR0b24uYWRkQ2hpbGQoYm9yZGVyLHR4dCxsaW5lKVxyXG5cdFx0cmV0dXJuIGJ1dHRvblxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSxqc29uKSB7XHJcblx0XHRsZXQgcHRzID0ganNvbi5wdHNcclxuXHRcdGxldCBwYXRoID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRwYXRoLm5hbWUgPSBqc29uLmx0eXBlXHJcblx0XHRsZXQgc2hhcGUgPSBMaW5lLmdldExpbmVTaGFwZShsaW5ldHlwZXNbanNvbi5sdHlwZV0pXHJcblx0XHRsZXQgb2xkWCA9IHB0c1swXS54XHJcblx0XHRsZXQgb2xkWSA9IHB0c1swXS55XHJcblx0XHRsZXQgb2xkTWlkWCA9IG9sZFhcclxuXHRcdGxldCBvbGRNaWRZID0gb2xkWVxyXG5cdCAgICBqc29uLnB0cy5mb3JFYWNoKHB0ID0+IHtcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KG9sZFggKyBwdC54ID4+IDEsIG9sZFkrcHQueSA+PiAxKVxyXG5cdCAgICAgICAgc2hhcGUuZ3JhcGhpY3MubW92ZVRvKG1pZFBvaW50LngsIG1pZFBvaW50LnkpXHJcblx0ICAgICAgICBzaGFwZS5ncmFwaGljcy5jdXJ2ZVRvKG9sZFgsIG9sZFksIG9sZE1pZFgsIG9sZE1pZFkpXHJcblx0ICAgICAgICBvbGRYID0gcHQueFxyXG5cdCAgICAgICAgb2xkWSA9IHB0LnlcclxuXHQgICAgICAgIG9sZE1pZFggPSBtaWRQb2ludC54XHJcblx0ICAgICAgICBvbGRNaWRZID0gbWlkUG9pbnQueVxyXG5cdCAgICB9KVxyXG5cdCAgICBwYXRoLmFkZENoaWxkKHNoYXBlKVxyXG5cdCAgICBzdGFnZS5hZGRDaGlsZChwYXRoKVxyXG5cdH1cclxuXHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRjcmVhdGVqcy5UaWNrZXIuZnJhbWVyYXRlID0gMTBcclxuXHRcdHRoaXMubW91c2VEb3duID0gZmFsc2VcclxuXHRcdGxldCB4ID0gNVxyXG5cdFx0Zm9yIChsZXQga2V5IGluIGxpbmV0eXBlcykge1xyXG5cdFx0XHRsZXQgYiA9IExpbmUuZ2V0QnV0dG9uKHgsa2V5KVxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRDaGlsZChiKVxyXG5cdFx0XHR4ICs9IDY1XHJcblx0XHR9XHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZWRvd25cIiwgZSA9PiB7XHJcblx0XHRcdHRoaXMuY3VycmVudFNoYXBlID0gTGluZS5nZXRMaW5lU2hhcGUobGluZXR5cGVzW2xpbmV0eXBlXSlcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkQ2hpbGQodGhpcy5jdXJyZW50U2hhcGUpXHJcblx0XHQgICAgdGhpcy5vbGRYID0gdGhpcy5vbGRNaWRYID0gZS5zdGFnZVhcclxuXHRcdCAgICB0aGlzLm9sZFkgPSB0aGlzLm9sZE1pZFkgPSBlLnN0YWdlWVxyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IHRydWVcclxuXHRcdFx0dGhpcy5wdHMgPSBbXVxyXG5cdFx0fSlcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNlbW92ZVwiLCBlID0+IHtcclxuXHRcdFx0aWYgKHRoaXMubW91c2VEb3duID09IGZhbHNlKSByZXR1cm5cclxuXHQgICAgICAgIHRoaXMucHQgPSBuZXcgY3JlYXRlanMuUG9pbnQoZS5zdGFnZVgsIGUuc3RhZ2VZKVxyXG5cdFx0XHR0aGlzLnB0cyA9IHRoaXMucHRzLmNvbmNhdCh7eDplLnN0YWdlWCx5OmUuc3RhZ2VZfSlcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KHRoaXMub2xkWCArIHRoaXMucHQueCA+PiAxLCB0aGlzLm9sZFkrdGhpcy5wdC55ID4+IDEpXHJcblx0ICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZShsaW5ldHlwZXNbbGluZXR5cGVdLncpLm1vdmVUbyhtaWRQb2ludC54LCBtaWRQb2ludC55KVxyXG5cdCAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3MuY3VydmVUbyh0aGlzLm9sZFgsIHRoaXMub2xkWSwgdGhpcy5vbGRNaWRYLCB0aGlzLm9sZE1pZFkpXHJcblx0ICAgICAgICB0aGlzLm9sZFggPSB0aGlzLnB0LnhcclxuXHQgICAgICAgIHRoaXMub2xkWSA9IHRoaXMucHQueVxyXG5cdCAgICAgICAgdGhpcy5vbGRNaWRYID0gbWlkUG9pbnQueFxyXG5cdCAgICAgICAgdGhpcy5vbGRNaWRZID0gbWlkUG9pbnQueVxyXG5cdFx0fSlcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNldXBcIiwgZSA9PiB7XHJcblx0XHRcdHRoaXMubW91c2VEb3duID0gZmFsc2VcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50U2hhcGUpXHJcblx0XHRcdGlmICh0aGlzLnB0cy5sZW5ndGggPCAzKSByZXR1cm5cclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UucmVtb3ZlQ2hpbGQoZHJhd3NpbS5tYWluc3RhZ2UuZ2V0Q2hpbGRCeU5hbWUobGluZXR5cGUpKVxyXG5cdFx0XHRnZXRTeW1ib2xzKCkuZm9yRWFjaChzID0+IHtcclxuXHRcdFx0XHRpZiAocy5sdHlwZSA9PSBsaW5ldHlwZSkgcmVtb3ZlU3ltYm9sKHMpXHJcblx0XHRcdH0pXHJcblx0XHRcdGxldCBzeW1ib2wgPSB7dHlwZTpcImxpbmVcIixsdHlwZTogbGluZXR5cGUsIHB0czogdGhpcy5wdHN9XHJcblx0XHRcdExpbmUuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSxzeW1ib2wpXHJcblx0XHRcdGFkZFN5bWJvbChzeW1ib2wpXHRcdFx0XHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgRWxsaXBzZSBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IGVsbGlwc2UgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0ZWxsaXBzZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgyKS5iZWdpbkZpbGwoXCIjRkZGXCIpLmJlZ2luU3Ryb2tlKFwiI0YwMFwiKS5kcmF3RWxsaXBzZShNYXRoLnJvdW5kKGpzb24ucHQueC1qc29uLncvMiksTWF0aC5yb3VuZChqc29uLnB0LnktanNvbi5oLzIpLE1hdGgucm91bmQoanNvbi53KSxNYXRoLnJvdW5kKGpzb24uaCkpLmVuZFN0cm9rZSgpXHJcblx0XHRlbGxpcHNlLmFscGhhID0gMC41XHJcbiAgICBcdGVsbGlwc2UuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRlbGxpcHNlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdHN0YWdlLnJlbW92ZUNoaWxkKGVsbGlwc2UpXHJcblx0XHR9KVxyXG4gICAgXHRzdGFnZS5hZGRDaGlsZChlbGxpcHNlKVxyXG5cdH1cclxuXHRcdFxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuICAgIFx0YmFjay5jdXJzb3IgPSBcInBvaW50ZXJcIlxyXG5cdFx0YmFjay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdGxldCBzeW1ib2wgPSB0aGlzLnRvSlNPTihlLnN0YWdlWCxlLnN0YWdlWSlcclxuXHRcdFx0YWRkU3ltYm9sKHN5bWJvbClcclxuXHRcdFx0RWxsaXBzZS5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLHN5bWJvbClcclxuXHRcdH0pXHJcblx0fVxyXG5cdFxyXG5cdHRvSlNPTih4LHkpIHtcclxuXHRcdHJldHVybiB7dHlwZTpcImVsbGlwc2VcIiwgZXg6IGV4LCB3OndpZHRoLCBoOmhlaWdodCwgcHQ6e3g6eCx5Onl9fVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgRmllbGQge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLCBqc29uKSB7XHJcblx0XHRsZXQgcHRzID0ganNvbi5wdHNcclxuXHQgICAgaWYgKHB0cy5sZW5ndGggPT0gMCkgcmV0dXJuXHJcblx0XHRsZXQgc2hhcGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0bGV0IG9sZFggPSBwdHNbMF0ueCBcclxuXHRcdGxldCBvbGRZID0gcHRzWzBdLnlcclxuXHRcdGxldCBvbGRNaWRYID0gb2xkWFxyXG5cdFx0bGV0IG9sZE1pZFkgPSBvbGRZXHJcblx0XHR0aGlzLmNvbG9yID0ganNvbi5jb2xvcjtcclxuXHQgICAgc2hhcGUuZ3JhcGhpY3MuYmVnaW5TdHJva2UodGhpcy5jb2xvcik7XHJcblx0ICAgIGpzb24ucHRzLmZvckVhY2gocHQgPT4ge1xyXG5cdFx0XHRsZXQgbWlkUG9pbnQgPSBuZXcgY3JlYXRlanMuUG9pbnQob2xkWCArIHB0LnggPj4gMSwgb2xkWSArIHB0LnkgPj4gMSlcclxuXHQgICAgICAgIHNoYXBlLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKDIpLm1vdmVUbyhtaWRQb2ludC54LCBtaWRQb2ludC55KVxyXG5cdCAgICAgICAgc2hhcGUuZ3JhcGhpY3MuY3VydmVUbyhvbGRYLCBvbGRZLCBvbGRNaWRYLCBvbGRNaWRZKVxyXG5cdCAgICAgICAgb2xkWCA9IHB0LnhcclxuXHQgICAgICAgIG9sZFkgPSBwdC55XHJcblx0ICAgICAgICBvbGRNaWRYID0gbWlkUG9pbnQueFxyXG5cdCAgICAgICAgb2xkTWlkWSA9IG1pZFBvaW50LnlcclxuXHQgICAgfSlcclxuXHRcdGxldCBwYXRoID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRwYXRoLmFkZENoaWxkKHNoYXBlKVxyXG5cdCAgICBpZiAoKG9wdCA9PSAnaGVhZCcgfHwgb3B0ID09IFwiY29sb3JoZWFkXCIpICYmIHB0cy5sZW5ndGggPiA0KSB7XHJcblx0XHQgICAgcGF0aC5hZGRDaGlsZChGaWVsZC5kcmF3SGVhZChwdHMsIGpzb24uY29sb3IpKVxyXG5cdFx0ICAgIGFkZExhYmVsKHBhdGgsIGdldE1pZChwdHMpLCBqc29uLCBmdW5jdGlvbihrZWVwKSB7XHJcblx0ICAgIFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZChwYXRoKVxyXG5cdCAgICBcdFx0aWYgKGtlZXApIEZpZWxkLnNob3dTeW1ib2woZHJhd3NpbS5tYWluc3RhZ2UsIGpzb24pXHRcdCAgICBcdFxyXG5cdFx0ICAgIH0pXHJcblx0ICAgIH1cclxuICAgIFx0c2hhcGUuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcbiAgICBcdHN0YWdlLmFkZENoaWxkKHBhdGgpXHJcblx0XHRzaGFwZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdHJlbW92ZVN5bWJvbChqc29uKVxyXG5cdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChwYXRoKVxyXG5cdFx0fSlcclxuXHRcdHJldHVybiBwYXRoXHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBkcmF3SGVhZChwdHMsIGNvbG9yKSB7XHJcbiAgICBcdGxldCBsYXN0cHQgPSBwdHNbcHRzLmxlbmd0aC02XVxyXG4gICAgXHRsZXQgZW5kcHQgPSBwdHNbcHRzLmxlbmd0aC0xXVxyXG4gICAgXHRsZXQgaGVhZCA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0ICAgIGhlYWQuZ3JhcGhpY3MuZihjb2xvcikuc2V0U3Ryb2tlU3R5bGUoNCkuYmVnaW5TdHJva2UoY29sb3IpLm10KDQsMCkubHQoLTQsLTQpLmx0KC00LDQpLmx0KDQsMClcclxuXHQgICAgaGVhZC54ID0gZW5kcHQueFxyXG5cdCAgICBoZWFkLnkgPSBlbmRwdC55XHJcblx0ICAgIGhlYWQucm90YXRpb24gPSBhbmdsZShsYXN0cHQsZW5kcHQpXHJcblx0ICAgIHJldHVybiBoZWFkXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSA1XHJcblx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHR0aGlzLncgPSAxXHJcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVwiKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vkb3duXCIsIGUgPT4ge1xyXG5cdFx0XHRpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlZGl0b3JcIikuc3R5bGUudmlzaWJpbGl0eSA9PSBcInZpc2libGVcIikgcmV0dXJuO1xyXG5cdFx0XHR0aGlzLnNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkQ2hpbGQodGhpcy5zaGFwZSlcclxuXHRcdCAgICB0aGlzLm9sZFggPSB0aGlzLm9sZE1pZFggPSBlLnN0YWdlWFxyXG5cdFx0ICAgIHRoaXMub2xkWSA9IHRoaXMub2xkTWlkWSA9IGUuc3RhZ2VZXHJcblx0XHRcdHRoaXMubW91c2VEb3duID0gdHJ1ZVxyXG5cdFx0XHR0aGlzLnB0cyA9IFtdXHJcblx0XHRcdHRoaXMuY29sb3IgPSBcIiMwMDBcIlxyXG5cdFx0XHRpZiAob3B0ID09IFwiY29sb3JoZWFkXCIpIHtcclxuXHRcdFx0XHR2YXIgY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluY2FudmFzXCIpLmdldENvbnRleHQoXCIyZFwiKVxyXG5cdFx0XHQgICAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKHRoaXMub2xkWCwgdGhpcy5vbGRZLCAxLCAxKS5kYXRhXHJcblx0XHRcdCAgICB0aGlzLmNvbG9yID0gcmdiVG9IZXgoZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSlcclxuXHRcdFx0fVxyXG5cdFx0ICAgIHRoaXMuc2hhcGUuZ3JhcGhpY3MuYmVnaW5TdHJva2UodGhpcy5jb2xvcilcclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZW1vdmVcIiwgZSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLm1vdXNlRG93biA9PSBmYWxzZSkgcmV0dXJuXHJcblx0ICAgICAgICB0aGlzLnB0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KGUuc3RhZ2VYLCBlLnN0YWdlWSlcclxuXHRcdFx0dGhpcy5wdHMgPSB0aGlzLnB0cy5jb25jYXQoe3g6ZS5zdGFnZVgseTplLnN0YWdlWX0pXHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludCh0aGlzLm9sZFggKyB0aGlzLnB0LnggPj4gMSwgdGhpcy5vbGRZICsgdGhpcy5wdC55ID4+IDEpXHJcblx0ICAgICAgICB0aGlzLnNoYXBlLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKDIpLm1vdmVUbyhtaWRQb2ludC54LCBtaWRQb2ludC55KVxyXG5cdCAgICAgICAgdGhpcy5zaGFwZS5ncmFwaGljcy5jdXJ2ZVRvKHRoaXMub2xkWCwgdGhpcy5vbGRZLCB0aGlzLm9sZE1pZFgsIHRoaXMub2xkTWlkWSlcclxuXHQgICAgICAgIHRoaXMub2xkWCA9IHRoaXMucHQueFxyXG5cdCAgICAgICAgdGhpcy5vbGRZID0gdGhpcy5wdC55XHJcblx0ICAgICAgICB0aGlzLm9sZE1pZFggPSBtaWRQb2ludC54XHJcblx0ICAgICAgICB0aGlzLm9sZE1pZFkgPSBtaWRQb2ludC55XHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2V1cFwiLCBlID0+IHtcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0XHRpZiAodGhpcy5wdHMubGVuZ3RoID09IDApIHJldHVyblxyXG5cdFx0XHRsZXQgc3ltYm9sID0ge3R5cGU6XCJmaWVsZFwiLCBwdHM6IHRoaXMucHRzLCBjb2xvcjogdGhpcy5jb2xvciwgZGVzYzogXCJcIn1cclxuXHRcdCAgICBpZiAoKG9wdCA9PSAnaGVhZCcgfHwgb3B0ID09IFwiY29sb3JoZWFkXCIpICYmIHRoaXMucHRzLmxlbmd0aCA+IDQpIHtcclxuXHRcdFx0XHRsZXQgdGhhdCA9IHRoaXM7XHJcblx0XHQgICAgXHRsZXQgaGVhZCA9IEZpZWxkLmRyYXdIZWFkKHRoaXMucHRzLCB0aGlzLmNvbG9yKVxyXG5cdFx0ICAgIFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkQ2hpbGQoaGVhZClcclxuXHRcdCAgICBcdGdldERlc2MoZ2V0TWlkKHRoaXMucHRzKSwgc3ltYm9sLCBmdW5jdGlvbihrZWVwKSB7XHJcblx0XHQgICAgXHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKHRoYXQuc2hhcGUpXHJcblx0XHQgICAgXHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKGhlYWQpXHJcblx0XHQgICAgXHRcdGlmIChrZWVwKSBGaWVsZC5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLCBzeW1ib2wpXHJcblx0XHQgICAgXHR9KTtcclxuXHRcdCAgICB9XHJcblx0XHR9KVxyXG5cdH0gXHJcbn1cclxuXHJcbmNsYXNzIFRyYW5zZm9ybSB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsIHN5bWJvbCkge1xyXG5cdFx0YmFjay5yb3RhdGlvbiA9IHN5bWJvbC5yb3RhdGlvbjtcclxuXHRcdGJhY2suc2NhbGVYID0gc3ltYm9sLmZsaXBIO1xyXG5cdFx0YmFjay5zY2FsZVkgPSBzeW1ib2wuZmxpcFY7XHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSA1XHJcblx0XHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdFx0aWYgKHN5bWJvbHMuY250ID09IDEpIHtcclxuXHRcdFx0bGV0IHN5bWJvbCA9IHt0eXBlOlwidHJhbnNmb3JtXCIsIHJvdGF0aW9uOiAwLCBmbGlwSDogMSwgZmxpcFY6IDF9XHJcblx0XHRcdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0XHR9XHJcblx0XHRpZiAoZWRpdCkge1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRyYW5zZm9ybVwiKS5zdHlsZS52aXNpYmlsaXR5PVwidmlzaWJsZVwiO1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvdGF0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0YmFjay5yb3RhdGlvbiA9IGJhY2sucm90YXRpb24gPCAzNjAgPyBiYWNrLnJvdGF0aW9uICsgOTAgOiAwXHJcblx0XHRcdFx0bGV0IHN5bWJvbCA9IGdldFN5bWJvbHMoKS5kYXRhWzFdXHJcblx0XHRcdFx0c3ltYm9sLnJvdGF0aW9uID0gYmFjay5yb3RhdGlvblxyXG5cdFx0XHRcdHVwZGF0ZVN5bWJvbChzeW1ib2wpXHJcblx0XHRcdFx0VHJhbnNmb3JtLnNob3dTeW1ib2woZHJhd3NpbS5zdGFnZSwgc3ltYm9sKVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmbGlwaFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0YmFjay5zY2FsZVggPSAtYmFjay5zY2FsZVhcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0gZ2V0U3ltYm9scygpLmRhdGFbMV1cclxuXHRcdFx0XHRzeW1ib2wuZmxpcEggPSBiYWNrLnNjYWxlWFxyXG5cdFx0XHRcdHVwZGF0ZVN5bWJvbChzeW1ib2wpXHRcdFx0XHRcclxuXHRcdFx0XHRUcmFuc2Zvcm0uc2hvd1N5bWJvbChkcmF3c2ltLnN0YWdlLCBzeW1ib2wpXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZsaXB2XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRiYWNrLnNjYWxlWSA9IC1iYWNrLnNjYWxlWVxyXG5cdFx0XHRcdGxldCBzeW1ib2wgPSBnZXRTeW1ib2xzKCkuZGF0YVsxXVxyXG5cdFx0XHRcdHN5bWJvbC5mbGlwViA9IGJhY2suc2NhbGVZXHJcblx0XHRcdFx0dXBkYXRlU3ltYm9sKHN5bWJvbClcdFx0XHJcblx0XHRcdFx0VHJhbnNmb3JtLnNob3dTeW1ib2woZHJhd3NpbS5zdGFnZSwgc3ltYm9sKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIExhYmVsIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSwganNvbikge1xyXG5cdFx0bGV0IHBhdGggPSBuZXcgY3JlYXRlanMuQ29udGFpbmVyKClcclxuXHRcdHN0YWdlLmFkZENoaWxkKHBhdGgpO1xyXG5cdFx0YWRkTGFiZWwocGF0aCwgW2pzb24ueCwganNvbi55XSwganNvbiwgZnVuY3Rpb24oc2hvdykge1xyXG5cdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChwYXRoKTtcclxuICAgIFx0XHRpZiAoc2hvdykgTGFiZWwuc2hvd1N5bWJvbChzdGFnZSwganNvbilcclxuXHRcdH0pXHJcblx0fVxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0bGV0IHN5bWJvbCA9IHtcInR5cGVcIjogXCJsYWJlbFwiLCB4OiBlLnN0YWdlWCwgeTogZS5zdGFnZVksIGRlc2M6IFwiXCJ9XHJcblx0XHRcdGdldERlc2MoW3N5bWJvbC54LCBzeW1ib2wueV0sIHN5bWJvbCwgZnVuY3Rpb24oc2hvdykge1xyXG5cdCAgICBcdFx0aWYgKHNob3cpIExhYmVsLnNob3dTeW1ib2woZHJhd3NpbS5tYWluc3RhZ2UsIHN5bWJvbClcclxuXHRcdFx0fSlcclxuXHRcdH0pXHRcdFxyXG5cdH1cdFx0XHJcbn1cclxuXHJcbmNsYXNzIEFycm93IHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSwganNvbiwgc2hvd0N1cnNvcikge1xyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGxldCB3ID0gTWF0aC5taW4od2lkdGgsIDUpXHJcblx0XHRsZXQgZCA9IE1hdGguaHlwb3QoanNvbi5zdGFydC54IC0ganNvbi5lbmQueCwganNvbi5zdGFydC55IC0ganNvbi5lbmQueSlcclxuXHQgICAgc2hhcGUuZ3JhcGhpY3Muc3MoMSkucyhqc29uLmNvbG9yKS5mKGpzb24uY29sb3IpLm10KDAsIDApLmx0KDAsIHcpLmx0KGQsIHcpLmx0KGQsIDIgKiB3KS5sdChkICsgMiAqIHcsIDApLmx0KGQsIC0gMiAqIHcpLmx0KGQsIC13KS5sdCgwLCAtdykubHQoMCwgMClcclxuXHQgICAgc2hhcGUueCA9IGpzb24uc3RhcnQueFxyXG5cdCAgICBzaGFwZS55ID0ganNvbi5zdGFydC55XHJcblx0ICAgIHNoYXBlLnJvdGF0aW9uID0gYW5nbGUoanNvbi5zdGFydCwganNvbi5lbmQpXHJcblx0XHRpZiAoc2hvd0N1cnNvcikgc2hhcGUuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRzaGFwZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdHN0YWdlLnJlbW92ZUNoaWxkKHNoYXBlKVxyXG5cdFx0fSlcclxuICAgIFx0c3RhZ2UuYWRkQ2hpbGQoc2hhcGUpXHJcblx0XHRyZXR1cm4gc2hhcGVcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IoZHJhd3NpbSkge1xyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmZyYW1lcmF0ZSA9IDMwXHJcblx0XHRsZXQgY29sb3JzZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb2xvcnNcIilcclxuXHRcdGxldCBjaGVja2VkID0gdHJ1ZVxyXG5cdFx0Y29sb3JzLnNwbGl0KFwiLFwiKS5mb3JFYWNoKGNvbG9yID0+IHtcclxuXHRcdFx0dmFyIHJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKVxyXG5cdFx0XHQgIHJhZGlvLnR5cGUgPSAncmFkaW8nXHJcblx0XHRcdCAgcmFkaW8ubmFtZSA9ICdjb2xvcidcclxuXHRcdFx0ICByYWRpby5jaGVja2VkID0gY2hlY2tlZDtcclxuXHRcdFx0ICByYWRpby5pZCA9IGNvbG9yXHJcblx0XHRcdCAgcmFkaW8udmFsdWUgPSBjb2xvclxyXG5cdFx0XHQgIGNvbG9yc2Rpdi5hcHBlbmRDaGlsZChyYWRpbylcclxuXHRcdFx0dmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxyXG5cdFx0XHQgIGxhYmVsLmZvciA9IGNvbG9yXHJcblx0XHRcdGxhYmVsLnN0eWxlLmNvbG9yID0gY29sb3I7XHJcblx0XHRcdGNvbG9yc2Rpdi5hcHBlbmRDaGlsZChsYWJlbClcclxuXHRcdFx0dmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjb2xvcilcclxuXHRcdFx0bGFiZWwuYXBwZW5kQ2hpbGQodGV4dClcclxuXHRcdFx0Y2hlY2tlZCA9IGZhbHNlXHJcblx0XHR9KVxyXG5cdFx0bGV0IHN5bWJvbCA9IHt0eXBlOlwiYXJyb3dcIiwgc3RhcnQ6e30sIGVuZDoge30sIGNvbG9yOiBnZXRDb2xvcigpfVxyXG5cdFx0bGV0IG1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRsZXQgc2hhcGUgPSBudWxsXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZWRvd25cIiwgZSA9PiB7XHJcblx0XHRcdGxldCB0aGluZyA9IGRyYXdzaW0ubWFpbnN0YWdlLmdldE9iamVjdFVuZGVyUG9pbnQoZS5zdGFnZVgsIGUuc3RhZ2VZKVxyXG5cdFx0XHRpZiAoIXRoaW5nIHx8ICF0aGluZy5pbWFnZSkgcmV0dXJuXHJcblx0XHRcdG1vdXNlRG93biA9IHRydWVcclxuXHRcdFx0c3ltYm9sLnN0YXJ0ID0ge3g6IGUuc3RhZ2VYLCB5OiBlLnN0YWdlWX1cclxuXHRcdFx0c3ltYm9sLmVuZCA9IHt4OiBlLnN0YWdlWCwgeTogZS5zdGFnZVl9XHJcblx0XHRcdHN5bWJvbC5jb2xvciA9IGdldENvbG9yKClcclxuXHRcdFx0c2hhcGUgPSBBcnJvdy5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLCBzeW1ib2wsIGZhbHNlKTtcclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZW1vdmVcIiwgZSA9PiB7XHJcblx0XHRcdGlmIChtb3VzZURvd24pIHtcclxuXHRcdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZChzaGFwZSlcclxuXHRcdFx0XHRzeW1ib2wuZW5kID0ge3g6IGUuc3RhZ2VYLCB5OiBlLnN0YWdlWX1cclxuXHRcdFx0XHRzaGFwZSA9IEFycm93LnNob3dTeW1ib2woZHJhd3NpbS5tYWluc3RhZ2UsIHN5bWJvbCwgZmFsc2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2V1cFwiLCBlID0+IHtcclxuXHRcdFx0aWYgKG1vdXNlRG93bikge1xyXG5cdFx0XHRcdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0XHRcdFx0aWYgKHNoYXBlKSBzaGFwZS5jdXJzb3IgPSBcInVybChhc3NldHMvcmVtb3ZlLnBuZykgOCA4LCBhdXRvXCJcclxuXHRcdFx0XHRtb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH0gXHJcbn1cclxuXHJcbmNsYXNzIFRvb2xiYXIgZXh0ZW5kcyBjcmVhdGVqcy5Db250YWluZXIge1xyXG5cdGNvbnN0cnVjdG9yKHRvb2wsZHJhd3NpbSkge1xyXG5cdFx0c3VwZXIoKVxyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmZyYW1lcmF0ZSA9IDIwXHJcblx0XHRsZXQgYm9yZGVyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdHRoaXMuYWRkQ2hpbGQoYm9yZGVyKVxyXG5cdFx0bGV0IHcgPSAyXHJcblx0XHR0aGlzLmFkZENoaWxkKHRvb2wpXHJcblx0XHR3ICs9IHRvb2wuZ2V0TGVuZ3RoKClcclxuXHRcdHRoaXMuY2FuY2VsID0gbmV3IFZlY3Rvcih3LDAsXCJhc3NldHMvY3Jvc3MucG5nXCIsZHJhd3NpbSlcclxuXHRcdHRoaXMuY2FuY2VsLnkgPSAyXHJcblx0XHR0aGlzLmFkZENoaWxkKHRoaXMuY2FuY2VsKVxyXG5cdFx0dyArPSAzMFxyXG5cdFx0dGhpcy54ID0gMFxyXG5cdFx0dGhpcy55ID0gLTEwMFxyXG5cdFx0dGhpcy53ID0gd1xyXG5cdFx0Ym9yZGVyLmdyYXBoaWNzLmJlZ2luRmlsbChcIiNGRkZcIikuYmVnaW5TdHJva2UoXCIjQUFBXCIpLmRyYXdSb3VuZFJlY3QoMCwwLHcsMzAsNSw1LDUsNSkuZW5kU3Ryb2tlKClcclxuXHR9XHJcblx0XHJcblx0c2VsZWN0KG9iaikge1xyXG5cdFx0dGhpcy55ID0gLTEwMFxyXG5cdFx0aWYgKG9iaiA9PSB0aGlzLmNhbmNlbCkgcmV0dXJuXHJcblx0XHRsZXQganNvbiA9IG51bGxcclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBWZWN0b3IpIHsgXHJcblx0XHRcdGpzb24gPSBvYmoudG9KU09OKHRoaXMuZS5zdGFnZVgsdGhpcy5lLnN0YWdlWSlcclxuXHRcdFx0VmVjdG9yLnNob3dTeW1ib2wodGhpcy5zdGFnZSxqc29uKVxyXG5cdFx0fVxyXG5cdFx0aWYgKG9iaiBpbnN0YW5jZW9mIEFpcm1hc3MpIHtcclxuXHRcdFx0anNvbiA9IG9iai50b0pTT04odGhpcy5lLnN0YWdlWC0xNCx0aGlzLmUuc3RhZ2VZLTE0KVxyXG5cdFx0XHRBaXJtYXNzLnNob3dTeW1ib2wodGhpcy5zdGFnZSxqc29uKVxyXG5cdFx0fVxyXG5cdFx0aWYgKG9iaiBpbnN0YW5jZW9mIFByZXNzdXJlUmVnaW9uKSB7XHJcblx0XHRcdGpzb24gPSBvYmoudG9KU09OKHRoaXMuZS5zdGFnZVgsdGhpcy5lLnN0YWdlWSlcclxuXHRcdFx0UHJlc3N1cmVSZWdpb24uc2hvd1N5bWJvbCh0aGlzLnN0YWdlLGpzb24pXHJcblx0XHR9XHJcblx0XHRhZGRTeW1ib2woanNvbilcclxuXHRcdHRoaXMuc3RhZ2Uuc2V0Q2hpbGRJbmRleCggdGhpcywgdGhpcy5zdGFnZS5nZXROdW1DaGlsZHJlbigpLTEpXHJcblx0fVxyXG5cdFxyXG5cdHNob3coZSkge1xyXG5cdFx0aWYgKCFlLnJlbGF0ZWRUYXJnZXQgJiYgdGhpcy55IDwgMCkge1xyXG5cdFx0XHR0aGlzLnggPSBlLnN0YWdlWCAtIHRoaXMudy8yXHJcblx0XHRcdHRoaXMueSA9IGUuc3RhZ2VZIC0gMzBcclxuXHRcdFx0dGhpcy5lID0gZVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgRHJhd1NpbSB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLm1haW5zdGFnZSA9IG5ldyBjcmVhdGVqcy5TdGFnZShcIm1haW5jYW52YXNcIilcclxuXHRcdHRoaXMubWFpbnN0YWdlLmN1cnNvciA9IFwiZGVmYXVsdFwiXHJcblx0XHRjcmVhdGVqcy5Ub3VjaC5lbmFibGUodGhpcy5tYWluc3RhZ2UpXHJcblx0XHRiYWNrLmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRsZXQgYm5kID0gYmFjay5nZXRCb3VuZHMoKVxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5jYW52YXMud2lkdGggPSBibmQud2lkdGggKyA0MFxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5jYW52YXMuaGVpZ2h0ID0gYm5kLmhlaWdodCArIDQwXHJcblx0XHRcdGJhY2sueCA9IGJuZC53aWR0aCAvIDIgKyAyMFxyXG5cdFx0XHRiYWNrLnkgPSBibmQud2lkdGggLyAyICsgMjBcclxuXHRcdCAgICBiYWNrLnJlZ1ggPSBibmQud2lkdGggLyAyO1xyXG5cdFx0ICAgIGJhY2sucmVnWSA9IGJuZC5oZWlnaHQgLyAyO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5tYWluc3RhZ2UuYWRkQ2hpbGQoYmFjaylcclxuXHRcdHRoaXMuc2hvd1N5bWJvbHMoKVxyXG5cdFx0aWYgKGVkaXQpIHtcclxuXHRcdFx0dGhpcy5tYWluc3RhZ2UuZW5hYmxlTW91c2VPdmVyKClcclxuXHRcdFx0c3dpdGNoICh0b29sKSB7XHJcblx0XHRcdGNhc2UgXCJwcmVzc3VyZVwiOlxyXG5cdFx0XHRcdGxldCBwcmVzc3VyZXMgPSBuZXcgUHJlc3N1cmVzKDIsdGhpcylcclxuXHRcdFx0XHR0aGlzLnRvb2xiYXIgPSBuZXcgVG9vbGJhcihwcmVzc3VyZXMsdGhpcylcclxuXHRcdFx0XHRiYWNrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZSA9PiB0aGlzLnRvb2xiYXIuc2hvdyhlKSlcclxuXHRcdFx0XHR0aGlzLm1haW5zdGFnZS5hZGRDaGlsZCh0aGlzLnRvb2xiYXIpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImFpcm1hc3NcIjpcclxuXHRcdFx0XHRsZXQgYWlybWFzc2VzID0gbmV3IEFpcm1hc3NlcygyLHRoaXMpXHJcblx0XHRcdFx0dGhpcy50b29sYmFyID0gbmV3IFRvb2xiYXIoYWlybWFzc2VzLHRoaXMpXHJcblx0XHRcdFx0YmFjay5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGUgPT4gdGhpcy50b29sYmFyLnNob3coZSkpXHJcblx0XHRcdFx0dGhpcy5tYWluc3RhZ2UuYWRkQ2hpbGQodGhpcy50b29sYmFyKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJpc29wbGV0aFwiOlxyXG5cdFx0XHRcdHRoaXMuaXNvcGxldGggPSBuZXcgSXNvUGxldGgodGhpcylcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwibGluZVwiOlxyXG5cdFx0XHRcdHRoaXMubGluZSA9IG5ldyBMaW5lKHRoaXMpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImVsbGlwc2VcIjpcclxuXHRcdFx0XHR0aGlzLmVsbGlwc2UgPSBuZXcgRWxsaXBzZSh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJmaWVsZFwiOlxyXG5cdFx0XHRcdHRoaXMuZmllbGQgPSBuZXcgRmllbGQodGhpcylcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwidHJhbnNmb3JtXCI6XHJcblx0XHRcdFx0dGhpcy50cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKHRoaXMpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImxhYmVsXCI6XHJcblx0XHRcdFx0dGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiYXJyb3dcIjpcclxuXHRcdFx0XHR0aGlzLmFycm93ID0gbmV3IEFycm93KHRoaXMpXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0YWxlcnQoXCJQYXJhbWV0ZXIgdG9vbCBzaG91bGQgYmUgcHJlc3N1cmUsIGFpcm1hc3MsIGlzb3BsZXRoLCBsaW5lLCBlbGxpcHNlLCBmaWVsZCwgdHJhbnNmb3JtIG9yIGxhYmVsXCIpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIGhhbmRsZSBkb3dubG9hZFxyXG5cdFx0bGV0IGRsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb3dubG9hZFwiKVxyXG5cdFx0ZGwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRsZXQgZHQgPSB0aGlzLm1haW5zdGFnZS5jYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKVxyXG5cdFx0XHQvKiBDaGFuZ2UgTUlNRSB0eXBlIHRvIHRyaWNrIHRoZSBicm93c2VyIHRvIGRvd25sb2FkIHRoZSBmaWxlIGluc3RlYWQgb2YgZGlzcGxheWluZyBpdCAqL1xyXG5cdFx0XHRkdCA9IGR0LnJlcGxhY2UoL15kYXRhOmltYWdlXFwvW147XSovLCAnZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nKTtcclxuXHRcdFx0LyogSW4gYWRkaXRpb24gdG8gPGE+J3MgXCJkb3dubG9hZFwiIGF0dHJpYnV0ZSwgeW91IGNhbiBkZWZpbmUgSFRUUC1zdHlsZSBoZWFkZXJzICovXHJcblx0XHRcdGR0ID0gZHQucmVwbGFjZSgvXmRhdGE6YXBwbGljYXRpb25cXC9vY3RldC1zdHJlYW0vLCAnZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07aGVhZGVycz1Db250ZW50LURpc3Bvc2l0aW9uJTNBJTIwYXR0YWNobWVudCUzQiUyMGZpbGVuYW1lPW1hcC5wbmcnKTtcclxuXHRcdFx0ZGwuaHJlZiA9IGR0O1xyXG5cdFx0fSlcclxuXHR9XHJcblx0XHJcblx0c2hvd1N5bWJvbHMoKSB7XHJcblx0XHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdFx0Zm9yIChsZXQga2V5IGluIHN5bWJvbHNbXCJkYXRhXCJdKSB7XHJcblx0XHRcdGxldCBqc29uID0gc3ltYm9sc1tcImRhdGFcIl1ba2V5XVxyXG5cdFx0XHRzd2l0Y2ggKGpzb24udHlwZSkge1xyXG5cdFx0XHRjYXNlIFwidmVjdG9yXCI6XHJcblx0XHRcdFx0VmVjdG9yLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwicmVnaW9uXCI6XHJcblx0XHRcdFx0UHJlc3N1cmVSZWdpb24uc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJhaXJtYXNzXCI6XHJcblx0XHRcdFx0QWlybWFzcy5zaG93U3ltYm9sKHRoaXMubWFpbnN0YWdlLGpzb24pXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImlzb3BsZXRoXCI6XHJcblx0XHRcdFx0SXNvUGxldGguc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwibGluZVwiOlxyXG5cdFx0XHRcdExpbmUuc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZWxsaXBzZVwiOlxyXG5cdFx0XHRcdEVsbGlwc2Uuc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZmllbGRcIjpcclxuXHRcdFx0XHRGaWVsZC5zaG93U3ltYm9sKHRoaXMubWFpbnN0YWdlLGpzb24pXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJ0cmFuc2Zvcm1cIjpcclxuXHRcdFx0XHRUcmFuc2Zvcm0uc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwibGFiZWxcIjpcclxuXHRcdFx0XHRMYWJlbC5zaG93U3ltYm9sKHRoaXMubWFpbnN0YWdlLGpzb24pXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJhcnJvd1wiOlxyXG5cdFx0XHRcdEFycm93LnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbiwgdHJ1ZSlcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRydW4oKSB7XHJcblx0XHRsZXQgdGljayA9IDBcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5hZGRFdmVudExpc3RlbmVyKFwidGlja1wiLCBlID0+IHtcclxuXHRcdFx0dGhpcy5tYWluc3RhZ2UudXBkYXRlKClcclxuXHRcdFx0dGljaysrXHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxubGV0IGRyYXdzaW0gPSBuZXcgRHJhd1NpbSgpXHJcbmRyYXdzaW0ucnVuKCkiLCJjb25zdCBtYXJnaW5YID0gNDAsIG1hcmdpblkgPSAzMCwgZW5kTWFyZ2luID0gNVxyXG5cclxuZXhwb3J0IGNsYXNzIEF4aXMge1xyXG5cdGNvbnN0cnVjdG9yKHNwZWMpIHtcclxuXHRcdHRoaXMuc3BlYyA9IHNwZWNcclxuXHRcdHRoaXMuc3RhZ2UgPSBzcGVjLnN0YWdlXHJcblx0XHR0aGlzLncgPSBzcGVjLmRpbS53IHx8IDEwMFxyXG5cdFx0dGhpcy5oID0gc3BlYy5kaW0uaCB8fCAxMDBcclxuXHRcdHRoaXMubWluID0gc3BlYy5kaW0ubWluIHx8IDBcclxuXHRcdHRoaXMubWF4ID0gc3BlYy5kaW0ubWF4IHx8IDEwMFxyXG5cdFx0dGhpcy5mb250ID0gc3BlYy5mb250IHx8IFwiMTFweCBBcmlhbFwiXHJcblx0XHR0aGlzLmNvbG9yID0gc3BlYy5jb2xvciB8fCBcIiMwMDBcIlxyXG5cdFx0dGhpcy5sYWJlbCA9IHNwZWMubGFiZWxcclxuXHRcdHRoaXMubWFqb3IgPSBzcGVjLm1ham9yIHx8IDEwXHJcblx0XHR0aGlzLm1pbm9yID0gc3BlYy5taW5vciB8fCBzcGVjLm1ham9yXHJcblx0XHR0aGlzLnByZWNpc2lvbiA9IHNwZWMucHJlY2lzaW9uIHx8IDBcclxuXHRcdHRoaXMudmVydGljYWwgPSBzcGVjLm9yaWVudCAmJiBzcGVjLm9yaWVudCA9PSBcInZlcnRpY2FsXCIgfHwgZmFsc2VcclxuXHRcdHRoaXMubGluZWFyID0gc3BlYy5zY2FsZSAmJiBzcGVjLnNjYWxlID09IFwibGluZWFyXCIgfHwgZmFsc2VcclxuXHRcdHRoaXMuaW52ZXJ0ID0gc3BlYy5pbnZlcnQgfHwgZmFsc2VcclxuXHRcdGlmIChzcGVjLmRpbS54KSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWCA9IHNwZWMuZGltLnhcclxuXHRcdFx0dGhpcy5lbmRYID0gdGhpcy5vcmlnaW5YICsgdGhpcy53XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLm9yaWdpblggPSBtYXJnaW5YXHJcblx0XHRcdHRoaXMuZW5kWCA9IHRoaXMudyAtIGVuZE1hcmdpblxyXG5cdFx0fVxyXG5cdFx0aWYgKHNwZWMuZGltLnkpIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5ZID0gc3BlYy5kaW0ueVxyXG5cdFx0XHR0aGlzLmVuZFkgPSB0aGlzLm9yaWdpblkgLSB0aGlzLmggKyBlbmRNYXJnaW5cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWSA9IHRoaXMuaCAtIG1hcmdpbllcclxuXHRcdFx0dGhpcy5lbmRZID0gZW5kTWFyZ2luXHJcblx0XHR9XHJcblx0XHR0aGlzLnNjYWxlID0gdGhpcy52ZXJ0aWNhbCA/IE1hdGguYWJzKHRoaXMuZW5kWSAtIHRoaXMub3JpZ2luWSkvKHRoaXMubWF4IC0gdGhpcy5taW4pOiBNYXRoLmFicyh0aGlzLmVuZFggLSB0aGlzLm9yaWdpblgpLyh0aGlzLm1heCAtIHRoaXMubWluKVxyXG5cdH1cclxuXHJcblx0ZHJhd0xpbmUoeDEseTEseDIseTIpIHtcclxuXHRcdGxldCBsaW5lID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGxpbmUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoMSlcclxuXHRcdGxpbmUuZ3JhcGhpY3MuYmVnaW5TdHJva2UodGhpcy5jb2xvcilcclxuXHRcdGxpbmUuZ3JhcGhpY3MubW92ZVRvKHgxLCB5MSlcclxuXHRcdGxpbmUuZ3JhcGhpY3MubGluZVRvKHgyLCB5MilcclxuXHRcdGxpbmUuZ3JhcGhpY3MuZW5kU3Ryb2tlKCk7XHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGxpbmUpXHJcblx0fVxyXG5cdFxyXG5cdGRyYXdUZXh0KHRleHQseCx5KSB7XHJcblx0XHR0ZXh0LnggPSB4XHJcblx0XHR0ZXh0LnkgPSB5XHJcblx0XHRpZiAodGhpcy52ZXJ0aWNhbCAmJiB0ZXh0LnRleHQgPT0gdGhpcy5sYWJlbCkgdGV4dC5yb3RhdGlvbiA9IDI3MFxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0ZXh0KVxyXG5cdFx0cmV0dXJuIHRleHRcclxuXHR9XHJcblxyXG5cdGdldFRleHQocykgeyByZXR1cm4gbmV3IGNyZWF0ZWpzLlRleHQocyx0aGlzLmZvbnQsdGhpcy5jb2xvcikgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgIFx0bGV0IGxhYmVsID0gdGhpcy5nZXRUZXh0KHRoaXMubGFiZWwpXHJcbiAgICBcdGxldCBsYWJlbF9ibmRzID0gbGFiZWwuZ2V0Qm91bmRzKClcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWCx0aGlzLm9yaWdpblksdGhpcy5vcmlnaW5YLHRoaXMuZW5kWSlcclxuICAgICAgICAgICAgbGV0IG1pblhMYWJlbCA9IHRoaXMub3JpZ2luWFxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5tYWpvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWC00LHYsdGhpcy5vcmlnaW5YKzQsdikgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0VGV4dCh2YWwudG9GaXhlZCh0aGlzLnByZWNpc2lvbikpXHJcbiAgICAgICAgICAgICAgICBsZXQgYm5kcyA9IHRleHQuZ2V0Qm91bmRzKClcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gdGhpcy5vcmlnaW5YLTUtYm5kcy53aWR0aFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3VGV4dCh0ZXh0LHgsditibmRzLmhlaWdodC8yLTEwKVxyXG4gICAgICAgICAgICAgICAgaWYgKHggPCBtaW5YTGFiZWwpIG1pblhMYWJlbCA9IHhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5taW5vcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWC0yLHYsdGhpcy5vcmlnaW5YKzIsdikgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuc3BlYy5sYWJlbCkge1xyXG5cdCAgICAgICAgICAgIGxldCB5ID0gdGhpcy5vcmlnaW5ZIC0gKHRoaXMub3JpZ2luWSAtIGxhYmVsX2JuZHMud2lkdGgpLzJcclxuXHQgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KGxhYmVsLCBtaW5YTGFiZWwgLSBsYWJlbF9ibmRzLmhlaWdodCwgeSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLHRoaXMub3JpZ2luWSwgdGhpcy5lbmRYLHRoaXMub3JpZ2luWSkgICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3BlYy5sYWJlbCkge1xyXG5cdCAgICAgICAgICAgIGxldCB4ID0gKHRoaXMudyAtIGVuZE1hcmdpbiAtIGxhYmVsX2JuZHMud2lkdGgpLzJcclxuXHQgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KGxhYmVsLCB0aGlzLm9yaWdpblggKyB4LCB0aGlzLm9yaWdpblkgKyAxNSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5tYWpvcikgIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh2LHRoaXMub3JpZ2luWS00LHYsdGhpcy5vcmlnaW5ZKzQpICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5nZXRUZXh0KHZhbC50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSlcclxuICAgICAgICAgICAgICAgIGxldCBibmRzID0gdGV4dC5nZXRCb3VuZHMoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3VGV4dCh0ZXh0LHYtYm5kcy53aWR0aC8yLHRoaXMub3JpZ2luWSs0KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1pbm9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodix0aGlzLm9yaWdpblktMix2LHRoaXMub3JpZ2luWSsyKSAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TG9jKHZhbCkge1xyXG4gICAgICAgIGxldCBpdmFsID0gdGhpcy5saW5lYXI/IE1hdGgucm91bmQodGhpcy5zY2FsZSoodmFsLXRoaXMubWluKSk6IE1hdGgucm91bmQoTWF0aC5sb2codGhpcy5zY2FsZSoodmFsLXRoaXMubWluKSkpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmVydGljYWw/dGhpcy5vcmlnaW5ZIC0gaXZhbDp0aGlzLm9yaWdpblggKyBpdmFsXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VmFsdWUodikge1xyXG4gICAgXHRsZXQgZmFjdG9yID0gdGhpcy52ZXJ0aWNhbD8gKHRoaXMub3JpZ2luWSAtIHYpL3RoaXMub3JpZ2luWToodiAtIHRoaXMub3JpZ2luWCkvKHRoaXMudyAtIHRoaXMub3JpZ2luWClcclxuICAgICAgICByZXR1cm4gdGhpcy5taW4gKyAodGhpcy5tYXggLSB0aGlzLm1pbikgKiBmYWN0b3JcclxuICAgIH1cclxuXHJcbiAgICBpc0luc2lkZSh2KSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgIHJldHVybiB2ID49IHRoaXMub3JpZ2luWSAmJiB2IDw9ICh0aGlzLm9yaWdpblkgKyB0aGlzLmgpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gdiA+PSB0aGlzLm9yaWdpblggJiYgdiA8PSAodGhpcy5vcmlnaW5ZICsgdGhpcy53KVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7QXhpc30gZnJvbSBcIi4vYXhpc1wiXHJcbmV4cG9ydCBjbGFzcyBHcmFwaCB7XHJcblx0Y29uc3RydWN0b3Ioc3BlYykge1xyXG5cdFx0dGhpcy5zdGFnZSA9IHNwZWMuc3RhZ2VcclxuXHRcdHRoaXMueGF4aXMgPSBuZXcgQXhpcyh7XHJcblx0XHRcdHN0YWdlOiB0aGlzLnN0YWdlLFxyXG5cdFx0XHRsYWJlbDogc3BlYy54bGFiZWwsXHJcblx0XHRcdGRpbTogeyB4OiBzcGVjLngsIHk6IHNwZWMueSwgdzogc3BlYy53LCBoOiBzcGVjLmgsIG1pbjogc3BlYy5taW5YLCBtYXg6IHNwZWMubWF4WCB9LFxyXG5cdFx0XHRvcmllbnQ6IFwiaG9yaXpvbnRhbFwiLFxyXG5cdFx0XHRzY2FsZTogc3BlYy54c2NhbGUsXHJcblx0XHRcdG1ham9yOiBzcGVjLm1ham9yWCxcclxuXHRcdFx0bWlub3I6IHNwZWMubWlub3JYLFxyXG5cdFx0XHRwcmVjaXNpb246IHNwZWMucHJlY2lzaW9uWCxcclxuXHRcdFx0aW52ZXJ0OiBzcGVjLnhpbnZlcnRcclxuXHRcdH0pXHJcblx0XHR0aGlzLnlheGlzID0gbmV3IEF4aXMoe1xyXG5cdFx0XHRzdGFnZTogdGhpcy5zdGFnZSxcclxuXHRcdFx0bGFiZWw6IHNwZWMueWxhYmVsLFxyXG5cdFx0XHRkaW06IHsgeDogc3BlYy54LCB5OiBzcGVjLnksIHc6IHNwZWMudywgaDogc3BlYy5oLCBtaW46IHNwZWMubWluWSwgbWF4OiBzcGVjLm1heFkgfSxcclxuXHRcdFx0b3JpZW50OiBcInZlcnRpY2FsXCIsXHJcblx0XHRcdHNjYWxlOiBzcGVjLnlzY2FsZSxcclxuXHRcdFx0bWFqb3I6IHNwZWMubWFqb3JZLFxyXG5cdFx0XHRtaW5vcjogc3BlYy5taW5vclksXHJcblx0XHRcdHByZWNpc2lvbjogc3BlYy5wcmVjaXNpb25ZLFxyXG5cdFx0XHRpbnZlcnQ6IHNwZWMueWludmVydFxyXG5cdFx0fSlcclxuXHRcdHRoaXMud2lkdGggPSAxXHJcblx0XHR0aGlzLmxhc3QgPSBudWxsXHJcblx0XHR0aGlzLm1hcmtlciA9IG51bGxcclxuXHRcdHRoaXMuY29sb3IgPSBcIiMwMDBcIlxyXG5cdFx0dGhpcy5kb3R0ZWQgPSBmYWxzZVxyXG5cdFx0aWYgKHNwZWMuYmFja2dyb3VuZCkge1xyXG5cdFx0XHRsZXQgYiA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRcdGIuZ3JhcGhpY3MuYmVnaW5TdHJva2UoXCIjQUFBXCIpLmJlZ2luRmlsbChzcGVjLmJhY2tncm91bmQpLmRyYXdSZWN0KHNwZWMueCxzcGVjLnktc3BlYy5oLHNwZWMudyxzcGVjLmgpLmVuZFN0cm9rZSgpXHJcblx0XHRcdGIuYWxwaGEgPSAwLjNcclxuXHRcdFx0c3BlYy5zdGFnZS5hZGRDaGlsZChiKVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzZXRXaWR0aCh3aWR0aCkge1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoXHJcblx0fVxyXG5cdFxyXG5cdHNldERvdHRlZChkb3R0ZWQpIHtcclxuXHRcdHRoaXMuZG90dGVkID0gZG90dGVkXHJcblx0fVxyXG5cdFxyXG5cdHNldENvbG9yKGNvbG9yKSB7XHJcblx0XHR0aGlzLmNvbG9yID0gY29sb3JcclxuXHRcdHRoaXMuZW5kUGxvdCgpXHJcblx0XHR0aGlzLm1hcmtlciA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcbiAgICBcdHRoaXMubWFya2VyLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKGNvbG9yKS5iZWdpbkZpbGwoY29sb3IpLmRyYXdSZWN0KDAsMCw0LDQpXHJcbiAgICBcdHRoaXMubWFya2VyLnggPSAtMTBcclxuICAgIFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLm1hcmtlcilcclxuXHR9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgXHR0aGlzLnhheGlzLnJlbmRlcigpXHJcbiAgICBcdHRoaXMueWF4aXMucmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcigpIHtcclxuICAgIFx0dGhpcy5zdGFnZS5yZW1vdmVBbGxDaGlsZHJlbigpXHJcbiAgICBcdHRoaXMuZW5kUGxvdCgpXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZU1hcmtlcih4LHkpIHtcclxuICAgIFx0aWYgKHRoaXMubWFya2VyKSB7XHJcbiAgICBcdFx0dGhpcy5tYXJrZXIueCA9IHgtMlxyXG4gICAgXHRcdHRoaXMubWFya2VyLnkgPSB5LTJcclxuXHJcbiAgICBcdH1cclxuICAgIH1cclxuXHJcblx0ZHJhd0xpbmUoeDEseTEseDIseTIpIHtcclxuXHRcdGxldCBsaW5lID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGlmICh0aGlzLmRvdHRlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VEYXNoKFsyLDJdKS5zZXRTdHJva2VTdHlsZSh0aGlzLndpZHRoKS5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKS5tb3ZlVG8oeDEsIHkxKS5saW5lVG8oeDIsIHkyKS5lbmRTdHJva2UoKVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRsaW5lLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKHRoaXMud2lkdGgpLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpLm1vdmVUbyh4MSwgeTEpLmxpbmVUbyh4MiwgeTIpLmVuZFN0cm9rZSgpXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGxpbmUpXHJcblx0XHRyZXR1cm4gbGluZVxyXG5cdH1cclxuXHRcclxuICAgIHBsb3QoeHYseXYpIHtcclxuICAgICAgICBpZiAoeHYgPj0gdGhpcy54YXhpcy5taW4gJiYgeHYgPD0gdGhpcy54YXhpcy5tYXggJiYgeXYgPj0gdGhpcy55YXhpcy5taW4gJiYgeXYgPD0gdGhpcy55YXhpcy5tYXgpIHsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCB4ID0gdGhpcy54YXhpcy5nZXRMb2MoeHYpXHJcbiAgICAgICAgICAgIGxldCB5ID0gdGhpcy55YXhpcy5nZXRMb2MoeXYpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVNYXJrZXIodGhpcy5sYXN0LngsdGhpcy5sYXN0LnkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMubGFzdC54LHRoaXMubGFzdC55LHgseSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBuZXcgY3JlYXRlanMuUG9pbnQoeCx5KVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVNYXJrZXIoeCx5KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZW5kUGxvdCgpIHsgdGhpcy5sYXN0ID0gbnVsbCB9XHJcbiAgICBcclxufVxyXG4iLCJleHBvcnQge0dyYXBofSBmcm9tIFwiLi9ncmFwaFwiXHJcblxyXG5sZXQgSlNPTiA9IHJlcXVpcmUoXCIuL2pzb24yXCIpXHJcbmxldCBzdG9yZSA9IHJlcXVpcmUoXCIuL3N0b3JlXCIpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyYW1zKCkge1xyXG4gIGxldCBwYXJhbXMgPSB7fVxyXG4gIGlmIChsb2NhdGlvbi5zZWFyY2gpIHtcclxuICAgIGxvY2F0aW9uLnNlYXJjaC5zbGljZSgxKS5zcGxpdCgnJicpLmZvckVhY2gocGFydCA9PiB7XHJcbiAgICAgIGxldCBwYWlyID0gcGFydC5zcGxpdCgnPScpXHJcbiAgICAgIHBhaXJbMF0gPSBkZWNvZGVVUklDb21wb25lbnQocGFpclswXSlcclxuICAgICAgcGFpclsxXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKVxyXG4gICAgICBwYXJhbXNbcGFpclswXV0gPSAocGFpclsxXSAhPT0gJ3VuZGVmaW5lZCcpID8gcGFpclsxXSA6IHRydWVcclxuICAgIH0pXHJcbiAgfVxyXG4gIHJldHVybiBwYXJhbXNcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0b3JlKCkge1xyXG4gICAgaWYgKCFzdG9yZS5lbmFibGVkKSB7XHJcbiAgICAgICAgYWxlcnQoJ0xvY2FsIHN0b3JhZ2UgaXMgbm90IHN1cHBvcnRlZCBieSB5b3VyIGJyb3dzZXIuIFBsZWFzZSBkaXNhYmxlIFwiUHJpdmF0ZSBNb2RlXCIsIG9yIHVwZ3JhZGUgdG8gYSBtb2Rlcm4gYnJvd3Nlci4nKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0b3JlXHJcbn0iLCIvKlxuICAgIGpzb24yLmpzXG4gICAgMjAxNS0wNS0wM1xuXG4gICAgUHVibGljIERvbWFpbi5cblxuICAgIE5PIFdBUlJBTlRZIEVYUFJFU1NFRCBPUiBJTVBMSUVELiBVU0UgQVQgWU9VUiBPV04gUklTSy5cblxuICAgIFNlZSBodHRwOi8vd3d3LkpTT04ub3JnL2pzLmh0bWxcblxuXG4gICAgVGhpcyBjb2RlIHNob3VsZCBiZSBtaW5pZmllZCBiZWZvcmUgZGVwbG95bWVudC5cbiAgICBTZWUgaHR0cDovL2phdmFzY3JpcHQuY3JvY2tmb3JkLmNvbS9qc21pbi5odG1sXG5cbiAgICBVU0UgWU9VUiBPV04gQ09QWS4gSVQgSVMgRVhUUkVNRUxZIFVOV0lTRSBUTyBMT0FEIENPREUgRlJPTSBTRVJWRVJTIFlPVSBET1xuICAgIE5PVCBDT05UUk9MLlxuXG5cbiAgICBUaGlzIGZpbGUgY3JlYXRlcyBhIGdsb2JhbCBKU09OIG9iamVjdCBjb250YWluaW5nIHR3byBtZXRob2RzOiBzdHJpbmdpZnlcbiAgICBhbmQgcGFyc2UuIFRoaXMgZmlsZSBpcyBwcm92aWRlcyB0aGUgRVM1IEpTT04gY2FwYWJpbGl0eSB0byBFUzMgc3lzdGVtcy5cbiAgICBJZiBhIHByb2plY3QgbWlnaHQgcnVuIG9uIElFOCBvciBlYXJsaWVyLCB0aGVuIHRoaXMgZmlsZSBzaG91bGQgYmUgaW5jbHVkZWQuXG4gICAgVGhpcyBmaWxlIGRvZXMgbm90aGluZyBvbiBFUzUgc3lzdGVtcy5cblxuICAgICAgICBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKVxuICAgICAgICAgICAgdmFsdWUgICAgICAgYW55IEphdmFTY3JpcHQgdmFsdWUsIHVzdWFsbHkgYW4gb2JqZWN0IG9yIGFycmF5LlxuXG4gICAgICAgICAgICByZXBsYWNlciAgICBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBkZXRlcm1pbmVzIGhvdyBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyBhcmUgc3RyaW5naWZpZWQgZm9yIG9iamVjdHMuIEl0IGNhbiBiZSBhXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvciBhbiBhcnJheSBvZiBzdHJpbmdzLlxuXG4gICAgICAgICAgICBzcGFjZSAgICAgICBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIGluZGVudGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvZiBuZXN0ZWQgc3RydWN0dXJlcy4gSWYgaXQgaXMgb21pdHRlZCwgdGhlIHRleHQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgYmUgcGFja2VkIHdpdGhvdXQgZXh0cmEgd2hpdGVzcGFjZS4gSWYgaXQgaXMgYSBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdCB3aWxsIHNwZWNpZnkgdGhlIG51bWJlciBvZiBzcGFjZXMgdG8gaW5kZW50IGF0IGVhY2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsLiBJZiBpdCBpcyBhIHN0cmluZyAoc3VjaCBhcyAnXFx0JyBvciAnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdCBjb250YWlucyB0aGUgY2hhcmFjdGVycyB1c2VkIHRvIGluZGVudCBhdCBlYWNoIGxldmVsLlxuXG4gICAgICAgICAgICBUaGlzIG1ldGhvZCBwcm9kdWNlcyBhIEpTT04gdGV4dCBmcm9tIGEgSmF2YVNjcmlwdCB2YWx1ZS5cblxuICAgICAgICAgICAgV2hlbiBhbiBvYmplY3QgdmFsdWUgaXMgZm91bmQsIGlmIHRoZSBvYmplY3QgY29udGFpbnMgYSB0b0pTT05cbiAgICAgICAgICAgIG1ldGhvZCwgaXRzIHRvSlNPTiBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgYW5kIHRoZSByZXN1bHQgd2lsbCBiZVxuICAgICAgICAgICAgc3RyaW5naWZpZWQuIEEgdG9KU09OIG1ldGhvZCBkb2VzIG5vdCBzZXJpYWxpemU6IGl0IHJldHVybnMgdGhlXG4gICAgICAgICAgICB2YWx1ZSByZXByZXNlbnRlZCBieSB0aGUgbmFtZS92YWx1ZSBwYWlyIHRoYXQgc2hvdWxkIGJlIHNlcmlhbGl6ZWQsXG4gICAgICAgICAgICBvciB1bmRlZmluZWQgaWYgbm90aGluZyBzaG91bGQgYmUgc2VyaWFsaXplZC4gVGhlIHRvSlNPTiBtZXRob2RcbiAgICAgICAgICAgIHdpbGwgYmUgcGFzc2VkIHRoZSBrZXkgYXNzb2NpYXRlZCB3aXRoIHRoZSB2YWx1ZSwgYW5kIHRoaXMgd2lsbCBiZVxuICAgICAgICAgICAgYm91bmQgdG8gdGhlIHZhbHVlXG5cbiAgICAgICAgICAgIEZvciBleGFtcGxlLCB0aGlzIHdvdWxkIHNlcmlhbGl6ZSBEYXRlcyBhcyBJU08gc3RyaW5ncy5cblxuICAgICAgICAgICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZihuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4gPCAxMCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICcwJyArIG4gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVRDRnVsbFllYXIoKSAgICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDRGF0ZSgpKSAgICAgICsgJ1QnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDSG91cnMoKSkgICAgICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTWludXRlcygpKSAgICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDU2Vjb25kcygpKSAgICsgJ1onO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIFlvdSBjYW4gcHJvdmlkZSBhbiBvcHRpb25hbCByZXBsYWNlciBtZXRob2QuIEl0IHdpbGwgYmUgcGFzc2VkIHRoZVxuICAgICAgICAgICAga2V5IGFuZCB2YWx1ZSBvZiBlYWNoIG1lbWJlciwgd2l0aCB0aGlzIGJvdW5kIHRvIHRoZSBjb250YWluaW5nXG4gICAgICAgICAgICBvYmplY3QuIFRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIGZyb20geW91ciBtZXRob2Qgd2lsbCBiZVxuICAgICAgICAgICAgc2VyaWFsaXplZC4gSWYgeW91ciBtZXRob2QgcmV0dXJucyB1bmRlZmluZWQsIHRoZW4gdGhlIG1lbWJlciB3aWxsXG4gICAgICAgICAgICBiZSBleGNsdWRlZCBmcm9tIHRoZSBzZXJpYWxpemF0aW9uLlxuXG4gICAgICAgICAgICBJZiB0aGUgcmVwbGFjZXIgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MsIHRoZW4gaXQgd2lsbCBiZVxuICAgICAgICAgICAgdXNlZCB0byBzZWxlY3QgdGhlIG1lbWJlcnMgdG8gYmUgc2VyaWFsaXplZC4gSXQgZmlsdGVycyB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgc3VjaCB0aGF0IG9ubHkgbWVtYmVycyB3aXRoIGtleXMgbGlzdGVkIGluIHRoZSByZXBsYWNlciBhcnJheSBhcmVcbiAgICAgICAgICAgIHN0cmluZ2lmaWVkLlxuXG4gICAgICAgICAgICBWYWx1ZXMgdGhhdCBkbyBub3QgaGF2ZSBKU09OIHJlcHJlc2VudGF0aW9ucywgc3VjaCBhcyB1bmRlZmluZWQgb3JcbiAgICAgICAgICAgIGZ1bmN0aW9ucywgd2lsbCBub3QgYmUgc2VyaWFsaXplZC4gU3VjaCB2YWx1ZXMgaW4gb2JqZWN0cyB3aWxsIGJlXG4gICAgICAgICAgICBkcm9wcGVkOyBpbiBhcnJheXMgdGhleSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggbnVsbC4gWW91IGNhbiB1c2VcbiAgICAgICAgICAgIGEgcmVwbGFjZXIgZnVuY3Rpb24gdG8gcmVwbGFjZSB0aG9zZSB3aXRoIEpTT04gdmFsdWVzLlxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodW5kZWZpbmVkKSByZXR1cm5zIHVuZGVmaW5lZC5cblxuICAgICAgICAgICAgVGhlIG9wdGlvbmFsIHNwYWNlIHBhcmFtZXRlciBwcm9kdWNlcyBhIHN0cmluZ2lmaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgIHZhbHVlIHRoYXQgaXMgZmlsbGVkIHdpdGggbGluZSBicmVha3MgYW5kIGluZGVudGF0aW9uIHRvIG1ha2UgaXRcbiAgICAgICAgICAgIGVhc2llciB0byByZWFkLlxuXG4gICAgICAgICAgICBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbm9uLWVtcHR5IHN0cmluZywgdGhlbiB0aGF0IHN0cmluZyB3aWxsXG4gICAgICAgICAgICBiZSB1c2VkIGZvciBpbmRlbnRhdGlvbi4gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIG51bWJlciwgdGhlblxuICAgICAgICAgICAgdGhlIGluZGVudGF0aW9uIHdpbGwgYmUgdGhhdCBtYW55IHNwYWNlcy5cblxuICAgICAgICAgICAgRXhhbXBsZTpcblxuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KFsnZScsIHtwbHVyaWJ1czogJ3VudW0nfV0pO1xuICAgICAgICAgICAgLy8gdGV4dCBpcyAnW1wiZVwiLHtcInBsdXJpYnVzXCI6XCJ1bnVtXCJ9XSdcblxuXG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoWydlJywge3BsdXJpYnVzOiAndW51bSd9XSwgbnVsbCwgJ1xcdCcpO1xuICAgICAgICAgICAgLy8gdGV4dCBpcyAnW1xcblxcdFwiZVwiLFxcblxcdHtcXG5cXHRcXHRcInBsdXJpYnVzXCI6IFwidW51bVwiXFxuXFx0fVxcbl0nXG5cbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeShbbmV3IERhdGUoKV0sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNba2V5XSBpbnN0YW5jZW9mIERhdGUgXG4gICAgICAgICAgICAgICAgICAgID8gJ0RhdGUoJyArIHRoaXNba2V5XSArICcpJyBcbiAgICAgICAgICAgICAgICAgICAgOiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gdGV4dCBpcyAnW1wiRGF0ZSgtLS1jdXJyZW50IHRpbWUtLS0pXCJdJ1xuXG5cbiAgICAgICAgSlNPTi5wYXJzZSh0ZXh0LCByZXZpdmVyKVxuICAgICAgICAgICAgVGhpcyBtZXRob2QgcGFyc2VzIGEgSlNPTiB0ZXh0IHRvIHByb2R1Y2UgYW4gb2JqZWN0IG9yIGFycmF5LlxuICAgICAgICAgICAgSXQgY2FuIHRocm93IGEgU3ludGF4RXJyb3IgZXhjZXB0aW9uLlxuXG4gICAgICAgICAgICBUaGUgb3B0aW9uYWwgcmV2aXZlciBwYXJhbWV0ZXIgaXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBmaWx0ZXIgYW5kXG4gICAgICAgICAgICB0cmFuc2Zvcm0gdGhlIHJlc3VsdHMuIEl0IHJlY2VpdmVzIGVhY2ggb2YgdGhlIGtleXMgYW5kIHZhbHVlcyxcbiAgICAgICAgICAgIGFuZCBpdHMgcmV0dXJuIHZhbHVlIGlzIHVzZWQgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwgdmFsdWUuXG4gICAgICAgICAgICBJZiBpdCByZXR1cm5zIHdoYXQgaXQgcmVjZWl2ZWQsIHRoZW4gdGhlIHN0cnVjdHVyZSBpcyBub3QgbW9kaWZpZWQuXG4gICAgICAgICAgICBJZiBpdCByZXR1cm5zIHVuZGVmaW5lZCB0aGVuIHRoZSBtZW1iZXIgaXMgZGVsZXRlZC5cblxuICAgICAgICAgICAgRXhhbXBsZTpcblxuICAgICAgICAgICAgLy8gUGFyc2UgdGhlIHRleHQuIFZhbHVlcyB0aGF0IGxvb2sgbGlrZSBJU08gZGF0ZSBzdHJpbmdzIHdpbGxcbiAgICAgICAgICAgIC8vIGJlIGNvbnZlcnRlZCB0byBEYXRlIG9iamVjdHMuXG5cbiAgICAgICAgICAgIG15RGF0YSA9IEpTT04ucGFyc2UodGV4dCwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBhID1cbi9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSg/OlxcLlxcZCopPylaJC8uZXhlYyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoK2FbMV0sICthWzJdIC0gMSwgK2FbM10sICthWzRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICthWzVdLCArYVs2XSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBteURhdGEgPSBKU09OLnBhcnNlKCdbXCJEYXRlKDA5LzA5LzIwMDEpXCJdJywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuc2xpY2UoMCwgNSkgPT09ICdEYXRlKCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNsaWNlKC0xKSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBuZXcgRGF0ZSh2YWx1ZS5zbGljZSg1LCAtMSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgIFRoaXMgaXMgYSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24uIFlvdSBhcmUgZnJlZSB0byBjb3B5LCBtb2RpZnksIG9yXG4gICAgcmVkaXN0cmlidXRlLlxuKi9cblxuLypqc2xpbnQgXG4gICAgZXZhbCwgZm9yLCB0aGlzIFxuKi9cblxuLypwcm9wZXJ0eVxuICAgIEpTT04sIGFwcGx5LCBjYWxsLCBjaGFyQ29kZUF0LCBnZXRVVENEYXRlLCBnZXRVVENGdWxsWWVhciwgZ2V0VVRDSG91cnMsXG4gICAgZ2V0VVRDTWludXRlcywgZ2V0VVRDTW9udGgsIGdldFVUQ1NlY29uZHMsIGhhc093blByb3BlcnR5LCBqb2luLFxuICAgIGxhc3RJbmRleCwgbGVuZ3RoLCBwYXJzZSwgcHJvdG90eXBlLCBwdXNoLCByZXBsYWNlLCBzbGljZSwgc3RyaW5naWZ5LFxuICAgIHRlc3QsIHRvSlNPTiwgdG9TdHJpbmcsIHZhbHVlT2ZcbiovXG5cblxuLy8gQ3JlYXRlIGEgSlNPTiBvYmplY3Qgb25seSBpZiBvbmUgZG9lcyBub3QgYWxyZWFkeSBleGlzdC4gV2UgY3JlYXRlIHRoZVxuLy8gbWV0aG9kcyBpbiBhIGNsb3N1cmUgdG8gYXZvaWQgY3JlYXRpbmcgZ2xvYmFsIHZhcmlhYmxlcy5cblxuaWYgKHR5cGVvZiBKU09OICE9PSAnb2JqZWN0Jykge1xuICAgIEpTT04gPSB7fTtcbn1cblxuKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgdmFyIHJ4X29uZSA9IC9eW1xcXSw6e31cXHNdKiQvLFxuICAgICAgICByeF90d28gPSAvXFxcXCg/OltcIlxcXFxcXC9iZm5ydF18dVswLTlhLWZBLUZdezR9KS9nLFxuICAgICAgICByeF90aHJlZSA9IC9cIlteXCJcXFxcXFxuXFxyXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZyxcbiAgICAgICAgcnhfZm91ciA9IC8oPzpefDp8LCkoPzpcXHMqXFxbKSsvZyxcbiAgICAgICAgcnhfZXNjYXBhYmxlID0gL1tcXFxcXFxcIlxcdTAwMDAtXFx1MDAxZlxcdTAwN2YtXFx1MDA5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgICAgICByeF9kYW5nZXJvdXMgPSAvW1xcdTAwMDBcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZztcblxuICAgIGZ1bmN0aW9uIGYobikge1xuICAgICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuICAgICAgICByZXR1cm4gbiA8IDEwIFxuICAgICAgICAgICAgPyAnMCcgKyBuIFxuICAgICAgICAgICAgOiBuO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiB0aGlzX3ZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZU9mKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBEYXRlLnByb3RvdHlwZS50b0pTT04gIT09ICdmdW5jdGlvbicpIHtcblxuICAgICAgICBEYXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBpc0Zpbml0ZSh0aGlzLnZhbHVlT2YoKSlcbiAgICAgICAgICAgICAgICA/IHRoaXMuZ2V0VVRDRnVsbFllYXIoKSArICctJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENEYXRlKCkpICsgJ1QnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENIb3VycygpKSArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTWludXRlcygpKSArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDU2Vjb25kcygpKSArICdaJ1xuICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBCb29sZWFuLnByb3RvdHlwZS50b0pTT04gPSB0aGlzX3ZhbHVlO1xuICAgICAgICBOdW1iZXIucHJvdG90eXBlLnRvSlNPTiA9IHRoaXNfdmFsdWU7XG4gICAgICAgIFN0cmluZy5wcm90b3R5cGUudG9KU09OID0gdGhpc192YWx1ZTtcbiAgICB9XG5cbiAgICB2YXIgZ2FwLFxuICAgICAgICBpbmRlbnQsXG4gICAgICAgIG1ldGEsXG4gICAgICAgIHJlcDtcblxuXG4gICAgZnVuY3Rpb24gcXVvdGUoc3RyaW5nKSB7XG5cbi8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbi8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4vLyBPdGhlcndpc2Ugd2UgbXVzdCBhbHNvIHJlcGxhY2UgdGhlIG9mZmVuZGluZyBjaGFyYWN0ZXJzIHdpdGggc2FmZSBlc2NhcGVcbi8vIHNlcXVlbmNlcy5cblxuICAgICAgICByeF9lc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIHJ4X2VzY2FwYWJsZS50ZXN0KHN0cmluZykgXG4gICAgICAgICAgICA/ICdcIicgKyBzdHJpbmcucmVwbGFjZShyeF9lc2NhcGFibGUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGMgPSBtZXRhW2FdO1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYyA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgPyBjXG4gICAgICAgICAgICAgICAgICAgIDogJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICAgICAgICB9KSArICdcIicgXG4gICAgICAgICAgICA6ICdcIicgKyBzdHJpbmcgKyAnXCInO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gc3RyKGtleSwgaG9sZGVyKSB7XG5cbi8vIFByb2R1Y2UgYSBzdHJpbmcgZnJvbSBob2xkZXJba2V5XS5cblxuICAgICAgICB2YXIgaSwgICAgICAgICAgLy8gVGhlIGxvb3AgY291bnRlci5cbiAgICAgICAgICAgIGssICAgICAgICAgIC8vIFRoZSBtZW1iZXIga2V5LlxuICAgICAgICAgICAgdiwgICAgICAgICAgLy8gVGhlIG1lbWJlciB2YWx1ZS5cbiAgICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICAgIG1pbmQgPSBnYXAsXG4gICAgICAgICAgICBwYXJ0aWFsLFxuICAgICAgICAgICAgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuLy8gSWYgdGhlIHZhbHVlIGhhcyBhIHRvSlNPTiBtZXRob2QsIGNhbGwgaXQgdG8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTihrZXkpO1xuICAgICAgICB9XG5cbi8vIElmIHdlIHdlcmUgY2FsbGVkIHdpdGggYSByZXBsYWNlciBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSByZXBsYWNlciB0b1xuLy8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgICAgaWYgKHR5cGVvZiByZXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVwLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4vLyBXaGF0IGhhcHBlbnMgbmV4dCBkZXBlbmRzIG9uIHRoZSB2YWx1ZSdzIHR5cGUuXG5cbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiBxdW90ZSh2YWx1ZSk7XG5cbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcblxuLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBFbmNvZGUgbm9uLWZpbml0ZSBudW1iZXJzIGFzIG51bGwuXG5cbiAgICAgICAgICAgIHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgXG4gICAgICAgICAgICAgICAgPyBTdHJpbmcodmFsdWUpIFxuICAgICAgICAgICAgICAgIDogJ251bGwnO1xuXG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBjYXNlICdudWxsJzpcblxuLy8gSWYgdGhlIHZhbHVlIGlzIGEgYm9vbGVhbiBvciBudWxsLCBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nLiBOb3RlOlxuLy8gdHlwZW9mIG51bGwgZG9lcyBub3QgcHJvZHVjZSAnbnVsbCcuIFRoZSBjYXNlIGlzIGluY2x1ZGVkIGhlcmUgaW5cbi8vIHRoZSByZW1vdGUgY2hhbmNlIHRoYXQgdGhpcyBnZXRzIGZpeGVkIHNvbWVkYXkuXG5cbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuXG4vLyBJZiB0aGUgdHlwZSBpcyAnb2JqZWN0Jywgd2UgbWlnaHQgYmUgZGVhbGluZyB3aXRoIGFuIG9iamVjdCBvciBhbiBhcnJheSBvclxuLy8gbnVsbC5cblxuICAgICAgICBjYXNlICdvYmplY3QnOlxuXG4vLyBEdWUgdG8gYSBzcGVjaWZpY2F0aW9uIGJsdW5kZXIgaW4gRUNNQVNjcmlwdCwgdHlwZW9mIG51bGwgaXMgJ29iamVjdCcsXG4vLyBzbyB3YXRjaCBvdXQgZm9yIHRoYXQgY2FzZS5cblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgICAgICAgICB9XG5cbi8vIE1ha2UgYW4gYXJyYXkgdG8gaG9sZCB0aGUgcGFydGlhbCByZXN1bHRzIG9mIHN0cmluZ2lmeWluZyB0aGlzIG9iamVjdCB2YWx1ZS5cblxuICAgICAgICAgICAgZ2FwICs9IGluZGVudDtcbiAgICAgICAgICAgIHBhcnRpYWwgPSBbXTtcblxuLy8gSXMgdGhlIHZhbHVlIGFuIGFycmF5P1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblxuLy8gVGhlIHZhbHVlIGlzIGFuIGFycmF5LiBTdHJpbmdpZnkgZXZlcnkgZWxlbWVudC4gVXNlIG51bGwgYXMgYSBwbGFjZWhvbGRlclxuLy8gZm9yIG5vbi1KU09OIHZhbHVlcy5cblxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGlhbFtpXSA9IHN0cihpLCB2YWx1ZSkgfHwgJ251bGwnO1xuICAgICAgICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIGVsZW1lbnRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsIGFuZCB3cmFwIHRoZW0gaW5cbi8vIGJyYWNrZXRzLlxuXG4gICAgICAgICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgICAgID8gJ1tdJ1xuICAgICAgICAgICAgICAgICAgICA6IGdhcFxuICAgICAgICAgICAgICAgICAgICAgICAgPyAnW1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICddJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiAnWycgKyBwYXJ0aWFsLmpvaW4oJywnKSArICddJztcbiAgICAgICAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGUgcmVwbGFjZXIgaXMgYW4gYXJyYXksIHVzZSBpdCB0byBzZWxlY3QgdGhlIG1lbWJlcnMgdG8gYmUgc3RyaW5naWZpZWQuXG5cbiAgICAgICAgICAgIGlmIChyZXAgJiYgdHlwZW9mIHJlcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGggPSByZXAubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcFtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGsgPSByZXBbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYXAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICc6ICcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICc6J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbi8vIE90aGVyd2lzZSwgaXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUga2V5cyBpbiB0aGUgb2JqZWN0LlxuXG4gICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYXAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICc6ICcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICc6J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIG1lbWJlciB0ZXh0cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLFxuLy8gYW5kIHdyYXAgdGhlbSBpbiBicmFjZXMuXG5cbiAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgICAgID8gJ3t9J1xuICAgICAgICAgICAgICAgIDogZ2FwXG4gICAgICAgICAgICAgICAgICAgID8gJ3tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnfSdcbiAgICAgICAgICAgICAgICAgICAgOiAneycgKyBwYXJ0aWFsLmpvaW4oJywnKSArICd9JztcbiAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfVxuICAgIH1cblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgc3RyaW5naWZ5IG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgICBpZiAodHlwZW9mIEpTT04uc3RyaW5naWZ5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG1ldGEgPSB7ICAgIC8vIHRhYmxlIG9mIGNoYXJhY3RlciBzdWJzdGl0dXRpb25zXG4gICAgICAgICAgICAnXFxiJzogJ1xcXFxiJyxcbiAgICAgICAgICAgICdcXHQnOiAnXFxcXHQnLFxuICAgICAgICAgICAgJ1xcbic6ICdcXFxcbicsXG4gICAgICAgICAgICAnXFxmJzogJ1xcXFxmJyxcbiAgICAgICAgICAgICdcXHInOiAnXFxcXHInLFxuICAgICAgICAgICAgJ1wiJzogJ1xcXFxcIicsXG4gICAgICAgICAgICAnXFxcXCc6ICdcXFxcXFxcXCdcbiAgICAgICAgfTtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUsIHJlcGxhY2VyLCBzcGFjZSkge1xuXG4vLyBUaGUgc3RyaW5naWZ5IG1ldGhvZCB0YWtlcyBhIHZhbHVlIGFuZCBhbiBvcHRpb25hbCByZXBsYWNlciwgYW5kIGFuIG9wdGlvbmFsXG4vLyBzcGFjZSBwYXJhbWV0ZXIsIGFuZCByZXR1cm5zIGEgSlNPTiB0ZXh0LiBUaGUgcmVwbGFjZXIgY2FuIGJlIGEgZnVuY3Rpb25cbi8vIHRoYXQgY2FuIHJlcGxhY2UgdmFsdWVzLCBvciBhbiBhcnJheSBvZiBzdHJpbmdzIHRoYXQgd2lsbCBzZWxlY3QgdGhlIGtleXMuXG4vLyBBIGRlZmF1bHQgcmVwbGFjZXIgbWV0aG9kIGNhbiBiZSBwcm92aWRlZC4gVXNlIG9mIHRoZSBzcGFjZSBwYXJhbWV0ZXIgY2FuXG4vLyBwcm9kdWNlIHRleHQgdGhhdCBpcyBtb3JlIGVhc2lseSByZWFkYWJsZS5cblxuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICBnYXAgPSAnJztcbiAgICAgICAgICAgIGluZGVudCA9ICcnO1xuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCBtYWtlIGFuIGluZGVudCBzdHJpbmcgY29udGFpbmluZyB0aGF0XG4vLyBtYW55IHNwYWNlcy5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3BhY2U7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgKz0gJyAnO1xuICAgICAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIHN0cmluZywgaXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBpbmRlbnQgc3RyaW5nLlxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBzcGFjZTtcbiAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlcmUgaXMgYSByZXBsYWNlciwgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGFuIGFycmF5LlxuLy8gT3RoZXJ3aXNlLCB0aHJvdyBhbiBlcnJvci5cblxuICAgICAgICAgICAgcmVwID0gcmVwbGFjZXI7XG4gICAgICAgICAgICBpZiAocmVwbGFjZXIgJiYgdHlwZW9mIHJlcGxhY2VyICE9PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICAgICAgICAgICh0eXBlb2YgcmVwbGFjZXIgIT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiByZXBsYWNlci5sZW5ndGggIT09ICdudW1iZXInKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTi5zdHJpbmdpZnknKTtcbiAgICAgICAgICAgIH1cblxuLy8gTWFrZSBhIGZha2Ugcm9vdCBvYmplY3QgY29udGFpbmluZyBvdXIgdmFsdWUgdW5kZXIgdGhlIGtleSBvZiAnJy5cbi8vIFJldHVybiB0aGUgcmVzdWx0IG9mIHN0cmluZ2lmeWluZyB0aGUgdmFsdWUuXG5cbiAgICAgICAgICAgIHJldHVybiBzdHIoJycsIHsnJzogdmFsdWV9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgcGFyc2UgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICAgIGlmICh0eXBlb2YgSlNPTi5wYXJzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBKU09OLnBhcnNlID0gZnVuY3Rpb24gKHRleHQsIHJldml2ZXIpIHtcblxuLy8gVGhlIHBhcnNlIG1ldGhvZCB0YWtlcyBhIHRleHQgYW5kIGFuIG9wdGlvbmFsIHJldml2ZXIgZnVuY3Rpb24sIGFuZCByZXR1cm5zXG4vLyBhIEphdmFTY3JpcHQgdmFsdWUgaWYgdGhlIHRleHQgaXMgYSB2YWxpZCBKU09OIHRleHQuXG5cbiAgICAgICAgICAgIHZhciBqO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG5cbi8vIFRoZSB3YWxrIG1ldGhvZCBpcyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIHJlc3VsdGluZyBzdHJ1Y3R1cmUgc29cbi8vIHRoYXQgbW9kaWZpY2F0aW9ucyBjYW4gYmUgbWFkZS5cblxuICAgICAgICAgICAgICAgIHZhciBrLCB2LCB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ID0gd2Fsayh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV2aXZlci5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cblxuLy8gUGFyc2luZyBoYXBwZW5zIGluIGZvdXIgc3RhZ2VzLiBJbiB0aGUgZmlyc3Qgc3RhZ2UsIHdlIHJlcGxhY2UgY2VydGFpblxuLy8gVW5pY29kZSBjaGFyYWN0ZXJzIHdpdGggZXNjYXBlIHNlcXVlbmNlcy4gSmF2YVNjcmlwdCBoYW5kbGVzIG1hbnkgY2hhcmFjdGVyc1xuLy8gaW5jb3JyZWN0bHksIGVpdGhlciBzaWxlbnRseSBkZWxldGluZyB0aGVtLCBvciB0cmVhdGluZyB0aGVtIGFzIGxpbmUgZW5kaW5ncy5cblxuICAgICAgICAgICAgdGV4dCA9IFN0cmluZyh0ZXh0KTtcbiAgICAgICAgICAgIHJ4X2Rhbmdlcm91cy5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgaWYgKHJ4X2Rhbmdlcm91cy50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyeF9kYW5nZXJvdXMsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXHUnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4vLyBJbiB0aGUgc2Vjb25kIHN0YWdlLCB3ZSBydW4gdGhlIHRleHQgYWdhaW5zdCByZWd1bGFyIGV4cHJlc3Npb25zIHRoYXQgbG9va1xuLy8gZm9yIG5vbi1KU09OIHBhdHRlcm5zLiBXZSBhcmUgZXNwZWNpYWxseSBjb25jZXJuZWQgd2l0aCAnKCknIGFuZCAnbmV3J1xuLy8gYmVjYXVzZSB0aGV5IGNhbiBjYXVzZSBpbnZvY2F0aW9uLCBhbmQgJz0nIGJlY2F1c2UgaXQgY2FuIGNhdXNlIG11dGF0aW9uLlxuLy8gQnV0IGp1c3QgdG8gYmUgc2FmZSwgd2Ugd2FudCB0byByZWplY3QgYWxsIHVuZXhwZWN0ZWQgZm9ybXMuXG5cbi8vIFdlIHNwbGl0IHRoZSBzZWNvbmQgc3RhZ2UgaW50byA0IHJlZ2V4cCBvcGVyYXRpb25zIGluIG9yZGVyIHRvIHdvcmsgYXJvdW5kXG4vLyBjcmlwcGxpbmcgaW5lZmZpY2llbmNpZXMgaW4gSUUncyBhbmQgU2FmYXJpJ3MgcmVnZXhwIGVuZ2luZXMuIEZpcnN0IHdlXG4vLyByZXBsYWNlIHRoZSBKU09OIGJhY2tzbGFzaCBwYWlycyB3aXRoICdAJyAoYSBub24tSlNPTiBjaGFyYWN0ZXIpLiBTZWNvbmQsIHdlXG4vLyByZXBsYWNlIGFsbCBzaW1wbGUgdmFsdWUgdG9rZW5zIHdpdGggJ10nIGNoYXJhY3RlcnMuIFRoaXJkLCB3ZSBkZWxldGUgYWxsXG4vLyBvcGVuIGJyYWNrZXRzIHRoYXQgZm9sbG93IGEgY29sb24gb3IgY29tbWEgb3IgdGhhdCBiZWdpbiB0aGUgdGV4dC4gRmluYWxseSxcbi8vIHdlIGxvb2sgdG8gc2VlIHRoYXQgdGhlIHJlbWFpbmluZyBjaGFyYWN0ZXJzIGFyZSBvbmx5IHdoaXRlc3BhY2Ugb3IgJ10nIG9yXG4vLyAnLCcgb3IgJzonIG9yICd7JyBvciAnfScuIElmIHRoYXQgaXMgc28sIHRoZW4gdGhlIHRleHQgaXMgc2FmZSBmb3IgZXZhbC5cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJ4X29uZS50ZXN0KFxuICAgICAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShyeF90d28sICdAJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKHJ4X3RocmVlLCAnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShyeF9mb3VyLCAnJylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApIHtcblxuLy8gSW4gdGhlIHRoaXJkIHN0YWdlIHdlIHVzZSB0aGUgZXZhbCBmdW5jdGlvbiB0byBjb21waWxlIHRoZSB0ZXh0IGludG8gYVxuLy8gSmF2YVNjcmlwdCBzdHJ1Y3R1cmUuIFRoZSAneycgb3BlcmF0b3IgaXMgc3ViamVjdCB0byBhIHN5bnRhY3RpYyBhbWJpZ3VpdHlcbi8vIGluIEphdmFTY3JpcHQ6IGl0IGNhbiBiZWdpbiBhIGJsb2NrIG9yIGFuIG9iamVjdCBsaXRlcmFsLiBXZSB3cmFwIHRoZSB0ZXh0XG4vLyBpbiBwYXJlbnMgdG8gZWxpbWluYXRlIHRoZSBhbWJpZ3VpdHkuXG5cbiAgICAgICAgICAgICAgICBqID0gZXZhbCgnKCcgKyB0ZXh0ICsgJyknKTtcblxuLy8gSW4gdGhlIG9wdGlvbmFsIGZvdXJ0aCBzdGFnZSwgd2UgcmVjdXJzaXZlbHkgd2FsayB0aGUgbmV3IHN0cnVjdHVyZSwgcGFzc2luZ1xuLy8gZWFjaCBuYW1lL3ZhbHVlIHBhaXIgdG8gYSByZXZpdmVyIGZ1bmN0aW9uIGZvciBwb3NzaWJsZSB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICA/IHdhbGsoeycnOiBqfSwgJycpXG4gICAgICAgICAgICAgICAgICAgIDogajtcbiAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHRleHQgaXMgbm90IEpTT04gcGFyc2VhYmxlLCB0aGVuIGEgU3ludGF4RXJyb3IgaXMgdGhyb3duLlxuXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0pTT04ucGFyc2UnKTtcbiAgICAgICAgfTtcbiAgICB9XG59KCkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCJcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cdC8vIFN0b3JlLmpzXG5cdHZhciBzdG9yZSA9IHt9LFxuXHRcdHdpbiA9ICh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKSxcblx0XHRkb2MgPSB3aW4uZG9jdW1lbnQsXG5cdFx0bG9jYWxTdG9yYWdlTmFtZSA9ICdsb2NhbFN0b3JhZ2UnLFxuXHRcdHNjcmlwdFRhZyA9ICdzY3JpcHQnLFxuXHRcdHN0b3JhZ2VcblxuXHRzdG9yZS5kaXNhYmxlZCA9IGZhbHNlXG5cdHN0b3JlLnZlcnNpb24gPSAnMS4zLjIwJ1xuXHRzdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7fVxuXHRzdG9yZS5nZXQgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwpIHt9XG5cdHN0b3JlLmhhcyA9IGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gc3RvcmUuZ2V0KGtleSkgIT09IHVuZGVmaW5lZCB9XG5cdHN0b3JlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge31cblx0c3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHt9XG5cdHN0b3JlLnRyYW5zYWN0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsLCB0cmFuc2FjdGlvbkZuKSB7XG5cdFx0aWYgKHRyYW5zYWN0aW9uRm4gPT0gbnVsbCkge1xuXHRcdFx0dHJhbnNhY3Rpb25GbiA9IGRlZmF1bHRWYWxcblx0XHRcdGRlZmF1bHRWYWwgPSBudWxsXG5cdFx0fVxuXHRcdGlmIChkZWZhdWx0VmFsID09IG51bGwpIHtcblx0XHRcdGRlZmF1bHRWYWwgPSB7fVxuXHRcdH1cblx0XHR2YXIgdmFsID0gc3RvcmUuZ2V0KGtleSwgZGVmYXVsdFZhbClcblx0XHR0cmFuc2FjdGlvbkZuKHZhbClcblx0XHRzdG9yZS5zZXQoa2V5LCB2YWwpXG5cdH1cblx0c3RvcmUuZ2V0QWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHJldCA9IHt9XG5cdFx0c3RvcmUuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0cmV0W2tleV0gPSB2YWxcblx0XHR9KVxuXHRcdHJldHVybiByZXRcblx0fVxuXHRzdG9yZS5mb3JFYWNoID0gZnVuY3Rpb24oKSB7fVxuXHRzdG9yZS5zZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcblx0fVxuXHRzdG9yZS5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgeyByZXR1cm4gdW5kZWZpbmVkIH1cblx0XHR0cnkgeyByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSkgfVxuXHRcdGNhdGNoKGUpIHsgcmV0dXJuIHZhbHVlIHx8IHVuZGVmaW5lZCB9XG5cdH1cblxuXHQvLyBGdW5jdGlvbnMgdG8gZW5jYXBzdWxhdGUgcXVlc3Rpb25hYmxlIEZpcmVGb3ggMy42LjEzIGJlaGF2aW9yXG5cdC8vIHdoZW4gYWJvdXQuY29uZmlnOjpkb20uc3RvcmFnZS5lbmFibGVkID09PSBmYWxzZVxuXHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMjaXNzdWUvMTNcblx0ZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkge1xuXHRcdHRyeSB7IHJldHVybiAobG9jYWxTdG9yYWdlTmFtZSBpbiB3aW4gJiYgd2luW2xvY2FsU3RvcmFnZU5hbWVdKSB9XG5cdFx0Y2F0Y2goZXJyKSB7IHJldHVybiBmYWxzZSB9XG5cdH1cblxuXHRpZiAoaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkpIHtcblx0XHRzdG9yYWdlID0gd2luW2xvY2FsU3RvcmFnZU5hbWVdXG5cdFx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdFx0c3RvcmFnZS5zZXRJdGVtKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0XHRyZXR1cm4gdmFsXG5cdFx0fVxuXHRcdHN0b3JlLmdldCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCkge1xuXHRcdFx0dmFyIHZhbCA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxuXHRcdFx0cmV0dXJuICh2YWwgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWwgOiB2YWwpXG5cdFx0fVxuXHRcdHN0b3JlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkgeyBzdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KSB9XG5cdFx0c3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHsgc3RvcmFnZS5jbGVhcigpIH1cblx0XHRzdG9yZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdGZvciAodmFyIGk9MDsgaTxzdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBrZXkgPSBzdG9yYWdlLmtleShpKVxuXHRcdFx0XHRjYWxsYmFjayhrZXksIHN0b3JlLmdldChrZXkpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChkb2MgJiYgZG9jLmRvY3VtZW50RWxlbWVudC5hZGRCZWhhdmlvcikge1xuXHRcdHZhciBzdG9yYWdlT3duZXIsXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyXG5cdFx0Ly8gU2luY2UgI3VzZXJEYXRhIHN0b3JhZ2UgYXBwbGllcyBvbmx5IHRvIHNwZWNpZmljIHBhdGhzLCB3ZSBuZWVkIHRvXG5cdFx0Ly8gc29tZWhvdyBsaW5rIG91ciBkYXRhIHRvIGEgc3BlY2lmaWMgcGF0aC4gIFdlIGNob29zZSAvZmF2aWNvbi5pY29cblx0XHQvLyBhcyBhIHByZXR0eSBzYWZlIG9wdGlvbiwgc2luY2UgYWxsIGJyb3dzZXJzIGFscmVhZHkgbWFrZSBhIHJlcXVlc3QgdG9cblx0XHQvLyB0aGlzIFVSTCBhbnl3YXkgYW5kIGJlaW5nIGEgNDA0IHdpbGwgbm90IGh1cnQgdXMgaGVyZS4gIFdlIHdyYXAgYW5cblx0XHQvLyBpZnJhbWUgcG9pbnRpbmcgdG8gdGhlIGZhdmljb24gaW4gYW4gQWN0aXZlWE9iamVjdChodG1sZmlsZSkgb2JqZWN0XG5cdFx0Ly8gKHNlZTogaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2FhNzUyNTc0KHY9VlMuODUpLmFzcHgpXG5cdFx0Ly8gc2luY2UgdGhlIGlmcmFtZSBhY2Nlc3MgcnVsZXMgYXBwZWFyIHRvIGFsbG93IGRpcmVjdCBhY2Nlc3MgYW5kXG5cdFx0Ly8gbWFuaXB1bGF0aW9uIG9mIHRoZSBkb2N1bWVudCBlbGVtZW50LCBldmVuIGZvciBhIDQwNCBwYWdlLiAgVGhpc1xuXHRcdC8vIGRvY3VtZW50IGNhbiBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQgKHdoaWNoIHdvdWxkXG5cdFx0Ly8gaGF2ZSBiZWVuIGxpbWl0ZWQgdG8gdGhlIGN1cnJlbnQgcGF0aCkgdG8gcGVyZm9ybSAjdXNlckRhdGEgc3RvcmFnZS5cblx0XHR0cnkge1xuXHRcdFx0c3RvcmFnZUNvbnRhaW5lciA9IG5ldyBBY3RpdmVYT2JqZWN0KCdodG1sZmlsZScpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLm9wZW4oKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci53cml0ZSgnPCcrc2NyaXB0VGFnKyc+ZG9jdW1lbnQudz13aW5kb3c8Lycrc2NyaXB0VGFnKyc+PGlmcmFtZSBzcmM9XCIvZmF2aWNvbi5pY29cIj48L2lmcmFtZT4nKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci5jbG9zZSgpXG5cdFx0XHRzdG9yYWdlT3duZXIgPSBzdG9yYWdlQ29udGFpbmVyLncuZnJhbWVzWzBdLmRvY3VtZW50XG5cdFx0XHRzdG9yYWdlID0gc3RvcmFnZU93bmVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHQvLyBzb21laG93IEFjdGl2ZVhPYmplY3QgaW5zdGFudGlhdGlvbiBmYWlsZWQgKHBlcmhhcHMgc29tZSBzcGVjaWFsXG5cdFx0XHQvLyBzZWN1cml0eSBzZXR0aW5ncyBvciBvdGhlcndzZSksIGZhbGwgYmFjayB0byBwZXItcGF0aCBzdG9yYWdlXG5cdFx0XHRzdG9yYWdlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHRzdG9yYWdlT3duZXIgPSBkb2MuYm9keVxuXHRcdH1cblx0XHR2YXIgd2l0aElFU3RvcmFnZSA9IGZ1bmN0aW9uKHN0b3JlRnVuY3Rpb24pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApXG5cdFx0XHRcdGFyZ3MudW5zaGlmdChzdG9yYWdlKVxuXHRcdFx0XHQvLyBTZWUgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxMDgxKHY9VlMuODUpLmFzcHhcblx0XHRcdFx0Ly8gYW5kIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTQyNCh2PVZTLjg1KS5hc3B4XG5cdFx0XHRcdHN0b3JhZ2VPd25lci5hcHBlbmRDaGlsZChzdG9yYWdlKVxuXHRcdFx0XHRzdG9yYWdlLmFkZEJlaGF2aW9yKCcjZGVmYXVsdCN1c2VyRGF0YScpXG5cdFx0XHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0XHR2YXIgcmVzdWx0ID0gc3RvcmVGdW5jdGlvbi5hcHBseShzdG9yZSwgYXJncylcblx0XHRcdFx0c3RvcmFnZU93bmVyLnJlbW92ZUNoaWxkKHN0b3JhZ2UpXG5cdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJbiBJRTcsIGtleXMgY2Fubm90IHN0YXJ0IHdpdGggYSBkaWdpdCBvciBjb250YWluIGNlcnRhaW4gY2hhcnMuXG5cdFx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzLzQwXG5cdFx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzLzgzXG5cdFx0dmFyIGZvcmJpZGRlbkNoYXJzUmVnZXggPSBuZXcgUmVnRXhwKFwiWyFcXFwiIyQlJicoKSorLC9cXFxcXFxcXDo7PD0+P0BbXFxcXF1eYHt8fX5dXCIsIFwiZ1wiKVxuXHRcdHZhciBpZUtleUZpeCA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0cmV0dXJuIGtleS5yZXBsYWNlKC9eZC8sICdfX18kJicpLnJlcGxhY2UoZm9yYmlkZGVuQ2hhcnNSZWdleCwgJ19fXycpXG5cdFx0fVxuXHRcdHN0b3JlLnNldCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5LCB2YWwpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdFx0c3RvcmFnZS5zZXRBdHRyaWJ1dGUoa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0cmV0dXJuIHZhbFxuXHRcdH0pXG5cdFx0c3RvcmUuZ2V0ID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXksIGRlZmF1bHRWYWwpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdHZhciB2YWwgPSBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEF0dHJpYnV0ZShrZXkpKVxuXHRcdFx0cmV0dXJuICh2YWwgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWwgOiB2YWwpXG5cdFx0fSlcblx0XHRzdG9yZS5yZW1vdmUgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0c3RvcmFnZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0fSlcblx0XHRzdG9yZS5jbGVhciA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBzdG9yYWdlLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzXG5cdFx0XHRzdG9yYWdlLmxvYWQobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdGZvciAodmFyIGk9YXR0cmlidXRlcy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG5cdFx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZXNbaV0ubmFtZSlcblx0XHRcdH1cblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdH0pXG5cdFx0c3RvcmUuZm9yRWFjaCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0Zm9yICh2YXIgaT0wLCBhdHRyOyBhdHRyPWF0dHJpYnV0ZXNbaV07ICsraSkge1xuXHRcdFx0XHRjYWxsYmFjayhhdHRyLm5hbWUsIHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGF0dHIubmFtZSkpKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHR0cnkge1xuXHRcdHZhciB0ZXN0S2V5ID0gJ19fc3RvcmVqc19fJ1xuXHRcdHN0b3JlLnNldCh0ZXN0S2V5LCB0ZXN0S2V5KVxuXHRcdGlmIChzdG9yZS5nZXQodGVzdEtleSkgIT0gdGVzdEtleSkgeyBzdG9yZS5kaXNhYmxlZCA9IHRydWUgfVxuXHRcdHN0b3JlLnJlbW92ZSh0ZXN0S2V5KVxuXHR9IGNhdGNoKGUpIHtcblx0XHRzdG9yZS5kaXNhYmxlZCA9IHRydWVcblx0fVxuXHRzdG9yZS5lbmFibGVkID0gIXN0b3JlLmRpc2FibGVkXG5cdFxuXHRyZXR1cm4gc3RvcmVcbn0oKSlcbiIsIi8qISBodHRwczovL210aHMuYmUvcHVueWNvZGUgdjEuNC4xIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGVzICovXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiZcblx0XHQhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0IW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChcblx0XHRmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC5zZWxmID09PSBmcmVlR2xvYmFsXG5cdCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBgcHVueWNvZGVgIG9iamVjdC5cblx0ICogQG5hbWUgcHVueWNvZGVcblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqL1xuXHR2YXIgcHVueWNvZGUsXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LCAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdHRNaW4gPSAxLFxuXHR0TWF4ID0gMjYsXG5cdHNrZXcgPSAzOCxcblx0ZGFtcCA9IDcwMCxcblx0aW5pdGlhbEJpYXMgPSA3Mixcblx0aW5pdGlhbE4gPSAxMjgsIC8vIDB4ODBcblx0ZGVsaW1pdGVyID0gJy0nLCAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdHJlZ2V4Tm9uQVNDSUkgPSAvW15cXHgyMC1cXHg3RV0vLCAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvW1xceDJFXFx1MzAwMlxcdUZGMEVcXHVGRjYxXS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBgQXJyYXkjbWFwYCB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnkgYXJyYXlcblx0ICogaXRlbS5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwKGFycmF5LCBmbikge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0cmVzdWx0W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3Mgb3IgZW1haWxcblx0ICogYWRkcmVzc2VzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcblx0ICogY2hhcmFjdGVyLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IHN0cmluZyBvZiBjaGFyYWN0ZXJzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFja1xuXHQgKiBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0dmFyIHBhcnRzID0gc3RyaW5nLnNwbGl0KCdAJyk7XG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBJbiBlbWFpbCBhZGRyZXNzZXMsIG9ubHkgdGhlIGRvbWFpbiBuYW1lIHNob3VsZCBiZSBwdW55Y29kZWQuIExlYXZlXG5cdFx0XHQvLyB0aGUgbG9jYWwgcGFydCAoaS5lLiBldmVyeXRoaW5nIHVwIHRvIGBAYCkgaW50YWN0LlxuXHRcdFx0cmVzdWx0ID0gcGFydHNbMF0gKyAnQCc7XG5cdFx0XHRzdHJpbmcgPSBwYXJ0c1sxXTtcblx0XHR9XG5cdFx0Ly8gQXZvaWQgYHNwbGl0KHJlZ2V4KWAgZm9yIElFOCBjb21wYXRpYmlsaXR5LiBTZWUgIzE3LlxuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4U2VwYXJhdG9ycywgJ1xceDJFJyk7XG5cdFx0dmFyIGxhYmVscyA9IHN0cmluZy5zcGxpdCgnLicpO1xuXHRcdHZhciBlbmNvZGVkID0gbWFwKGxhYmVscywgZm4pLmpvaW4oJy4nKTtcblx0XHRyZXR1cm4gcmVzdWx0ICsgZW5jb2RlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG51bWVyaWMgY29kZSBwb2ludHMgb2YgZWFjaCBVbmljb2RlXG5cdCAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcblx0ICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcblx0ICogVUNTLTIgZXhwb3NlcyBhcyBzZXBhcmF0ZSBjaGFyYWN0ZXJzKSBpbnRvIGEgc2luZ2xlIGNvZGUgcG9pbnQsXG5cdCAqIG1hdGNoaW5nIFVURi0xNi5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG5cdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBkZWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cblx0ICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGNvdW50ZXIgPSAwLFxuXHRcdCAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuXHRcdCAgICB2YWx1ZSxcblx0XHQgICAgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5kZWNvZGVgXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGVuY29kZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb2RlUG9pbnRzIFRoZSBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cblx0ICogQHNlZSBgZGlnaXRUb0Jhc2ljKClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50IChmb3IgdXNlIGluXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcblx0ICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNpY1RvRGlnaXQoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCAtIDQ4IDwgMTApIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSAyMjtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDY1IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA2NTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDk3IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA5Nztcblx0XHR9XG5cdFx0cmV0dXJuIGJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3Jcblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpcyBgZGlnaXRgLCB3aGljaCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2Vcblx0ICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG5cdCAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG5cdCAqIGlmIGBmbGFnYCBpcyBub24temVybyBhbmQgYGRpZ2l0YCBoYXMgbm8gdXBwZXJjYXNlIGZvcm0uXG5cdCAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cblx0ICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIChlLmcuIGEgZG9tYWluIG5hbWUgbGFiZWwpIHRvIGFcblx0ICogUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3Ncblx0ICogdG8gVW5pY29kZS4gT25seSB0aGUgUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBpbnB1dCB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLlxuXHQgKiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW5cblx0ICogY29udmVydGVkIHRvIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlZCBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIGNvbnZlcnQgdG8gVW5pY29kZS5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG5cdCAqIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvVW5pY29kZShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogUHVueWNvZGUuIE9ubHkgdGhlIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsXG5cdCAqIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpblxuXHQgKiBBU0NJSS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0byBjb252ZXJ0LCBhcyBhXG5cdCAqIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lIG9yXG5cdCAqIGVtYWlsIGFkZHJlc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0FTQ0lJKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuNC4xJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuXHRcdGlmIChtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cykge1xuXHRcdFx0Ly8gaW4gTm9kZS5qcywgaW8uanMsIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwdW55Y29kZSA9IHJlcXVpcmUoJ3B1bnljb2RlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5leHBvcnRzLnBhcnNlID0gdXJsUGFyc2U7XG5leHBvcnRzLnJlc29sdmUgPSB1cmxSZXNvbHZlO1xuZXhwb3J0cy5yZXNvbHZlT2JqZWN0ID0gdXJsUmVzb2x2ZU9iamVjdDtcbmV4cG9ydHMuZm9ybWF0ID0gdXJsRm9ybWF0O1xuXG5leHBvcnRzLlVybCA9IFVybDtcblxuZnVuY3Rpb24gVXJsKCkge1xuICB0aGlzLnByb3RvY29sID0gbnVsbDtcbiAgdGhpcy5zbGFzaGVzID0gbnVsbDtcbiAgdGhpcy5hdXRoID0gbnVsbDtcbiAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgdGhpcy5wb3J0ID0gbnVsbDtcbiAgdGhpcy5ob3N0bmFtZSA9IG51bGw7XG4gIHRoaXMuaGFzaCA9IG51bGw7XG4gIHRoaXMuc2VhcmNoID0gbnVsbDtcbiAgdGhpcy5xdWVyeSA9IG51bGw7XG4gIHRoaXMucGF0aG5hbWUgPSBudWxsO1xuICB0aGlzLnBhdGggPSBudWxsO1xuICB0aGlzLmhyZWYgPSBudWxsO1xufVxuXG4vLyBSZWZlcmVuY2U6IFJGQyAzOTg2LCBSRkMgMTgwOCwgUkZDIDIzOTZcblxuLy8gZGVmaW5lIHRoZXNlIGhlcmUgc28gYXQgbGVhc3QgdGhleSBvbmx5IGhhdmUgdG8gYmVcbi8vIGNvbXBpbGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vZHVsZSBsb2FkLlxudmFyIHByb3RvY29sUGF0dGVybiA9IC9eKFthLXowLTkuKy1dKzopL2ksXG4gICAgcG9ydFBhdHRlcm4gPSAvOlswLTldKiQvLFxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHNpbXBsZSBwYXRoIFVSTFxuICAgIHNpbXBsZVBhdGhQYXR0ZXJuID0gL14oXFwvXFwvPyg/IVxcLylbXlxcP1xcc10qKShcXD9bXlxcc10qKT8kLyxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIHJlc2VydmVkIGZvciBkZWxpbWl0aW5nIFVSTHMuXG4gICAgLy8gV2UgYWN0dWFsbHkganVzdCBhdXRvLWVzY2FwZSB0aGVzZS5cbiAgICBkZWxpbXMgPSBbJzwnLCAnPicsICdcIicsICdgJywgJyAnLCAnXFxyJywgJ1xcbicsICdcXHQnXSxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIG5vdCBhbGxvd2VkIGZvciB2YXJpb3VzIHJlYXNvbnMuXG4gICAgdW53aXNlID0gWyd7JywgJ30nLCAnfCcsICdcXFxcJywgJ14nLCAnYCddLmNvbmNhdChkZWxpbXMpLFxuXG4gICAgLy8gQWxsb3dlZCBieSBSRkNzLCBidXQgY2F1c2Ugb2YgWFNTIGF0dGFja3MuICBBbHdheXMgZXNjYXBlIHRoZXNlLlxuICAgIGF1dG9Fc2NhcGUgPSBbJ1xcJyddLmNvbmNhdCh1bndpc2UpLFxuICAgIC8vIENoYXJhY3RlcnMgdGhhdCBhcmUgbmV2ZXIgZXZlciBhbGxvd2VkIGluIGEgaG9zdG5hbWUuXG4gICAgLy8gTm90ZSB0aGF0IGFueSBpbnZhbGlkIGNoYXJzIGFyZSBhbHNvIGhhbmRsZWQsIGJ1dCB0aGVzZVxuICAgIC8vIGFyZSB0aGUgb25lcyB0aGF0IGFyZSAqZXhwZWN0ZWQqIHRvIGJlIHNlZW4sIHNvIHdlIGZhc3QtcGF0aFxuICAgIC8vIHRoZW0uXG4gICAgbm9uSG9zdENoYXJzID0gWyclJywgJy8nLCAnPycsICc7JywgJyMnXS5jb25jYXQoYXV0b0VzY2FwZSksXG4gICAgaG9zdEVuZGluZ0NoYXJzID0gWycvJywgJz8nLCAnIyddLFxuICAgIGhvc3RuYW1lTWF4TGVuID0gMjU1LFxuICAgIGhvc3RuYW1lUGFydFBhdHRlcm4gPSAvXlsrYS16MC05QS1aXy1dezAsNjN9JC8sXG4gICAgaG9zdG5hbWVQYXJ0U3RhcnQgPSAvXihbK2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgY2FuIGFsbG93IFwidW5zYWZlXCIgYW5kIFwidW53aXNlXCIgY2hhcnMuXG4gICAgdW5zYWZlUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBuZXZlciBoYXZlIGEgaG9zdG5hbWUuXG4gICAgaG9zdGxlc3NQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IGFsd2F5cyBjb250YWluIGEgLy8gYml0LlxuICAgIHNsYXNoZWRQcm90b2NvbCA9IHtcbiAgICAgICdodHRwJzogdHJ1ZSxcbiAgICAgICdodHRwcyc6IHRydWUsXG4gICAgICAnZnRwJzogdHJ1ZSxcbiAgICAgICdnb3BoZXInOiB0cnVlLFxuICAgICAgJ2ZpbGUnOiB0cnVlLFxuICAgICAgJ2h0dHA6JzogdHJ1ZSxcbiAgICAgICdodHRwczonOiB0cnVlLFxuICAgICAgJ2Z0cDonOiB0cnVlLFxuICAgICAgJ2dvcGhlcjonOiB0cnVlLFxuICAgICAgJ2ZpbGU6JzogdHJ1ZVxuICAgIH0sXG4gICAgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5mdW5jdGlvbiB1cmxQYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICh1cmwgJiYgdXRpbC5pc09iamVjdCh1cmwpICYmIHVybCBpbnN0YW5jZW9mIFVybCkgcmV0dXJuIHVybDtcblxuICB2YXIgdSA9IG5ldyBVcmw7XG4gIHUucGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCk7XG4gIHJldHVybiB1O1xufVxuXG5VcmwucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24odXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAoIXV0aWwuaXNTdHJpbmcodXJsKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQYXJhbWV0ZXIgJ3VybCcgbXVzdCBiZSBhIHN0cmluZywgbm90IFwiICsgdHlwZW9mIHVybCk7XG4gIH1cblxuICAvLyBDb3B5IGNocm9tZSwgSUUsIG9wZXJhIGJhY2tzbGFzaC1oYW5kbGluZyBiZWhhdmlvci5cbiAgLy8gQmFjayBzbGFzaGVzIGJlZm9yZSB0aGUgcXVlcnkgc3RyaW5nIGdldCBjb252ZXJ0ZWQgdG8gZm9yd2FyZCBzbGFzaGVzXG4gIC8vIFNlZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI1OTE2XG4gIHZhciBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKSxcbiAgICAgIHNwbGl0dGVyID1cbiAgICAgICAgICAocXVlcnlJbmRleCAhPT0gLTEgJiYgcXVlcnlJbmRleCA8IHVybC5pbmRleE9mKCcjJykpID8gJz8nIDogJyMnLFxuICAgICAgdVNwbGl0ID0gdXJsLnNwbGl0KHNwbGl0dGVyKSxcbiAgICAgIHNsYXNoUmVnZXggPSAvXFxcXC9nO1xuICB1U3BsaXRbMF0gPSB1U3BsaXRbMF0ucmVwbGFjZShzbGFzaFJlZ2V4LCAnLycpO1xuICB1cmwgPSB1U3BsaXQuam9pbihzcGxpdHRlcik7XG5cbiAgdmFyIHJlc3QgPSB1cmw7XG5cbiAgLy8gdHJpbSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgLy8gVGhpcyBpcyB0byBzdXBwb3J0IHBhcnNlIHN0dWZmIGxpa2UgXCIgIGh0dHA6Ly9mb28uY29tICBcXG5cIlxuICByZXN0ID0gcmVzdC50cmltKCk7XG5cbiAgaWYgKCFzbGFzaGVzRGVub3RlSG9zdCAmJiB1cmwuc3BsaXQoJyMnKS5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBUcnkgZmFzdCBwYXRoIHJlZ2V4cFxuICAgIHZhciBzaW1wbGVQYXRoID0gc2ltcGxlUGF0aFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgICBpZiAoc2ltcGxlUGF0aCkge1xuICAgICAgdGhpcy5wYXRoID0gcmVzdDtcbiAgICAgIHRoaXMuaHJlZiA9IHJlc3Q7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gc2ltcGxlUGF0aFsxXTtcbiAgICAgIGlmIChzaW1wbGVQYXRoWzJdKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gc2ltcGxlUGF0aFsyXTtcbiAgICAgICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5zZWFyY2guc3Vic3RyKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5zZWFyY2guc3Vic3RyKDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICAgICAgdGhpcy5xdWVyeSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3RvID0gcHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gIGlmIChwcm90bykge1xuICAgIHByb3RvID0gcHJvdG9bMF07XG4gICAgdmFyIGxvd2VyUHJvdG8gPSBwcm90by50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBsb3dlclByb3RvO1xuICAgIHJlc3QgPSByZXN0LnN1YnN0cihwcm90by5sZW5ndGgpO1xuICB9XG5cbiAgLy8gZmlndXJlIG91dCBpZiBpdCdzIGdvdCBhIGhvc3RcbiAgLy8gdXNlckBzZXJ2ZXIgaXMgKmFsd2F5cyogaW50ZXJwcmV0ZWQgYXMgYSBob3N0bmFtZSwgYW5kIHVybFxuICAvLyByZXNvbHV0aW9uIHdpbGwgdHJlYXQgLy9mb28vYmFyIGFzIGhvc3Q9Zm9vLHBhdGg9YmFyIGJlY2F1c2UgdGhhdCdzXG4gIC8vIGhvdyB0aGUgYnJvd3NlciByZXNvbHZlcyByZWxhdGl2ZSBVUkxzLlxuICBpZiAoc2xhc2hlc0Rlbm90ZUhvc3QgfHwgcHJvdG8gfHwgcmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpIHtcbiAgICB2YXIgc2xhc2hlcyA9IHJlc3Quc3Vic3RyKDAsIDIpID09PSAnLy8nO1xuICAgIGlmIChzbGFzaGVzICYmICEocHJvdG8gJiYgaG9zdGxlc3NQcm90b2NvbFtwcm90b10pKSB7XG4gICAgICByZXN0ID0gcmVzdC5zdWJzdHIoMik7XG4gICAgICB0aGlzLnNsYXNoZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaG9zdGxlc3NQcm90b2NvbFtwcm90b10gJiZcbiAgICAgIChzbGFzaGVzIHx8IChwcm90byAmJiAhc2xhc2hlZFByb3RvY29sW3Byb3RvXSkpKSB7XG5cbiAgICAvLyB0aGVyZSdzIGEgaG9zdG5hbWUuXG4gICAgLy8gdGhlIGZpcnN0IGluc3RhbmNlIG9mIC8sID8sIDssIG9yICMgZW5kcyB0aGUgaG9zdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIEAgaW4gdGhlIGhvc3RuYW1lLCB0aGVuIG5vbi1ob3N0IGNoYXJzICphcmUqIGFsbG93ZWRcbiAgICAvLyB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBAIHNpZ24sIHVubGVzcyBzb21lIGhvc3QtZW5kaW5nIGNoYXJhY3RlclxuICAgIC8vIGNvbWVzICpiZWZvcmUqIHRoZSBALXNpZ24uXG4gICAgLy8gVVJMcyBhcmUgb2Jub3hpb3VzLlxuICAgIC8vXG4gICAgLy8gZXg6XG4gICAgLy8gaHR0cDovL2FAYkBjLyA9PiB1c2VyOmFAYiBob3N0OmNcbiAgICAvLyBodHRwOi8vYUBiP0BjID0+IHVzZXI6YSBob3N0OmMgcGF0aDovP0BjXG5cbiAgICAvLyB2MC4xMiBUT0RPKGlzYWFjcyk6IFRoaXMgaXMgbm90IHF1aXRlIGhvdyBDaHJvbWUgZG9lcyB0aGluZ3MuXG4gICAgLy8gUmV2aWV3IG91ciB0ZXN0IGNhc2UgYWdhaW5zdCBicm93c2VycyBtb3JlIGNvbXByZWhlbnNpdmVseS5cblxuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFueSBob3N0RW5kaW5nQ2hhcnNcbiAgICB2YXIgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9zdEVuZGluZ0NoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKGhvc3RFbmRpbmdDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZWl0aGVyIHdlIGhhdmUgYW4gZXhwbGljaXQgcG9pbnQgd2hlcmUgdGhlXG4gICAgLy8gYXV0aCBwb3J0aW9uIGNhbm5vdCBnbyBwYXN0LCBvciB0aGUgbGFzdCBAIGNoYXIgaXMgdGhlIGRlY2lkZXIuXG4gICAgdmFyIGF1dGgsIGF0U2lnbjtcbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIGF0U2lnbiBjYW4gYmUgYW55d2hlcmUuXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0U2lnbiBtdXN0IGJlIGluIGF1dGggcG9ydGlvbi5cbiAgICAgIC8vIGh0dHA6Ly9hQGIvY0BkID0+IGhvc3Q6YiBhdXRoOmEgcGF0aDovY0BkXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJywgaG9zdEVuZCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHdlIGhhdmUgYSBwb3J0aW9uIHdoaWNoIGlzIGRlZmluaXRlbHkgdGhlIGF1dGguXG4gICAgLy8gUHVsbCB0aGF0IG9mZi5cbiAgICBpZiAoYXRTaWduICE9PSAtMSkge1xuICAgICAgYXV0aCA9IHJlc3Quc2xpY2UoMCwgYXRTaWduKTtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKGF0U2lnbiArIDEpO1xuICAgICAgdGhpcy5hdXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIH1cblxuICAgIC8vIHRoZSBob3N0IGlzIHRoZSByZW1haW5pbmcgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IG5vbi1ob3N0IGNoYXJcbiAgICBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub25Ib3N0Q2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2Yobm9uSG9zdENoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG4gICAgLy8gaWYgd2Ugc3RpbGwgaGF2ZSBub3QgaGl0IGl0LCB0aGVuIHRoZSBlbnRpcmUgdGhpbmcgaXMgYSBob3N0LlxuICAgIGlmIChob3N0RW5kID09PSAtMSlcbiAgICAgIGhvc3RFbmQgPSByZXN0Lmxlbmd0aDtcblxuICAgIHRoaXMuaG9zdCA9IHJlc3Quc2xpY2UoMCwgaG9zdEVuZCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoaG9zdEVuZCk7XG5cbiAgICAvLyBwdWxsIG91dCBwb3J0LlxuICAgIHRoaXMucGFyc2VIb3N0KCk7XG5cbiAgICAvLyB3ZSd2ZSBpbmRpY2F0ZWQgdGhhdCB0aGVyZSBpcyBhIGhvc3RuYW1lLFxuICAgIC8vIHNvIGV2ZW4gaWYgaXQncyBlbXB0eSwgaXQgaGFzIHRvIGJlIHByZXNlbnQuXG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG5cbiAgICAvLyBpZiBob3N0bmFtZSBiZWdpbnMgd2l0aCBbIGFuZCBlbmRzIHdpdGggXVxuICAgIC8vIGFzc3VtZSB0aGF0IGl0J3MgYW4gSVB2NiBhZGRyZXNzLlxuICAgIHZhciBpcHY2SG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lWzBdID09PSAnWycgJiZcbiAgICAgICAgdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDFdID09PSAnXSc7XG5cbiAgICAvLyB2YWxpZGF0ZSBhIGxpdHRsZS5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgdmFyIGhvc3RwYXJ0cyA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBob3N0cGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaG9zdHBhcnRzW2ldO1xuICAgICAgICBpZiAoIXBhcnQpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICB2YXIgbmV3cGFydCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gcGFydC5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoaikgPiAxMjcpIHtcbiAgICAgICAgICAgICAgLy8gd2UgcmVwbGFjZSBub24tQVNDSUkgY2hhciB3aXRoIGEgdGVtcG9yYXJ5IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byBtYWtlIHN1cmUgc2l6ZSBvZiBob3N0bmFtZSBpcyBub3RcbiAgICAgICAgICAgICAgLy8gYnJva2VuIGJ5IHJlcGxhY2luZyBub24tQVNDSUkgYnkgbm90aGluZ1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9ICd4JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gcGFydFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgdGVzdCBhZ2FpbiB3aXRoIEFTQ0lJIGNoYXIgb25seVxuICAgICAgICAgIGlmICghbmV3cGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFyIHZhbGlkUGFydHMgPSBob3N0cGFydHMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB2YXIgbm90SG9zdCA9IGhvc3RwYXJ0cy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICB2YXIgYml0ID0gcGFydC5tYXRjaChob3N0bmFtZVBhcnRTdGFydCk7XG4gICAgICAgICAgICBpZiAoYml0KSB7XG4gICAgICAgICAgICAgIHZhbGlkUGFydHMucHVzaChiaXRbMV0pO1xuICAgICAgICAgICAgICBub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RIb3N0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXN0ID0gJy8nICsgbm90SG9zdC5qb2luKCcuJykgKyByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ob3N0bmFtZSA9IHZhbGlkUGFydHMuam9pbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaG9zdG5hbWUubGVuZ3RoID4gaG9zdG5hbWVNYXhMZW4pIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaG9zdG5hbWVzIGFyZSBhbHdheXMgbG93ZXIgY2FzZS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIC8vIElETkEgU3VwcG9ydDogUmV0dXJucyBhIHB1bnljb2RlZCByZXByZXNlbnRhdGlvbiBvZiBcImRvbWFpblwiLlxuICAgICAgLy8gSXQgb25seSBjb252ZXJ0cyBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgdGhhdFxuICAgICAgLy8gaGF2ZSBub24tQVNDSUkgY2hhcmFjdGVycywgaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZlxuICAgICAgLy8geW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0IGFscmVhZHkgaXMgQVNDSUktb25seS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuaG9zdG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBwID0gdGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyc7XG4gICAgdmFyIGggPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuICAgIHRoaXMuaG9zdCA9IGggKyBwO1xuICAgIHRoaXMuaHJlZiArPSB0aGlzLmhvc3Q7XG5cbiAgICAvLyBzdHJpcCBbIGFuZCBdIGZyb20gdGhlIGhvc3RuYW1lXG4gICAgLy8gdGhlIGhvc3QgZmllbGQgc3RpbGwgcmV0YWlucyB0aGVtLCB0aG91Z2hcbiAgICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS5zdWJzdHIoMSwgdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChyZXN0WzBdICE9PSAnLycpIHtcbiAgICAgICAgcmVzdCA9ICcvJyArIHJlc3Q7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHJlc3QgaXMgc2V0IHRvIHRoZSBwb3N0LWhvc3Qgc3R1ZmYuXG4gIC8vIGNob3Agb2ZmIGFueSBkZWxpbSBjaGFycy5cbiAgaWYgKCF1bnNhZmVQcm90b2NvbFtsb3dlclByb3RvXSkge1xuXG4gICAgLy8gRmlyc3QsIG1ha2UgMTAwJSBzdXJlIHRoYXQgYW55IFwiYXV0b0VzY2FwZVwiIGNoYXJzIGdldFxuICAgIC8vIGVzY2FwZWQsIGV2ZW4gaWYgZW5jb2RlVVJJQ29tcG9uZW50IGRvZXNuJ3QgdGhpbmsgdGhleVxuICAgIC8vIG5lZWQgdG8gYmUuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdXRvRXNjYXBlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGFlID0gYXV0b0VzY2FwZVtpXTtcbiAgICAgIGlmIChyZXN0LmluZGV4T2YoYWUpID09PSAtMSlcbiAgICAgICAgY29udGludWU7XG4gICAgICB2YXIgZXNjID0gZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtcbiAgICAgIGlmIChlc2MgPT09IGFlKSB7XG4gICAgICAgIGVzYyA9IGVzY2FwZShhZSk7XG4gICAgICB9XG4gICAgICByZXN0ID0gcmVzdC5zcGxpdChhZSkuam9pbihlc2MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2hvcCBvZmYgZnJvbSB0aGUgdGFpbCBmaXJzdC5cbiAgdmFyIGhhc2ggPSByZXN0LmluZGV4T2YoJyMnKTtcbiAgaWYgKGhhc2ggIT09IC0xKSB7XG4gICAgLy8gZ290IGEgZnJhZ21lbnQgc3RyaW5nLlxuICAgIHRoaXMuaGFzaCA9IHJlc3Quc3Vic3RyKGhhc2gpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIGhhc2gpO1xuICB9XG4gIHZhciBxbSA9IHJlc3QuaW5kZXhPZignPycpO1xuICBpZiAocW0gIT09IC0xKSB7XG4gICAgdGhpcy5zZWFyY2ggPSByZXN0LnN1YnN0cihxbSk7XG4gICAgdGhpcy5xdWVyeSA9IHJlc3Quc3Vic3RyKHFtICsgMSk7XG4gICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgcW0pO1xuICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAvLyBubyBxdWVyeSBzdHJpbmcsIGJ1dCBwYXJzZVF1ZXJ5U3RyaW5nIHN0aWxsIHJlcXVlc3RlZFxuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgdGhpcy5xdWVyeSA9IHt9O1xuICB9XG4gIGlmIChyZXN0KSB0aGlzLnBhdGhuYW1lID0gcmVzdDtcbiAgaWYgKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSAmJlxuICAgICAgdGhpcy5ob3N0bmFtZSAmJiAhdGhpcy5wYXRobmFtZSkge1xuICAgIHRoaXMucGF0aG5hbWUgPSAnLyc7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gIGlmICh0aGlzLnBhdGhuYW1lIHx8IHRoaXMuc2VhcmNoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBhdGhuYW1lIHx8ICcnO1xuICAgIHZhciBzID0gdGhpcy5zZWFyY2ggfHwgJyc7XG4gICAgdGhpcy5wYXRoID0gcCArIHM7XG4gIH1cblxuICAvLyBmaW5hbGx5LCByZWNvbnN0cnVjdCB0aGUgaHJlZiBiYXNlZCBvbiB3aGF0IGhhcyBiZWVuIHZhbGlkYXRlZC5cbiAgdGhpcy5ocmVmID0gdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBmb3JtYXQgYSBwYXJzZWQgb2JqZWN0IGludG8gYSB1cmwgc3RyaW5nXG5mdW5jdGlvbiB1cmxGb3JtYXQob2JqKSB7XG4gIC8vIGVuc3VyZSBpdCdzIGFuIG9iamVjdCwgYW5kIG5vdCBhIHN0cmluZyB1cmwuXG4gIC8vIElmIGl0J3MgYW4gb2JqLCB0aGlzIGlzIGEgbm8tb3AuXG4gIC8vIHRoaXMgd2F5LCB5b3UgY2FuIGNhbGwgdXJsX2Zvcm1hdCgpIG9uIHN0cmluZ3NcbiAgLy8gdG8gY2xlYW4gdXAgcG90ZW50aWFsbHkgd29ua3kgdXJscy5cbiAgaWYgKHV0aWwuaXNTdHJpbmcob2JqKSkgb2JqID0gdXJsUGFyc2Uob2JqKTtcbiAgaWYgKCEob2JqIGluc3RhbmNlb2YgVXJsKSkgcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtcbiAgcmV0dXJuIG9iai5mb3JtYXQoKTtcbn1cblxuVXJsLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF1dGggPSB0aGlzLmF1dGggfHwgJyc7XG4gIGlmIChhdXRoKSB7XG4gICAgYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICBhdXRoID0gYXV0aC5yZXBsYWNlKC8lM0EvaSwgJzonKTtcbiAgICBhdXRoICs9ICdAJztcbiAgfVxuXG4gIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2wgfHwgJycsXG4gICAgICBwYXRobmFtZSA9IHRoaXMucGF0aG5hbWUgfHwgJycsXG4gICAgICBoYXNoID0gdGhpcy5oYXNoIHx8ICcnLFxuICAgICAgaG9zdCA9IGZhbHNlLFxuICAgICAgcXVlcnkgPSAnJztcblxuICBpZiAodGhpcy5ob3N0KSB7XG4gICAgaG9zdCA9IGF1dGggKyB0aGlzLmhvc3Q7XG4gIH0gZWxzZSBpZiAodGhpcy5ob3N0bmFtZSkge1xuICAgIGhvc3QgPSBhdXRoICsgKHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpID09PSAtMSA/XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgOlxuICAgICAgICAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nKTtcbiAgICBpZiAodGhpcy5wb3J0KSB7XG4gICAgICBob3N0ICs9ICc6JyArIHRoaXMucG9ydDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5xdWVyeSAmJlxuICAgICAgdXRpbC5pc09iamVjdCh0aGlzLnF1ZXJ5KSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5xdWVyeSkubGVuZ3RoKSB7XG4gICAgcXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodGhpcy5xdWVyeSk7XG4gIH1cblxuICB2YXIgc2VhcmNoID0gdGhpcy5zZWFyY2ggfHwgKHF1ZXJ5ICYmICgnPycgKyBxdWVyeSkpIHx8ICcnO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5zdWJzdHIoLTEpICE9PSAnOicpIHByb3RvY29sICs9ICc6JztcblxuICAvLyBvbmx5IHRoZSBzbGFzaGVkUHJvdG9jb2xzIGdldCB0aGUgLy8uICBOb3QgbWFpbHRvOiwgeG1wcDosIGV0Yy5cbiAgLy8gdW5sZXNzIHRoZXkgaGFkIHRoZW0gdG8gYmVnaW4gd2l0aC5cbiAgaWYgKHRoaXMuc2xhc2hlcyB8fFxuICAgICAgKCFwcm90b2NvbCB8fCBzbGFzaGVkUHJvdG9jb2xbcHJvdG9jb2xdKSAmJiBob3N0ICE9PSBmYWxzZSkge1xuICAgIGhvc3QgPSAnLy8nICsgKGhvc3QgfHwgJycpO1xuICAgIGlmIChwYXRobmFtZSAmJiBwYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJykgcGF0aG5hbWUgPSAnLycgKyBwYXRobmFtZTtcbiAgfSBlbHNlIGlmICghaG9zdCkge1xuICAgIGhvc3QgPSAnJztcbiAgfVxuXG4gIGlmIChoYXNoICYmIGhhc2guY2hhckF0KDApICE9PSAnIycpIGhhc2ggPSAnIycgKyBoYXNoO1xuICBpZiAoc2VhcmNoICYmIHNlYXJjaC5jaGFyQXQoMCkgIT09ICc/Jykgc2VhcmNoID0gJz8nICsgc2VhcmNoO1xuXG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvWz8jXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQobWF0Y2gpO1xuICB9KTtcbiAgc2VhcmNoID0gc2VhcmNoLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG5cbiAgcmV0dXJuIHByb3RvY29sICsgaG9zdCArIHBhdGhuYW1lICsgc2VhcmNoICsgaGFzaDtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmUoc291cmNlLCByZWxhdGl2ZSkge1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZShyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIHJldHVybiB0aGlzLnJlc29sdmVPYmplY3QodXJsUGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKSkuZm9ybWF0KCk7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlT2JqZWN0KHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgaWYgKCFzb3VyY2UpIHJldHVybiByZWxhdGl2ZTtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmVPYmplY3QocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmVPYmplY3QgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICBpZiAodXRpbC5pc1N0cmluZyhyZWxhdGl2ZSkpIHtcbiAgICB2YXIgcmVsID0gbmV3IFVybCgpO1xuICAgIHJlbC5wYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpO1xuICAgIHJlbGF0aXZlID0gcmVsO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBVcmwoKTtcbiAgdmFyIHRrZXlzID0gT2JqZWN0LmtleXModGhpcyk7XG4gIGZvciAodmFyIHRrID0gMDsgdGsgPCB0a2V5cy5sZW5ndGg7IHRrKyspIHtcbiAgICB2YXIgdGtleSA9IHRrZXlzW3RrXTtcbiAgICByZXN1bHRbdGtleV0gPSB0aGlzW3RrZXldO1xuICB9XG5cbiAgLy8gaGFzaCBpcyBhbHdheXMgb3ZlcnJpZGRlbiwgbm8gbWF0dGVyIHdoYXQuXG4gIC8vIGV2ZW4gaHJlZj1cIlwiIHdpbGwgcmVtb3ZlIGl0LlxuICByZXN1bHQuaGFzaCA9IHJlbGF0aXZlLmhhc2g7XG5cbiAgLy8gaWYgdGhlIHJlbGF0aXZlIHVybCBpcyBlbXB0eSwgdGhlbiB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkbyBoZXJlLlxuICBpZiAocmVsYXRpdmUuaHJlZiA9PT0gJycpIHtcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaHJlZnMgbGlrZSAvL2Zvby9iYXIgYWx3YXlzIGN1dCB0byB0aGUgcHJvdG9jb2wuXG4gIGlmIChyZWxhdGl2ZS5zbGFzaGVzICYmICFyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgIC8vIHRha2UgZXZlcnl0aGluZyBleGNlcHQgdGhlIHByb3RvY29sIGZyb20gcmVsYXRpdmVcbiAgICB2YXIgcmtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgZm9yICh2YXIgcmsgPSAwOyByayA8IHJrZXlzLmxlbmd0aDsgcmsrKykge1xuICAgICAgdmFyIHJrZXkgPSBya2V5c1tya107XG4gICAgICBpZiAocmtleSAhPT0gJ3Byb3RvY29sJylcbiAgICAgICAgcmVzdWx0W3JrZXldID0gcmVsYXRpdmVbcmtleV07XG4gICAgfVxuXG4gICAgLy91cmxQYXJzZSBhcHBlbmRzIHRyYWlsaW5nIC8gdG8gdXJscyBsaWtlIGh0dHA6Ly93d3cuZXhhbXBsZS5jb21cbiAgICBpZiAoc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF0gJiZcbiAgICAgICAgcmVzdWx0Lmhvc3RuYW1lICYmICFyZXN1bHQucGF0aG5hbWUpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gcmVzdWx0LnBhdGhuYW1lID0gJy8nO1xuICAgIH1cblxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAocmVsYXRpdmUucHJvdG9jb2wgJiYgcmVsYXRpdmUucHJvdG9jb2wgIT09IHJlc3VsdC5wcm90b2NvbCkge1xuICAgIC8vIGlmIGl0J3MgYSBrbm93biB1cmwgcHJvdG9jb2wsIHRoZW4gY2hhbmdpbmdcbiAgICAvLyB0aGUgcHJvdG9jb2wgZG9lcyB3ZWlyZCB0aGluZ3NcbiAgICAvLyBmaXJzdCwgaWYgaXQncyBub3QgZmlsZTosIHRoZW4gd2UgTVVTVCBoYXZlIGEgaG9zdCxcbiAgICAvLyBhbmQgaWYgdGhlcmUgd2FzIGEgcGF0aFxuICAgIC8vIHRvIGJlZ2luIHdpdGgsIHRoZW4gd2UgTVVTVCBoYXZlIGEgcGF0aC5cbiAgICAvLyBpZiBpdCBpcyBmaWxlOiwgdGhlbiB0aGUgaG9zdCBpcyBkcm9wcGVkLFxuICAgIC8vIGJlY2F1c2UgdGhhdCdzIGtub3duIHRvIGJlIGhvc3RsZXNzLlxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgYXNzdW1lZCB0byBiZSBhYnNvbHV0ZS5cbiAgICBpZiAoIXNsYXNoZWRQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gICAgICAgIHZhciBrID0ga2V5c1t2XTtcbiAgICAgICAgcmVzdWx0W2tdID0gcmVsYXRpdmVba107XG4gICAgICB9XG4gICAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb3RvY29sID0gcmVsYXRpdmUucHJvdG9jb2w7XG4gICAgaWYgKCFyZWxhdGl2ZS5ob3N0ICYmICFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIHJlbFBhdGggPSAocmVsYXRpdmUucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJyk7XG4gICAgICB3aGlsZSAocmVsUGF0aC5sZW5ndGggJiYgIShyZWxhdGl2ZS5ob3N0ID0gcmVsUGF0aC5zaGlmdCgpKSk7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3QpIHJlbGF0aXZlLmhvc3QgPSAnJztcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdG5hbWUpIHJlbGF0aXZlLmhvc3RuYW1lID0gJyc7XG4gICAgICBpZiAocmVsUGF0aFswXSAhPT0gJycpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICBpZiAocmVsUGF0aC5sZW5ndGggPCAyKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsUGF0aC5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbGF0aXZlLnBhdGhuYW1lO1xuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHJlc3VsdC5ob3N0ID0gcmVsYXRpdmUuaG9zdCB8fCAnJztcbiAgICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGg7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdDtcbiAgICByZXN1bHQucG9ydCA9IHJlbGF0aXZlLnBvcnQ7XG4gICAgLy8gdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnBhdGhuYW1lIHx8IHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHZhciBwID0gcmVzdWx0LnBhdGhuYW1lIHx8ICcnO1xuICAgICAgdmFyIHMgPSByZXN1bHQuc2VhcmNoIHx8ICcnO1xuICAgICAgcmVzdWx0LnBhdGggPSBwICsgcztcbiAgICB9XG4gICAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgaXNTb3VyY2VBYnMgPSAocmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyksXG4gICAgICBpc1JlbEFicyA9IChcbiAgICAgICAgICByZWxhdGl2ZS5ob3N0IHx8XG4gICAgICAgICAgcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLydcbiAgICAgICksXG4gICAgICBtdXN0RW5kQWJzID0gKGlzUmVsQWJzIHx8IGlzU291cmNlQWJzIHx8XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuaG9zdCAmJiByZWxhdGl2ZS5wYXRobmFtZSkpLFxuICAgICAgcmVtb3ZlQWxsRG90cyA9IG11c3RFbmRBYnMsXG4gICAgICBzcmNQYXRoID0gcmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcmVsUGF0aCA9IHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICBwc3ljaG90aWMgPSByZXN1bHQucHJvdG9jb2wgJiYgIXNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdO1xuXG4gIC8vIGlmIHRoZSB1cmwgaXMgYSBub24tc2xhc2hlZCB1cmwsIHRoZW4gcmVsYXRpdmVcbiAgLy8gbGlua3MgbGlrZSAuLi8uLiBzaG91bGQgYmUgYWJsZVxuICAvLyB0byBjcmF3bCB1cCB0byB0aGUgaG9zdG5hbWUsIGFzIHdlbGwuICBUaGlzIGlzIHN0cmFuZ2UuXG4gIC8vIHJlc3VsdC5wcm90b2NvbCBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBub3cuXG4gIC8vIExhdGVyIG9uLCBwdXQgdGhlIGZpcnN0IHBhdGggcGFydCBpbnRvIHRoZSBob3N0IGZpZWxkLlxuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gJyc7XG4gICAgcmVzdWx0LnBvcnQgPSBudWxsO1xuICAgIGlmIChyZXN1bHQuaG9zdCkge1xuICAgICAgaWYgKHNyY1BhdGhbMF0gPT09ICcnKSBzcmNQYXRoWzBdID0gcmVzdWx0Lmhvc3Q7XG4gICAgICBlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7XG4gICAgfVxuICAgIHJlc3VsdC5ob3N0ID0gJyc7XG4gICAgaWYgKHJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZS5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZS5wb3J0ID0gbnVsbDtcbiAgICAgIGlmIChyZWxhdGl2ZS5ob3N0KSB7XG4gICAgICAgIGlmIChyZWxQYXRoWzBdID09PSAnJykgcmVsUGF0aFswXSA9IHJlbGF0aXZlLmhvc3Q7XG4gICAgICAgIGVsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO1xuICAgICAgfVxuICAgICAgcmVsYXRpdmUuaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzICYmIChyZWxQYXRoWzBdID09PSAnJyB8fCBzcmNQYXRoWzBdID09PSAnJyk7XG4gIH1cblxuICBpZiAoaXNSZWxBYnMpIHtcbiAgICAvLyBpdCdzIGFic29sdXRlLlxuICAgIHJlc3VsdC5ob3N0ID0gKHJlbGF0aXZlLmhvc3QgfHwgcmVsYXRpdmUuaG9zdCA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3QgOiByZXN1bHQuaG9zdDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAocmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdG5hbWUgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgOiByZXN1bHQuaG9zdG5hbWU7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICBzcmNQYXRoID0gcmVsUGF0aDtcbiAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRvdC1oYW5kbGluZyBiZWxvdy5cbiAgfSBlbHNlIGlmIChyZWxQYXRoLmxlbmd0aCkge1xuICAgIC8vIGl0J3MgcmVsYXRpdmVcbiAgICAvLyB0aHJvdyBhd2F5IHRoZSBleGlzdGluZyBmaWxlLCBhbmQgdGFrZSB0aGUgbmV3IHBhdGggaW5zdGVhZC5cbiAgICBpZiAoIXNyY1BhdGgpIHNyY1BhdGggPSBbXTtcbiAgICBzcmNQYXRoLnBvcCgpO1xuICAgIHNyY1BhdGggPSBzcmNQYXRoLmNvbmNhdChyZWxQYXRoKTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKHJlbGF0aXZlLnNlYXJjaCkpIHtcbiAgICAvLyBqdXN0IHB1bGwgb3V0IHRoZSBzZWFyY2guXG4gICAgLy8gbGlrZSBocmVmPSc/Zm9vJy5cbiAgICAvLyBQdXQgdGhpcyBhZnRlciB0aGUgb3RoZXIgdHdvIGNhc2VzIGJlY2F1c2UgaXQgc2ltcGxpZmllcyB0aGUgYm9vbGVhbnNcbiAgICBpZiAocHN5Y2hvdGljKSB7XG4gICAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IHNyY1BhdGguc2hpZnQoKTtcbiAgICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIC8vIG5vIHBhdGggYXQgYWxsLiAgZWFzeS5cbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgdGhlIG90aGVyIHN0dWZmIGFib3ZlLlxuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQuc2VhcmNoKSB7XG4gICAgICByZXN1bHQucGF0aCA9ICcvJyArIHJlc3VsdC5zZWFyY2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGlmIGEgdXJsIEVORHMgaW4gLiBvciAuLiwgdGhlbiBpdCBtdXN0IGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICAvLyBob3dldmVyLCBpZiBpdCBlbmRzIGluIGFueXRoaW5nIGVsc2Ugbm9uLXNsYXNoeSxcbiAgLy8gdGhlbiBpdCBtdXN0IE5PVCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgdmFyIGxhc3QgPSBzcmNQYXRoLnNsaWNlKC0xKVswXTtcbiAgdmFyIGhhc1RyYWlsaW5nU2xhc2ggPSAoXG4gICAgICAocmVzdWx0Lmhvc3QgfHwgcmVsYXRpdmUuaG9zdCB8fCBzcmNQYXRoLmxlbmd0aCA+IDEpICYmXG4gICAgICAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHx8IGxhc3QgPT09ICcnKTtcblxuICAvLyBzdHJpcCBzaW5nbGUgZG90cywgcmVzb2x2ZSBkb3VibGUgZG90cyB0byBwYXJlbnQgZGlyXG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBzcmNQYXRoLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICBsYXN0ID0gc3JjUGF0aFtpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoIW11c3RFbmRBYnMgJiYgIXJlbW92ZUFsbERvdHMpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHNyY1BhdGgudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICBpZiAobXVzdEVuZEFicyAmJiBzcmNQYXRoWzBdICE9PSAnJyAmJlxuICAgICAgKCFzcmNQYXRoWzBdIHx8IHNyY1BhdGhbMF0uY2hhckF0KDApICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NsYXNoICYmIChzcmNQYXRoLmpvaW4oJy8nKS5zdWJzdHIoLTEpICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBpc0Fic29sdXRlID0gc3JjUGF0aFswXSA9PT0gJycgfHxcbiAgICAgIChzcmNQYXRoWzBdICYmIHNyY1BhdGhbMF0uY2hhckF0KDApID09PSAnLycpO1xuXG4gIC8vIHB1dCB0aGUgaG9zdCBiYWNrXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IGlzQWJzb2x1dGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNQYXRoLmxlbmd0aCA/IHNyY1BhdGguc2hpZnQoKSA6ICcnO1xuICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgfHwgKHJlc3VsdC5ob3N0ICYmIHNyY1BhdGgubGVuZ3RoKTtcblxuICBpZiAobXVzdEVuZEFicyAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gc3JjUGF0aC5qb2luKCcvJyk7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgcmVxdWVzdC5odHRwXG4gIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICB9XG4gIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aCB8fCByZXN1bHQuYXV0aDtcbiAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblVybC5wcm90b3R5cGUucGFyc2VIb3N0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBob3N0ID0gdGhpcy5ob3N0O1xuICB2YXIgcG9ydCA9IHBvcnRQYXR0ZXJuLmV4ZWMoaG9zdCk7XG4gIGlmIChwb3J0KSB7XG4gICAgcG9ydCA9IHBvcnRbMF07XG4gICAgaWYgKHBvcnQgIT09ICc6Jykge1xuICAgICAgdGhpcy5wb3J0ID0gcG9ydC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGhvc3QgPSBob3N0LnN1YnN0cigwLCBob3N0Lmxlbmd0aCAtIHBvcnQubGVuZ3RoKTtcbiAgfVxuICBpZiAoaG9zdCkgdGhpcy5ob3N0bmFtZSA9IGhvc3Q7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdHJpbmc6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ3N0cmluZyc7XG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09PSBudWxsO1xuICB9LFxuICBpc051bGxPclVuZGVmaW5lZDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PSBudWxsO1xuICB9XG59O1xuIl19
