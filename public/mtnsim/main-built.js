(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
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

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":2,"./encode":3}],5:[function(require,module,exports){
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

},{"./util":6,"punycode":1,"querystring":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _graph = _interopRequireDefault(require("../utils/graph"));

var _url = _interopRequireDefault(require("url"));

var _message = require("../utils/message");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var mtnsim_results = "mtnsim_results",
    LAPSE_RATE = -9.8;
var searchParams = new URLSearchParams(window.location.search.substring(1));
var tool = searchParams.get('tool');

if (tool == "readout") {
  var dp = document.getElementById("dp");
  dp.style.display = "inline-block";
  var readout = document.getElementById("readout");
  readout.style.display = "block";
}

createjs.MotionGuidePlugin.install();
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin]);
createjs.Ticker.frameRate = 10;

function teten(T, a, b) {
  return 6.1078 * Math.exp(a * T / (T + 273.16 - b));
}

function saturation(temp) {
  return teten(temp, 17.269, 35.86);
}

function icesaturation(temp) {
  return teten(temp, 21.874, 7.66);
}

function dewpoint(vapor) {
  return 2354.0 / (9.4041 - Math.log10(vapor)) - 273.0;
}

function pressure(alt) {
  return 1000 - 125 * alt;
}

function getCol(val) {
  var td = document.createElement("td");
  td.appendChild(document.createTextNode(val));
  return td;
}

function getDelete(row) {
  var td = document.createElement("td");
  var img = document.createElement("img");
  img.setAttribute("src", "assets/delete.jpg");
  img.setAttribute("class", "delete_img");
  img.setAttribute("alt", "Delete row");
  img.setAttribute("title", "Delete row");
  img.addEventListener("click", function (event) {
    if (confirm("Delete row?")) {
      // <tr><td><img...
      var node = event.target.parentNode.parentNode;
      mtnsim.mtn.deleteTrial(Array.prototype.indexOf.call(node.parentNode.childNodes, node) - 4);
    }
  });
  td.appendChild(img);
  return td;
}

function getRow(json, row) {
  var tr = document.createElement("tr");
  tr.appendChild(getCol(json.start.temp.toFixed(1)));
  tr.appendChild(getCol(json.start.vapor.toFixed(1)));
  tr.appendChild(getCol(json.start.dewpoint.toFixed(1)));
  tr.appendChild(getCol(json.temp.toFixed(1)));
  tr.appendChild(getCol(json.vapor.toFixed(1)));
  tr.appendChild(getCol(json.dewpoint.toFixed(1)));
  tr.appendChild(getCol(json.cloudbase > 0 ? json.cloudbase.toFixed(1) : "Clear"));
  tr.appendChild(getDelete(row));
  return tr;
}

var Trial = /*#__PURE__*/function () {
  function Trial() {
    _classCallCheck(this, Trial);

    this.start = null;
    this.cloudbase = 0;
    this.temp = 0;
    this.altitude = 0;
    this.vapor = 0;
    this.dewpoint = 0;
    this.lapse = 0;
  }

  _createClass(Trial, [{
    key: "toJSON",
    value: function toJSON() {
      return {
        start: this.start,
        cloudbase: this.cloudbase,
        temp: this.temp,
        altitude: this.altitude,
        vapor: this.vapor,
        dewpoint: this.dewpoint
      };
    }
  }, {
    key: "init",
    value: function init(start) {
      this.start = start;
      this.cloudbase = 0;
      this.temp = start.temp;
      this.altitude = 0;
      this.vapor = start.vapor;
      this.dewpoint = start.dewpoint;
      this.lapse = LAPSE_RATE;
    }
  }]);

  return Trial;
}();

var Readout = /*#__PURE__*/function () {
  function Readout() {
    _classCallCheck(this, Readout);

    this.altitude = document.getElementById("altitudereadout");
    this.temp = document.getElementById("tempreadout");
    this.vapor = document.getElementById("vaporreadout");
    this.dewpoint = document.getElementById("dewpointreadout");
  }

  _createClass(Readout, [{
    key: "update",
    value: function update(trial) {
      this.altitude.value = trial.altitude.toFixed(1);
      this.temp.value = trial.temp.toFixed(1);
      this.vapor.value = trial.vapor.toFixed(1);
      this.dewpoint.value = trial.dewpoint.toFixed(1);
    }
  }]);

  return Readout;
}();

var Settings = /*#__PURE__*/function () {
  function Settings() {
    var _this = this;

    _classCallCheck(this, Settings);

    this.readout = new Readout();
    this.temp = document.getElementById("temp");
    this.vapor = document.getElementById("vapor");
    this.dewpoint = document.getElementById("dewpoint");
    this.tempout = document.getElementById("tempout");
    this.vaporout = document.getElementById("vaporout");
    this.dewpointout = document.getElementById("dewpointout");
    this.mute = document.getElementById("mute");
    this.listener = null;

    function slidef(e, input, out, f) {
      e.stopPropagation();
      out.value = input.valueAsNumber;
      if (f) f(input);
    } // IE doesn't have an input event but a change event


    var event = /msie|trident/g.test(window.navigator.userAgent.toLowerCase()) ? "change" : "input";
    this.temp.addEventListener(event, function (e) {
      return slidef(e, _this.temp, _this.tempout, _this.listener);
    });
    this.vapor.addEventListener(event, function (e) {
      return slidef(e, _this.vapor, _this.vaporout, _this.listener);
    }); //this.dewpoint.addEventListener(event, e => slidef(e,this.dewpoint,this.dewpointout,this.listener))
  }

  _createClass(Settings, [{
    key: "getTemp",
    value: function getTemp() {
      return this.temp.valueAsNumber;
    }
  }, {
    key: "getVapor",
    value: function getVapor() {
      return this.vapor.valueAsNumber;
    }
  }, {
    key: "getDewpoint",
    value: function getDewpoint() {
      return this.dewpoint.valueAsNumber;
    }
  }, {
    key: "setTemp",
    value: function setTemp(value) {
      this.temp.value = value;
      this.tempout.value = value.toFixed(1);
      this.readout.temp.value = this.tempout.value;
    }
  }, {
    key: "setVapor",
    value: function setVapor(value) {
      this.vapor.value = value;
      this.vaporout.value = value.toFixed(1);
      this.readout.vapor.value = this.vaporout.value;
      this.setDewpoint(dewpoint(value));
    }
  }, {
    key: "setDewpoint",
    value: function setDewpoint(value) {
      this.dewpoint.value = value;
      this.dewpointout.value = value.toFixed(1);
      this.readout.dewpoint.value = this.dewpointout.value;
    }
  }, {
    key: "updateReadout",
    value: function updateReadout(trial) {
      this.readout.update(trial);
    }
  }, {
    key: "addListener",
    value: function addListener(listener) {
      this.listener = listener;
    }
  }]);

  return Settings;
}();

var Buttons = /*#__PURE__*/function () {
  function Buttons() {
    _classCallCheck(this, Buttons);

    this.run = document.getElementById("run");
    this.pause = document.getElementById("pause");
    this.restart = document.getElementById("restart");
    this.mute = document.getElementById("mute");
  }

  _createClass(Buttons, [{
    key: "addListener",
    value: function addListener(listener) {
      this.run.addEventListener("click", function (e) {
        return listener(e);
      });
      this.pause.addEventListener("click", function (e) {
        return listener(e);
      });
      this.restart.addEventListener("click", function (e) {
        return listener(e);
      });
    }
  }, {
    key: "mute",
    value: function mute() {
      return this.mute.checked;
    }
  }]);

  return Buttons;
}();

var ETGraph = /*#__PURE__*/function (_Graph) {
  _inherits(ETGraph, _Graph);

  var _super = _createSuper(ETGraph);

  function ETGraph(stage, settings) {
    var _this2;

    _classCallCheck(this, ETGraph);

    _this2 = _super.call(this, {
      stage: stage,
      w: 200,
      h: 200,
      xlabel: "Temperature(C)",
      ylabel: "Vapor Pressure(mb)",
      xscale: "linear",
      yscale: "linear",
      minX: -20,
      maxX: 30,
      minY: 0,
      maxY: 50,
      majorX: 10,
      minorX: 5,
      majorY: 10,
      minorY: 5
    });
    _this2.settings = settings;
    _this2.lasth = 0;
    _this2.leaf = new createjs.Bitmap("assets/leaf.gif");
    _this2.marker = new createjs.Shape();

    _this2.marker.graphics.beginFill("#000").drawRect(_this2.xaxis.getLoc(_this2.temp) - 2, _this2.yaxis.getLoc(_this2.vapor) - 2, 4, 4);

    stage.addChild(_this2.leaf);
    stage.addChild(_this2.marker);

    _this2.settings.addListener(function (slider) {
      if (slider.id == "temp") {
        _this2.temp = slider.valueAsNumber;

        _this2.settings.setTemp(slider.valueAsNumber);
      } else if (slider.id == "vapor") {
        _this2.vapor = slider.valueAsNumber;

        _this2.settings.setVapor(_this2.vapor);

        _this2.settings.setDewpoint(dewpoint(_this2.vapor));
      } else if (slider.id == "dewpoint") {
        _this2.dewpoint = slider.valueAsNumber;

        _this2.settings.setDewpoint(_this2.dewpoint);

        _this2.vapor = vapor(_this2.dewpoint);

        _this2.settings.setVapor(_this2.vapor);
      }

      _this2.moveMarker(true);
    });

    _this2.icegraph = new IceGraph(stage);
    return _this2;
  }

  _createClass(ETGraph, [{
    key: "render",
    value: function render() {
      this.temp = this.settings.getTemp();
      this.vapor = this.settings.getVapor();

      _get(_getPrototypeOf(ETGraph.prototype), "render", this).call(this);

      this.plotSaturation();
      this.icegraph.render();
      this.moveMarker(true);
    }
  }, {
    key: "plotSaturation",
    value: function plotSaturation() {
      for (var t = this.xaxis.min; t < 0; t++) {
        this.plot(t, icesaturation(t));
      }

      for (var _t = 0; _t <= this.xaxis.max; _t++) {
        this.plot(_t, saturation(_t));
      }

      this.endPlot();
    }
  }, {
    key: "clear",
    value: function clear() {
      _get(_getPrototypeOf(ETGraph.prototype), "clear", this).call(this);

      this.stage.addChild(this.leaf);
    }
  }, {
    key: "moveLeaf",
    value: function moveLeaf(x, y) {
      this.leaf.x = x - 10;
      this.leaf.y = y - 10;
    }
  }, {
    key: "showLeaf",
    value: function showLeaf() {
      var x = this.xaxis.getLoc(this.temp);
      var y = this.yaxis.getLoc(this.vapor);
      this.moveLeaf(x, y);
    }
  }, {
    key: "moveMarker",
    value: function moveMarker(updateSettings) {
      var sat = saturation(this.temp);

      if (this.vapor > sat) {
        this.vapor = sat;

        if (updateSettings === true) {
          this.settings.setTemp(this.temp);
          this.settings.setVapor(sat);
          this.settings.setDewpoint(dewpoint(sat));
        }
      }

      var x = this.xaxis.getLoc(this.temp);
      var y = this.yaxis.getLoc(this.vapor);
      this.marker.x = x - 2;
      this.marker.y = y - 2;
      if (updateSettings === true) this.moveLeaf(x, y);
    }
  }, {
    key: "update",
    value: function update(trial) {
      this.temp = trial.temp;
      this.vapor = trial.vapor;
      this.plot(trial.temp, trial.vapor);
      this.moveMarker(false);
      this.showLeaf();
    }
  }]);

  return ETGraph;
}(_graph["default"]);

