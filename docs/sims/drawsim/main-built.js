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
    colorsdiv.style.visibility = "visible";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9naXQvd3hhcHBzL3NyYy9kcmF3c2ltL21haW4uanMiLCIuLi9naXQvd3hhcHBzL3NyYy91dGlscy9heGlzLmpzIiwiLi4vZ2l0L3d4YXBwcy9zcmMvdXRpbHMvZ3JhcGguanMiLCIuLi9naXQvd3hhcHBzL3NyYy91dGlscy9pbmRleC5qcyIsIi4uL2dpdC93eGFwcHMvc3JjL3V0aWxzL2pzb24yLmpzIiwiLi4vZ2l0L3d4YXBwcy9zcmMvdXRpbHMvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvcHVueWNvZGUvcHVueWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZW5jb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwibm9kZV9tb2R1bGVzL3VybC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSSxLQUFLLEdBQUcsc0JBQVo7QUFBQSxJQUF3QixZQUFZLEdBQUcsSUFBSSxlQUFKLENBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCLENBQXVCLFNBQXZCLENBQWlDLENBQWpDLENBQXBCLENBQXZDO0FBRUEsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsS0FBakIsQ0FBWjtBQUNBLElBQUksQ0FBQyxLQUFMLEVBQVksS0FBSyxHQUFHLE1BQU0sQ0FBQyxrQkFBRCxFQUFvQixFQUFwQixDQUFkO0FBQ1osSUFBSSxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBYixDQUFvQixLQUFwQixDQUFYO0FBQ0EsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQWIs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gXCIuLi91dGlsc1wiICAgXHJcbmltcG9ydCB7VXJsfSBmcm9tIFwidXJsXCIgXHJcbiBcclxubGV0IHN0b3JlID0gZ2V0U3RvcmUoKSwgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSlcclxuXHJcbmxldCBpbWFnZSA9IHNlYXJjaFBhcmFtcy5nZXQoJ2ltZycpXHJcbmlmICghaW1hZ2UpIGltYWdlID0gcHJvbXB0KFwiRW50ZXIgaW1hZ2UgdXJsOlwiLFwiXCIpXHJcbmxldCBiYWNrID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChpbWFnZSlcclxubGV0IGVkaXQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdtb2RlJykgPT0gXCJlZGl0XCJcclxubGV0IHNjYWxlID0gc2VhcmNoUGFyYW1zLmdldCgnc2NhbGUnKSB8fCAxLjBcclxubGV0IHRvb2wgPSBzZWFyY2hQYXJhbXMuZ2V0KCd0b29sJykgfHwgXCJwcmVzc3VyZVwiXHJcbmxldCB3aWR0aCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3cnKSB8fCAyMFxyXG5sZXQgaGVpZ2h0ID0gc2VhcmNoUGFyYW1zLmdldCgnaCcpIHx8IDIwXHJcbmxldCBvcHQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdvcHQnKSB8fCBcImFsbFwiXHJcbmxldCBjb2xvcnMgPSBzZWFyY2hQYXJhbXMuZ2V0KCdjb2xvcnMnKSB8fCBcImJsYWNrXCJcclxuXHJcbmxldCBsaW5ldHlwZXMgPSB7XHJcblx0ZHJ5Ont3OjEsYzpcIiMwMDBcIn0sXHJcblx0aGlnaFQ6e3c6MSxjOlwiI0YwMFwifSxcclxuXHRoaWdoVGQ6e3c6MSxjOlwiIzBGMFwifSxcclxuXHRqZXQ4NTA6e3c6NSxjOlwiI0YwMFwifSxcclxuXHRqZXQzMDA6e3c6NSxjOlwiIzgwMDA4MFwifVxyXG59XHJcblxyXG5sZXQgbGluZXR5cGUgPSBcImRyeVwiIFxyXG5sZXQgbGluZXR5cGVCdXR0b24gPSBudWxsXHJcblxyXG5jcmVhdGVqcy5Nb3Rpb25HdWlkZVBsdWdpbi5pbnN0YWxsKClcclxuXHJcbi8vTGluZXMgd2l0aCBzeW1ib2xzIGZvciBhIGRyeSBsaW5lLCBtb2lzdHVyZSBheGlzLCB0aGVybWFsIHJpZGdlLCBsb3cgbGV2ZWwgamV0IGFuZCB1cHBlciBsZXZlbCBqZXQgXHJcblxyXG5mdW5jdGlvbiBkaXN0KHAxLHAyKSB7IFxyXG5cdGxldCBkeCA9IHAxLnggLSBwMi54LCBkeSA9IHAxLnkgLSBwMi55XHJcblx0cmV0dXJuIE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG59XHJcblxyXG5mdW5jdGlvbiBhbmdsZShwMSwgcDIpIHtcclxuICAgIHJldHVybiBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMi54IC0gcDEueCkgKiAxODAgLyBNYXRoLlBJO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wb25lbnRUb0hleChjKSB7XHJcblx0ICB2YXIgaGV4ID0gYy50b1N0cmluZygxNik7XHJcblx0ICByZXR1cm4gaGV4Lmxlbmd0aCA9PSAxID8gXCIwXCIgKyBoZXggOiBoZXg7XHJcblx0fVxyXG5cclxuZnVuY3Rpb24gcmdiVG9IZXgociwgZywgYikge1xyXG4gIHJldHVybiBcIiNcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29sb3IoKSB7XHJcbiAgICB2YXIgcmFkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZSgnY29sb3InKTsgICAgICAgXHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmFkaW8ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZihyYWRpb1tpXS5jaGVja2VkKVxyXG4gICAgICAgIFx0cmV0dXJuIHJhZGlvW2ldLnZhbHVlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gXCJibGFja1wiXHJcbn1cclxuXHJcbnZhciBzYXZlcGFybXMgPSBbXTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZVwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG5cdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHRsZXQgW3N5bWJvbCwgY2JdID0gc2F2ZXBhcm1zXHJcblx0bGV0IGRlc2NfZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjX2VkaXRvclwiKVxyXG5cdHJlbW92ZVN5bWJvbChzeW1ib2wpXHJcblx0c3ltYm9sLmRlc2MgPSBkZXNjX2VkaXRvci52YWx1ZVxyXG5cdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0ZWRpdG9yLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblx0Y2IodHJ1ZSlcclxufSk7XHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcblx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdGxldCBbc3ltYm9sLCBjYl0gPSBzYXZlcGFybXNcclxuXHRyZW1vdmVTeW1ib2woc3ltYm9sKVxyXG5cdGVkaXRvci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG5cdGNiKGZhbHNlKVxyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBnZXREZXNjKHB0LCBzeW1ib2wsIGNiKSB7XHJcblx0bGV0IGVkaXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yXCIpXHJcblx0bGV0IGRlc2NfZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjX2VkaXRvclwiKVxyXG5cdGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5jYW52YXNcIilcclxuXHRkZXNjX2VkaXRvci52YWx1ZSA9IHN5bWJvbC5kZXNjXHJcblx0ZWRpdG9yLnN0eWxlLmxlZnQgPSAocHRbMF0gKyBjYW52YXMub2Zmc2V0TGVmdCkgKyBcInB4XCJcclxuXHRlZGl0b3Iuc3R5bGUudG9wID0gKHB0WzFdICsgY2FudmFzLm9mZnNldFRvcCkgKyBcInB4XCJcclxuXHRlZGl0b3Iuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXHJcblx0ZWRpdG9yLmZvY3VzKClcclxuXHRzYXZlcGFybXMgPSBbc3ltYm9sLCBjYl1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TWlkKHB0cykge1xyXG5cdGxldCBbc3RhcnQsIGVuZF0gPSBbcHRzWzBdLCBwdHNbcHRzLmxlbmd0aCAtIDFdXVxyXG5cdGxldCBbbWlkeCwgbWlkeV0gPSBbMCwgMF1cclxuXHRpZiAoc3RhcnQueCA8IGVuZC54KSBtaWR4ID0gc3RhcnQueCArIChlbmQueCAtIHN0YXJ0LngpIC8gMiAtIDIwO1xyXG5cdGVsc2UgbWlkeCA9IGVuZC54ICsgKHN0YXJ0LnggLSBlbmQueCkgLyAyIC0gMjA7IFxyXG5cdGlmIChzdGFydC55IDwgZW5kLnkpIG1pZHkgPSBzdGFydC55ICsgKGVuZC55IC0gc3RhcnQueSkgLyAyO1xyXG5cdGVsc2UgbWlkeSA9IGVuZC55ICsgKHN0YXJ0LnkgLSBlbmQueSkgLyAyO1xyXG5cdHJldHVybiBbbWlkeCwgbWlkeV07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExhYmVsKHBhdGgsIG1pZCwgc3ltYm9sLCBjYikge1xyXG5cdGxldCBkZXNjID0gbmV3IGNyZWF0ZWpzLlRleHQoc3ltYm9sLmRlc2MsXCIxNHB4IEFyaWFsXCIsXCIjMDAwXCIpXHJcblx0ZGVzYy54ID0gbWlkWzBdIFxyXG5cdGRlc2MueSA9IG1pZFsxXVxyXG4gICAgdmFyIHJlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKTtcclxuXHRyZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIndoaXRlXCIpO1xyXG4gICAgcmVjdC5ncmFwaGljcy5kcmF3UmVjdChkZXNjLngsIGRlc2MueSwgZGVzYy5nZXRNZWFzdXJlZFdpZHRoKCksIGRlc2MuZ2V0TWVhc3VyZWRIZWlnaHQoKSk7XHJcbiAgICByZWN0LmdyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgIHJlY3QuY3Vyc29yID0gXCJ0ZXh0XCJcclxuICAgIHBhdGguYWRkQ2hpbGQocmVjdCk7XHJcblx0cGF0aC5hZGRDaGlsZChkZXNjKTtcclxuXHRyZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHRcdGdldERlc2MobWlkLCBzeW1ib2wsIGNiKVxyXG5cdH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFN5bWJvbHMoKSB7XHJcblx0bGV0IHN5bWJvbHMgPSBzdG9yZS5nZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wpXHJcblx0aWYgKCFzeW1ib2xzKSB7XHJcblx0XHRzeW1ib2xzID0ge2NudDogMSwgZGF0YToge319XHJcblx0XHRzdG9yZS5zZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wsIHN5bWJvbHMpXHJcblx0fVxyXG5cdHJldHVybiBzeW1ib2xzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFN5bWJvbChzeW1ib2wpIHtcclxuXHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdHN5bWJvbC5pZCA9IHN5bWJvbHMuY250Kys7XHJcblx0c3ltYm9scy5kYXRhW3N5bWJvbC5pZF0gPSBzeW1ib2xcclxuXHRzdG9yZS5zZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wsIHN5bWJvbHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVN5bWJvbChzeW1ib2wpIHtcclxuXHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdHN5bWJvbHMuZGF0YVtzeW1ib2wuaWRdID0gc3ltYm9sXHJcblx0c3RvcmUuc2V0KGltYWdlICsgXCIuXCIgKyB0b29sLCBzeW1ib2xzKVx0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZVN5bWJvbChzeW1ib2wpIHtcclxuXHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdGlmIChzeW1ib2wuaWQpIGRlbGV0ZSBzeW1ib2xzLmRhdGFbc3ltYm9sLmlkXVxyXG5cdHN0b3JlLnNldChpbWFnZSArIFwiLlwiICsgdG9vbCwgc3ltYm9scylcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3ltYm9scygpIHtcclxuXHRzeW1ib2xzID0ge2NudDogMSwgZGF0YToge319XHJcblx0c3RvcmUuc2V0KGltYWdlICsgXCIuXCIgKyB0b29sLHN5bWJvbHMpXHJcbn1cclxuXHJcbmNsYXNzIFZlY3RvciBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IG1hcCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoanNvbi5pbWcpXHJcblx0XHRtYXAueCA9IGpzb24ucHQueFxyXG5cdFx0bWFwLnkgPSBqc29uLnB0LnlcclxuXHRcdG1hcC5yZWdYID0gMTJcclxuXHRcdG1hcC5yZWdZID0gMTJcclxuICAgIFx0bWFwLnJvdGF0aW9uID0ganNvbi5yb3RcclxuICAgIFx0bWFwLmN1cnNvciA9IFwidXJsKGFzc2V0cy9yZW1vdmUucG5nKSA4IDgsIGF1dG9cIlxyXG5cdFx0bWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdG1hcC5zdGFnZS5yZW1vdmVDaGlsZChtYXApXHJcblx0XHR9KVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQobWFwKVxyXG5cdH1cclxuXHRcdFxyXG5cdGNvbnN0cnVjdG9yKHgscm90LGltZyxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSAwXHJcblx0XHR0aGlzLmltZyA9IGltZ1xyXG5cdFx0dGhpcy5yb3QgPSByb3RcclxuXHRcdGxldCBzZWxlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0c2VsZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIiNDQ0NcIikuZHJhd1JvdW5kUmVjdCgwLDAsMjYsMjYsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdHRoaXMuYWRkQ2hpbGQoc2VsZWN0KVxyXG5cdFx0bGV0IG1hcCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoaW1nKVxyXG5cdFx0bWFwLnggPSAxM1xyXG5cdFx0bWFwLnkgPSAxM1xyXG5cdFx0bWFwLnJlZ1ggPSAxMlxyXG5cdFx0bWFwLnJlZ1kgPSAxMlxyXG4gICAgXHRtYXAucm90YXRpb24gPSByb3RcclxuICAgIFx0dGhpcy5zZXRCb3VuZHMoeCwwLDI2LDI2KVxyXG4gICAgXHR0aGlzLmFkZENoaWxkKG1hcClcclxuXHRcdHNlbGVjdC5hbHBoYSA9IDBcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBlID0+IHNlbGVjdC5hbHBoYSA9IDAuNSlcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGUgPT4gc2VsZWN0LmFscGhhID0gMClcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gZHJhd3NpbS50b29sYmFyLnNlbGVjdCh0aGlzKSlcclxuXHR9XHJcblx0XHJcblx0dG9KU09OKHgseSkge1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwidmVjdG9yXCIsIGltZzogdGhpcy5pbWcsIHJvdDogdGhpcy5yb3QsIHB0Ont4OngseTp5fX1cclxuXHR9XHRcdFxyXG59XHJcblxyXG5jbGFzcyBQcmVzc3VyZVJlZ2lvbiBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IHJlZ2lvbiA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0bGV0IHR4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KGpzb24uaGlnaD9cIkhcIjpcIkxcIixcImJvbGQgMjRweCBBcmlhbFwiLGpzb24uaGlnaD9cIiMwMEZcIjpcIiNGMDBcIilcclxuXHRcdHR4dC54ID0ganNvbi5wdC54IC0gMTJcclxuXHRcdHR4dC55ID0ganNvbi5wdC55IC0gMTJcclxuXHRcdGxldCBjaXJjbGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Y2lyY2xlLmdyYXBoaWNzLmJlZ2luRmlsbChqc29uLmhpZ2g/XCIjMEYwXCI6XCIjRkYwXCIpLmRyYXdDaXJjbGUoanNvbi5wdC54LGpzb24ucHQueSwyNCkuZW5kRmlsbCgpXHJcblx0XHRjaXJjbGUuYWxwaGEgPSAwLjVcclxuXHRcdHJlZ2lvbi5hZGRDaGlsZChjaXJjbGUpXHJcblx0XHRyZWdpb24uYWRkQ2hpbGQodHh0KVxyXG5cdFx0cmVnaW9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdHJlZ2lvbi5zdGFnZS5yZW1vdmVDaGlsZChyZWdpb24pXHJcblx0XHR9KVxyXG4gICAgXHRyZWdpb24uY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRzdGFnZS5hZGRDaGlsZChyZWdpb24pXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKHgsaGlnaCxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLmhpZ2ggPSBoaWdoXHJcblx0XHRsZXQgdHh0ID0gbmV3IGNyZWF0ZWpzLlRleHQoaGlnaD9cIkhcIjpcIkxcIixcImJvbGQgMjRweCBBcmlhbFwiLGhpZ2g/XCIjMDBGXCI6XCIjRjAwXCIpXHJcblx0XHR0eHQueCA9IHggKyAyXHJcblx0XHR0eHQueSA9IDJcclxuXHRcdGxldCBzZWxlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0c2VsZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIiNDQ0NcIikuZHJhd1JvdW5kUmVjdCh4LDAsMjYsMjYsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdHRoaXMuYWRkQ2hpbGQoc2VsZWN0KVxyXG5cdFx0bGV0IGNpcmNsZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRjaXJjbGUuZ3JhcGhpY3MuYmVnaW5GaWxsKGhpZ2g/XCIjMEYwXCI6XCIjRkYwXCIpLmRyYXdDaXJjbGUoeCsxMiwxMiwxMykuZW5kRmlsbCgpXHJcblx0XHRjaXJjbGUuYWxwaGEgPSAwLjNcclxuXHRcdHRoaXMuYWRkQ2hpbGQoY2lyY2xlLHR4dClcclxuICAgIFx0dGhpcy5zZXRCb3VuZHMoeCwwLDI2LDI2KVxyXG5cdFx0c2VsZWN0LmFscGhhID0gMFxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGUgPT4gc2VsZWN0LmFscGhhID0gMC41KVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZSA9PiBzZWxlY3QuYWxwaGEgPSAwKVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBkcmF3c2ltLnRvb2xiYXIuc2VsZWN0KHRoaXMpKVxyXG5cdH1cclxuXHJcblx0dG9KU09OKHgseSkge1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwicmVnaW9uXCIsIGhpZ2g6IHRoaXMuaGlnaCwgcHQ6e3g6eCx5Onl9fVxyXG5cdH1cdFx0XHJcblxyXG5cdGdldExlbmd0aCgpIHsgcmV0dXJuIDIqMzArMiB9XHJcbn1cclxuXHJcbmNsYXNzIFByZXNzdXJlcyBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0Y29uc3RydWN0b3IoeCxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSAyXHJcblx0XHRpZiAob3B0ID09IFwiYWxsXCIgfHwgb3B0ID09IFwiYXJyb3dzXCIpXHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcblx0XHRcdFx0bGV0IHYgPSBuZXcgVmVjdG9yKHgsNDUqaSxcImFzc2V0cy9sZWZ0LWFycm93LnBuZ1wiLGRyYXdzaW0pXHJcblx0XHRcdFx0dGhpcy5hZGRDaGlsZCh2KVxyXG5cdFx0XHRcdHggKz0gMzBcclxuXHRcdFx0fVxyXG5cdFx0aWYgKG9wdCA9PSBcImFsbFwiIHx8IG9wdCA9PSBcImhsXCIpIHtcclxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgUHJlc3N1cmVSZWdpb24oeCx0cnVlLGRyYXdzaW0pKVxyXG5cdFx0XHR4ICs9IDMwXHJcblx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IFByZXNzdXJlUmVnaW9uKHgsZmFsc2UsZHJhd3NpbSkpXHJcblx0XHRcdHggKz0gMzBcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Z2V0TGVuZ3RoKCkge1xyXG5cdFx0bGV0IG4gPSBvcHQgPT0gXCJhbGxcIj8xMDpvcHQgPT0gXCJhcnJvd3NcIj84OjJcclxuXHRcdHJldHVybiBuKjMwKzIgXHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBBaXJtYXNzIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSxqc29uKSB7XHJcblx0XHRsZXQgYWlybWFzcyA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0YWlybWFzcy54ID0ganNvbi5wdC54XHJcblx0XHRhaXJtYXNzLnkgPSBqc29uLnB0LnlcclxuXHRcdGxldCBjaXJjbGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Y2lyY2xlLmdyYXBoaWNzLmJlZ2luRmlsbChcIiNGRkZcIikuYmVnaW5TdHJva2UoXCIjMDAwXCIpLmRyYXdDaXJjbGUoMTQsMTQsMTQpLmVuZFN0cm9rZSgpXHJcblx0XHRhaXJtYXNzLmFkZENoaWxkKGNpcmNsZSlcclxuXHRcdGxldCB0eHQgPSBuZXcgY3JlYXRlanMuVGV4dChqc29uLm5hbWUsXCIxMnB4IEFyaWFsXCIsXCIjMDAwXCIpXHJcblx0XHR0eHQueCA9IDZcclxuXHRcdHR4dC55ID0gMTBcclxuXHRcdGFpcm1hc3MuYWRkQ2hpbGQodHh0KVxyXG4gICAgXHRhaXJtYXNzLmN1cnNvciA9IFwidXJsKGFzc2V0cy9yZW1vdmUucG5nKSA4IDgsIGF1dG9cIlxyXG5cdFx0XHRhaXJtYXNzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdGFpcm1hc3Muc3RhZ2UucmVtb3ZlQ2hpbGQoYWlybWFzcylcclxuXHRcdH0pXHJcbiAgICBcdHN0YWdlLmFkZENoaWxkKGFpcm1hc3MpXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKHgsbmFtZSxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSAyXHJcblx0XHR0aGlzLm5hbWUgPSBuYW1lXHJcblx0XHRsZXQgY2lyY2xlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGNpcmNsZS5ncmFwaGljcy5iZWdpbkZpbGwoXCIjRkZGXCIpLmJlZ2luU3Ryb2tlKFwiIzAwMFwiKS5kcmF3Q2lyY2xlKDE0LDE0LDE0KS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5hZGRDaGlsZChjaXJjbGUpXHJcblx0XHRsZXQgdHh0ID0gbmV3IGNyZWF0ZWpzLlRleHQobmFtZSxcIjEycHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRcdHR4dC54ID0gNlxyXG5cdFx0dHh0LnkgPSAxMFxyXG5cdFx0dGhpcy5hZGRDaGlsZCh0eHQpXHJcblx0XHRsZXQgc2VsZWN0ID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdHNlbGVjdC5ncmFwaGljcy5iZWdpbkZpbGwoXCIjQ0NDXCIpLmRyYXdDaXJjbGUoMTQsMTQsMTQpLmVuZFN0cm9rZSgpXHJcblx0XHR0aGlzLmFkZENoaWxkKHNlbGVjdClcclxuXHRcdHNlbGVjdC5hbHBoYSA9IDBcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBlID0+IHtcclxuXHRcdFx0c2VsZWN0LmFscGhhID0gMC41XHJcblx0XHR9KVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZSA9PiB7XHJcblx0XHRcdHNlbGVjdC5hbHBoYSA9IDBcclxuXHRcdH0pXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0ZHJhd3NpbS50b29sYmFyLnNlbGVjdCh0aGlzKVxyXG5cdFx0fSlcclxuXHR9XHJcblx0XHJcblx0dG9KU09OKHgseSkge1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwiYWlybWFzc1wiLCBuYW1lOiB0aGlzLm5hbWUsIHB0Ont4OngseTp5fX1cclxuXHR9XHRcdFxyXG59XHJcblxyXG5jbGFzcyBBaXJtYXNzZXMgZXh0ZW5kcyBjcmVhdGVqcy5Db250YWluZXIge1xyXG5cdGNvbnN0cnVjdG9yKHgsdG9vbGJhcikge1xyXG5cdFx0c3VwZXIoKVxyXG5cdFx0bGV0IG1hc3NlcyA9IFtcImNQXCIsXCJtUFwiLFwiY1RcIixcIm1UXCIsXCJjRVwiLFwibUVcIixcImNBXCIsXCJtQVwiXVxyXG5cdFx0bWFzc2VzLmZvckVhY2gobmFtZSA9PiB7XHJcblx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEFpcm1hc3MoeCxuYW1lLHRvb2xiYXIpKVxyXG5cdFx0XHR4ICs9IDMwXHJcblx0XHR9KVxyXG5cdH1cclxuXHRcclxuXHRnZXRMZW5ndGgoKSB7IHJldHVybiA4KjMwKzIgfVxyXG59XHJcblxyXG5jbGFzcyBJc29QbGV0aCB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IHB0cyA9IGpzb24ucHRzXHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHQgICAgc2hhcGUuZ3JhcGhpY3MuYmVnaW5TdHJva2UoXCIjMDBGXCIpXHJcblx0XHRsZXQgb2xkWCA9IHB0c1swXS54XHJcblx0XHRsZXQgb2xkWSA9IHB0c1swXS55XHJcblx0XHRsZXQgb2xkTWlkWCA9IG9sZFhcclxuXHRcdGxldCBvbGRNaWRZID0gb2xkWVxyXG5cdCAgICBqc29uLnB0cy5mb3JFYWNoKHB0ID0+IHtcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KG9sZFggKyBwdC54ID4+IDEsIG9sZFkrcHQueSA+PiAxKVxyXG5cdCAgICAgICAgc2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoNCkubW92ZVRvKG1pZFBvaW50LngsIG1pZFBvaW50LnkpXHJcblx0ICAgICAgICBzaGFwZS5ncmFwaGljcy5jdXJ2ZVRvKG9sZFgsIG9sZFksIG9sZE1pZFgsIG9sZE1pZFkpXHJcblx0ICAgICAgICBvbGRYID0gcHQueFxyXG5cdCAgICAgICAgb2xkWSA9IHB0LnlcclxuXHQgICAgICAgIG9sZE1pZFggPSBtaWRQb2ludC54XHJcblx0ICAgICAgICBvbGRNaWRZID0gbWlkUG9pbnQueVxyXG5cdCAgICB9KVxyXG5cdFx0cGF0aC5hZGRDaGlsZChzaGFwZSlcclxuXHRcdGxldCBmaXJzdCA9IHB0c1swXSwgbGFzdCA9IHB0c1twdHMubGVuZ3RoLTFdXHJcblx0XHRsZXQgbGFiZWwgPSBJc29QbGV0aC5nZXRMYWJlbChqc29uLnZhbHVlLGZpcnN0LnggLSAxMCxmaXJzdC55ICsgKGZpcnN0LnkgPCBsYXN0Lnk/IC0yNDogMCkpXHJcbiAgICBcdGxhYmVsLmN1cnNvciA9IFwidXJsKGFzc2V0cy9yZW1vdmUucG5nKSA4IDgsIGF1dG9cIlxyXG5cdFx0bGFiZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0c3RhZ2UucmVtb3ZlQ2hpbGQocGF0aClcclxuXHRcdH0pXHJcblx0XHRwYXRoLmFkZENoaWxkKGxhYmVsKVxyXG5cdFx0aWYgKGRpc3QoZmlyc3QsbGFzdCkgPiAxMCkge1xyXG5cdFx0XHRsZXQgbGFiZWwgPSBJc29QbGV0aC5nZXRMYWJlbChqc29uLnZhbHVlLGxhc3QueCAtIDEwLGxhc3QueSArIChmaXJzdC55IDwgbGFzdC55PyAwIDogLTI0KSlcclxuXHRcdFx0bGFiZWwuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRcdGxhYmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChwYXRoKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHRwYXRoLmFkZENoaWxkKGxhYmVsKVxyXG5cdFx0fVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQocGF0aClcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGdldExhYmVsKG5hbWUseCx5KSB7XHJcblx0XHRsZXQgbGFiZWwgPSBuZXcgY3JlYXRlanMuQ29udGFpbmVyKClcclxuXHRcdGxldCB0eHQgPSBuZXcgY3JlYXRlanMuVGV4dChuYW1lLFwiYm9sZCAyNHB4IEFyaWFsXCIsXCIjMDBGXCIpXHJcblx0XHR0eHQueCA9IHhcclxuXHRcdHR4dC55ID0geVxyXG5cdFx0bGV0IGNpcmNsZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRjaXJjbGUuZ3JhcGhpY3MuYmVnaW5GaWxsKFwiI0ZGRlwiKS5kcmF3Q2lyY2xlKHggKyAxMix5ICsgMTIsMjApLmVuZEZpbGwoKVxyXG5cdFx0bGFiZWwuYWRkQ2hpbGQoY2lyY2xlKVxyXG5cdFx0bGFiZWwuYWRkQ2hpbGQodHh0KVxyXG5cdFx0cmV0dXJuIGxhYmVsXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSAxMFxyXG5cdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vkb3duXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRTaGFwZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHQgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3MuYmVnaW5TdHJva2UoXCIjMDBGXCIpXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0ICAgIHRoaXMub2xkWCA9IHRoaXMub2xkTWlkWCA9IGUuc3RhZ2VYXHJcblx0XHQgICAgdGhpcy5vbGRZID0gdGhpcy5vbGRNaWRZID0gZS5zdGFnZVlcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSB0cnVlXHJcblx0XHRcdHRoaXMucHRzID0gW11cclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZW1vdmVcIiwgZSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLm1vdXNlRG93biA9PSBmYWxzZSkgcmV0dXJuXHJcblx0ICAgICAgICB0aGlzLnB0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KGUuc3RhZ2VYLCBlLnN0YWdlWSlcclxuXHRcdFx0dGhpcy5wdHMgPSB0aGlzLnB0cy5jb25jYXQoe3g6ZS5zdGFnZVgseTplLnN0YWdlWX0pXHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludCh0aGlzLm9sZFggKyB0aGlzLnB0LnggPj4gMSwgdGhpcy5vbGRZK3RoaXMucHQueSA+PiAxKVxyXG5cdCAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoNCkubW92ZVRvKG1pZFBvaW50LngsIG1pZFBvaW50LnkpXHJcblx0ICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5ncmFwaGljcy5jdXJ2ZVRvKHRoaXMub2xkWCwgdGhpcy5vbGRZLCB0aGlzLm9sZE1pZFgsIHRoaXMub2xkTWlkWSlcclxuXHQgICAgICAgIHRoaXMub2xkWCA9IHRoaXMucHQueFxyXG5cdCAgICAgICAgdGhpcy5vbGRZID0gdGhpcy5wdC55XHJcblx0ICAgICAgICB0aGlzLm9sZE1pZFggPSBtaWRQb2ludC54XHJcblx0ICAgICAgICB0aGlzLm9sZE1pZFkgPSBtaWRQb2ludC55XHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2V1cFwiLCBlID0+IHtcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTaGFwZSlcclxuXHRcdFx0aWYgKHRoaXMucHRzLmxlbmd0aCA8IDMpIHJldHVyblxyXG5cdFx0XHRsZXQgdmFsdWUgPSBwcm9tcHQoXCJFbnRlciB2YWx1ZTpcIiwxKVxyXG5cdFx0XHRpZiAodmFsdWUpIHtcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0ge3R5cGU6XCJpc29wbGV0aFwiLHZhbHVlOiB2YWx1ZSwgcHRzOiB0aGlzLnB0c31cclxuXHRcdFx0XHRJc29QbGV0aC5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLHN5bWJvbClcclxuXHRcdFx0XHRhZGRTeW1ib2woc3ltYm9sKVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgTGluZSB7XHJcblx0c3RhdGljIGdldExpbmVTaGFwZShsdCkge1xyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHQgICAgc2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUobHQudykuYmVnaW5TdHJva2UobHQuYylcclxuXHQgICAgcmV0dXJuIHNoYXBlXHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBzZXRCdXR0b24oYnV0dG9uLGNvbG9yKSB7XHJcblx0XHRsZXQgYiA9IGJ1dHRvbi5nZXRDaGlsZEF0KDApXHJcblx0XHRsZXQgYm9yZGVyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGJvcmRlci54ID0gYi54XHJcblx0XHRib3JkZXIuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoMSkuYmVnaW5GaWxsKGNvbG9yKS5iZWdpblN0cm9rZShcIiNBQUFcIikuZHJhd1JvdW5kUmVjdCgwLDIsNjIsMTgsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdGJ1dHRvbi5yZW1vdmVDaGlsZEF0KDApXHJcblx0XHRidXR0b24uYWRkQ2hpbGRBdChib3JkZXIsMClcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGdldEJ1dHRvbih4LG5hbWUpIHtcclxuXHRcdGxldCBsdCA9IGxpbmV0eXBlc1tuYW1lXVxyXG5cdFx0bGV0IGJ1dHRvbiA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0YnV0dG9uLmN1cnNvciA9IFwicG9pbnRlclwiXHJcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsZSA9PiB7XHJcblx0XHRcdGlmIChuYW1lID09IGxpbmV0eXBlKSByZXR1cm5cclxuXHRcdFx0aWYgKGxpbmV0eXBlQnV0dG9uKSBMaW5lLnNldEJ1dHRvbihsaW5ldHlwZUJ1dHRvbixcIiNGRkZcIilcclxuXHRcdFx0TGluZS5zZXRCdXR0b24oYnV0dG9uLFwiI0VFRVwiKVxyXG5cdFx0XHRsaW5ldHlwZSA9IG5hbWVcclxuXHRcdFx0bGluZXR5cGVCdXR0b24gPSBidXR0b25cdFx0XHRcclxuXHRcdH0pXHJcblx0XHRsZXQgYm9yZGVyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGJvcmRlci5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgxKS5iZWdpbkZpbGwobmFtZSA9PSBsaW5ldHlwZT9cIiNFRUVcIjpcIiNGRkZcIikuYmVnaW5TdHJva2UoXCIjQUFBXCIpLmRyYXdSb3VuZFJlY3QoMCwyLDYyLDE4LDIsMiwyLDIpLmVuZFN0cm9rZSgpXHJcblx0XHRpZiAobmFtZSA9PSBsaW5ldHlwZSkgbGluZXR5cGVCdXR0b24gPSBidXR0b25cclxuXHRcdGJvcmRlci54ID0geFxyXG5cdFx0bGV0IHR4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KG5hbWUsXCJib2xkIDEycHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRcdHR4dC54ID0geCs1XHJcblx0XHR0eHQueSA9IDVcclxuXHRcdGxldCBsaW5lID0gTGluZS5nZXRMaW5lU2hhcGUobHQpXHJcblx0XHRsZXQgbGVmdCA9IHggKyB0eHQuZ2V0Qm91bmRzKCkud2lkdGgrMTBcclxuXHRcdGxpbmUuZ3JhcGhpY3MubW92ZVRvKGxlZnQsMTApLmxpbmVUbyhsZWZ0KzE1LDEwKS5lbmRTdHJva2UoKVxyXG5cdFx0YnV0dG9uLmFkZENoaWxkKGJvcmRlcix0eHQsbGluZSlcclxuXHRcdHJldHVybiBidXR0b25cclxuXHR9XHJcblx0XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IHB0cyA9IGpzb24ucHRzXHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0cGF0aC5uYW1lID0ganNvbi5sdHlwZVxyXG5cdFx0bGV0IHNoYXBlID0gTGluZS5nZXRMaW5lU2hhcGUobGluZXR5cGVzW2pzb24ubHR5cGVdKVxyXG5cdFx0bGV0IG9sZFggPSBwdHNbMF0ueFxyXG5cdFx0bGV0IG9sZFkgPSBwdHNbMF0ueVxyXG5cdFx0bGV0IG9sZE1pZFggPSBvbGRYXHJcblx0XHRsZXQgb2xkTWlkWSA9IG9sZFlcclxuXHQgICAganNvbi5wdHMuZm9yRWFjaChwdCA9PiB7XHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludChvbGRYICsgcHQueCA+PiAxLCBvbGRZK3B0LnkgPj4gMSlcclxuXHQgICAgICAgIHNoYXBlLmdyYXBoaWNzLm1vdmVUbyhtaWRQb2ludC54LCBtaWRQb2ludC55KVxyXG5cdCAgICAgICAgc2hhcGUuZ3JhcGhpY3MuY3VydmVUbyhvbGRYLCBvbGRZLCBvbGRNaWRYLCBvbGRNaWRZKVxyXG5cdCAgICAgICAgb2xkWCA9IHB0LnhcclxuXHQgICAgICAgIG9sZFkgPSBwdC55XHJcblx0ICAgICAgICBvbGRNaWRYID0gbWlkUG9pbnQueFxyXG5cdCAgICAgICAgb2xkTWlkWSA9IG1pZFBvaW50LnlcclxuXHQgICAgfSlcclxuXHQgICAgcGF0aC5hZGRDaGlsZChzaGFwZSlcclxuXHQgICAgc3RhZ2UuYWRkQ2hpbGQocGF0aClcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IoZHJhd3NpbSkge1xyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmZyYW1lcmF0ZSA9IDEwXHJcblx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRsZXQgeCA9IDVcclxuXHRcdGZvciAobGV0IGtleSBpbiBsaW5ldHlwZXMpIHtcclxuXHRcdFx0bGV0IGIgPSBMaW5lLmdldEJ1dHRvbih4LGtleSlcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkQ2hpbGQoYilcclxuXHRcdFx0eCArPSA2NVxyXG5cdFx0fVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vkb3duXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRTaGFwZSA9IExpbmUuZ2V0TGluZVNoYXBlKGxpbmV0eXBlc1tsaW5ldHlwZV0pXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0ICAgIHRoaXMub2xkWCA9IHRoaXMub2xkTWlkWCA9IGUuc3RhZ2VYXHJcblx0XHQgICAgdGhpcy5vbGRZID0gdGhpcy5vbGRNaWRZID0gZS5zdGFnZVlcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSB0cnVlXHJcblx0XHRcdHRoaXMucHRzID0gW11cclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZW1vdmVcIiwgZSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLm1vdXNlRG93biA9PSBmYWxzZSkgcmV0dXJuXHJcblx0ICAgICAgICB0aGlzLnB0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KGUuc3RhZ2VYLCBlLnN0YWdlWSlcclxuXHRcdFx0dGhpcy5wdHMgPSB0aGlzLnB0cy5jb25jYXQoe3g6ZS5zdGFnZVgseTplLnN0YWdlWX0pXHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludCh0aGlzLm9sZFggKyB0aGlzLnB0LnggPj4gMSwgdGhpcy5vbGRZK3RoaXMucHQueSA+PiAxKVxyXG5cdCAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUobGluZXR5cGVzW2xpbmV0eXBlXS53KS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLmdyYXBoaWNzLmN1cnZlVG8odGhpcy5vbGRYLCB0aGlzLm9sZFksIHRoaXMub2xkTWlkWCwgdGhpcy5vbGRNaWRZKVxyXG5cdCAgICAgICAgdGhpcy5vbGRYID0gdGhpcy5wdC54XHJcblx0ICAgICAgICB0aGlzLm9sZFkgPSB0aGlzLnB0LnlcclxuXHQgICAgICAgIHRoaXMub2xkTWlkWCA9IG1pZFBvaW50LnhcclxuXHQgICAgICAgIHRoaXMub2xkTWlkWSA9IG1pZFBvaW50LnlcclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZXVwXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0XHRpZiAodGhpcy5wdHMubGVuZ3RoIDwgMykgcmV0dXJuXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKGRyYXdzaW0ubWFpbnN0YWdlLmdldENoaWxkQnlOYW1lKGxpbmV0eXBlKSlcclxuXHRcdFx0Z2V0U3ltYm9scygpLmZvckVhY2gocyA9PiB7XHJcblx0XHRcdFx0aWYgKHMubHR5cGUgPT0gbGluZXR5cGUpIHJlbW92ZVN5bWJvbChzKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHRsZXQgc3ltYm9sID0ge3R5cGU6XCJsaW5lXCIsbHR5cGU6IGxpbmV0eXBlLCBwdHM6IHRoaXMucHRzfVxyXG5cdFx0XHRMaW5lLnNob3dTeW1ib2woZHJhd3NpbS5tYWluc3RhZ2Usc3ltYm9sKVxyXG5cdFx0XHRhZGRTeW1ib2woc3ltYm9sKVx0XHRcdFxyXG5cdFx0fSlcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEVsbGlwc2UgZXh0ZW5kcyBjcmVhdGVqcy5Db250YWluZXIge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLGpzb24pIHtcclxuXHRcdGxldCBlbGxpcHNlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGVsbGlwc2UuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoMikuYmVnaW5GaWxsKFwiI0ZGRlwiKS5iZWdpblN0cm9rZShcIiNGMDBcIikuZHJhd0VsbGlwc2UoTWF0aC5yb3VuZChqc29uLnB0LngtanNvbi53LzIpLE1hdGgucm91bmQoanNvbi5wdC55LWpzb24uaC8yKSxNYXRoLnJvdW5kKGpzb24udyksTWF0aC5yb3VuZChqc29uLmgpKS5lbmRTdHJva2UoKVxyXG5cdFx0ZWxsaXBzZS5hbHBoYSA9IDAuNVxyXG4gICAgXHRlbGxpcHNlLmN1cnNvciA9IFwidXJsKGFzc2V0cy9yZW1vdmUucG5nKSA4IDgsIGF1dG9cIlxyXG5cdFx0ZWxsaXBzZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdHJlbW92ZVN5bWJvbChqc29uKVxyXG5cdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChlbGxpcHNlKVxyXG5cdFx0fSlcclxuICAgIFx0c3RhZ2UuYWRkQ2hpbGQoZWxsaXBzZSlcclxuXHR9XHJcblx0XHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcbiAgICBcdGJhY2suY3Vyc29yID0gXCJwb2ludGVyXCJcclxuXHRcdGJhY2suYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRsZXQgc3ltYm9sID0gdGhpcy50b0pTT04oZS5zdGFnZVgsZS5zdGFnZVkpXHJcblx0XHRcdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0XHRcdEVsbGlwc2Uuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSxzeW1ib2wpXHJcblx0XHR9KVxyXG5cdH1cclxuXHRcclxuXHR0b0pTT04oeCx5KSB7XHJcblx0XHRyZXR1cm4ge3R5cGU6XCJlbGxpcHNlXCIsIGV4OiBleCwgdzp3aWR0aCwgaDpoZWlnaHQsIHB0Ont4OngseTp5fX1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEZpZWxkIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSwganNvbikge1xyXG5cdFx0bGV0IHB0cyA9IGpzb24ucHRzXHJcblx0ICAgIGlmIChwdHMubGVuZ3RoID09IDApIHJldHVyblxyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGxldCBvbGRYID0gcHRzWzBdLnggXHJcblx0XHRsZXQgb2xkWSA9IHB0c1swXS55XHJcblx0XHRsZXQgb2xkTWlkWCA9IG9sZFhcclxuXHRcdGxldCBvbGRNaWRZID0gb2xkWVxyXG5cdFx0dGhpcy5jb2xvciA9IGpzb24uY29sb3I7XHJcblx0ICAgIHNoYXBlLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpO1xyXG5cdCAgICBqc29uLnB0cy5mb3JFYWNoKHB0ID0+IHtcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KG9sZFggKyBwdC54ID4+IDEsIG9sZFkgKyBwdC55ID4+IDEpXHJcblx0ICAgICAgICBzaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgyKS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHNoYXBlLmdyYXBoaWNzLmN1cnZlVG8ob2xkWCwgb2xkWSwgb2xkTWlkWCwgb2xkTWlkWSlcclxuXHQgICAgICAgIG9sZFggPSBwdC54XHJcblx0ICAgICAgICBvbGRZID0gcHQueVxyXG5cdCAgICAgICAgb2xkTWlkWCA9IG1pZFBvaW50LnhcclxuXHQgICAgICAgIG9sZE1pZFkgPSBtaWRQb2ludC55XHJcblx0ICAgIH0pXHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0cGF0aC5hZGRDaGlsZChzaGFwZSlcclxuXHQgICAgaWYgKChvcHQgPT0gJ2hlYWQnIHx8IG9wdCA9PSBcImNvbG9yaGVhZFwiKSAmJiBwdHMubGVuZ3RoID4gNCkge1xyXG5cdFx0ICAgIHBhdGguYWRkQ2hpbGQoRmllbGQuZHJhd0hlYWQocHRzLCBqc29uLmNvbG9yKSlcclxuXHRcdCAgICBhZGRMYWJlbChwYXRoLCBnZXRNaWQocHRzKSwganNvbiwgZnVuY3Rpb24oa2VlcCkge1xyXG5cdCAgICBcdFx0ZHJhd3NpbS5tYWluc3RhZ2UucmVtb3ZlQ2hpbGQocGF0aClcclxuXHQgICAgXHRcdGlmIChrZWVwKSBGaWVsZC5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLCBqc29uKVx0XHQgICAgXHRcclxuXHRcdCAgICB9KVxyXG5cdCAgICB9XHJcbiAgICBcdHNoYXBlLmN1cnNvciA9IFwidXJsKGFzc2V0cy9yZW1vdmUucG5nKSA4IDgsIGF1dG9cIlxyXG4gICAgXHRzdGFnZS5hZGRDaGlsZChwYXRoKVxyXG5cdFx0c2hhcGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0c3RhZ2UucmVtb3ZlQ2hpbGQocGF0aClcclxuXHRcdH0pXHJcblx0XHRyZXR1cm4gcGF0aFxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgZHJhd0hlYWQocHRzLCBjb2xvcikge1xyXG4gICAgXHRsZXQgbGFzdHB0ID0gcHRzW3B0cy5sZW5ndGgtNl1cclxuICAgIFx0bGV0IGVuZHB0ID0gcHRzW3B0cy5sZW5ndGgtMV1cclxuICAgIFx0bGV0IGhlYWQgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdCAgICBoZWFkLmdyYXBoaWNzLmYoY29sb3IpLnNldFN0cm9rZVN0eWxlKDQpLmJlZ2luU3Ryb2tlKGNvbG9yKS5tdCg0LDApLmx0KC00LC00KS5sdCgtNCw0KS5sdCg0LDApXHJcblx0ICAgIGhlYWQueCA9IGVuZHB0LnhcclxuXHQgICAgaGVhZC55ID0gZW5kcHQueVxyXG5cdCAgICBoZWFkLnJvdGF0aW9uID0gYW5nbGUobGFzdHB0LGVuZHB0KVxyXG5cdCAgICByZXR1cm4gaGVhZFxyXG5cdH1cclxuXHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRjcmVhdGVqcy5UaWNrZXIuZnJhbWVyYXRlID0gNVxyXG5cdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0dGhpcy53ID0gMVxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNlZG93blwiLCBlID0+IHtcclxuXHRcdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yXCIpLnN0eWxlLnZpc2liaWxpdHkgPT0gXCJ2aXNpYmxlXCIpIHJldHVybjtcclxuXHRcdFx0dGhpcy5zaGFwZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMuc2hhcGUpXHJcblx0XHQgICAgdGhpcy5vbGRYID0gdGhpcy5vbGRNaWRYID0gZS5zdGFnZVhcclxuXHRcdCAgICB0aGlzLm9sZFkgPSB0aGlzLm9sZE1pZFkgPSBlLnN0YWdlWVxyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IHRydWVcclxuXHRcdFx0dGhpcy5wdHMgPSBbXVxyXG5cdFx0XHR0aGlzLmNvbG9yID0gXCIjMDAwXCJcclxuXHRcdFx0aWYgKG9wdCA9PSBcImNvbG9yaGVhZFwiKSB7XHJcblx0XHRcdFx0dmFyIGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbmNhbnZhc1wiKS5nZXRDb250ZXh0KFwiMmRcIilcclxuXHRcdFx0ICAgIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSh0aGlzLm9sZFgsIHRoaXMub2xkWSwgMSwgMSkuZGF0YVxyXG5cdFx0XHQgICAgdGhpcy5jb2xvciA9IHJnYlRvSGV4KGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pXHJcblx0XHRcdH1cclxuXHRcdCAgICB0aGlzLnNoYXBlLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpXHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vtb3ZlXCIsIGUgPT4ge1xyXG5cdFx0XHRpZiAodGhpcy5tb3VzZURvd24gPT0gZmFsc2UpIHJldHVyblxyXG5cdCAgICAgICAgdGhpcy5wdCA9IG5ldyBjcmVhdGVqcy5Qb2ludChlLnN0YWdlWCwgZS5zdGFnZVkpXHJcblx0XHRcdHRoaXMucHRzID0gdGhpcy5wdHMuY29uY2F0KHt4OmUuc3RhZ2VYLHk6ZS5zdGFnZVl9KVxyXG5cdFx0XHRsZXQgbWlkUG9pbnQgPSBuZXcgY3JlYXRlanMuUG9pbnQodGhpcy5vbGRYICsgdGhpcy5wdC54ID4+IDEsIHRoaXMub2xkWSArIHRoaXMucHQueSA+PiAxKVxyXG5cdCAgICAgICAgdGhpcy5zaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgyKS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHRoaXMuc2hhcGUuZ3JhcGhpY3MuY3VydmVUbyh0aGlzLm9sZFgsIHRoaXMub2xkWSwgdGhpcy5vbGRNaWRYLCB0aGlzLm9sZE1pZFkpXHJcblx0ICAgICAgICB0aGlzLm9sZFggPSB0aGlzLnB0LnhcclxuXHQgICAgICAgIHRoaXMub2xkWSA9IHRoaXMucHQueVxyXG5cdCAgICAgICAgdGhpcy5vbGRNaWRYID0gbWlkUG9pbnQueFxyXG5cdCAgICAgICAgdGhpcy5vbGRNaWRZID0gbWlkUG9pbnQueVxyXG5cdFx0fSlcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNldXBcIiwgZSA9PiB7XHJcblx0XHRcdHRoaXMubW91c2VEb3duID0gZmFsc2VcclxuXHRcdFx0aWYgKHRoaXMucHRzLmxlbmd0aCA9PSAwKSByZXR1cm5cclxuXHRcdFx0bGV0IHN5bWJvbCA9IHt0eXBlOlwiZmllbGRcIiwgcHRzOiB0aGlzLnB0cywgY29sb3I6IHRoaXMuY29sb3IsIGRlc2M6IFwiXCJ9XHJcblx0XHQgICAgaWYgKChvcHQgPT0gJ2hlYWQnIHx8IG9wdCA9PSBcImNvbG9yaGVhZFwiKSAmJiB0aGlzLnB0cy5sZW5ndGggPiA0KSB7XHJcblx0XHRcdFx0bGV0IHRoYXQgPSB0aGlzO1xyXG5cdFx0ICAgIFx0bGV0IGhlYWQgPSBGaWVsZC5kcmF3SGVhZCh0aGlzLnB0cywgdGhpcy5jb2xvcilcclxuXHRcdCAgICBcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKGhlYWQpXHJcblx0XHQgICAgXHRnZXREZXNjKGdldE1pZCh0aGlzLnB0cyksIHN5bWJvbCwgZnVuY3Rpb24oa2VlcCkge1xyXG5cdFx0ICAgIFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZCh0aGF0LnNoYXBlKVxyXG5cdFx0ICAgIFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZChoZWFkKVxyXG5cdFx0ICAgIFx0XHRpZiAoa2VlcCkgRmllbGQuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSwgc3ltYm9sKVxyXG5cdFx0ICAgIFx0fSk7XHJcblx0XHQgICAgfVxyXG5cdFx0fSlcclxuXHR9IFxyXG59XHJcblxyXG5jbGFzcyBUcmFuc2Zvcm0ge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLCBzeW1ib2wpIHtcclxuXHRcdGJhY2sucm90YXRpb24gPSBzeW1ib2wucm90YXRpb247XHJcblx0XHRiYWNrLnNjYWxlWCA9IHN5bWJvbC5mbGlwSDtcclxuXHRcdGJhY2suc2NhbGVZID0gc3ltYm9sLmZsaXBWO1xyXG5cdH1cclxuXHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRjcmVhdGVqcy5UaWNrZXIuZnJhbWVyYXRlID0gNVxyXG5cdFx0bGV0IHN5bWJvbHMgPSBnZXRTeW1ib2xzKClcclxuXHRcdGlmIChzeW1ib2xzLmNudCA9PSAxKSB7XHJcblx0XHRcdGxldCBzeW1ib2wgPSB7dHlwZTpcInRyYW5zZm9ybVwiLCByb3RhdGlvbjogMCwgZmxpcEg6IDEsIGZsaXBWOiAxfVxyXG5cdFx0XHRhZGRTeW1ib2woc3ltYm9sKVxyXG5cdFx0fVxyXG5cdFx0aWYgKGVkaXQpIHtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0cmFuc2Zvcm1cIikuc3R5bGUudmlzaWJpbGl0eT1cInZpc2libGVcIjtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb3RhdGVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGJhY2sucm90YXRpb24gPSBiYWNrLnJvdGF0aW9uIDwgMzYwID8gYmFjay5yb3RhdGlvbiArIDkwIDogMFxyXG5cdFx0XHRcdGxldCBzeW1ib2wgPSBnZXRTeW1ib2xzKCkuZGF0YVsxXVxyXG5cdFx0XHRcdHN5bWJvbC5yb3RhdGlvbiA9IGJhY2sucm90YXRpb25cclxuXHRcdFx0XHR1cGRhdGVTeW1ib2woc3ltYm9sKVxyXG5cdFx0XHRcdFRyYW5zZm9ybS5zaG93U3ltYm9sKGRyYXdzaW0uc3RhZ2UsIHN5bWJvbClcclxuXHRcdFx0fSk7XHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmxpcGhcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGJhY2suc2NhbGVYID0gLWJhY2suc2NhbGVYXHJcblx0XHRcdFx0bGV0IHN5bWJvbCA9IGdldFN5bWJvbHMoKS5kYXRhWzFdXHJcblx0XHRcdFx0c3ltYm9sLmZsaXBIID0gYmFjay5zY2FsZVhcclxuXHRcdFx0XHR1cGRhdGVTeW1ib2woc3ltYm9sKVx0XHRcdFx0XHJcblx0XHRcdFx0VHJhbnNmb3JtLnNob3dTeW1ib2woZHJhd3NpbS5zdGFnZSwgc3ltYm9sKVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmbGlwdlwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0YmFjay5zY2FsZVkgPSAtYmFjay5zY2FsZVlcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0gZ2V0U3ltYm9scygpLmRhdGFbMV1cclxuXHRcdFx0XHRzeW1ib2wuZmxpcFYgPSBiYWNrLnNjYWxlWVxyXG5cdFx0XHRcdHVwZGF0ZVN5bWJvbChzeW1ib2wpXHRcdFxyXG5cdFx0XHRcdFRyYW5zZm9ybS5zaG93U3ltYm9sKGRyYXdzaW0uc3RhZ2UsIHN5bWJvbClcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBMYWJlbCB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsIGpzb24pIHtcclxuXHRcdGxldCBwYXRoID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpXHJcblx0XHRzdGFnZS5hZGRDaGlsZChwYXRoKTtcclxuXHRcdGFkZExhYmVsKHBhdGgsIFtqc29uLngsIGpzb24ueV0sIGpzb24sIGZ1bmN0aW9uKHNob3cpIHtcclxuXHRcdFx0c3RhZ2UucmVtb3ZlQ2hpbGQocGF0aCk7XHJcbiAgICBcdFx0aWYgKHNob3cpIExhYmVsLnNob3dTeW1ib2woc3RhZ2UsIGpzb24pXHJcblx0XHR9KVxyXG5cdH1cclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdGxldCBzeW1ib2wgPSB7XCJ0eXBlXCI6IFwibGFiZWxcIiwgeDogZS5zdGFnZVgsIHk6IGUuc3RhZ2VZLCBkZXNjOiBcIlwifVxyXG5cdFx0XHRnZXREZXNjKFtzeW1ib2wueCwgc3ltYm9sLnldLCBzeW1ib2wsIGZ1bmN0aW9uKHNob3cpIHtcclxuXHQgICAgXHRcdGlmIChzaG93KSBMYWJlbC5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLCBzeW1ib2wpXHJcblx0XHRcdH0pXHJcblx0XHR9KVx0XHRcclxuXHR9XHRcdFxyXG59XHJcblxyXG5jbGFzcyBBcnJvdyB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsIGpzb24sIHNob3dDdXJzb3IpIHtcclxuXHRcdGxldCBzaGFwZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRsZXQgdyA9IE1hdGgubWluKHdpZHRoLCA1KVxyXG5cdFx0bGV0IGQgPSBNYXRoLmh5cG90KGpzb24uc3RhcnQueCAtIGpzb24uZW5kLngsIGpzb24uc3RhcnQueSAtIGpzb24uZW5kLnkpXHJcblx0ICAgIHNoYXBlLmdyYXBoaWNzLnNzKDEpLnMoanNvbi5jb2xvcikuZihqc29uLmNvbG9yKS5tdCgwLCAwKS5sdCgwLCB3KS5sdChkLCB3KS5sdChkLCAyICogdykubHQoZCArIDIgKiB3LCAwKS5sdChkLCAtIDIgKiB3KS5sdChkLCAtdykubHQoMCwgLXcpLmx0KDAsIDApXHJcblx0ICAgIHNoYXBlLnggPSBqc29uLnN0YXJ0LnhcclxuXHQgICAgc2hhcGUueSA9IGpzb24uc3RhcnQueVxyXG5cdCAgICBzaGFwZS5yb3RhdGlvbiA9IGFuZ2xlKGpzb24uc3RhcnQsIGpzb24uZW5kKVxyXG5cdFx0aWYgKHNob3dDdXJzb3IpIHNoYXBlLmN1cnNvciA9IFwidXJsKGFzc2V0cy9yZW1vdmUucG5nKSA4IDgsIGF1dG9cIlxyXG5cdFx0c2hhcGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXHJcblx0XHRcdHJlbW92ZVN5bWJvbChqc29uKVxyXG5cdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChzaGFwZSlcclxuXHRcdH0pXHJcbiAgICBcdHN0YWdlLmFkZENoaWxkKHNoYXBlKVxyXG5cdFx0cmV0dXJuIHNoYXBlXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSAzMFxyXG5cdFx0bGV0IGNvbG9yc2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29sb3JzXCIpXHJcblx0XHRjb2xvcnNkaXYuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXHJcblx0XHRsZXQgY2hlY2tlZCA9IHRydWVcclxuXHRcdGNvbG9ycy5zcGxpdChcIixcIikuZm9yRWFjaChjb2xvciA9PiB7XHJcblx0XHRcdHZhciByYWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcclxuXHRcdFx0ICByYWRpby50eXBlID0gJ3JhZGlvJ1xyXG5cdFx0XHQgIHJhZGlvLm5hbWUgPSAnY29sb3InXHJcblx0XHRcdCAgcmFkaW8uY2hlY2tlZCA9IGNoZWNrZWQ7XHJcblx0XHRcdCAgcmFkaW8uaWQgPSBjb2xvclxyXG5cdFx0XHQgIHJhZGlvLnZhbHVlID0gY29sb3JcclxuXHRcdFx0ICBjb2xvcnNkaXYuYXBwZW5kQ2hpbGQocmFkaW8pXHJcblx0XHRcdHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJylcclxuXHRcdFx0ICBsYWJlbC5mb3IgPSBjb2xvclxyXG5cdFx0XHRsYWJlbC5zdHlsZS5jb2xvciA9IGNvbG9yO1xyXG5cdFx0XHRjb2xvcnNkaXYuYXBwZW5kQ2hpbGQobGFiZWwpXHJcblx0XHRcdHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY29sb3IpXHJcblx0XHRcdGxhYmVsLmFwcGVuZENoaWxkKHRleHQpXHJcblx0XHRcdGNoZWNrZWQgPSBmYWxzZVxyXG5cdFx0fSlcclxuXHRcdGxldCBzeW1ib2wgPSB7dHlwZTpcImFycm93XCIsIHN0YXJ0Ont9LCBlbmQ6IHt9LCBjb2xvcjogZ2V0Q29sb3IoKX1cclxuXHRcdGxldCBtb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0bGV0IHNoYXBlID0gbnVsbFxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vkb3duXCIsIGUgPT4ge1xyXG5cdFx0XHRsZXQgdGhpbmcgPSBkcmF3c2ltLm1haW5zdGFnZS5nZXRPYmplY3RVbmRlclBvaW50KGUuc3RhZ2VYLCBlLnN0YWdlWSlcclxuXHRcdFx0aWYgKCF0aGluZyB8fCAhdGhpbmcuaW1hZ2UpIHJldHVyblxyXG5cdFx0XHRtb3VzZURvd24gPSB0cnVlXHJcblx0XHRcdHN5bWJvbC5zdGFydCA9IHt4OiBlLnN0YWdlWCwgeTogZS5zdGFnZVl9XHJcblx0XHRcdHN5bWJvbC5lbmQgPSB7eDogZS5zdGFnZVgsIHk6IGUuc3RhZ2VZfVxyXG5cdFx0XHRzeW1ib2wuY29sb3IgPSBnZXRDb2xvcigpXHJcblx0XHRcdHNoYXBlID0gQXJyb3cuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSwgc3ltYm9sLCBmYWxzZSk7XHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vtb3ZlXCIsIGUgPT4ge1xyXG5cdFx0XHRpZiAobW91c2VEb3duKSB7XHJcblx0XHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UucmVtb3ZlQ2hpbGQoc2hhcGUpXHJcblx0XHRcdFx0c3ltYm9sLmVuZCA9IHt4OiBlLnN0YWdlWCwgeTogZS5zdGFnZVl9XHJcblx0XHRcdFx0c2hhcGUgPSBBcnJvdy5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLCBzeW1ib2wsIGZhbHNlKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNldXBcIiwgZSA9PiB7XHJcblx0XHRcdGlmIChtb3VzZURvd24pIHtcclxuXHRcdFx0XHRhZGRTeW1ib2woc3ltYm9sKVxyXG5cdFx0XHRcdGlmIChzaGFwZSkgc2hhcGUuY3Vyc29yID0gXCJ1cmwoYXNzZXRzL3JlbW92ZS5wbmcpIDggOCwgYXV0b1wiXHJcblx0XHRcdFx0bW91c2VEb3duID0gZmFsc2VcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9IFxyXG59XHJcblxyXG5jbGFzcyBUb29sYmFyIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRjb25zdHJ1Y3Rvcih0b29sLGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSAyMFxyXG5cdFx0bGV0IGJvcmRlciA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHR0aGlzLmFkZENoaWxkKGJvcmRlcilcclxuXHRcdGxldCB3ID0gMlxyXG5cdFx0dGhpcy5hZGRDaGlsZCh0b29sKVxyXG5cdFx0dyArPSB0b29sLmdldExlbmd0aCgpXHJcblx0XHR0aGlzLmNhbmNlbCA9IG5ldyBWZWN0b3IodywwLFwiYXNzZXRzL2Nyb3NzLnBuZ1wiLGRyYXdzaW0pXHJcblx0XHR0aGlzLmNhbmNlbC55ID0gMlxyXG5cdFx0dGhpcy5hZGRDaGlsZCh0aGlzLmNhbmNlbClcclxuXHRcdHcgKz0gMzBcclxuXHRcdHRoaXMueCA9IDBcclxuXHRcdHRoaXMueSA9IC0xMDBcclxuXHRcdHRoaXMudyA9IHdcclxuXHRcdGJvcmRlci5ncmFwaGljcy5iZWdpbkZpbGwoXCIjRkZGXCIpLmJlZ2luU3Ryb2tlKFwiI0FBQVwiKS5kcmF3Um91bmRSZWN0KDAsMCx3LDMwLDUsNSw1LDUpLmVuZFN0cm9rZSgpXHJcblx0fVxyXG5cdFxyXG5cdHNlbGVjdChvYmopIHtcclxuXHRcdHRoaXMueSA9IC0xMDBcclxuXHRcdGlmIChvYmogPT0gdGhpcy5jYW5jZWwpIHJldHVyblxyXG5cdFx0bGV0IGpzb24gPSBudWxsXHJcblx0XHRpZiAob2JqIGluc3RhbmNlb2YgVmVjdG9yKSB7IFxyXG5cdFx0XHRqc29uID0gb2JqLnRvSlNPTih0aGlzLmUuc3RhZ2VYLHRoaXMuZS5zdGFnZVkpXHJcblx0XHRcdFZlY3Rvci5zaG93U3ltYm9sKHRoaXMuc3RhZ2UsanNvbilcclxuXHRcdH1cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBBaXJtYXNzKSB7XHJcblx0XHRcdGpzb24gPSBvYmoudG9KU09OKHRoaXMuZS5zdGFnZVgtMTQsdGhpcy5lLnN0YWdlWS0xNClcclxuXHRcdFx0QWlybWFzcy5zaG93U3ltYm9sKHRoaXMuc3RhZ2UsanNvbilcclxuXHRcdH1cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBQcmVzc3VyZVJlZ2lvbikge1xyXG5cdFx0XHRqc29uID0gb2JqLnRvSlNPTih0aGlzLmUuc3RhZ2VYLHRoaXMuZS5zdGFnZVkpXHJcblx0XHRcdFByZXNzdXJlUmVnaW9uLnNob3dTeW1ib2wodGhpcy5zdGFnZSxqc29uKVxyXG5cdFx0fVxyXG5cdFx0YWRkU3ltYm9sKGpzb24pXHJcblx0XHR0aGlzLnN0YWdlLnNldENoaWxkSW5kZXgoIHRoaXMsIHRoaXMuc3RhZ2UuZ2V0TnVtQ2hpbGRyZW4oKS0xKVxyXG5cdH1cclxuXHRcclxuXHRzaG93KGUpIHtcclxuXHRcdGlmICghZS5yZWxhdGVkVGFyZ2V0ICYmIHRoaXMueSA8IDApIHtcclxuXHRcdFx0dGhpcy54ID0gZS5zdGFnZVggLSB0aGlzLncvMlxyXG5cdFx0XHR0aGlzLnkgPSBlLnN0YWdlWSAtIDMwXHJcblx0XHRcdHRoaXMuZSA9IGVcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIERyYXdTaW0ge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5tYWluc3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJtYWluY2FudmFzXCIpXHJcblx0XHR0aGlzLm1haW5zdGFnZS5jdXJzb3IgPSBcImRlZmF1bHRcIlxyXG5cdFx0Y3JlYXRlanMuVG91Y2guZW5hYmxlKHRoaXMubWFpbnN0YWdlKVxyXG5cdFx0YmFjay5pbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0bGV0IGJuZCA9IGJhY2suZ2V0Qm91bmRzKClcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuY2FudmFzLndpZHRoID0gYm5kLndpZHRoICsgNDBcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuY2FudmFzLmhlaWdodCA9IGJuZC5oZWlnaHQgKyA0MFxyXG5cdFx0XHRiYWNrLnggPSBibmQud2lkdGggLyAyICsgMjBcclxuXHRcdFx0YmFjay55ID0gYm5kLndpZHRoIC8gMiArIDIwXHJcblx0XHQgICAgYmFjay5yZWdYID0gYm5kLndpZHRoIC8gMjtcclxuXHRcdCAgICBiYWNrLnJlZ1kgPSBibmQuaGVpZ2h0IC8gMjtcclxuXHRcdH1cclxuXHRcdHRoaXMubWFpbnN0YWdlLmFkZENoaWxkKGJhY2spXHJcblx0XHR0aGlzLnNob3dTeW1ib2xzKClcclxuXHRcdGlmIChlZGl0KSB7XHJcblx0XHRcdHRoaXMubWFpbnN0YWdlLmVuYWJsZU1vdXNlT3ZlcigpXHJcblx0XHRcdHN3aXRjaCAodG9vbCkge1xyXG5cdFx0XHRjYXNlIFwicHJlc3N1cmVcIjpcclxuXHRcdFx0XHRsZXQgcHJlc3N1cmVzID0gbmV3IFByZXNzdXJlcygyLHRoaXMpXHJcblx0XHRcdFx0dGhpcy50b29sYmFyID0gbmV3IFRvb2xiYXIocHJlc3N1cmVzLHRoaXMpXHJcblx0XHRcdFx0YmFjay5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGUgPT4gdGhpcy50b29sYmFyLnNob3coZSkpXHJcblx0XHRcdFx0dGhpcy5tYWluc3RhZ2UuYWRkQ2hpbGQodGhpcy50b29sYmFyKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJhaXJtYXNzXCI6XHJcblx0XHRcdFx0bGV0IGFpcm1hc3NlcyA9IG5ldyBBaXJtYXNzZXMoMix0aGlzKVxyXG5cdFx0XHRcdHRoaXMudG9vbGJhciA9IG5ldyBUb29sYmFyKGFpcm1hc3Nlcyx0aGlzKVxyXG5cdFx0XHRcdGJhY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBlID0+IHRoaXMudG9vbGJhci5zaG93KGUpKVxyXG5cdFx0XHRcdHRoaXMubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMudG9vbGJhcilcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiaXNvcGxldGhcIjpcclxuXHRcdFx0XHR0aGlzLmlzb3BsZXRoID0gbmV3IElzb1BsZXRoKHRoaXMpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImxpbmVcIjpcclxuXHRcdFx0XHR0aGlzLmxpbmUgPSBuZXcgTGluZSh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJlbGxpcHNlXCI6XHJcblx0XHRcdFx0dGhpcy5lbGxpcHNlID0gbmV3IEVsbGlwc2UodGhpcylcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiZmllbGRcIjpcclxuXHRcdFx0XHR0aGlzLmZpZWxkID0gbmV3IEZpZWxkKHRoaXMpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInRyYW5zZm9ybVwiOlxyXG5cdFx0XHRcdHRoaXMudHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJsYWJlbFwiOlxyXG5cdFx0XHRcdHRoaXMubGFiZWwgPSBuZXcgTGFiZWwodGhpcylcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImFycm93XCI6XHJcblx0XHRcdFx0dGhpcy5hcnJvdyA9IG5ldyBBcnJvdyh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGFsZXJ0KFwiUGFyYW1ldGVyIHRvb2wgc2hvdWxkIGJlIHByZXNzdXJlLCBhaXJtYXNzLCBpc29wbGV0aCwgbGluZSwgZWxsaXBzZSwgZmllbGQsIHRyYW5zZm9ybSBvciBsYWJlbFwiKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBoYW5kbGUgZG93bmxvYWRcclxuXHRcdGxldCBkbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG93bmxvYWRcIilcclxuXHRcdGRsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0bGV0IGR0ID0gdGhpcy5tYWluc3RhZ2UuY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJylcclxuXHRcdFx0LyogQ2hhbmdlIE1JTUUgdHlwZSB0byB0cmljayB0aGUgYnJvd3NlciB0byBkb3dubG9hZCB0aGUgZmlsZSBpbnN0ZWFkIG9mIGRpc3BsYXlpbmcgaXQgKi9cclxuXHRcdFx0ZHQgPSBkdC5yZXBsYWNlKC9eZGF0YTppbWFnZVxcL1teO10qLywgJ2RhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyk7XHJcblx0XHRcdC8qIEluIGFkZGl0aW9uIHRvIDxhPidzIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGUsIHlvdSBjYW4gZGVmaW5lIEhUVFAtc3R5bGUgaGVhZGVycyAqL1xyXG5cdFx0XHRkdCA9IGR0LnJlcGxhY2UoL15kYXRhOmFwcGxpY2F0aW9uXFwvb2N0ZXQtc3RyZWFtLywgJ2RhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2hlYWRlcnM9Q29udGVudC1EaXNwb3NpdGlvbiUzQSUyMGF0dGFjaG1lbnQlM0IlMjBmaWxlbmFtZT1tYXAucG5nJyk7XHJcblx0XHRcdGRsLmhyZWYgPSBkdDtcclxuXHRcdH0pXHJcblx0fVxyXG5cdFxyXG5cdHNob3dTeW1ib2xzKCkge1xyXG5cdFx0bGV0IHN5bWJvbHMgPSBnZXRTeW1ib2xzKClcclxuXHRcdGZvciAobGV0IGtleSBpbiBzeW1ib2xzW1wiZGF0YVwiXSkge1xyXG5cdFx0XHRsZXQganNvbiA9IHN5bWJvbHNbXCJkYXRhXCJdW2tleV1cclxuXHRcdFx0c3dpdGNoIChqc29uLnR5cGUpIHtcclxuXHRcdFx0Y2FzZSBcInZlY3RvclwiOlxyXG5cdFx0XHRcdFZlY3Rvci5zaG93U3ltYm9sKHRoaXMubWFpbnN0YWdlLGpzb24pXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInJlZ2lvblwiOlxyXG5cdFx0XHRcdFByZXNzdXJlUmVnaW9uLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiYWlybWFzc1wiOlxyXG5cdFx0XHRcdEFpcm1hc3Muc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJpc29wbGV0aFwiOlxyXG5cdFx0XHRcdElzb1BsZXRoLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImxpbmVcIjpcclxuXHRcdFx0XHRMaW5lLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImVsbGlwc2VcIjpcclxuXHRcdFx0XHRFbGxpcHNlLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImZpZWxkXCI6XHJcblx0XHRcdFx0RmllbGQuc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwidHJhbnNmb3JtXCI6XHJcblx0XHRcdFx0VHJhbnNmb3JtLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImxhYmVsXCI6XHJcblx0XHRcdFx0TGFiZWwuc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiYXJyb3dcIjpcclxuXHRcdFx0XHRBcnJvdy5zaG93U3ltYm9sKHRoaXMubWFpbnN0YWdlLGpzb24sIHRydWUpXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cnVuKCkge1xyXG5cdFx0bGV0IHRpY2sgPSAwXHJcblx0XHRjcmVhdGVqcy5UaWNrZXIuYWRkRXZlbnRMaXN0ZW5lcihcInRpY2tcIiwgZSA9PiB7XHJcblx0XHRcdHRoaXMubWFpbnN0YWdlLnVwZGF0ZSgpXHJcblx0XHRcdHRpY2srK1xyXG5cdFx0fSlcclxuXHR9XHJcbn1cclxuXHJcbmxldCBkcmF3c2ltID0gbmV3IERyYXdTaW0oKVxyXG5kcmF3c2ltLnJ1bigpIiwiY29uc3QgbWFyZ2luWCA9IDQwLCBtYXJnaW5ZID0gMzAsIGVuZE1hcmdpbiA9IDVcclxuXHJcbmV4cG9ydCBjbGFzcyBBeGlzIHtcclxuXHRjb25zdHJ1Y3RvcihzcGVjKSB7XHJcblx0XHR0aGlzLnNwZWMgPSBzcGVjXHJcblx0XHR0aGlzLnN0YWdlID0gc3BlYy5zdGFnZVxyXG5cdFx0dGhpcy53ID0gc3BlYy5kaW0udyB8fCAxMDBcclxuXHRcdHRoaXMuaCA9IHNwZWMuZGltLmggfHwgMTAwXHJcblx0XHR0aGlzLm1pbiA9IHNwZWMuZGltLm1pbiB8fCAwXHJcblx0XHR0aGlzLm1heCA9IHNwZWMuZGltLm1heCB8fCAxMDBcclxuXHRcdHRoaXMuZm9udCA9IHNwZWMuZm9udCB8fCBcIjExcHggQXJpYWxcIlxyXG5cdFx0dGhpcy5jb2xvciA9IHNwZWMuY29sb3IgfHwgXCIjMDAwXCJcclxuXHRcdHRoaXMubGFiZWwgPSBzcGVjLmxhYmVsXHJcblx0XHR0aGlzLm1ham9yID0gc3BlYy5tYWpvciB8fCAxMFxyXG5cdFx0dGhpcy5taW5vciA9IHNwZWMubWlub3IgfHwgc3BlYy5tYWpvclxyXG5cdFx0dGhpcy5wcmVjaXNpb24gPSBzcGVjLnByZWNpc2lvbiB8fCAwXHJcblx0XHR0aGlzLnZlcnRpY2FsID0gc3BlYy5vcmllbnQgJiYgc3BlYy5vcmllbnQgPT0gXCJ2ZXJ0aWNhbFwiIHx8IGZhbHNlXHJcblx0XHR0aGlzLmxpbmVhciA9IHNwZWMuc2NhbGUgJiYgc3BlYy5zY2FsZSA9PSBcImxpbmVhclwiIHx8IGZhbHNlXHJcblx0XHR0aGlzLmludmVydCA9IHNwZWMuaW52ZXJ0IHx8IGZhbHNlXHJcblx0XHRpZiAoc3BlYy5kaW0ueCkge1xyXG5cdFx0XHR0aGlzLm9yaWdpblggPSBzcGVjLmRpbS54XHJcblx0XHRcdHRoaXMuZW5kWCA9IHRoaXMub3JpZ2luWCArIHRoaXMud1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5YID0gbWFyZ2luWFxyXG5cdFx0XHR0aGlzLmVuZFggPSB0aGlzLncgLSBlbmRNYXJnaW5cclxuXHRcdH1cclxuXHRcdGlmIChzcGVjLmRpbS55KSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWSA9IHNwZWMuZGltLnlcclxuXHRcdFx0dGhpcy5lbmRZID0gdGhpcy5vcmlnaW5ZIC0gdGhpcy5oICsgZW5kTWFyZ2luXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLm9yaWdpblkgPSB0aGlzLmggLSBtYXJnaW5ZXHJcblx0XHRcdHRoaXMuZW5kWSA9IGVuZE1hcmdpblxyXG5cdFx0fVxyXG5cdFx0dGhpcy5zY2FsZSA9IHRoaXMudmVydGljYWwgPyBNYXRoLmFicyh0aGlzLmVuZFkgLSB0aGlzLm9yaWdpblkpLyh0aGlzLm1heCAtIHRoaXMubWluKTogTWF0aC5hYnModGhpcy5lbmRYIC0gdGhpcy5vcmlnaW5YKS8odGhpcy5tYXggLSB0aGlzLm1pbilcclxuXHR9XHJcblxyXG5cdGRyYXdMaW5lKHgxLHkxLHgyLHkyKSB7XHJcblx0XHRsZXQgbGluZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRsaW5lLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKDEpXHJcblx0XHRsaW5lLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpXHJcblx0XHRsaW5lLmdyYXBoaWNzLm1vdmVUbyh4MSwgeTEpXHJcblx0XHRsaW5lLmdyYXBoaWNzLmxpbmVUbyh4MiwgeTIpXHJcblx0XHRsaW5lLmdyYXBoaWNzLmVuZFN0cm9rZSgpO1xyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChsaW5lKVxyXG5cdH1cclxuXHRcclxuXHRkcmF3VGV4dCh0ZXh0LHgseSkge1xyXG5cdFx0dGV4dC54ID0geFxyXG5cdFx0dGV4dC55ID0geVxyXG5cdFx0aWYgKHRoaXMudmVydGljYWwgJiYgdGV4dC50ZXh0ID09IHRoaXMubGFiZWwpIHRleHQucm90YXRpb24gPSAyNzBcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGV4dClcclxuXHRcdHJldHVybiB0ZXh0XHJcblx0fVxyXG5cclxuXHRnZXRUZXh0KHMpIHsgcmV0dXJuIG5ldyBjcmVhdGVqcy5UZXh0KHMsdGhpcy5mb250LHRoaXMuY29sb3IpIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICBcdGxldCBsYWJlbCA9IHRoaXMuZ2V0VGV4dCh0aGlzLmxhYmVsKVxyXG4gICAgXHRsZXQgbGFiZWxfYm5kcyA9IGxhYmVsLmdldEJvdW5kcygpXHJcbiAgICAgICAgaWYgKHRoaXMudmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLm9yaWdpblgsdGhpcy5vcmlnaW5ZLHRoaXMub3JpZ2luWCx0aGlzLmVuZFkpXHJcbiAgICAgICAgICAgIGxldCBtaW5YTGFiZWwgPSB0aGlzLm9yaWdpblhcclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWFqb3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLm9yaWdpblgtNCx2LHRoaXMub3JpZ2luWCs0LHYpICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFRleHQodmFsLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pKVxyXG4gICAgICAgICAgICAgICAgbGV0IGJuZHMgPSB0ZXh0LmdldEJvdW5kcygpXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHRoaXMub3JpZ2luWC01LWJuZHMud2lkdGhcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RleHQodGV4dCx4LHYrYm5kcy5oZWlnaHQvMi0xMClcclxuICAgICAgICAgICAgICAgIGlmICh4IDwgbWluWExhYmVsKSBtaW5YTGFiZWwgPSB4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLm9yaWdpblgtMix2LHRoaXMub3JpZ2luWCsyLHYpICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWMubGFiZWwpIHtcclxuXHQgICAgICAgICAgICBsZXQgeSA9IHRoaXMub3JpZ2luWSAtICh0aGlzLm9yaWdpblkgLSBsYWJlbF9ibmRzLndpZHRoKS8yXHJcblx0ICAgICAgICAgICAgdGhpcy5kcmF3VGV4dChsYWJlbCwgbWluWExhYmVsIC0gbGFiZWxfYm5kcy5oZWlnaHQsIHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWCx0aGlzLm9yaWdpblksIHRoaXMuZW5kWCx0aGlzLm9yaWdpblkpICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWMubGFiZWwpIHtcclxuXHQgICAgICAgICAgICBsZXQgeCA9ICh0aGlzLncgLSBlbmRNYXJnaW4gLSBsYWJlbF9ibmRzLndpZHRoKS8yXHJcblx0ICAgICAgICAgICAgdGhpcy5kcmF3VGV4dChsYWJlbCwgdGhpcy5vcmlnaW5YICsgeCwgdGhpcy5vcmlnaW5ZICsgMTUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWFqb3IpICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodix0aGlzLm9yaWdpblktNCx2LHRoaXMub3JpZ2luWSs0KSAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0VGV4dCh2YWwudG9GaXhlZCh0aGlzLnByZWNpc2lvbikpXHJcbiAgICAgICAgICAgICAgICBsZXQgYm5kcyA9IHRleHQuZ2V0Qm91bmRzKClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RleHQodGV4dCx2LWJuZHMud2lkdGgvMix0aGlzLm9yaWdpblkrNClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5taW5vcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHYsdGhpcy5vcmlnaW5ZLTIsdix0aGlzLm9yaWdpblkrMikgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldExvYyh2YWwpIHtcclxuICAgICAgICBsZXQgaXZhbCA9IHRoaXMubGluZWFyPyBNYXRoLnJvdW5kKHRoaXMuc2NhbGUqKHZhbC10aGlzLm1pbikpOiBNYXRoLnJvdW5kKE1hdGgubG9nKHRoaXMuc2NhbGUqKHZhbC10aGlzLm1pbikpKVxyXG4gICAgICAgIHJldHVybiB0aGlzLnZlcnRpY2FsP3RoaXMub3JpZ2luWSAtIGl2YWw6dGhpcy5vcmlnaW5YICsgaXZhbFxyXG4gICAgfVxyXG5cclxuICAgIGdldFZhbHVlKHYpIHtcclxuICAgIFx0bGV0IGZhY3RvciA9IHRoaXMudmVydGljYWw/ICh0aGlzLm9yaWdpblkgLSB2KS90aGlzLm9yaWdpblk6KHYgLSB0aGlzLm9yaWdpblgpLyh0aGlzLncgLSB0aGlzLm9yaWdpblgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWluICsgKHRoaXMubWF4IC0gdGhpcy5taW4pICogZmFjdG9yXHJcbiAgICB9XHJcblxyXG4gICAgaXNJbnNpZGUodikge1xyXG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2FsKVxyXG4gICAgICAgICAgICByZXR1cm4gdiA+PSB0aGlzLm9yaWdpblkgJiYgdiA8PSAodGhpcy5vcmlnaW5ZICsgdGhpcy5oKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIHYgPj0gdGhpcy5vcmlnaW5YICYmIHYgPD0gKHRoaXMub3JpZ2luWSArIHRoaXMudylcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0F4aXN9IGZyb20gXCIuL2F4aXNcIlxyXG5leHBvcnQgY2xhc3MgR3JhcGgge1xyXG5cdGNvbnN0cnVjdG9yKHNwZWMpIHtcclxuXHRcdHRoaXMuc3RhZ2UgPSBzcGVjLnN0YWdlXHJcblx0XHR0aGlzLnhheGlzID0gbmV3IEF4aXMoe1xyXG5cdFx0XHRzdGFnZTogdGhpcy5zdGFnZSxcclxuXHRcdFx0bGFiZWw6IHNwZWMueGxhYmVsLFxyXG5cdFx0XHRkaW06IHsgeDogc3BlYy54LCB5OiBzcGVjLnksIHc6IHNwZWMudywgaDogc3BlYy5oLCBtaW46IHNwZWMubWluWCwgbWF4OiBzcGVjLm1heFggfSxcclxuXHRcdFx0b3JpZW50OiBcImhvcml6b250YWxcIixcclxuXHRcdFx0c2NhbGU6IHNwZWMueHNjYWxlLFxyXG5cdFx0XHRtYWpvcjogc3BlYy5tYWpvclgsXHJcblx0XHRcdG1pbm9yOiBzcGVjLm1pbm9yWCxcclxuXHRcdFx0cHJlY2lzaW9uOiBzcGVjLnByZWNpc2lvblgsXHJcblx0XHRcdGludmVydDogc3BlYy54aW52ZXJ0XHJcblx0XHR9KVxyXG5cdFx0dGhpcy55YXhpcyA9IG5ldyBBeGlzKHtcclxuXHRcdFx0c3RhZ2U6IHRoaXMuc3RhZ2UsXHJcblx0XHRcdGxhYmVsOiBzcGVjLnlsYWJlbCxcclxuXHRcdFx0ZGltOiB7IHg6IHNwZWMueCwgeTogc3BlYy55LCB3OiBzcGVjLncsIGg6IHNwZWMuaCwgbWluOiBzcGVjLm1pblksIG1heDogc3BlYy5tYXhZIH0sXHJcblx0XHRcdG9yaWVudDogXCJ2ZXJ0aWNhbFwiLFxyXG5cdFx0XHRzY2FsZTogc3BlYy55c2NhbGUsXHJcblx0XHRcdG1ham9yOiBzcGVjLm1ham9yWSxcclxuXHRcdFx0bWlub3I6IHNwZWMubWlub3JZLFxyXG5cdFx0XHRwcmVjaXNpb246IHNwZWMucHJlY2lzaW9uWSxcclxuXHRcdFx0aW52ZXJ0OiBzcGVjLnlpbnZlcnRcclxuXHRcdH0pXHJcblx0XHR0aGlzLndpZHRoID0gMVxyXG5cdFx0dGhpcy5sYXN0ID0gbnVsbFxyXG5cdFx0dGhpcy5tYXJrZXIgPSBudWxsXHJcblx0XHR0aGlzLmNvbG9yID0gXCIjMDAwXCJcclxuXHRcdHRoaXMuZG90dGVkID0gZmFsc2VcclxuXHRcdGlmIChzcGVjLmJhY2tncm91bmQpIHtcclxuXHRcdFx0bGV0IGIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0XHRiLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKFwiI0FBQVwiKS5iZWdpbkZpbGwoc3BlYy5iYWNrZ3JvdW5kKS5kcmF3UmVjdChzcGVjLngsc3BlYy55LXNwZWMuaCxzcGVjLncsc3BlYy5oKS5lbmRTdHJva2UoKVxyXG5cdFx0XHRiLmFscGhhID0gMC4zXHJcblx0XHRcdHNwZWMuc3RhZ2UuYWRkQ2hpbGQoYilcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c2V0V2lkdGgod2lkdGgpIHtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aFxyXG5cdH1cclxuXHRcclxuXHRzZXREb3R0ZWQoZG90dGVkKSB7XHJcblx0XHR0aGlzLmRvdHRlZCA9IGRvdHRlZFxyXG5cdH1cclxuXHRcclxuXHRzZXRDb2xvcihjb2xvcikge1xyXG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yXHJcblx0XHR0aGlzLmVuZFBsb3QoKVxyXG5cdFx0dGhpcy5tYXJrZXIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG4gICAgXHR0aGlzLm1hcmtlci5ncmFwaGljcy5iZWdpblN0cm9rZShjb2xvcikuYmVnaW5GaWxsKGNvbG9yKS5kcmF3UmVjdCgwLDAsNCw0KVxyXG4gICAgXHR0aGlzLm1hcmtlci54ID0gLTEwXHJcbiAgICBcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5tYXJrZXIpXHJcblx0fVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgIFx0dGhpcy54YXhpcy5yZW5kZXIoKVxyXG4gICAgXHR0aGlzLnlheGlzLnJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICBcdHRoaXMuc3RhZ2UucmVtb3ZlQWxsQ2hpbGRyZW4oKVxyXG4gICAgXHR0aGlzLmVuZFBsb3QoKVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVNYXJrZXIoeCx5KSB7XHJcbiAgICBcdGlmICh0aGlzLm1hcmtlcikge1xyXG4gICAgXHRcdHRoaXMubWFya2VyLnggPSB4LTJcclxuICAgIFx0XHR0aGlzLm1hcmtlci55ID0geS0yXHJcblxyXG4gICAgXHR9XHJcbiAgICB9XHJcblxyXG5cdGRyYXdMaW5lKHgxLHkxLHgyLHkyKSB7XHJcblx0XHRsZXQgbGluZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRpZiAodGhpcy5kb3R0ZWQgPT09IHRydWUpXHJcblx0XHRcdGxpbmUuZ3JhcGhpY3Muc2V0U3Ryb2tlRGFzaChbMiwyXSkuc2V0U3Ryb2tlU3R5bGUodGhpcy53aWR0aCkuYmVnaW5TdHJva2UodGhpcy5jb2xvcikubW92ZVRvKHgxLCB5MSkubGluZVRvKHgyLCB5MikuZW5kU3Ryb2tlKClcclxuXHRcdGVsc2VcclxuXHRcdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSh0aGlzLndpZHRoKS5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKS5tb3ZlVG8oeDEsIHkxKS5saW5lVG8oeDIsIHkyKS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChsaW5lKVxyXG5cdFx0cmV0dXJuIGxpbmVcclxuXHR9XHJcblx0XHJcbiAgICBwbG90KHh2LHl2KSB7XHJcbiAgICAgICAgaWYgKHh2ID49IHRoaXMueGF4aXMubWluICYmIHh2IDw9IHRoaXMueGF4aXMubWF4ICYmIHl2ID49IHRoaXMueWF4aXMubWluICYmIHl2IDw9IHRoaXMueWF4aXMubWF4KSB7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgeCA9IHRoaXMueGF4aXMuZ2V0TG9jKHh2KVxyXG4gICAgICAgICAgICBsZXQgeSA9IHRoaXMueWF4aXMuZ2V0TG9jKHl2KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0KSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlTWFya2VyKHRoaXMubGFzdC54LHRoaXMubGFzdC55KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLmxhc3QueCx0aGlzLmxhc3QueSx4LHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KHgseSlcclxuICAgICAgICAgICAgdGhpcy5tb3ZlTWFya2VyKHgseSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGVuZFBsb3QoKSB7IHRoaXMubGFzdCA9IG51bGwgfVxyXG4gICAgXHJcbn1cclxuIiwiZXhwb3J0IHtHcmFwaH0gZnJvbSBcIi4vZ3JhcGhcIlxyXG5cclxubGV0IEpTT04gPSByZXF1aXJlKFwiLi9qc29uMlwiKVxyXG5sZXQgc3RvcmUgPSByZXF1aXJlKFwiLi9zdG9yZVwiKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmFtcygpIHtcclxuICBsZXQgcGFyYW1zID0ge31cclxuICBpZiAobG9jYXRpb24uc2VhcmNoKSB7XHJcbiAgICBsb2NhdGlvbi5zZWFyY2guc2xpY2UoMSkuc3BsaXQoJyYnKS5mb3JFYWNoKHBhcnQgPT4ge1xyXG4gICAgICBsZXQgcGFpciA9IHBhcnQuc3BsaXQoJz0nKVxyXG4gICAgICBwYWlyWzBdID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMF0pXHJcbiAgICAgIHBhaXJbMV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSlcclxuICAgICAgcGFyYW1zW3BhaXJbMF1dID0gKHBhaXJbMV0gIT09ICd1bmRlZmluZWQnKSA/IHBhaXJbMV0gOiB0cnVlXHJcbiAgICB9KVxyXG4gIH1cclxuICByZXR1cm4gcGFyYW1zXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTdG9yZSgpIHtcclxuICAgIGlmICghc3RvcmUuZW5hYmxlZCkge1xyXG4gICAgICAgIGFsZXJ0KCdMb2NhbCBzdG9yYWdlIGlzIG5vdCBzdXBwb3J0ZWQgYnkgeW91ciBicm93c2VyLiBQbGVhc2UgZGlzYWJsZSBcIlByaXZhdGUgTW9kZVwiLCBvciB1cGdyYWRlIHRvIGEgbW9kZXJuIGJyb3dzZXIuJylcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHJldHVybiBzdG9yZVxyXG59IiwiLypcbiAgICBqc29uMi5qc1xuICAgIDIwMTUtMDUtMDNcblxuICAgIFB1YmxpYyBEb21haW4uXG5cbiAgICBOTyBXQVJSQU5UWSBFWFBSRVNTRUQgT1IgSU1QTElFRC4gVVNFIEFUIFlPVVIgT1dOIFJJU0suXG5cbiAgICBTZWUgaHR0cDovL3d3dy5KU09OLm9yZy9qcy5odG1sXG5cblxuICAgIFRoaXMgY29kZSBzaG91bGQgYmUgbWluaWZpZWQgYmVmb3JlIGRlcGxveW1lbnQuXG4gICAgU2VlIGh0dHA6Ly9qYXZhc2NyaXB0LmNyb2NrZm9yZC5jb20vanNtaW4uaHRtbFxuXG4gICAgVVNFIFlPVVIgT1dOIENPUFkuIElUIElTIEVYVFJFTUVMWSBVTldJU0UgVE8gTE9BRCBDT0RFIEZST00gU0VSVkVSUyBZT1UgRE9cbiAgICBOT1QgQ09OVFJPTC5cblxuXG4gICAgVGhpcyBmaWxlIGNyZWF0ZXMgYSBnbG9iYWwgSlNPTiBvYmplY3QgY29udGFpbmluZyB0d28gbWV0aG9kczogc3RyaW5naWZ5XG4gICAgYW5kIHBhcnNlLiBUaGlzIGZpbGUgaXMgcHJvdmlkZXMgdGhlIEVTNSBKU09OIGNhcGFiaWxpdHkgdG8gRVMzIHN5c3RlbXMuXG4gICAgSWYgYSBwcm9qZWN0IG1pZ2h0IHJ1biBvbiBJRTggb3IgZWFybGllciwgdGhlbiB0aGlzIGZpbGUgc2hvdWxkIGJlIGluY2x1ZGVkLlxuICAgIFRoaXMgZmlsZSBkb2VzIG5vdGhpbmcgb24gRVM1IHN5c3RlbXMuXG5cbiAgICAgICAgSlNPTi5zdHJpbmdpZnkodmFsdWUsIHJlcGxhY2VyLCBzcGFjZSlcbiAgICAgICAgICAgIHZhbHVlICAgICAgIGFueSBKYXZhU2NyaXB0IHZhbHVlLCB1c3VhbGx5IGFuIG9iamVjdCBvciBhcnJheS5cblxuICAgICAgICAgICAgcmVwbGFjZXIgICAgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgZGV0ZXJtaW5lcyBob3cgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgYXJlIHN0cmluZ2lmaWVkIGZvciBvYmplY3RzLiBJdCBjYW4gYmUgYVxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncy5cblxuICAgICAgICAgICAgc3BhY2UgICAgICAgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgb2YgbmVzdGVkIHN0cnVjdHVyZXMuIElmIGl0IGlzIG9taXR0ZWQsIHRoZSB0ZXh0IHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlIHBhY2tlZCB3aXRob3V0IGV4dHJhIHdoaXRlc3BhY2UuIElmIGl0IGlzIGEgbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXQgd2lsbCBzcGVjaWZ5IHRoZSBudW1iZXIgb2Ygc3BhY2VzIHRvIGluZGVudCBhdCBlYWNoXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbC4gSWYgaXQgaXMgYSBzdHJpbmcgKHN1Y2ggYXMgJ1xcdCcgb3IgJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXQgY29udGFpbnMgdGhlIGNoYXJhY3RlcnMgdXNlZCB0byBpbmRlbnQgYXQgZWFjaCBsZXZlbC5cblxuICAgICAgICAgICAgVGhpcyBtZXRob2QgcHJvZHVjZXMgYSBKU09OIHRleHQgZnJvbSBhIEphdmFTY3JpcHQgdmFsdWUuXG5cbiAgICAgICAgICAgIFdoZW4gYW4gb2JqZWN0IHZhbHVlIGlzIGZvdW5kLCBpZiB0aGUgb2JqZWN0IGNvbnRhaW5zIGEgdG9KU09OXG4gICAgICAgICAgICBtZXRob2QsIGl0cyB0b0pTT04gbWV0aG9kIHdpbGwgYmUgY2FsbGVkIGFuZCB0aGUgcmVzdWx0IHdpbGwgYmVcbiAgICAgICAgICAgIHN0cmluZ2lmaWVkLiBBIHRvSlNPTiBtZXRob2QgZG9lcyBub3Qgc2VyaWFsaXplOiBpdCByZXR1cm5zIHRoZVxuICAgICAgICAgICAgdmFsdWUgcmVwcmVzZW50ZWQgYnkgdGhlIG5hbWUvdmFsdWUgcGFpciB0aGF0IHNob3VsZCBiZSBzZXJpYWxpemVkLFxuICAgICAgICAgICAgb3IgdW5kZWZpbmVkIGlmIG5vdGhpbmcgc2hvdWxkIGJlIHNlcmlhbGl6ZWQuIFRoZSB0b0pTT04gbWV0aG9kXG4gICAgICAgICAgICB3aWxsIGJlIHBhc3NlZCB0aGUga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgdmFsdWUsIGFuZCB0aGlzIHdpbGwgYmVcbiAgICAgICAgICAgIGJvdW5kIHRvIHRoZSB2YWx1ZVxuXG4gICAgICAgICAgICBGb3IgZXhhbXBsZSwgdGhpcyB3b3VsZCBzZXJpYWxpemUgRGF0ZXMgYXMgSVNPIHN0cmluZ3MuXG5cbiAgICAgICAgICAgICAgICBEYXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGYobikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9ybWF0IGludGVnZXJzIHRvIGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuIDwgMTAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnMCcgKyBuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFVUQ0Z1bGxZZWFyKCkgICArICctJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01vbnRoKCkgKyAxKSArICctJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0RhdGUoKSkgICAgICArICdUJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0hvdXJzKCkpICAgICArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01pbnV0ZXMoKSkgICArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ1NlY29uZHMoKSkgICArICdaJztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBZb3UgY2FuIHByb3ZpZGUgYW4gb3B0aW9uYWwgcmVwbGFjZXIgbWV0aG9kLiBJdCB3aWxsIGJlIHBhc3NlZCB0aGVcbiAgICAgICAgICAgIGtleSBhbmQgdmFsdWUgb2YgZWFjaCBtZW1iZXIsIHdpdGggdGhpcyBib3VuZCB0byB0aGUgY29udGFpbmluZ1xuICAgICAgICAgICAgb2JqZWN0LiBUaGUgdmFsdWUgdGhhdCBpcyByZXR1cm5lZCBmcm9tIHlvdXIgbWV0aG9kIHdpbGwgYmVcbiAgICAgICAgICAgIHNlcmlhbGl6ZWQuIElmIHlvdXIgbWV0aG9kIHJldHVybnMgdW5kZWZpbmVkLCB0aGVuIHRoZSBtZW1iZXIgd2lsbFxuICAgICAgICAgICAgYmUgZXhjbHVkZWQgZnJvbSB0aGUgc2VyaWFsaXphdGlvbi5cblxuICAgICAgICAgICAgSWYgdGhlIHJlcGxhY2VyIHBhcmFtZXRlciBpcyBhbiBhcnJheSBvZiBzdHJpbmdzLCB0aGVuIGl0IHdpbGwgYmVcbiAgICAgICAgICAgIHVzZWQgdG8gc2VsZWN0IHRoZSBtZW1iZXJzIHRvIGJlIHNlcmlhbGl6ZWQuIEl0IGZpbHRlcnMgdGhlIHJlc3VsdHNcbiAgICAgICAgICAgIHN1Y2ggdGhhdCBvbmx5IG1lbWJlcnMgd2l0aCBrZXlzIGxpc3RlZCBpbiB0aGUgcmVwbGFjZXIgYXJyYXkgYXJlXG4gICAgICAgICAgICBzdHJpbmdpZmllZC5cblxuICAgICAgICAgICAgVmFsdWVzIHRoYXQgZG8gbm90IGhhdmUgSlNPTiByZXByZXNlbnRhdGlvbnMsIHN1Y2ggYXMgdW5kZWZpbmVkIG9yXG4gICAgICAgICAgICBmdW5jdGlvbnMsIHdpbGwgbm90IGJlIHNlcmlhbGl6ZWQuIFN1Y2ggdmFsdWVzIGluIG9iamVjdHMgd2lsbCBiZVxuICAgICAgICAgICAgZHJvcHBlZDsgaW4gYXJyYXlzIHRoZXkgd2lsbCBiZSByZXBsYWNlZCB3aXRoIG51bGwuIFlvdSBjYW4gdXNlXG4gICAgICAgICAgICBhIHJlcGxhY2VyIGZ1bmN0aW9uIHRvIHJlcGxhY2UgdGhvc2Ugd2l0aCBKU09OIHZhbHVlcy5cbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHVuZGVmaW5lZCkgcmV0dXJucyB1bmRlZmluZWQuXG5cbiAgICAgICAgICAgIFRoZSBvcHRpb25hbCBzcGFjZSBwYXJhbWV0ZXIgcHJvZHVjZXMgYSBzdHJpbmdpZmljYXRpb24gb2YgdGhlXG4gICAgICAgICAgICB2YWx1ZSB0aGF0IGlzIGZpbGxlZCB3aXRoIGxpbmUgYnJlYWtzIGFuZCBpbmRlbnRhdGlvbiB0byBtYWtlIGl0XG4gICAgICAgICAgICBlYXNpZXIgdG8gcmVhZC5cblxuICAgICAgICAgICAgSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIG5vbi1lbXB0eSBzdHJpbmcsIHRoZW4gdGhhdCBzdHJpbmcgd2lsbFxuICAgICAgICAgICAgYmUgdXNlZCBmb3IgaW5kZW50YXRpb24uIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIHRoZW5cbiAgICAgICAgICAgIHRoZSBpbmRlbnRhdGlvbiB3aWxsIGJlIHRoYXQgbWFueSBzcGFjZXMuXG5cbiAgICAgICAgICAgIEV4YW1wbGU6XG5cbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeShbJ2UnLCB7cGx1cmlidXM6ICd1bnVtJ31dKTtcbiAgICAgICAgICAgIC8vIHRleHQgaXMgJ1tcImVcIix7XCJwbHVyaWJ1c1wiOlwidW51bVwifV0nXG5cblxuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KFsnZScsIHtwbHVyaWJ1czogJ3VudW0nfV0sIG51bGwsICdcXHQnKTtcbiAgICAgICAgICAgIC8vIHRleHQgaXMgJ1tcXG5cXHRcImVcIixcXG5cXHR7XFxuXFx0XFx0XCJwbHVyaWJ1c1wiOiBcInVudW1cIlxcblxcdH1cXG5dJ1xuXG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoW25ldyBEYXRlKCldLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzW2tleV0gaW5zdGFuY2VvZiBEYXRlIFxuICAgICAgICAgICAgICAgICAgICA/ICdEYXRlKCcgKyB0aGlzW2tleV0gKyAnKScgXG4gICAgICAgICAgICAgICAgICAgIDogdmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHRleHQgaXMgJ1tcIkRhdGUoLS0tY3VycmVudCB0aW1lLS0tKVwiXSdcblxuXG4gICAgICAgIEpTT04ucGFyc2UodGV4dCwgcmV2aXZlcilcbiAgICAgICAgICAgIFRoaXMgbWV0aG9kIHBhcnNlcyBhIEpTT04gdGV4dCB0byBwcm9kdWNlIGFuIG9iamVjdCBvciBhcnJheS5cbiAgICAgICAgICAgIEl0IGNhbiB0aHJvdyBhIFN5bnRheEVycm9yIGV4Y2VwdGlvbi5cblxuICAgICAgICAgICAgVGhlIG9wdGlvbmFsIHJldml2ZXIgcGFyYW1ldGVyIGlzIGEgZnVuY3Rpb24gdGhhdCBjYW4gZmlsdGVyIGFuZFxuICAgICAgICAgICAgdHJhbnNmb3JtIHRoZSByZXN1bHRzLiBJdCByZWNlaXZlcyBlYWNoIG9mIHRoZSBrZXlzIGFuZCB2YWx1ZXMsXG4gICAgICAgICAgICBhbmQgaXRzIHJldHVybiB2YWx1ZSBpcyB1c2VkIGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIHZhbHVlLlxuICAgICAgICAgICAgSWYgaXQgcmV0dXJucyB3aGF0IGl0IHJlY2VpdmVkLCB0aGVuIHRoZSBzdHJ1Y3R1cmUgaXMgbm90IG1vZGlmaWVkLlxuICAgICAgICAgICAgSWYgaXQgcmV0dXJucyB1bmRlZmluZWQgdGhlbiB0aGUgbWVtYmVyIGlzIGRlbGV0ZWQuXG5cbiAgICAgICAgICAgIEV4YW1wbGU6XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIHRoZSB0ZXh0LiBWYWx1ZXMgdGhhdCBsb29rIGxpa2UgSVNPIGRhdGUgc3RyaW5ncyB3aWxsXG4gICAgICAgICAgICAvLyBiZSBjb252ZXJ0ZWQgdG8gRGF0ZSBvYmplY3RzLlxuXG4gICAgICAgICAgICBteURhdGEgPSBKU09OLnBhcnNlKHRleHQsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGE7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9XG4vXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0oPzpcXC5cXGQqKT8pWiQvLmV4ZWModmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKCthWzFdLCArYVsyXSAtIDEsICthWzNdLCArYVs0XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArYVs1XSwgK2FbNl0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbXlEYXRhID0gSlNPTi5wYXJzZSgnW1wiRGF0ZSgwOS8wOS8yMDAxKVwiXScsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNsaWNlKDAsIDUpID09PSAnRGF0ZSgnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5zbGljZSgtMSkgPT09ICcpJykge1xuICAgICAgICAgICAgICAgICAgICBkID0gbmV3IERhdGUodmFsdWUuc2xpY2UoNSwgLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICBUaGlzIGlzIGEgcmVmZXJlbmNlIGltcGxlbWVudGF0aW9uLiBZb3UgYXJlIGZyZWUgdG8gY29weSwgbW9kaWZ5LCBvclxuICAgIHJlZGlzdHJpYnV0ZS5cbiovXG5cbi8qanNsaW50IFxuICAgIGV2YWwsIGZvciwgdGhpcyBcbiovXG5cbi8qcHJvcGVydHlcbiAgICBKU09OLCBhcHBseSwgY2FsbCwgY2hhckNvZGVBdCwgZ2V0VVRDRGF0ZSwgZ2V0VVRDRnVsbFllYXIsIGdldFVUQ0hvdXJzLFxuICAgIGdldFVUQ01pbnV0ZXMsIGdldFVUQ01vbnRoLCBnZXRVVENTZWNvbmRzLCBoYXNPd25Qcm9wZXJ0eSwgam9pbixcbiAgICBsYXN0SW5kZXgsIGxlbmd0aCwgcGFyc2UsIHByb3RvdHlwZSwgcHVzaCwgcmVwbGFjZSwgc2xpY2UsIHN0cmluZ2lmeSxcbiAgICB0ZXN0LCB0b0pTT04sIHRvU3RyaW5nLCB2YWx1ZU9mXG4qL1xuXG5cbi8vIENyZWF0ZSBhIEpTT04gb2JqZWN0IG9ubHkgaWYgb25lIGRvZXMgbm90IGFscmVhZHkgZXhpc3QuIFdlIGNyZWF0ZSB0aGVcbi8vIG1ldGhvZHMgaW4gYSBjbG9zdXJlIHRvIGF2b2lkIGNyZWF0aW5nIGdsb2JhbCB2YXJpYWJsZXMuXG5cbmlmICh0eXBlb2YgSlNPTiAhPT0gJ29iamVjdCcpIHtcbiAgICBKU09OID0ge307XG59XG5cbihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIFxuICAgIHZhciByeF9vbmUgPSAvXltcXF0sOnt9XFxzXSokLyxcbiAgICAgICAgcnhfdHdvID0gL1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbMC05YS1mQS1GXXs0fSkvZyxcbiAgICAgICAgcnhfdGhyZWUgPSAvXCJbXlwiXFxcXFxcblxccl0qXCJ8dHJ1ZXxmYWxzZXxudWxsfC0/XFxkKyg/OlxcLlxcZCopPyg/OltlRV1bK1xcLV0/XFxkKyk/L2csXG4gICAgICAgIHJ4X2ZvdXIgPSAvKD86Xnw6fCwpKD86XFxzKlxcWykrL2csXG4gICAgICAgIHJ4X2VzY2FwYWJsZSA9IC9bXFxcXFxcXCJcXHUwMDAwLVxcdTAwMWZcXHUwMDdmLVxcdTAwOWZcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxcbiAgICAgICAgcnhfZGFuZ2Vyb3VzID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2c7XG5cbiAgICBmdW5jdGlvbiBmKG4pIHtcbiAgICAgICAgLy8gRm9ybWF0IGludGVnZXJzIHRvIGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgICAgICAgcmV0dXJuIG4gPCAxMCBcbiAgICAgICAgICAgID8gJzAnICsgbiBcbiAgICAgICAgICAgIDogbjtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gdGhpc192YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgRGF0ZS5wcm90b3R5cGUudG9KU09OICE9PSAnZnVuY3Rpb24nKSB7XG5cbiAgICAgICAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodGhpcy52YWx1ZU9mKCkpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmdldFVUQ0Z1bGxZZWFyKCkgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01vbnRoKCkgKyAxKSArICctJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDRGF0ZSgpKSArICdUJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDSG91cnMoKSkgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01pbnV0ZXMoKSkgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ1NlY29uZHMoKSkgKyAnWidcbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgQm9vbGVhbi5wcm90b3R5cGUudG9KU09OID0gdGhpc192YWx1ZTtcbiAgICAgICAgTnVtYmVyLnByb3RvdHlwZS50b0pTT04gPSB0aGlzX3ZhbHVlO1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLnRvSlNPTiA9IHRoaXNfdmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIGdhcCxcbiAgICAgICAgaW5kZW50LFxuICAgICAgICBtZXRhLFxuICAgICAgICByZXA7XG5cblxuICAgIGZ1bmN0aW9uIHF1b3RlKHN0cmluZykge1xuXG4vLyBJZiB0aGUgc3RyaW5nIGNvbnRhaW5zIG5vIGNvbnRyb2wgY2hhcmFjdGVycywgbm8gcXVvdGUgY2hhcmFjdGVycywgYW5kIG5vXG4vLyBiYWNrc2xhc2ggY2hhcmFjdGVycywgdGhlbiB3ZSBjYW4gc2FmZWx5IHNsYXAgc29tZSBxdW90ZXMgYXJvdW5kIGl0LlxuLy8gT3RoZXJ3aXNlIHdlIG11c3QgYWxzbyByZXBsYWNlIHRoZSBvZmZlbmRpbmcgY2hhcmFjdGVycyB3aXRoIHNhZmUgZXNjYXBlXG4vLyBzZXF1ZW5jZXMuXG5cbiAgICAgICAgcnhfZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiByeF9lc2NhcGFibGUudGVzdChzdHJpbmcpIFxuICAgICAgICAgICAgPyAnXCInICsgc3RyaW5nLnJlcGxhY2UocnhfZXNjYXBhYmxlLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgIHZhciBjID0gbWV0YVthXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGMgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgID8gY1xuICAgICAgICAgICAgICAgICAgICA6ICdcXFxcdScgKyAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICAgICAgfSkgKyAnXCInIFxuICAgICAgICAgICAgOiAnXCInICsgc3RyaW5nICsgJ1wiJztcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHN0cihrZXksIGhvbGRlcikge1xuXG4vLyBQcm9kdWNlIGEgc3RyaW5nIGZyb20gaG9sZGVyW2tleV0uXG5cbiAgICAgICAgdmFyIGksICAgICAgICAgIC8vIFRoZSBsb29wIGNvdW50ZXIuXG4gICAgICAgICAgICBrLCAgICAgICAgICAvLyBUaGUgbWVtYmVyIGtleS5cbiAgICAgICAgICAgIHYsICAgICAgICAgIC8vIFRoZSBtZW1iZXIgdmFsdWUuXG4gICAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgICBtaW5kID0gZ2FwLFxuICAgICAgICAgICAgcGFydGlhbCxcbiAgICAgICAgICAgIHZhbHVlID0gaG9sZGVyW2tleV07XG5cbi8vIElmIHRoZSB2YWx1ZSBoYXMgYSB0b0pTT04gbWV0aG9kLCBjYWxsIGl0IHRvIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oa2V5KTtcbiAgICAgICAgfVxuXG4vLyBJZiB3ZSB3ZXJlIGNhbGxlZCB3aXRoIGEgcmVwbGFjZXIgZnVuY3Rpb24sIHRoZW4gY2FsbCB0aGUgcmVwbGFjZXIgdG9cbi8vIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICAgIGlmICh0eXBlb2YgcmVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlcC5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuLy8gV2hhdCBoYXBwZW5zIG5leHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUncyB0eXBlLlxuXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gcXVvdGUodmFsdWUpO1xuXG4gICAgICAgIGNhc2UgJ251bWJlcic6XG5cbi8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gRW5jb2RlIG5vbi1maW5pdGUgbnVtYmVycyBhcyBudWxsLlxuXG4gICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpIFxuICAgICAgICAgICAgICAgID8gU3RyaW5nKHZhbHVlKSBcbiAgICAgICAgICAgICAgICA6ICdudWxsJztcblxuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY2FzZSAnbnVsbCc6XG5cbi8vIElmIHRoZSB2YWx1ZSBpcyBhIGJvb2xlYW4gb3IgbnVsbCwgY29udmVydCBpdCB0byBhIHN0cmluZy4gTm90ZTpcbi8vIHR5cGVvZiBudWxsIGRvZXMgbm90IHByb2R1Y2UgJ251bGwnLiBUaGUgY2FzZSBpcyBpbmNsdWRlZCBoZXJlIGluXG4vLyB0aGUgcmVtb3RlIGNoYW5jZSB0aGF0IHRoaXMgZ2V0cyBmaXhlZCBzb21lZGF5LlxuXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcblxuLy8gSWYgdGhlIHR5cGUgaXMgJ29iamVjdCcsIHdlIG1pZ2h0IGJlIGRlYWxpbmcgd2l0aCBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb3Jcbi8vIG51bGwuXG5cbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcblxuLy8gRHVlIHRvIGEgc3BlY2lmaWNhdGlvbiBibHVuZGVyIGluIEVDTUFTY3JpcHQsIHR5cGVvZiBudWxsIGlzICdvYmplY3QnLFxuLy8gc28gd2F0Y2ggb3V0IGZvciB0aGF0IGNhc2UuXG5cbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgICAgICAgfVxuXG4vLyBNYWtlIGFuIGFycmF5IHRvIGhvbGQgdGhlIHBhcnRpYWwgcmVzdWx0cyBvZiBzdHJpbmdpZnlpbmcgdGhpcyBvYmplY3QgdmFsdWUuXG5cbiAgICAgICAgICAgIGdhcCArPSBpbmRlbnQ7XG4gICAgICAgICAgICBwYXJ0aWFsID0gW107XG5cbi8vIElzIHRoZSB2YWx1ZSBhbiBhcnJheT9cblxuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG5cbi8vIFRoZSB2YWx1ZSBpcyBhbiBhcnJheS4gU3RyaW5naWZ5IGV2ZXJ5IGVsZW1lbnQuIFVzZSBudWxsIGFzIGEgcGxhY2Vob2xkZXJcbi8vIGZvciBub24tSlNPTiB2YWx1ZXMuXG5cbiAgICAgICAgICAgICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWxbaV0gPSBzdHIoaSwgdmFsdWUpIHx8ICdudWxsJztcbiAgICAgICAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBlbGVtZW50cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLCBhbmQgd3JhcCB0aGVtIGluXG4vLyBicmFja2V0cy5cblxuICAgICAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgICAgICAgICA/ICdbXSdcbiAgICAgICAgICAgICAgICAgICAgOiBnYXBcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJ1tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnXSdcbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ1snICsgcGFydGlhbC5qb2luKCcsJykgKyAnXSc7XG4gICAgICAgICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHJlcGxhY2VyIGlzIGFuIGFycmF5LCB1c2UgaXQgdG8gc2VsZWN0IHRoZSBtZW1iZXJzIHRvIGJlIHN0cmluZ2lmaWVkLlxuXG4gICAgICAgICAgICBpZiAocmVwICYmIHR5cGVvZiByZXAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gcmVwLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBbaV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrID0gcmVwW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FwIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnOiAnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnOidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4vLyBPdGhlcndpc2UsIGl0ZXJhdGUgdGhyb3VnaCBhbGwgb2YgdGhlIGtleXMgaW4gdGhlIG9iamVjdC5cblxuICAgICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FwIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnOiAnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnOidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBtZW1iZXIgdGV4dHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcyxcbi8vIGFuZCB3cmFwIHRoZW0gaW4gYnJhY2VzLlxuXG4gICAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICA/ICd7fSdcbiAgICAgICAgICAgICAgICA6IGdhcFxuICAgICAgICAgICAgICAgICAgICA/ICd7XFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ30nXG4gICAgICAgICAgICAgICAgICAgIDogJ3snICsgcGFydGlhbC5qb2luKCcsJykgKyAnfSc7XG4gICAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHN0cmluZ2lmeSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gICAgaWYgKHR5cGVvZiBKU09OLnN0cmluZ2lmeSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZXRhID0geyAgICAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAgICAgJ1xcYic6ICdcXFxcYicsXG4gICAgICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAgICAgJ1xcZic6ICdcXFxcZicsXG4gICAgICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgICAgICdcIic6ICdcXFxcXCInLFxuICAgICAgICAgICAgJ1xcXFwnOiAnXFxcXFxcXFwnXG4gICAgICAgIH07XG4gICAgICAgIEpTT04uc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlLCByZXBsYWNlciwgc3BhY2UpIHtcblxuLy8gVGhlIHN0cmluZ2lmeSBtZXRob2QgdGFrZXMgYSB2YWx1ZSBhbmQgYW4gb3B0aW9uYWwgcmVwbGFjZXIsIGFuZCBhbiBvcHRpb25hbFxuLy8gc3BhY2UgcGFyYW1ldGVyLCBhbmQgcmV0dXJucyBhIEpTT04gdGV4dC4gVGhlIHJlcGxhY2VyIGNhbiBiZSBhIGZ1bmN0aW9uXG4vLyB0aGF0IGNhbiByZXBsYWNlIHZhbHVlcywgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyB0aGF0IHdpbGwgc2VsZWN0IHRoZSBrZXlzLlxuLy8gQSBkZWZhdWx0IHJlcGxhY2VyIG1ldGhvZCBjYW4gYmUgcHJvdmlkZWQuIFVzZSBvZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGNhblxuLy8gcHJvZHVjZSB0ZXh0IHRoYXQgaXMgbW9yZSBlYXNpbHkgcmVhZGFibGUuXG5cbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgZ2FwID0gJyc7XG4gICAgICAgICAgICBpbmRlbnQgPSAnJztcblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIG51bWJlciwgbWFrZSBhbiBpbmRlbnQgc3RyaW5nIGNvbnRhaW5pbmcgdGhhdFxuLy8gbWFueSBzcGFjZXMuXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNwYWNlOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ICs9ICcgJztcbiAgICAgICAgICAgICAgICB9XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBzdHJpbmcsIGl0IHdpbGwgYmUgdXNlZCBhcyB0aGUgaW5kZW50IHN0cmluZy5cblxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaW5kZW50ID0gc3BhY2U7XG4gICAgICAgICAgICB9XG5cbi8vIElmIHRoZXJlIGlzIGEgcmVwbGFjZXIsIGl0IG11c3QgYmUgYSBmdW5jdGlvbiBvciBhbiBhcnJheS5cbi8vIE90aGVyd2lzZSwgdGhyb3cgYW4gZXJyb3IuXG5cbiAgICAgICAgICAgIHJlcCA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgaWYgKHJlcGxhY2VyICYmIHR5cGVvZiByZXBsYWNlciAhPT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgICAgICAgICAodHlwZW9mIHJlcGxhY2VyICE9PSAnb2JqZWN0JyB8fFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcmVwbGFjZXIubGVuZ3RoICE9PSAnbnVtYmVyJykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT04uc3RyaW5naWZ5Jyk7XG4gICAgICAgICAgICB9XG5cbi8vIE1ha2UgYSBmYWtlIHJvb3Qgb2JqZWN0IGNvbnRhaW5pbmcgb3VyIHZhbHVlIHVuZGVyIHRoZSBrZXkgb2YgJycuXG4vLyBSZXR1cm4gdGhlIHJlc3VsdCBvZiBzdHJpbmdpZnlpbmcgdGhlIHZhbHVlLlxuXG4gICAgICAgICAgICByZXR1cm4gc3RyKCcnLCB7Jyc6IHZhbHVlfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHBhcnNlIG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgICBpZiAodHlwZW9mIEpTT04ucGFyc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgSlNPTi5wYXJzZSA9IGZ1bmN0aW9uICh0ZXh0LCByZXZpdmVyKSB7XG5cbi8vIFRoZSBwYXJzZSBtZXRob2QgdGFrZXMgYSB0ZXh0IGFuZCBhbiBvcHRpb25hbCByZXZpdmVyIGZ1bmN0aW9uLCBhbmQgcmV0dXJuc1xuLy8gYSBKYXZhU2NyaXB0IHZhbHVlIGlmIHRoZSB0ZXh0IGlzIGEgdmFsaWQgSlNPTiB0ZXh0LlxuXG4gICAgICAgICAgICB2YXIgajtcblxuICAgICAgICAgICAgZnVuY3Rpb24gd2Fsayhob2xkZXIsIGtleSkge1xuXG4vLyBUaGUgd2FsayBtZXRob2QgaXMgdXNlZCB0byByZWN1cnNpdmVseSB3YWxrIHRoZSByZXN1bHRpbmcgc3RydWN0dXJlIHNvXG4vLyB0aGF0IG1vZGlmaWNhdGlvbnMgY2FuIGJlIG1hZGUuXG5cbiAgICAgICAgICAgICAgICB2YXIgaywgdiwgdmFsdWUgPSBob2xkZXJba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHdhbGsodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldml2ZXIuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuXG5cbi8vIFBhcnNpbmcgaGFwcGVucyBpbiBmb3VyIHN0YWdlcy4gSW4gdGhlIGZpcnN0IHN0YWdlLCB3ZSByZXBsYWNlIGNlcnRhaW5cbi8vIFVuaWNvZGUgY2hhcmFjdGVycyB3aXRoIGVzY2FwZSBzZXF1ZW5jZXMuIEphdmFTY3JpcHQgaGFuZGxlcyBtYW55IGNoYXJhY3RlcnNcbi8vIGluY29ycmVjdGx5LCBlaXRoZXIgc2lsZW50bHkgZGVsZXRpbmcgdGhlbSwgb3IgdHJlYXRpbmcgdGhlbSBhcyBsaW5lIGVuZGluZ3MuXG5cbiAgICAgICAgICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XG4gICAgICAgICAgICByeF9kYW5nZXJvdXMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIGlmIChyeF9kYW5nZXJvdXMudGVzdCh0ZXh0KSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocnhfZGFuZ2Vyb3VzLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1xcXFx1JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuLy8gSW4gdGhlIHNlY29uZCBzdGFnZSwgd2UgcnVuIHRoZSB0ZXh0IGFnYWluc3QgcmVndWxhciBleHByZXNzaW9ucyB0aGF0IGxvb2tcbi8vIGZvciBub24tSlNPTiBwYXR0ZXJucy4gV2UgYXJlIGVzcGVjaWFsbHkgY29uY2VybmVkIHdpdGggJygpJyBhbmQgJ25ldydcbi8vIGJlY2F1c2UgdGhleSBjYW4gY2F1c2UgaW52b2NhdGlvbiwgYW5kICc9JyBiZWNhdXNlIGl0IGNhbiBjYXVzZSBtdXRhdGlvbi5cbi8vIEJ1dCBqdXN0IHRvIGJlIHNhZmUsIHdlIHdhbnQgdG8gcmVqZWN0IGFsbCB1bmV4cGVjdGVkIGZvcm1zLlxuXG4vLyBXZSBzcGxpdCB0aGUgc2Vjb25kIHN0YWdlIGludG8gNCByZWdleHAgb3BlcmF0aW9ucyBpbiBvcmRlciB0byB3b3JrIGFyb3VuZFxuLy8gY3JpcHBsaW5nIGluZWZmaWNpZW5jaWVzIGluIElFJ3MgYW5kIFNhZmFyaSdzIHJlZ2V4cCBlbmdpbmVzLiBGaXJzdCB3ZVxuLy8gcmVwbGFjZSB0aGUgSlNPTiBiYWNrc2xhc2ggcGFpcnMgd2l0aCAnQCcgKGEgbm9uLUpTT04gY2hhcmFjdGVyKS4gU2Vjb25kLCB3ZVxuLy8gcmVwbGFjZSBhbGwgc2ltcGxlIHZhbHVlIHRva2VucyB3aXRoICddJyBjaGFyYWN0ZXJzLiBUaGlyZCwgd2UgZGVsZXRlIGFsbFxuLy8gb3BlbiBicmFja2V0cyB0aGF0IGZvbGxvdyBhIGNvbG9uIG9yIGNvbW1hIG9yIHRoYXQgYmVnaW4gdGhlIHRleHQuIEZpbmFsbHksXG4vLyB3ZSBsb29rIHRvIHNlZSB0aGF0IHRoZSByZW1haW5pbmcgY2hhcmFjdGVycyBhcmUgb25seSB3aGl0ZXNwYWNlIG9yICddJyBvclxuLy8gJywnIG9yICc6JyBvciAneycgb3IgJ30nLiBJZiB0aGF0IGlzIHNvLCB0aGVuIHRoZSB0ZXh0IGlzIHNhZmUgZm9yIGV2YWwuXG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICByeF9vbmUudGVzdChcbiAgICAgICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UocnhfdHdvLCAnQCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShyeF90aHJlZSwgJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UocnhfZm91ciwgJycpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSB7XG5cbi8vIEluIHRoZSB0aGlyZCBzdGFnZSB3ZSB1c2UgdGhlIGV2YWwgZnVuY3Rpb24gdG8gY29tcGlsZSB0aGUgdGV4dCBpbnRvIGFcbi8vIEphdmFTY3JpcHQgc3RydWN0dXJlLiBUaGUgJ3snIG9wZXJhdG9yIGlzIHN1YmplY3QgdG8gYSBzeW50YWN0aWMgYW1iaWd1aXR5XG4vLyBpbiBKYXZhU2NyaXB0OiBpdCBjYW4gYmVnaW4gYSBibG9jayBvciBhbiBvYmplY3QgbGl0ZXJhbC4gV2Ugd3JhcCB0aGUgdGV4dFxuLy8gaW4gcGFyZW5zIHRvIGVsaW1pbmF0ZSB0aGUgYW1iaWd1aXR5LlxuXG4gICAgICAgICAgICAgICAgaiA9IGV2YWwoJygnICsgdGV4dCArICcpJyk7XG5cbi8vIEluIHRoZSBvcHRpb25hbCBmb3VydGggc3RhZ2UsIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsIHBhc3Npbmdcbi8vIGVhY2ggbmFtZS92YWx1ZSBwYWlyIHRvIGEgcmV2aXZlciBmdW5jdGlvbiBmb3IgcG9zc2libGUgdHJhbnNmb3JtYXRpb24uXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgPyB3YWxrKHsnJzogan0sICcnKVxuICAgICAgICAgICAgICAgICAgICA6IGo7XG4gICAgICAgICAgICB9XG5cbi8vIElmIHRoZSB0ZXh0IGlzIG5vdCBKU09OIHBhcnNlYWJsZSwgdGhlbiBhIFN5bnRheEVycm9yIGlzIHRocm93bi5cblxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdKU09OLnBhcnNlJyk7XG4gICAgICAgIH07XG4gICAgfVxufSgpKTtcbiIsIlwidXNlIHN0cmljdFwiXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXHQvLyBTdG9yZS5qc1xuXHR2YXIgc3RvcmUgPSB7fSxcblx0XHR3aW4gPSAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCksXG5cdFx0ZG9jID0gd2luLmRvY3VtZW50LFxuXHRcdGxvY2FsU3RvcmFnZU5hbWUgPSAnbG9jYWxTdG9yYWdlJyxcblx0XHRzY3JpcHRUYWcgPSAnc2NyaXB0Jyxcblx0XHRzdG9yYWdlXG5cblx0c3RvcmUuZGlzYWJsZWQgPSBmYWxzZVxuXHRzdG9yZS52ZXJzaW9uID0gJzEuMy4yMCdcblx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge31cblx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsKSB7fVxuXHRzdG9yZS5oYXMgPSBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHN0b3JlLmdldChrZXkpICE9PSB1bmRlZmluZWQgfVxuXHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHt9XG5cdHN0b3JlLmNsZWFyID0gZnVuY3Rpb24oKSB7fVxuXHRzdG9yZS50cmFuc2FjdCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCwgdHJhbnNhY3Rpb25Gbikge1xuXHRcdGlmICh0cmFuc2FjdGlvbkZuID09IG51bGwpIHtcblx0XHRcdHRyYW5zYWN0aW9uRm4gPSBkZWZhdWx0VmFsXG5cdFx0XHRkZWZhdWx0VmFsID0gbnVsbFxuXHRcdH1cblx0XHRpZiAoZGVmYXVsdFZhbCA9PSBudWxsKSB7XG5cdFx0XHRkZWZhdWx0VmFsID0ge31cblx0XHR9XG5cdFx0dmFyIHZhbCA9IHN0b3JlLmdldChrZXksIGRlZmF1bHRWYWwpXG5cdFx0dHJhbnNhY3Rpb25Gbih2YWwpXG5cdFx0c3RvcmUuc2V0KGtleSwgdmFsKVxuXHR9XG5cdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciByZXQgPSB7fVxuXHRcdHN0b3JlLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRcdHJldFtrZXldID0gdmFsXG5cdFx0fSlcblx0XHRyZXR1cm4gcmV0XG5cdH1cblx0c3RvcmUuZm9yRWFjaCA9IGZ1bmN0aW9uKCkge31cblx0c3RvcmUuc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG5cdH1cblx0c3RvcmUuZGVzZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHsgcmV0dXJuIHVuZGVmaW5lZCB9XG5cdFx0dHJ5IHsgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpIH1cblx0XHRjYXRjaChlKSB7IHJldHVybiB2YWx1ZSB8fCB1bmRlZmluZWQgfVxuXHR9XG5cblx0Ly8gRnVuY3Rpb25zIHRvIGVuY2Fwc3VsYXRlIHF1ZXN0aW9uYWJsZSBGaXJlRm94IDMuNi4xMyBiZWhhdmlvclxuXHQvLyB3aGVuIGFib3V0LmNvbmZpZzo6ZG9tLnN0b3JhZ2UuZW5hYmxlZCA9PT0gZmFsc2Vcblx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzI2lzc3VlLzEzXG5cdGZ1bmN0aW9uIGlzTG9jYWxTdG9yYWdlTmFtZVN1cHBvcnRlZCgpIHtcblx0XHR0cnkgeyByZXR1cm4gKGxvY2FsU3RvcmFnZU5hbWUgaW4gd2luICYmIHdpbltsb2NhbFN0b3JhZ2VOYW1lXSkgfVxuXHRcdGNhdGNoKGVycikgeyByZXR1cm4gZmFsc2UgfVxuXHR9XG5cblx0aWYgKGlzTG9jYWxTdG9yYWdlTmFtZVN1cHBvcnRlZCgpKSB7XG5cdFx0c3RvcmFnZSA9IHdpbltsb2NhbFN0b3JhZ2VOYW1lXVxuXHRcdHN0b3JlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsKSB7XG5cdFx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRcdHN0b3JhZ2Uuc2V0SXRlbShrZXksIHN0b3JlLnNlcmlhbGl6ZSh2YWwpKVxuXHRcdFx0cmV0dXJuIHZhbFxuXHRcdH1cblx0XHRzdG9yZS5nZXQgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwpIHtcblx0XHRcdHZhciB2YWwgPSBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEl0ZW0oa2V5KSlcblx0XHRcdHJldHVybiAodmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsIDogdmFsKVxuXHRcdH1cblx0XHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHsgc3RvcmFnZS5yZW1vdmVJdGVtKGtleSkgfVxuXHRcdHN0b3JlLmNsZWFyID0gZnVuY3Rpb24oKSB7IHN0b3JhZ2UuY2xlYXIoKSB9XG5cdFx0c3RvcmUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RvcmFnZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIga2V5ID0gc3RvcmFnZS5rZXkoaSlcblx0XHRcdFx0Y2FsbGJhY2soa2V5LCBzdG9yZS5nZXQoa2V5KSlcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoZG9jICYmIGRvYy5kb2N1bWVudEVsZW1lbnQuYWRkQmVoYXZpb3IpIHtcblx0XHR2YXIgc3RvcmFnZU93bmVyLFxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lclxuXHRcdC8vIFNpbmNlICN1c2VyRGF0YSBzdG9yYWdlIGFwcGxpZXMgb25seSB0byBzcGVjaWZpYyBwYXRocywgd2UgbmVlZCB0b1xuXHRcdC8vIHNvbWVob3cgbGluayBvdXIgZGF0YSB0byBhIHNwZWNpZmljIHBhdGguICBXZSBjaG9vc2UgL2Zhdmljb24uaWNvXG5cdFx0Ly8gYXMgYSBwcmV0dHkgc2FmZSBvcHRpb24sIHNpbmNlIGFsbCBicm93c2VycyBhbHJlYWR5IG1ha2UgYSByZXF1ZXN0IHRvXG5cdFx0Ly8gdGhpcyBVUkwgYW55d2F5IGFuZCBiZWluZyBhIDQwNCB3aWxsIG5vdCBodXJ0IHVzIGhlcmUuICBXZSB3cmFwIGFuXG5cdFx0Ly8gaWZyYW1lIHBvaW50aW5nIHRvIHRoZSBmYXZpY29uIGluIGFuIEFjdGl2ZVhPYmplY3QoaHRtbGZpbGUpIG9iamVjdFxuXHRcdC8vIChzZWU6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9hYTc1MjU3NCh2PVZTLjg1KS5hc3B4KVxuXHRcdC8vIHNpbmNlIHRoZSBpZnJhbWUgYWNjZXNzIHJ1bGVzIGFwcGVhciB0byBhbGxvdyBkaXJlY3QgYWNjZXNzIGFuZFxuXHRcdC8vIG1hbmlwdWxhdGlvbiBvZiB0aGUgZG9jdW1lbnQgZWxlbWVudCwgZXZlbiBmb3IgYSA0MDQgcGFnZS4gIFRoaXNcblx0XHQvLyBkb2N1bWVudCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50ICh3aGljaCB3b3VsZFxuXHRcdC8vIGhhdmUgYmVlbiBsaW1pdGVkIHRvIHRoZSBjdXJyZW50IHBhdGgpIHRvIHBlcmZvcm0gI3VzZXJEYXRhIHN0b3JhZ2UuXG5cdFx0dHJ5IHtcblx0XHRcdHN0b3JhZ2VDb250YWluZXIgPSBuZXcgQWN0aXZlWE9iamVjdCgnaHRtbGZpbGUnKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci5vcGVuKClcblx0XHRcdHN0b3JhZ2VDb250YWluZXIud3JpdGUoJzwnK3NjcmlwdFRhZysnPmRvY3VtZW50Lnc9d2luZG93PC8nK3NjcmlwdFRhZysnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+Jylcblx0XHRcdHN0b3JhZ2VDb250YWluZXIuY2xvc2UoKVxuXHRcdFx0c3RvcmFnZU93bmVyID0gc3RvcmFnZUNvbnRhaW5lci53LmZyYW1lc1swXS5kb2N1bWVudFxuXHRcdFx0c3RvcmFnZSA9IHN0b3JhZ2VPd25lci5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0Ly8gc29tZWhvdyBBY3RpdmVYT2JqZWN0IGluc3RhbnRpYXRpb24gZmFpbGVkIChwZXJoYXBzIHNvbWUgc3BlY2lhbFxuXHRcdFx0Ly8gc2VjdXJpdHkgc2V0dGluZ3Mgb3Igb3RoZXJ3c2UpLCBmYWxsIGJhY2sgdG8gcGVyLXBhdGggc3RvcmFnZVxuXHRcdFx0c3RvcmFnZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdFx0c3RvcmFnZU93bmVyID0gZG9jLmJvZHlcblx0XHR9XG5cdFx0dmFyIHdpdGhJRVN0b3JhZ2UgPSBmdW5jdGlvbihzdG9yZUZ1bmN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKVxuXHRcdFx0XHRhcmdzLnVuc2hpZnQoc3RvcmFnZSlcblx0XHRcdFx0Ly8gU2VlIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTA4MSh2PVZTLjg1KS5hc3B4XG5cdFx0XHRcdC8vIGFuZCBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzE0MjQodj1WUy44NSkuYXNweFxuXHRcdFx0XHRzdG9yYWdlT3duZXIuYXBwZW5kQ2hpbGQoc3RvcmFnZSlcblx0XHRcdFx0c3RvcmFnZS5hZGRCZWhhdmlvcignI2RlZmF1bHQjdXNlckRhdGEnKVxuXHRcdFx0XHRzdG9yYWdlLmxvYWQobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHN0b3JlRnVuY3Rpb24uYXBwbHkoc3RvcmUsIGFyZ3MpXG5cdFx0XHRcdHN0b3JhZ2VPd25lci5yZW1vdmVDaGlsZChzdG9yYWdlKVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSW4gSUU3LCBrZXlzIGNhbm5vdCBzdGFydCB3aXRoIGEgZGlnaXQgb3IgY29udGFpbiBjZXJ0YWluIGNoYXJzLlxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy80MFxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy84M1xuXHRcdHZhciBmb3JiaWRkZW5DaGFyc1JlZ2V4ID0gbmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLCBcImdcIilcblx0XHR2YXIgaWVLZXlGaXggPSBmdW5jdGlvbihrZXkpIHtcblx0XHRcdHJldHVybiBrZXkucmVwbGFjZSgvXmQvLCAnX19fJCYnKS5yZXBsYWNlKGZvcmJpZGRlbkNoYXJzUmVnZXgsICdfX18nKVxuXHRcdH1cblx0XHRzdG9yZS5zZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgdmFsKSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRcdHN0b3JhZ2Uuc2V0QXR0cmlidXRlKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdHJldHVybiB2YWxcblx0XHR9KVxuXHRcdHN0b3JlLmdldCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5LCBkZWZhdWx0VmFsKSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHR2YXIgdmFsID0gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoa2V5KSlcblx0XHRcdHJldHVybiAodmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsIDogdmFsKVxuXHRcdH0pXG5cdFx0c3RvcmUucmVtb3ZlID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXkpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGtleSlcblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdH0pXG5cdFx0c3RvcmUuY2xlYXIgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRmb3IgKHZhciBpPWF0dHJpYnV0ZXMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVzW2ldLm5hbWUpXG5cdFx0XHR9XG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmZvckVhY2ggPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IHN0b3JhZ2UuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRcdGZvciAodmFyIGk9MCwgYXR0cjsgYXR0cj1hdHRyaWJ1dGVzW2ldOyArK2kpIHtcblx0XHRcdFx0Y2FsbGJhY2soYXR0ci5uYW1lLCBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEF0dHJpYnV0ZShhdHRyLm5hbWUpKSlcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0dHJ5IHtcblx0XHR2YXIgdGVzdEtleSA9ICdfX3N0b3JlanNfXydcblx0XHRzdG9yZS5zZXQodGVzdEtleSwgdGVzdEtleSlcblx0XHRpZiAoc3RvcmUuZ2V0KHRlc3RLZXkpICE9IHRlc3RLZXkpIHsgc3RvcmUuZGlzYWJsZWQgPSB0cnVlIH1cblx0XHRzdG9yZS5yZW1vdmUodGVzdEtleSlcblx0fSBjYXRjaChlKSB7XG5cdFx0c3RvcmUuZGlzYWJsZWQgPSB0cnVlXG5cdH1cblx0c3RvcmUuZW5hYmxlZCA9ICFzdG9yZS5kaXNhYmxlZFxuXHRcblx0cmV0dXJuIHN0b3JlXG59KCkpXG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU3RyaW5nOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdzdHJpbmcnO1xuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT0gbnVsbDtcbiAgfVxufTtcbiJdfQ==
