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
      map.cursor = "not-allowed";
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
      region.cursor = "not-allowed";
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
      airmass.cursor = "not-allowed";
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
      label.cursor = "not-allowed";
      label.addEventListener("click", function (e) {
        removeSymbol(json);
        stage.removeChild(path);
      });
      path.addChild(label);

      if (dist(first, last) > 10) {
        var _label = IsoPleth.getLabel(json.value, last.x - 10, last.y + (first.y < last.y ? 0 : -24));

        _label.cursor = "not-allowed";

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
      ellipse.cursor = "not-allowed";
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

      shape.cursor = "not-allowed";
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
    value: function showSymbol(stage, json) {
      back.rotation = json.rotation;
      back.scaleX = json.flipH;
      back.scaleY = json.flipV;
    }
  }, {
    key: "getSymbol",
    value: function getSymbol() {
      var symbols = getSymbols();
      if (symbols.length == 0) return {
        type: "transform",
        rotation: 0,
        flipH: 1,
        flipY: 1
      };else {
        var symbol = symbols[0];
        removeSymbol(symbol);
        return symbol;
      }
    }
  }]);

  function Transform(drawsim) {
    _classCallCheck(this, Transform);

    createjs.Ticker.framerate = 5;

    if (edit) {
      document.getElementById("transform").style.visibility = "visible";
      document.getElementById("rotate").addEventListener("click", function () {
        back.rotation = back.rotation < 360 ? back.rotation + 90 : 0;
        var symbol = Transform.getSymbol();
        symbol.rotation = back.rotation;
        addSymbol(symbol);
      });
      document.getElementById("fliph").addEventListener("click", function () {
        back.scaleX = -back.scaleX;
        var symbol = Transform.getSymbol();
        symbol.flipH = back.scaleX;
        addSymbol(symbol);
      });
      document.getElementById("flipv").addEventListener("click", function () {
        back.scaleY = -back.scaleY;
        var symbol = Transform.getSymbol();
        symbol.flipV = back.scaleY;
        addSymbol(symbol);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9naXQvd3hhcHBzL3NyYy9kcmF3c2ltL21haW4uanMiLCIuLi9naXQvd3hhcHBzL3NyYy91dGlscy9heGlzLmpzIiwiLi4vZ2l0L3d4YXBwcy9zcmMvdXRpbHMvZ3JhcGguanMiLCIuLi9naXQvd3hhcHBzL3NyYy91dGlscy9pbmRleC5qcyIsIi4uL2dpdC93eGFwcHMvc3JjL3V0aWxzL2pzb24yLmpzIiwiLi4vZ2l0L3d4YXBwcy9zcmMvdXRpbHMvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvcHVueWNvZGUvcHVueWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZW5jb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwibm9kZV9tb2R1bGVzL3VybC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSSxLQUFLLEdBQUcsc0JBQVo7QUFBQSxJQUF3QixZQUFZLEdBQUcsSUFBSSxlQUFKLENBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCLENBQXVCLFNBQXZCLENBQWlDLENBQWpDLENBQXBCLENBQXZDO0FBRUEsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsS0FBakIsQ0FBWjtBQUNBLElBQUksQ0FBQyxLQUFMLEVBQVksS0FBSyxHQUFHLE1BQU0sQ0FBQyxrQkFBRCxFQUFvQixFQUFwQixDQUFkO0FBQ1osSUFBSSxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBYixDQUFvQixLQUFwQixDQUFYO0FBQ0EsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQWIs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RSxPQUFNLENBQU4sRUFBUztBQUNWLElBQUEsS0FBSyxDQUFDLFFBQU4sR0FBaUIsSUFBakI7QUFDQTs7QUFDRCxFQUFBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLENBQUMsS0FBSyxDQUFDLFFBQXZCO0FBRUEsU0FBTyxLQUFQO0FBQ0EsQ0FwS2lCLEVBQWxCOzs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gXCIuLi91dGlsc1wiICAgXHJcbmltcG9ydCB7VXJsfSBmcm9tIFwidXJsXCIgXHJcbiBcclxubGV0IHN0b3JlID0gZ2V0U3RvcmUoKSwgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSlcclxuXHJcbmxldCBpbWFnZSA9IHNlYXJjaFBhcmFtcy5nZXQoJ2ltZycpXHJcbmlmICghaW1hZ2UpIGltYWdlID0gcHJvbXB0KFwiRW50ZXIgaW1hZ2UgdXJsOlwiLFwiXCIpXHJcbmxldCBiYWNrID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChpbWFnZSlcclxubGV0IGVkaXQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdtb2RlJykgPT0gXCJlZGl0XCJcclxubGV0IHNjYWxlID0gc2VhcmNoUGFyYW1zLmdldCgnc2NhbGUnKSB8fCAxLjBcclxubGV0IHRvb2wgPSBzZWFyY2hQYXJhbXMuZ2V0KCd0b29sJykgfHwgXCJwcmVzc3VyZVwiXHJcbmxldCB3aWR0aCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3cnKSB8fCAyMFxyXG5sZXQgaGVpZ2h0ID0gc2VhcmNoUGFyYW1zLmdldCgnaCcpIHx8IDIwXHJcbmxldCBvcHQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdvcHQnKSB8fCBcImFsbFwiXHJcblxyXG5sZXQgbGluZXR5cGVzID0ge1xyXG5cdGRyeTp7dzoxLGM6XCIjMDAwXCJ9LFxyXG5cdGhpZ2hUOnt3OjEsYzpcIiNGMDBcIn0sXHJcblx0aGlnaFRkOnt3OjEsYzpcIiMwRjBcIn0sXHJcblx0amV0ODUwOnt3OjUsYzpcIiNGMDBcIn0sXHJcblx0amV0MzAwOnt3OjUsYzpcIiM4MDAwODBcIn1cclxufVxyXG5cclxubGV0IGxpbmV0eXBlID0gXCJkcnlcIiBcclxubGV0IGxpbmV0eXBlQnV0dG9uID0gbnVsbFxyXG5cclxuY3JlYXRlanMuTW90aW9uR3VpZGVQbHVnaW4uaW5zdGFsbCgpXHJcblxyXG4vL0xpbmVzIHdpdGggc3ltYm9scyBmb3IgYSBkcnkgbGluZSwgbW9pc3R1cmUgYXhpcywgdGhlcm1hbCByaWRnZSwgbG93IGxldmVsIGpldCBhbmQgdXBwZXIgbGV2ZWwgamV0IFxyXG5cclxuZnVuY3Rpb24gZGlzdChwMSxwMikgeyBcclxuXHRsZXQgZHggPSBwMS54IC0gcDIueCwgZHkgPSBwMS55IC0gcDIueVxyXG5cdHJldHVybiBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcclxufVxyXG5cclxuZnVuY3Rpb24gYW5nbGUocDEsIHAyKSB7XHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDIueCAtIHAxLngpICogMTgwIC8gTWF0aC5QSTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29tcG9uZW50VG9IZXgoYykge1xyXG5cdCAgdmFyIGhleCA9IGMudG9TdHJpbmcoMTYpO1xyXG5cdCAgcmV0dXJuIGhleC5sZW5ndGggPT0gMSA/IFwiMFwiICsgaGV4IDogaGV4O1xyXG5cdH1cclxuXHJcbmZ1bmN0aW9uIHJnYlRvSGV4KHIsIGcsIGIpIHtcclxuICByZXR1cm4gXCIjXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYik7XHJcbn1cclxuXHJcbnZhciBzYXZlcGFybXMgPSBbXTtcclxuXHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZVwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG5cdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHRsZXQgW3N5bWJvbCwgY2JdID0gc2F2ZXBhcm1zXHJcblx0bGV0IGRlc2NfZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjX2VkaXRvclwiKVxyXG5cdHJlbW92ZVN5bWJvbChzeW1ib2wpXHJcblx0c3ltYm9sLmRlc2MgPSBkZXNjX2VkaXRvci52YWx1ZVxyXG5cdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0ZWRpdG9yLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXHJcblx0Y2IodHJ1ZSlcclxufSk7XHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlXCIpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcblx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdGxldCBbc3ltYm9sLCBjYl0gPSBzYXZlcGFybXNcclxuXHRyZW1vdmVTeW1ib2woc3ltYm9sKVxyXG5cdGVkaXRvci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxyXG5cdGNiKGZhbHNlKVxyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBnZXREZXNjKHB0LCBzeW1ib2wsIGNiKSB7XHJcblx0bGV0IGVkaXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yXCIpXHJcblx0bGV0IGRlc2NfZWRpdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjX2VkaXRvclwiKVxyXG5cdGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5jYW52YXNcIilcclxuXHRkZXNjX2VkaXRvci52YWx1ZSA9IHN5bWJvbC5kZXNjXHJcblx0ZWRpdG9yLnN0eWxlLmxlZnQgPSAocHRbMF0gKyBjYW52YXMub2Zmc2V0TGVmdCkgKyBcInB4XCJcclxuXHRlZGl0b3Iuc3R5bGUudG9wID0gKHB0WzFdICsgY2FudmFzLm9mZnNldFRvcCkgKyBcInB4XCJcclxuXHRlZGl0b3Iuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXHJcblx0ZWRpdG9yLmZvY3VzKClcclxuXHRzYXZlcGFybXMgPSBbc3ltYm9sLCBjYl1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TWlkKHB0cykge1xyXG5cdGxldCBbc3RhcnQsIGVuZF0gPSBbcHRzWzBdLCBwdHNbcHRzLmxlbmd0aCAtIDFdXVxyXG5cdGxldCBbbWlkeCwgbWlkeV0gPSBbMCwgMF1cclxuXHRpZiAoc3RhcnQueCA8IGVuZC54KSBtaWR4ID0gc3RhcnQueCArIChlbmQueCAtIHN0YXJ0LngpIC8gMiAtIDIwO1xyXG5cdGVsc2UgbWlkeCA9IGVuZC54ICsgKHN0YXJ0LnggLSBlbmQueCkgLyAyIC0gMjA7IFxyXG5cdGlmIChzdGFydC55IDwgZW5kLnkpIG1pZHkgPSBzdGFydC55ICsgKGVuZC55IC0gc3RhcnQueSkgLyAyO1xyXG5cdGVsc2UgbWlkeSA9IGVuZC55ICsgKHN0YXJ0LnkgLSBlbmQueSkgLyAyO1xyXG5cdHJldHVybiBbbWlkeCwgbWlkeV07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExhYmVsKHBhdGgsIG1pZCwgc3ltYm9sLCBjYikge1xyXG5cdGxldCBkZXNjID0gbmV3IGNyZWF0ZWpzLlRleHQoc3ltYm9sLmRlc2MsXCIxNHB4IEFyaWFsXCIsXCIjMDAwXCIpXHJcblx0ZGVzYy54ID0gbWlkWzBdIFxyXG5cdGRlc2MueSA9IG1pZFsxXVxyXG4gICAgdmFyIHJlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKTtcclxuXHRyZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIndoaXRlXCIpO1xyXG4gICAgcmVjdC5ncmFwaGljcy5kcmF3UmVjdChkZXNjLngsIGRlc2MueSwgZGVzYy5nZXRNZWFzdXJlZFdpZHRoKCksIGRlc2MuZ2V0TWVhc3VyZWRIZWlnaHQoKSk7XHJcbiAgICByZWN0LmdyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgIHJlY3QuY3Vyc29yID0gXCJ0ZXh0XCJcclxuICAgIHBhdGguYWRkQ2hpbGQocmVjdCk7XHJcblx0cGF0aC5hZGRDaGlsZChkZXNjKTtcclxuXHRyZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHRcdGdldERlc2MobWlkLCBzeW1ib2wsIGNiKVxyXG5cdH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFN5bWJvbHMoKSB7XHJcblx0bGV0IHN5bWJvbHMgPSBzdG9yZS5nZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wpXHJcblx0aWYgKCFzeW1ib2xzKSB7XHJcblx0XHRzeW1ib2xzID0ge2NudDogMSwgZGF0YToge319XHJcblx0XHRzdG9yZS5zZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wsIHN5bWJvbHMpXHJcblx0fVxyXG5cdHJldHVybiBzeW1ib2xzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFN5bWJvbChzeW1ib2wpIHtcclxuXHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdHN5bWJvbC5pZCA9IHN5bWJvbHMuY250Kys7XHJcblx0c3ltYm9scy5kYXRhW3N5bWJvbC5pZF0gPSBzeW1ib2xcclxuXHRzdG9yZS5zZXQoaW1hZ2UgKyBcIi5cIiArIHRvb2wsIHN5bWJvbHMpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZVN5bWJvbChzeW1ib2wpIHtcclxuXHRsZXQgc3ltYm9scyA9IGdldFN5bWJvbHMoKVxyXG5cdGlmIChzeW1ib2wuaWQpIGRlbGV0ZSBzeW1ib2xzLmRhdGFbc3ltYm9sLmlkXVxyXG5cdHN0b3JlLnNldChpbWFnZSArIFwiLlwiICsgdG9vbCwgc3ltYm9scylcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3ltYm9scygpIHtcclxuXHRzeW1ib2xzID0ge2NudDogMSwgZGF0YToge319XHJcblx0c3RvcmUuc2V0KGltYWdlICsgXCIuXCIgKyB0b29sLHN5bWJvbHMpXHJcbn1cclxuXHJcbmNsYXNzIFZlY3RvciBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IG1hcCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoanNvbi5pbWcpXHJcblx0XHRtYXAueCA9IGpzb24ucHQueFxyXG5cdFx0bWFwLnkgPSBqc29uLnB0LnlcclxuXHRcdG1hcC5yZWdYID0gMTJcclxuXHRcdG1hcC5yZWdZID0gMTJcclxuICAgIFx0bWFwLnJvdGF0aW9uID0ganNvbi5yb3RcclxuICAgIFx0bWFwLmN1cnNvciA9IFwibm90LWFsbG93ZWRcIlxyXG5cdFx0bWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdG1hcC5zdGFnZS5yZW1vdmVDaGlsZChtYXApXHJcblx0XHR9KVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQobWFwKVxyXG5cdH1cclxuXHRcdFxyXG5cdGNvbnN0cnVjdG9yKHgscm90LGltZyxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSAwXHJcblx0XHR0aGlzLmltZyA9IGltZ1xyXG5cdFx0dGhpcy5yb3QgPSByb3RcclxuXHRcdGxldCBzZWxlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0c2VsZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIiNDQ0NcIikuZHJhd1JvdW5kUmVjdCgwLDAsMjYsMjYsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdHRoaXMuYWRkQ2hpbGQoc2VsZWN0KVxyXG5cdFx0bGV0IG1hcCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoaW1nKVxyXG5cdFx0bWFwLnggPSAxM1xyXG5cdFx0bWFwLnkgPSAxM1xyXG5cdFx0bWFwLnJlZ1ggPSAxMlxyXG5cdFx0bWFwLnJlZ1kgPSAxMlxyXG4gICAgXHRtYXAucm90YXRpb24gPSByb3RcclxuICAgIFx0dGhpcy5zZXRCb3VuZHMoeCwwLDI2LDI2KVxyXG4gICAgXHR0aGlzLmFkZENoaWxkKG1hcClcclxuXHRcdHNlbGVjdC5hbHBoYSA9IDBcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBlID0+IHNlbGVjdC5hbHBoYSA9IDAuNSlcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGUgPT4gc2VsZWN0LmFscGhhID0gMClcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gZHJhd3NpbS50b29sYmFyLnNlbGVjdCh0aGlzKSlcclxuXHR9XHJcblx0XHJcblx0dG9KU09OKHgseSkge1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwidmVjdG9yXCIsIGltZzogdGhpcy5pbWcsIHJvdDogdGhpcy5yb3QsIHB0Ont4OngseTp5fX1cclxuXHR9XHRcdFxyXG59XHJcblxyXG5jbGFzcyBQcmVzc3VyZVJlZ2lvbiBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IHJlZ2lvbiA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0bGV0IHR4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KGpzb24uaGlnaD9cIkhcIjpcIkxcIixcImJvbGQgMjRweCBBcmlhbFwiLGpzb24uaGlnaD9cIiMwMEZcIjpcIiNGMDBcIilcclxuXHRcdHR4dC54ID0ganNvbi5wdC54IC0gMTJcclxuXHRcdHR4dC55ID0ganNvbi5wdC55IC0gMTJcclxuXHRcdGxldCBjaXJjbGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Y2lyY2xlLmdyYXBoaWNzLmJlZ2luRmlsbChqc29uLmhpZ2g/XCIjMEYwXCI6XCIjRkYwXCIpLmRyYXdDaXJjbGUoanNvbi5wdC54LGpzb24ucHQueSwyNCkuZW5kRmlsbCgpXHJcblx0XHRjaXJjbGUuYWxwaGEgPSAwLjVcclxuXHRcdHJlZ2lvbi5hZGRDaGlsZChjaXJjbGUpXHJcblx0XHRyZWdpb24uYWRkQ2hpbGQodHh0KVxyXG5cdFx0cmVnaW9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdHJlZ2lvbi5zdGFnZS5yZW1vdmVDaGlsZChyZWdpb24pXHJcblx0XHR9KVxyXG4gICAgXHRyZWdpb24uY3Vyc29yID0gXCJub3QtYWxsb3dlZFwiXHJcblx0XHRzdGFnZS5hZGRDaGlsZChyZWdpb24pXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKHgsaGlnaCxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLmhpZ2ggPSBoaWdoXHJcblx0XHRsZXQgdHh0ID0gbmV3IGNyZWF0ZWpzLlRleHQoaGlnaD9cIkhcIjpcIkxcIixcImJvbGQgMjRweCBBcmlhbFwiLGhpZ2g/XCIjMDBGXCI6XCIjRjAwXCIpXHJcblx0XHR0eHQueCA9IHggKyAyXHJcblx0XHR0eHQueSA9IDJcclxuXHRcdGxldCBzZWxlY3QgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0c2VsZWN0LmdyYXBoaWNzLmJlZ2luRmlsbChcIiNDQ0NcIikuZHJhd1JvdW5kUmVjdCh4LDAsMjYsMjYsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdHRoaXMuYWRkQ2hpbGQoc2VsZWN0KVxyXG5cdFx0bGV0IGNpcmNsZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRjaXJjbGUuZ3JhcGhpY3MuYmVnaW5GaWxsKGhpZ2g/XCIjMEYwXCI6XCIjRkYwXCIpLmRyYXdDaXJjbGUoeCsxMiwxMiwxMykuZW5kRmlsbCgpXHJcblx0XHRjaXJjbGUuYWxwaGEgPSAwLjNcclxuXHRcdHRoaXMuYWRkQ2hpbGQoY2lyY2xlLHR4dClcclxuICAgIFx0dGhpcy5zZXRCb3VuZHMoeCwwLDI2LDI2KVxyXG5cdFx0c2VsZWN0LmFscGhhID0gMFxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGUgPT4gc2VsZWN0LmFscGhhID0gMC41KVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZSA9PiBzZWxlY3QuYWxwaGEgPSAwKVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBkcmF3c2ltLnRvb2xiYXIuc2VsZWN0KHRoaXMpKVxyXG5cdH1cclxuXHJcblx0dG9KU09OKHgseSkge1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwicmVnaW9uXCIsIGhpZ2g6IHRoaXMuaGlnaCwgcHQ6e3g6eCx5Onl9fVxyXG5cdH1cdFx0XHJcblxyXG5cdGdldExlbmd0aCgpIHsgcmV0dXJuIDIqMzArMiB9XHJcbn1cclxuXHJcbmNsYXNzIFByZXNzdXJlcyBleHRlbmRzIGNyZWF0ZWpzLkNvbnRhaW5lciB7XHJcblx0Y29uc3RydWN0b3IoeCxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSAyXHJcblx0XHRpZiAob3B0ID09IFwiYWxsXCIgfHwgb3B0ID09IFwiYXJyb3dzXCIpXHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcblx0XHRcdFx0bGV0IHYgPSBuZXcgVmVjdG9yKHgsNDUqaSxcImFzc2V0cy9sZWZ0LWFycm93LnBuZ1wiLGRyYXdzaW0pXHJcblx0XHRcdFx0dGhpcy5hZGRDaGlsZCh2KVxyXG5cdFx0XHRcdHggKz0gMzBcclxuXHRcdFx0fVxyXG5cdFx0aWYgKG9wdCA9PSBcImFsbFwiIHx8IG9wdCA9PSBcImhsXCIpIHtcclxuXHRcdFx0dGhpcy5hZGRDaGlsZChuZXcgUHJlc3N1cmVSZWdpb24oeCx0cnVlLGRyYXdzaW0pKVxyXG5cdFx0XHR4ICs9IDMwXHJcblx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IFByZXNzdXJlUmVnaW9uKHgsZmFsc2UsZHJhd3NpbSkpXHJcblx0XHRcdHggKz0gMzBcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Z2V0TGVuZ3RoKCkge1xyXG5cdFx0bGV0IG4gPSBvcHQgPT0gXCJhbGxcIj8xMDpvcHQgPT0gXCJhcnJvd3NcIj84OjJcclxuXHRcdHJldHVybiBuKjMwKzIgXHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBBaXJtYXNzIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSxqc29uKSB7XHJcblx0XHRsZXQgYWlybWFzcyA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0YWlybWFzcy54ID0ganNvbi5wdC54XHJcblx0XHRhaXJtYXNzLnkgPSBqc29uLnB0LnlcclxuXHRcdGxldCBjaXJjbGUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0Y2lyY2xlLmdyYXBoaWNzLmJlZ2luRmlsbChcIiNGRkZcIikuYmVnaW5TdHJva2UoXCIjMDAwXCIpLmRyYXdDaXJjbGUoMTQsMTQsMTQpLmVuZFN0cm9rZSgpXHJcblx0XHRhaXJtYXNzLmFkZENoaWxkKGNpcmNsZSlcclxuXHRcdGxldCB0eHQgPSBuZXcgY3JlYXRlanMuVGV4dChqc29uLm5hbWUsXCIxMnB4IEFyaWFsXCIsXCIjMDAwXCIpXHJcblx0XHR0eHQueCA9IDZcclxuXHRcdHR4dC55ID0gMTBcclxuXHRcdGFpcm1hc3MuYWRkQ2hpbGQodHh0KVxyXG4gICAgXHRhaXJtYXNzLmN1cnNvciA9IFwibm90LWFsbG93ZWRcIlxyXG5cdFx0XHRhaXJtYXNzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKGpzb24pXHJcblx0XHRcdGFpcm1hc3Muc3RhZ2UucmVtb3ZlQ2hpbGQoYWlybWFzcylcclxuXHRcdH0pXHJcbiAgICBcdHN0YWdlLmFkZENoaWxkKGFpcm1hc3MpXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKHgsbmFtZSxkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcblx0XHR0aGlzLnggPSB4XHJcblx0XHR0aGlzLnkgPSAyXHJcblx0XHR0aGlzLm5hbWUgPSBuYW1lXHJcblx0XHRsZXQgY2lyY2xlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGNpcmNsZS5ncmFwaGljcy5iZWdpbkZpbGwoXCIjRkZGXCIpLmJlZ2luU3Ryb2tlKFwiIzAwMFwiKS5kcmF3Q2lyY2xlKDE0LDE0LDE0KS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5hZGRDaGlsZChjaXJjbGUpXHJcblx0XHRsZXQgdHh0ID0gbmV3IGNyZWF0ZWpzLlRleHQobmFtZSxcIjEycHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRcdHR4dC54ID0gNlxyXG5cdFx0dHh0LnkgPSAxMFxyXG5cdFx0dGhpcy5hZGRDaGlsZCh0eHQpXHJcblx0XHRsZXQgc2VsZWN0ID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdHNlbGVjdC5ncmFwaGljcy5iZWdpbkZpbGwoXCIjQ0NDXCIpLmRyYXdDaXJjbGUoMTQsMTQsMTQpLmVuZFN0cm9rZSgpXHJcblx0XHR0aGlzLmFkZENoaWxkKHNlbGVjdClcclxuXHRcdHNlbGVjdC5hbHBoYSA9IDBcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBlID0+IHtcclxuXHRcdFx0c2VsZWN0LmFscGhhID0gMC41XHJcblx0XHR9KVxyXG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZSA9PiB7XHJcblx0XHRcdHNlbGVjdC5hbHBoYSA9IDBcclxuXHRcdH0pXHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0ZHJhd3NpbS50b29sYmFyLnNlbGVjdCh0aGlzKVxyXG5cdFx0fSlcclxuXHR9XHJcblx0XHJcblx0dG9KU09OKHgseSkge1xyXG5cdFx0cmV0dXJuIHt0eXBlOlwiYWlybWFzc1wiLCBuYW1lOiB0aGlzLm5hbWUsIHB0Ont4OngseTp5fX1cclxuXHR9XHRcdFxyXG59XHJcblxyXG5jbGFzcyBBaXJtYXNzZXMgZXh0ZW5kcyBjcmVhdGVqcy5Db250YWluZXIge1xyXG5cdGNvbnN0cnVjdG9yKHgsdG9vbGJhcikge1xyXG5cdFx0c3VwZXIoKVxyXG5cdFx0bGV0IG1hc3NlcyA9IFtcImNQXCIsXCJtUFwiLFwiY1RcIixcIm1UXCIsXCJjRVwiLFwibUVcIixcImNBXCIsXCJtQVwiXVxyXG5cdFx0bWFzc2VzLmZvckVhY2gobmFtZSA9PiB7XHJcblx0XHRcdHRoaXMuYWRkQ2hpbGQobmV3IEFpcm1hc3MoeCxuYW1lLHRvb2xiYXIpKVxyXG5cdFx0XHR4ICs9IDMwXHJcblx0XHR9KVxyXG5cdH1cclxuXHRcclxuXHRnZXRMZW5ndGgoKSB7IHJldHVybiA4KjMwKzIgfVxyXG59XHJcblxyXG5jbGFzcyBJc29QbGV0aCB7XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IHB0cyA9IGpzb24ucHRzXHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHQgICAgc2hhcGUuZ3JhcGhpY3MuYmVnaW5TdHJva2UoXCIjMDBGXCIpXHJcblx0XHRsZXQgb2xkWCA9IHB0c1swXS54XHJcblx0XHRsZXQgb2xkWSA9IHB0c1swXS55XHJcblx0XHRsZXQgb2xkTWlkWCA9IG9sZFhcclxuXHRcdGxldCBvbGRNaWRZID0gb2xkWVxyXG5cdCAgICBqc29uLnB0cy5mb3JFYWNoKHB0ID0+IHtcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KG9sZFggKyBwdC54ID4+IDEsIG9sZFkrcHQueSA+PiAxKVxyXG5cdCAgICAgICAgc2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoNCkubW92ZVRvKG1pZFBvaW50LngsIG1pZFBvaW50LnkpXHJcblx0ICAgICAgICBzaGFwZS5ncmFwaGljcy5jdXJ2ZVRvKG9sZFgsIG9sZFksIG9sZE1pZFgsIG9sZE1pZFkpXHJcblx0ICAgICAgICBvbGRYID0gcHQueFxyXG5cdCAgICAgICAgb2xkWSA9IHB0LnlcclxuXHQgICAgICAgIG9sZE1pZFggPSBtaWRQb2ludC54XHJcblx0ICAgICAgICBvbGRNaWRZID0gbWlkUG9pbnQueVxyXG5cdCAgICB9KVxyXG5cdFx0cGF0aC5hZGRDaGlsZChzaGFwZSlcclxuXHRcdGxldCBmaXJzdCA9IHB0c1swXSwgbGFzdCA9IHB0c1twdHMubGVuZ3RoLTFdXHJcblx0XHRsZXQgbGFiZWwgPSBJc29QbGV0aC5nZXRMYWJlbChqc29uLnZhbHVlLGZpcnN0LnggLSAxMCxmaXJzdC55ICsgKGZpcnN0LnkgPCBsYXN0Lnk/IC0yNDogMCkpXHJcbiAgICBcdGxhYmVsLmN1cnNvciA9IFwibm90LWFsbG93ZWRcIlxyXG5cdFx0bGFiZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0c3RhZ2UucmVtb3ZlQ2hpbGQocGF0aClcclxuXHRcdH0pXHJcblx0XHRwYXRoLmFkZENoaWxkKGxhYmVsKVxyXG5cdFx0aWYgKGRpc3QoZmlyc3QsbGFzdCkgPiAxMCkge1xyXG5cdFx0XHRsZXQgbGFiZWwgPSBJc29QbGV0aC5nZXRMYWJlbChqc29uLnZhbHVlLGxhc3QueCAtIDEwLGxhc3QueSArIChmaXJzdC55IDwgbGFzdC55PyAwIDogLTI0KSlcclxuXHRcdFx0bGFiZWwuY3Vyc29yID0gXCJub3QtYWxsb3dlZFwiXHJcblx0XHRcdGxhYmVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChwYXRoKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHRwYXRoLmFkZENoaWxkKGxhYmVsKVxyXG5cdFx0fVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQocGF0aClcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGdldExhYmVsKG5hbWUseCx5KSB7XHJcblx0XHRsZXQgbGFiZWwgPSBuZXcgY3JlYXRlanMuQ29udGFpbmVyKClcclxuXHRcdGxldCB0eHQgPSBuZXcgY3JlYXRlanMuVGV4dChuYW1lLFwiYm9sZCAyNHB4IEFyaWFsXCIsXCIjMDBGXCIpXHJcblx0XHR0eHQueCA9IHhcclxuXHRcdHR4dC55ID0geVxyXG5cdFx0bGV0IGNpcmNsZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRjaXJjbGUuZ3JhcGhpY3MuYmVnaW5GaWxsKFwiI0ZGRlwiKS5kcmF3Q2lyY2xlKHggKyAxMix5ICsgMTIsMjApLmVuZEZpbGwoKVxyXG5cdFx0bGFiZWwuYWRkQ2hpbGQoY2lyY2xlKVxyXG5cdFx0bGFiZWwuYWRkQ2hpbGQodHh0KVxyXG5cdFx0cmV0dXJuIGxhYmVsXHJcblx0fVxyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKGRyYXdzaW0pIHtcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSAxMFxyXG5cdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vkb3duXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRTaGFwZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHQgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3MuYmVnaW5TdHJva2UoXCIjMDBGXCIpXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0ICAgIHRoaXMub2xkWCA9IHRoaXMub2xkTWlkWCA9IGUuc3RhZ2VYXHJcblx0XHQgICAgdGhpcy5vbGRZID0gdGhpcy5vbGRNaWRZID0gZS5zdGFnZVlcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSB0cnVlXHJcblx0XHRcdHRoaXMucHRzID0gW11cclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZW1vdmVcIiwgZSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLm1vdXNlRG93biA9PSBmYWxzZSkgcmV0dXJuXHJcblx0ICAgICAgICB0aGlzLnB0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KGUuc3RhZ2VYLCBlLnN0YWdlWSlcclxuXHRcdFx0dGhpcy5wdHMgPSB0aGlzLnB0cy5jb25jYXQoe3g6ZS5zdGFnZVgseTplLnN0YWdlWX0pXHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludCh0aGlzLm9sZFggKyB0aGlzLnB0LnggPj4gMSwgdGhpcy5vbGRZK3RoaXMucHQueSA+PiAxKVxyXG5cdCAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoNCkubW92ZVRvKG1pZFBvaW50LngsIG1pZFBvaW50LnkpXHJcblx0ICAgICAgICB0aGlzLmN1cnJlbnRTaGFwZS5ncmFwaGljcy5jdXJ2ZVRvKHRoaXMub2xkWCwgdGhpcy5vbGRZLCB0aGlzLm9sZE1pZFgsIHRoaXMub2xkTWlkWSlcclxuXHQgICAgICAgIHRoaXMub2xkWCA9IHRoaXMucHQueFxyXG5cdCAgICAgICAgdGhpcy5vbGRZID0gdGhpcy5wdC55XHJcblx0ICAgICAgICB0aGlzLm9sZE1pZFggPSBtaWRQb2ludC54XHJcblx0ICAgICAgICB0aGlzLm9sZE1pZFkgPSBtaWRQb2ludC55XHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2V1cFwiLCBlID0+IHtcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRTaGFwZSlcclxuXHRcdFx0aWYgKHRoaXMucHRzLmxlbmd0aCA8IDMpIHJldHVyblxyXG5cdFx0XHRsZXQgdmFsdWUgPSBwcm9tcHQoXCJFbnRlciB2YWx1ZTpcIiwxKVxyXG5cdFx0XHRpZiAodmFsdWUpIHtcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0ge3R5cGU6XCJpc29wbGV0aFwiLHZhbHVlOiB2YWx1ZSwgcHRzOiB0aGlzLnB0c31cclxuXHRcdFx0XHRJc29QbGV0aC5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLHN5bWJvbClcclxuXHRcdFx0XHRhZGRTeW1ib2woc3ltYm9sKVxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgTGluZSB7XHJcblx0c3RhdGljIGdldExpbmVTaGFwZShsdCkge1xyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHQgICAgc2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUobHQudykuYmVnaW5TdHJva2UobHQuYylcclxuXHQgICAgcmV0dXJuIHNoYXBlXHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBzZXRCdXR0b24oYnV0dG9uLGNvbG9yKSB7XHJcblx0XHRsZXQgYiA9IGJ1dHRvbi5nZXRDaGlsZEF0KDApXHJcblx0XHRsZXQgYm9yZGVyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGJvcmRlci54ID0gYi54XHJcblx0XHRib3JkZXIuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoMSkuYmVnaW5GaWxsKGNvbG9yKS5iZWdpblN0cm9rZShcIiNBQUFcIikuZHJhd1JvdW5kUmVjdCgwLDIsNjIsMTgsMiwyLDIsMikuZW5kU3Ryb2tlKClcclxuXHRcdGJ1dHRvbi5yZW1vdmVDaGlsZEF0KDApXHJcblx0XHRidXR0b24uYWRkQ2hpbGRBdChib3JkZXIsMClcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGdldEJ1dHRvbih4LG5hbWUpIHtcclxuXHRcdGxldCBsdCA9IGxpbmV0eXBlc1tuYW1lXVxyXG5cdFx0bGV0IGJ1dHRvbiA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0YnV0dG9uLmN1cnNvciA9IFwicG9pbnRlclwiXHJcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsZSA9PiB7XHJcblx0XHRcdGlmIChuYW1lID09IGxpbmV0eXBlKSByZXR1cm5cclxuXHRcdFx0aWYgKGxpbmV0eXBlQnV0dG9uKSBMaW5lLnNldEJ1dHRvbihsaW5ldHlwZUJ1dHRvbixcIiNGRkZcIilcclxuXHRcdFx0TGluZS5zZXRCdXR0b24oYnV0dG9uLFwiI0VFRVwiKVxyXG5cdFx0XHRsaW5ldHlwZSA9IG5hbWVcclxuXHRcdFx0bGluZXR5cGVCdXR0b24gPSBidXR0b25cdFx0XHRcclxuXHRcdH0pXHJcblx0XHRsZXQgYm9yZGVyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGJvcmRlci5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgxKS5iZWdpbkZpbGwobmFtZSA9PSBsaW5ldHlwZT9cIiNFRUVcIjpcIiNGRkZcIikuYmVnaW5TdHJva2UoXCIjQUFBXCIpLmRyYXdSb3VuZFJlY3QoMCwyLDYyLDE4LDIsMiwyLDIpLmVuZFN0cm9rZSgpXHJcblx0XHRpZiAobmFtZSA9PSBsaW5ldHlwZSkgbGluZXR5cGVCdXR0b24gPSBidXR0b25cclxuXHRcdGJvcmRlci54ID0geFxyXG5cdFx0bGV0IHR4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KG5hbWUsXCJib2xkIDEycHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRcdHR4dC54ID0geCs1XHJcblx0XHR0eHQueSA9IDVcclxuXHRcdGxldCBsaW5lID0gTGluZS5nZXRMaW5lU2hhcGUobHQpXHJcblx0XHRsZXQgbGVmdCA9IHggKyB0eHQuZ2V0Qm91bmRzKCkud2lkdGgrMTBcclxuXHRcdGxpbmUuZ3JhcGhpY3MubW92ZVRvKGxlZnQsMTApLmxpbmVUbyhsZWZ0KzE1LDEwKS5lbmRTdHJva2UoKVxyXG5cdFx0YnV0dG9uLmFkZENoaWxkKGJvcmRlcix0eHQsbGluZSlcclxuXHRcdHJldHVybiBidXR0b25cclxuXHR9XHJcblx0XHJcblx0c3RhdGljIHNob3dTeW1ib2woc3RhZ2UsanNvbikge1xyXG5cdFx0bGV0IHB0cyA9IGpzb24ucHRzXHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0cGF0aC5uYW1lID0ganNvbi5sdHlwZVxyXG5cdFx0bGV0IHNoYXBlID0gTGluZS5nZXRMaW5lU2hhcGUobGluZXR5cGVzW2pzb24ubHR5cGVdKVxyXG5cdFx0bGV0IG9sZFggPSBwdHNbMF0ueFxyXG5cdFx0bGV0IG9sZFkgPSBwdHNbMF0ueVxyXG5cdFx0bGV0IG9sZE1pZFggPSBvbGRYXHJcblx0XHRsZXQgb2xkTWlkWSA9IG9sZFlcclxuXHQgICAganNvbi5wdHMuZm9yRWFjaChwdCA9PiB7XHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludChvbGRYICsgcHQueCA+PiAxLCBvbGRZK3B0LnkgPj4gMSlcclxuXHQgICAgICAgIHNoYXBlLmdyYXBoaWNzLm1vdmVUbyhtaWRQb2ludC54LCBtaWRQb2ludC55KVxyXG5cdCAgICAgICAgc2hhcGUuZ3JhcGhpY3MuY3VydmVUbyhvbGRYLCBvbGRZLCBvbGRNaWRYLCBvbGRNaWRZKVxyXG5cdCAgICAgICAgb2xkWCA9IHB0LnhcclxuXHQgICAgICAgIG9sZFkgPSBwdC55XHJcblx0ICAgICAgICBvbGRNaWRYID0gbWlkUG9pbnQueFxyXG5cdCAgICAgICAgb2xkTWlkWSA9IG1pZFBvaW50LnlcclxuXHQgICAgfSlcclxuXHQgICAgcGF0aC5hZGRDaGlsZChzaGFwZSlcclxuXHQgICAgc3RhZ2UuYWRkQ2hpbGQocGF0aClcclxuXHR9XHJcblx0XHJcblx0Y29uc3RydWN0b3IoZHJhd3NpbSkge1xyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmZyYW1lcmF0ZSA9IDEwXHJcblx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRsZXQgeCA9IDVcclxuXHRcdGZvciAobGV0IGtleSBpbiBsaW5ldHlwZXMpIHtcclxuXHRcdFx0bGV0IGIgPSBMaW5lLmdldEJ1dHRvbih4LGtleSlcclxuXHRcdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkQ2hpbGQoYilcclxuXHRcdFx0eCArPSA2NVxyXG5cdFx0fVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vkb3duXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRTaGFwZSA9IExpbmUuZ2V0TGluZVNoYXBlKGxpbmV0eXBlc1tsaW5ldHlwZV0pXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0ICAgIHRoaXMub2xkWCA9IHRoaXMub2xkTWlkWCA9IGUuc3RhZ2VYXHJcblx0XHQgICAgdGhpcy5vbGRZID0gdGhpcy5vbGRNaWRZID0gZS5zdGFnZVlcclxuXHRcdFx0dGhpcy5tb3VzZURvd24gPSB0cnVlXHJcblx0XHRcdHRoaXMucHRzID0gW11cclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZW1vdmVcIiwgZSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLm1vdXNlRG93biA9PSBmYWxzZSkgcmV0dXJuXHJcblx0ICAgICAgICB0aGlzLnB0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KGUuc3RhZ2VYLCBlLnN0YWdlWSlcclxuXHRcdFx0dGhpcy5wdHMgPSB0aGlzLnB0cy5jb25jYXQoe3g6ZS5zdGFnZVgseTplLnN0YWdlWX0pXHJcblx0XHRcdGxldCBtaWRQb2ludCA9IG5ldyBjcmVhdGVqcy5Qb2ludCh0aGlzLm9sZFggKyB0aGlzLnB0LnggPj4gMSwgdGhpcy5vbGRZK3RoaXMucHQueSA+PiAxKVxyXG5cdCAgICAgICAgdGhpcy5jdXJyZW50U2hhcGUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUobGluZXR5cGVzW2xpbmV0eXBlXS53KS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHRoaXMuY3VycmVudFNoYXBlLmdyYXBoaWNzLmN1cnZlVG8odGhpcy5vbGRYLCB0aGlzLm9sZFksIHRoaXMub2xkTWlkWCwgdGhpcy5vbGRNaWRZKVxyXG5cdCAgICAgICAgdGhpcy5vbGRYID0gdGhpcy5wdC54XHJcblx0ICAgICAgICB0aGlzLm9sZFkgPSB0aGlzLnB0LnlcclxuXHQgICAgICAgIHRoaXMub2xkTWlkWCA9IG1pZFBvaW50LnhcclxuXHQgICAgICAgIHRoaXMub2xkTWlkWSA9IG1pZFBvaW50LnlcclxuXHRcdH0pXHJcblx0XHRkcmF3c2ltLm1haW5zdGFnZS5hZGRFdmVudExpc3RlbmVyKFwic3RhZ2Vtb3VzZXVwXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IGZhbHNlXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudFNoYXBlKVxyXG5cdFx0XHRpZiAodGhpcy5wdHMubGVuZ3RoIDwgMykgcmV0dXJuXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLnJlbW92ZUNoaWxkKGRyYXdzaW0ubWFpbnN0YWdlLmdldENoaWxkQnlOYW1lKGxpbmV0eXBlKSlcclxuXHRcdFx0Z2V0U3ltYm9scygpLmZvckVhY2gocyA9PiB7XHJcblx0XHRcdFx0aWYgKHMubHR5cGUgPT0gbGluZXR5cGUpIHJlbW92ZVN5bWJvbChzKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHRsZXQgc3ltYm9sID0ge3R5cGU6XCJsaW5lXCIsbHR5cGU6IGxpbmV0eXBlLCBwdHM6IHRoaXMucHRzfVxyXG5cdFx0XHRMaW5lLnNob3dTeW1ib2woZHJhd3NpbS5tYWluc3RhZ2Usc3ltYm9sKVxyXG5cdFx0XHRhZGRTeW1ib2woc3ltYm9sKVx0XHRcdFxyXG5cdFx0fSlcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEVsbGlwc2UgZXh0ZW5kcyBjcmVhdGVqcy5Db250YWluZXIge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLGpzb24pIHtcclxuXHRcdGxldCBlbGxpcHNlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGVsbGlwc2UuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUoMikuYmVnaW5GaWxsKFwiI0ZGRlwiKS5iZWdpblN0cm9rZShcIiNGMDBcIikuZHJhd0VsbGlwc2UoTWF0aC5yb3VuZChqc29uLnB0LngtanNvbi53LzIpLE1hdGgucm91bmQoanNvbi5wdC55LWpzb24uaC8yKSxNYXRoLnJvdW5kKGpzb24udyksTWF0aC5yb3VuZChqc29uLmgpKS5lbmRTdHJva2UoKVxyXG5cdFx0ZWxsaXBzZS5hbHBoYSA9IDAuNVxyXG4gICAgXHRlbGxpcHNlLmN1cnNvciA9IFwibm90LWFsbG93ZWRcIlxyXG5cdFx0ZWxsaXBzZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcblx0XHRcdHJlbW92ZVN5bWJvbChqc29uKVxyXG5cdFx0XHRzdGFnZS5yZW1vdmVDaGlsZChlbGxpcHNlKVxyXG5cdFx0fSlcclxuICAgIFx0c3RhZ2UuYWRkQ2hpbGQoZWxsaXBzZSlcclxuXHR9XHJcblx0XHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRzdXBlcigpXHJcbiAgICBcdGJhY2suY3Vyc29yID0gXCJwb2ludGVyXCJcclxuXHRcdGJhY2suYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRsZXQgc3ltYm9sID0gdGhpcy50b0pTT04oZS5zdGFnZVgsZS5zdGFnZVkpXHJcblx0XHRcdGFkZFN5bWJvbChzeW1ib2wpXHJcblx0XHRcdEVsbGlwc2Uuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSxzeW1ib2wpXHJcblx0XHR9KVxyXG5cdH1cclxuXHRcclxuXHR0b0pTT04oeCx5KSB7XHJcblx0XHRyZXR1cm4ge3R5cGU6XCJlbGxpcHNlXCIsIGV4OiBleCwgdzp3aWR0aCwgaDpoZWlnaHQsIHB0Ont4OngseTp5fX1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEZpZWxkIHtcclxuXHRzdGF0aWMgc2hvd1N5bWJvbChzdGFnZSwganNvbikge1xyXG5cdFx0bGV0IHB0cyA9IGpzb24ucHRzXHJcblx0ICAgIGlmIChwdHMubGVuZ3RoID09IDApIHJldHVyblxyXG5cdFx0bGV0IHNoYXBlID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGxldCBvbGRYID0gcHRzWzBdLnggXHJcblx0XHRsZXQgb2xkWSA9IHB0c1swXS55XHJcblx0XHRsZXQgb2xkTWlkWCA9IG9sZFhcclxuXHRcdGxldCBvbGRNaWRZID0gb2xkWVxyXG5cdFx0dGhpcy5jb2xvciA9IGpzb24uY29sb3I7XHJcblx0ICAgIHNoYXBlLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpO1xyXG5cdCAgICBqc29uLnB0cy5mb3JFYWNoKHB0ID0+IHtcclxuXHRcdFx0bGV0IG1pZFBvaW50ID0gbmV3IGNyZWF0ZWpzLlBvaW50KG9sZFggKyBwdC54ID4+IDEsIG9sZFkgKyBwdC55ID4+IDEpXHJcblx0ICAgICAgICBzaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgyKS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHNoYXBlLmdyYXBoaWNzLmN1cnZlVG8ob2xkWCwgb2xkWSwgb2xkTWlkWCwgb2xkTWlkWSlcclxuXHQgICAgICAgIG9sZFggPSBwdC54XHJcblx0ICAgICAgICBvbGRZID0gcHQueVxyXG5cdCAgICAgICAgb2xkTWlkWCA9IG1pZFBvaW50LnhcclxuXHQgICAgICAgIG9sZE1pZFkgPSBtaWRQb2ludC55XHJcblx0ICAgIH0pXHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0cGF0aC5hZGRDaGlsZChzaGFwZSlcclxuXHQgICAgaWYgKChvcHQgPT0gJ2hlYWQnIHx8IG9wdCA9PSBcImNvbG9yaGVhZFwiKSAmJiBwdHMubGVuZ3RoID4gNCkge1xyXG5cdFx0ICAgIHBhdGguYWRkQ2hpbGQoRmllbGQuZHJhd0hlYWQocHRzLCBqc29uLmNvbG9yKSlcclxuXHRcdCAgICBhZGRMYWJlbChwYXRoLCBnZXRNaWQocHRzKSwganNvbiwgZnVuY3Rpb24oa2VlcCkge1xyXG5cdCAgICBcdFx0ZHJhd3NpbS5tYWluc3RhZ2UucmVtb3ZlQ2hpbGQocGF0aClcclxuXHQgICAgXHRcdGlmIChrZWVwKSBGaWVsZC5zaG93U3ltYm9sKGRyYXdzaW0ubWFpbnN0YWdlLCBqc29uKVx0XHQgICAgXHRcclxuXHRcdCAgICB9KVxyXG5cdCAgICB9XHJcbiAgICBcdHNoYXBlLmN1cnNvciA9IFwibm90LWFsbG93ZWRcIlxyXG4gICAgXHRzdGFnZS5hZGRDaGlsZChwYXRoKVxyXG5cdFx0c2hhcGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRyZW1vdmVTeW1ib2woanNvbilcclxuXHRcdFx0c3RhZ2UucmVtb3ZlQ2hpbGQocGF0aClcclxuXHRcdH0pXHJcblx0XHRyZXR1cm4gcGF0aFxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgZHJhd0hlYWQocHRzLCBjb2xvcikge1xyXG4gICAgXHRsZXQgbGFzdHB0ID0gcHRzW3B0cy5sZW5ndGgtNl1cclxuICAgIFx0bGV0IGVuZHB0ID0gcHRzW3B0cy5sZW5ndGgtMV1cclxuICAgIFx0bGV0IGhlYWQgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdCAgICBoZWFkLmdyYXBoaWNzLmYoY29sb3IpLnNldFN0cm9rZVN0eWxlKDQpLmJlZ2luU3Ryb2tlKGNvbG9yKS5tdCg0LDApLmx0KC00LC00KS5sdCgtNCw0KS5sdCg0LDApXHJcblx0ICAgIGhlYWQueCA9IGVuZHB0LnhcclxuXHQgICAgaGVhZC55ID0gZW5kcHQueVxyXG5cdCAgICBoZWFkLnJvdGF0aW9uID0gYW5nbGUobGFzdHB0LGVuZHB0KVxyXG5cdCAgICByZXR1cm4gaGVhZFxyXG5cdH1cclxuXHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRjcmVhdGVqcy5UaWNrZXIuZnJhbWVyYXRlID0gNVxyXG5cdFx0dGhpcy5tb3VzZURvd24gPSBmYWxzZVxyXG5cdFx0dGhpcy53ID0gMVxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVcIikuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNlZG93blwiLCBlID0+IHtcclxuXHRcdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yXCIpLnN0eWxlLnZpc2liaWxpdHkgPT0gXCJ2aXNpYmxlXCIpIHJldHVybjtcclxuXHRcdFx0dGhpcy5zaGFwZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKHRoaXMuc2hhcGUpXHJcblx0XHQgICAgdGhpcy5vbGRYID0gdGhpcy5vbGRNaWRYID0gZS5zdGFnZVhcclxuXHRcdCAgICB0aGlzLm9sZFkgPSB0aGlzLm9sZE1pZFkgPSBlLnN0YWdlWVxyXG5cdFx0XHR0aGlzLm1vdXNlRG93biA9IHRydWVcclxuXHRcdFx0dGhpcy5wdHMgPSBbXVxyXG5cdFx0XHR0aGlzLmNvbG9yID0gXCIjMDAwXCJcclxuXHRcdFx0aWYgKG9wdCA9PSBcImNvbG9yaGVhZFwiKSB7XHJcblx0XHRcdFx0dmFyIGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbmNhbnZhc1wiKS5nZXRDb250ZXh0KFwiMmRcIilcclxuXHRcdFx0ICAgIHZhciBkYXRhID0gY3R4LmdldEltYWdlRGF0YSh0aGlzLm9sZFgsIHRoaXMub2xkWSwgMSwgMSkuZGF0YVxyXG5cdFx0XHQgICAgdGhpcy5jb2xvciA9IHJnYlRvSGV4KGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pXHJcblx0XHRcdH1cclxuXHRcdCAgICB0aGlzLnNoYXBlLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpXHJcblx0XHR9KVxyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcInN0YWdlbW91c2Vtb3ZlXCIsIGUgPT4ge1xyXG5cdFx0XHRpZiAodGhpcy5tb3VzZURvd24gPT0gZmFsc2UpIHJldHVyblxyXG5cdCAgICAgICAgdGhpcy5wdCA9IG5ldyBjcmVhdGVqcy5Qb2ludChlLnN0YWdlWCwgZS5zdGFnZVkpXHJcblx0XHRcdHRoaXMucHRzID0gdGhpcy5wdHMuY29uY2F0KHt4OmUuc3RhZ2VYLHk6ZS5zdGFnZVl9KVxyXG5cdFx0XHRsZXQgbWlkUG9pbnQgPSBuZXcgY3JlYXRlanMuUG9pbnQodGhpcy5vbGRYICsgdGhpcy5wdC54ID4+IDEsIHRoaXMub2xkWSArIHRoaXMucHQueSA+PiAxKVxyXG5cdCAgICAgICAgdGhpcy5zaGFwZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgyKS5tb3ZlVG8obWlkUG9pbnQueCwgbWlkUG9pbnQueSlcclxuXHQgICAgICAgIHRoaXMuc2hhcGUuZ3JhcGhpY3MuY3VydmVUbyh0aGlzLm9sZFgsIHRoaXMub2xkWSwgdGhpcy5vbGRNaWRYLCB0aGlzLm9sZE1pZFkpXHJcblx0ICAgICAgICB0aGlzLm9sZFggPSB0aGlzLnB0LnhcclxuXHQgICAgICAgIHRoaXMub2xkWSA9IHRoaXMucHQueVxyXG5cdCAgICAgICAgdGhpcy5vbGRNaWRYID0gbWlkUG9pbnQueFxyXG5cdCAgICAgICAgdGhpcy5vbGRNaWRZID0gbWlkUG9pbnQueVxyXG5cdFx0fSlcclxuXHRcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJzdGFnZW1vdXNldXBcIiwgZSA9PiB7XHJcblx0XHRcdHRoaXMubW91c2VEb3duID0gZmFsc2VcclxuXHRcdFx0aWYgKHRoaXMucHRzLmxlbmd0aCA9PSAwKSByZXR1cm5cclxuXHRcdFx0bGV0IHN5bWJvbCA9IHt0eXBlOlwiZmllbGRcIiwgcHRzOiB0aGlzLnB0cywgY29sb3I6IHRoaXMuY29sb3IsIGRlc2M6IFwiXCJ9XHJcblx0XHQgICAgaWYgKChvcHQgPT0gJ2hlYWQnIHx8IG9wdCA9PSBcImNvbG9yaGVhZFwiKSAmJiB0aGlzLnB0cy5sZW5ndGggPiA0KSB7XHJcblx0XHRcdFx0bGV0IHRoYXQgPSB0aGlzO1xyXG5cdFx0ICAgIFx0bGV0IGhlYWQgPSBGaWVsZC5kcmF3SGVhZCh0aGlzLnB0cywgdGhpcy5jb2xvcilcclxuXHRcdCAgICBcdGRyYXdzaW0ubWFpbnN0YWdlLmFkZENoaWxkKGhlYWQpXHJcblx0XHQgICAgXHRnZXREZXNjKGdldE1pZCh0aGlzLnB0cyksIHN5bWJvbCwgZnVuY3Rpb24oa2VlcCkge1xyXG5cdFx0ICAgIFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZCh0aGF0LnNoYXBlKVxyXG5cdFx0ICAgIFx0XHRkcmF3c2ltLm1haW5zdGFnZS5yZW1vdmVDaGlsZChoZWFkKVxyXG5cdFx0ICAgIFx0XHRpZiAoa2VlcCkgRmllbGQuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSwgc3ltYm9sKVxyXG5cdFx0ICAgIFx0fSk7XHJcblx0XHQgICAgfVxyXG5cdFx0fSlcclxuXHR9IFxyXG59XHJcblxyXG5jbGFzcyBUcmFuc2Zvcm0ge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLCBqc29uKSB7XHJcblx0XHRiYWNrLnJvdGF0aW9uID0ganNvbi5yb3RhdGlvbjtcclxuXHRcdGJhY2suc2NhbGVYID0ganNvbi5mbGlwSDtcclxuXHRcdGJhY2suc2NhbGVZID0ganNvbi5mbGlwVjtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGdldFN5bWJvbCgpIHtcclxuXHRcdGxldCBzeW1ib2xzID0gZ2V0U3ltYm9scygpO1xyXG5cdFx0aWYgKHN5bWJvbHMubGVuZ3RoID09IDApIHJldHVybiB7dHlwZTpcInRyYW5zZm9ybVwiLCByb3RhdGlvbjogMCwgZmxpcEg6IDEsIGZsaXBZOiAxfTtcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRsZXQgc3ltYm9sID0gc3ltYm9sc1swXTtcclxuXHRcdFx0cmVtb3ZlU3ltYm9sKHN5bWJvbCk7XHJcblx0XHRcdHJldHVybiBzeW1ib2w7XHJcblx0XHR9XHRcdFxyXG5cdH1cclxuXHRcclxuXHRjb25zdHJ1Y3RvcihkcmF3c2ltKSB7XHJcblx0XHRjcmVhdGVqcy5UaWNrZXIuZnJhbWVyYXRlID0gNVxyXG5cdFx0aWYgKGVkaXQpIHtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0cmFuc2Zvcm1cIikuc3R5bGUudmlzaWJpbGl0eT1cInZpc2libGVcIjtcclxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb3RhdGVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGJhY2sucm90YXRpb24gPSBiYWNrLnJvdGF0aW9uIDwgMzYwID8gYmFjay5yb3RhdGlvbiArIDkwIDogMDtcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0gVHJhbnNmb3JtLmdldFN5bWJvbCgpO1xyXG5cdFx0XHRcdHN5bWJvbC5yb3RhdGlvbiA9IGJhY2sucm90YXRpb247XHJcblx0XHRcdFx0YWRkU3ltYm9sKHN5bWJvbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZsaXBoXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRiYWNrLnNjYWxlWCA9IC1iYWNrLnNjYWxlWDtcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0gVHJhbnNmb3JtLmdldFN5bWJvbCgpO1xyXG5cdFx0XHRcdHN5bWJvbC5mbGlwSCA9IGJhY2suc2NhbGVYO1xyXG5cdFx0XHRcdGFkZFN5bWJvbChzeW1ib2wpO1x0XHRcdFx0XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZsaXB2XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRiYWNrLnNjYWxlWSA9IC1iYWNrLnNjYWxlWTtcclxuXHRcdFx0XHRsZXQgc3ltYm9sID0gVHJhbnNmb3JtLmdldFN5bWJvbCgpO1xyXG5cdFx0XHRcdHN5bWJvbC5mbGlwViA9IGJhY2suc2NhbGVZO1xyXG5cdFx0XHRcdGFkZFN5bWJvbChzeW1ib2wpO1x0XHRcdFx0XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgTGFiZWwge1xyXG5cdHN0YXRpYyBzaG93U3ltYm9sKHN0YWdlLCBqc29uKSB7XHJcblx0XHRsZXQgcGF0aCA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQocGF0aCk7XHJcblx0XHRhZGRMYWJlbChwYXRoLCBbanNvbi54LCBqc29uLnldLCBqc29uLCBmdW5jdGlvbihzaG93KSB7XHJcblx0XHRcdHN0YWdlLnJlbW92ZUNoaWxkKHBhdGgpO1xyXG4gICAgXHRcdGlmIChzaG93KSBMYWJlbC5zaG93U3ltYm9sKHN0YWdlLCBqc29uKVxyXG5cdFx0fSlcclxuXHR9XHJcblx0Y29uc3RydWN0b3IoZHJhd3NpbSkge1xyXG5cdFx0ZHJhd3NpbS5tYWluc3RhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG5cdFx0XHRsZXQgc3ltYm9sID0ge1widHlwZVwiOiBcImxhYmVsXCIsIHg6IGUuc3RhZ2VYLCB5OiBlLnN0YWdlWSwgZGVzYzogXCJcIn1cclxuXHRcdFx0Z2V0RGVzYyhbc3ltYm9sLngsIHN5bWJvbC55XSwgc3ltYm9sLCBmdW5jdGlvbihzaG93KSB7XHJcblx0ICAgIFx0XHRpZiAoc2hvdykgTGFiZWwuc2hvd1N5bWJvbChkcmF3c2ltLm1haW5zdGFnZSwgc3ltYm9sKVxyXG5cdFx0XHR9KVxyXG5cdFx0fSlcdFx0XHJcblx0fVx0XHRcclxufVxyXG5jbGFzcyBUb29sYmFyIGV4dGVuZHMgY3JlYXRlanMuQ29udGFpbmVyIHtcclxuXHRjb25zdHJ1Y3Rvcih0b29sLGRyYXdzaW0pIHtcclxuXHRcdHN1cGVyKClcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5mcmFtZXJhdGUgPSAyMFxyXG5cdFx0bGV0IGJvcmRlciA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHR0aGlzLmFkZENoaWxkKGJvcmRlcilcclxuXHRcdGxldCB3ID0gMlxyXG5cdFx0dGhpcy5hZGRDaGlsZCh0b29sKVxyXG5cdFx0dyArPSB0b29sLmdldExlbmd0aCgpXHJcblx0XHR0aGlzLmNhbmNlbCA9IG5ldyBWZWN0b3IodywwLFwiYXNzZXRzL2Nyb3NzLnBuZ1wiLGRyYXdzaW0pXHJcblx0XHR0aGlzLmNhbmNlbC55ID0gMlxyXG5cdFx0dGhpcy5hZGRDaGlsZCh0aGlzLmNhbmNlbClcclxuXHRcdHcgKz0gMzBcclxuXHRcdHRoaXMueCA9IDBcclxuXHRcdHRoaXMueSA9IC0xMDBcclxuXHRcdHRoaXMudyA9IHdcclxuXHRcdGJvcmRlci5ncmFwaGljcy5iZWdpbkZpbGwoXCIjRkZGXCIpLmJlZ2luU3Ryb2tlKFwiI0FBQVwiKS5kcmF3Um91bmRSZWN0KDAsMCx3LDMwLDUsNSw1LDUpLmVuZFN0cm9rZSgpXHJcblx0fVxyXG5cdFxyXG5cdHNlbGVjdChvYmopIHtcclxuXHRcdHRoaXMueSA9IC0xMDBcclxuXHRcdGlmIChvYmogPT0gdGhpcy5jYW5jZWwpIHJldHVyblxyXG5cdFx0bGV0IGpzb24gPSBudWxsXHJcblx0XHRpZiAob2JqIGluc3RhbmNlb2YgVmVjdG9yKSB7IFxyXG5cdFx0XHRqc29uID0gb2JqLnRvSlNPTih0aGlzLmUuc3RhZ2VYLHRoaXMuZS5zdGFnZVkpXHJcblx0XHRcdFZlY3Rvci5zaG93U3ltYm9sKHRoaXMuc3RhZ2UsanNvbilcclxuXHRcdH1cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBBaXJtYXNzKSB7XHJcblx0XHRcdGpzb24gPSBvYmoudG9KU09OKHRoaXMuZS5zdGFnZVgtMTQsdGhpcy5lLnN0YWdlWS0xNClcclxuXHRcdFx0QWlybWFzcy5zaG93U3ltYm9sKHRoaXMuc3RhZ2UsanNvbilcclxuXHRcdH1cclxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBQcmVzc3VyZVJlZ2lvbikge1xyXG5cdFx0XHRqc29uID0gb2JqLnRvSlNPTih0aGlzLmUuc3RhZ2VYLHRoaXMuZS5zdGFnZVkpXHJcblx0XHRcdFByZXNzdXJlUmVnaW9uLnNob3dTeW1ib2wodGhpcy5zdGFnZSxqc29uKVxyXG5cdFx0fVxyXG5cdFx0YWRkU3ltYm9sKGpzb24pXHJcblx0XHR0aGlzLnN0YWdlLnNldENoaWxkSW5kZXgoIHRoaXMsIHRoaXMuc3RhZ2UuZ2V0TnVtQ2hpbGRyZW4oKS0xKVxyXG5cdH1cclxuXHRcclxuXHRzaG93KGUpIHtcclxuXHRcdGlmICghZS5yZWxhdGVkVGFyZ2V0ICYmIHRoaXMueSA8IDApIHtcclxuXHRcdFx0dGhpcy54ID0gZS5zdGFnZVggLSB0aGlzLncvMlxyXG5cdFx0XHR0aGlzLnkgPSBlLnN0YWdlWSAtIDMwXHJcblx0XHRcdHRoaXMuZSA9IGVcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIERyYXdTaW0ge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5tYWluc3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJtYWluY2FudmFzXCIpXHJcblx0XHRjcmVhdGVqcy5Ub3VjaC5lbmFibGUodGhpcy5tYWluc3RhZ2UpXHJcblx0XHRiYWNrLmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRsZXQgYm5kID0gYmFjay5nZXRCb3VuZHMoKVxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5jYW52YXMud2lkdGggPSBibmQud2lkdGggKyA0MFxyXG5cdFx0XHRkcmF3c2ltLm1haW5zdGFnZS5jYW52YXMuaGVpZ2h0ID0gYm5kLmhlaWdodCArIDQwXHJcblx0XHRcdGJhY2sueCA9IGJuZC53aWR0aCAvIDIgKyAyMFxyXG5cdFx0XHRiYWNrLnkgPSBibmQud2lkdGggLyAyICsgMjBcclxuXHRcdCAgICBiYWNrLnJlZ1ggPSBibmQud2lkdGggLyAyO1xyXG5cdFx0ICAgIGJhY2sucmVnWSA9IGJuZC5oZWlnaHQgLyAyO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5tYWluc3RhZ2UuYWRkQ2hpbGQoYmFjaylcclxuXHRcdHRoaXMuc2hvd1N5bWJvbHMoKVxyXG5cdFx0aWYgKGVkaXQpIHtcclxuXHRcdFx0dGhpcy5tYWluc3RhZ2UuZW5hYmxlTW91c2VPdmVyKClcclxuXHRcdFx0c3dpdGNoICh0b29sKSB7XHJcblx0XHRcdGNhc2UgXCJwcmVzc3VyZVwiOlxyXG5cdFx0XHRcdGxldCBwcmVzc3VyZXMgPSBuZXcgUHJlc3N1cmVzKDIsdGhpcylcclxuXHRcdFx0XHR0aGlzLnRvb2xiYXIgPSBuZXcgVG9vbGJhcihwcmVzc3VyZXMsdGhpcylcclxuXHRcdFx0XHRiYWNrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZSA9PiB0aGlzLnRvb2xiYXIuc2hvdyhlKSlcclxuXHRcdFx0XHR0aGlzLm1haW5zdGFnZS5hZGRDaGlsZCh0aGlzLnRvb2xiYXIpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImFpcm1hc3NcIjpcclxuXHRcdFx0XHRsZXQgYWlybWFzc2VzID0gbmV3IEFpcm1hc3NlcygyLHRoaXMpXHJcblx0XHRcdFx0dGhpcy50b29sYmFyID0gbmV3IFRvb2xiYXIoYWlybWFzc2VzLHRoaXMpXHJcblx0XHRcdFx0YmFjay5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGUgPT4gdGhpcy50b29sYmFyLnNob3coZSkpXHJcblx0XHRcdFx0dGhpcy5tYWluc3RhZ2UuYWRkQ2hpbGQodGhpcy50b29sYmFyKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJpc29wbGV0aFwiOlxyXG5cdFx0XHRcdHRoaXMuaXNvcGxldGggPSBuZXcgSXNvUGxldGgodGhpcylcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwibGluZVwiOlxyXG5cdFx0XHRcdHRoaXMubGluZSA9IG5ldyBMaW5lKHRoaXMpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImVsbGlwc2VcIjpcclxuXHRcdFx0XHR0aGlzLmVsbGlwc2UgPSBuZXcgRWxsaXBzZSh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJmaWVsZFwiOlxyXG5cdFx0XHRcdHRoaXMuZmllbGQgPSBuZXcgRmllbGQodGhpcylcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwidHJhbnNmb3JtXCI6XHJcblx0XHRcdFx0dGhpcy50cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKHRoaXMpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImxhYmVsXCI6XHJcblx0XHRcdFx0dGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh0aGlzKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGFsZXJ0KFwiUGFyYW1ldGVyIHRvb2wgc2hvdWxkIGJlIHByZXNzdXJlLCBhaXJtYXNzLCBpc29wbGV0aCwgbGluZSwgZWxsaXBzZSwgZmllbGQsIHRyYW5zZm9ybSBvciBsYWJlbFwiKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBoYW5kbGUgZG93bmxvYWRcclxuXHRcdGxldCBkbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG93bmxvYWRcIilcclxuXHRcdGRsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuXHRcdFx0bGV0IGR0ID0gdGhpcy5tYWluc3RhZ2UuY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJylcclxuXHRcdFx0LyogQ2hhbmdlIE1JTUUgdHlwZSB0byB0cmljayB0aGUgYnJvd3NlciB0byBkb3dubG9hZCB0aGUgZmlsZSBpbnN0ZWFkIG9mIGRpc3BsYXlpbmcgaXQgKi9cclxuXHRcdFx0ZHQgPSBkdC5yZXBsYWNlKC9eZGF0YTppbWFnZVxcL1teO10qLywgJ2RhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyk7XHJcblx0XHRcdC8qIEluIGFkZGl0aW9uIHRvIDxhPidzIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGUsIHlvdSBjYW4gZGVmaW5lIEhUVFAtc3R5bGUgaGVhZGVycyAqL1xyXG5cdFx0XHRkdCA9IGR0LnJlcGxhY2UoL15kYXRhOmFwcGxpY2F0aW9uXFwvb2N0ZXQtc3RyZWFtLywgJ2RhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2hlYWRlcnM9Q29udGVudC1EaXNwb3NpdGlvbiUzQSUyMGF0dGFjaG1lbnQlM0IlMjBmaWxlbmFtZT1tYXAucG5nJyk7XHJcblx0XHRcdGRsLmhyZWYgPSBkdDtcclxuXHRcdH0pXHJcblx0fVxyXG5cdFxyXG5cdHNob3dTeW1ib2xzKCkge1xyXG5cdFx0bGV0IHN5bWJvbHMgPSBnZXRTeW1ib2xzKClcclxuXHRcdGZvciAobGV0IGtleSBpbiBzeW1ib2xzW1wiZGF0YVwiXSkge1xyXG5cdFx0XHRsZXQganNvbiA9IHN5bWJvbHNbXCJkYXRhXCJdW2tleV1cclxuXHRcdFx0c3dpdGNoIChqc29uLnR5cGUpIHtcclxuXHRcdFx0Y2FzZSBcInZlY3RvclwiOlxyXG5cdFx0XHRcdFZlY3Rvci5zaG93U3ltYm9sKHRoaXMubWFpbnN0YWdlLGpzb24pXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInJlZ2lvblwiOlxyXG5cdFx0XHRcdFByZXNzdXJlUmVnaW9uLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiYWlybWFzc1wiOlxyXG5cdFx0XHRcdEFpcm1hc3Muc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJpc29wbGV0aFwiOlxyXG5cdFx0XHRcdElzb1BsZXRoLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImxpbmVcIjpcclxuXHRcdFx0XHRMaW5lLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImVsbGlwc2VcIjpcclxuXHRcdFx0XHRFbGxpcHNlLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImZpZWxkXCI6XHJcblx0XHRcdFx0RmllbGQuc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwidHJhbnNmb3JtXCI6XHJcblx0XHRcdFx0VHJhbnNmb3JtLnNob3dTeW1ib2wodGhpcy5tYWluc3RhZ2UsanNvbilcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImxhYmVsXCI6XHJcblx0XHRcdFx0TGFiZWwuc2hvd1N5bWJvbCh0aGlzLm1haW5zdGFnZSxqc29uKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJ1bigpIHtcclxuXHRcdGxldCB0aWNrID0gMFxyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0aWNrXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLm1haW5zdGFnZS51cGRhdGUoKVxyXG5cdFx0XHR0aWNrKytcclxuXHRcdH0pXHJcblx0fVxyXG59XHJcblxyXG5sZXQgZHJhd3NpbSA9IG5ldyBEcmF3U2ltKClcclxuZHJhd3NpbS5ydW4oKSIsImNvbnN0IG1hcmdpblggPSA0MCwgbWFyZ2luWSA9IDMwLCBlbmRNYXJnaW4gPSA1XHJcblxyXG5leHBvcnQgY2xhc3MgQXhpcyB7XHJcblx0Y29uc3RydWN0b3Ioc3BlYykge1xyXG5cdFx0dGhpcy5zcGVjID0gc3BlY1xyXG5cdFx0dGhpcy5zdGFnZSA9IHNwZWMuc3RhZ2VcclxuXHRcdHRoaXMudyA9IHNwZWMuZGltLncgfHwgMTAwXHJcblx0XHR0aGlzLmggPSBzcGVjLmRpbS5oIHx8IDEwMFxyXG5cdFx0dGhpcy5taW4gPSBzcGVjLmRpbS5taW4gfHwgMFxyXG5cdFx0dGhpcy5tYXggPSBzcGVjLmRpbS5tYXggfHwgMTAwXHJcblx0XHR0aGlzLmZvbnQgPSBzcGVjLmZvbnQgfHwgXCIxMXB4IEFyaWFsXCJcclxuXHRcdHRoaXMuY29sb3IgPSBzcGVjLmNvbG9yIHx8IFwiIzAwMFwiXHJcblx0XHR0aGlzLmxhYmVsID0gc3BlYy5sYWJlbFxyXG5cdFx0dGhpcy5tYWpvciA9IHNwZWMubWFqb3IgfHwgMTBcclxuXHRcdHRoaXMubWlub3IgPSBzcGVjLm1pbm9yIHx8IHNwZWMubWFqb3JcclxuXHRcdHRoaXMucHJlY2lzaW9uID0gc3BlYy5wcmVjaXNpb24gfHwgMFxyXG5cdFx0dGhpcy52ZXJ0aWNhbCA9IHNwZWMub3JpZW50ICYmIHNwZWMub3JpZW50ID09IFwidmVydGljYWxcIiB8fCBmYWxzZVxyXG5cdFx0dGhpcy5saW5lYXIgPSBzcGVjLnNjYWxlICYmIHNwZWMuc2NhbGUgPT0gXCJsaW5lYXJcIiB8fCBmYWxzZVxyXG5cdFx0dGhpcy5pbnZlcnQgPSBzcGVjLmludmVydCB8fCBmYWxzZVxyXG5cdFx0aWYgKHNwZWMuZGltLngpIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5YID0gc3BlYy5kaW0ueFxyXG5cdFx0XHR0aGlzLmVuZFggPSB0aGlzLm9yaWdpblggKyB0aGlzLndcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWCA9IG1hcmdpblhcclxuXHRcdFx0dGhpcy5lbmRYID0gdGhpcy53IC0gZW5kTWFyZ2luXHJcblx0XHR9XHJcblx0XHRpZiAoc3BlYy5kaW0ueSkge1xyXG5cdFx0XHR0aGlzLm9yaWdpblkgPSBzcGVjLmRpbS55XHJcblx0XHRcdHRoaXMuZW5kWSA9IHRoaXMub3JpZ2luWSAtIHRoaXMuaCArIGVuZE1hcmdpblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5ZID0gdGhpcy5oIC0gbWFyZ2luWVxyXG5cdFx0XHR0aGlzLmVuZFkgPSBlbmRNYXJnaW5cclxuXHRcdH1cclxuXHRcdHRoaXMuc2NhbGUgPSB0aGlzLnZlcnRpY2FsID8gTWF0aC5hYnModGhpcy5lbmRZIC0gdGhpcy5vcmlnaW5ZKS8odGhpcy5tYXggLSB0aGlzLm1pbik6IE1hdGguYWJzKHRoaXMuZW5kWCAtIHRoaXMub3JpZ2luWCkvKHRoaXMubWF4IC0gdGhpcy5taW4pXHJcblx0fVxyXG5cclxuXHRkcmF3TGluZSh4MSx5MSx4Mix5Mikge1xyXG5cdFx0bGV0IGxpbmUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgxKVxyXG5cdFx0bGluZS5ncmFwaGljcy5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKVxyXG5cdFx0bGluZS5ncmFwaGljcy5tb3ZlVG8oeDEsIHkxKVxyXG5cdFx0bGluZS5ncmFwaGljcy5saW5lVG8oeDIsIHkyKVxyXG5cdFx0bGluZS5ncmFwaGljcy5lbmRTdHJva2UoKTtcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQobGluZSlcclxuXHR9XHJcblx0XHJcblx0ZHJhd1RleHQodGV4dCx4LHkpIHtcclxuXHRcdHRleHQueCA9IHhcclxuXHRcdHRleHQueSA9IHlcclxuXHRcdGlmICh0aGlzLnZlcnRpY2FsICYmIHRleHQudGV4dCA9PSB0aGlzLmxhYmVsKSB0ZXh0LnJvdGF0aW9uID0gMjcwXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRleHQpXHJcblx0XHRyZXR1cm4gdGV4dFxyXG5cdH1cclxuXHJcblx0Z2V0VGV4dChzKSB7IHJldHVybiBuZXcgY3JlYXRlanMuVGV4dChzLHRoaXMuZm9udCx0aGlzLmNvbG9yKSB9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgXHRsZXQgbGFiZWwgPSB0aGlzLmdldFRleHQodGhpcy5sYWJlbClcclxuICAgIFx0bGV0IGxhYmVsX2JuZHMgPSBsYWJlbC5nZXRCb3VuZHMoKVxyXG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLHRoaXMub3JpZ2luWSx0aGlzLm9yaWdpblgsdGhpcy5lbmRZKVxyXG4gICAgICAgICAgICBsZXQgbWluWExhYmVsID0gdGhpcy5vcmlnaW5YXHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1ham9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLTQsdix0aGlzLm9yaWdpblgrNCx2KSAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5nZXRUZXh0KHZhbC50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSlcclxuICAgICAgICAgICAgICAgIGxldCBibmRzID0gdGV4dC5nZXRCb3VuZHMoKVxyXG4gICAgICAgICAgICAgICAgbGV0IHggPSB0aGlzLm9yaWdpblgtNS1ibmRzLndpZHRoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KHRleHQseCx2K2JuZHMuaGVpZ2h0LzItMTApXHJcbiAgICAgICAgICAgICAgICBpZiAoeCA8IG1pblhMYWJlbCkgbWluWExhYmVsID0geFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1pbm9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLTIsdix0aGlzLm9yaWdpblgrMix2KSAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zcGVjLmxhYmVsKSB7XHJcblx0ICAgICAgICAgICAgbGV0IHkgPSB0aGlzLm9yaWdpblkgLSAodGhpcy5vcmlnaW5ZIC0gbGFiZWxfYm5kcy53aWR0aCkvMlxyXG5cdCAgICAgICAgICAgIHRoaXMuZHJhd1RleHQobGFiZWwsIG1pblhMYWJlbCAtIGxhYmVsX2JuZHMuaGVpZ2h0LCB5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLm9yaWdpblgsdGhpcy5vcmlnaW5ZLCB0aGlzLmVuZFgsdGhpcy5vcmlnaW5ZKSAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5zcGVjLmxhYmVsKSB7XHJcblx0ICAgICAgICAgICAgbGV0IHggPSAodGhpcy53IC0gZW5kTWFyZ2luIC0gbGFiZWxfYm5kcy53aWR0aCkvMlxyXG5cdCAgICAgICAgICAgIHRoaXMuZHJhd1RleHQobGFiZWwsIHRoaXMub3JpZ2luWCArIHgsIHRoaXMub3JpZ2luWSArIDE1KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1ham9yKSAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHYsdGhpcy5vcmlnaW5ZLTQsdix0aGlzLm9yaWdpblkrNCkgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFRleHQodmFsLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pKVxyXG4gICAgICAgICAgICAgICAgbGV0IGJuZHMgPSB0ZXh0LmdldEJvdW5kcygpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KHRleHQsdi1ibmRzLndpZHRoLzIsdGhpcy5vcmlnaW5ZKzQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh2LHRoaXMub3JpZ2luWS0yLHYsdGhpcy5vcmlnaW5ZKzIpICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRMb2ModmFsKSB7XHJcbiAgICAgICAgbGV0IGl2YWwgPSB0aGlzLmxpbmVhcj8gTWF0aC5yb3VuZCh0aGlzLnNjYWxlKih2YWwtdGhpcy5taW4pKTogTWF0aC5yb3VuZChNYXRoLmxvZyh0aGlzLnNjYWxlKih2YWwtdGhpcy5taW4pKSlcclxuICAgICAgICByZXR1cm4gdGhpcy52ZXJ0aWNhbD90aGlzLm9yaWdpblkgLSBpdmFsOnRoaXMub3JpZ2luWCArIGl2YWxcclxuICAgIH1cclxuXHJcbiAgICBnZXRWYWx1ZSh2KSB7XHJcbiAgICBcdGxldCBmYWN0b3IgPSB0aGlzLnZlcnRpY2FsPyAodGhpcy5vcmlnaW5ZIC0gdikvdGhpcy5vcmlnaW5ZOih2IC0gdGhpcy5vcmlnaW5YKS8odGhpcy53IC0gdGhpcy5vcmlnaW5YKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbiArICh0aGlzLm1heCAtIHRoaXMubWluKSAqIGZhY3RvclxyXG4gICAgfVxyXG5cclxuICAgIGlzSW5zaWRlKHYpIHtcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICAgICAgcmV0dXJuIHYgPj0gdGhpcy5vcmlnaW5ZICYmIHYgPD0gKHRoaXMub3JpZ2luWSArIHRoaXMuaClcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB2ID49IHRoaXMub3JpZ2luWCAmJiB2IDw9ICh0aGlzLm9yaWdpblkgKyB0aGlzLncpXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtBeGlzfSBmcm9tIFwiLi9heGlzXCJcclxuZXhwb3J0IGNsYXNzIEdyYXBoIHtcclxuXHRjb25zdHJ1Y3RvcihzcGVjKSB7XHJcblx0XHR0aGlzLnN0YWdlID0gc3BlYy5zdGFnZVxyXG5cdFx0dGhpcy54YXhpcyA9IG5ldyBBeGlzKHtcclxuXHRcdFx0c3RhZ2U6IHRoaXMuc3RhZ2UsXHJcblx0XHRcdGxhYmVsOiBzcGVjLnhsYWJlbCxcclxuXHRcdFx0ZGltOiB7IHg6IHNwZWMueCwgeTogc3BlYy55LCB3OiBzcGVjLncsIGg6IHNwZWMuaCwgbWluOiBzcGVjLm1pblgsIG1heDogc3BlYy5tYXhYIH0sXHJcblx0XHRcdG9yaWVudDogXCJob3Jpem9udGFsXCIsXHJcblx0XHRcdHNjYWxlOiBzcGVjLnhzY2FsZSxcclxuXHRcdFx0bWFqb3I6IHNwZWMubWFqb3JYLFxyXG5cdFx0XHRtaW5vcjogc3BlYy5taW5vclgsXHJcblx0XHRcdHByZWNpc2lvbjogc3BlYy5wcmVjaXNpb25YLFxyXG5cdFx0XHRpbnZlcnQ6IHNwZWMueGludmVydFxyXG5cdFx0fSlcclxuXHRcdHRoaXMueWF4aXMgPSBuZXcgQXhpcyh7XHJcblx0XHRcdHN0YWdlOiB0aGlzLnN0YWdlLFxyXG5cdFx0XHRsYWJlbDogc3BlYy55bGFiZWwsXHJcblx0XHRcdGRpbTogeyB4OiBzcGVjLngsIHk6IHNwZWMueSwgdzogc3BlYy53LCBoOiBzcGVjLmgsIG1pbjogc3BlYy5taW5ZLCBtYXg6IHNwZWMubWF4WSB9LFxyXG5cdFx0XHRvcmllbnQ6IFwidmVydGljYWxcIixcclxuXHRcdFx0c2NhbGU6IHNwZWMueXNjYWxlLFxyXG5cdFx0XHRtYWpvcjogc3BlYy5tYWpvclksXHJcblx0XHRcdG1pbm9yOiBzcGVjLm1pbm9yWSxcclxuXHRcdFx0cHJlY2lzaW9uOiBzcGVjLnByZWNpc2lvblksXHJcblx0XHRcdGludmVydDogc3BlYy55aW52ZXJ0XHJcblx0XHR9KVxyXG5cdFx0dGhpcy53aWR0aCA9IDFcclxuXHRcdHRoaXMubGFzdCA9IG51bGxcclxuXHRcdHRoaXMubWFya2VyID0gbnVsbFxyXG5cdFx0dGhpcy5jb2xvciA9IFwiIzAwMFwiXHJcblx0XHR0aGlzLmRvdHRlZCA9IGZhbHNlXHJcblx0XHRpZiAoc3BlYy5iYWNrZ3JvdW5kKSB7XHJcblx0XHRcdGxldCBiID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdFx0Yi5ncmFwaGljcy5iZWdpblN0cm9rZShcIiNBQUFcIikuYmVnaW5GaWxsKHNwZWMuYmFja2dyb3VuZCkuZHJhd1JlY3Qoc3BlYy54LHNwZWMueS1zcGVjLmgsc3BlYy53LHNwZWMuaCkuZW5kU3Ryb2tlKClcclxuXHRcdFx0Yi5hbHBoYSA9IDAuM1xyXG5cdFx0XHRzcGVjLnN0YWdlLmFkZENoaWxkKGIpXHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHNldFdpZHRoKHdpZHRoKSB7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGhcclxuXHR9XHJcblx0XHJcblx0c2V0RG90dGVkKGRvdHRlZCkge1xyXG5cdFx0dGhpcy5kb3R0ZWQgPSBkb3R0ZWRcclxuXHR9XHJcblx0XHJcblx0c2V0Q29sb3IoY29sb3IpIHtcclxuXHRcdHRoaXMuY29sb3IgPSBjb2xvclxyXG5cdFx0dGhpcy5lbmRQbG90KClcclxuXHRcdHRoaXMubWFya2VyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuICAgIFx0dGhpcy5tYXJrZXIuZ3JhcGhpY3MuYmVnaW5TdHJva2UoY29sb3IpLmJlZ2luRmlsbChjb2xvcikuZHJhd1JlY3QoMCwwLDQsNClcclxuICAgIFx0dGhpcy5tYXJrZXIueCA9IC0xMFxyXG4gICAgXHR0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMubWFya2VyKVxyXG5cdH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICBcdHRoaXMueGF4aXMucmVuZGVyKClcclxuICAgIFx0dGhpcy55YXhpcy5yZW5kZXIoKVxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgXHR0aGlzLnN0YWdlLnJlbW92ZUFsbENoaWxkcmVuKClcclxuICAgIFx0dGhpcy5lbmRQbG90KClcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTWFya2VyKHgseSkge1xyXG4gICAgXHRpZiAodGhpcy5tYXJrZXIpIHtcclxuICAgIFx0XHR0aGlzLm1hcmtlci54ID0geC0yXHJcbiAgICBcdFx0dGhpcy5tYXJrZXIueSA9IHktMlxyXG5cclxuICAgIFx0fVxyXG4gICAgfVxyXG5cclxuXHRkcmF3TGluZSh4MSx5MSx4Mix5Mikge1xyXG5cdFx0bGV0IGxpbmUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0aWYgKHRoaXMuZG90dGVkID09PSB0cnVlKVxyXG5cdFx0XHRsaW5lLmdyYXBoaWNzLnNldFN0cm9rZURhc2goWzIsMl0pLnNldFN0cm9rZVN0eWxlKHRoaXMud2lkdGgpLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpLm1vdmVUbyh4MSwgeTEpLmxpbmVUbyh4MiwgeTIpLmVuZFN0cm9rZSgpXHJcblx0XHRlbHNlXHJcblx0XHRcdGxpbmUuZ3JhcGhpY3Muc2V0U3Ryb2tlU3R5bGUodGhpcy53aWR0aCkuYmVnaW5TdHJva2UodGhpcy5jb2xvcikubW92ZVRvKHgxLCB5MSkubGluZVRvKHgyLCB5MikuZW5kU3Ryb2tlKClcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQobGluZSlcclxuXHRcdHJldHVybiBsaW5lXHJcblx0fVxyXG5cdFxyXG4gICAgcGxvdCh4dix5dikge1xyXG4gICAgICAgIGlmICh4diA+PSB0aGlzLnhheGlzLm1pbiAmJiB4diA8PSB0aGlzLnhheGlzLm1heCAmJiB5diA+PSB0aGlzLnlheGlzLm1pbiAmJiB5diA8PSB0aGlzLnlheGlzLm1heCkgeyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHggPSB0aGlzLnhheGlzLmdldExvYyh4dilcclxuICAgICAgICAgICAgbGV0IHkgPSB0aGlzLnlheGlzLmdldExvYyh5dilcclxuICAgICAgICAgICAgaWYgKHRoaXMubGFzdCkgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZU1hcmtlcih0aGlzLmxhc3QueCx0aGlzLmxhc3QueSlcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5sYXN0LngsdGhpcy5sYXN0LnkseCx5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IG5ldyBjcmVhdGVqcy5Qb2ludCh4LHkpXHJcbiAgICAgICAgICAgIHRoaXMubW92ZU1hcmtlcih4LHkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBlbmRQbG90KCkgeyB0aGlzLmxhc3QgPSBudWxsIH1cclxuICAgIFxyXG59XHJcbiIsImV4cG9ydCB7R3JhcGh9IGZyb20gXCIuL2dyYXBoXCJcclxuXHJcbmxldCBKU09OID0gcmVxdWlyZShcIi4vanNvbjJcIilcclxubGV0IHN0b3JlID0gcmVxdWlyZShcIi4vc3RvcmVcIilcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJhbXMoKSB7XHJcbiAgbGV0IHBhcmFtcyA9IHt9XHJcbiAgaWYgKGxvY2F0aW9uLnNlYXJjaCkge1xyXG4gICAgbG9jYXRpb24uc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykuZm9yRWFjaChwYXJ0ID0+IHtcclxuICAgICAgbGV0IHBhaXIgPSBwYXJ0LnNwbGl0KCc9JylcclxuICAgICAgcGFpclswXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKVxyXG4gICAgICBwYWlyWzFdID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pXHJcbiAgICAgIHBhcmFtc1twYWlyWzBdXSA9IChwYWlyWzFdICE9PSAndW5kZWZpbmVkJykgPyBwYWlyWzFdIDogdHJ1ZVxyXG4gICAgfSlcclxuICB9XHJcbiAgcmV0dXJuIHBhcmFtc1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RvcmUoKSB7XHJcbiAgICBpZiAoIXN0b3JlLmVuYWJsZWQpIHtcclxuICAgICAgICBhbGVydCgnTG9jYWwgc3RvcmFnZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHlvdXIgYnJvd3Nlci4gUGxlYXNlIGRpc2FibGUgXCJQcml2YXRlIE1vZGVcIiwgb3IgdXBncmFkZSB0byBhIG1vZGVybiBicm93c2VyLicpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RvcmVcclxufSIsIi8qXG4gICAganNvbjIuanNcbiAgICAyMDE1LTA1LTAzXG5cbiAgICBQdWJsaWMgRG9tYWluLlxuXG4gICAgTk8gV0FSUkFOVFkgRVhQUkVTU0VEIE9SIElNUExJRUQuIFVTRSBBVCBZT1VSIE9XTiBSSVNLLlxuXG4gICAgU2VlIGh0dHA6Ly93d3cuSlNPTi5vcmcvanMuaHRtbFxuXG5cbiAgICBUaGlzIGNvZGUgc2hvdWxkIGJlIG1pbmlmaWVkIGJlZm9yZSBkZXBsb3ltZW50LlxuICAgIFNlZSBodHRwOi8vamF2YXNjcmlwdC5jcm9ja2ZvcmQuY29tL2pzbWluLmh0bWxcblxuICAgIFVTRSBZT1VSIE9XTiBDT1BZLiBJVCBJUyBFWFRSRU1FTFkgVU5XSVNFIFRPIExPQUQgQ09ERSBGUk9NIFNFUlZFUlMgWU9VIERPXG4gICAgTk9UIENPTlRST0wuXG5cblxuICAgIFRoaXMgZmlsZSBjcmVhdGVzIGEgZ2xvYmFsIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdHdvIG1ldGhvZHM6IHN0cmluZ2lmeVxuICAgIGFuZCBwYXJzZS4gVGhpcyBmaWxlIGlzIHByb3ZpZGVzIHRoZSBFUzUgSlNPTiBjYXBhYmlsaXR5IHRvIEVTMyBzeXN0ZW1zLlxuICAgIElmIGEgcHJvamVjdCBtaWdodCBydW4gb24gSUU4IG9yIGVhcmxpZXIsIHRoZW4gdGhpcyBmaWxlIHNob3VsZCBiZSBpbmNsdWRlZC5cbiAgICBUaGlzIGZpbGUgZG9lcyBub3RoaW5nIG9uIEVTNSBzeXN0ZW1zLlxuXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlciwgc3BhY2UpXG4gICAgICAgICAgICB2YWx1ZSAgICAgICBhbnkgSmF2YVNjcmlwdCB2YWx1ZSwgdXN1YWxseSBhbiBvYmplY3Qgb3IgYXJyYXkuXG5cbiAgICAgICAgICAgIHJlcGxhY2VyICAgIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IGRldGVybWluZXMgaG93IG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzIGFyZSBzdHJpbmdpZmllZCBmb3Igb2JqZWN0cy4gSXQgY2FuIGJlIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MuXG5cbiAgICAgICAgICAgIHNwYWNlICAgICAgIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9mIG5lc3RlZCBzdHJ1Y3R1cmVzLiBJZiBpdCBpcyBvbWl0dGVkLCB0aGUgdGV4dCB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBiZSBwYWNrZWQgd2l0aG91dCBleHRyYSB3aGl0ZXNwYWNlLiBJZiBpdCBpcyBhIG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0IHdpbGwgc3BlY2lmeSB0aGUgbnVtYmVyIG9mIHNwYWNlcyB0byBpbmRlbnQgYXQgZWFjaFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWwuIElmIGl0IGlzIGEgc3RyaW5nIChzdWNoIGFzICdcXHQnIG9yICcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0IGNvbnRhaW5zIHRoZSBjaGFyYWN0ZXJzIHVzZWQgdG8gaW5kZW50IGF0IGVhY2ggbGV2ZWwuXG5cbiAgICAgICAgICAgIFRoaXMgbWV0aG9kIHByb2R1Y2VzIGEgSlNPTiB0ZXh0IGZyb20gYSBKYXZhU2NyaXB0IHZhbHVlLlxuXG4gICAgICAgICAgICBXaGVuIGFuIG9iamVjdCB2YWx1ZSBpcyBmb3VuZCwgaWYgdGhlIG9iamVjdCBjb250YWlucyBhIHRvSlNPTlxuICAgICAgICAgICAgbWV0aG9kLCBpdHMgdG9KU09OIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCBhbmQgdGhlIHJlc3VsdCB3aWxsIGJlXG4gICAgICAgICAgICBzdHJpbmdpZmllZC4gQSB0b0pTT04gbWV0aG9kIGRvZXMgbm90IHNlcmlhbGl6ZTogaXQgcmV0dXJucyB0aGVcbiAgICAgICAgICAgIHZhbHVlIHJlcHJlc2VudGVkIGJ5IHRoZSBuYW1lL3ZhbHVlIHBhaXIgdGhhdCBzaG91bGQgYmUgc2VyaWFsaXplZCxcbiAgICAgICAgICAgIG9yIHVuZGVmaW5lZCBpZiBub3RoaW5nIHNob3VsZCBiZSBzZXJpYWxpemVkLiBUaGUgdG9KU09OIG1ldGhvZFxuICAgICAgICAgICAgd2lsbCBiZSBwYXNzZWQgdGhlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHZhbHVlLCBhbmQgdGhpcyB3aWxsIGJlXG4gICAgICAgICAgICBib3VuZCB0byB0aGUgdmFsdWVcblxuICAgICAgICAgICAgRm9yIGV4YW1wbGUsIHRoaXMgd291bGQgc2VyaWFsaXplIERhdGVzIGFzIElTTyBzdHJpbmdzLlxuXG4gICAgICAgICAgICAgICAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvcm1hdCBpbnRlZ2VycyB0byBoYXZlIGF0IGxlYXN0IHR3byBkaWdpdHMuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbiA8IDEwIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJzAnICsgbiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRVVENGdWxsWWVhcigpICAgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNb250aCgpICsgMSkgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENEYXRlKCkpICAgICAgKyAnVCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENIb3VycygpKSAgICAgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNaW51dGVzKCkpICAgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENTZWNvbmRzKCkpICAgKyAnWic7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgWW91IGNhbiBwcm92aWRlIGFuIG9wdGlvbmFsIHJlcGxhY2VyIG1ldGhvZC4gSXQgd2lsbCBiZSBwYXNzZWQgdGhlXG4gICAgICAgICAgICBrZXkgYW5kIHZhbHVlIG9mIGVhY2ggbWVtYmVyLCB3aXRoIHRoaXMgYm91bmQgdG8gdGhlIGNvbnRhaW5pbmdcbiAgICAgICAgICAgIG9iamVjdC4gVGhlIHZhbHVlIHRoYXQgaXMgcmV0dXJuZWQgZnJvbSB5b3VyIG1ldGhvZCB3aWxsIGJlXG4gICAgICAgICAgICBzZXJpYWxpemVkLiBJZiB5b3VyIG1ldGhvZCByZXR1cm5zIHVuZGVmaW5lZCwgdGhlbiB0aGUgbWVtYmVyIHdpbGxcbiAgICAgICAgICAgIGJlIGV4Y2x1ZGVkIGZyb20gdGhlIHNlcmlhbGl6YXRpb24uXG5cbiAgICAgICAgICAgIElmIHRoZSByZXBsYWNlciBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncywgdGhlbiBpdCB3aWxsIGJlXG4gICAgICAgICAgICB1c2VkIHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZSBzZXJpYWxpemVkLiBJdCBmaWx0ZXJzIHRoZSByZXN1bHRzXG4gICAgICAgICAgICBzdWNoIHRoYXQgb25seSBtZW1iZXJzIHdpdGgga2V5cyBsaXN0ZWQgaW4gdGhlIHJlcGxhY2VyIGFycmF5IGFyZVxuICAgICAgICAgICAgc3RyaW5naWZpZWQuXG5cbiAgICAgICAgICAgIFZhbHVlcyB0aGF0IGRvIG5vdCBoYXZlIEpTT04gcmVwcmVzZW50YXRpb25zLCBzdWNoIGFzIHVuZGVmaW5lZCBvclxuICAgICAgICAgICAgZnVuY3Rpb25zLCB3aWxsIG5vdCBiZSBzZXJpYWxpemVkLiBTdWNoIHZhbHVlcyBpbiBvYmplY3RzIHdpbGwgYmVcbiAgICAgICAgICAgIGRyb3BwZWQ7IGluIGFycmF5cyB0aGV5IHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBudWxsLiBZb3UgY2FuIHVzZVxuICAgICAgICAgICAgYSByZXBsYWNlciBmdW5jdGlvbiB0byByZXBsYWNlIHRob3NlIHdpdGggSlNPTiB2YWx1ZXMuXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh1bmRlZmluZWQpIHJldHVybnMgdW5kZWZpbmVkLlxuXG4gICAgICAgICAgICBUaGUgb3B0aW9uYWwgc3BhY2UgcGFyYW1ldGVyIHByb2R1Y2VzIGEgc3RyaW5naWZpY2F0aW9uIG9mIHRoZVxuICAgICAgICAgICAgdmFsdWUgdGhhdCBpcyBmaWxsZWQgd2l0aCBsaW5lIGJyZWFrcyBhbmQgaW5kZW50YXRpb24gdG8gbWFrZSBpdFxuICAgICAgICAgICAgZWFzaWVyIHRvIHJlYWQuXG5cbiAgICAgICAgICAgIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBub24tZW1wdHkgc3RyaW5nLCB0aGVuIHRoYXQgc3RyaW5nIHdpbGxcbiAgICAgICAgICAgIGJlIHVzZWQgZm9yIGluZGVudGF0aW9uLiBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCB0aGVuXG4gICAgICAgICAgICB0aGUgaW5kZW50YXRpb24gd2lsbCBiZSB0aGF0IG1hbnkgc3BhY2VzLlxuXG4gICAgICAgICAgICBFeGFtcGxlOlxuXG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoWydlJywge3BsdXJpYnVzOiAndW51bSd9XSk7XG4gICAgICAgICAgICAvLyB0ZXh0IGlzICdbXCJlXCIse1wicGx1cmlidXNcIjpcInVudW1cIn1dJ1xuXG5cbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeShbJ2UnLCB7cGx1cmlidXM6ICd1bnVtJ31dLCBudWxsLCAnXFx0Jyk7XG4gICAgICAgICAgICAvLyB0ZXh0IGlzICdbXFxuXFx0XCJlXCIsXFxuXFx0e1xcblxcdFxcdFwicGx1cmlidXNcIjogXCJ1bnVtXCJcXG5cXHR9XFxuXSdcblxuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KFtuZXcgRGF0ZSgpXSwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1trZXldIGluc3RhbmNlb2YgRGF0ZSBcbiAgICAgICAgICAgICAgICAgICAgPyAnRGF0ZSgnICsgdGhpc1trZXldICsgJyknIFxuICAgICAgICAgICAgICAgICAgICA6IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyB0ZXh0IGlzICdbXCJEYXRlKC0tLWN1cnJlbnQgdGltZS0tLSlcIl0nXG5cblxuICAgICAgICBKU09OLnBhcnNlKHRleHQsIHJldml2ZXIpXG4gICAgICAgICAgICBUaGlzIG1ldGhvZCBwYXJzZXMgYSBKU09OIHRleHQgdG8gcHJvZHVjZSBhbiBvYmplY3Qgb3IgYXJyYXkuXG4gICAgICAgICAgICBJdCBjYW4gdGhyb3cgYSBTeW50YXhFcnJvciBleGNlcHRpb24uXG5cbiAgICAgICAgICAgIFRoZSBvcHRpb25hbCByZXZpdmVyIHBhcmFtZXRlciBpcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGZpbHRlciBhbmRcbiAgICAgICAgICAgIHRyYW5zZm9ybSB0aGUgcmVzdWx0cy4gSXQgcmVjZWl2ZXMgZWFjaCBvZiB0aGUga2V5cyBhbmQgdmFsdWVzLFxuICAgICAgICAgICAgYW5kIGl0cyByZXR1cm4gdmFsdWUgaXMgdXNlZCBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbCB2YWx1ZS5cbiAgICAgICAgICAgIElmIGl0IHJldHVybnMgd2hhdCBpdCByZWNlaXZlZCwgdGhlbiB0aGUgc3RydWN0dXJlIGlzIG5vdCBtb2RpZmllZC5cbiAgICAgICAgICAgIElmIGl0IHJldHVybnMgdW5kZWZpbmVkIHRoZW4gdGhlIG1lbWJlciBpcyBkZWxldGVkLlxuXG4gICAgICAgICAgICBFeGFtcGxlOlxuXG4gICAgICAgICAgICAvLyBQYXJzZSB0aGUgdGV4dC4gVmFsdWVzIHRoYXQgbG9vayBsaWtlIElTTyBkYXRlIHN0cmluZ3Mgd2lsbFxuICAgICAgICAgICAgLy8gYmUgY29udmVydGVkIHRvIERhdGUgb2JqZWN0cy5cblxuICAgICAgICAgICAgbXlEYXRhID0gSlNPTi5wYXJzZSh0ZXh0LCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBhO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPVxuL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KVQoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KD86XFwuXFxkKik/KVokLy5leGVjKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygrYVsxXSwgK2FbMl0gLSAxLCArYVszXSwgK2FbNF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgK2FbNV0sICthWzZdKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG15RGF0YSA9IEpTT04ucGFyc2UoJ1tcIkRhdGUoMDkvMDkvMjAwMSlcIl0nLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBkO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5zbGljZSgwLCA1KSA9PT0gJ0RhdGUoJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuc2xpY2UoLTEpID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9IG5ldyBEYXRlKHZhbHVlLnNsaWNlKDUsIC0xKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgVGhpcyBpcyBhIHJlZmVyZW5jZSBpbXBsZW1lbnRhdGlvbi4gWW91IGFyZSBmcmVlIHRvIGNvcHksIG1vZGlmeSwgb3JcbiAgICByZWRpc3RyaWJ1dGUuXG4qL1xuXG4vKmpzbGludCBcbiAgICBldmFsLCBmb3IsIHRoaXMgXG4qL1xuXG4vKnByb3BlcnR5XG4gICAgSlNPTiwgYXBwbHksIGNhbGwsIGNoYXJDb2RlQXQsIGdldFVUQ0RhdGUsIGdldFVUQ0Z1bGxZZWFyLCBnZXRVVENIb3VycyxcbiAgICBnZXRVVENNaW51dGVzLCBnZXRVVENNb250aCwgZ2V0VVRDU2Vjb25kcywgaGFzT3duUHJvcGVydHksIGpvaW4sXG4gICAgbGFzdEluZGV4LCBsZW5ndGgsIHBhcnNlLCBwcm90b3R5cGUsIHB1c2gsIHJlcGxhY2UsIHNsaWNlLCBzdHJpbmdpZnksXG4gICAgdGVzdCwgdG9KU09OLCB0b1N0cmluZywgdmFsdWVPZlxuKi9cblxuXG4vLyBDcmVhdGUgYSBKU09OIG9iamVjdCBvbmx5IGlmIG9uZSBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LiBXZSBjcmVhdGUgdGhlXG4vLyBtZXRob2RzIGluIGEgY2xvc3VyZSB0byBhdm9pZCBjcmVhdGluZyBnbG9iYWwgdmFyaWFibGVzLlxuXG5pZiAodHlwZW9mIEpTT04gIT09ICdvYmplY3QnKSB7XG4gICAgSlNPTiA9IHt9O1xufVxuXG4oZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBcbiAgICB2YXIgcnhfb25lID0gL15bXFxdLDp7fVxcc10qJC8sXG4gICAgICAgIHJ4X3R3byA9IC9cXFxcKD86W1wiXFxcXFxcL2JmbnJ0XXx1WzAtOWEtZkEtRl17NH0pL2csXG4gICAgICAgIHJ4X3RocmVlID0gL1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nLFxuICAgICAgICByeF9mb3VyID0gLyg/Ol58OnwsKSg/OlxccypcXFspKy9nLFxuICAgICAgICByeF9lc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx1MDAwMC1cXHUwMDFmXFx1MDA3Zi1cXHUwMDlmXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICAgIHJ4X2Rhbmdlcm91cyA9IC9bXFx1MDAwMFxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nO1xuXG4gICAgZnVuY3Rpb24gZihuKSB7XG4gICAgICAgIC8vIEZvcm1hdCBpbnRlZ2VycyB0byBoYXZlIGF0IGxlYXN0IHR3byBkaWdpdHMuXG4gICAgICAgIHJldHVybiBuIDwgMTAgXG4gICAgICAgICAgICA/ICcwJyArIG4gXG4gICAgICAgICAgICA6IG47XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHRoaXNfdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIERhdGUucHJvdG90eXBlLnRvSlNPTiAhPT0gJ2Z1bmN0aW9uJykge1xuXG4gICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHRoaXMudmFsdWVPZigpKVxuICAgICAgICAgICAgICAgID8gdGhpcy5nZXRVVENGdWxsWWVhcigpICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNb250aCgpICsgMSkgKyAnLScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0RhdGUoKSkgKyAnVCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0hvdXJzKCkpICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNaW51dGVzKCkpICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENTZWNvbmRzKCkpICsgJ1onXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIEJvb2xlYW4ucHJvdG90eXBlLnRvSlNPTiA9IHRoaXNfdmFsdWU7XG4gICAgICAgIE51bWJlci5wcm90b3R5cGUudG9KU09OID0gdGhpc192YWx1ZTtcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS50b0pTT04gPSB0aGlzX3ZhbHVlO1xuICAgIH1cblxuICAgIHZhciBnYXAsXG4gICAgICAgIGluZGVudCxcbiAgICAgICAgbWV0YSxcbiAgICAgICAgcmVwO1xuXG5cbiAgICBmdW5jdGlvbiBxdW90ZShzdHJpbmcpIHtcblxuLy8gSWYgdGhlIHN0cmluZyBjb250YWlucyBubyBjb250cm9sIGNoYXJhY3RlcnMsIG5vIHF1b3RlIGNoYXJhY3RlcnMsIGFuZCBub1xuLy8gYmFja3NsYXNoIGNoYXJhY3RlcnMsIHRoZW4gd2UgY2FuIHNhZmVseSBzbGFwIHNvbWUgcXVvdGVzIGFyb3VuZCBpdC5cbi8vIE90aGVyd2lzZSB3ZSBtdXN0IGFsc28gcmVwbGFjZSB0aGUgb2ZmZW5kaW5nIGNoYXJhY3RlcnMgd2l0aCBzYWZlIGVzY2FwZVxuLy8gc2VxdWVuY2VzLlxuXG4gICAgICAgIHJ4X2VzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICByZXR1cm4gcnhfZXNjYXBhYmxlLnRlc3Qoc3RyaW5nKSBcbiAgICAgICAgICAgID8gJ1wiJyArIHN0cmluZy5yZXBsYWNlKHJ4X2VzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IG1ldGFbYV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICA/IGNcbiAgICAgICAgICAgICAgICAgICAgOiAnXFxcXHUnICsgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgICAgIH0pICsgJ1wiJyBcbiAgICAgICAgICAgIDogJ1wiJyArIHN0cmluZyArICdcIic7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBzdHIoa2V5LCBob2xkZXIpIHtcblxuLy8gUHJvZHVjZSBhIHN0cmluZyBmcm9tIGhvbGRlcltrZXldLlxuXG4gICAgICAgIHZhciBpLCAgICAgICAgICAvLyBUaGUgbG9vcCBjb3VudGVyLlxuICAgICAgICAgICAgaywgICAgICAgICAgLy8gVGhlIG1lbWJlciBrZXkuXG4gICAgICAgICAgICB2LCAgICAgICAgICAvLyBUaGUgbWVtYmVyIHZhbHVlLlxuICAgICAgICAgICAgbGVuZ3RoLFxuICAgICAgICAgICAgbWluZCA9IGdhcCxcbiAgICAgICAgICAgIHBhcnRpYWwsXG4gICAgICAgICAgICB2YWx1ZSA9IGhvbGRlcltrZXldO1xuXG4vLyBJZiB0aGUgdmFsdWUgaGFzIGEgdG9KU09OIG1ldGhvZCwgY2FsbCBpdCB0byBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cblxuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiB2YWx1ZS50b0pTT04gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKGtleSk7XG4gICAgICAgIH1cblxuLy8gSWYgd2Ugd2VyZSBjYWxsZWQgd2l0aCBhIHJlcGxhY2VyIGZ1bmN0aW9uLCB0aGVuIGNhbGwgdGhlIHJlcGxhY2VyIHRvXG4vLyBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cblxuICAgICAgICBpZiAodHlwZW9mIHJlcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXAuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgICB9XG5cbi8vIFdoYXQgaGFwcGVucyBuZXh0IGRlcGVuZHMgb24gdGhlIHZhbHVlJ3MgdHlwZS5cblxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHF1b3RlKHZhbHVlKTtcblxuICAgICAgICBjYXNlICdudW1iZXInOlxuXG4vLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIEVuY29kZSBub24tZmluaXRlIG51bWJlcnMgYXMgbnVsbC5cblxuICAgICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKSBcbiAgICAgICAgICAgICAgICA/IFN0cmluZyh2YWx1ZSkgXG4gICAgICAgICAgICAgICAgOiAnbnVsbCc7XG5cbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ251bGwnOlxuXG4vLyBJZiB0aGUgdmFsdWUgaXMgYSBib29sZWFuIG9yIG51bGwsIGNvbnZlcnQgaXQgdG8gYSBzdHJpbmcuIE5vdGU6XG4vLyB0eXBlb2YgbnVsbCBkb2VzIG5vdCBwcm9kdWNlICdudWxsJy4gVGhlIGNhc2UgaXMgaW5jbHVkZWQgaGVyZSBpblxuLy8gdGhlIHJlbW90ZSBjaGFuY2UgdGhhdCB0aGlzIGdldHMgZml4ZWQgc29tZWRheS5cblxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG5cbi8vIElmIHRoZSB0eXBlIGlzICdvYmplY3QnLCB3ZSBtaWdodCBiZSBkZWFsaW5nIHdpdGggYW4gb2JqZWN0IG9yIGFuIGFycmF5IG9yXG4vLyBudWxsLlxuXG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG5cbi8vIER1ZSB0byBhIHNwZWNpZmljYXRpb24gYmx1bmRlciBpbiBFQ01BU2NyaXB0LCB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0Jyxcbi8vIHNvIHdhdGNoIG91dCBmb3IgdGhhdCBjYXNlLlxuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgICAgICAgIH1cblxuLy8gTWFrZSBhbiBhcnJheSB0byBob2xkIHRoZSBwYXJ0aWFsIHJlc3VsdHMgb2Ygc3RyaW5naWZ5aW5nIHRoaXMgb2JqZWN0IHZhbHVlLlxuXG4gICAgICAgICAgICBnYXAgKz0gaW5kZW50O1xuICAgICAgICAgICAgcGFydGlhbCA9IFtdO1xuXG4vLyBJcyB0aGUgdmFsdWUgYW4gYXJyYXk/XG5cbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXG4vLyBUaGUgdmFsdWUgaXMgYW4gYXJyYXkuIFN0cmluZ2lmeSBldmVyeSBlbGVtZW50LiBVc2UgbnVsbCBhcyBhIHBsYWNlaG9sZGVyXG4vLyBmb3Igbm9uLUpTT04gdmFsdWVzLlxuXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsW2ldID0gc3RyKGksIHZhbHVlKSB8fCAnbnVsbCc7XG4gICAgICAgICAgICAgICAgfVxuXG4vLyBKb2luIGFsbCBvZiB0aGUgZWxlbWVudHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcywgYW5kIHdyYXAgdGhlbSBpblxuLy8gYnJhY2tldHMuXG5cbiAgICAgICAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICAgICAgPyAnW10nXG4gICAgICAgICAgICAgICAgICAgIDogZ2FwXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICdbXFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ10nXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdbJyArIHBhcnRpYWwuam9pbignLCcpICsgJ10nO1xuICAgICAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG5cbi8vIElmIHRoZSByZXBsYWNlciBpcyBhbiBhcnJheSwgdXNlIGl0IHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZSBzdHJpbmdpZmllZC5cblxuICAgICAgICAgICAgaWYgKHJlcCAmJiB0eXBlb2YgcmVwID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHJlcC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgayA9IHJlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhcCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJzogJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJzonXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcblxuLy8gT3RoZXJ3aXNlLCBpdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBrZXlzIGluIHRoZSBvYmplY3QuXG5cbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhcCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJzogJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJzonXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4vLyBKb2luIGFsbCBvZiB0aGUgbWVtYmVyIHRleHRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsXG4vLyBhbmQgd3JhcCB0aGVtIGluIGJyYWNlcy5cblxuICAgICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgPyAne30nXG4gICAgICAgICAgICAgICAgOiBnYXBcbiAgICAgICAgICAgICAgICAgICAgPyAne1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICd9J1xuICAgICAgICAgICAgICAgICAgICA6ICd7JyArIHBhcnRpYWwuam9pbignLCcpICsgJ30nO1xuICAgICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9XG4gICAgfVxuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBzdHJpbmdpZnkgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICAgIGlmICh0eXBlb2YgSlNPTi5zdHJpbmdpZnkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbWV0YSA9IHsgICAgLy8gdGFibGUgb2YgY2hhcmFjdGVyIHN1YnN0aXR1dGlvbnNcbiAgICAgICAgICAgICdcXGInOiAnXFxcXGInLFxuICAgICAgICAgICAgJ1xcdCc6ICdcXFxcdCcsXG4gICAgICAgICAgICAnXFxuJzogJ1xcXFxuJyxcbiAgICAgICAgICAgICdcXGYnOiAnXFxcXGYnLFxuICAgICAgICAgICAgJ1xccic6ICdcXFxccicsXG4gICAgICAgICAgICAnXCInOiAnXFxcXFwiJyxcbiAgICAgICAgICAgICdcXFxcJzogJ1xcXFxcXFxcJ1xuICAgICAgICB9O1xuICAgICAgICBKU09OLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKSB7XG5cbi8vIFRoZSBzdHJpbmdpZnkgbWV0aG9kIHRha2VzIGEgdmFsdWUgYW5kIGFuIG9wdGlvbmFsIHJlcGxhY2VyLCBhbmQgYW4gb3B0aW9uYWxcbi8vIHNwYWNlIHBhcmFtZXRlciwgYW5kIHJldHVybnMgYSBKU09OIHRleHQuIFRoZSByZXBsYWNlciBjYW4gYmUgYSBmdW5jdGlvblxuLy8gdGhhdCBjYW4gcmVwbGFjZSB2YWx1ZXMsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgdGhhdCB3aWxsIHNlbGVjdCB0aGUga2V5cy5cbi8vIEEgZGVmYXVsdCByZXBsYWNlciBtZXRob2QgY2FuIGJlIHByb3ZpZGVkLiBVc2Ugb2YgdGhlIHNwYWNlIHBhcmFtZXRlciBjYW5cbi8vIHByb2R1Y2UgdGV4dCB0aGF0IGlzIG1vcmUgZWFzaWx5IHJlYWRhYmxlLlxuXG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIGdhcCA9ICcnO1xuICAgICAgICAgICAgaW5kZW50ID0gJyc7XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIG1ha2UgYW4gaW5kZW50IHN0cmluZyBjb250YWluaW5nIHRoYXRcbi8vIG1hbnkgc3BhY2VzLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNwYWNlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzcGFjZTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSAnICc7XG4gICAgICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgc3RyaW5nLCBpdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGluZGVudCBzdHJpbmcuXG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGluZGVudCA9IHNwYWNlO1xuICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGVyZSBpcyBhIHJlcGxhY2VyLCBpdCBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXkuXG4vLyBPdGhlcndpc2UsIHRocm93IGFuIGVycm9yLlxuXG4gICAgICAgICAgICByZXAgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlciAmJiB0eXBlb2YgcmVwbGFjZXIgIT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgICAgICAgICAgKHR5cGVvZiByZXBsYWNlciAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHJlcGxhY2VyLmxlbmd0aCAhPT0gJ251bWJlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OLnN0cmluZ2lmeScpO1xuICAgICAgICAgICAgfVxuXG4vLyBNYWtlIGEgZmFrZSByb290IG9iamVjdCBjb250YWluaW5nIG91ciB2YWx1ZSB1bmRlciB0aGUga2V5IG9mICcnLlxuLy8gUmV0dXJuIHRoZSByZXN1bHQgb2Ygc3RyaW5naWZ5aW5nIHRoZSB2YWx1ZS5cblxuICAgICAgICAgICAgcmV0dXJuIHN0cignJywgeycnOiB2YWx1ZX0pO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBwYXJzZSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gICAgaWYgKHR5cGVvZiBKU09OLnBhcnNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIEpTT04ucGFyc2UgPSBmdW5jdGlvbiAodGV4dCwgcmV2aXZlcikge1xuXG4vLyBUaGUgcGFyc2UgbWV0aG9kIHRha2VzIGEgdGV4dCBhbmQgYW4gb3B0aW9uYWwgcmV2aXZlciBmdW5jdGlvbiwgYW5kIHJldHVybnNcbi8vIGEgSmF2YVNjcmlwdCB2YWx1ZSBpZiB0aGUgdGV4dCBpcyBhIHZhbGlkIEpTT04gdGV4dC5cblxuICAgICAgICAgICAgdmFyIGo7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhbGsoaG9sZGVyLCBrZXkpIHtcblxuLy8gVGhlIHdhbGsgbWV0aG9kIGlzIHVzZWQgdG8gcmVjdXJzaXZlbHkgd2FsayB0aGUgcmVzdWx0aW5nIHN0cnVjdHVyZSBzb1xuLy8gdGhhdCBtb2RpZmljYXRpb25zIGNhbiBiZSBtYWRlLlxuXG4gICAgICAgICAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuXG4vLyBQYXJzaW5nIGhhcHBlbnMgaW4gZm91ciBzdGFnZXMuIEluIHRoZSBmaXJzdCBzdGFnZSwgd2UgcmVwbGFjZSBjZXJ0YWluXG4vLyBVbmljb2RlIGNoYXJhY3RlcnMgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLiBKYXZhU2NyaXB0IGhhbmRsZXMgbWFueSBjaGFyYWN0ZXJzXG4vLyBpbmNvcnJlY3RseSwgZWl0aGVyIHNpbGVudGx5IGRlbGV0aW5nIHRoZW0sIG9yIHRyZWF0aW5nIHRoZW0gYXMgbGluZSBlbmRpbmdzLlxuXG4gICAgICAgICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuICAgICAgICAgICAgcnhfZGFuZ2Vyb3VzLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAocnhfZGFuZ2Vyb3VzLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJ4X2Rhbmdlcm91cywgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdcXFxcdScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbi8vIEluIHRoZSBzZWNvbmQgc3RhZ2UsIHdlIHJ1biB0aGUgdGV4dCBhZ2FpbnN0IHJlZ3VsYXIgZXhwcmVzc2lvbnMgdGhhdCBsb29rXG4vLyBmb3Igbm9uLUpTT04gcGF0dGVybnMuIFdlIGFyZSBlc3BlY2lhbGx5IGNvbmNlcm5lZCB3aXRoICcoKScgYW5kICduZXcnXG4vLyBiZWNhdXNlIHRoZXkgY2FuIGNhdXNlIGludm9jYXRpb24sIGFuZCAnPScgYmVjYXVzZSBpdCBjYW4gY2F1c2UgbXV0YXRpb24uXG4vLyBCdXQganVzdCB0byBiZSBzYWZlLCB3ZSB3YW50IHRvIHJlamVjdCBhbGwgdW5leHBlY3RlZCBmb3Jtcy5cblxuLy8gV2Ugc3BsaXQgdGhlIHNlY29uZCBzdGFnZSBpbnRvIDQgcmVnZXhwIG9wZXJhdGlvbnMgaW4gb3JkZXIgdG8gd29yayBhcm91bmRcbi8vIGNyaXBwbGluZyBpbmVmZmljaWVuY2llcyBpbiBJRSdzIGFuZCBTYWZhcmkncyByZWdleHAgZW5naW5lcy4gRmlyc3Qgd2Vcbi8vIHJlcGxhY2UgdGhlIEpTT04gYmFja3NsYXNoIHBhaXJzIHdpdGggJ0AnIChhIG5vbi1KU09OIGNoYXJhY3RlcikuIFNlY29uZCwgd2Vcbi8vIHJlcGxhY2UgYWxsIHNpbXBsZSB2YWx1ZSB0b2tlbnMgd2l0aCAnXScgY2hhcmFjdGVycy4gVGhpcmQsIHdlIGRlbGV0ZSBhbGxcbi8vIG9wZW4gYnJhY2tldHMgdGhhdCBmb2xsb3cgYSBjb2xvbiBvciBjb21tYSBvciB0aGF0IGJlZ2luIHRoZSB0ZXh0LiBGaW5hbGx5LFxuLy8gd2UgbG9vayB0byBzZWUgdGhhdCB0aGUgcmVtYWluaW5nIGNoYXJhY3RlcnMgYXJlIG9ubHkgd2hpdGVzcGFjZSBvciAnXScgb3Jcbi8vICcsJyBvciAnOicgb3IgJ3snIG9yICd9Jy4gSWYgdGhhdCBpcyBzbywgdGhlbiB0aGUgdGV4dCBpcyBzYWZlIGZvciBldmFsLlxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcnhfb25lLnRlc3QoXG4gICAgICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKHJ4X3R3bywgJ0AnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UocnhfdGhyZWUsICddJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKHJ4X2ZvdXIsICcnKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuXG4vLyBJbiB0aGUgdGhpcmQgc3RhZ2Ugd2UgdXNlIHRoZSBldmFsIGZ1bmN0aW9uIHRvIGNvbXBpbGUgdGhlIHRleHQgaW50byBhXG4vLyBKYXZhU2NyaXB0IHN0cnVjdHVyZS4gVGhlICd7JyBvcGVyYXRvciBpcyBzdWJqZWN0IHRvIGEgc3ludGFjdGljIGFtYmlndWl0eVxuLy8gaW4gSmF2YVNjcmlwdDogaXQgY2FuIGJlZ2luIGEgYmxvY2sgb3IgYW4gb2JqZWN0IGxpdGVyYWwuIFdlIHdyYXAgdGhlIHRleHRcbi8vIGluIHBhcmVucyB0byBlbGltaW5hdGUgdGhlIGFtYmlndWl0eS5cblxuICAgICAgICAgICAgICAgIGogPSBldmFsKCcoJyArIHRleHQgKyAnKScpO1xuXG4vLyBJbiB0aGUgb3B0aW9uYWwgZm91cnRoIHN0YWdlLCB3ZSByZWN1cnNpdmVseSB3YWxrIHRoZSBuZXcgc3RydWN0dXJlLCBwYXNzaW5nXG4vLyBlYWNoIG5hbWUvdmFsdWUgcGFpciB0byBhIHJldml2ZXIgZnVuY3Rpb24gZm9yIHBvc3NpYmxlIHRyYW5zZm9ybWF0aW9uLlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgID8gd2Fsayh7Jyc6IGp9LCAnJylcbiAgICAgICAgICAgICAgICAgICAgOiBqO1xuICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGUgdGV4dCBpcyBub3QgSlNPTiBwYXJzZWFibGUsIHRoZW4gYSBTeW50YXhFcnJvciBpcyB0aHJvd24uXG5cbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignSlNPTi5wYXJzZScpO1xuICAgICAgICB9O1xuICAgIH1cbn0oKSk7XG4iLCJcInVzZSBzdHJpY3RcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblx0Ly8gU3RvcmUuanNcblx0dmFyIHN0b3JlID0ge30sXG5cdFx0d2luID0gKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpLFxuXHRcdGRvYyA9IHdpbi5kb2N1bWVudCxcblx0XHRsb2NhbFN0b3JhZ2VOYW1lID0gJ2xvY2FsU3RvcmFnZScsXG5cdFx0c2NyaXB0VGFnID0gJ3NjcmlwdCcsXG5cdFx0c3RvcmFnZVxuXG5cdHN0b3JlLmRpc2FibGVkID0gZmFsc2Vcblx0c3RvcmUudmVyc2lvbiA9ICcxLjMuMjAnXG5cdHN0b3JlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHt9XG5cdHN0b3JlLmdldCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCkge31cblx0c3RvcmUuaGFzID0gZnVuY3Rpb24oa2V5KSB7IHJldHVybiBzdG9yZS5nZXQoa2V5KSAhPT0gdW5kZWZpbmVkIH1cblx0c3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7fVxuXHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkge31cblx0c3RvcmUudHJhbnNhY3QgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwsIHRyYW5zYWN0aW9uRm4pIHtcblx0XHRpZiAodHJhbnNhY3Rpb25GbiA9PSBudWxsKSB7XG5cdFx0XHR0cmFuc2FjdGlvbkZuID0gZGVmYXVsdFZhbFxuXHRcdFx0ZGVmYXVsdFZhbCA9IG51bGxcblx0XHR9XG5cdFx0aWYgKGRlZmF1bHRWYWwgPT0gbnVsbCkge1xuXHRcdFx0ZGVmYXVsdFZhbCA9IHt9XG5cdFx0fVxuXHRcdHZhciB2YWwgPSBzdG9yZS5nZXQoa2V5LCBkZWZhdWx0VmFsKVxuXHRcdHRyYW5zYWN0aW9uRm4odmFsKVxuXHRcdHN0b3JlLnNldChrZXksIHZhbClcblx0fVxuXHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgcmV0ID0ge31cblx0XHRzdG9yZS5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsKSB7XG5cdFx0XHRyZXRba2V5XSA9IHZhbFxuXHRcdH0pXG5cdFx0cmV0dXJuIHJldFxuXHR9XG5cdHN0b3JlLmZvckVhY2ggPSBmdW5jdGlvbigpIHt9XG5cdHN0b3JlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuXHR9XG5cdHN0b3JlLmRlc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7IHJldHVybiB1bmRlZmluZWQgfVxuXHRcdHRyeSB7IHJldHVybiBKU09OLnBhcnNlKHZhbHVlKSB9XG5cdFx0Y2F0Y2goZSkgeyByZXR1cm4gdmFsdWUgfHwgdW5kZWZpbmVkIH1cblx0fVxuXG5cdC8vIEZ1bmN0aW9ucyB0byBlbmNhcHN1bGF0ZSBxdWVzdGlvbmFibGUgRmlyZUZveCAzLjYuMTMgYmVoYXZpb3Jcblx0Ly8gd2hlbiBhYm91dC5jb25maWc6OmRvbS5zdG9yYWdlLmVuYWJsZWQgPT09IGZhbHNlXG5cdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3VlcyNpc3N1ZS8xM1xuXHRmdW5jdGlvbiBpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQoKSB7XG5cdFx0dHJ5IHsgcmV0dXJuIChsb2NhbFN0b3JhZ2VOYW1lIGluIHdpbiAmJiB3aW5bbG9jYWxTdG9yYWdlTmFtZV0pIH1cblx0XHRjYXRjaChlcnIpIHsgcmV0dXJuIGZhbHNlIH1cblx0fVxuXG5cdGlmIChpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQoKSkge1xuXHRcdHN0b3JhZ2UgPSB3aW5bbG9jYWxTdG9yYWdlTmFtZV1cblx0XHRzdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiBzdG9yZS5yZW1vdmUoa2V5KSB9XG5cdFx0XHRzdG9yYWdlLnNldEl0ZW0oa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRcdHJldHVybiB2YWxcblx0XHR9XG5cdFx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsKSB7XG5cdFx0XHR2YXIgdmFsID0gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRJdGVtKGtleSkpXG5cdFx0XHRyZXR1cm4gKHZhbCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbCA6IHZhbClcblx0XHR9XG5cdFx0c3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7IHN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpIH1cblx0XHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyBzdG9yYWdlLmNsZWFyKCkgfVxuXHRcdHN0b3JlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdFx0Zm9yICh2YXIgaT0wOyBpPHN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGtleSA9IHN0b3JhZ2Uua2V5KGkpXG5cdFx0XHRcdGNhbGxiYWNrKGtleSwgc3RvcmUuZ2V0KGtleSkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGRvYyAmJiBkb2MuZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKSB7XG5cdFx0dmFyIHN0b3JhZ2VPd25lcixcblx0XHRcdHN0b3JhZ2VDb250YWluZXJcblx0XHQvLyBTaW5jZSAjdXNlckRhdGEgc3RvcmFnZSBhcHBsaWVzIG9ubHkgdG8gc3BlY2lmaWMgcGF0aHMsIHdlIG5lZWQgdG9cblx0XHQvLyBzb21laG93IGxpbmsgb3VyIGRhdGEgdG8gYSBzcGVjaWZpYyBwYXRoLiAgV2UgY2hvb3NlIC9mYXZpY29uLmljb1xuXHRcdC8vIGFzIGEgcHJldHR5IHNhZmUgb3B0aW9uLCBzaW5jZSBhbGwgYnJvd3NlcnMgYWxyZWFkeSBtYWtlIGEgcmVxdWVzdCB0b1xuXHRcdC8vIHRoaXMgVVJMIGFueXdheSBhbmQgYmVpbmcgYSA0MDQgd2lsbCBub3QgaHVydCB1cyBoZXJlLiAgV2Ugd3JhcCBhblxuXHRcdC8vIGlmcmFtZSBwb2ludGluZyB0byB0aGUgZmF2aWNvbiBpbiBhbiBBY3RpdmVYT2JqZWN0KGh0bWxmaWxlKSBvYmplY3Rcblx0XHQvLyAoc2VlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvYWE3NTI1NzQodj1WUy44NSkuYXNweClcblx0XHQvLyBzaW5jZSB0aGUgaWZyYW1lIGFjY2VzcyBydWxlcyBhcHBlYXIgdG8gYWxsb3cgZGlyZWN0IGFjY2VzcyBhbmRcblx0XHQvLyBtYW5pcHVsYXRpb24gb2YgdGhlIGRvY3VtZW50IGVsZW1lbnQsIGV2ZW4gZm9yIGEgNDA0IHBhZ2UuICBUaGlzXG5cdFx0Ly8gZG9jdW1lbnQgY2FuIGJlIHVzZWQgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBkb2N1bWVudCAod2hpY2ggd291bGRcblx0XHQvLyBoYXZlIGJlZW4gbGltaXRlZCB0byB0aGUgY3VycmVudCBwYXRoKSB0byBwZXJmb3JtICN1c2VyRGF0YSBzdG9yYWdlLlxuXHRcdHRyeSB7XG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyID0gbmV3IEFjdGl2ZVhPYmplY3QoJ2h0bWxmaWxlJylcblx0XHRcdHN0b3JhZ2VDb250YWluZXIub3BlbigpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLndyaXRlKCc8JytzY3JpcHRUYWcrJz5kb2N1bWVudC53PXdpbmRvdzwvJytzY3JpcHRUYWcrJz48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLmNsb3NlKClcblx0XHRcdHN0b3JhZ2VPd25lciA9IHN0b3JhZ2VDb250YWluZXIudy5mcmFtZXNbMF0uZG9jdW1lbnRcblx0XHRcdHN0b3JhZ2UgPSBzdG9yYWdlT3duZXIuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdC8vIHNvbWVob3cgQWN0aXZlWE9iamVjdCBpbnN0YW50aWF0aW9uIGZhaWxlZCAocGVyaGFwcyBzb21lIHNwZWNpYWxcblx0XHRcdC8vIHNlY3VyaXR5IHNldHRpbmdzIG9yIG90aGVyd3NlKSwgZmFsbCBiYWNrIHRvIHBlci1wYXRoIHN0b3JhZ2Vcblx0XHRcdHN0b3JhZ2UgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHRcdHN0b3JhZ2VPd25lciA9IGRvYy5ib2R5XG5cdFx0fVxuXHRcdHZhciB3aXRoSUVTdG9yYWdlID0gZnVuY3Rpb24oc3RvcmVGdW5jdGlvbikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcblx0XHRcdFx0YXJncy51bnNoaWZ0KHN0b3JhZ2UpXG5cdFx0XHRcdC8vIFNlZSBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzEwODEodj1WUy44NSkuYXNweFxuXHRcdFx0XHQvLyBhbmQgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxNDI0KHY9VlMuODUpLmFzcHhcblx0XHRcdFx0c3RvcmFnZU93bmVyLmFwcGVuZENoaWxkKHN0b3JhZ2UpXG5cdFx0XHRcdHN0b3JhZ2UuYWRkQmVoYXZpb3IoJyNkZWZhdWx0I3VzZXJEYXRhJylcblx0XHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRcdHZhciByZXN1bHQgPSBzdG9yZUZ1bmN0aW9uLmFwcGx5KHN0b3JlLCBhcmdzKVxuXHRcdFx0XHRzdG9yYWdlT3duZXIucmVtb3ZlQ2hpbGQoc3RvcmFnZSlcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEluIElFNywga2V5cyBjYW5ub3Qgc3RhcnQgd2l0aCBhIGRpZ2l0IG9yIGNvbnRhaW4gY2VydGFpbiBjaGFycy5cblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMvNDBcblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMvODNcblx0XHR2YXIgZm9yYmlkZGVuQ2hhcnNSZWdleCA9IG5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIiwgXCJnXCIpXG5cdFx0dmFyIGllS2V5Rml4ID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5LnJlcGxhY2UoL15kLywgJ19fXyQmJykucmVwbGFjZShmb3JiaWRkZW5DaGFyc1JlZ2V4LCAnX19fJylcblx0XHR9XG5cdFx0c3RvcmUuc2V0ID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXksIHZhbCkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiBzdG9yZS5yZW1vdmUoa2V5KSB9XG5cdFx0XHRzdG9yYWdlLnNldEF0dHJpYnV0ZShrZXksIHN0b3JlLnNlcmlhbGl6ZSh2YWwpKVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRyZXR1cm4gdmFsXG5cdFx0fSlcblx0XHRzdG9yZS5nZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgZGVmYXVsdFZhbCkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0dmFyIHZhbCA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGtleSkpXG5cdFx0XHRyZXR1cm4gKHZhbCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbCA6IHZhbClcblx0XHR9KVxuXHRcdHN0b3JlLnJlbW92ZSA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5KSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShrZXkpXG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmNsZWFyID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IHN0b3JhZ2UuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0Zm9yICh2YXIgaT1hdHRyaWJ1dGVzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRcdFx0c3RvcmFnZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlc1tpXS5uYW1lKVxuXHRcdFx0fVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0fSlcblx0XHRzdG9yZS5mb3JFYWNoID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBzdG9yYWdlLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzXG5cdFx0XHRmb3IgKHZhciBpPTAsIGF0dHI7IGF0dHI9YXR0cmlidXRlc1tpXTsgKytpKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGF0dHIubmFtZSwgc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoYXR0ci5uYW1lKSkpXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdHRyeSB7XG5cdFx0dmFyIHRlc3RLZXkgPSAnX19zdG9yZWpzX18nXG5cdFx0c3RvcmUuc2V0KHRlc3RLZXksIHRlc3RLZXkpXG5cdFx0aWYgKHN0b3JlLmdldCh0ZXN0S2V5KSAhPSB0ZXN0S2V5KSB7IHN0b3JlLmRpc2FibGVkID0gdHJ1ZSB9XG5cdFx0c3RvcmUucmVtb3ZlKHRlc3RLZXkpXG5cdH0gY2F0Y2goZSkge1xuXHRcdHN0b3JlLmRpc2FibGVkID0gdHJ1ZVxuXHR9XG5cdHN0b3JlLmVuYWJsZWQgPSAhc3RvcmUuZGlzYWJsZWRcblx0XG5cdHJldHVybiBzdG9yZVxufSgpKVxuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS40LjEgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRyZXN1bHRbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncyBvciBlbWFpbFxuXHQgKiBhZGRyZXNzZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHR2YXIgcGFydHMgPSBzdHJpbmcuc3BsaXQoJ0AnKTtcblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIEluIGVtYWlsIGFkZHJlc3Nlcywgb25seSB0aGUgZG9tYWluIG5hbWUgc2hvdWxkIGJlIHB1bnljb2RlZC4gTGVhdmVcblx0XHRcdC8vIHRoZSBsb2NhbCBwYXJ0IChpLmUuIGV2ZXJ5dGhpbmcgdXAgdG8gYEBgKSBpbnRhY3QuXG5cdFx0XHRyZXN1bHQgPSBwYXJ0c1swXSArICdAJztcblx0XHRcdHN0cmluZyA9IHBhcnRzWzFdO1xuXHRcdH1cblx0XHQvLyBBdm9pZCBgc3BsaXQocmVnZXgpYCBmb3IgSUU4IGNvbXBhdGliaWxpdHkuIFNlZSAjMTcuXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhTZXBhcmF0b3JzLCAnXFx4MkUnKTtcblx0XHR2YXIgbGFiZWxzID0gc3RyaW5nLnNwbGl0KCcuJyk7XG5cdFx0dmFyIGVuY29kZWQgPSBtYXAobGFiZWxzLCBmbikuam9pbignLicpO1xuXHRcdHJldHVybiByZXN1bHQgKyBlbmNvZGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgKGUuZy4gYSBkb21haW4gbmFtZSBsYWJlbCkgdG8gYVxuXHQgKiBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzc1xuXHQgKiB0byBVbmljb2RlLiBPbmx5IHRoZSBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGlucHV0IHdpbGwgYmUgY29udmVydGVkLCBpLmUuXG5cdCAqIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IG9uIGEgc3RyaW5nIHRoYXQgaGFzIGFscmVhZHkgYmVlblxuXHQgKiBjb252ZXJ0ZWQgdG8gVW5pY29kZS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGVkIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgVW5pY29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBQdW55Y29kZS4gT25seSB0aGUgbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCxcblx0ICogaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluXG5cdCAqIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvIGNvbnZlcnQsIGFzIGFcblx0ICogVW5pY29kZSBzdHJpbmcuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUgb3Jcblx0ICogZW1haWwgYWRkcmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcblx0XHQgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICovXG5cdFx0J3ZlcnNpb24nOiAnMS40LjEnLFxuXHRcdC8qKlxuXHRcdCAqIEFuIG9iamVjdCBvZiBtZXRob2RzIHRvIGNvbnZlcnQgZnJvbSBKYXZhU2NyaXB0J3MgaW50ZXJuYWwgY2hhcmFjdGVyXG5cdFx0ICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cblx0XHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG5cdFx0aWYgKG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iXX0=