var ATGraph = /*#__PURE__*/function (_Graph2) {
  _inherits(ATGraph, _Graph2);

  var _super2 = _createSuper(ATGraph);

  function ATGraph(stage) {
    var _this3;

    _classCallCheck(this, ATGraph);

    _this3 = _super2.call(this, {
      stage: stage,
      w: 200,
      h: 200,
      xlabel: "Temperature(C)",
      ylabel: "Altitude(km)",
      xscale: "linear",
      yscale: "linear",
      minX: -20,
      maxX: 30,
      minY: 0,
      maxY: 4,
      majorX: 10,
      minorX: 5,
      majorY: 1,
      minorY: 0.5
    });
    _this3.temp = 20;
    _this3.altitude = 0;
    _this3.cloudbase = 0;
    return _this3;
  }

  _createClass(ATGraph, [{
    key: "update",
    value: function update(trial) {
      this.plot(trial.temp, trial.altitude);
    }
  }]);

  return ATGraph;
}(_graph["default"]);

var IceGraph = /*#__PURE__*/function (_Graph3) {
  _inherits(IceGraph, _Graph3);

  var _super3 = _createSuper(IceGraph);

  function IceGraph(stage) {
    var _this4;

    _classCallCheck(this, IceGraph);

    _this4 = _super3.call(this, {
      stage: stage,
      x: 60,
      y: 110,
      w: 75,
      h: 100,
      xlabel: "C",
      xscale: "linear",
      yscale: "linear",
      minX: -15,
      maxX: 1,
      minY: 1,
      maxY: 5,
      majorX: 5,
      majorY: 1,
      background: "#EEE"
    });
    var liquid = new createjs.Text("Liquid", "10px Arial", "#000");
    liquid.x = 65;
    liquid.y = 40;
    stage.addChild(liquid);
    var ice = new createjs.Text("Ice", "10px Arial", "#000");
    ice.x = 90;
    ice.y = 70;
    stage.addChild(ice);
    return _this4;
  }

  _createClass(IceGraph, [{
    key: "render",
    value: function render() {
      _get(_getPrototypeOf(IceGraph.prototype), "render", this).call(this);

      for (var t = this.xaxis.min; t <= this.xaxis.max; t++) {
        this.plot(t, saturation(t));
      }

      this.endPlot();

      for (var _t2 = this.xaxis.min; _t2 <= this.xaxis.max; _t2++) {
        this.plot(_t2, icesaturation(_t2));
      }

      this.endPlot();
    }
  }]);

  return IceGraph;
}(_graph["default"]);

var Mtn = /*#__PURE__*/function () {
  function Mtn(stage, settings, finish) {
    var _this5 = this;

    _classCallCheck(this, Mtn);

    this.stage = stage;
    this.settings = settings;
    this.finish = finish;
    createjs.Sound.registerSound({
      id: "thunder",
      src: "assets/thunder.mp3"
    });
    createjs.Sound.registerSound({
      id: "wind",
      src: "assets/wind.mp3"
    });
    this.wind = null;
    this.thunder = null;
    this.mtn = new createjs.Bitmap("assets/mountain.png");
    this.leaf = new createjs.Bitmap("assets/leaf.gif");
    this.cloud = new createjs.Bitmap("assets/thundercloud.png");
    this.bolt = new createjs.Bitmap("assets/lightning.png");
    this.leaftween = null;
    this.mtn.x = 0;
    this.mtn.y = 0;
    this.mtn.scaleX = 0.5;
    this.mtn.scaleY = 0.5;
    this.bolt.x = -100;
    this.bolt.scaleX = 0.015;
    this.bolt.scaleY = 0.015;
    this.running = false;
    this.lightning = false;
    this.lighttick = 0;
    this.path = [50, 165, 60, 155, 74, 152, 80, 140, 90, 131, 100, 125, 112, 122, 120, 110, 137, 92, 140, 75, 151, 66, 150, 66, 173, 66, 185, 66, 204, 70, 210, 80, 221, 92, 221, 95, 224, 105, 230, 110, 246, 121, 250, 130, 268, 141, 280, 165, 290, 165];
    this.results = document.getElementById("results_table");
    document.getElementById("delete_all").addEventListener("click", function (event) {
      if (confirm("Delete all data?")) _this5.deleteResults();
    });
    this.reset();
    this.showResults();
  }

  _createClass(Mtn, [{
    key: "render",
    value: function render() {
      this.stage.addChild(this.mtn);
      this.stage.addChild(this.leaf);
      this.stage.addChild(this.cloud);
      this.stage.addChild(this.bolt);
      this.leaf.x = 50;
      this.leaf.y = 165;
      this.cloud.x = -1000;
      this.cloud.y = 0;
      this.lastalt = 0;
      this.cloud.scaleX = 0.1;
      this.cloud.scaleY = 0.05;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.stage.removeAllChildren();
      this.render();
    }
  }, {
    key: "play",
    value: function play() {
      var _this6 = this;

      this.reset();
      this.leaftween = createjs.Tween.get(this.leaf).to({
        guide: {
          path: this.path
        }
      }, 10000);
      this.leaftween.call(function () {
        if (_this6.wind) _this6.wind.stop();
        _this6.running = false;

        _this6.addTrial();

        if (_this6.finish) _this6.finish();
      });
      this.running = true;
      this.leaftween.play();
      this.playSound("wind");
    }
  }, {
    key: "showResults",
    value: function showResults() {
      var _this7 = this;

      for (var i = this.results.children.length - 1; i > 1; i--) {
        this.results.removeChild(this.results.children[i]);
      }

      var trials = (0, _message.getAnswer)() || [];
      trials.forEach(function (json) {
        return _this7.results.appendChild(getRow(json));
      });
      (0, _message.setAnswer)(trials);
    }
  }, {
    key: "addTrial",
    value: function addTrial() {
      var trials = (0, _message.getAnswer)() || [];
      var json = this.trial.toJSON();
      (0, _message.setAnswer)(trials.concat(json));
      this.results.appendChild(getRow(json));
    }
  }, {
    key: "deleteTrial",
    value: function deleteTrial(row) {
      var trials = (0, _message.getAnswer)() || [];
      trials.splice(row, 1);
      (0, _message.setAnswer)(trials);
      this.showResults();
    }
  }, {
    key: "deleteResults",
    value: function deleteResults() {
      (0, _message.setAnswer)([]);
      this.showResults();
    }
  }, {
    key: "pause",
    value: function pause(_pause) {
      this.leaftween.setPaused(_pause);
      if (this.wind) this.wind.paused = _pause;
      if (this.thunder) this.thunder.paused = _pause;
      this.running = !_pause;
    }
  }, {
    key: "playSound",
    value: function playSound(sound) {
      if (!this.settings.mute.checked) {
        switch (sound) {
          case "wind":
            this.wind = createjs.Sound.play(sound, {
              loop: 2
            });
            break;

          case "thunder":
            this.thunder = createjs.Sound.play(sound);
            break;
        }
      }
    }
  }, {
    key: "update",
    value: function update(trial) {
      var oldA = trial.altitude,
          oldT = trial.temp;
      trial.altitude = 4 * (165 - this.leaf.y) / 165;
      if (trial.altitude < 0) trial.altitude = 0;
      trial.vapor *= pressure(trial.altitude) / pressure(oldA);
      trial.temp += trial.lapse * (trial.altitude - oldA);
      trial.dewpoint = dewpoint(trial.vapor);
      var sat = saturation(trial.temp);

      if (trial.vapor > sat) {
        this.animateClouds();
        trial.vapor = sat;
        trial.lapse = -6.0;
      }

      if (trial.temp > oldT) trial.lapse = LAPSE_RATE;
      this.settings.updateReadout(trial);
    }
  }, {
    key: "animateClouds",
    value: function animateClouds() {
      if (this.trial.cloudbase == 0) {
        this.trial.cloudbase = this.trial.altitude;
        this.cloud.x = this.leaf.x - 2;
        this.cloud.y = this.leaf.y;
        this.bolt.y = this.cloud.y + 20;
        this.lasty = this.leaf.y;
      }

      if (this.trial.altitude - this.lastalt > .1) {
        this.lastalt = this.trial.altitude;
        this.cloud.scaleX += .021;
        this.cloud.scaleY += .02;
        this.cloud.y = this.leaf.y;
      }

      if (!this.lightning && this.leaf.x < 140 && this.trial.temp <= -5 && this.trial.altitude - this.trial.cloudbase > .5) {
        this.lighttick = 0;
        this.lightning = true;
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      this.trial = new Trial();
      this.temp = this.settings.getTemp();
      this.vapor = this.settings.getVapor();
      this.lapse_rate = LAPSE_RATE;
      this.lastalt = 0;
      this.trial.init({
        temp: this.temp,
        vapor: this.vapor,
        dewpoint: dewpoint(this.vapor)
      });
      this.settings.updateReadout(this.trial);
    }
  }, {
    key: "tick",
    value: function tick(etgraph, atgraph) {
      if (this.running === true) {
        this.update(this.trial);
        etgraph.update(this.trial);
        atgraph.update(this.trial);

        if (this.lightning === true) {
          switch (this.lighttick) {
            case 0:
              this.bolt.x = this.cloud.x + 10;
              break;

            case 5:
              this.bolt.x += 10;
              break;

            case 7:
              this.bolt.x += 10;
              break;

            case 10:
              this.bolt.x = -100;
              break;

            case 60:
              this.playSound("thunder");
              this.lightning = false;
              break;
          }

          this.lighttick++;
        }
      }
    }
  }]);

  return Mtn;
}();

var MtnSim = /*#__PURE__*/function () {
  function MtnSim() {
    var _this8 = this;

    _classCallCheck(this, MtnSim);

    this.mainstage = new createjs.Stage("maincanvas");
    this.etstage = new createjs.Stage("etgraph");
    this.atstage = new createjs.Stage("atgraph");
    this.buttons = new Buttons();
    this.settings = new Settings();
    this.etgraph = new ETGraph(this.etstage, this.settings);
    this.atgraph = new ATGraph(this.atstage);
    this.mtn = new Mtn(this.mainstage, this.settings, function () {
      _this8.buttons.restart.disabled = false;
      _this8.buttons.pause.disabled = true;
    });
    this.pause = false;
    this.buttons.addListener(function (e) {
      switch (e.target.id) {
        case "run":
          _this8.enablePlay(false);

          _this8.buttons.pause.value = "Pause";
          _this8.pause = false;

          _this8.mtn.play();

          break;

        case "pause":
          _this8.pause = !_this8.pause;

          _this8.mtn.pause(_this8.pause);

          e.target.value = _this8.pause ? "Resume" : "Pause";
          break;

        case "restart":
          _this8.reset();

          _this8.mtn.clear();

          _this8.etgraph.clear();

          _this8.atgraph.clear();

          _this8.etgraph.render();

          _this8.atgraph.render();

          _this8.mtn.reset();

          break;
      }
    });
  }

  _createClass(MtnSim, [{
    key: "reset",
    value: function reset() {
      this.enablePlay(true);
    }
  }, {
    key: "enablePlay",
    value: function enablePlay(play) {
      this.buttons.run.disabled = !play;
      this.buttons.pause.disabled = play;
      this.buttons.restart.disabled = !play;
    }
  }, {
    key: "render",
    value: function render() {
      var _this9 = this;

      this.buttons.run.disabled = false;
      this.buttons.mute.checked = false;
      this.buttons.pause.disabled = true;
      this.buttons.restart.disabled = true;
      this.reset();
      this.etgraph.render();
      this.atgraph.render();
      this.mtn.render();
      createjs.Ticker.addEventListener("tick", function (e) {
        _this9.mtn.tick(_this9.etgraph, _this9.atgraph);

        _this9.etstage.update();

        _this9.atstage.update();

        _this9.mainstage.update();
      });
    }
  }]);

  return MtnSim;
}();

var mtnsim = new MtnSim();
mtnsim.render();

},{"../utils/graph":9,"../utils/message":10,"url":5}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

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

