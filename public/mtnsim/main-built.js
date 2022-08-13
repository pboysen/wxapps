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
    });
    this.dewpoint.addEventListener(event, function (e) {
      return slidef(e, _this.dewpoint, _this.dewpointout, _this.listener);
    });
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

      var trials = (0, _message.getAnswer)();
      trials.forEach(function (json) {
        return _this7.results.appendChild(getRow(json));
      });
      (0, _message.setAnswer)(trials);
    }
  }, {
    key: "addTrial",
    value: function addTrial() {
      var trials = (0, _message.getAnswer)();
      var json = this.trial.toJSON();
      (0, _message.setAnswer)(trials.concat(json));
      this.results.appendChild(getRow(json));
    }
  }, {
    key: "deleteTrial",
    value: function deleteTrial(row) {
      var trials = (0, _message.getAnswer)();
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

(0, _message.appReady)().then(function () {
  return new MtnSim().render();
});

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
exports.appReady = appReady;
exports.getAnswer = getAnswer;
exports.getSettings = getSettings;
exports.setAnswer = setAnswer;
exports.setComplete = setComplete;
var info = null;

window.onmessage = function (e) {
  if (e.source != window.parent) return;
  var msg = e.data;
  if (msg.cmd == "setInfo") info = msg;
};

function appReady() {
  new Promise(function (resolve) {
    var timer = setInterval(function () {
      if (info != null) {
        clearInterval(timer);
        resolve(true);
      }
    }, 1000);
  });
}

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

function setComplete(valid, target) {
  target.postMessage({
    cmd: "setValidity",
    validity: valid
  }, info.origin);
}

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3YxNC40LjAvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjE0LjQuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjE0LjQuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3YxNC40LjAvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCJhcHBzL210bnNpbS9tYWluLmpzIiwiYXBwcy91dGlscy9heGlzLmpzIiwiYXBwcy91dGlscy9ncmFwaC5qcyIsImFwcHMvdXRpbHMvbWVzc2FnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUMsSUFBRCxDQUFQO01BQ0Q7SUFDRixDQUx3QixFQUt0QixJQUxzQixDQUF6QjtFQU1ELENBUEQ7QUFRRDs7QUFFTSxTQUFTLFNBQVQsR0FBcUI7RUFDMUIsT0FBTyxJQUFJLENBQUMsTUFBWjtBQUNEOztBQUVNLFNBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEyQjtFQUNoQyxJQUFJLENBQUMsTUFBTCxHQUFjLE1BQWQ7RUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLFdBQWQsQ0FBMEI7SUFBRSxHQUFHLEVBQUUsV0FBUDtJQUFvQixNQUFNLEVBQUU7RUFBNUIsQ0FBMUIsRUFBZ0UsSUFBSSxDQUFDLE1BQXJFO0FBQ0Q7O0FBRU0sU0FBUyxXQUFULEdBQXVCO0VBQzVCLE9BQU8sSUFBSSxDQUFDLFFBQVo7QUFDRDs7QUFFTSxTQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEIsTUFBNUIsRUFBb0M7RUFDekMsTUFBTSxDQUFDLFdBQVAsQ0FBbUI7SUFBRSxHQUFHLEVBQUUsYUFBUDtJQUFzQixRQUFRLEVBQUU7RUFBaEMsQ0FBbkIsRUFBNEQsSUFBSSxDQUFDLE1BQWpFO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU3RyaW5nOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdzdHJpbmcnO1xuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT0gbnVsbDtcbiAgfVxufTtcbiIsImltcG9ydCBHcmFwaCBmcm9tIFwiLi4vdXRpbHMvZ3JhcGhcIlxyXG5pbXBvcnQgVXJsIGZyb20gXCJ1cmxcIlxyXG5pbXBvcnQgeyBnZXRBbnN3ZXIsIHNldEFuc3dlciwgZ2V0U2V0dGluZ3MsIHNldENvbXBsZXRlLCBhcHBSZWFkeSB9IGZyb20gXCIuLi91dGlscy9tZXNzYWdlXCJcclxuXHJcblxyXG5sZXQgbXRuc2ltX3Jlc3VsdHMgPSBcIm10bnNpbV9yZXN1bHRzXCIsIExBUFNFX1JBVEUgPSAtOS44XHJcbnZhciBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpKVxyXG5sZXQgdG9vbCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3Rvb2wnKVxyXG5cclxuaWYgKHRvb2wgPT0gXCJyZWFkb3V0XCIpIHtcclxuXHRsZXQgZHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRwXCIpXHJcblx0ZHAuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCJcclxuXHRsZXQgcmVhZG91dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVhZG91dFwiKVxyXG5cdHJlYWRvdXQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxyXG59XHJcblxyXG5jcmVhdGVqcy5Nb3Rpb25HdWlkZVBsdWdpbi5pbnN0YWxsKClcclxuY3JlYXRlanMuU291bmQucmVnaXN0ZXJQbHVnaW5zKFtjcmVhdGVqcy5XZWJBdWRpb1BsdWdpbiwgY3JlYXRlanMuSFRNTEF1ZGlvUGx1Z2luLCBjcmVhdGVqcy5GbGFzaEF1ZGlvUGx1Z2luXSlcclxuY3JlYXRlanMuVGlja2VyLmZyYW1lUmF0ZSA9IDEwXHJcbmZ1bmN0aW9uIHRldGVuKFQsYSxiKSB7IHJldHVybiA2LjEwNzgqTWF0aC5leHAoYSpULyhUKzI3My4xNi1iKSkgfVxyXG5mdW5jdGlvbiBzYXR1cmF0aW9uKHRlbXApIHsgcmV0dXJuIHRldGVuKHRlbXAsMTcuMjY5LDM1Ljg2KSB9XHJcbmZ1bmN0aW9uIGljZXNhdHVyYXRpb24odGVtcCkgeyByZXR1cm4gdGV0ZW4odGVtcCwyMS44NzQsNy42NikgfVxyXG5mdW5jdGlvbiBkZXdwb2ludCh2YXBvcikgeyByZXR1cm4gMjM1NC4wLyg5LjQwNDEtTWF0aC5sb2cxMCh2YXBvcikpLTI3My4wIH1cclxuZnVuY3Rpb24gcHJlc3N1cmUoYWx0KSB7IHJldHVybiAxMDAwLTEyNSphbHQgfVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29sKHZhbCkge1xyXG5cdGxldCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKVxyXG5cdHRkLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZhbCkpXHJcblx0cmV0dXJuIHRkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERlbGV0ZShyb3cpIHtcclxuXHRsZXQgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIilcclxuXHRsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKVxyXG5cdGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIixcImFzc2V0cy9kZWxldGUuanBnXCIpXHJcblx0aW1nLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsXCJkZWxldGVfaW1nXCIpXHJcblx0aW1nLnNldEF0dHJpYnV0ZShcImFsdFwiLFwiRGVsZXRlIHJvd1wiKVxyXG5cdGltZy5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLFwiRGVsZXRlIHJvd1wiKVxyXG5cdGltZy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4ge1xyXG5cdFx0aWYgKGNvbmZpcm0oXCJEZWxldGUgcm93P1wiKSkge1xyXG5cdFx0XHQvLyA8dHI+PHRkPjxpbWcuLi5cclxuXHRcdFx0bGV0IG5vZGUgPSBldmVudC50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlXHJcblx0XHRcdG10bnNpbS5tdG4uZGVsZXRlVHJpYWwoQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChub2RlLnBhcmVudE5vZGUuY2hpbGROb2Rlcyxub2RlKS00KVxyXG5cdFx0fVxyXG5cdH0pXHJcblx0dGQuYXBwZW5kQ2hpbGQoaW1nKVxyXG5cdHJldHVybiB0ZFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRSb3coanNvbixyb3cpIHtcclxuXHRsZXQgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidHJcIilcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi5zdGFydC50ZW1wLnRvRml4ZWQoMSkpKVxyXG5cdHRyLmFwcGVuZENoaWxkKGdldENvbChqc29uLnN0YXJ0LnZhcG9yLnRvRml4ZWQoMSkpKVxyXG5cdHRyLmFwcGVuZENoaWxkKGdldENvbChqc29uLnN0YXJ0LmRld3BvaW50LnRvRml4ZWQoMSkpKVxyXG5cdHRyLmFwcGVuZENoaWxkKGdldENvbChqc29uLnRlbXAudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24udmFwb3IudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24uZGV3cG9pbnQudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24uY2xvdWRiYXNlID4gMD9qc29uLmNsb3VkYmFzZS50b0ZpeGVkKDEpOlwiQ2xlYXJcIikpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0RGVsZXRlKHJvdykpXHJcblx0cmV0dXJuIHRyXHJcbn1cclxuXHJcblxyXG5jbGFzcyBUcmlhbCB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLnN0YXJ0ID0gbnVsbFxyXG4gICAgdGhpcy5jbG91ZGJhc2UgPSAwXHJcbiAgICB0aGlzLnRlbXAgPSAwXHJcbiAgICB0aGlzLmFsdGl0dWRlID0gMFxyXG4gICAgdGhpcy52YXBvciA9IDBcclxuICAgIHRoaXMuZGV3cG9pbnQgPSAwXHJcbiAgICB0aGlzLmxhcHNlID0gMFxyXG5cdH1cclxuXHJcblx0dG9KU09OKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhcnQ6IHRoaXMuc3RhcnQsXHJcblx0ICAgIGNsb3VkYmFzZTogdGhpcy5jbG91ZGJhc2UsXHJcblx0ICAgIHRlbXA6IHRoaXMudGVtcCxcclxuXHQgICAgYWx0aXR1ZGU6IHRoaXMuYWx0aXR1ZGUsXHJcblx0ICAgIHZhcG9yOiB0aGlzLnZhcG9yLFxyXG5cdCAgICBkZXdwb2ludDogdGhpcy5kZXdwb2ludFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0aW5pdChzdGFydCkge1xyXG5cdFx0dGhpcy5zdGFydCA9IHN0YXJ0XHJcbiAgICB0aGlzLmNsb3VkYmFzZSA9IDBcclxuICAgIHRoaXMudGVtcCA9IHN0YXJ0LnRlbXBcclxuICAgIHRoaXMuYWx0aXR1ZGUgPSAwXHJcbiAgICB0aGlzLnZhcG9yID0gc3RhcnQudmFwb3JcclxuICAgIHRoaXMuZGV3cG9pbnQgPSBzdGFydC5kZXdwb2ludFxyXG4gICAgdGhpcy5sYXBzZSA9IExBUFNFX1JBVEVcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFJlYWRvdXQge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5hbHRpdHVkZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWx0aXR1ZGVyZWFkb3V0XCIpXHJcblx0XHR0aGlzLnRlbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRlbXByZWFkb3V0XCIpXHJcblx0XHR0aGlzLnZhcG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2YXBvcnJlYWRvdXRcIilcclxuXHRcdHRoaXMuZGV3cG9pbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRld3BvaW50cmVhZG91dFwiKVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKHRyaWFsKSB7XHJcblx0XHR0aGlzLmFsdGl0dWRlLnZhbHVlID0gdHJpYWwuYWx0aXR1ZGUudG9GaXhlZCgxKVxyXG5cdFx0dGhpcy50ZW1wLnZhbHVlID0gdHJpYWwudGVtcC50b0ZpeGVkKDEpXHJcblx0XHR0aGlzLnZhcG9yLnZhbHVlID0gdHJpYWwudmFwb3IudG9GaXhlZCgxKVxyXG5cdFx0dGhpcy5kZXdwb2ludC52YWx1ZSA9IHRyaWFsLmRld3BvaW50LnRvRml4ZWQoMSlcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFNldHRpbmdzIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMucmVhZG91dCA9IG5ldyBSZWFkb3V0KClcclxuXHRcdHRoaXMudGVtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVtcFwiKVxyXG5cdFx0dGhpcy52YXBvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmFwb3JcIilcclxuXHRcdHRoaXMuZGV3cG9pbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRld3BvaW50XCIpXHJcblx0XHR0aGlzLnRlbXBvdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRlbXBvdXRcIilcclxuXHRcdHRoaXMudmFwb3JvdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZhcG9yb3V0XCIpXHJcblx0XHR0aGlzLmRld3BvaW50b3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXdwb2ludG91dFwiKVxyXG5cdFx0dGhpcy5tdXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtdXRlXCIpXHJcblx0XHR0aGlzLmxpc3RlbmVyID0gbnVsbFxyXG5cdFx0ZnVuY3Rpb24gc2xpZGVmKGUsaW5wdXQsIG91dCwgZikge1xyXG5cdCAgICBcdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHQgICAgXHRvdXQudmFsdWUgPSBpbnB1dC52YWx1ZUFzTnVtYmVyXHJcblx0ICAgIFx0aWYgKGYpIGYoaW5wdXQpXHJcblx0XHR9XHJcblx0XHQvLyBJRSBkb2Vzbid0IGhhdmUgYW4gaW5wdXQgZXZlbnQgYnV0IGEgY2hhbmdlIGV2ZW50XHJcblx0XHRsZXQgZXZlbnQgPSAvbXNpZXx0cmlkZW50L2cudGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKT9cImNoYW5nZVwiOlwiaW5wdXRcIlxyXG5cdFx0dGhpcy50ZW1wLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGUgPT4gc2xpZGVmKGUsdGhpcy50ZW1wLHRoaXMudGVtcG91dCx0aGlzLmxpc3RlbmVyKSlcclxuXHRcdHRoaXMudmFwb3IuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZSA9PiBzbGlkZWYoZSx0aGlzLnZhcG9yLHRoaXMudmFwb3JvdXQsdGhpcy5saXN0ZW5lcikpXHJcblx0XHR0aGlzLmRld3BvaW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGUgPT4gc2xpZGVmKGUsdGhpcy5kZXdwb2ludCx0aGlzLmRld3BvaW50b3V0LHRoaXMubGlzdGVuZXIpKVxyXG5cdH1cclxuXHJcblx0Z2V0VGVtcCgpIHsgcmV0dXJuIHRoaXMudGVtcC52YWx1ZUFzTnVtYmVyIH1cclxuXHJcblx0Z2V0VmFwb3IoKSB7IHJldHVybiB0aGlzLnZhcG9yLnZhbHVlQXNOdW1iZXIgfVxyXG5cclxuXHRnZXREZXdwb2ludCgpIHsgcmV0dXJuIHRoaXMuZGV3cG9pbnQudmFsdWVBc051bWJlciB9XHJcblxyXG5cdHNldFRlbXAodmFsdWUpIHtcclxuXHRcdHRoaXMudGVtcC52YWx1ZSA9IHZhbHVlXHJcblx0XHR0aGlzLnRlbXBvdXQudmFsdWUgPSB2YWx1ZS50b0ZpeGVkKDEpXHJcblx0XHR0aGlzLnJlYWRvdXQudGVtcC52YWx1ZSA9IHRoaXMudGVtcG91dC52YWx1ZVxyXG5cdH1cclxuXHJcblx0c2V0VmFwb3IodmFsdWUpIHtcclxuXHRcdHRoaXMudmFwb3IudmFsdWUgPSB2YWx1ZVxyXG5cdFx0dGhpcy52YXBvcm91dC52YWx1ZSA9IHZhbHVlLnRvRml4ZWQoMSlcclxuXHRcdHRoaXMucmVhZG91dC52YXBvci52YWx1ZSA9IHRoaXMudmFwb3JvdXQudmFsdWVcclxuXHRcdHRoaXMuc2V0RGV3cG9pbnQoZGV3cG9pbnQodmFsdWUpKVxyXG5cdH1cclxuXHJcblx0c2V0RGV3cG9pbnQodmFsdWUpIHtcclxuXHRcdHRoaXMuZGV3cG9pbnQudmFsdWUgPSB2YWx1ZVxyXG5cdFx0dGhpcy5kZXdwb2ludG91dC52YWx1ZSA9IHZhbHVlLnRvRml4ZWQoMSlcclxuXHRcdHRoaXMucmVhZG91dC5kZXdwb2ludC52YWx1ZSA9IHRoaXMuZGV3cG9pbnRvdXQudmFsdWVcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVJlYWRvdXQodHJpYWwpIHtcclxuXHRcdHRoaXMucmVhZG91dC51cGRhdGUodHJpYWwpXHJcblx0fVxyXG5cclxuXHRhZGRMaXN0ZW5lcihsaXN0ZW5lcikgeyB0aGlzLmxpc3RlbmVyID0gbGlzdGVuZXIgfVxyXG59XHJcblxyXG5jbGFzcyBCdXR0b25zIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMucnVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJydW5cIilcclxuXHRcdHRoaXMucGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhdXNlXCIpXHJcblx0XHR0aGlzLnJlc3RhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3RhcnRcIilcclxuXHRcdHRoaXMubXV0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXV0ZVwiKVxyXG5cdH1cclxuXHJcblx0YWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcclxuXHRcdHRoaXMucnVuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IGxpc3RlbmVyKGUpKVxyXG5cdFx0dGhpcy5wYXVzZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBsaXN0ZW5lcihlKSlcclxuXHRcdHRoaXMucmVzdGFydC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBsaXN0ZW5lcihlKSlcclxuXHR9XHJcblxyXG5cdG11dGUoKSB7IHJldHVybiB0aGlzLm11dGUuY2hlY2tlZCB9XHJcbn1cclxuXHJcbmNsYXNzIEVUR3JhcGggZXh0ZW5kcyBHcmFwaCB7XHJcblx0Y29uc3RydWN0b3Ioc3RhZ2UsIHNldHRpbmdzKSB7XHJcblx0XHRzdXBlcih7XHJcblx0XHRcdHN0YWdlOiBzdGFnZSxcclxuXHRcdFx0dzogMjAwLFxyXG5cdFx0XHRoOiAyMDAsXHJcblx0XHRcdHhsYWJlbDogXCJUZW1wZXJhdHVyZShDKVwiLFxyXG5cdFx0XHR5bGFiZWw6IFwiVmFwb3IgUHJlc3N1cmUobWIpXCIsXHJcblx0XHRcdHhzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0eXNjYWxlOiBcImxpbmVhclwiLFxyXG5cdFx0XHRtaW5YOiAtMjAsXHJcblx0XHRcdG1heFg6IDMwLFxyXG5cdFx0XHRtaW5ZOiAwLFxyXG5cdFx0XHRtYXhZOiA1MCxcclxuXHRcdFx0bWFqb3JYOiAxMCxcclxuXHRcdFx0bWlub3JYOiA1LFxyXG5cdFx0XHRtYWpvclk6IDEwLFxyXG5cdFx0XHRtaW5vclk6IDVcclxuXHRcdH0pXHJcblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3NcclxuXHRcdHRoaXMubGFzdGggPSAwXHJcblx0XHR0aGlzLmxlYWYgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiYXNzZXRzL2xlYWYuZ2lmXCIpXHJcblx0XHR0aGlzLm1hcmtlciA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHR0aGlzLm1hcmtlci5ncmFwaGljcy5iZWdpbkZpbGwoXCIjMDAwXCIpLmRyYXdSZWN0KHRoaXMueGF4aXMuZ2V0TG9jKHRoaXMudGVtcCktMix0aGlzLnlheGlzLmdldExvYyh0aGlzLnZhcG9yKS0yLDQsNClcclxuXHRcdHN0YWdlLmFkZENoaWxkKHRoaXMubGVhZilcclxuXHRcdHN0YWdlLmFkZENoaWxkKHRoaXMubWFya2VyKVxyXG5cdFx0dGhpcy5zZXR0aW5ncy5hZGRMaXN0ZW5lcihzbGlkZXIgPT4ge1xyXG4gICAgICBpZiAoc2xpZGVyLmlkID09IFwidGVtcFwiKSB7XHJcbiAgICAgICAgICB0aGlzLnRlbXAgPSBzbGlkZXIudmFsdWVBc051bWJlclxyXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXRUZW1wKHNsaWRlci52YWx1ZUFzTnVtYmVyKVxyXG4gICAgICB9IGVsc2UgaWYgKHNsaWRlci5pZCA9PSBcInZhcG9yXCIpIHtcclxuICAgICAgICAgIHRoaXMudmFwb3IgPSBzbGlkZXIudmFsdWVBc051bWJlclxyXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXRWYXBvcih0aGlzLnZhcG9yKVxyXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXREZXdwb2ludChkZXdwb2ludCh0aGlzLnZhcG9yKSlcclxuICAgICAgfSBlbHNlIGlmIChzbGlkZXIuaWQgPT0gXCJkZXdwb2ludFwiKSB7XHJcbiAgICAgICAgICB0aGlzLmRld3BvaW50ID0gc2xpZGVyLnZhbHVlQXNOdW1iZXJcclxuICAgICAgICAgIHRoaXMuc2V0dGluZ3Muc2V0RGV3cG9pbnQodGhpcy5kZXdwb2ludClcclxuICAgICAgICAgIHRoaXMudmFwb3IgPSB2YXBvcih0aGlzLmRld3BvaW50KVxyXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXRWYXBvcih0aGlzLnZhcG9yKVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubW92ZU1hcmtlcih0cnVlKVxyXG5cdFx0fSlcclxuXHRcdHRoaXMuaWNlZ3JhcGggPSBuZXcgSWNlR3JhcGgoc3RhZ2UpXHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSB7XHJcblx0XHR0aGlzLnRlbXAgPSB0aGlzLnNldHRpbmdzLmdldFRlbXAoKVxyXG5cdFx0dGhpcy52YXBvciA9IHRoaXMuc2V0dGluZ3MuZ2V0VmFwb3IoKVxyXG5cdFx0c3VwZXIucmVuZGVyKClcclxuXHRcdHRoaXMucGxvdFNhdHVyYXRpb24oKVxyXG5cdFx0dGhpcy5pY2VncmFwaC5yZW5kZXIoKVxyXG5cdFx0dGhpcy5tb3ZlTWFya2VyKHRydWUpXHJcblx0fVxyXG5cclxuXHRwbG90U2F0dXJhdGlvbigpIHtcclxuICAgIGZvciAobGV0IHQgPSB0aGlzLnhheGlzLm1pbjsgdCA8IDA7IHQrKykgdGhpcy5wbG90KHQsaWNlc2F0dXJhdGlvbih0KSlcclxuICAgIGZvciAobGV0IHQgPSAwOyB0IDw9IHRoaXMueGF4aXMubWF4OyB0KyspIHRoaXMucGxvdCh0LHNhdHVyYXRpb24odCkpXHJcbiAgICB0aGlzLmVuZFBsb3QoKVxyXG5cdH1cclxuXHJcblx0Y2xlYXIoKSB7XHJcblx0XHRzdXBlci5jbGVhcigpXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMubGVhZilcclxuXHR9XHJcblxyXG5cdG1vdmVMZWFmKHgseSkge1xyXG5cdFx0dGhpcy5sZWFmLnggPSB4LTEwXHJcblx0XHR0aGlzLmxlYWYueSA9IHktMTBcclxuXHR9XHJcblxyXG5cdHNob3dMZWFmKCkge1xyXG4gICBsZXQgeCA9IHRoaXMueGF4aXMuZ2V0TG9jKHRoaXMudGVtcClcclxuICAgbGV0IHkgPSB0aGlzLnlheGlzLmdldExvYyh0aGlzLnZhcG9yKVxyXG4gICB0aGlzLm1vdmVMZWFmKHgseSlcclxuXHR9XHJcblxyXG4gICAgbW92ZU1hcmtlcih1cGRhdGVTZXR0aW5ncykge1xyXG4gICAgICBsZXQgc2F0ID0gc2F0dXJhdGlvbih0aGlzLnRlbXApXHJcbiAgICAgIGlmICh0aGlzLnZhcG9yID4gc2F0KSB7XHJcbiAgICAgIFx0dGhpcy52YXBvciA9IHNhdFxyXG4gICAgICBcdGlmICh1cGRhdGVTZXR0aW5ncyA9PT0gdHJ1ZSkge1xyXG4gICAgICBcdFx0dGhpcy5zZXR0aW5ncy5zZXRUZW1wKHRoaXMudGVtcClcclxuICAgICAgXHRcdHRoaXMuc2V0dGluZ3Muc2V0VmFwb3Ioc2F0KVxyXG4gICAgICBcdFx0dGhpcy5zZXR0aW5ncy5zZXREZXdwb2ludChkZXdwb2ludChzYXQpKVxyXG4gICAgICBcdH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgeCA9IHRoaXMueGF4aXMuZ2V0TG9jKHRoaXMudGVtcClcclxuICAgICAgbGV0IHkgPSB0aGlzLnlheGlzLmdldExvYyh0aGlzLnZhcG9yKVxyXG4gICAgICB0aGlzLm1hcmtlci54ID0geCAtIDJcclxuICAgICAgdGhpcy5tYXJrZXIueSA9IHkgLSAyXHJcbiAgICAgIGlmICh1cGRhdGVTZXR0aW5ncyA9PT0gdHJ1ZSkgdGhpcy5tb3ZlTGVhZih4LHkpXHJcbiAgICB9XHJcblxyXG5cdHVwZGF0ZSh0cmlhbCkge1xyXG5cdFx0dGhpcy50ZW1wID0gdHJpYWwudGVtcFxyXG5cdFx0dGhpcy52YXBvciA9IHRyaWFsLnZhcG9yXHJcblx0XHR0aGlzLnBsb3QodHJpYWwudGVtcCx0cmlhbC52YXBvcilcclxuXHRcdHRoaXMubW92ZU1hcmtlcihmYWxzZSlcclxuXHRcdHRoaXMuc2hvd0xlYWYoKVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgQVRHcmFwaCBleHRlbmRzIEdyYXBoIHtcclxuXHRjb25zdHJ1Y3RvcihzdGFnZSkge1xyXG5cdFx0c3VwZXIoe1xyXG5cdFx0XHRzdGFnZTogc3RhZ2UsXHJcblx0XHRcdHc6IDIwMCxcclxuXHRcdFx0aDogMjAwLFxyXG5cdFx0XHR4bGFiZWw6IFwiVGVtcGVyYXR1cmUoQylcIixcclxuXHRcdFx0eWxhYmVsOiBcIkFsdGl0dWRlKGttKVwiLFxyXG5cdFx0XHR4c2NhbGU6IFwibGluZWFyXCIsXHJcblx0XHRcdHlzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0bWluWDogLTIwLFxyXG5cdFx0XHRtYXhYOiAzMCxcclxuXHRcdFx0bWluWTogMCxcclxuXHRcdFx0bWF4WTogNCxcclxuXHRcdFx0bWFqb3JYOiAxMCxcclxuXHRcdFx0bWlub3JYOiA1LFxyXG5cdFx0XHRtYWpvclk6IDEsXHJcblx0XHRcdG1pbm9yWTogMC41XHJcblx0XHR9KVxyXG5cdFx0dGhpcy50ZW1wID0gMjBcclxuXHRcdHRoaXMuYWx0aXR1ZGUgPSAwXHJcblx0XHR0aGlzLmNsb3VkYmFzZSA9IDBcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSh0cmlhbCkge1xyXG5cdFx0dGhpcy5wbG90KHRyaWFsLnRlbXAsdHJpYWwuYWx0aXR1ZGUpXHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBJY2VHcmFwaCBleHRlbmRzIEdyYXBoIHtcclxuXHRjb25zdHJ1Y3RvcihzdGFnZSkge1xyXG5cdFx0c3VwZXIoe1xyXG5cdFx0XHRzdGFnZTogc3RhZ2UsXHJcblx0XHRcdHg6IDYwLFxyXG5cdFx0XHR5OiAxMTAsXHJcblx0XHRcdHc6IDc1LFxyXG5cdFx0XHRoOiAxMDAsXHJcblx0XHRcdHhsYWJlbDogXCJDXCIsXHJcblx0XHRcdHhzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0eXNjYWxlOiBcImxpbmVhclwiLFxyXG5cdFx0XHRtaW5YOiAtMTUsXHJcblx0XHRcdG1heFg6IDEsXHJcblx0XHRcdG1pblk6IDEsXHJcblx0XHRcdG1heFk6IDUsXHJcblx0XHRcdG1ham9yWDogNSxcclxuXHRcdFx0bWFqb3JZOiAxLFxyXG5cdFx0XHRiYWNrZ3JvdW5kOiBcIiNFRUVcIlxyXG5cdFx0fSlcclxuXHRcdGxldCBsaXF1aWQgPSBuZXcgY3JlYXRlanMuVGV4dChcIkxpcXVpZFwiLFwiMTBweCBBcmlhbFwiLFwiIzAwMFwiKVxyXG5cdFx0bGlxdWlkLnggPSA2NVxyXG5cdFx0bGlxdWlkLnkgPSA0MFxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQobGlxdWlkKVxyXG5cdFx0bGV0IGljZSA9IG5ldyBjcmVhdGVqcy5UZXh0KFwiSWNlXCIsXCIxMHB4IEFyaWFsXCIsXCIjMDAwXCIpXHJcblx0XHRpY2UueCA9IDkwXHJcblx0XHRpY2UueSA9IDcwXHJcblx0XHRzdGFnZS5hZGRDaGlsZChpY2UpXHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSB7XHJcblx0XHRzdXBlci5yZW5kZXIoKVxyXG4gICAgZm9yIChsZXQgdCA9IHRoaXMueGF4aXMubWluOyB0IDw9IHRoaXMueGF4aXMubWF4OyB0KyspIHRoaXMucGxvdCh0LHNhdHVyYXRpb24odCkpXHJcbiAgICB0aGlzLmVuZFBsb3QoKVxyXG4gICAgZm9yIChsZXQgdCA9IHRoaXMueGF4aXMubWluOyB0IDw9IHRoaXMueGF4aXMubWF4OyB0KyspIHRoaXMucGxvdCh0LGljZXNhdHVyYXRpb24odCkpXHJcbiAgICB0aGlzLmVuZFBsb3QoKVxyXG5cdH1cclxuXHJcbn1cclxuXHJcbmNsYXNzIE10biB7XHJcblx0Y29uc3RydWN0b3Ioc3RhZ2UsIHNldHRpbmdzLCBmaW5pc2gpIHtcclxuXHRcdHRoaXMuc3RhZ2UgPSBzdGFnZVxyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzXHJcblx0XHR0aGlzLmZpbmlzaCA9IGZpbmlzaFxyXG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCh7aWQ6IFwidGh1bmRlclwiLCBzcmM6XCJhc3NldHMvdGh1bmRlci5tcDNcIn0pXHJcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKHtpZDogXCJ3aW5kXCIsIHNyYzpcImFzc2V0cy93aW5kLm1wM1wifSlcclxuXHRcdHRoaXMud2luZCA9IG51bGxcclxuXHRcdHRoaXMudGh1bmRlciA9IG51bGxcclxuXHRcdHRoaXMubXRuID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImFzc2V0cy9tb3VudGFpbi5wbmdcIilcclxuXHRcdHRoaXMubGVhZiA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJhc3NldHMvbGVhZi5naWZcIilcclxuXHRcdHRoaXMuY2xvdWQgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiYXNzZXRzL3RodW5kZXJjbG91ZC5wbmdcIilcclxuXHRcdHRoaXMuYm9sdCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJhc3NldHMvbGlnaHRuaW5nLnBuZ1wiKVxyXG5cdFx0dGhpcy5sZWFmdHdlZW4gPSBudWxsXHJcblx0XHR0aGlzLm10bi54ID0gMFxyXG5cdFx0dGhpcy5tdG4ueSA9IDBcclxuXHRcdHRoaXMubXRuLnNjYWxlWCA9IDAuNVxyXG5cdFx0dGhpcy5tdG4uc2NhbGVZID0gMC41XHJcblx0XHR0aGlzLmJvbHQueCA9IC0xMDBcclxuXHRcdHRoaXMuYm9sdC5zY2FsZVggPSAwLjAxNVxyXG5cdFx0dGhpcy5ib2x0LnNjYWxlWSA9IDAuMDE1XHJcblx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZVxyXG5cdFx0dGhpcy5saWdodG5pbmcgPSBmYWxzZVxyXG5cdFx0dGhpcy5saWdodHRpY2sgPSAwXHJcblx0XHR0aGlzLnBhdGggPSBbNTAsMTY1LCA2MCwxNTUsIDc0LDE1MiwgODAsMTQwLCA5MCwxMzEsIDEwMCwxMjUsIDExMiwxMjIsIDEyMCwxMTAsIDEzNyw5MiwgMTQwLDc1LCAxNTEsNjYsIDE1MCw2NiwgMTczLDY2LCAxODUsNjYsIDIwNCw3MCwgMjEwLDgwLCAyMjEsOTIsIDIyMSw5NSwgMjI0LDEwNSwgMjMwLDExMCwgMjQ2LDEyMSwgMjUwLDEzMCwgMjY4LDE0MSwgMjgwLDE2NSwgMjkwLDE2NV1cclxuXHRcdHRoaXMucmVzdWx0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0c190YWJsZVwiKVxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVfYWxsXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGV2ZW50ID0+IHtcclxuXHRcdFx0aWYgKGNvbmZpcm0oXCJEZWxldGUgYWxsIGRhdGE/XCIpKSB0aGlzLmRlbGV0ZVJlc3VsdHMoKVxyXG5cdFx0fSlcclxuXHRcdHRoaXMucmVzZXQoKVxyXG5cdFx0dGhpcy5zaG93UmVzdWx0cygpXHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSB7XHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMubXRuKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLmxlYWYpXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMuY2xvdWQpXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMuYm9sdClcclxuXHRcdHRoaXMubGVhZi54ID0gNTBcclxuXHRcdHRoaXMubGVhZi55ID0gMTY1XHJcblx0XHR0aGlzLmNsb3VkLnggPSAtMTAwMFxyXG5cdFx0dGhpcy5jbG91ZC55ID0gMFxyXG5cdFx0dGhpcy5sYXN0YWx0ID0gMFxyXG5cdFx0dGhpcy5jbG91ZC5zY2FsZVggPSAwLjFcclxuXHRcdHRoaXMuY2xvdWQuc2NhbGVZID0gMC4wNVxyXG5cdH1cclxuXHJcblx0Y2xlYXIoKSB7XHJcblx0XHR0aGlzLnN0YWdlLnJlbW92ZUFsbENoaWxkcmVuKClcclxuXHRcdHRoaXMucmVuZGVyKClcclxuXHR9XHJcblx0cGxheSgpIHtcclxuXHRcdHRoaXMucmVzZXQoKVxyXG5cdFx0dGhpcy5sZWFmdHdlZW4gPSBjcmVhdGVqcy5Ud2Vlbi5nZXQodGhpcy5sZWFmKS50byh7Z3VpZGU6e3BhdGg6dGhpcy5wYXRofX0sMTAwMDApXHJcblx0XHR0aGlzLmxlYWZ0d2Vlbi5jYWxsKCgpID0+IHtcclxuXHRcdFx0aWYgKHRoaXMud2luZCkgdGhpcy53aW5kLnN0b3AoKVxyXG5cdFx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZVxyXG5cdFx0XHR0aGlzLmFkZFRyaWFsKClcclxuXHRcdFx0aWYgKHRoaXMuZmluaXNoKSB0aGlzLmZpbmlzaCgpXHJcblx0XHR9KVxyXG5cdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZVxyXG5cdFx0dGhpcy5sZWFmdHdlZW4ucGxheSgpXHJcblx0XHR0aGlzLnBsYXlTb3VuZChcIndpbmRcIilcclxuXHR9XHJcblxyXG5cdHNob3dSZXN1bHRzKCkge1xyXG5cdFx0Zm9yIChsZXQgaSA9IHRoaXMucmVzdWx0cy5jaGlsZHJlbi5sZW5ndGgtMTsgaSA+IDEgOyBpLS0pIHRoaXMucmVzdWx0cy5yZW1vdmVDaGlsZCh0aGlzLnJlc3VsdHMuY2hpbGRyZW5baV0pXHJcblx0XHRsZXQgdHJpYWxzID0gZ2V0QW5zd2VyKClcclxuXHRcdHRyaWFscy5mb3JFYWNoKGpzb24gPT4gdGhpcy5yZXN1bHRzLmFwcGVuZENoaWxkKGdldFJvdyhqc29uKSkpXHJcblx0XHRzZXRBbnN3ZXIodHJpYWxzKVxyXG5cdH1cclxuXHJcblx0YWRkVHJpYWwoKSB7XHJcblx0XHRsZXQgdHJpYWxzID0gZ2V0QW5zd2VyKClcclxuXHRcdGxldCBqc29uID0gdGhpcy50cmlhbC50b0pTT04oKVxyXG5cdFx0c2V0QW5zd2VyKHRyaWFscy5jb25jYXQoanNvbikpXHJcblx0XHR0aGlzLnJlc3VsdHMuYXBwZW5kQ2hpbGQoZ2V0Um93KGpzb24pKVxyXG5cdH1cclxuXHJcblx0ZGVsZXRlVHJpYWwocm93KSB7XHJcblx0XHRsZXQgdHJpYWxzID0gZ2V0QW5zd2VyKClcclxuXHRcdHRyaWFscy5zcGxpY2Uocm93LDEpXHJcblx0XHRzZXRBbnN3ZXIodHJpYWxzKVxyXG5cdFx0dGhpcy5zaG93UmVzdWx0cygpXHJcblx0fVxyXG5cclxuXHRkZWxldGVSZXN1bHRzKCkge1xyXG5cdFx0c2V0QW5zd2VyKFtdKVxyXG5cdFx0dGhpcy5zaG93UmVzdWx0cygpXHJcblx0fVxyXG5cclxuXHRwYXVzZShwYXVzZSkge1xyXG5cdFx0dGhpcy5sZWFmdHdlZW4uc2V0UGF1c2VkKHBhdXNlKVxyXG5cdFx0aWYgKHRoaXMud2luZCkgdGhpcy53aW5kLnBhdXNlZCA9IHBhdXNlXHJcblx0XHRpZiAodGhpcy50aHVuZGVyKSB0aGlzLnRodW5kZXIucGF1c2VkID0gcGF1c2VcclxuXHRcdHRoaXMucnVubmluZyA9ICFwYXVzZVxyXG5cdH1cclxuXHJcblx0cGxheVNvdW5kKHNvdW5kKSB7XHJcblx0XHRpZiAoIXRoaXMuc2V0dGluZ3MubXV0ZS5jaGVja2VkKSB7XHJcblx0XHRcdHN3aXRjaChzb3VuZCkge1xyXG5cdFx0XHRjYXNlIFwid2luZFwiOlxyXG5cdFx0XHRcdHRoaXMud2luZCA9IGNyZWF0ZWpzLlNvdW5kLnBsYXkoc291bmQse2xvb3A6IDJ9KVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJ0aHVuZGVyXCI6XHJcblx0XHRcdFx0dGhpcy50aHVuZGVyID0gY3JlYXRlanMuU291bmQucGxheShzb3VuZClcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUodHJpYWwpIHtcclxuXHRcdGxldCBvbGRBID0gdHJpYWwuYWx0aXR1ZGUsIG9sZFQgPSB0cmlhbC50ZW1wXHJcblx0XHR0cmlhbC5hbHRpdHVkZSA9IDQqKDE2NSAtIHRoaXMubGVhZi55KS8xNjVcclxuXHRcdGlmICh0cmlhbC5hbHRpdHVkZSA8IDApIHRyaWFsLmFsdGl0dWRlID0gMFxyXG5cdFx0dHJpYWwudmFwb3IgKj0gcHJlc3N1cmUodHJpYWwuYWx0aXR1ZGUpL3ByZXNzdXJlKG9sZEEpXHJcblx0XHR0cmlhbC50ZW1wICs9IHRyaWFsLmxhcHNlICogKHRyaWFsLmFsdGl0dWRlIC0gb2xkQSlcclxuXHRcdHRyaWFsLmRld3BvaW50ID0gZGV3cG9pbnQodHJpYWwudmFwb3IpXHJcblx0XHRsZXQgc2F0ID0gc2F0dXJhdGlvbih0cmlhbC50ZW1wKVxyXG5cdFx0aWYgKHRyaWFsLnZhcG9yID4gc2F0KSB7XHJcblx0XHRcdHRoaXMuYW5pbWF0ZUNsb3VkcygpXHJcblx0XHRcdHRyaWFsLnZhcG9yID0gc2F0XHJcblx0XHRcdHRyaWFsLmxhcHNlID0gLTYuMFxyXG5cdFx0fVxyXG5cdFx0aWYgKHRyaWFsLnRlbXAgPiBvbGRUKSB0cmlhbC5sYXBzZSA9IExBUFNFX1JBVEVcclxuXHRcdHRoaXMuc2V0dGluZ3MudXBkYXRlUmVhZG91dCh0cmlhbClcclxuXHR9XHJcblxyXG5cdGFuaW1hdGVDbG91ZHMoKSB7XHJcblx0XHRpZiAodGhpcy50cmlhbC5jbG91ZGJhc2UgPT0gMCkge1xyXG5cdFx0XHR0aGlzLnRyaWFsLmNsb3VkYmFzZSA9IHRoaXMudHJpYWwuYWx0aXR1ZGVcclxuXHRcdFx0dGhpcy5jbG91ZC54ID0gdGhpcy5sZWFmLnggLSAyXHJcblx0XHRcdHRoaXMuY2xvdWQueSA9IHRoaXMubGVhZi55XHJcblx0XHRcdHRoaXMuYm9sdC55ID0gdGhpcy5jbG91ZC55ICsgMjBcclxuXHRcdFx0dGhpcy5sYXN0eSA9IHRoaXMubGVhZi55XHJcblx0XHR9XHJcblx0XHRpZiAoKHRoaXMudHJpYWwuYWx0aXR1ZGUgLSB0aGlzLmxhc3RhbHQpID4gLjEpIHtcclxuXHRcdFx0dGhpcy5sYXN0YWx0ID0gdGhpcy50cmlhbC5hbHRpdHVkZVxyXG5cdFx0XHR0aGlzLmNsb3VkLnNjYWxlWCArPSAuMDIxXHJcblx0XHRcdHRoaXMuY2xvdWQuc2NhbGVZICs9IC4wMlxyXG5cdFx0XHR0aGlzLmNsb3VkLnkgPSB0aGlzLmxlYWYueVxyXG5cdFx0fVxyXG5cdFx0aWYgKCF0aGlzLmxpZ2h0bmluZyAmJiB0aGlzLmxlYWYueCA8IDE0MCAmJiB0aGlzLnRyaWFsLnRlbXAgPD0gLTUgJiYgKHRoaXMudHJpYWwuYWx0aXR1ZGUgLSB0aGlzLnRyaWFsLmNsb3VkYmFzZSkgPiAuNSkge1xyXG5cdFx0XHR0aGlzLmxpZ2h0dGljayA9IDBcclxuXHRcdFx0dGhpcy5saWdodG5pbmcgPSB0cnVlXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXNldCgpIHtcclxuXHRcdHRoaXMudHJpYWwgPSBuZXcgVHJpYWwoKVxyXG5cdFx0dGhpcy50ZW1wID0gdGhpcy5zZXR0aW5ncy5nZXRUZW1wKClcclxuXHRcdHRoaXMudmFwb3IgPSB0aGlzLnNldHRpbmdzLmdldFZhcG9yKClcclxuXHRcdHRoaXMubGFwc2VfcmF0ZSA9IExBUFNFX1JBVEVcclxuXHRcdHRoaXMubGFzdGFsdCA9IDBcclxuXHRcdHRoaXMudHJpYWwuaW5pdCh7XHJcblx0XHRcdHRlbXA6IHRoaXMudGVtcCxcclxuXHRcdFx0dmFwb3I6IHRoaXMudmFwb3IsXHJcblx0XHRcdGRld3BvaW50OiBkZXdwb2ludCh0aGlzLnZhcG9yKVxyXG5cdFx0fSlcclxuXHRcdHRoaXMuc2V0dGluZ3MudXBkYXRlUmVhZG91dCh0aGlzLnRyaWFsKVxyXG5cdH1cclxuXHJcblx0dGljayhldGdyYXBoLCBhdGdyYXBoKSB7XHJcblx0XHRpZiAodGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XHJcblx0XHRcdHRoaXMudXBkYXRlKHRoaXMudHJpYWwpXHJcblx0XHRcdGV0Z3JhcGgudXBkYXRlKHRoaXMudHJpYWwpXHJcblx0XHRcdGF0Z3JhcGgudXBkYXRlKHRoaXMudHJpYWwpXHJcblx0XHRcdGlmICh0aGlzLmxpZ2h0bmluZyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHN3aXRjaCh0aGlzLmxpZ2h0dGljaykge1xyXG5cdFx0XHRcdGNhc2UgMDpcclxuXHRcdFx0XHRcdHRoaXMuYm9sdC54ID0gdGhpcy5jbG91ZC54ICsgMTBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0dGhpcy5ib2x0LnggKz0gMTBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSA3OlxyXG5cdFx0XHRcdFx0dGhpcy5ib2x0LnggKz0gMTBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSAxMDpcclxuXHRcdFx0XHRcdHRoaXMuYm9sdC54ID0gLTEwMFxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0XHRjYXNlIDYwOlxyXG5cdFx0XHRcdFx0dGhpcy5wbGF5U291bmQoXCJ0aHVuZGVyXCIpXHJcblx0XHRcdFx0XHR0aGlzLmxpZ2h0bmluZyA9IGZhbHNlXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLmxpZ2h0dGljaysrXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIE10blNpbSB7XHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLm1haW5zdGFnZSA9IG5ldyBjcmVhdGVqcy5TdGFnZShcIm1haW5jYW52YXNcIilcclxuXHRcdHRoaXMuZXRzdGFnZSA9IG5ldyBjcmVhdGVqcy5TdGFnZShcImV0Z3JhcGhcIilcclxuXHRcdHRoaXMuYXRzdGFnZSA9IG5ldyBjcmVhdGVqcy5TdGFnZShcImF0Z3JhcGhcIilcclxuXHRcdHRoaXMuYnV0dG9ucyA9IG5ldyBCdXR0b25zKClcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MoKVxyXG5cdFx0dGhpcy5ldGdyYXBoID0gbmV3IEVUR3JhcGgodGhpcy5ldHN0YWdlLCB0aGlzLnNldHRpbmdzKVxyXG5cdFx0dGhpcy5hdGdyYXBoID0gbmV3IEFUR3JhcGgodGhpcy5hdHN0YWdlKVxyXG5cdFx0dGhpcy5tdG4gPSBuZXcgTXRuKHRoaXMubWFpbnN0YWdlLCB0aGlzLnNldHRpbmdzLCAoKSA9PiB7XHJcblx0XHRcdHRoaXMuYnV0dG9ucy5yZXN0YXJ0LmRpc2FibGVkID0gZmFsc2VcclxuXHRcdFx0dGhpcy5idXR0b25zLnBhdXNlLmRpc2FibGVkID0gdHJ1ZVxyXG5cdFx0fSlcclxuXHRcdHRoaXMucGF1c2UgPSBmYWxzZVxyXG5cdFx0dGhpcy5idXR0b25zLmFkZExpc3RlbmVyKGUgPT4ge1xyXG5cdFx0XHRzd2l0Y2goZS50YXJnZXQuaWQpIHtcclxuXHRcdFx0Y2FzZSBcInJ1blwiOlxyXG5cdFx0XHRcdHRoaXMuZW5hYmxlUGxheShmYWxzZSlcclxuXHRcdFx0XHR0aGlzLmJ1dHRvbnMucGF1c2UudmFsdWUgPSBcIlBhdXNlXCJcclxuXHRcdFx0XHR0aGlzLnBhdXNlID0gZmFsc2VcclxuXHRcdFx0XHR0aGlzLm10bi5wbGF5KClcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwicGF1c2VcIjpcclxuXHRcdFx0XHR0aGlzLnBhdXNlID0gIXRoaXMucGF1c2VcclxuXHRcdFx0XHR0aGlzLm10bi5wYXVzZSh0aGlzLnBhdXNlKVxyXG5cdFx0XHRcdGUudGFyZ2V0LnZhbHVlID0gdGhpcy5wYXVzZT8gXCJSZXN1bWVcIjpcIlBhdXNlXCJcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwicmVzdGFydFwiOlxyXG5cdFx0XHRcdHRoaXMucmVzZXQoKVxyXG5cdFx0XHRcdHRoaXMubXRuLmNsZWFyKClcclxuXHRcdFx0XHR0aGlzLmV0Z3JhcGguY2xlYXIoKVxyXG5cdFx0XHRcdHRoaXMuYXRncmFwaC5jbGVhcigpXHJcblx0XHRcdFx0dGhpcy5ldGdyYXBoLnJlbmRlcigpXHJcblx0XHRcdFx0dGhpcy5hdGdyYXBoLnJlbmRlcigpXHJcblx0XHRcdFx0dGhpcy5tdG4ucmVzZXQoKVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0cmVzZXQoKSB7XHJcblx0XHR0aGlzLmVuYWJsZVBsYXkodHJ1ZSlcclxuXHR9XHJcblxyXG5cdGVuYWJsZVBsYXkocGxheSkge1xyXG5cdFx0dGhpcy5idXR0b25zLnJ1bi5kaXNhYmxlZCA9ICFwbGF5XHJcblx0XHR0aGlzLmJ1dHRvbnMucGF1c2UuZGlzYWJsZWQgPSBwbGF5XHJcblx0XHR0aGlzLmJ1dHRvbnMucmVzdGFydC5kaXNhYmxlZCA9ICFwbGF5XHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSB7XHJcblx0XHR0aGlzLmJ1dHRvbnMucnVuLmRpc2FibGVkID0gZmFsc2VcclxuXHRcdHRoaXMuYnV0dG9ucy5tdXRlLmNoZWNrZWQgPSBmYWxzZVxyXG5cdFx0dGhpcy5idXR0b25zLnBhdXNlLmRpc2FibGVkID0gdHJ1ZVxyXG5cdFx0dGhpcy5idXR0b25zLnJlc3RhcnQuZGlzYWJsZWQgPSB0cnVlXHJcblx0XHR0aGlzLnJlc2V0KClcclxuXHRcdHRoaXMuZXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0dGhpcy5hdGdyYXBoLnJlbmRlcigpXHJcblx0XHR0aGlzLm10bi5yZW5kZXIoKVxyXG5cdFx0Y3JlYXRlanMuVGlja2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJ0aWNrXCIsIGUgPT4ge1xyXG5cdFx0XHR0aGlzLm10bi50aWNrKHRoaXMuZXRncmFwaCwgdGhpcy5hdGdyYXBoKVxyXG5cdFx0XHR0aGlzLmV0c3RhZ2UudXBkYXRlKClcclxuXHRcdFx0dGhpcy5hdHN0YWdlLnVwZGF0ZSgpXHJcblx0XHRcdHRoaXMubWFpbnN0YWdlLnVwZGF0ZSgpXHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxuYXBwUmVhZHkoKS50aGVuKCgpID0+IChuZXcgTXRuU2ltKCkpLnJlbmRlcigpKVxyXG4iLCJjb25zdCBtYXJnaW5YID0gNDAsIG1hcmdpblkgPSAzMCwgZW5kTWFyZ2luID0gNVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXhpcyB7XHJcblx0Y29uc3RydWN0b3Ioc3BlYykge1xyXG5cdFx0dGhpcy5zcGVjID0gc3BlY1xyXG5cdFx0dGhpcy5zdGFnZSA9IHNwZWMuc3RhZ2VcclxuXHRcdHRoaXMudyA9IHNwZWMuZGltLncgfHwgMTAwXHJcblx0XHR0aGlzLmggPSBzcGVjLmRpbS5oIHx8IDEwMFxyXG5cdFx0dGhpcy5taW4gPSBzcGVjLmRpbS5taW4gfHwgMFxyXG5cdFx0dGhpcy5tYXggPSBzcGVjLmRpbS5tYXggfHwgMTAwXHJcblx0XHR0aGlzLmZvbnQgPSBzcGVjLmZvbnQgfHwgXCIxMXB4IEFyaWFsXCJcclxuXHRcdHRoaXMuY29sb3IgPSBzcGVjLmNvbG9yIHx8IFwiIzAwMFwiXHJcblx0XHR0aGlzLmxhYmVsID0gc3BlYy5sYWJlbFxyXG5cdFx0dGhpcy5tYWpvciA9IHNwZWMubWFqb3IgfHwgMTBcclxuXHRcdHRoaXMubWlub3IgPSBzcGVjLm1pbm9yIHx8IHNwZWMubWFqb3JcclxuXHRcdHRoaXMucHJlY2lzaW9uID0gc3BlYy5wcmVjaXNpb24gfHwgMFxyXG5cdFx0dGhpcy52ZXJ0aWNhbCA9IHNwZWMub3JpZW50ICYmIHNwZWMub3JpZW50ID09IFwidmVydGljYWxcIiB8fCBmYWxzZVxyXG5cdFx0dGhpcy5saW5lYXIgPSBzcGVjLnNjYWxlICYmIHNwZWMuc2NhbGUgPT0gXCJsaW5lYXJcIiB8fCBmYWxzZVxyXG5cdFx0dGhpcy5pbnZlcnQgPSBzcGVjLmludmVydCB8fCBmYWxzZVxyXG5cdFx0aWYgKHNwZWMuZGltLngpIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5YID0gc3BlYy5kaW0ueFxyXG5cdFx0XHR0aGlzLmVuZFggPSB0aGlzLm9yaWdpblggKyB0aGlzLndcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWCA9IG1hcmdpblhcclxuXHRcdFx0dGhpcy5lbmRYID0gdGhpcy53IC0gZW5kTWFyZ2luXHJcblx0XHR9XHJcblx0XHRpZiAoc3BlYy5kaW0ueSkge1xyXG5cdFx0XHR0aGlzLm9yaWdpblkgPSBzcGVjLmRpbS55XHJcblx0XHRcdHRoaXMuZW5kWSA9IHRoaXMub3JpZ2luWSAtIHRoaXMuaCArIGVuZE1hcmdpblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5ZID0gdGhpcy5oIC0gbWFyZ2luWVxyXG5cdFx0XHR0aGlzLmVuZFkgPSBlbmRNYXJnaW5cclxuXHRcdH1cclxuXHRcdHRoaXMuc2NhbGUgPSB0aGlzLnZlcnRpY2FsID8gTWF0aC5hYnModGhpcy5lbmRZIC0gdGhpcy5vcmlnaW5ZKS8odGhpcy5tYXggLSB0aGlzLm1pbik6IE1hdGguYWJzKHRoaXMuZW5kWCAtIHRoaXMub3JpZ2luWCkvKHRoaXMubWF4IC0gdGhpcy5taW4pXHJcblx0fVxyXG5cclxuXHRkcmF3TGluZSh4MSx5MSx4Mix5Mikge1xyXG5cdFx0bGV0IGxpbmUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgxKVxyXG5cdFx0bGluZS5ncmFwaGljcy5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKVxyXG5cdFx0bGluZS5ncmFwaGljcy5tb3ZlVG8oeDEsIHkxKVxyXG5cdFx0bGluZS5ncmFwaGljcy5saW5lVG8oeDIsIHkyKVxyXG5cdFx0bGluZS5ncmFwaGljcy5lbmRTdHJva2UoKTtcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQobGluZSlcclxuXHR9XHJcblxyXG5cdGRyYXdUZXh0KHRleHQseCx5KSB7XHJcblx0XHR0ZXh0LnggPSB4XHJcblx0XHR0ZXh0LnkgPSB5XHJcblx0XHRpZiAodGhpcy52ZXJ0aWNhbCAmJiB0ZXh0LnRleHQgPT0gdGhpcy5sYWJlbCkgdGV4dC5yb3RhdGlvbiA9IDI3MFxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0ZXh0KVxyXG5cdFx0cmV0dXJuIHRleHRcclxuXHR9XHJcblxyXG5cdGdldFRleHQocykgeyByZXR1cm4gbmV3IGNyZWF0ZWpzLlRleHQocyx0aGlzLmZvbnQsdGhpcy5jb2xvcikgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgIFx0bGV0IGxhYmVsID0gdGhpcy5nZXRUZXh0KHRoaXMubGFiZWwpXHJcbiAgICBcdGxldCBsYWJlbF9ibmRzID0gbGFiZWwuZ2V0Qm91bmRzKClcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWCx0aGlzLm9yaWdpblksdGhpcy5vcmlnaW5YLHRoaXMuZW5kWSlcclxuICAgICAgICAgICAgbGV0IG1pblhMYWJlbCA9IHRoaXMub3JpZ2luWFxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5tYWpvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWC00LHYsdGhpcy5vcmlnaW5YKzQsdilcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5nZXRUZXh0KHZhbC50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSlcclxuICAgICAgICAgICAgICAgIGxldCBibmRzID0gdGV4dC5nZXRCb3VuZHMoKVxyXG4gICAgICAgICAgICAgICAgbGV0IHggPSB0aGlzLm9yaWdpblgtNS1ibmRzLndpZHRoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KHRleHQseCx2K2JuZHMuaGVpZ2h0LzItMTApXHJcbiAgICAgICAgICAgICAgICBpZiAoeCA8IG1pblhMYWJlbCkgbWluWExhYmVsID0geFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1pbm9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLTIsdix0aGlzLm9yaWdpblgrMix2KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWMubGFiZWwpIHtcclxuXHQgICAgICAgICAgICBsZXQgeSA9IHRoaXMub3JpZ2luWSAtICh0aGlzLm9yaWdpblkgLSBsYWJlbF9ibmRzLndpZHRoKS8yXHJcblx0ICAgICAgICAgICAgdGhpcy5kcmF3VGV4dChsYWJlbCwgbWluWExhYmVsIC0gbGFiZWxfYm5kcy5oZWlnaHQsIHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWCx0aGlzLm9yaWdpblksIHRoaXMuZW5kWCx0aGlzLm9yaWdpblkpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWMubGFiZWwpIHtcclxuXHQgICAgICAgICAgICBsZXQgeCA9ICh0aGlzLncgLSBlbmRNYXJnaW4gLSBsYWJlbF9ibmRzLndpZHRoKS8yXHJcblx0ICAgICAgICAgICAgdGhpcy5kcmF3VGV4dChsYWJlbCwgdGhpcy5vcmlnaW5YICsgeCwgdGhpcy5vcmlnaW5ZICsgMTUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWFqb3IpICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodix0aGlzLm9yaWdpblktNCx2LHRoaXMub3JpZ2luWSs0KVxyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFRleHQodmFsLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pKVxyXG4gICAgICAgICAgICAgICAgbGV0IGJuZHMgPSB0ZXh0LmdldEJvdW5kcygpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KHRleHQsdi1ibmRzLndpZHRoLzIsdGhpcy5vcmlnaW5ZKzQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh2LHRoaXMub3JpZ2luWS0yLHYsdGhpcy5vcmlnaW5ZKzIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TG9jKHZhbCkge1xyXG4gICAgICAgIGxldCBpdmFsID0gdGhpcy5saW5lYXI/IE1hdGgucm91bmQodGhpcy5zY2FsZSoodmFsLXRoaXMubWluKSk6IE1hdGgucm91bmQoTWF0aC5sb2codGhpcy5zY2FsZSoodmFsLXRoaXMubWluKSkpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmVydGljYWw/dGhpcy5vcmlnaW5ZIC0gaXZhbDp0aGlzLm9yaWdpblggKyBpdmFsXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VmFsdWUodikge1xyXG4gICAgXHRsZXQgZmFjdG9yID0gdGhpcy52ZXJ0aWNhbD8gKHRoaXMub3JpZ2luWSAtIHYpL3RoaXMub3JpZ2luWToodiAtIHRoaXMub3JpZ2luWCkvKHRoaXMudyAtIHRoaXMub3JpZ2luWClcclxuICAgICAgICByZXR1cm4gdGhpcy5taW4gKyAodGhpcy5tYXggLSB0aGlzLm1pbikgKiBmYWN0b3JcclxuICAgIH1cclxuXHJcbiAgICBpc0luc2lkZSh2KSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgIHJldHVybiB2ID49IHRoaXMub3JpZ2luWSAmJiB2IDw9ICh0aGlzLm9yaWdpblkgKyB0aGlzLmgpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gdiA+PSB0aGlzLm9yaWdpblggJiYgdiA8PSAodGhpcy5vcmlnaW5ZICsgdGhpcy53KVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCBBeGlzIGZyb20gXCIuL2F4aXNcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JhcGgge1xyXG5cdGNvbnN0cnVjdG9yKHNwZWMpIHtcclxuXHRcdHRoaXMuc3RhZ2UgPSBzcGVjLnN0YWdlXHJcblx0XHR0aGlzLnhheGlzID0gbmV3IEF4aXMoe1xyXG5cdFx0XHRzdGFnZTogdGhpcy5zdGFnZSxcclxuXHRcdFx0bGFiZWw6IHNwZWMueGxhYmVsLFxyXG5cdFx0XHRkaW06IHsgeDogc3BlYy54LCB5OiBzcGVjLnksIHc6IHNwZWMudywgaDogc3BlYy5oLCBtaW46IHNwZWMubWluWCwgbWF4OiBzcGVjLm1heFggfSxcclxuXHRcdFx0b3JpZW50OiBcImhvcml6b250YWxcIixcclxuXHRcdFx0c2NhbGU6IHNwZWMueHNjYWxlLFxyXG5cdFx0XHRtYWpvcjogc3BlYy5tYWpvclgsXHJcblx0XHRcdG1pbm9yOiBzcGVjLm1pbm9yWCxcclxuXHRcdFx0cHJlY2lzaW9uOiBzcGVjLnByZWNpc2lvblgsXHJcblx0XHRcdGludmVydDogc3BlYy54aW52ZXJ0XHJcblx0XHR9KVxyXG5cdFx0dGhpcy55YXhpcyA9IG5ldyBBeGlzKHtcclxuXHRcdFx0c3RhZ2U6IHRoaXMuc3RhZ2UsXHJcblx0XHRcdGxhYmVsOiBzcGVjLnlsYWJlbCxcclxuXHRcdFx0ZGltOiB7IHg6IHNwZWMueCwgeTogc3BlYy55LCB3OiBzcGVjLncsIGg6IHNwZWMuaCwgbWluOiBzcGVjLm1pblksIG1heDogc3BlYy5tYXhZIH0sXHJcblx0XHRcdG9yaWVudDogXCJ2ZXJ0aWNhbFwiLFxyXG5cdFx0XHRzY2FsZTogc3BlYy55c2NhbGUsXHJcblx0XHRcdG1ham9yOiBzcGVjLm1ham9yWSxcclxuXHRcdFx0bWlub3I6IHNwZWMubWlub3JZLFxyXG5cdFx0XHRwcmVjaXNpb246IHNwZWMucHJlY2lzaW9uWSxcclxuXHRcdFx0aW52ZXJ0OiBzcGVjLnlpbnZlcnRcclxuXHRcdH0pXHJcblx0XHR0aGlzLndpZHRoID0gMVxyXG5cdFx0dGhpcy5sYXN0ID0gbnVsbFxyXG5cdFx0dGhpcy5tYXJrZXIgPSBudWxsXHJcblx0XHR0aGlzLmNvbG9yID0gXCIjMDAwXCJcclxuXHRcdHRoaXMuZG90dGVkID0gZmFsc2VcclxuXHRcdGlmIChzcGVjLmJhY2tncm91bmQpIHtcclxuXHRcdFx0bGV0IGIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0XHRiLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKFwiI0FBQVwiKS5iZWdpbkZpbGwoc3BlYy5iYWNrZ3JvdW5kKS5kcmF3UmVjdChzcGVjLngsc3BlYy55LXNwZWMuaCxzcGVjLncsc3BlYy5oKS5lbmRTdHJva2UoKVxyXG5cdFx0XHRiLmFscGhhID0gMC4zXHJcblx0XHRcdHNwZWMuc3RhZ2UuYWRkQ2hpbGQoYilcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHNldFdpZHRoKHdpZHRoKSB7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGhcclxuXHR9XHJcblxyXG5cdHNldERvdHRlZChkb3R0ZWQpIHtcclxuXHRcdHRoaXMuZG90dGVkID0gZG90dGVkXHJcblx0fVxyXG5cclxuXHRzZXRDb2xvcihjb2xvcikge1xyXG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yXHJcblx0XHR0aGlzLmVuZFBsb3QoKVxyXG5cdFx0dGhpcy5tYXJrZXIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG4gICAgXHR0aGlzLm1hcmtlci5ncmFwaGljcy5iZWdpblN0cm9rZShjb2xvcikuYmVnaW5GaWxsKGNvbG9yKS5kcmF3UmVjdCgwLDAsNCw0KVxyXG4gICAgXHR0aGlzLm1hcmtlci54ID0gLTEwXHJcbiAgICBcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5tYXJrZXIpXHJcblx0fVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgIFx0dGhpcy54YXhpcy5yZW5kZXIoKVxyXG4gICAgXHR0aGlzLnlheGlzLnJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICBcdHRoaXMuc3RhZ2UucmVtb3ZlQWxsQ2hpbGRyZW4oKVxyXG4gICAgXHR0aGlzLmVuZFBsb3QoKVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVNYXJrZXIoeCx5KSB7XHJcbiAgICBcdGlmICh0aGlzLm1hcmtlcikge1xyXG4gICAgXHRcdHRoaXMubWFya2VyLnggPSB4LTJcclxuICAgIFx0XHR0aGlzLm1hcmtlci55ID0geS0yXHJcblxyXG4gICAgXHR9XHJcbiAgICB9XHJcblxyXG5cdGRyYXdMaW5lKHgxLHkxLHgyLHkyKSB7XHJcblx0XHRsZXQgbGluZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRpZiAodGhpcy5kb3R0ZWQgPT09IHRydWUpXHJcblx0XHRcdGxpbmUuZ3JhcGhpY3Muc2V0U3Ryb2tlRGFzaChbMiwyXSkuc2V0U3Ryb2tlU3R5bGUodGhpcy53aWR0aCkuYmVnaW5TdHJva2UodGhpcy5jb2xvcikubW92ZVRvKHgxLCB5MSkubGluZVRvKHgyLCB5MikuZW5kU3Ryb2tlKClcclxuXHRcdGVsc2VcclxuXHRcdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSh0aGlzLndpZHRoKS5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKS5tb3ZlVG8oeDEsIHkxKS5saW5lVG8oeDIsIHkyKS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChsaW5lKVxyXG5cdFx0cmV0dXJuIGxpbmVcclxuXHR9XHJcblxyXG4gICAgcGxvdCh4dix5dikge1xyXG4gICAgICAgIGlmICh4diA+PSB0aGlzLnhheGlzLm1pbiAmJiB4diA8PSB0aGlzLnhheGlzLm1heCAmJiB5diA+PSB0aGlzLnlheGlzLm1pbiAmJiB5diA8PSB0aGlzLnlheGlzLm1heCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IHRoaXMueGF4aXMuZ2V0TG9jKHh2KVxyXG4gICAgICAgICAgICBsZXQgeSA9IHRoaXMueWF4aXMuZ2V0TG9jKHl2KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0KSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlTWFya2VyKHRoaXMubGFzdC54LHRoaXMubGFzdC55KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLmxhc3QueCx0aGlzLmxhc3QueSx4LHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KHgseSlcclxuICAgICAgICAgICAgdGhpcy5tb3ZlTWFya2VyKHgseSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZW5kUGxvdCgpIHsgdGhpcy5sYXN0ID0gbnVsbCB9XHJcbn1cclxuIiwidmFyIGluZm8gPSBudWxsXG5cbndpbmRvdy5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgaWYgKGUuc291cmNlICE9IHdpbmRvdy5wYXJlbnQgKSByZXR1cm5cbiAgdmFyIG1zZyA9IGUuZGF0YVxuICBpZiAobXNnLmNtZCA9PSBcInNldEluZm9cIilcbiAgICBpbmZvID0gbXNnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBSZWFkeSgpIHtcbiAgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAoaW5mbyAhPSBudWxsKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpXG4gICAgICAgIHJlc29sdmUodHJ1ZSlcbiAgICAgIH1cbiAgICB9LCAxMDAwKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5zd2VyKCkge1xuICByZXR1cm4gaW5mby5hbnN3ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFuc3dlcihhbnN3ZXIpIHtcbiAgaW5mby5hbnN3ZXIgPSBhbnN3ZXJcbiAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7IGNtZDogXCJzZXRBbnN3ZXJcIiwgYW5zd2VyOiBhbnN3ZXIgfSwgaW5mby5vcmlnaW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcbiAgcmV0dXJuIGluZm8uc2V0dGluZ3Ncbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbXBsZXRlKHZhbGlkLCB0YXJnZXQpIHtcbiAgdGFyZ2V0LnBvc3RNZXNzYWdlKHsgY21kOiBcInNldFZhbGlkaXR5XCIsIHZhbGlkaXR5OiB2YWxpZCB9LCBpbmZvLm9yaWdpbilcbn1cbiJdfQ==