exports["default"] = Axis;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axis = _interopRequireDefault(require("./axis"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Graph = /*#__PURE__*/function () {
  function Graph(spec) {
    _classCallCheck(this, Graph);

    this.stage = spec.stage;
    this.xaxis = new _axis["default"]({
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
    this.yaxis = new _axis["default"]({
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

exports["default"] = Graph;

},{"./axis":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAnswer = getAnswer;
exports.getSettings = getSettings;
exports.setAnswer = setAnswer;
exports.setComplete = setComplete;
var info = {
  origin: "",
  answer: null,
  settings: ""
};

window.onmessage = function (e) {
  var msg = e.data;
  if (e.source != window.parent) return;
  if (msg.cmd == "setInfo") info = msg;
};

function getAnswer() {
  return info.answer;
}

function setAnswer(answer) {
  info.answer = answer;
  window.parent.postMessage({
    cmd: "setAnswer",
    answer: answer
  }, info.origin);
}

function getSettings() {
  return info.settings;
}

function setComplete(valid) {
  window.parent.postMessage({
    cmd: "setValidity",
    validity: valid
  }, info.origin);
}

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3YxNC40LjAvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjE0LjQuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjE0LjQuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3YxNC40LjAvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCJhcHBzL210bnNpbS9tYWluLmpzIiwiYXBwcy91dGlscy9heGlzLmpzIiwiYXBwcy91dGlscy9ncmFwaC5qcyIsImFwcHMvdXRpbHMvbWVzc2FnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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SUFBSSxDQUFDLFFBQVo7QUFDRDs7QUFFTSxTQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEI7RUFDakMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxXQUFkLENBQTBCO0lBQUUsR0FBRyxFQUFFLGFBQVA7SUFBc0IsUUFBUSxFQUFFO0VBQWhDLENBQTFCLEVBQW1FLElBQUksQ0FBQyxNQUF4RTtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS40LjEgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRyZXN1bHRbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncyBvciBlbWFpbFxuXHQgKiBhZGRyZXNzZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHR2YXIgcGFydHMgPSBzdHJpbmcuc3BsaXQoJ0AnKTtcblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIEluIGVtYWlsIGFkZHJlc3Nlcywgb25seSB0aGUgZG9tYWluIG5hbWUgc2hvdWxkIGJlIHB1bnljb2RlZC4gTGVhdmVcblx0XHRcdC8vIHRoZSBsb2NhbCBwYXJ0IChpLmUuIGV2ZXJ5dGhpbmcgdXAgdG8gYEBgKSBpbnRhY3QuXG5cdFx0XHRyZXN1bHQgPSBwYXJ0c1swXSArICdAJztcblx0XHRcdHN0cmluZyA9IHBhcnRzWzFdO1xuXHRcdH1cblx0XHQvLyBBdm9pZCBgc3BsaXQocmVnZXgpYCBmb3IgSUU4IGNvbXBhdGliaWxpdHkuIFNlZSAjMTcuXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhTZXBhcmF0b3JzLCAnXFx4MkUnKTtcblx0XHR2YXIgbGFiZWxzID0gc3RyaW5nLnNwbGl0KCcuJyk7XG5cdFx0dmFyIGVuY29kZWQgPSBtYXAobGFiZWxzLCBmbikuam9pbignLicpO1xuXHRcdHJldHVybiByZXN1bHQgKyBlbmNvZGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgKGUuZy4gYSBkb21haW4gbmFtZSBsYWJlbCkgdG8gYVxuXHQgKiBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzc1xuXHQgKiB0byBVbmljb2RlLiBPbmx5IHRoZSBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGlucHV0IHdpbGwgYmUgY29udmVydGVkLCBpLmUuXG5cdCAqIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IG9uIGEgc3RyaW5nIHRoYXQgaGFzIGFscmVhZHkgYmVlblxuXHQgKiBjb252ZXJ0ZWQgdG8gVW5pY29kZS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGVkIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgVW5pY29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBQdW55Y29kZS4gT25seSB0aGUgbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCxcblx0ICogaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluXG5cdCAqIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvIGNvbnZlcnQsIGFzIGFcblx0ICogVW5pY29kZSBzdHJpbmcuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUgb3Jcblx0ICogZW1haWwgYWRkcmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcblx0XHQgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICovXG5cdFx0J3ZlcnNpb24nOiAnMS40LjEnLFxuXHRcdC8qKlxuXHRcdCAqIEFuIG9iamVjdCBvZiBtZXRob2RzIHRvIGNvbnZlcnQgZnJvbSBKYXZhU2NyaXB0J3MgaW50ZXJuYWwgY2hhcmFjdGVyXG5cdFx0ICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cblx0XHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG5cdFx0aWYgKG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iLCJpbXBvcnQgR3JhcGggZnJvbSBcIi4uL3V0aWxzL2dyYXBoXCJcclxuaW1wb3J0IFVybCBmcm9tIFwidXJsXCJcclxuaW1wb3J0IHsgZ2V0QW5zd2VyLCBzZXRBbnN3ZXIsIGdldFNldHRpbmdzLCBzZXRDb21wbGV0ZSB9IGZyb20gXCIuLi91dGlscy9tZXNzYWdlXCJcclxuXHJcbmxldCBtdG5zaW1fcmVzdWx0cyA9IFwibXRuc2ltX3Jlc3VsdHNcIiwgTEFQU0VfUkFURSA9IC05LjhcclxudmFyIHNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpXHJcbmxldCB0b29sID0gc2VhcmNoUGFyYW1zLmdldCgndG9vbCcpXHJcblxyXG5pZiAodG9vbCA9PSBcInJlYWRvdXRcIikge1xyXG5cdGxldCBkcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHBcIilcclxuXHRkcC5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIlxyXG5cdGxldCByZWFkb3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWFkb3V0XCIpXHJcblx0cmVhZG91dC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXHJcbn1cclxuXHJcbmNyZWF0ZWpzLk1vdGlvbkd1aWRlUGx1Z2luLmluc3RhbGwoKVxyXG5jcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclBsdWdpbnMoW2NyZWF0ZWpzLldlYkF1ZGlvUGx1Z2luLCBjcmVhdGVqcy5IVE1MQXVkaW9QbHVnaW4sIGNyZWF0ZWpzLkZsYXNoQXVkaW9QbHVnaW5dKVxyXG5jcmVhdGVqcy5UaWNrZXIuZnJhbWVSYXRlID0gMTBcclxuZnVuY3Rpb24gdGV0ZW4oVCxhLGIpIHsgcmV0dXJuIDYuMTA3OCpNYXRoLmV4cChhKlQvKFQrMjczLjE2LWIpKSB9XHJcbmZ1bmN0aW9uIHNhdHVyYXRpb24odGVtcCkgeyByZXR1cm4gdGV0ZW4odGVtcCwxNy4yNjksMzUuODYpIH1cclxuZnVuY3Rpb24gaWNlc2F0dXJhdGlvbih0ZW1wKSB7IHJldHVybiB0ZXRlbih0ZW1wLDIxLjg3NCw3LjY2KSB9XHJcbmZ1bmN0aW9uIGRld3BvaW50KHZhcG9yKSB7IHJldHVybiAyMzU0LjAvKDkuNDA0MS1NYXRoLmxvZzEwKHZhcG9yKSktMjczLjAgfVxyXG5mdW5jdGlvbiBwcmVzc3VyZShhbHQpIHsgcmV0dXJuIDEwMDAtMTI1KmFsdCB9XHJcblxyXG5mdW5jdGlvbiBnZXRDb2wodmFsKSB7XHJcblx0bGV0IHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpXHJcblx0dGQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsKSlcclxuXHRyZXR1cm4gdGRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGVsZXRlKHJvdykge1xyXG5cdGxldCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKVxyXG5cdGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpXHJcblx0aW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLFwiYXNzZXRzL2RlbGV0ZS5qcGdcIilcclxuXHRpbWcuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixcImRlbGV0ZV9pbWdcIilcclxuXHRpbWcuc2V0QXR0cmlidXRlKFwiYWx0XCIsXCJEZWxldGUgcm93XCIpXHJcblx0aW1nLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsXCJEZWxldGUgcm93XCIpXHJcblx0aW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB7XHJcblx0XHRpZiAoY29uZmlybShcIkRlbGV0ZSByb3c/XCIpKSB7XHJcblx0XHRcdC8vIDx0cj48dGQ+PGltZy4uLlxyXG5cdFx0XHRsZXQgbm9kZSA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGVcclxuXHRcdFx0bXRuc2ltLm10bi5kZWxldGVUcmlhbChBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKG5vZGUucGFyZW50Tm9kZS5jaGlsZE5vZGVzLG5vZGUpLTQpXHJcblx0XHR9XHJcblx0fSlcclxuXHR0ZC5hcHBlbmRDaGlsZChpbWcpXHJcblx0cmV0dXJuIHRkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJvdyhqc29uLHJvdykge1xyXG5cdGxldCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKVxyXG5cdHRyLmFwcGVuZENoaWxkKGdldENvbChqc29uLnN0YXJ0LnRlbXAudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24uc3RhcnQudmFwb3IudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24uc3RhcnQuZGV3cG9pbnQudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24udGVtcC50b0ZpeGVkKDEpKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi52YXBvci50b0ZpeGVkKDEpKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi5kZXdwb2ludC50b0ZpeGVkKDEpKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi5jbG91ZGJhc2UgPiAwP2pzb24uY2xvdWRiYXNlLnRvRml4ZWQoMSk6XCJDbGVhclwiKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXREZWxldGUocm93KSlcclxuXHRyZXR1cm4gdHJcclxufVxyXG5cclxuXHJcbmNsYXNzIFRyaWFsIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuc3RhcnQgPSBudWxsXHJcbiAgICB0aGlzLmNsb3VkYmFzZSA9IDBcclxuICAgIHRoaXMudGVtcCA9IDBcclxuICAgIHRoaXMuYWx0aXR1ZGUgPSAwXHJcbiAgICB0aGlzLnZhcG9yID0gMFxyXG4gICAgdGhpcy5kZXdwb2ludCA9IDBcclxuICAgIHRoaXMubGFwc2UgPSAwXHJcblx0fVxyXG5cclxuXHR0b0pTT04oKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzdGFydDogdGhpcy5zdGFydCxcclxuXHQgICAgY2xvdWRiYXNlOiB0aGlzLmNsb3VkYmFzZSxcclxuXHQgICAgdGVtcDogdGhpcy50ZW1wLFxyXG5cdCAgICBhbHRpdHVkZTogdGhpcy5hbHRpdHVkZSxcclxuXHQgICAgdmFwb3I6IHRoaXMudmFwb3IsXHJcblx0ICAgIGRld3BvaW50OiB0aGlzLmRld3BvaW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpbml0KHN0YXJ0KSB7XHJcblx0XHR0aGlzLnN0YXJ0ID0gc3RhcnRcclxuICAgIHRoaXMuY2xvdWRiYXNlID0gMFxyXG4gICAgdGhpcy50ZW1wID0gc3RhcnQudGVtcFxyXG4gICAgdGhpcy5hbHRpdHVkZSA9IDBcclxuICAgIHRoaXMudmFwb3IgPSBzdGFydC52YXBvclxyXG4gICAgdGhpcy5kZXdwb2ludCA9IHN0YXJ0LmRld3BvaW50XHJcbiAgICB0aGlzLmxhcHNlID0gTEFQU0VfUkFURVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgUmVhZG91dCB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmFsdGl0dWRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbHRpdHVkZXJlYWRvdXRcIilcclxuXHRcdHRoaXMudGVtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVtcHJlYWRvdXRcIilcclxuXHRcdHRoaXMudmFwb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZhcG9ycmVhZG91dFwiKVxyXG5cdFx0dGhpcy5kZXdwb2ludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV3cG9pbnRyZWFkb3V0XCIpXHJcblx0fVxyXG5cclxuXHR1cGRhdGUodHJpYWwpIHtcclxuXHRcdHRoaXMuYWx0aXR1ZGUudmFsdWUgPSB0cmlhbC5hbHRpdHVkZS50b0ZpeGVkKDEpXHJcblx0XHR0aGlzLnRlbXAudmFsdWUgPSB0cmlhbC50ZW1wLnRvRml4ZWQoMSlcclxuXHRcdHRoaXMudmFwb3IudmFsdWUgPSB0cmlhbC52YXBvci50b0ZpeGVkKDEpXHJcblx0XHR0aGlzLmRld3BvaW50LnZhbHVlID0gdHJpYWwuZGV3cG9pbnQudG9GaXhlZCgxKVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgU2V0dGluZ3Mge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5yZWFkb3V0ID0gbmV3IFJlYWRvdXQoKVxyXG5cdFx0dGhpcy50ZW1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZW1wXCIpXHJcblx0XHR0aGlzLnZhcG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2YXBvclwiKVxyXG5cdFx0dGhpcy5kZXdwb2ludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGV3cG9pbnRcIilcclxuXHRcdHRoaXMudGVtcG91dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVtcG91dFwiKVxyXG5cdFx0dGhpcy52YXBvcm91dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmFwb3JvdXRcIilcclxuXHRcdHRoaXMuZGV3cG9pbnRvdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRld3BvaW50b3V0XCIpXHJcblx0XHR0aGlzLm11dGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11dGVcIilcclxuXHRcdHRoaXMubGlzdGVuZXIgPSBudWxsXHJcblx0XHRmdW5jdGlvbiBzbGlkZWYoZSxpbnB1dCwgb3V0LCBmKSB7XHJcblx0ICAgIFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdCAgICBcdG91dC52YWx1ZSA9IGlucHV0LnZhbHVlQXNOdW1iZXJcclxuXHQgICAgXHRpZiAoZikgZihpbnB1dClcclxuXHRcdH1cclxuXHRcdC8vIElFIGRvZXNuJ3QgaGF2ZSBhbiBpbnB1dCBldmVudCBidXQgYSBjaGFuZ2UgZXZlbnRcclxuXHRcdGxldCBldmVudCA9IC9tc2llfHRyaWRlbnQvZy50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpP1wiY2hhbmdlXCI6XCJpbnB1dFwiXHJcblx0XHR0aGlzLnRlbXAuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZSA9PiBzbGlkZWYoZSx0aGlzLnRlbXAsdGhpcy50ZW1wb3V0LHRoaXMubGlzdGVuZXIpKVxyXG5cdFx0dGhpcy52YXBvci5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBlID0+IHNsaWRlZihlLHRoaXMudmFwb3IsdGhpcy52YXBvcm91dCx0aGlzLmxpc3RlbmVyKSlcclxuXHRcdC8vdGhpcy5kZXdwb2ludC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBlID0+IHNsaWRlZihlLHRoaXMuZGV3cG9pbnQsdGhpcy5kZXdwb2ludG91dCx0aGlzLmxpc3RlbmVyKSlcclxuXHR9XHJcblxyXG5cdGdldFRlbXAoKSB7IHJldHVybiB0aGlzLnRlbXAudmFsdWVBc051bWJlciB9XHJcblxyXG5cdGdldFZhcG9yKCkgeyByZXR1cm4gdGhpcy52YXBvci52YWx1ZUFzTnVtYmVyIH1cclxuXHJcblx0Z2V0RGV3cG9pbnQoKSB7IHJldHVybiB0aGlzLmRld3BvaW50LnZhbHVlQXNOdW1iZXIgfVxyXG5cclxuXHRzZXRUZW1wKHZhbHVlKSB7XHJcblx0XHR0aGlzLnRlbXAudmFsdWUgPSB2YWx1ZVxyXG5cdFx0dGhpcy50ZW1wb3V0LnZhbHVlID0gdmFsdWUudG9GaXhlZCgxKVxyXG5cdFx0dGhpcy5yZWFkb3V0LnRlbXAudmFsdWUgPSB0aGlzLnRlbXBvdXQudmFsdWVcclxuXHR9XHJcblxyXG5cdHNldFZhcG9yKHZhbHVlKSB7XHJcblx0XHR0aGlzLnZhcG9yLnZhbHVlID0gdmFsdWVcclxuXHRcdHRoaXMudmFwb3JvdXQudmFsdWUgPSB2YWx1ZS50b0ZpeGVkKDEpXHJcblx0XHR0aGlzLnJlYWRvdXQudmFwb3IudmFsdWUgPSB0aGlzLnZhcG9yb3V0LnZhbHVlXHJcblx0XHR0aGlzLnNldERld3BvaW50KGRld3BvaW50KHZhbHVlKSlcclxuXHR9XHJcblxyXG5cdHNldERld3BvaW50KHZhbHVlKSB7XHJcblx0XHR0aGlzLmRld3BvaW50LnZhbHVlID0gdmFsdWVcclxuXHRcdHRoaXMuZGV3cG9pbnRvdXQudmFsdWUgPSB2YWx1ZS50b0ZpeGVkKDEpXHJcblx0XHR0aGlzLnJlYWRvdXQuZGV3cG9pbnQudmFsdWUgPSB0aGlzLmRld3BvaW50b3V0LnZhbHVlXHJcblx0fVxyXG5cclxuXHR1cGRhdGVSZWFkb3V0KHRyaWFsKSB7XHJcblx0XHR0aGlzLnJlYWRvdXQudXBkYXRlKHRyaWFsKVxyXG5cdH1cclxuXHJcblx0YWRkTGlzdGVuZXIobGlzdGVuZXIpIHsgdGhpcy5saXN0ZW5lciA9IGxpc3RlbmVyIH1cclxufVxyXG5cclxuY2xhc3MgQnV0dG9ucyB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLnJ1biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicnVuXCIpXHJcblx0XHR0aGlzLnBhdXNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXVzZVwiKVxyXG5cdFx0dGhpcy5yZXN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0XCIpXHJcblx0XHR0aGlzLm11dGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11dGVcIilcclxuXHR9XHJcblxyXG5cdGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XHJcblx0XHR0aGlzLnJ1bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBsaXN0ZW5lcihlKSlcclxuXHRcdHRoaXMucGF1c2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gbGlzdGVuZXIoZSkpXHJcblx0XHR0aGlzLnJlc3RhcnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gbGlzdGVuZXIoZSkpXHJcblx0fVxyXG5cclxuXHRtdXRlKCkgeyByZXR1cm4gdGhpcy5tdXRlLmNoZWNrZWQgfVxyXG59XHJcblxyXG5jbGFzcyBFVEdyYXBoIGV4dGVuZHMgR3JhcGgge1xyXG5cdGNvbnN0cnVjdG9yKHN0YWdlLCBzZXR0aW5ncykge1xyXG5cdFx0c3VwZXIoe1xyXG5cdFx0XHRzdGFnZTogc3RhZ2UsXHJcblx0XHRcdHc6IDIwMCxcclxuXHRcdFx0aDogMjAwLFxyXG5cdFx0XHR4bGFiZWw6IFwiVGVtcGVyYXR1cmUoQylcIixcclxuXHRcdFx0eWxhYmVsOiBcIlZhcG9yIFByZXNzdXJlKG1iKVwiLFxyXG5cdFx0XHR4c2NhbGU6IFwibGluZWFyXCIsXHJcblx0XHRcdHlzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0bWluWDogLTIwLFxyXG5cdFx0XHRtYXhYOiAzMCxcclxuXHRcdFx0bWluWTogMCxcclxuXHRcdFx0bWF4WTogNTAsXHJcblx0XHRcdG1ham9yWDogMTAsXHJcblx0XHRcdG1pbm9yWDogNSxcclxuXHRcdFx0bWFqb3JZOiAxMCxcclxuXHRcdFx0bWlub3JZOiA1XHJcblx0XHR9KVxyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzXHJcblx0XHR0aGlzLmxhc3RoID0gMFxyXG5cdFx0dGhpcy5sZWFmID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImFzc2V0cy9sZWFmLmdpZlwiKVxyXG5cdFx0dGhpcy5tYXJrZXIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0dGhpcy5tYXJrZXIuZ3JhcGhpY3MuYmVnaW5GaWxsKFwiIzAwMFwiKS5kcmF3UmVjdCh0aGlzLnhheGlzLmdldExvYyh0aGlzLnRlbXApLTIsdGhpcy55YXhpcy5nZXRMb2ModGhpcy52YXBvciktMiw0LDQpXHJcblx0XHRzdGFnZS5hZGRDaGlsZCh0aGlzLmxlYWYpXHJcblx0XHRzdGFnZS5hZGRDaGlsZCh0aGlzLm1hcmtlcilcclxuXHRcdHRoaXMuc2V0dGluZ3MuYWRkTGlzdGVuZXIoc2xpZGVyID0+IHtcclxuICAgICAgaWYgKHNsaWRlci5pZCA9PSBcInRlbXBcIikge1xyXG4gICAgICAgICAgdGhpcy50ZW1wID0gc2xpZGVyLnZhbHVlQXNOdW1iZXJcclxuICAgICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0VGVtcChzbGlkZXIudmFsdWVBc051bWJlcilcclxuICAgICAgfSBlbHNlIGlmIChzbGlkZXIuaWQgPT0gXCJ2YXBvclwiKSB7XHJcbiAgICAgICAgICB0aGlzLnZhcG9yID0gc2xpZGVyLnZhbHVlQXNOdW1iZXJcclxuICAgICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0VmFwb3IodGhpcy52YXBvcilcclxuICAgICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0RGV3cG9pbnQoZGV3cG9pbnQodGhpcy52YXBvcikpXHJcbiAgICAgIH0gZWxzZSBpZiAoc2xpZGVyLmlkID09IFwiZGV3cG9pbnRcIikge1xyXG4gICAgICAgICAgdGhpcy5kZXdwb2ludCA9IHNsaWRlci52YWx1ZUFzTnVtYmVyXHJcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnNldERld3BvaW50KHRoaXMuZGV3cG9pbnQpXHJcbiAgICAgICAgICB0aGlzLnZhcG9yID0gdmFwb3IodGhpcy5kZXdwb2ludClcclxuICAgICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0VmFwb3IodGhpcy52YXBvcilcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1vdmVNYXJrZXIodHJ1ZSlcclxuXHRcdH0pXHJcblx0XHR0aGlzLmljZWdyYXBoID0gbmV3IEljZUdyYXBoKHN0YWdlKVxyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkge1xyXG5cdFx0dGhpcy50ZW1wID0gdGhpcy5zZXR0aW5ncy5nZXRUZW1wKClcclxuXHRcdHRoaXMudmFwb3IgPSB0aGlzLnNldHRpbmdzLmdldFZhcG9yKClcclxuXHRcdHN1cGVyLnJlbmRlcigpXHJcblx0XHR0aGlzLnBsb3RTYXR1cmF0aW9uKClcclxuXHRcdHRoaXMuaWNlZ3JhcGgucmVuZGVyKClcclxuXHRcdHRoaXMubW92ZU1hcmtlcih0cnVlKVxyXG5cdH1cclxuXHJcblx0cGxvdFNhdHVyYXRpb24oKSB7XHJcbiAgICBmb3IgKGxldCB0ID0gdGhpcy54YXhpcy5taW47IHQgPCAwOyB0KyspIHRoaXMucGxvdCh0LGljZXNhdHVyYXRpb24odCkpXHJcbiAgICBmb3IgKGxldCB0ID0gMDsgdCA8PSB0aGlzLnhheGlzLm1heDsgdCsrKSB0aGlzLnBsb3QodCxzYXR1cmF0aW9uKHQpKVxyXG4gICAgdGhpcy5lbmRQbG90KClcclxuXHR9XHJcblxyXG5cdGNsZWFyKCkge1xyXG5cdFx0c3VwZXIuY2xlYXIoKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLmxlYWYpXHJcblx0fVxyXG5cclxuXHRtb3ZlTGVhZih4LHkpIHtcclxuXHRcdHRoaXMubGVhZi54ID0geC0xMFxyXG5cdFx0dGhpcy5sZWFmLnkgPSB5LTEwXHJcblx0fVxyXG5cclxuXHRzaG93TGVhZigpIHtcclxuICAgbGV0IHggPSB0aGlzLnhheGlzLmdldExvYyh0aGlzLnRlbXApXHJcbiAgIGxldCB5ID0gdGhpcy55YXhpcy5nZXRMb2ModGhpcy52YXBvcilcclxuICAgdGhpcy5tb3ZlTGVhZih4LHkpXHJcblx0fVxyXG5cclxuICAgIG1vdmVNYXJrZXIodXBkYXRlU2V0dGluZ3MpIHtcclxuICAgICAgbGV0IHNhdCA9IHNhdHVyYXRpb24odGhpcy50ZW1wKVxyXG4gICAgICBpZiAodGhpcy52YXBvciA+IHNhdCkge1xyXG4gICAgICBcdHRoaXMudmFwb3IgPSBzYXRcclxuICAgICAgXHRpZiAodXBkYXRlU2V0dGluZ3MgPT09IHRydWUpIHtcclxuICAgICAgXHRcdHRoaXMuc2V0dGluZ3Muc2V0VGVtcCh0aGlzLnRlbXApXHJcbiAgICAgIFx0XHR0aGlzLnNldHRpbmdzLnNldFZhcG9yKHNhdClcclxuICAgICAgXHRcdHRoaXMuc2V0dGluZ3Muc2V0RGV3cG9pbnQoZGV3cG9pbnQoc2F0KSlcclxuICAgICAgXHR9XHJcbiAgICAgIH1cclxuICAgICAgbGV0IHggPSB0aGlzLnhheGlzLmdldExvYyh0aGlzLnRlbXApXHJcbiAgICAgIGxldCB5ID0gdGhpcy55YXhpcy5nZXRMb2ModGhpcy52YXBvcilcclxuICAgICAgdGhpcy5tYXJrZXIueCA9IHggLSAyXHJcbiAgICAgIHRoaXMubWFya2VyLnkgPSB5IC0gMlxyXG4gICAgICBpZiAodXBkYXRlU2V0dGluZ3MgPT09IHRydWUpIHRoaXMubW92ZUxlYWYoeCx5KVxyXG4gICAgfVxyXG5cclxuXHR1cGRhdGUodHJpYWwpIHtcclxuXHRcdHRoaXMudGVtcCA9IHRyaWFsLnRlbXBcclxuXHRcdHRoaXMudmFwb3IgPSB0cmlhbC52YXBvclxyXG5cdFx0dGhpcy5wbG90KHRyaWFsLnRlbXAsdHJpYWwudmFwb3IpXHJcblx0XHR0aGlzLm1vdmVNYXJrZXIoZmFsc2UpXHJcblx0XHR0aGlzLnNob3dMZWFmKClcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIEFUR3JhcGggZXh0ZW5kcyBHcmFwaCB7XHJcblx0Y29uc3RydWN0b3Ioc3RhZ2UpIHtcclxuXHRcdHN1cGVyKHtcclxuXHRcdFx0c3RhZ2U6IHN0YWdlLFxyXG5cdFx0XHR3OiAyMDAsXHJcblx0XHRcdGg6IDIwMCxcclxuXHRcdFx0eGxhYmVsOiBcIlRlbXBlcmF0dXJlKEMpXCIsXHJcblx0XHRcdHlsYWJlbDogXCJBbHRpdHVkZShrbSlcIixcclxuXHRcdFx0eHNjYWxlOiBcImxpbmVhclwiLFxyXG5cdFx0XHR5c2NhbGU6IFwibGluZWFyXCIsXHJcblx0XHRcdG1pblg6IC0yMCxcclxuXHRcdFx0bWF4WDogMzAsXHJcblx0XHRcdG1pblk6IDAsXHJcblx0XHRcdG1heFk6IDQsXHJcblx0XHRcdG1ham9yWDogMTAsXHJcblx0XHRcdG1pbm9yWDogNSxcclxuXHRcdFx0bWFqb3JZOiAxLFxyXG5cdFx0XHRtaW5vclk6IDAuNVxyXG5cdFx0fSlcclxuXHRcdHRoaXMudGVtcCA9IDIwXHJcblx0XHR0aGlzLmFsdGl0dWRlID0gMFxyXG5cdFx0dGhpcy5jbG91ZGJhc2UgPSAwXHJcblx0fVxyXG5cclxuXHR1cGRhdGUodHJpYWwpIHtcclxuXHRcdHRoaXMucGxvdCh0cmlhbC50ZW1wLHRyaWFsLmFsdGl0dWRlKVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgSWNlR3JhcGggZXh0ZW5kcyBHcmFwaCB7XHJcblx0Y29uc3RydWN0b3Ioc3RhZ2UpIHtcclxuXHRcdHN1cGVyKHtcclxuXHRcdFx0c3RhZ2U6IHN0YWdlLFxyXG5cdFx0XHR4OiA2MCxcclxuXHRcdFx0eTogMTEwLFxyXG5cdFx0XHR3OiA3NSxcclxuXHRcdFx0aDogMTAwLFxyXG5cdFx0XHR4bGFiZWw6IFwiQ1wiLFxyXG5cdFx0XHR4c2NhbGU6IFwibGluZWFyXCIsXHJcblx0XHRcdHlzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0bWluWDogLTE1LFxyXG5cdFx0XHRtYXhYOiAxLFxyXG5cdFx0XHRtaW5ZOiAxLFxyXG5cdFx0XHRtYXhZOiA1LFxyXG5cdFx0XHRtYWpvclg6IDUsXHJcblx0XHRcdG1ham9yWTogMSxcclxuXHRcdFx0YmFja2dyb3VuZDogXCIjRUVFXCJcclxuXHRcdH0pXHJcblx0XHRsZXQgbGlxdWlkID0gbmV3IGNyZWF0ZWpzLlRleHQoXCJMaXF1aWRcIixcIjEwcHggQXJpYWxcIixcIiMwMDBcIilcclxuXHRcdGxpcXVpZC54ID0gNjVcclxuXHRcdGxpcXVpZC55ID0gNDBcclxuXHRcdHN0YWdlLmFkZENoaWxkKGxpcXVpZClcclxuXHRcdGxldCBpY2UgPSBuZXcgY3JlYXRlanMuVGV4dChcIkljZVwiLFwiMTBweCBBcmlhbFwiLFwiIzAwMFwiKVxyXG5cdFx0aWNlLnggPSA5MFxyXG5cdFx0aWNlLnkgPSA3MFxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQoaWNlKVxyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkge1xyXG5cdFx0c3VwZXIucmVuZGVyKClcclxuICAgIGZvciAobGV0IHQgPSB0aGlzLnhheGlzLm1pbjsgdCA8PSB0aGlzLnhheGlzLm1heDsgdCsrKSB0aGlzLnBsb3QodCxzYXR1cmF0aW9uKHQpKVxyXG4gICAgdGhpcy5lbmRQbG90KClcclxuICAgIGZvciAobGV0IHQgPSB0aGlzLnhheGlzLm1pbjsgdCA8PSB0aGlzLnhheGlzLm1heDsgdCsrKSB0aGlzLnBsb3QodCxpY2VzYXR1cmF0aW9uKHQpKVxyXG4gICAgdGhpcy5lbmRQbG90KClcclxuXHR9XHJcblxyXG59XHJcblxyXG5jbGFzcyBNdG4ge1xyXG5cdGNvbnN0cnVjdG9yKHN0YWdlLCBzZXR0aW5ncywgZmluaXNoKSB7XHJcblx0XHR0aGlzLnN0YWdlID0gc3RhZ2VcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5nc1xyXG5cdFx0dGhpcy5maW5pc2ggPSBmaW5pc2hcclxuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoe2lkOiBcInRodW5kZXJcIiwgc3JjOlwiYXNzZXRzL3RodW5kZXIubXAzXCJ9KVxyXG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCh7aWQ6IFwid2luZFwiLCBzcmM6XCJhc3NldHMvd2luZC5tcDNcIn0pXHJcblx0XHR0aGlzLndpbmQgPSBudWxsXHJcblx0XHR0aGlzLnRodW5kZXIgPSBudWxsXHJcblx0XHR0aGlzLm10biA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJhc3NldHMvbW91bnRhaW4ucG5nXCIpXHJcblx0XHR0aGlzLmxlYWYgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiYXNzZXRzL2xlYWYuZ2lmXCIpXHJcblx0XHR0aGlzLmNsb3VkID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImFzc2V0cy90aHVuZGVyY2xvdWQucG5nXCIpXHJcblx0XHR0aGlzLmJvbHQgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiYXNzZXRzL2xpZ2h0bmluZy5wbmdcIilcclxuXHRcdHRoaXMubGVhZnR3ZWVuID0gbnVsbFxyXG5cdFx0dGhpcy5tdG4ueCA9IDBcclxuXHRcdHRoaXMubXRuLnkgPSAwXHJcblx0XHR0aGlzLm10bi5zY2FsZVggPSAwLjVcclxuXHRcdHRoaXMubXRuLnNjYWxlWSA9IDAuNVxyXG5cdFx0dGhpcy5ib2x0LnggPSAtMTAwXHJcblx0XHR0aGlzLmJvbHQuc2NhbGVYID0gMC4wMTVcclxuXHRcdHRoaXMuYm9sdC5zY2FsZVkgPSAwLjAxNVxyXG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2VcclxuXHRcdHRoaXMubGlnaHRuaW5nID0gZmFsc2VcclxuXHRcdHRoaXMubGlnaHR0aWNrID0gMFxyXG5cdFx0dGhpcy5wYXRoID0gWzUwLDE2NSwgNjAsMTU1LCA3NCwxNTIsIDgwLDE0MCwgOTAsMTMxLCAxMDAsMTI1LCAxMTIsMTIyLCAxMjAsMTEwLCAxMzcsOTIsIDE0MCw3NSwgMTUxLDY2LCAxNTAsNjYsIDE3Myw2NiwgMTg1LDY2LCAyMDQsNzAsIDIxMCw4MCwgMjIxLDkyLCAyMjEsOTUsIDIyNCwxMDUsIDIzMCwxMTAsIDI0NiwxMjEsIDI1MCwxMzAsIDI2OCwxNDEsIDI4MCwxNjUsIDI5MCwxNjVdXHJcblx0XHR0aGlzLnJlc3VsdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3VsdHNfdGFibGVcIilcclxuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlX2FsbFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixldmVudCA9PiB7XHJcblx0XHRcdGlmIChjb25maXJtKFwiRGVsZXRlIGFsbCBkYXRhP1wiKSkgdGhpcy5kZWxldGVSZXN1bHRzKClcclxuXHRcdH0pXHJcblx0XHR0aGlzLnJlc2V0KClcclxuXHRcdHRoaXMuc2hvd1Jlc3VsdHMoKVxyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkge1xyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLm10bilcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5sZWFmKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLmNsb3VkKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLmJvbHQpXHJcblx0XHR0aGlzLmxlYWYueCA9IDUwXHJcblx0XHR0aGlzLmxlYWYueSA9IDE2NVxyXG5cdFx0dGhpcy5jbG91ZC54ID0gLTEwMDBcclxuXHRcdHRoaXMuY2xvdWQueSA9IDBcclxuXHRcdHRoaXMubGFzdGFsdCA9IDBcclxuXHRcdHRoaXMuY2xvdWQuc2NhbGVYID0gMC4xXHJcblx0XHR0aGlzLmNsb3VkLnNjYWxlWSA9IDAuMDVcclxuXHR9XHJcblxyXG5cdGNsZWFyKCkge1xyXG5cdFx0dGhpcy5zdGFnZS5yZW1vdmVBbGxDaGlsZHJlbigpXHJcblx0XHR0aGlzLnJlbmRlcigpXHJcblx0fVxyXG5cdHBsYXkoKSB7XHJcblx0XHR0aGlzLnJlc2V0KClcclxuXHRcdHRoaXMubGVhZnR3ZWVuID0gY3JlYXRlanMuVHdlZW4uZ2V0KHRoaXMubGVhZikudG8oe2d1aWRlOntwYXRoOnRoaXMucGF0aH19LDEwMDAwKVxyXG5cdFx0dGhpcy5sZWFmdHdlZW4uY2FsbCgoKSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLndpbmQpIHRoaXMud2luZC5zdG9wKClcclxuXHRcdFx0dGhpcy5ydW5uaW5nID0gZmFsc2VcclxuXHRcdFx0dGhpcy5hZGRUcmlhbCgpXHJcblx0XHRcdGlmICh0aGlzLmZpbmlzaCkgdGhpcy5maW5pc2goKVxyXG5cdFx0fSlcclxuXHRcdHRoaXMucnVubmluZyA9IHRydWVcclxuXHRcdHRoaXMubGVhZnR3ZWVuLnBsYXkoKVxyXG5cdFx0dGhpcy5wbGF5U291bmQoXCJ3aW5kXCIpXHJcblx0fVxyXG5cclxuXHRzaG93UmVzdWx0cygpIHtcclxuXHRcdGZvciAobGV0IGkgPSB0aGlzLnJlc3VsdHMuY2hpbGRyZW4ubGVuZ3RoLTE7IGkgPiAxIDsgaS0tKSB0aGlzLnJlc3VsdHMucmVtb3ZlQ2hpbGQodGhpcy5yZXN1bHRzLmNoaWxkcmVuW2ldKVxyXG5cdFx0bGV0IHRyaWFscyA9IGdldEFuc3dlcigpIHx8IFtdXHJcblx0XHR0cmlhbHMuZm9yRWFjaChqc29uID0+IHRoaXMucmVzdWx0cy5hcHBlbmRDaGlsZChnZXRSb3coanNvbikpKVxyXG5cdFx0c2V0QW5zd2VyKHRyaWFscylcclxuXHR9XHJcblxyXG5cdGFkZFRyaWFsKCkge1xyXG5cdFx0bGV0IHRyaWFscyA9IGdldEFuc3dlcigpIHx8IFtdXHJcblx0XHRsZXQganNvbiA9IHRoaXMudHJpYWwudG9KU09OKClcclxuXHRcdHNldEFuc3dlcih0cmlhbHMuY29uY2F0KGpzb24pKVxyXG5cdFx0dGhpcy5yZXN1bHRzLmFwcGVuZENoaWxkKGdldFJvdyhqc29uKSlcclxuXHR9XHJcblxyXG5cdGRlbGV0ZVRyaWFsKHJvdykge1xyXG5cdFx0bGV0IHRyaWFscyA9IGdldEFuc3dlcigpIHx8IFtdXHJcblx0XHR0cmlhbHMuc3BsaWNlKHJvdywxKVxyXG5cdFx0c2V0QW5zd2VyKHRyaWFscylcclxuXHRcdHRoaXMuc2hvd1Jlc3VsdHMoKVxyXG5cdH1cclxuXHJcblx0ZGVsZXRlUmVzdWx0cygpIHtcclxuXHRcdHNldEFuc3dlcihbXSlcclxuXHRcdHRoaXMuc2hvd1Jlc3VsdHMoKVxyXG5cdH1cclxuXHJcblx0cGF1c2UocGF1c2UpIHtcclxuXHRcdHRoaXMubGVhZnR3ZWVuLnNldFBhdXNlZChwYXVzZSlcclxuXHRcdGlmICh0aGlzLndpbmQpIHRoaXMud2luZC5wYXVzZWQgPSBwYXVzZVxyXG5cdFx0aWYgKHRoaXMudGh1bmRlcikgdGhpcy50aHVuZGVyLnBhdXNlZCA9IHBhdXNlXHJcblx0XHR0aGlzLnJ1bm5pbmcgPSAhcGF1c2VcclxuXHR9XHJcblxyXG5cdHBsYXlTb3VuZChzb3VuZCkge1xyXG5cdFx0aWYgKCF0aGlzLnNldHRpbmdzLm11dGUuY2hlY2tlZCkge1xyXG5cdFx0XHRzd2l0Y2goc291bmQpIHtcclxuXHRcdFx0Y2FzZSBcIndpbmRcIjpcclxuXHRcdFx0XHR0aGlzLndpbmQgPSBjcmVhdGVqcy5Tb3VuZC5wbGF5KHNvdW5kLHtsb29wOiAyfSlcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwidGh1bmRlclwiOlxyXG5cdFx0XHRcdHRoaXMudGh1bmRlciA9IGNyZWF0ZWpzLlNvdW5kLnBsYXkoc291bmQpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKHRyaWFsKSB7XHJcblx0XHRsZXQgb2xkQSA9IHRyaWFsLmFsdGl0dWRlLCBvbGRUID0gdHJpYWwudGVtcFxyXG5cdFx0dHJpYWwuYWx0aXR1ZGUgPSA0KigxNjUgLSB0aGlzLmxlYWYueSkvMTY1XHJcblx0XHRpZiAodHJpYWwuYWx0aXR1ZGUgPCAwKSB0cmlhbC5hbHRpdHVkZSA9IDBcclxuXHRcdHRyaWFsLnZhcG9yICo9IHByZXNzdXJlKHRyaWFsLmFsdGl0dWRlKS9wcmVzc3VyZShvbGRBKVxyXG5cdFx0dHJpYWwudGVtcCArPSB0cmlhbC5sYXBzZSAqICh0cmlhbC5hbHRpdHVkZSAtIG9sZEEpXHJcblx0XHR0cmlhbC5kZXdwb2ludCA9IGRld3BvaW50KHRyaWFsLnZhcG9yKVxyXG5cdFx0bGV0IHNhdCA9IHNhdHVyYXRpb24odHJpYWwudGVtcClcclxuXHRcdGlmICh0cmlhbC52YXBvciA+IHNhdCkge1xyXG5cdFx0XHR0aGlzLmFuaW1hdGVDbG91ZHMoKVxyXG5cdFx0XHR0cmlhbC52YXBvciA9IHNhdFxyXG5cdFx0XHR0cmlhbC5sYXBzZSA9IC02LjBcclxuXHRcdH1cclxuXHRcdGlmICh0cmlhbC50ZW1wID4gb2xkVCkgdHJpYWwubGFwc2UgPSBMQVBTRV9SQVRFXHJcblx0XHR0aGlzLnNldHRpbmdzLnVwZGF0ZVJlYWRvdXQodHJpYWwpXHJcblx0fVxyXG5cclxuXHRhbmltYXRlQ2xvdWRzKCkge1xyXG5cdFx0aWYgKHRoaXMudHJpYWwuY2xvdWRiYXNlID09IDApIHtcclxuXHRcdFx0dGhpcy50cmlhbC5jbG91ZGJhc2UgPSB0aGlzLnRyaWFsLmFsdGl0dWRlXHJcblx0XHRcdHRoaXMuY2xvdWQueCA9IHRoaXMubGVhZi54IC0gMlxyXG5cdFx0XHR0aGlzLmNsb3VkLnkgPSB0aGlzLmxlYWYueVxyXG5cdFx0XHR0aGlzLmJvbHQueSA9IHRoaXMuY2xvdWQueSArIDIwXHJcblx0XHRcdHRoaXMubGFzdHkgPSB0aGlzLmxlYWYueVxyXG5cdFx0fVxyXG5cdFx0aWYgKCh0aGlzLnRyaWFsLmFsdGl0dWRlIC0gdGhpcy5sYXN0YWx0KSA+IC4xKSB7XHJcblx0XHRcdHRoaXMubGFzdGFsdCA9IHRoaXMudHJpYWwuYWx0aXR1ZGVcclxuXHRcdFx0dGhpcy5jbG91ZC5zY2FsZVggKz0gLjAyMVxyXG5cdFx0XHR0aGlzLmNsb3VkLnNjYWxlWSArPSAuMDJcclxuXHRcdFx0dGhpcy5jbG91ZC55ID0gdGhpcy5sZWFmLnlcclxuXHRcdH1cclxuXHRcdGlmICghdGhpcy5saWdodG5pbmcgJiYgdGhpcy5sZWFmLnggPCAxNDAgJiYgdGhpcy50cmlhbC50ZW1wIDw9IC01ICYmICh0aGlzLnRyaWFsLmFsdGl0dWRlIC0gdGhpcy50cmlhbC5jbG91ZGJhc2UpID4gLjUpIHtcclxuXHRcdFx0dGhpcy5saWdodHRpY2sgPSAwXHJcblx0XHRcdHRoaXMubGlnaHRuaW5nID0gdHJ1ZVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmVzZXQoKSB7XHJcblx0XHR0aGlzLnRyaWFsID0gbmV3IFRyaWFsKClcclxuXHRcdHRoaXMudGVtcCA9IHRoaXMuc2V0dGluZ3MuZ2V0VGVtcCgpXHJcblx0XHR0aGlzLnZhcG9yID0gdGhpcy5zZXR0aW5ncy5nZXRWYXBvcigpXHJcblx0XHR0aGlzLmxhcHNlX3JhdGUgPSBMQVBTRV9SQVRFXHJcblx0XHR0aGlzLmxhc3RhbHQgPSAwXHJcblx0XHR0aGlzLnRyaWFsLmluaXQoe1xyXG5cdFx0XHR0ZW1wOiB0aGlzLnRlbXAsXHJcblx0XHRcdHZhcG9yOiB0aGlzLnZhcG9yLFxyXG5cdFx0XHRkZXdwb2ludDogZGV3cG9pbnQodGhpcy52YXBvcilcclxuXHRcdH0pXHJcblx0XHR0aGlzLnNldHRpbmdzLnVwZGF0ZVJlYWRvdXQodGhpcy50cmlhbClcclxuXHR9XHJcblxyXG5cdHRpY2soZXRncmFwaCwgYXRncmFwaCkge1xyXG5cdFx0aWYgKHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHR0aGlzLnVwZGF0ZSh0aGlzLnRyaWFsKVxyXG5cdFx0XHRldGdyYXBoLnVwZGF0ZSh0aGlzLnRyaWFsKVxyXG5cdFx0XHRhdGdyYXBoLnVwZGF0ZSh0aGlzLnRyaWFsKVxyXG5cdFx0XHRpZiAodGhpcy5saWdodG5pbmcgPT09IHRydWUpIHtcclxuXHRcdFx0XHRzd2l0Y2godGhpcy5saWdodHRpY2spIHtcclxuXHRcdFx0XHRjYXNlIDA6XHJcblx0XHRcdFx0XHR0aGlzLmJvbHQueCA9IHRoaXMuY2xvdWQueCArIDEwXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdGNhc2UgNTpcclxuXHRcdFx0XHRcdHRoaXMuYm9sdC54ICs9IDEwXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdGNhc2UgNzpcclxuXHRcdFx0XHRcdHRoaXMuYm9sdC54ICs9IDEwXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdGNhc2UgMTA6XHJcblx0XHRcdFx0XHR0aGlzLmJvbHQueCA9IC0xMDBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSA2MDpcclxuXHRcdFx0XHRcdHRoaXMucGxheVNvdW5kKFwidGh1bmRlclwiKVxyXG5cdFx0XHRcdFx0dGhpcy5saWdodG5pbmcgPSBmYWxzZVxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5saWdodHRpY2srK1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBNdG5TaW0ge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5tYWluc3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJtYWluY2FudmFzXCIpXHJcblx0XHR0aGlzLmV0c3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJldGdyYXBoXCIpXHJcblx0XHR0aGlzLmF0c3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJhdGdyYXBoXCIpXHJcblx0XHR0aGlzLmJ1dHRvbnMgPSBuZXcgQnV0dG9ucygpXHJcblx0XHR0aGlzLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKClcclxuXHRcdHRoaXMuZXRncmFwaCA9IG5ldyBFVEdyYXBoKHRoaXMuZXRzdGFnZSwgdGhpcy5zZXR0aW5ncylcclxuXHRcdHRoaXMuYXRncmFwaCA9IG5ldyBBVEdyYXBoKHRoaXMuYXRzdGFnZSlcclxuXHRcdHRoaXMubXRuID0gbmV3IE10bih0aGlzLm1haW5zdGFnZSwgdGhpcy5zZXR0aW5ncywgKCkgPT4ge1xyXG5cdFx0XHR0aGlzLmJ1dHRvbnMucmVzdGFydC5kaXNhYmxlZCA9IGZhbHNlXHJcblx0XHRcdHRoaXMuYnV0dG9ucy5wYXVzZS5kaXNhYmxlZCA9IHRydWVcclxuXHRcdH0pXHJcblx0XHR0aGlzLnBhdXNlID0gZmFsc2VcclxuXHRcdHRoaXMuYnV0dG9ucy5hZGRMaXN0ZW5lcihlID0+IHtcclxuXHRcdFx0c3dpdGNoKGUudGFyZ2V0LmlkKSB7XHJcblx0XHRcdGNhc2UgXCJydW5cIjpcclxuXHRcdFx0XHR0aGlzLmVuYWJsZVBsYXkoZmFsc2UpXHJcblx0XHRcdFx0dGhpcy5idXR0b25zLnBhdXNlLnZhbHVlID0gXCJQYXVzZVwiXHJcblx0XHRcdFx0dGhpcy5wYXVzZSA9IGZhbHNlXHJcblx0XHRcdFx0dGhpcy5tdG4ucGxheSgpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInBhdXNlXCI6XHJcblx0XHRcdFx0dGhpcy5wYXVzZSA9ICF0aGlzLnBhdXNlXHJcblx0XHRcdFx0dGhpcy5tdG4ucGF1c2UodGhpcy5wYXVzZSlcclxuXHRcdFx0XHRlLnRhcmdldC52YWx1ZSA9IHRoaXMucGF1c2U/IFwiUmVzdW1lXCI6XCJQYXVzZVwiXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInJlc3RhcnRcIjpcclxuXHRcdFx0XHR0aGlzLnJlc2V0KClcclxuXHRcdFx0XHR0aGlzLm10bi5jbGVhcigpXHJcblx0XHRcdFx0dGhpcy5ldGdyYXBoLmNsZWFyKClcclxuXHRcdFx0XHR0aGlzLmF0Z3JhcGguY2xlYXIoKVxyXG5cdFx0XHRcdHRoaXMuZXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0XHRcdHRoaXMuYXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0XHRcdHRoaXMubXRuLnJlc2V0KClcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHJlc2V0KCkge1xyXG5cdFx0dGhpcy5lbmFibGVQbGF5KHRydWUpXHJcblx0fVxyXG5cclxuXHRlbmFibGVQbGF5KHBsYXkpIHtcclxuXHRcdHRoaXMuYnV0dG9ucy5ydW4uZGlzYWJsZWQgPSAhcGxheVxyXG5cdFx0dGhpcy5idXR0b25zLnBhdXNlLmRpc2FibGVkID0gcGxheVxyXG5cdFx0dGhpcy5idXR0b25zLnJlc3RhcnQuZGlzYWJsZWQgPSAhcGxheVxyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkge1xyXG5cdFx0dGhpcy5idXR0b25zLnJ1bi5kaXNhYmxlZCA9IGZhbHNlXHJcblx0XHR0aGlzLmJ1dHRvbnMubXV0ZS5jaGVja2VkID0gZmFsc2VcclxuXHRcdHRoaXMuYnV0dG9ucy5wYXVzZS5kaXNhYmxlZCA9IHRydWVcclxuXHRcdHRoaXMuYnV0dG9ucy5yZXN0YXJ0LmRpc2FibGVkID0gdHJ1ZVxyXG5cdFx0dGhpcy5yZXNldCgpXHJcblx0XHR0aGlzLmV0Z3JhcGgucmVuZGVyKClcclxuXHRcdHRoaXMuYXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0dGhpcy5tdG4ucmVuZGVyKClcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5hZGRFdmVudExpc3RlbmVyKFwidGlja1wiLCBlID0+IHtcclxuXHRcdFx0dGhpcy5tdG4udGljayh0aGlzLmV0Z3JhcGgsIHRoaXMuYXRncmFwaClcclxuXHRcdFx0dGhpcy5ldHN0YWdlLnVwZGF0ZSgpXHJcblx0XHRcdHRoaXMuYXRzdGFnZS51cGRhdGUoKVxyXG5cdFx0XHR0aGlzLm1haW5zdGFnZS51cGRhdGUoKVxyXG5cdFx0fSlcclxuXHR9XHJcbn1cclxuXHJcbmxldCBtdG5zaW0gPSBuZXcgTXRuU2ltKClcclxubXRuc2ltLnJlbmRlcigpXHJcbiIsImNvbnN0IG1hcmdpblggPSA0MCwgbWFyZ2luWSA9IDMwLCBlbmRNYXJnaW4gPSA1XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBeGlzIHtcclxuXHRjb25zdHJ1Y3RvcihzcGVjKSB7XHJcblx0XHR0aGlzLnNwZWMgPSBzcGVjXHJcblx0XHR0aGlzLnN0YWdlID0gc3BlYy5zdGFnZVxyXG5cdFx0dGhpcy53ID0gc3BlYy5kaW0udyB8fCAxMDBcclxuXHRcdHRoaXMuaCA9IHNwZWMuZGltLmggfHwgMTAwXHJcblx0XHR0aGlzLm1pbiA9IHNwZWMuZGltLm1pbiB8fCAwXHJcblx0XHR0aGlzLm1heCA9IHNwZWMuZGltLm1heCB8fCAxMDBcclxuXHRcdHRoaXMuZm9udCA9IHNwZWMuZm9udCB8fCBcIjExcHggQXJpYWxcIlxyXG5cdFx0dGhpcy5jb2xvciA9IHNwZWMuY29sb3IgfHwgXCIjMDAwXCJcclxuXHRcdHRoaXMubGFiZWwgPSBzcGVjLmxhYmVsXHJcblx0XHR0aGlzLm1ham9yID0gc3BlYy5tYWpvciB8fCAxMFxyXG5cdFx0dGhpcy5taW5vciA9IHNwZWMubWlub3IgfHwgc3BlYy5tYWpvclxyXG5cdFx0dGhpcy5wcmVjaXNpb24gPSBzcGVjLnByZWNpc2lvbiB8fCAwXHJcblx0XHR0aGlzLnZlcnRpY2FsID0gc3BlYy5vcmllbnQgJiYgc3BlYy5vcmllbnQgPT0gXCJ2ZXJ0aWNhbFwiIHx8IGZhbHNlXHJcblx0XHR0aGlzLmxpbmVhciA9IHNwZWMuc2NhbGUgJiYgc3BlYy5zY2FsZSA9PSBcImxpbmVhclwiIHx8IGZhbHNlXHJcblx0XHR0aGlzLmludmVydCA9IHNwZWMuaW52ZXJ0IHx8IGZhbHNlXHJcblx0XHRpZiAoc3BlYy5kaW0ueCkge1xyXG5cdFx0XHR0aGlzLm9yaWdpblggPSBzcGVjLmRpbS54XHJcblx0XHRcdHRoaXMuZW5kWCA9IHRoaXMub3JpZ2luWCArIHRoaXMud1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5YID0gbWFyZ2luWFxyXG5cdFx0XHR0aGlzLmVuZFggPSB0aGlzLncgLSBlbmRNYXJnaW5cclxuXHRcdH1cclxuXHRcdGlmIChzcGVjLmRpbS55KSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWSA9IHNwZWMuZGltLnlcclxuXHRcdFx0dGhpcy5lbmRZID0gdGhpcy5vcmlnaW5ZIC0gdGhpcy5oICsgZW5kTWFyZ2luXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLm9yaWdpblkgPSB0aGlzLmggLSBtYXJnaW5ZXHJcblx0XHRcdHRoaXMuZW5kWSA9IGVuZE1hcmdpblxyXG5cdFx0fVxyXG5cdFx0dGhpcy5zY2FsZSA9IHRoaXMudmVydGljYWwgPyBNYXRoLmFicyh0aGlzLmVuZFkgLSB0aGlzLm9yaWdpblkpLyh0aGlzLm1heCAtIHRoaXMubWluKTogTWF0aC5hYnModGhpcy5lbmRYIC0gdGhpcy5vcmlnaW5YKS8odGhpcy5tYXggLSB0aGlzLm1pbilcclxuXHR9XHJcblxyXG5cdGRyYXdMaW5lKHgxLHkxLHgyLHkyKSB7XHJcblx0XHRsZXQgbGluZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRsaW5lLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKDEpXHJcblx0XHRsaW5lLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpXHJcblx0XHRsaW5lLmdyYXBoaWNzLm1vdmVUbyh4MSwgeTEpXHJcblx0XHRsaW5lLmdyYXBoaWNzLmxpbmVUbyh4MiwgeTIpXHJcblx0XHRsaW5lLmdyYXBoaWNzLmVuZFN0cm9rZSgpO1xyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChsaW5lKVxyXG5cdH1cclxuXHJcblx0ZHJhd1RleHQodGV4dCx4LHkpIHtcclxuXHRcdHRleHQueCA9IHhcclxuXHRcdHRleHQueSA9IHlcclxuXHRcdGlmICh0aGlzLnZlcnRpY2FsICYmIHRleHQudGV4dCA9PSB0aGlzLmxhYmVsKSB0ZXh0LnJvdGF0aW9uID0gMjcwXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRleHQpXHJcblx0XHRyZXR1cm4gdGV4dFxyXG5cdH1cclxuXHJcblx0Z2V0VGV4dChzKSB7IHJldHVybiBuZXcgY3JlYXRlanMuVGV4dChzLHRoaXMuZm9udCx0aGlzLmNvbG9yKSB9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgXHRsZXQgbGFiZWwgPSB0aGlzLmdldFRleHQodGhpcy5sYWJlbClcclxuICAgIFx0bGV0IGxhYmVsX2JuZHMgPSBsYWJlbC5nZXRCb3VuZHMoKVxyXG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLHRoaXMub3JpZ2luWSx0aGlzLm9yaWdpblgsdGhpcy5lbmRZKVxyXG4gICAgICAgICAgICBsZXQgbWluWExhYmVsID0gdGhpcy5vcmlnaW5YXHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1ham9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLTQsdix0aGlzLm9yaWdpblgrNCx2KVxyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFRleHQodmFsLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pKVxyXG4gICAgICAgICAgICAgICAgbGV0IGJuZHMgPSB0ZXh0LmdldEJvdW5kcygpXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHRoaXMub3JpZ2luWC01LWJuZHMud2lkdGhcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RleHQodGV4dCx4LHYrYm5kcy5oZWlnaHQvMi0xMClcclxuICAgICAgICAgICAgICAgIGlmICh4IDwgbWluWExhYmVsKSBtaW5YTGFiZWwgPSB4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLm9yaWdpblgtMix2LHRoaXMub3JpZ2luWCsyLHYpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuc3BlYy5sYWJlbCkge1xyXG5cdCAgICAgICAgICAgIGxldCB5ID0gdGhpcy5vcmlnaW5ZIC0gKHRoaXMub3JpZ2luWSAtIGxhYmVsX2JuZHMud2lkdGgpLzJcclxuXHQgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KGxhYmVsLCBtaW5YTGFiZWwgLSBsYWJlbF9ibmRzLmhlaWdodCwgeSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLHRoaXMub3JpZ2luWSwgdGhpcy5lbmRYLHRoaXMub3JpZ2luWSlcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3BlYy5sYWJlbCkge1xyXG5cdCAgICAgICAgICAgIGxldCB4ID0gKHRoaXMudyAtIGVuZE1hcmdpbiAtIGxhYmVsX2JuZHMud2lkdGgpLzJcclxuXHQgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KGxhYmVsLCB0aGlzLm9yaWdpblggKyB4LCB0aGlzLm9yaWdpblkgKyAxNSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5tYWpvcikgIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh2LHRoaXMub3JpZ2luWS00LHYsdGhpcy5vcmlnaW5ZKzQpXHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0VGV4dCh2YWwudG9GaXhlZCh0aGlzLnByZWNpc2lvbikpXHJcbiAgICAgICAgICAgICAgICBsZXQgYm5kcyA9IHRleHQuZ2V0Qm91bmRzKClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RleHQodGV4dCx2LWJuZHMud2lkdGgvMix0aGlzLm9yaWdpblkrNClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5taW5vcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHYsdGhpcy5vcmlnaW5ZLTIsdix0aGlzLm9yaWdpblkrMilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRMb2ModmFsKSB7XHJcbiAgICAgICAgbGV0IGl2YWwgPSB0aGlzLmxpbmVhcj8gTWF0aC5yb3VuZCh0aGlzLnNjYWxlKih2YWwtdGhpcy5taW4pKTogTWF0aC5yb3VuZChNYXRoLmxvZyh0aGlzLnNjYWxlKih2YWwtdGhpcy5taW4pKSlcclxuICAgICAgICByZXR1cm4gdGhpcy52ZXJ0aWNhbD90aGlzLm9yaWdpblkgLSBpdmFsOnRoaXMub3JpZ2luWCArIGl2YWxcclxuICAgIH1cclxuXHJcbiAgICBnZXRWYWx1ZSh2KSB7XHJcbiAgICBcdGxldCBmYWN0b3IgPSB0aGlzLnZlcnRpY2FsPyAodGhpcy5vcmlnaW5ZIC0gdikvdGhpcy5vcmlnaW5ZOih2IC0gdGhpcy5vcmlnaW5YKS8odGhpcy53IC0gdGhpcy5vcmlnaW5YKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbiArICh0aGlzLm1heCAtIHRoaXMubWluKSAqIGZhY3RvclxyXG4gICAgfVxyXG5cclxuICAgIGlzSW5zaWRlKHYpIHtcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICAgICAgcmV0dXJuIHYgPj0gdGhpcy5vcmlnaW5ZICYmIHYgPD0gKHRoaXMub3JpZ2luWSArIHRoaXMuaClcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB2ID49IHRoaXMub3JpZ2luWCAmJiB2IDw9ICh0aGlzLm9yaWdpblkgKyB0aGlzLncpXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IEF4aXMgZnJvbSBcIi4vYXhpc1wiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFwaCB7XHJcblx0Y29uc3RydWN0b3Ioc3BlYykge1xyXG5cdFx0dGhpcy5zdGFnZSA9IHNwZWMuc3RhZ2VcclxuXHRcdHRoaXMueGF4aXMgPSBuZXcgQXhpcyh7XHJcblx0XHRcdHN0YWdlOiB0aGlzLnN0YWdlLFxyXG5cdFx0XHRsYWJlbDogc3BlYy54bGFiZWwsXHJcblx0XHRcdGRpbTogeyB4OiBzcGVjLngsIHk6IHNwZWMueSwgdzogc3BlYy53LCBoOiBzcGVjLmgsIG1pbjogc3BlYy5taW5YLCBtYXg6IHNwZWMubWF4WCB9LFxyXG5cdFx0XHRvcmllbnQ6IFwiaG9yaXpvbnRhbFwiLFxyXG5cdFx0XHRzY2FsZTogc3BlYy54c2NhbGUsXHJcblx0XHRcdG1ham9yOiBzcGVjLm1ham9yWCxcclxuXHRcdFx0bWlub3I6IHNwZWMubWlub3JYLFxyXG5cdFx0XHRwcmVjaXNpb246IHNwZWMucHJlY2lzaW9uWCxcclxuXHRcdFx0aW52ZXJ0OiBzcGVjLnhpbnZlcnRcclxuXHRcdH0pXHJcblx0XHR0aGlzLnlheGlzID0gbmV3IEF4aXMoe1xyXG5cdFx0XHRzdGFnZTogdGhpcy5zdGFnZSxcclxuXHRcdFx0bGFiZWw6IHNwZWMueWxhYmVsLFxyXG5cdFx0XHRkaW06IHsgeDogc3BlYy54LCB5OiBzcGVjLnksIHc6IHNwZWMudywgaDogc3BlYy5oLCBtaW46IHNwZWMubWluWSwgbWF4OiBzcGVjLm1heFkgfSxcclxuXHRcdFx0b3JpZW50OiBcInZlcnRpY2FsXCIsXHJcblx0XHRcdHNjYWxlOiBzcGVjLnlzY2FsZSxcclxuXHRcdFx0bWFqb3I6IHNwZWMubWFqb3JZLFxyXG5cdFx0XHRtaW5vcjogc3BlYy5taW5vclksXHJcblx0XHRcdHByZWNpc2lvbjogc3BlYy5wcmVjaXNpb25ZLFxyXG5cdFx0XHRpbnZlcnQ6IHNwZWMueWludmVydFxyXG5cdFx0fSlcclxuXHRcdHRoaXMud2lkdGggPSAxXHJcblx0XHR0aGlzLmxhc3QgPSBudWxsXHJcblx0XHR0aGlzLm1hcmtlciA9IG51bGxcclxuXHRcdHRoaXMuY29sb3IgPSBcIiMwMDBcIlxyXG5cdFx0dGhpcy5kb3R0ZWQgPSBmYWxzZVxyXG5cdFx0aWYgKHNwZWMuYmFja2dyb3VuZCkge1xyXG5cdFx0XHRsZXQgYiA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRcdGIuZ3JhcGhpY3MuYmVnaW5TdHJva2UoXCIjQUFBXCIpLmJlZ2luRmlsbChzcGVjLmJhY2tncm91bmQpLmRyYXdSZWN0KHNwZWMueCxzcGVjLnktc3BlYy5oLHNwZWMudyxzcGVjLmgpLmVuZFN0cm9rZSgpXHJcblx0XHRcdGIuYWxwaGEgPSAwLjNcclxuXHRcdFx0c3BlYy5zdGFnZS5hZGRDaGlsZChiKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c2V0V2lkdGgod2lkdGgpIHtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aFxyXG5cdH1cclxuXHJcblx0c2V0RG90dGVkKGRvdHRlZCkge1xyXG5cdFx0dGhpcy5kb3R0ZWQgPSBkb3R0ZWRcclxuXHR9XHJcblxyXG5cdHNldENvbG9yKGNvbG9yKSB7XHJcblx0XHR0aGlzLmNvbG9yID0gY29sb3JcclxuXHRcdHRoaXMuZW5kUGxvdCgpXHJcblx0XHR0aGlzLm1hcmtlciA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcbiAgICBcdHRoaXMubWFya2VyLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKGNvbG9yKS5iZWdpbkZpbGwoY29sb3IpLmRyYXdSZWN0KDAsMCw0LDQpXHJcbiAgICBcdHRoaXMubWFya2VyLnggPSAtMTBcclxuICAgIFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLm1hcmtlcilcclxuXHR9XHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgXHR0aGlzLnhheGlzLnJlbmRlcigpXHJcbiAgICBcdHRoaXMueWF4aXMucmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcigpIHtcclxuICAgIFx0dGhpcy5zdGFnZS5yZW1vdmVBbGxDaGlsZHJlbigpXHJcbiAgICBcdHRoaXMuZW5kUGxvdCgpXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZU1hcmtlcih4LHkpIHtcclxuICAgIFx0aWYgKHRoaXMubWFya2VyKSB7XHJcbiAgICBcdFx0dGhpcy5tYXJrZXIueCA9IHgtMlxyXG4gICAgXHRcdHRoaXMubWFya2VyLnkgPSB5LTJcclxuXHJcbiAgICBcdH1cclxuICAgIH1cclxuXHJcblx0ZHJhd0xpbmUoeDEseTEseDIseTIpIHtcclxuXHRcdGxldCBsaW5lID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdGlmICh0aGlzLmRvdHRlZCA9PT0gdHJ1ZSlcclxuXHRcdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VEYXNoKFsyLDJdKS5zZXRTdHJva2VTdHlsZSh0aGlzLndpZHRoKS5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKS5tb3ZlVG8oeDEsIHkxKS5saW5lVG8oeDIsIHkyKS5lbmRTdHJva2UoKVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRsaW5lLmdyYXBoaWNzLnNldFN0cm9rZVN0eWxlKHRoaXMud2lkdGgpLmJlZ2luU3Ryb2tlKHRoaXMuY29sb3IpLm1vdmVUbyh4MSwgeTEpLmxpbmVUbyh4MiwgeTIpLmVuZFN0cm9rZSgpXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGxpbmUpXHJcblx0XHRyZXR1cm4gbGluZVxyXG5cdH1cclxuXHJcbiAgICBwbG90KHh2LHl2KSB7XHJcbiAgICAgICAgaWYgKHh2ID49IHRoaXMueGF4aXMubWluICYmIHh2IDw9IHRoaXMueGF4aXMubWF4ICYmIHl2ID49IHRoaXMueWF4aXMubWluICYmIHl2IDw9IHRoaXMueWF4aXMubWF4KSB7XHJcbiAgICAgICAgICAgIGxldCB4ID0gdGhpcy54YXhpcy5nZXRMb2MoeHYpXHJcbiAgICAgICAgICAgIGxldCB5ID0gdGhpcy55YXhpcy5nZXRMb2MoeXYpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QpICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVNYXJrZXIodGhpcy5sYXN0LngsdGhpcy5sYXN0LnkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMubGFzdC54LHRoaXMubGFzdC55LHgseSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBuZXcgY3JlYXRlanMuUG9pbnQoeCx5KVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVNYXJrZXIoeCx5KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlbmRQbG90KCkgeyB0aGlzLmxhc3QgPSBudWxsIH1cclxufVxyXG4iLCJ2YXIgaW5mbyA9IHtcbiAgb3JpZ2luOiBcIlwiLFxuICBhbnN3ZXI6IG51bGwsXG4gIHNldHRpbmdzOiBcIlwiLFxufVxuXG53aW5kb3cub25tZXNzYWdlID0gZSA9PiB7XG4gIHZhciBtc2cgPSBlLmRhdGFcbiAgaWYgKGUuc291cmNlICE9IHdpbmRvdy5wYXJlbnQgKSByZXR1cm5cbiAgaWYgKG1zZy5jbWQgPT0gXCJzZXRJbmZvXCIpXG4gICAgaW5mbyA9IG1zZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5zd2VyKCkge1xuICByZXR1cm4gaW5mby5hbnN3ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBbnN3ZXIoYW5zd2VyKSB7XG4gIGluZm8uYW5zd2VyID0gYW5zd2VyXG4gIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoeyBjbWQ6IFwic2V0QW5zd2VyXCIsIGFuc3dlcjogYW5zd2VyIH0sIGluZm8ub3JpZ2luKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG4gIHJldHVybiBpbmZvLnNldHRpbmdzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29tcGxldGUodmFsaWQpIHtcbiAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7IGNtZDogXCJzZXRWYWxpZGl0eVwiLCB2YWxpZGl0eTogdmFsaWQgfSwgaW5mby5vcmlnaW4pXG59XG4iXX0=
