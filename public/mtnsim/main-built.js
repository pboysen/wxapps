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

var LAPSE_RATE = -9.8;
createjs.MotionGuidePlugin.install();
createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashAudioPlugin]);
createjs.Ticker.frameRate = 10;

function getEl(id) {
  return document.getElementById(id);
}

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

    this.altitude = getEl("altitudereadout");
    this.temp = getEl("tempreadout");
    this.vapor = getEl("vaporreadout");
    this.dewpoint = getEl("dewpointreadout");
  }

  _createClass(Readout, [{
    key: "update",
    value: function update(trial) {
      this.altitude.value = trial.altitude.toFixed(1);
      this.temp.value = trial.temp.toFixed(1);
      this.vapor.value = trial.vapor.toFixed(1); //this.dewpoint.value = trial.dewpoint.toFixed(1)
    }
  }]);

  return Readout;
}();

var Settings = /*#__PURE__*/function () {
  function Settings() {
    var _this = this;

    _classCallCheck(this, Settings);

    this.readout = new Readout();
    this.temp = getEl("temp");
    this.vapor = getEl("vapor");
    this.dewpoint = getEl("dewpoint");
    this.tempout = getEl("tempout");
    this.vaporout = getEl("vaporout");
    this.dewpointout = getEl("dewpointout");
    this.mute = getEl("mute");
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

    this.run = getEl("run");
    this.pause = getEl("pause");
    this.restart = getEl("restart");
    this.mute = getEl("mute");
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
    this.results = getEl("results_table");
    getEl("delete_all").addEventListener("click", function (event) {
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
  function MtnSim(settings) {
    var _this8 = this;

    _classCallCheck(this, MtnSim);

    //setAnswer([]) // beginning default
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

(0, _message.getSettings)().then(function (settings) {
  return new MtnSim(settings).render();
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
exports.getAnswer = getAnswer;
exports.getSettings = getSettings;
exports.setAnswer = setAnswer;
exports.setComplete = setComplete;
var answer = null;
var origin = null;

function getSettings() {
  return new Promise(function (resolve) {
    window.addEventListener("message", function (e) {
      if (e.source != window.parent) return;
      var msg = e.data;

      if (msg.cmd == "setInfo") {
        answer = msg.answer;
        console.log(msg);
        origin = msg.origin;
        resolve(msg.settings);
      }
    }, {
      once: true
    });
  });
}

function getAnswer() {
  return answer;
}

function setAnswer(value) {
  answer = value;
  console.log(answer);
  window.parent.postMessage({
    cmd: "setAnswer",
    answer: answer
  }, origin);
}

function setComplete(valid, target) {
  target.postMessage({
    cmd: "setValidity",
    validity: valid
  }, origin);
}

},{}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3YxNC40LjAvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuNC4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjE0LjQuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi8uLi8ubnZtL3ZlcnNpb25zL25vZGUvdjE0LjQuMC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vLi4vLm52bS92ZXJzaW9ucy9ub2RlL3YxNC40LjAvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCJhcHBzL210bnNpbS9tYWluLmpzIiwiYXBwcy91dGlscy9heGlzLmpzIiwiYXBwcy91dGlscy9ncmFwaC5qcyIsImFwcHMvdXRpbHMvbWVzc2FnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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dEMsSUFBSSxDQUFDLENBQUMsTUFBRixJQUFZLE1BQU0sQ0FBQyxNQUF2QixFQUFnQztNQUNoQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBWjs7TUFDQSxJQUFJLEdBQUcsQ0FBQyxHQUFKLElBQVcsU0FBZixFQUEwQjtRQUN4QixNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQWI7UUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7UUFDQSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQWI7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQUwsQ0FBUDtNQUNEO0lBQ0YsQ0FURCxFQVNHO01BQUUsSUFBSSxFQUFFO0lBQVIsQ0FUSDtFQVVELENBWE0sQ0FBUDtBQVlEOztBQUVNLFNBQVMsU0FBVCxHQUFxQjtFQUMxQixPQUFPLE1BQVA7QUFDRDs7QUFFTSxTQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEI7RUFDL0IsTUFBTSxHQUFHLEtBQVQ7RUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLE1BQVo7RUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLFdBQWQsQ0FBMEI7SUFBRSxHQUFHLEVBQUUsV0FBUDtJQUFvQixNQUFNLEVBQUU7RUFBNUIsQ0FBMUIsRUFBZ0UsTUFBaEU7QUFDRDs7QUFFTSxTQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEIsTUFBNUIsRUFBb0M7RUFDekMsTUFBTSxDQUFDLFdBQVAsQ0FBbUI7SUFBRSxHQUFHLEVBQUUsYUFBUDtJQUFzQixRQUFRLEVBQUU7RUFBaEMsQ0FBbkIsRUFBNEQsTUFBNUQ7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qISBodHRwczovL210aHMuYmUvcHVueWNvZGUgdjEuNC4xIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGVzICovXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiZcblx0XHQhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0IW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChcblx0XHRmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC5zZWxmID09PSBmcmVlR2xvYmFsXG5cdCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBgcHVueWNvZGVgIG9iamVjdC5cblx0ICogQG5hbWUgcHVueWNvZGVcblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqL1xuXHR2YXIgcHVueWNvZGUsXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LCAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdHRNaW4gPSAxLFxuXHR0TWF4ID0gMjYsXG5cdHNrZXcgPSAzOCxcblx0ZGFtcCA9IDcwMCxcblx0aW5pdGlhbEJpYXMgPSA3Mixcblx0aW5pdGlhbE4gPSAxMjgsIC8vIDB4ODBcblx0ZGVsaW1pdGVyID0gJy0nLCAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdHJlZ2V4Tm9uQVNDSUkgPSAvW15cXHgyMC1cXHg3RV0vLCAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvW1xceDJFXFx1MzAwMlxcdUZGMEVcXHVGRjYxXS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBgQXJyYXkjbWFwYCB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnkgYXJyYXlcblx0ICogaXRlbS5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwKGFycmF5LCBmbikge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0cmVzdWx0W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3Mgb3IgZW1haWxcblx0ICogYWRkcmVzc2VzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcblx0ICogY2hhcmFjdGVyLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IHN0cmluZyBvZiBjaGFyYWN0ZXJzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFja1xuXHQgKiBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0dmFyIHBhcnRzID0gc3RyaW5nLnNwbGl0KCdAJyk7XG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBJbiBlbWFpbCBhZGRyZXNzZXMsIG9ubHkgdGhlIGRvbWFpbiBuYW1lIHNob3VsZCBiZSBwdW55Y29kZWQuIExlYXZlXG5cdFx0XHQvLyB0aGUgbG9jYWwgcGFydCAoaS5lLiBldmVyeXRoaW5nIHVwIHRvIGBAYCkgaW50YWN0LlxuXHRcdFx0cmVzdWx0ID0gcGFydHNbMF0gKyAnQCc7XG5cdFx0XHRzdHJpbmcgPSBwYXJ0c1sxXTtcblx0XHR9XG5cdFx0Ly8gQXZvaWQgYHNwbGl0KHJlZ2V4KWAgZm9yIElFOCBjb21wYXRpYmlsaXR5LiBTZWUgIzE3LlxuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4U2VwYXJhdG9ycywgJ1xceDJFJyk7XG5cdFx0dmFyIGxhYmVscyA9IHN0cmluZy5zcGxpdCgnLicpO1xuXHRcdHZhciBlbmNvZGVkID0gbWFwKGxhYmVscywgZm4pLmpvaW4oJy4nKTtcblx0XHRyZXR1cm4gcmVzdWx0ICsgZW5jb2RlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG51bWVyaWMgY29kZSBwb2ludHMgb2YgZWFjaCBVbmljb2RlXG5cdCAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcblx0ICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcblx0ICogVUNTLTIgZXhwb3NlcyBhcyBzZXBhcmF0ZSBjaGFyYWN0ZXJzKSBpbnRvIGEgc2luZ2xlIGNvZGUgcG9pbnQsXG5cdCAqIG1hdGNoaW5nIFVURi0xNi5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG5cdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBkZWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cblx0ICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGNvdW50ZXIgPSAwLFxuXHRcdCAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuXHRcdCAgICB2YWx1ZSxcblx0XHQgICAgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5kZWNvZGVgXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGVuY29kZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb2RlUG9pbnRzIFRoZSBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cblx0ICogQHNlZSBgZGlnaXRUb0Jhc2ljKClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50IChmb3IgdXNlIGluXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcblx0ICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNpY1RvRGlnaXQoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCAtIDQ4IDwgMTApIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSAyMjtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDY1IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA2NTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDk3IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA5Nztcblx0XHR9XG5cdFx0cmV0dXJuIGJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3Jcblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpcyBgZGlnaXRgLCB3aGljaCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2Vcblx0ICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG5cdCAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG5cdCAqIGlmIGBmbGFnYCBpcyBub24temVybyBhbmQgYGRpZ2l0YCBoYXMgbm8gdXBwZXJjYXNlIGZvcm0uXG5cdCAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cblx0ICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIChlLmcuIGEgZG9tYWluIG5hbWUgbGFiZWwpIHRvIGFcblx0ICogUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3Ncblx0ICogdG8gVW5pY29kZS4gT25seSB0aGUgUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBpbnB1dCB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLlxuXHQgKiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW5cblx0ICogY29udmVydGVkIHRvIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlZCBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIGNvbnZlcnQgdG8gVW5pY29kZS5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG5cdCAqIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvVW5pY29kZShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogUHVueWNvZGUuIE9ubHkgdGhlIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsXG5cdCAqIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpblxuXHQgKiBBU0NJSS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0byBjb252ZXJ0LCBhcyBhXG5cdCAqIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lIG9yXG5cdCAqIGVtYWlsIGFkZHJlc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0FTQ0lJKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuNC4xJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuXHRcdGlmIChtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cykge1xuXHRcdFx0Ly8gaW4gTm9kZS5qcywgaW8uanMsIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwdW55Y29kZSA9IHJlcXVpcmUoJ3B1bnljb2RlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5leHBvcnRzLnBhcnNlID0gdXJsUGFyc2U7XG5leHBvcnRzLnJlc29sdmUgPSB1cmxSZXNvbHZlO1xuZXhwb3J0cy5yZXNvbHZlT2JqZWN0ID0gdXJsUmVzb2x2ZU9iamVjdDtcbmV4cG9ydHMuZm9ybWF0ID0gdXJsRm9ybWF0O1xuXG5leHBvcnRzLlVybCA9IFVybDtcblxuZnVuY3Rpb24gVXJsKCkge1xuICB0aGlzLnByb3RvY29sID0gbnVsbDtcbiAgdGhpcy5zbGFzaGVzID0gbnVsbDtcbiAgdGhpcy5hdXRoID0gbnVsbDtcbiAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgdGhpcy5wb3J0ID0gbnVsbDtcbiAgdGhpcy5ob3N0bmFtZSA9IG51bGw7XG4gIHRoaXMuaGFzaCA9IG51bGw7XG4gIHRoaXMuc2VhcmNoID0gbnVsbDtcbiAgdGhpcy5xdWVyeSA9IG51bGw7XG4gIHRoaXMucGF0aG5hbWUgPSBudWxsO1xuICB0aGlzLnBhdGggPSBudWxsO1xuICB0aGlzLmhyZWYgPSBudWxsO1xufVxuXG4vLyBSZWZlcmVuY2U6IFJGQyAzOTg2LCBSRkMgMTgwOCwgUkZDIDIzOTZcblxuLy8gZGVmaW5lIHRoZXNlIGhlcmUgc28gYXQgbGVhc3QgdGhleSBvbmx5IGhhdmUgdG8gYmVcbi8vIGNvbXBpbGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vZHVsZSBsb2FkLlxudmFyIHByb3RvY29sUGF0dGVybiA9IC9eKFthLXowLTkuKy1dKzopL2ksXG4gICAgcG9ydFBhdHRlcm4gPSAvOlswLTldKiQvLFxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHNpbXBsZSBwYXRoIFVSTFxuICAgIHNpbXBsZVBhdGhQYXR0ZXJuID0gL14oXFwvXFwvPyg/IVxcLylbXlxcP1xcc10qKShcXD9bXlxcc10qKT8kLyxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIHJlc2VydmVkIGZvciBkZWxpbWl0aW5nIFVSTHMuXG4gICAgLy8gV2UgYWN0dWFsbHkganVzdCBhdXRvLWVzY2FwZSB0aGVzZS5cbiAgICBkZWxpbXMgPSBbJzwnLCAnPicsICdcIicsICdgJywgJyAnLCAnXFxyJywgJ1xcbicsICdcXHQnXSxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIG5vdCBhbGxvd2VkIGZvciB2YXJpb3VzIHJlYXNvbnMuXG4gICAgdW53aXNlID0gWyd7JywgJ30nLCAnfCcsICdcXFxcJywgJ14nLCAnYCddLmNvbmNhdChkZWxpbXMpLFxuXG4gICAgLy8gQWxsb3dlZCBieSBSRkNzLCBidXQgY2F1c2Ugb2YgWFNTIGF0dGFja3MuICBBbHdheXMgZXNjYXBlIHRoZXNlLlxuICAgIGF1dG9Fc2NhcGUgPSBbJ1xcJyddLmNvbmNhdCh1bndpc2UpLFxuICAgIC8vIENoYXJhY3RlcnMgdGhhdCBhcmUgbmV2ZXIgZXZlciBhbGxvd2VkIGluIGEgaG9zdG5hbWUuXG4gICAgLy8gTm90ZSB0aGF0IGFueSBpbnZhbGlkIGNoYXJzIGFyZSBhbHNvIGhhbmRsZWQsIGJ1dCB0aGVzZVxuICAgIC8vIGFyZSB0aGUgb25lcyB0aGF0IGFyZSAqZXhwZWN0ZWQqIHRvIGJlIHNlZW4sIHNvIHdlIGZhc3QtcGF0aFxuICAgIC8vIHRoZW0uXG4gICAgbm9uSG9zdENoYXJzID0gWyclJywgJy8nLCAnPycsICc7JywgJyMnXS5jb25jYXQoYXV0b0VzY2FwZSksXG4gICAgaG9zdEVuZGluZ0NoYXJzID0gWycvJywgJz8nLCAnIyddLFxuICAgIGhvc3RuYW1lTWF4TGVuID0gMjU1LFxuICAgIGhvc3RuYW1lUGFydFBhdHRlcm4gPSAvXlsrYS16MC05QS1aXy1dezAsNjN9JC8sXG4gICAgaG9zdG5hbWVQYXJ0U3RhcnQgPSAvXihbK2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgY2FuIGFsbG93IFwidW5zYWZlXCIgYW5kIFwidW53aXNlXCIgY2hhcnMuXG4gICAgdW5zYWZlUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBuZXZlciBoYXZlIGEgaG9zdG5hbWUuXG4gICAgaG9zdGxlc3NQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IGFsd2F5cyBjb250YWluIGEgLy8gYml0LlxuICAgIHNsYXNoZWRQcm90b2NvbCA9IHtcbiAgICAgICdodHRwJzogdHJ1ZSxcbiAgICAgICdodHRwcyc6IHRydWUsXG4gICAgICAnZnRwJzogdHJ1ZSxcbiAgICAgICdnb3BoZXInOiB0cnVlLFxuICAgICAgJ2ZpbGUnOiB0cnVlLFxuICAgICAgJ2h0dHA6JzogdHJ1ZSxcbiAgICAgICdodHRwczonOiB0cnVlLFxuICAgICAgJ2Z0cDonOiB0cnVlLFxuICAgICAgJ2dvcGhlcjonOiB0cnVlLFxuICAgICAgJ2ZpbGU6JzogdHJ1ZVxuICAgIH0sXG4gICAgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5mdW5jdGlvbiB1cmxQYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICh1cmwgJiYgdXRpbC5pc09iamVjdCh1cmwpICYmIHVybCBpbnN0YW5jZW9mIFVybCkgcmV0dXJuIHVybDtcblxuICB2YXIgdSA9IG5ldyBVcmw7XG4gIHUucGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCk7XG4gIHJldHVybiB1O1xufVxuXG5VcmwucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24odXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAoIXV0aWwuaXNTdHJpbmcodXJsKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQYXJhbWV0ZXIgJ3VybCcgbXVzdCBiZSBhIHN0cmluZywgbm90IFwiICsgdHlwZW9mIHVybCk7XG4gIH1cblxuICAvLyBDb3B5IGNocm9tZSwgSUUsIG9wZXJhIGJhY2tzbGFzaC1oYW5kbGluZyBiZWhhdmlvci5cbiAgLy8gQmFjayBzbGFzaGVzIGJlZm9yZSB0aGUgcXVlcnkgc3RyaW5nIGdldCBjb252ZXJ0ZWQgdG8gZm9yd2FyZCBzbGFzaGVzXG4gIC8vIFNlZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI1OTE2XG4gIHZhciBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKSxcbiAgICAgIHNwbGl0dGVyID1cbiAgICAgICAgICAocXVlcnlJbmRleCAhPT0gLTEgJiYgcXVlcnlJbmRleCA8IHVybC5pbmRleE9mKCcjJykpID8gJz8nIDogJyMnLFxuICAgICAgdVNwbGl0ID0gdXJsLnNwbGl0KHNwbGl0dGVyKSxcbiAgICAgIHNsYXNoUmVnZXggPSAvXFxcXC9nO1xuICB1U3BsaXRbMF0gPSB1U3BsaXRbMF0ucmVwbGFjZShzbGFzaFJlZ2V4LCAnLycpO1xuICB1cmwgPSB1U3BsaXQuam9pbihzcGxpdHRlcik7XG5cbiAgdmFyIHJlc3QgPSB1cmw7XG5cbiAgLy8gdHJpbSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgLy8gVGhpcyBpcyB0byBzdXBwb3J0IHBhcnNlIHN0dWZmIGxpa2UgXCIgIGh0dHA6Ly9mb28uY29tICBcXG5cIlxuICByZXN0ID0gcmVzdC50cmltKCk7XG5cbiAgaWYgKCFzbGFzaGVzRGVub3RlSG9zdCAmJiB1cmwuc3BsaXQoJyMnKS5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBUcnkgZmFzdCBwYXRoIHJlZ2V4cFxuICAgIHZhciBzaW1wbGVQYXRoID0gc2ltcGxlUGF0aFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgICBpZiAoc2ltcGxlUGF0aCkge1xuICAgICAgdGhpcy5wYXRoID0gcmVzdDtcbiAgICAgIHRoaXMuaHJlZiA9IHJlc3Q7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gc2ltcGxlUGF0aFsxXTtcbiAgICAgIGlmIChzaW1wbGVQYXRoWzJdKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gc2ltcGxlUGF0aFsyXTtcbiAgICAgICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5zZWFyY2guc3Vic3RyKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5zZWFyY2guc3Vic3RyKDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICAgICAgdGhpcy5xdWVyeSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3RvID0gcHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gIGlmIChwcm90bykge1xuICAgIHByb3RvID0gcHJvdG9bMF07XG4gICAgdmFyIGxvd2VyUHJvdG8gPSBwcm90by50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBsb3dlclByb3RvO1xuICAgIHJlc3QgPSByZXN0LnN1YnN0cihwcm90by5sZW5ndGgpO1xuICB9XG5cbiAgLy8gZmlndXJlIG91dCBpZiBpdCdzIGdvdCBhIGhvc3RcbiAgLy8gdXNlckBzZXJ2ZXIgaXMgKmFsd2F5cyogaW50ZXJwcmV0ZWQgYXMgYSBob3N0bmFtZSwgYW5kIHVybFxuICAvLyByZXNvbHV0aW9uIHdpbGwgdHJlYXQgLy9mb28vYmFyIGFzIGhvc3Q9Zm9vLHBhdGg9YmFyIGJlY2F1c2UgdGhhdCdzXG4gIC8vIGhvdyB0aGUgYnJvd3NlciByZXNvbHZlcyByZWxhdGl2ZSBVUkxzLlxuICBpZiAoc2xhc2hlc0Rlbm90ZUhvc3QgfHwgcHJvdG8gfHwgcmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpIHtcbiAgICB2YXIgc2xhc2hlcyA9IHJlc3Quc3Vic3RyKDAsIDIpID09PSAnLy8nO1xuICAgIGlmIChzbGFzaGVzICYmICEocHJvdG8gJiYgaG9zdGxlc3NQcm90b2NvbFtwcm90b10pKSB7XG4gICAgICByZXN0ID0gcmVzdC5zdWJzdHIoMik7XG4gICAgICB0aGlzLnNsYXNoZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaG9zdGxlc3NQcm90b2NvbFtwcm90b10gJiZcbiAgICAgIChzbGFzaGVzIHx8IChwcm90byAmJiAhc2xhc2hlZFByb3RvY29sW3Byb3RvXSkpKSB7XG5cbiAgICAvLyB0aGVyZSdzIGEgaG9zdG5hbWUuXG4gICAgLy8gdGhlIGZpcnN0IGluc3RhbmNlIG9mIC8sID8sIDssIG9yICMgZW5kcyB0aGUgaG9zdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIEAgaW4gdGhlIGhvc3RuYW1lLCB0aGVuIG5vbi1ob3N0IGNoYXJzICphcmUqIGFsbG93ZWRcbiAgICAvLyB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBAIHNpZ24sIHVubGVzcyBzb21lIGhvc3QtZW5kaW5nIGNoYXJhY3RlclxuICAgIC8vIGNvbWVzICpiZWZvcmUqIHRoZSBALXNpZ24uXG4gICAgLy8gVVJMcyBhcmUgb2Jub3hpb3VzLlxuICAgIC8vXG4gICAgLy8gZXg6XG4gICAgLy8gaHR0cDovL2FAYkBjLyA9PiB1c2VyOmFAYiBob3N0OmNcbiAgICAvLyBodHRwOi8vYUBiP0BjID0+IHVzZXI6YSBob3N0OmMgcGF0aDovP0BjXG5cbiAgICAvLyB2MC4xMiBUT0RPKGlzYWFjcyk6IFRoaXMgaXMgbm90IHF1aXRlIGhvdyBDaHJvbWUgZG9lcyB0aGluZ3MuXG4gICAgLy8gUmV2aWV3IG91ciB0ZXN0IGNhc2UgYWdhaW5zdCBicm93c2VycyBtb3JlIGNvbXByZWhlbnNpdmVseS5cblxuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFueSBob3N0RW5kaW5nQ2hhcnNcbiAgICB2YXIgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9zdEVuZGluZ0NoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKGhvc3RFbmRpbmdDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZWl0aGVyIHdlIGhhdmUgYW4gZXhwbGljaXQgcG9pbnQgd2hlcmUgdGhlXG4gICAgLy8gYXV0aCBwb3J0aW9uIGNhbm5vdCBnbyBwYXN0LCBvciB0aGUgbGFzdCBAIGNoYXIgaXMgdGhlIGRlY2lkZXIuXG4gICAgdmFyIGF1dGgsIGF0U2lnbjtcbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIGF0U2lnbiBjYW4gYmUgYW55d2hlcmUuXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0U2lnbiBtdXN0IGJlIGluIGF1dGggcG9ydGlvbi5cbiAgICAgIC8vIGh0dHA6Ly9hQGIvY0BkID0+IGhvc3Q6YiBhdXRoOmEgcGF0aDovY0BkXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJywgaG9zdEVuZCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHdlIGhhdmUgYSBwb3J0aW9uIHdoaWNoIGlzIGRlZmluaXRlbHkgdGhlIGF1dGguXG4gICAgLy8gUHVsbCB0aGF0IG9mZi5cbiAgICBpZiAoYXRTaWduICE9PSAtMSkge1xuICAgICAgYXV0aCA9IHJlc3Quc2xpY2UoMCwgYXRTaWduKTtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKGF0U2lnbiArIDEpO1xuICAgICAgdGhpcy5hdXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIH1cblxuICAgIC8vIHRoZSBob3N0IGlzIHRoZSByZW1haW5pbmcgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IG5vbi1ob3N0IGNoYXJcbiAgICBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub25Ib3N0Q2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2Yobm9uSG9zdENoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG4gICAgLy8gaWYgd2Ugc3RpbGwgaGF2ZSBub3QgaGl0IGl0LCB0aGVuIHRoZSBlbnRpcmUgdGhpbmcgaXMgYSBob3N0LlxuICAgIGlmIChob3N0RW5kID09PSAtMSlcbiAgICAgIGhvc3RFbmQgPSByZXN0Lmxlbmd0aDtcblxuICAgIHRoaXMuaG9zdCA9IHJlc3Quc2xpY2UoMCwgaG9zdEVuZCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoaG9zdEVuZCk7XG5cbiAgICAvLyBwdWxsIG91dCBwb3J0LlxuICAgIHRoaXMucGFyc2VIb3N0KCk7XG5cbiAgICAvLyB3ZSd2ZSBpbmRpY2F0ZWQgdGhhdCB0aGVyZSBpcyBhIGhvc3RuYW1lLFxuICAgIC8vIHNvIGV2ZW4gaWYgaXQncyBlbXB0eSwgaXQgaGFzIHRvIGJlIHByZXNlbnQuXG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG5cbiAgICAvLyBpZiBob3N0bmFtZSBiZWdpbnMgd2l0aCBbIGFuZCBlbmRzIHdpdGggXVxuICAgIC8vIGFzc3VtZSB0aGF0IGl0J3MgYW4gSVB2NiBhZGRyZXNzLlxuICAgIHZhciBpcHY2SG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lWzBdID09PSAnWycgJiZcbiAgICAgICAgdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDFdID09PSAnXSc7XG5cbiAgICAvLyB2YWxpZGF0ZSBhIGxpdHRsZS5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgdmFyIGhvc3RwYXJ0cyA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBob3N0cGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaG9zdHBhcnRzW2ldO1xuICAgICAgICBpZiAoIXBhcnQpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICB2YXIgbmV3cGFydCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gcGFydC5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoaikgPiAxMjcpIHtcbiAgICAgICAgICAgICAgLy8gd2UgcmVwbGFjZSBub24tQVNDSUkgY2hhciB3aXRoIGEgdGVtcG9yYXJ5IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byBtYWtlIHN1cmUgc2l6ZSBvZiBob3N0bmFtZSBpcyBub3RcbiAgICAgICAgICAgICAgLy8gYnJva2VuIGJ5IHJlcGxhY2luZyBub24tQVNDSUkgYnkgbm90aGluZ1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9ICd4JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gcGFydFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgdGVzdCBhZ2FpbiB3aXRoIEFTQ0lJIGNoYXIgb25seVxuICAgICAgICAgIGlmICghbmV3cGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFyIHZhbGlkUGFydHMgPSBob3N0cGFydHMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB2YXIgbm90SG9zdCA9IGhvc3RwYXJ0cy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICB2YXIgYml0ID0gcGFydC5tYXRjaChob3N0bmFtZVBhcnRTdGFydCk7XG4gICAgICAgICAgICBpZiAoYml0KSB7XG4gICAgICAgICAgICAgIHZhbGlkUGFydHMucHVzaChiaXRbMV0pO1xuICAgICAgICAgICAgICBub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RIb3N0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXN0ID0gJy8nICsgbm90SG9zdC5qb2luKCcuJykgKyByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ob3N0bmFtZSA9IHZhbGlkUGFydHMuam9pbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaG9zdG5hbWUubGVuZ3RoID4gaG9zdG5hbWVNYXhMZW4pIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaG9zdG5hbWVzIGFyZSBhbHdheXMgbG93ZXIgY2FzZS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIC8vIElETkEgU3VwcG9ydDogUmV0dXJucyBhIHB1bnljb2RlZCByZXByZXNlbnRhdGlvbiBvZiBcImRvbWFpblwiLlxuICAgICAgLy8gSXQgb25seSBjb252ZXJ0cyBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgdGhhdFxuICAgICAgLy8gaGF2ZSBub24tQVNDSUkgY2hhcmFjdGVycywgaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZlxuICAgICAgLy8geW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0IGFscmVhZHkgaXMgQVNDSUktb25seS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuaG9zdG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBwID0gdGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyc7XG4gICAgdmFyIGggPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuICAgIHRoaXMuaG9zdCA9IGggKyBwO1xuICAgIHRoaXMuaHJlZiArPSB0aGlzLmhvc3Q7XG5cbiAgICAvLyBzdHJpcCBbIGFuZCBdIGZyb20gdGhlIGhvc3RuYW1lXG4gICAgLy8gdGhlIGhvc3QgZmllbGQgc3RpbGwgcmV0YWlucyB0aGVtLCB0aG91Z2hcbiAgICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS5zdWJzdHIoMSwgdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChyZXN0WzBdICE9PSAnLycpIHtcbiAgICAgICAgcmVzdCA9ICcvJyArIHJlc3Q7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHJlc3QgaXMgc2V0IHRvIHRoZSBwb3N0LWhvc3Qgc3R1ZmYuXG4gIC8vIGNob3Agb2ZmIGFueSBkZWxpbSBjaGFycy5cbiAgaWYgKCF1bnNhZmVQcm90b2NvbFtsb3dlclByb3RvXSkge1xuXG4gICAgLy8gRmlyc3QsIG1ha2UgMTAwJSBzdXJlIHRoYXQgYW55IFwiYXV0b0VzY2FwZVwiIGNoYXJzIGdldFxuICAgIC8vIGVzY2FwZWQsIGV2ZW4gaWYgZW5jb2RlVVJJQ29tcG9uZW50IGRvZXNuJ3QgdGhpbmsgdGhleVxuICAgIC8vIG5lZWQgdG8gYmUuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdXRvRXNjYXBlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGFlID0gYXV0b0VzY2FwZVtpXTtcbiAgICAgIGlmIChyZXN0LmluZGV4T2YoYWUpID09PSAtMSlcbiAgICAgICAgY29udGludWU7XG4gICAgICB2YXIgZXNjID0gZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtcbiAgICAgIGlmIChlc2MgPT09IGFlKSB7XG4gICAgICAgIGVzYyA9IGVzY2FwZShhZSk7XG4gICAgICB9XG4gICAgICByZXN0ID0gcmVzdC5zcGxpdChhZSkuam9pbihlc2MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2hvcCBvZmYgZnJvbSB0aGUgdGFpbCBmaXJzdC5cbiAgdmFyIGhhc2ggPSByZXN0LmluZGV4T2YoJyMnKTtcbiAgaWYgKGhhc2ggIT09IC0xKSB7XG4gICAgLy8gZ290IGEgZnJhZ21lbnQgc3RyaW5nLlxuICAgIHRoaXMuaGFzaCA9IHJlc3Quc3Vic3RyKGhhc2gpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIGhhc2gpO1xuICB9XG4gIHZhciBxbSA9IHJlc3QuaW5kZXhPZignPycpO1xuICBpZiAocW0gIT09IC0xKSB7XG4gICAgdGhpcy5zZWFyY2ggPSByZXN0LnN1YnN0cihxbSk7XG4gICAgdGhpcy5xdWVyeSA9IHJlc3Quc3Vic3RyKHFtICsgMSk7XG4gICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgcW0pO1xuICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAvLyBubyBxdWVyeSBzdHJpbmcsIGJ1dCBwYXJzZVF1ZXJ5U3RyaW5nIHN0aWxsIHJlcXVlc3RlZFxuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgdGhpcy5xdWVyeSA9IHt9O1xuICB9XG4gIGlmIChyZXN0KSB0aGlzLnBhdGhuYW1lID0gcmVzdDtcbiAgaWYgKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSAmJlxuICAgICAgdGhpcy5ob3N0bmFtZSAmJiAhdGhpcy5wYXRobmFtZSkge1xuICAgIHRoaXMucGF0aG5hbWUgPSAnLyc7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gIGlmICh0aGlzLnBhdGhuYW1lIHx8IHRoaXMuc2VhcmNoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBhdGhuYW1lIHx8ICcnO1xuICAgIHZhciBzID0gdGhpcy5zZWFyY2ggfHwgJyc7XG4gICAgdGhpcy5wYXRoID0gcCArIHM7XG4gIH1cblxuICAvLyBmaW5hbGx5LCByZWNvbnN0cnVjdCB0aGUgaHJlZiBiYXNlZCBvbiB3aGF0IGhhcyBiZWVuIHZhbGlkYXRlZC5cbiAgdGhpcy5ocmVmID0gdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBmb3JtYXQgYSBwYXJzZWQgb2JqZWN0IGludG8gYSB1cmwgc3RyaW5nXG5mdW5jdGlvbiB1cmxGb3JtYXQob2JqKSB7XG4gIC8vIGVuc3VyZSBpdCdzIGFuIG9iamVjdCwgYW5kIG5vdCBhIHN0cmluZyB1cmwuXG4gIC8vIElmIGl0J3MgYW4gb2JqLCB0aGlzIGlzIGEgbm8tb3AuXG4gIC8vIHRoaXMgd2F5LCB5b3UgY2FuIGNhbGwgdXJsX2Zvcm1hdCgpIG9uIHN0cmluZ3NcbiAgLy8gdG8gY2xlYW4gdXAgcG90ZW50aWFsbHkgd29ua3kgdXJscy5cbiAgaWYgKHV0aWwuaXNTdHJpbmcob2JqKSkgb2JqID0gdXJsUGFyc2Uob2JqKTtcbiAgaWYgKCEob2JqIGluc3RhbmNlb2YgVXJsKSkgcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtcbiAgcmV0dXJuIG9iai5mb3JtYXQoKTtcbn1cblxuVXJsLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF1dGggPSB0aGlzLmF1dGggfHwgJyc7XG4gIGlmIChhdXRoKSB7XG4gICAgYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICBhdXRoID0gYXV0aC5yZXBsYWNlKC8lM0EvaSwgJzonKTtcbiAgICBhdXRoICs9ICdAJztcbiAgfVxuXG4gIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2wgfHwgJycsXG4gICAgICBwYXRobmFtZSA9IHRoaXMucGF0aG5hbWUgfHwgJycsXG4gICAgICBoYXNoID0gdGhpcy5oYXNoIHx8ICcnLFxuICAgICAgaG9zdCA9IGZhbHNlLFxuICAgICAgcXVlcnkgPSAnJztcblxuICBpZiAodGhpcy5ob3N0KSB7XG4gICAgaG9zdCA9IGF1dGggKyB0aGlzLmhvc3Q7XG4gIH0gZWxzZSBpZiAodGhpcy5ob3N0bmFtZSkge1xuICAgIGhvc3QgPSBhdXRoICsgKHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpID09PSAtMSA/XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgOlxuICAgICAgICAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nKTtcbiAgICBpZiAodGhpcy5wb3J0KSB7XG4gICAgICBob3N0ICs9ICc6JyArIHRoaXMucG9ydDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5xdWVyeSAmJlxuICAgICAgdXRpbC5pc09iamVjdCh0aGlzLnF1ZXJ5KSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5xdWVyeSkubGVuZ3RoKSB7XG4gICAgcXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodGhpcy5xdWVyeSk7XG4gIH1cblxuICB2YXIgc2VhcmNoID0gdGhpcy5zZWFyY2ggfHwgKHF1ZXJ5ICYmICgnPycgKyBxdWVyeSkpIHx8ICcnO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5zdWJzdHIoLTEpICE9PSAnOicpIHByb3RvY29sICs9ICc6JztcblxuICAvLyBvbmx5IHRoZSBzbGFzaGVkUHJvdG9jb2xzIGdldCB0aGUgLy8uICBOb3QgbWFpbHRvOiwgeG1wcDosIGV0Yy5cbiAgLy8gdW5sZXNzIHRoZXkgaGFkIHRoZW0gdG8gYmVnaW4gd2l0aC5cbiAgaWYgKHRoaXMuc2xhc2hlcyB8fFxuICAgICAgKCFwcm90b2NvbCB8fCBzbGFzaGVkUHJvdG9jb2xbcHJvdG9jb2xdKSAmJiBob3N0ICE9PSBmYWxzZSkge1xuICAgIGhvc3QgPSAnLy8nICsgKGhvc3QgfHwgJycpO1xuICAgIGlmIChwYXRobmFtZSAmJiBwYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJykgcGF0aG5hbWUgPSAnLycgKyBwYXRobmFtZTtcbiAgfSBlbHNlIGlmICghaG9zdCkge1xuICAgIGhvc3QgPSAnJztcbiAgfVxuXG4gIGlmIChoYXNoICYmIGhhc2guY2hhckF0KDApICE9PSAnIycpIGhhc2ggPSAnIycgKyBoYXNoO1xuICBpZiAoc2VhcmNoICYmIHNlYXJjaC5jaGFyQXQoMCkgIT09ICc/Jykgc2VhcmNoID0gJz8nICsgc2VhcmNoO1xuXG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvWz8jXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQobWF0Y2gpO1xuICB9KTtcbiAgc2VhcmNoID0gc2VhcmNoLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG5cbiAgcmV0dXJuIHByb3RvY29sICsgaG9zdCArIHBhdGhuYW1lICsgc2VhcmNoICsgaGFzaDtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmUoc291cmNlLCByZWxhdGl2ZSkge1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZShyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIHJldHVybiB0aGlzLnJlc29sdmVPYmplY3QodXJsUGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKSkuZm9ybWF0KCk7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlT2JqZWN0KHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgaWYgKCFzb3VyY2UpIHJldHVybiByZWxhdGl2ZTtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmVPYmplY3QocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmVPYmplY3QgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICBpZiAodXRpbC5pc1N0cmluZyhyZWxhdGl2ZSkpIHtcbiAgICB2YXIgcmVsID0gbmV3IFVybCgpO1xuICAgIHJlbC5wYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpO1xuICAgIHJlbGF0aXZlID0gcmVsO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBVcmwoKTtcbiAgdmFyIHRrZXlzID0gT2JqZWN0LmtleXModGhpcyk7XG4gIGZvciAodmFyIHRrID0gMDsgdGsgPCB0a2V5cy5sZW5ndGg7IHRrKyspIHtcbiAgICB2YXIgdGtleSA9IHRrZXlzW3RrXTtcbiAgICByZXN1bHRbdGtleV0gPSB0aGlzW3RrZXldO1xuICB9XG5cbiAgLy8gaGFzaCBpcyBhbHdheXMgb3ZlcnJpZGRlbiwgbm8gbWF0dGVyIHdoYXQuXG4gIC8vIGV2ZW4gaHJlZj1cIlwiIHdpbGwgcmVtb3ZlIGl0LlxuICByZXN1bHQuaGFzaCA9IHJlbGF0aXZlLmhhc2g7XG5cbiAgLy8gaWYgdGhlIHJlbGF0aXZlIHVybCBpcyBlbXB0eSwgdGhlbiB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkbyBoZXJlLlxuICBpZiAocmVsYXRpdmUuaHJlZiA9PT0gJycpIHtcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaHJlZnMgbGlrZSAvL2Zvby9iYXIgYWx3YXlzIGN1dCB0byB0aGUgcHJvdG9jb2wuXG4gIGlmIChyZWxhdGl2ZS5zbGFzaGVzICYmICFyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgIC8vIHRha2UgZXZlcnl0aGluZyBleGNlcHQgdGhlIHByb3RvY29sIGZyb20gcmVsYXRpdmVcbiAgICB2YXIgcmtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgZm9yICh2YXIgcmsgPSAwOyByayA8IHJrZXlzLmxlbmd0aDsgcmsrKykge1xuICAgICAgdmFyIHJrZXkgPSBya2V5c1tya107XG4gICAgICBpZiAocmtleSAhPT0gJ3Byb3RvY29sJylcbiAgICAgICAgcmVzdWx0W3JrZXldID0gcmVsYXRpdmVbcmtleV07XG4gICAgfVxuXG4gICAgLy91cmxQYXJzZSBhcHBlbmRzIHRyYWlsaW5nIC8gdG8gdXJscyBsaWtlIGh0dHA6Ly93d3cuZXhhbXBsZS5jb21cbiAgICBpZiAoc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF0gJiZcbiAgICAgICAgcmVzdWx0Lmhvc3RuYW1lICYmICFyZXN1bHQucGF0aG5hbWUpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gcmVzdWx0LnBhdGhuYW1lID0gJy8nO1xuICAgIH1cblxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAocmVsYXRpdmUucHJvdG9jb2wgJiYgcmVsYXRpdmUucHJvdG9jb2wgIT09IHJlc3VsdC5wcm90b2NvbCkge1xuICAgIC8vIGlmIGl0J3MgYSBrbm93biB1cmwgcHJvdG9jb2wsIHRoZW4gY2hhbmdpbmdcbiAgICAvLyB0aGUgcHJvdG9jb2wgZG9lcyB3ZWlyZCB0aGluZ3NcbiAgICAvLyBmaXJzdCwgaWYgaXQncyBub3QgZmlsZTosIHRoZW4gd2UgTVVTVCBoYXZlIGEgaG9zdCxcbiAgICAvLyBhbmQgaWYgdGhlcmUgd2FzIGEgcGF0aFxuICAgIC8vIHRvIGJlZ2luIHdpdGgsIHRoZW4gd2UgTVVTVCBoYXZlIGEgcGF0aC5cbiAgICAvLyBpZiBpdCBpcyBmaWxlOiwgdGhlbiB0aGUgaG9zdCBpcyBkcm9wcGVkLFxuICAgIC8vIGJlY2F1c2UgdGhhdCdzIGtub3duIHRvIGJlIGhvc3RsZXNzLlxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgYXNzdW1lZCB0byBiZSBhYnNvbHV0ZS5cbiAgICBpZiAoIXNsYXNoZWRQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gICAgICAgIHZhciBrID0ga2V5c1t2XTtcbiAgICAgICAgcmVzdWx0W2tdID0gcmVsYXRpdmVba107XG4gICAgICB9XG4gICAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb3RvY29sID0gcmVsYXRpdmUucHJvdG9jb2w7XG4gICAgaWYgKCFyZWxhdGl2ZS5ob3N0ICYmICFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIHJlbFBhdGggPSAocmVsYXRpdmUucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJyk7XG4gICAgICB3aGlsZSAocmVsUGF0aC5sZW5ndGggJiYgIShyZWxhdGl2ZS5ob3N0ID0gcmVsUGF0aC5zaGlmdCgpKSk7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3QpIHJlbGF0aXZlLmhvc3QgPSAnJztcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdG5hbWUpIHJlbGF0aXZlLmhvc3RuYW1lID0gJyc7XG4gICAgICBpZiAocmVsUGF0aFswXSAhPT0gJycpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICBpZiAocmVsUGF0aC5sZW5ndGggPCAyKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsUGF0aC5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbGF0aXZlLnBhdGhuYW1lO1xuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHJlc3VsdC5ob3N0ID0gcmVsYXRpdmUuaG9zdCB8fCAnJztcbiAgICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGg7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdDtcbiAgICByZXN1bHQucG9ydCA9IHJlbGF0aXZlLnBvcnQ7XG4gICAgLy8gdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnBhdGhuYW1lIHx8IHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHZhciBwID0gcmVzdWx0LnBhdGhuYW1lIHx8ICcnO1xuICAgICAgdmFyIHMgPSByZXN1bHQuc2VhcmNoIHx8ICcnO1xuICAgICAgcmVzdWx0LnBhdGggPSBwICsgcztcbiAgICB9XG4gICAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgaXNTb3VyY2VBYnMgPSAocmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyksXG4gICAgICBpc1JlbEFicyA9IChcbiAgICAgICAgICByZWxhdGl2ZS5ob3N0IHx8XG4gICAgICAgICAgcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLydcbiAgICAgICksXG4gICAgICBtdXN0RW5kQWJzID0gKGlzUmVsQWJzIHx8IGlzU291cmNlQWJzIHx8XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuaG9zdCAmJiByZWxhdGl2ZS5wYXRobmFtZSkpLFxuICAgICAgcmVtb3ZlQWxsRG90cyA9IG11c3RFbmRBYnMsXG4gICAgICBzcmNQYXRoID0gcmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcmVsUGF0aCA9IHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICBwc3ljaG90aWMgPSByZXN1bHQucHJvdG9jb2wgJiYgIXNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdO1xuXG4gIC8vIGlmIHRoZSB1cmwgaXMgYSBub24tc2xhc2hlZCB1cmwsIHRoZW4gcmVsYXRpdmVcbiAgLy8gbGlua3MgbGlrZSAuLi8uLiBzaG91bGQgYmUgYWJsZVxuICAvLyB0byBjcmF3bCB1cCB0byB0aGUgaG9zdG5hbWUsIGFzIHdlbGwuICBUaGlzIGlzIHN0cmFuZ2UuXG4gIC8vIHJlc3VsdC5wcm90b2NvbCBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBub3cuXG4gIC8vIExhdGVyIG9uLCBwdXQgdGhlIGZpcnN0IHBhdGggcGFydCBpbnRvIHRoZSBob3N0IGZpZWxkLlxuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gJyc7XG4gICAgcmVzdWx0LnBvcnQgPSBudWxsO1xuICAgIGlmIChyZXN1bHQuaG9zdCkge1xuICAgICAgaWYgKHNyY1BhdGhbMF0gPT09ICcnKSBzcmNQYXRoWzBdID0gcmVzdWx0Lmhvc3Q7XG4gICAgICBlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7XG4gICAgfVxuICAgIHJlc3VsdC5ob3N0ID0gJyc7XG4gICAgaWYgKHJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZS5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZS5wb3J0ID0gbnVsbDtcbiAgICAgIGlmIChyZWxhdGl2ZS5ob3N0KSB7XG4gICAgICAgIGlmIChyZWxQYXRoWzBdID09PSAnJykgcmVsUGF0aFswXSA9IHJlbGF0aXZlLmhvc3Q7XG4gICAgICAgIGVsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO1xuICAgICAgfVxuICAgICAgcmVsYXRpdmUuaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzICYmIChyZWxQYXRoWzBdID09PSAnJyB8fCBzcmNQYXRoWzBdID09PSAnJyk7XG4gIH1cblxuICBpZiAoaXNSZWxBYnMpIHtcbiAgICAvLyBpdCdzIGFic29sdXRlLlxuICAgIHJlc3VsdC5ob3N0ID0gKHJlbGF0aXZlLmhvc3QgfHwgcmVsYXRpdmUuaG9zdCA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3QgOiByZXN1bHQuaG9zdDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAocmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdG5hbWUgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgOiByZXN1bHQuaG9zdG5hbWU7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICBzcmNQYXRoID0gcmVsUGF0aDtcbiAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRvdC1oYW5kbGluZyBiZWxvdy5cbiAgfSBlbHNlIGlmIChyZWxQYXRoLmxlbmd0aCkge1xuICAgIC8vIGl0J3MgcmVsYXRpdmVcbiAgICAvLyB0aHJvdyBhd2F5IHRoZSBleGlzdGluZyBmaWxlLCBhbmQgdGFrZSB0aGUgbmV3IHBhdGggaW5zdGVhZC5cbiAgICBpZiAoIXNyY1BhdGgpIHNyY1BhdGggPSBbXTtcbiAgICBzcmNQYXRoLnBvcCgpO1xuICAgIHNyY1BhdGggPSBzcmNQYXRoLmNvbmNhdChyZWxQYXRoKTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKHJlbGF0aXZlLnNlYXJjaCkpIHtcbiAgICAvLyBqdXN0IHB1bGwgb3V0IHRoZSBzZWFyY2guXG4gICAgLy8gbGlrZSBocmVmPSc/Zm9vJy5cbiAgICAvLyBQdXQgdGhpcyBhZnRlciB0aGUgb3RoZXIgdHdvIGNhc2VzIGJlY2F1c2UgaXQgc2ltcGxpZmllcyB0aGUgYm9vbGVhbnNcbiAgICBpZiAocHN5Y2hvdGljKSB7XG4gICAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IHNyY1BhdGguc2hpZnQoKTtcbiAgICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIC8vIG5vIHBhdGggYXQgYWxsLiAgZWFzeS5cbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgdGhlIG90aGVyIHN0dWZmIGFib3ZlLlxuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQuc2VhcmNoKSB7XG4gICAgICByZXN1bHQucGF0aCA9ICcvJyArIHJlc3VsdC5zZWFyY2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGlmIGEgdXJsIEVORHMgaW4gLiBvciAuLiwgdGhlbiBpdCBtdXN0IGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICAvLyBob3dldmVyLCBpZiBpdCBlbmRzIGluIGFueXRoaW5nIGVsc2Ugbm9uLXNsYXNoeSxcbiAgLy8gdGhlbiBpdCBtdXN0IE5PVCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgdmFyIGxhc3QgPSBzcmNQYXRoLnNsaWNlKC0xKVswXTtcbiAgdmFyIGhhc1RyYWlsaW5nU2xhc2ggPSAoXG4gICAgICAocmVzdWx0Lmhvc3QgfHwgcmVsYXRpdmUuaG9zdCB8fCBzcmNQYXRoLmxlbmd0aCA+IDEpICYmXG4gICAgICAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHx8IGxhc3QgPT09ICcnKTtcblxuICAvLyBzdHJpcCBzaW5nbGUgZG90cywgcmVzb2x2ZSBkb3VibGUgZG90cyB0byBwYXJlbnQgZGlyXG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBzcmNQYXRoLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICBsYXN0ID0gc3JjUGF0aFtpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoIW11c3RFbmRBYnMgJiYgIXJlbW92ZUFsbERvdHMpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHNyY1BhdGgudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICBpZiAobXVzdEVuZEFicyAmJiBzcmNQYXRoWzBdICE9PSAnJyAmJlxuICAgICAgKCFzcmNQYXRoWzBdIHx8IHNyY1BhdGhbMF0uY2hhckF0KDApICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NsYXNoICYmIChzcmNQYXRoLmpvaW4oJy8nKS5zdWJzdHIoLTEpICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBpc0Fic29sdXRlID0gc3JjUGF0aFswXSA9PT0gJycgfHxcbiAgICAgIChzcmNQYXRoWzBdICYmIHNyY1BhdGhbMF0uY2hhckF0KDApID09PSAnLycpO1xuXG4gIC8vIHB1dCB0aGUgaG9zdCBiYWNrXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IGlzQWJzb2x1dGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNQYXRoLmxlbmd0aCA/IHNyY1BhdGguc2hpZnQoKSA6ICcnO1xuICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgfHwgKHJlc3VsdC5ob3N0ICYmIHNyY1BhdGgubGVuZ3RoKTtcblxuICBpZiAobXVzdEVuZEFicyAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gc3JjUGF0aC5qb2luKCcvJyk7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgcmVxdWVzdC5odHRwXG4gIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICB9XG4gIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aCB8fCByZXN1bHQuYXV0aDtcbiAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblVybC5wcm90b3R5cGUucGFyc2VIb3N0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBob3N0ID0gdGhpcy5ob3N0O1xuICB2YXIgcG9ydCA9IHBvcnRQYXR0ZXJuLmV4ZWMoaG9zdCk7XG4gIGlmIChwb3J0KSB7XG4gICAgcG9ydCA9IHBvcnRbMF07XG4gICAgaWYgKHBvcnQgIT09ICc6Jykge1xuICAgICAgdGhpcy5wb3J0ID0gcG9ydC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGhvc3QgPSBob3N0LnN1YnN0cigwLCBob3N0Lmxlbmd0aCAtIHBvcnQubGVuZ3RoKTtcbiAgfVxuICBpZiAoaG9zdCkgdGhpcy5ob3N0bmFtZSA9IGhvc3Q7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdHJpbmc6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ3N0cmluZyc7XG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09PSBudWxsO1xuICB9LFxuICBpc051bGxPclVuZGVmaW5lZDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PSBudWxsO1xuICB9XG59O1xuIiwiaW1wb3J0IEdyYXBoIGZyb20gXCIuLi91dGlscy9ncmFwaFwiXHJcbmltcG9ydCBVcmwgZnJvbSBcInVybFwiXHJcbmltcG9ydCB7IGdldFNldHRpbmdzLCBnZXRBbnN3ZXIsIHNldEFuc3dlciwgc2V0Q29tcGxldGUgfSBmcm9tIFwiLi4vdXRpbHMvbWVzc2FnZVwiXHJcblxyXG5jb25zdCBMQVBTRV9SQVRFID0gLTkuOFxyXG5cclxuY3JlYXRlanMuTW90aW9uR3VpZGVQbHVnaW4uaW5zdGFsbCgpXHJcbmNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyUGx1Z2lucyhbY3JlYXRlanMuV2ViQXVkaW9QbHVnaW4sIGNyZWF0ZWpzLkhUTUxBdWRpb1BsdWdpbiwgY3JlYXRlanMuRmxhc2hBdWRpb1BsdWdpbl0pXHJcbmNyZWF0ZWpzLlRpY2tlci5mcmFtZVJhdGUgPSAxMFxyXG5mdW5jdGlvbiBnZXRFbChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIH1cclxuZnVuY3Rpb24gdGV0ZW4oVCxhLGIpIHsgcmV0dXJuIDYuMTA3OCpNYXRoLmV4cChhKlQvKFQrMjczLjE2LWIpKSB9XHJcbmZ1bmN0aW9uIHNhdHVyYXRpb24odGVtcCkgeyByZXR1cm4gdGV0ZW4odGVtcCwxNy4yNjksMzUuODYpIH1cclxuZnVuY3Rpb24gaWNlc2F0dXJhdGlvbih0ZW1wKSB7IHJldHVybiB0ZXRlbih0ZW1wLDIxLjg3NCw3LjY2KSB9XHJcbmZ1bmN0aW9uIGRld3BvaW50KHZhcG9yKSB7IHJldHVybiAyMzU0LjAvKDkuNDA0MS1NYXRoLmxvZzEwKHZhcG9yKSktMjczLjAgfVxyXG5mdW5jdGlvbiBwcmVzc3VyZShhbHQpIHsgcmV0dXJuIDEwMDAtMTI1KmFsdCB9XHJcblxyXG5mdW5jdGlvbiBnZXRDb2wodmFsKSB7XHJcblx0bGV0IHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpXHJcblx0dGQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsKSlcclxuXHRyZXR1cm4gdGRcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGVsZXRlKHJvdykge1xyXG5cdGxldCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKVxyXG5cdGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpXHJcblx0aW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLFwiYXNzZXRzL2RlbGV0ZS5qcGdcIilcclxuXHRpbWcuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixcImRlbGV0ZV9pbWdcIilcclxuXHRpbWcuc2V0QXR0cmlidXRlKFwiYWx0XCIsXCJEZWxldGUgcm93XCIpXHJcblx0aW1nLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsXCJEZWxldGUgcm93XCIpXHJcblx0aW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB7XHJcblx0XHRpZiAoY29uZmlybShcIkRlbGV0ZSByb3c/XCIpKSB7XHJcblx0XHRcdC8vIDx0cj48dGQ+PGltZy4uLlxyXG5cdFx0XHRsZXQgbm9kZSA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGVcclxuXHRcdFx0bXRuc2ltLm10bi5kZWxldGVUcmlhbChBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKG5vZGUucGFyZW50Tm9kZS5jaGlsZE5vZGVzLG5vZGUpLTQpXHJcblx0XHR9XHJcblx0fSlcclxuXHR0ZC5hcHBlbmRDaGlsZChpbWcpXHJcblx0cmV0dXJuIHRkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFJvdyhqc29uLHJvdykge1xyXG5cdGxldCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKVxyXG5cdHRyLmFwcGVuZENoaWxkKGdldENvbChqc29uLnN0YXJ0LnRlbXAudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24uc3RhcnQudmFwb3IudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24uc3RhcnQuZGV3cG9pbnQudG9GaXhlZCgxKSkpXHJcblx0dHIuYXBwZW5kQ2hpbGQoZ2V0Q29sKGpzb24udGVtcC50b0ZpeGVkKDEpKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi52YXBvci50b0ZpeGVkKDEpKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi5kZXdwb2ludC50b0ZpeGVkKDEpKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXRDb2woanNvbi5jbG91ZGJhc2UgPiAwP2pzb24uY2xvdWRiYXNlLnRvRml4ZWQoMSk6XCJDbGVhclwiKSlcclxuXHR0ci5hcHBlbmRDaGlsZChnZXREZWxldGUocm93KSlcclxuXHRyZXR1cm4gdHJcclxufVxyXG5cclxuY2xhc3MgVHJpYWwge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5zdGFydCA9IG51bGxcclxuICAgIHRoaXMuY2xvdWRiYXNlID0gMFxyXG4gICAgdGhpcy50ZW1wID0gMFxyXG4gICAgdGhpcy5hbHRpdHVkZSA9IDBcclxuICAgIHRoaXMudmFwb3IgPSAwXHJcbiAgICB0aGlzLmRld3BvaW50ID0gMFxyXG4gICAgdGhpcy5sYXBzZSA9IDBcclxuXHR9XHJcblxyXG5cdHRvSlNPTigpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHN0YXJ0OiB0aGlzLnN0YXJ0LFxyXG5cdCAgICBjbG91ZGJhc2U6IHRoaXMuY2xvdWRiYXNlLFxyXG5cdCAgICB0ZW1wOiB0aGlzLnRlbXAsXHJcblx0ICAgIGFsdGl0dWRlOiB0aGlzLmFsdGl0dWRlLFxyXG5cdCAgICB2YXBvcjogdGhpcy52YXBvcixcclxuXHQgICAgZGV3cG9pbnQ6IHRoaXMuZGV3cG9pbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGluaXQoc3RhcnQpIHtcclxuXHRcdHRoaXMuc3RhcnQgPSBzdGFydFxyXG4gICAgdGhpcy5jbG91ZGJhc2UgPSAwXHJcbiAgICB0aGlzLnRlbXAgPSBzdGFydC50ZW1wXHJcbiAgICB0aGlzLmFsdGl0dWRlID0gMFxyXG4gICAgdGhpcy52YXBvciA9IHN0YXJ0LnZhcG9yXHJcbiAgICB0aGlzLmRld3BvaW50ID0gc3RhcnQuZGV3cG9pbnRcclxuICAgIHRoaXMubGFwc2UgPSBMQVBTRV9SQVRFXHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBSZWFkb3V0IHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuYWx0aXR1ZGUgPSBnZXRFbChcImFsdGl0dWRlcmVhZG91dFwiKVxyXG5cdFx0dGhpcy50ZW1wID0gZ2V0RWwoXCJ0ZW1wcmVhZG91dFwiKVxyXG5cdFx0dGhpcy52YXBvciA9IGdldEVsKFwidmFwb3JyZWFkb3V0XCIpXHJcblx0XHR0aGlzLmRld3BvaW50ID0gZ2V0RWwoXCJkZXdwb2ludHJlYWRvdXRcIilcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSh0cmlhbCkge1xyXG5cdFx0dGhpcy5hbHRpdHVkZS52YWx1ZSA9IHRyaWFsLmFsdGl0dWRlLnRvRml4ZWQoMSlcclxuXHRcdHRoaXMudGVtcC52YWx1ZSA9IHRyaWFsLnRlbXAudG9GaXhlZCgxKVxyXG5cdFx0dGhpcy52YXBvci52YWx1ZSA9IHRyaWFsLnZhcG9yLnRvRml4ZWQoMSlcclxuXHRcdC8vdGhpcy5kZXdwb2ludC52YWx1ZSA9IHRyaWFsLmRld3BvaW50LnRvRml4ZWQoMSlcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFNldHRpbmdzIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMucmVhZG91dCA9IG5ldyBSZWFkb3V0KClcclxuXHRcdHRoaXMudGVtcCA9IGdldEVsKFwidGVtcFwiKVxyXG5cdFx0dGhpcy52YXBvciA9IGdldEVsKFwidmFwb3JcIilcclxuXHRcdHRoaXMuZGV3cG9pbnQgPSBnZXRFbChcImRld3BvaW50XCIpXHJcblx0XHR0aGlzLnRlbXBvdXQgPSBnZXRFbChcInRlbXBvdXRcIilcclxuXHRcdHRoaXMudmFwb3JvdXQgPSBnZXRFbChcInZhcG9yb3V0XCIpXHJcblx0XHR0aGlzLmRld3BvaW50b3V0ID0gZ2V0RWwoXCJkZXdwb2ludG91dFwiKVxyXG5cdFx0dGhpcy5tdXRlID0gZ2V0RWwoXCJtdXRlXCIpXHJcblx0XHR0aGlzLmxpc3RlbmVyID0gbnVsbFxyXG5cdFx0ZnVuY3Rpb24gc2xpZGVmKGUsaW5wdXQsIG91dCwgZikge1xyXG5cdCAgICBcdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHQgICAgXHRvdXQudmFsdWUgPSBpbnB1dC52YWx1ZUFzTnVtYmVyXHJcblx0ICAgIFx0aWYgKGYpIGYoaW5wdXQpXHJcblx0XHR9XHJcblx0XHQvLyBJRSBkb2Vzbid0IGhhdmUgYW4gaW5wdXQgZXZlbnQgYnV0IGEgY2hhbmdlIGV2ZW50XHJcblx0XHRsZXQgZXZlbnQgPSAvbXNpZXx0cmlkZW50L2cudGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKT9cImNoYW5nZVwiOlwiaW5wdXRcIlxyXG5cdFx0dGhpcy50ZW1wLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGUgPT4gc2xpZGVmKGUsdGhpcy50ZW1wLHRoaXMudGVtcG91dCx0aGlzLmxpc3RlbmVyKSlcclxuXHRcdHRoaXMudmFwb3IuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZSA9PiBzbGlkZWYoZSx0aGlzLnZhcG9yLHRoaXMudmFwb3JvdXQsdGhpcy5saXN0ZW5lcikpXHJcblx0XHQvL3RoaXMuZGV3cG9pbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZSA9PiBzbGlkZWYoZSx0aGlzLmRld3BvaW50LHRoaXMuZGV3cG9pbnRvdXQsdGhpcy5saXN0ZW5lcikpXHJcblx0fVxyXG5cclxuXHRnZXRUZW1wKCkgeyByZXR1cm4gdGhpcy50ZW1wLnZhbHVlQXNOdW1iZXIgfVxyXG5cclxuXHRnZXRWYXBvcigpIHsgcmV0dXJuIHRoaXMudmFwb3IudmFsdWVBc051bWJlciB9XHJcblxyXG5cdGdldERld3BvaW50KCkgeyByZXR1cm4gdGhpcy5kZXdwb2ludC52YWx1ZUFzTnVtYmVyIH1cclxuXHJcblx0c2V0VGVtcCh2YWx1ZSkge1xyXG5cdFx0dGhpcy50ZW1wLnZhbHVlID0gdmFsdWVcclxuXHRcdHRoaXMudGVtcG91dC52YWx1ZSA9IHZhbHVlLnRvRml4ZWQoMSlcclxuXHRcdHRoaXMucmVhZG91dC50ZW1wLnZhbHVlID0gdGhpcy50ZW1wb3V0LnZhbHVlXHJcblx0fVxyXG5cclxuXHRzZXRWYXBvcih2YWx1ZSkge1xyXG5cdFx0dGhpcy52YXBvci52YWx1ZSA9IHZhbHVlXHJcblx0XHR0aGlzLnZhcG9yb3V0LnZhbHVlID0gdmFsdWUudG9GaXhlZCgxKVxyXG5cdFx0dGhpcy5yZWFkb3V0LnZhcG9yLnZhbHVlID0gdGhpcy52YXBvcm91dC52YWx1ZVxyXG5cdFx0dGhpcy5zZXREZXdwb2ludChkZXdwb2ludCh2YWx1ZSkpXHJcblx0fVxyXG5cclxuXHRzZXREZXdwb2ludCh2YWx1ZSkge1xyXG5cdFx0dGhpcy5kZXdwb2ludC52YWx1ZSA9IHZhbHVlXHJcblx0XHR0aGlzLmRld3BvaW50b3V0LnZhbHVlID0gdmFsdWUudG9GaXhlZCgxKVxyXG5cdFx0dGhpcy5yZWFkb3V0LmRld3BvaW50LnZhbHVlID0gdGhpcy5kZXdwb2ludG91dC52YWx1ZVxyXG5cdH1cclxuXHJcblx0dXBkYXRlUmVhZG91dCh0cmlhbCkge1xyXG5cdFx0dGhpcy5yZWFkb3V0LnVwZGF0ZSh0cmlhbClcclxuXHR9XHJcblxyXG5cdGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7IHRoaXMubGlzdGVuZXIgPSBsaXN0ZW5lciB9XHJcbn1cclxuXHJcbmNsYXNzIEJ1dHRvbnMge1xyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5ydW4gPSBnZXRFbChcInJ1blwiKVxyXG5cdFx0dGhpcy5wYXVzZSA9IGdldEVsKFwicGF1c2VcIilcclxuXHRcdHRoaXMucmVzdGFydCA9IGdldEVsKFwicmVzdGFydFwiKVxyXG5cdFx0dGhpcy5tdXRlID0gZ2V0RWwoXCJtdXRlXCIpXHJcblx0fVxyXG5cclxuXHRhZGRMaXN0ZW5lcihsaXN0ZW5lcikge1xyXG5cdFx0dGhpcy5ydW4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gbGlzdGVuZXIoZSkpXHJcblx0XHR0aGlzLnBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IGxpc3RlbmVyKGUpKVxyXG5cdFx0dGhpcy5yZXN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IGxpc3RlbmVyKGUpKVxyXG5cdH1cclxuXHJcblx0bXV0ZSgpIHsgcmV0dXJuIHRoaXMubXV0ZS5jaGVja2VkIH1cclxufVxyXG5cclxuY2xhc3MgRVRHcmFwaCBleHRlbmRzIEdyYXBoIHtcclxuXHRjb25zdHJ1Y3RvcihzdGFnZSwgc2V0dGluZ3MpIHtcclxuXHRcdHN1cGVyKHtcclxuXHRcdFx0c3RhZ2U6IHN0YWdlLFxyXG5cdFx0XHR3OiAyMDAsXHJcblx0XHRcdGg6IDIwMCxcclxuXHRcdFx0eGxhYmVsOiBcIlRlbXBlcmF0dXJlKEMpXCIsXHJcblx0XHRcdHlsYWJlbDogXCJWYXBvciBQcmVzc3VyZShtYilcIixcclxuXHRcdFx0eHNjYWxlOiBcImxpbmVhclwiLFxyXG5cdFx0XHR5c2NhbGU6IFwibGluZWFyXCIsXHJcblx0XHRcdG1pblg6IC0yMCxcclxuXHRcdFx0bWF4WDogMzAsXHJcblx0XHRcdG1pblk6IDAsXHJcblx0XHRcdG1heFk6IDUwLFxyXG5cdFx0XHRtYWpvclg6IDEwLFxyXG5cdFx0XHRtaW5vclg6IDUsXHJcblx0XHRcdG1ham9yWTogMTAsXHJcblx0XHRcdG1pbm9yWTogNVxyXG5cdFx0fSlcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5nc1xyXG5cdFx0dGhpcy5sYXN0aCA9IDBcclxuXHRcdHRoaXMubGVhZiA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJhc3NldHMvbGVhZi5naWZcIilcclxuXHRcdHRoaXMubWFya2VyID0gbmV3IGNyZWF0ZWpzLlNoYXBlKClcclxuXHRcdHRoaXMubWFya2VyLmdyYXBoaWNzLmJlZ2luRmlsbChcIiMwMDBcIikuZHJhd1JlY3QodGhpcy54YXhpcy5nZXRMb2ModGhpcy50ZW1wKS0yLHRoaXMueWF4aXMuZ2V0TG9jKHRoaXMudmFwb3IpLTIsNCw0KVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQodGhpcy5sZWFmKVxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQodGhpcy5tYXJrZXIpXHJcblx0XHR0aGlzLnNldHRpbmdzLmFkZExpc3RlbmVyKHNsaWRlciA9PiB7XHJcbiAgICAgIGlmIChzbGlkZXIuaWQgPT0gXCJ0ZW1wXCIpIHtcclxuICAgICAgICAgIHRoaXMudGVtcCA9IHNsaWRlci52YWx1ZUFzTnVtYmVyXHJcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnNldFRlbXAoc2xpZGVyLnZhbHVlQXNOdW1iZXIpXHJcbiAgICAgIH0gZWxzZSBpZiAoc2xpZGVyLmlkID09IFwidmFwb3JcIikge1xyXG4gICAgICAgICAgdGhpcy52YXBvciA9IHNsaWRlci52YWx1ZUFzTnVtYmVyXHJcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnNldFZhcG9yKHRoaXMudmFwb3IpXHJcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnNldERld3BvaW50KGRld3BvaW50KHRoaXMudmFwb3IpKVxyXG4gICAgICB9IGVsc2UgaWYgKHNsaWRlci5pZCA9PSBcImRld3BvaW50XCIpIHtcclxuICAgICAgICAgIHRoaXMuZGV3cG9pbnQgPSBzbGlkZXIudmFsdWVBc051bWJlclxyXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5zZXREZXdwb2ludCh0aGlzLmRld3BvaW50KVxyXG4gICAgICAgICAgdGhpcy52YXBvciA9IHZhcG9yKHRoaXMuZGV3cG9pbnQpXHJcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnNldFZhcG9yKHRoaXMudmFwb3IpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tb3ZlTWFya2VyKHRydWUpXHJcblx0XHR9KVxyXG5cdFx0dGhpcy5pY2VncmFwaCA9IG5ldyBJY2VHcmFwaChzdGFnZSlcclxuXHR9XHJcblxyXG5cdHJlbmRlcigpIHtcclxuXHRcdHRoaXMudGVtcCA9IHRoaXMuc2V0dGluZ3MuZ2V0VGVtcCgpXHJcblx0XHR0aGlzLnZhcG9yID0gdGhpcy5zZXR0aW5ncy5nZXRWYXBvcigpXHJcblx0XHRzdXBlci5yZW5kZXIoKVxyXG5cdFx0dGhpcy5wbG90U2F0dXJhdGlvbigpXHJcblx0XHR0aGlzLmljZWdyYXBoLnJlbmRlcigpXHJcblx0XHR0aGlzLm1vdmVNYXJrZXIodHJ1ZSlcclxuXHR9XHJcblxyXG5cdHBsb3RTYXR1cmF0aW9uKCkge1xyXG4gICAgZm9yIChsZXQgdCA9IHRoaXMueGF4aXMubWluOyB0IDwgMDsgdCsrKSB0aGlzLnBsb3QodCxpY2VzYXR1cmF0aW9uKHQpKVxyXG4gICAgZm9yIChsZXQgdCA9IDA7IHQgPD0gdGhpcy54YXhpcy5tYXg7IHQrKykgdGhpcy5wbG90KHQsc2F0dXJhdGlvbih0KSlcclxuICAgIHRoaXMuZW5kUGxvdCgpXHJcblx0fVxyXG5cclxuXHRjbGVhcigpIHtcclxuXHRcdHN1cGVyLmNsZWFyKClcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5sZWFmKVxyXG5cdH1cclxuXHJcblx0bW92ZUxlYWYoeCx5KSB7XHJcblx0XHR0aGlzLmxlYWYueCA9IHgtMTBcclxuXHRcdHRoaXMubGVhZi55ID0geS0xMFxyXG5cdH1cclxuXHJcblx0c2hvd0xlYWYoKSB7XHJcbiAgIGxldCB4ID0gdGhpcy54YXhpcy5nZXRMb2ModGhpcy50ZW1wKVxyXG4gICBsZXQgeSA9IHRoaXMueWF4aXMuZ2V0TG9jKHRoaXMudmFwb3IpXHJcbiAgIHRoaXMubW92ZUxlYWYoeCx5KVxyXG5cdH1cclxuXHJcbiAgbW92ZU1hcmtlcih1cGRhdGVTZXR0aW5ncykge1xyXG4gICAgbGV0IHNhdCA9IHNhdHVyYXRpb24odGhpcy50ZW1wKVxyXG4gICAgaWYgKHRoaXMudmFwb3IgPiBzYXQpIHtcclxuICAgIFx0dGhpcy52YXBvciA9IHNhdFxyXG4gICAgXHRpZiAodXBkYXRlU2V0dGluZ3MgPT09IHRydWUpIHtcclxuICAgIFx0XHR0aGlzLnNldHRpbmdzLnNldFRlbXAodGhpcy50ZW1wKVxyXG4gICAgXHRcdHRoaXMuc2V0dGluZ3Muc2V0VmFwb3Ioc2F0KVxyXG4gICAgXHRcdHRoaXMuc2V0dGluZ3Muc2V0RGV3cG9pbnQoZGV3cG9pbnQoc2F0KSlcclxuICAgIFx0fVxyXG4gICAgfVxyXG4gICAgbGV0IHggPSB0aGlzLnhheGlzLmdldExvYyh0aGlzLnRlbXApXHJcbiAgICBsZXQgeSA9IHRoaXMueWF4aXMuZ2V0TG9jKHRoaXMudmFwb3IpXHJcbiAgICB0aGlzLm1hcmtlci54ID0geCAtIDJcclxuICAgIHRoaXMubWFya2VyLnkgPSB5IC0gMlxyXG4gICAgaWYgKHVwZGF0ZVNldHRpbmdzID09PSB0cnVlKSB0aGlzLm1vdmVMZWFmKHgseSlcclxuICB9XHJcblxyXG5cdHVwZGF0ZSh0cmlhbCkge1xyXG5cdFx0dGhpcy50ZW1wID0gdHJpYWwudGVtcFxyXG5cdFx0dGhpcy52YXBvciA9IHRyaWFsLnZhcG9yXHJcblx0XHR0aGlzLnBsb3QodHJpYWwudGVtcCx0cmlhbC52YXBvcilcclxuXHRcdHRoaXMubW92ZU1hcmtlcihmYWxzZSlcclxuXHRcdHRoaXMuc2hvd0xlYWYoKVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgQVRHcmFwaCBleHRlbmRzIEdyYXBoIHtcclxuXHRjb25zdHJ1Y3RvcihzdGFnZSkge1xyXG5cdFx0c3VwZXIoe1xyXG5cdFx0XHRzdGFnZTogc3RhZ2UsXHJcblx0XHRcdHc6IDIwMCxcclxuXHRcdFx0aDogMjAwLFxyXG5cdFx0XHR4bGFiZWw6IFwiVGVtcGVyYXR1cmUoQylcIixcclxuXHRcdFx0eWxhYmVsOiBcIkFsdGl0dWRlKGttKVwiLFxyXG5cdFx0XHR4c2NhbGU6IFwibGluZWFyXCIsXHJcblx0XHRcdHlzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0bWluWDogLTIwLFxyXG5cdFx0XHRtYXhYOiAzMCxcclxuXHRcdFx0bWluWTogMCxcclxuXHRcdFx0bWF4WTogNCxcclxuXHRcdFx0bWFqb3JYOiAxMCxcclxuXHRcdFx0bWlub3JYOiA1LFxyXG5cdFx0XHRtYWpvclk6IDEsXHJcblx0XHRcdG1pbm9yWTogMC41XHJcblx0XHR9KVxyXG5cdFx0dGhpcy50ZW1wID0gMjBcclxuXHRcdHRoaXMuYWx0aXR1ZGUgPSAwXHJcblx0XHR0aGlzLmNsb3VkYmFzZSA9IDBcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSh0cmlhbCkge1xyXG5cdFx0dGhpcy5wbG90KHRyaWFsLnRlbXAsdHJpYWwuYWx0aXR1ZGUpXHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBJY2VHcmFwaCBleHRlbmRzIEdyYXBoIHtcclxuXHRjb25zdHJ1Y3RvcihzdGFnZSkge1xyXG5cdFx0c3VwZXIoe1xyXG5cdFx0XHRzdGFnZTogc3RhZ2UsXHJcblx0XHRcdHg6IDYwLFxyXG5cdFx0XHR5OiAxMTAsXHJcblx0XHRcdHc6IDc1LFxyXG5cdFx0XHRoOiAxMDAsXHJcblx0XHRcdHhsYWJlbDogXCJDXCIsXHJcblx0XHRcdHhzY2FsZTogXCJsaW5lYXJcIixcclxuXHRcdFx0eXNjYWxlOiBcImxpbmVhclwiLFxyXG5cdFx0XHRtaW5YOiAtMTUsXHJcblx0XHRcdG1heFg6IDEsXHJcblx0XHRcdG1pblk6IDEsXHJcblx0XHRcdG1heFk6IDUsXHJcblx0XHRcdG1ham9yWDogNSxcclxuXHRcdFx0bWFqb3JZOiAxLFxyXG5cdFx0XHRiYWNrZ3JvdW5kOiBcIiNFRUVcIlxyXG5cdFx0fSlcclxuXHRcdGxldCBsaXF1aWQgPSBuZXcgY3JlYXRlanMuVGV4dChcIkxpcXVpZFwiLFwiMTBweCBBcmlhbFwiLFwiIzAwMFwiKVxyXG5cdFx0bGlxdWlkLnggPSA2NVxyXG5cdFx0bGlxdWlkLnkgPSA0MFxyXG5cdFx0c3RhZ2UuYWRkQ2hpbGQobGlxdWlkKVxyXG5cdFx0bGV0IGljZSA9IG5ldyBjcmVhdGVqcy5UZXh0KFwiSWNlXCIsXCIxMHB4IEFyaWFsXCIsXCIjMDAwXCIpXHJcblx0XHRpY2UueCA9IDkwXHJcblx0XHRpY2UueSA9IDcwXHJcblx0XHRzdGFnZS5hZGRDaGlsZChpY2UpXHJcblx0fVxyXG5cclxuXHRyZW5kZXIoKSB7XHJcblx0XHRzdXBlci5yZW5kZXIoKVxyXG4gICAgZm9yIChsZXQgdCA9IHRoaXMueGF4aXMubWluOyB0IDw9IHRoaXMueGF4aXMubWF4OyB0KyspIHRoaXMucGxvdCh0LHNhdHVyYXRpb24odCkpXHJcbiAgICB0aGlzLmVuZFBsb3QoKVxyXG4gICAgZm9yIChsZXQgdCA9IHRoaXMueGF4aXMubWluOyB0IDw9IHRoaXMueGF4aXMubWF4OyB0KyspIHRoaXMucGxvdCh0LGljZXNhdHVyYXRpb24odCkpXHJcbiAgICB0aGlzLmVuZFBsb3QoKVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgTXRuIHtcclxuXHRjb25zdHJ1Y3RvcihzdGFnZSwgc2V0dGluZ3MsIGZpbmlzaCkge1xyXG5cdFx0dGhpcy5zdGFnZSA9IHN0YWdlXHJcblx0XHR0aGlzLnNldHRpbmdzID0gc2V0dGluZ3NcclxuXHRcdHRoaXMuZmluaXNoID0gZmluaXNoXHJcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKHtpZDogXCJ0aHVuZGVyXCIsIHNyYzpcImFzc2V0cy90aHVuZGVyLm1wM1wifSlcclxuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoe2lkOiBcIndpbmRcIiwgc3JjOlwiYXNzZXRzL3dpbmQubXAzXCJ9KVxyXG5cdFx0dGhpcy53aW5kID0gbnVsbFxyXG5cdFx0dGhpcy50aHVuZGVyID0gbnVsbFxyXG5cdFx0dGhpcy5tdG4gPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiYXNzZXRzL21vdW50YWluLnBuZ1wiKVxyXG5cdFx0dGhpcy5sZWFmID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImFzc2V0cy9sZWFmLmdpZlwiKVxyXG5cdFx0dGhpcy5jbG91ZCA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJhc3NldHMvdGh1bmRlcmNsb3VkLnBuZ1wiKVxyXG5cdFx0dGhpcy5ib2x0ID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImFzc2V0cy9saWdodG5pbmcucG5nXCIpXHJcblx0XHR0aGlzLmxlYWZ0d2VlbiA9IG51bGxcclxuXHRcdHRoaXMubXRuLnggPSAwXHJcblx0XHR0aGlzLm10bi55ID0gMFxyXG5cdFx0dGhpcy5tdG4uc2NhbGVYID0gMC41XHJcblx0XHR0aGlzLm10bi5zY2FsZVkgPSAwLjVcclxuXHRcdHRoaXMuYm9sdC54ID0gLTEwMFxyXG5cdFx0dGhpcy5ib2x0LnNjYWxlWCA9IDAuMDE1XHJcblx0XHR0aGlzLmJvbHQuc2NhbGVZID0gMC4wMTVcclxuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlXHJcblx0XHR0aGlzLmxpZ2h0bmluZyA9IGZhbHNlXHJcblx0XHR0aGlzLmxpZ2h0dGljayA9IDBcclxuXHRcdHRoaXMucGF0aCA9IFs1MCwxNjUsIDYwLDE1NSwgNzQsMTUyLCA4MCwxNDAsIDkwLDEzMSwgMTAwLDEyNSwgMTEyLDEyMiwgMTIwLDExMCwgMTM3LDkyLCAxNDAsNzUsIDE1MSw2NiwgMTUwLDY2LCAxNzMsNjYsIDE4NSw2NiwgMjA0LDcwLCAyMTAsODAsIDIyMSw5MiwgMjIxLDk1LCAyMjQsMTA1LCAyMzAsMTEwLCAyNDYsMTIxLCAyNTAsMTMwLCAyNjgsMTQxLCAyODAsMTY1LCAyOTAsMTY1XVxyXG5cdFx0dGhpcy5yZXN1bHRzID0gZ2V0RWwoXCJyZXN1bHRzX3RhYmxlXCIpXHJcblx0XHRnZXRFbChcImRlbGV0ZV9hbGxcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsZXZlbnQgPT4ge1xyXG5cdFx0XHRpZiAoY29uZmlybShcIkRlbGV0ZSBhbGwgZGF0YT9cIikpIHRoaXMuZGVsZXRlUmVzdWx0cygpXHJcblx0XHR9KVxyXG5cdFx0dGhpcy5yZXNldCgpXHJcblx0XHR0aGlzLnNob3dSZXN1bHRzKClcclxuXHR9XHJcblxyXG5cdHJlbmRlcigpIHtcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5tdG4pXHJcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMubGVhZilcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5jbG91ZClcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5ib2x0KVxyXG5cdFx0dGhpcy5sZWFmLnggPSA1MFxyXG5cdFx0dGhpcy5sZWFmLnkgPSAxNjVcclxuXHRcdHRoaXMuY2xvdWQueCA9IC0xMDAwXHJcblx0XHR0aGlzLmNsb3VkLnkgPSAwXHJcblx0XHR0aGlzLmxhc3RhbHQgPSAwXHJcblx0XHR0aGlzLmNsb3VkLnNjYWxlWCA9IDAuMVxyXG5cdFx0dGhpcy5jbG91ZC5zY2FsZVkgPSAwLjA1XHJcblx0fVxyXG5cclxuXHRjbGVhcigpIHtcclxuXHRcdHRoaXMuc3RhZ2UucmVtb3ZlQWxsQ2hpbGRyZW4oKVxyXG5cdFx0dGhpcy5yZW5kZXIoKVxyXG5cdH1cclxuXHJcblx0cGxheSgpIHtcclxuXHRcdHRoaXMucmVzZXQoKVxyXG5cdFx0dGhpcy5sZWFmdHdlZW4gPSBjcmVhdGVqcy5Ud2Vlbi5nZXQodGhpcy5sZWFmKS50byh7Z3VpZGU6e3BhdGg6dGhpcy5wYXRofX0sMTAwMDApXHJcblx0XHR0aGlzLmxlYWZ0d2Vlbi5jYWxsKCgpID0+IHtcclxuXHRcdFx0aWYgKHRoaXMud2luZCkgdGhpcy53aW5kLnN0b3AoKVxyXG5cdFx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZVxyXG5cdFx0XHR0aGlzLmFkZFRyaWFsKClcclxuXHRcdFx0aWYgKHRoaXMuZmluaXNoKSB0aGlzLmZpbmlzaCgpXHJcblx0XHR9KVxyXG5cdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZVxyXG5cdFx0dGhpcy5sZWFmdHdlZW4ucGxheSgpXHJcblx0XHR0aGlzLnBsYXlTb3VuZChcIndpbmRcIilcclxuXHR9XHJcblxyXG5cdHNob3dSZXN1bHRzKCkge1xyXG5cdFx0Zm9yIChsZXQgaSA9IHRoaXMucmVzdWx0cy5jaGlsZHJlbi5sZW5ndGgtMTsgaSA+IDEgOyBpLS0pIHRoaXMucmVzdWx0cy5yZW1vdmVDaGlsZCh0aGlzLnJlc3VsdHMuY2hpbGRyZW5baV0pXHJcblx0XHRsZXQgdHJpYWxzID0gZ2V0QW5zd2VyKClcclxuXHRcdHRyaWFscy5mb3JFYWNoKGpzb24gPT4gdGhpcy5yZXN1bHRzLmFwcGVuZENoaWxkKGdldFJvdyhqc29uKSkpXHJcblx0XHRzZXRBbnN3ZXIodHJpYWxzKVxyXG5cdH1cclxuXHJcblx0YWRkVHJpYWwoKSB7XHJcblx0XHRsZXQgdHJpYWxzID0gZ2V0QW5zd2VyKClcclxuXHRcdGxldCBqc29uID0gdGhpcy50cmlhbC50b0pTT04oKVxyXG5cdFx0c2V0QW5zd2VyKHRyaWFscy5jb25jYXQoanNvbikpXHJcblx0XHR0aGlzLnJlc3VsdHMuYXBwZW5kQ2hpbGQoZ2V0Um93KGpzb24pKVxyXG5cdH1cclxuXHJcblx0ZGVsZXRlVHJpYWwocm93KSB7XHJcblx0XHRsZXQgdHJpYWxzID0gZ2V0QW5zd2VyKClcclxuXHRcdHRyaWFscy5zcGxpY2Uocm93LDEpXHJcblx0XHRzZXRBbnN3ZXIodHJpYWxzKVxyXG5cdFx0dGhpcy5zaG93UmVzdWx0cygpXHJcblx0fVxyXG5cclxuXHRkZWxldGVSZXN1bHRzKCkge1xyXG5cdFx0c2V0QW5zd2VyKFtdKVxyXG5cdFx0dGhpcy5zaG93UmVzdWx0cygpXHJcblx0fVxyXG5cclxuXHRwYXVzZShwYXVzZSkge1xyXG5cdFx0dGhpcy5sZWFmdHdlZW4uc2V0UGF1c2VkKHBhdXNlKVxyXG5cdFx0aWYgKHRoaXMud2luZCkgdGhpcy53aW5kLnBhdXNlZCA9IHBhdXNlXHJcblx0XHRpZiAodGhpcy50aHVuZGVyKSB0aGlzLnRodW5kZXIucGF1c2VkID0gcGF1c2VcclxuXHRcdHRoaXMucnVubmluZyA9ICFwYXVzZVxyXG5cdH1cclxuXHJcblx0cGxheVNvdW5kKHNvdW5kKSB7XHJcblx0XHRpZiAoIXRoaXMuc2V0dGluZ3MubXV0ZS5jaGVja2VkKSB7XHJcblx0XHRcdHN3aXRjaChzb3VuZCkge1xyXG5cdFx0XHRjYXNlIFwid2luZFwiOlxyXG5cdFx0XHRcdHRoaXMud2luZCA9IGNyZWF0ZWpzLlNvdW5kLnBsYXkoc291bmQse2xvb3A6IDJ9KVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJ0aHVuZGVyXCI6XHJcblx0XHRcdFx0dGhpcy50aHVuZGVyID0gY3JlYXRlanMuU291bmQucGxheShzb3VuZClcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUodHJpYWwpIHtcclxuXHRcdGxldCBvbGRBID0gdHJpYWwuYWx0aXR1ZGUsIG9sZFQgPSB0cmlhbC50ZW1wXHJcblx0XHR0cmlhbC5hbHRpdHVkZSA9IDQqKDE2NSAtIHRoaXMubGVhZi55KS8xNjVcclxuXHRcdGlmICh0cmlhbC5hbHRpdHVkZSA8IDApIHRyaWFsLmFsdGl0dWRlID0gMFxyXG5cdFx0dHJpYWwudmFwb3IgKj0gcHJlc3N1cmUodHJpYWwuYWx0aXR1ZGUpL3ByZXNzdXJlKG9sZEEpXHJcblx0XHR0cmlhbC50ZW1wICs9IHRyaWFsLmxhcHNlICogKHRyaWFsLmFsdGl0dWRlIC0gb2xkQSlcclxuXHRcdHRyaWFsLmRld3BvaW50ID0gZGV3cG9pbnQodHJpYWwudmFwb3IpXHJcblx0XHRsZXQgc2F0ID0gc2F0dXJhdGlvbih0cmlhbC50ZW1wKVxyXG5cdFx0aWYgKHRyaWFsLnZhcG9yID4gc2F0KSB7XHJcblx0XHRcdHRoaXMuYW5pbWF0ZUNsb3VkcygpXHJcblx0XHRcdHRyaWFsLnZhcG9yID0gc2F0XHJcblx0XHRcdHRyaWFsLmxhcHNlID0gLTYuMFxyXG5cdFx0fVxyXG5cdFx0aWYgKHRyaWFsLnRlbXAgPiBvbGRUKSB0cmlhbC5sYXBzZSA9IExBUFNFX1JBVEVcclxuXHRcdHRoaXMuc2V0dGluZ3MudXBkYXRlUmVhZG91dCh0cmlhbClcclxuXHR9XHJcblxyXG5cdGFuaW1hdGVDbG91ZHMoKSB7XHJcblx0XHRpZiAodGhpcy50cmlhbC5jbG91ZGJhc2UgPT0gMCkge1xyXG5cdFx0XHR0aGlzLnRyaWFsLmNsb3VkYmFzZSA9IHRoaXMudHJpYWwuYWx0aXR1ZGVcclxuXHRcdFx0dGhpcy5jbG91ZC54ID0gdGhpcy5sZWFmLnggLSAyXHJcblx0XHRcdHRoaXMuY2xvdWQueSA9IHRoaXMubGVhZi55XHJcblx0XHRcdHRoaXMuYm9sdC55ID0gdGhpcy5jbG91ZC55ICsgMjBcclxuXHRcdFx0dGhpcy5sYXN0eSA9IHRoaXMubGVhZi55XHJcblx0XHR9XHJcblx0XHRpZiAoKHRoaXMudHJpYWwuYWx0aXR1ZGUgLSB0aGlzLmxhc3RhbHQpID4gLjEpIHtcclxuXHRcdFx0dGhpcy5sYXN0YWx0ID0gdGhpcy50cmlhbC5hbHRpdHVkZVxyXG5cdFx0XHR0aGlzLmNsb3VkLnNjYWxlWCArPSAuMDIxXHJcblx0XHRcdHRoaXMuY2xvdWQuc2NhbGVZICs9IC4wMlxyXG5cdFx0XHR0aGlzLmNsb3VkLnkgPSB0aGlzLmxlYWYueVxyXG5cdFx0fVxyXG5cdFx0aWYgKCF0aGlzLmxpZ2h0bmluZyAmJiB0aGlzLmxlYWYueCA8IDE0MCAmJiB0aGlzLnRyaWFsLnRlbXAgPD0gLTUgJiYgKHRoaXMudHJpYWwuYWx0aXR1ZGUgLSB0aGlzLnRyaWFsLmNsb3VkYmFzZSkgPiAuNSkge1xyXG5cdFx0XHR0aGlzLmxpZ2h0dGljayA9IDBcclxuXHRcdFx0dGhpcy5saWdodG5pbmcgPSB0cnVlXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXNldCgpIHtcclxuXHRcdHRoaXMudHJpYWwgPSBuZXcgVHJpYWwoKVxyXG5cdFx0dGhpcy50ZW1wID0gdGhpcy5zZXR0aW5ncy5nZXRUZW1wKClcclxuXHRcdHRoaXMudmFwb3IgPSB0aGlzLnNldHRpbmdzLmdldFZhcG9yKClcclxuXHRcdHRoaXMubGFwc2VfcmF0ZSA9IExBUFNFX1JBVEVcclxuXHRcdHRoaXMubGFzdGFsdCA9IDBcclxuXHRcdHRoaXMudHJpYWwuaW5pdCh7XHJcblx0XHRcdHRlbXA6IHRoaXMudGVtcCxcclxuXHRcdFx0dmFwb3I6IHRoaXMudmFwb3IsXHJcblx0XHRcdGRld3BvaW50OiBkZXdwb2ludCh0aGlzLnZhcG9yKVxyXG5cdFx0fSlcclxuXHRcdHRoaXMuc2V0dGluZ3MudXBkYXRlUmVhZG91dCh0aGlzLnRyaWFsKVxyXG5cdH1cclxuXHJcblx0dGljayhldGdyYXBoLCBhdGdyYXBoKSB7XHJcblx0XHRpZiAodGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XHJcblx0XHRcdHRoaXMudXBkYXRlKHRoaXMudHJpYWwpXHJcblx0XHRcdGV0Z3JhcGgudXBkYXRlKHRoaXMudHJpYWwpXHJcblx0XHRcdGF0Z3JhcGgudXBkYXRlKHRoaXMudHJpYWwpXHJcblx0XHRcdGlmICh0aGlzLmxpZ2h0bmluZyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHN3aXRjaCh0aGlzLmxpZ2h0dGljaykge1xyXG5cdFx0XHRcdGNhc2UgMDpcclxuXHRcdFx0XHRcdHRoaXMuYm9sdC54ID0gdGhpcy5jbG91ZC54ICsgMTBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRcdFx0dGhpcy5ib2x0LnggKz0gMTBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSA3OlxyXG5cdFx0XHRcdFx0dGhpcy5ib2x0LnggKz0gMTBcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0Y2FzZSAxMDpcclxuXHRcdFx0XHRcdHRoaXMuYm9sdC54ID0gLTEwMFxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0XHRjYXNlIDYwOlxyXG5cdFx0XHRcdFx0dGhpcy5wbGF5U291bmQoXCJ0aHVuZGVyXCIpXHJcblx0XHRcdFx0XHR0aGlzLmxpZ2h0bmluZyA9IGZhbHNlXHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLmxpZ2h0dGljaysrXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIE10blNpbSB7XHJcblx0Y29uc3RydWN0b3Ioc2V0dGluZ3MpIHtcclxuXHRcdC8vc2V0QW5zd2VyKFtdKSAvLyBiZWdpbm5pbmcgZGVmYXVsdFxyXG5cdFx0dGhpcy5tYWluc3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJtYWluY2FudmFzXCIpXHJcblx0XHR0aGlzLmV0c3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJldGdyYXBoXCIpXHJcblx0XHR0aGlzLmF0c3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJhdGdyYXBoXCIpXHJcblx0XHR0aGlzLmJ1dHRvbnMgPSBuZXcgQnV0dG9ucygpXHJcblx0XHR0aGlzLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKClcclxuXHRcdHRoaXMuZXRncmFwaCA9IG5ldyBFVEdyYXBoKHRoaXMuZXRzdGFnZSwgdGhpcy5zZXR0aW5ncylcclxuXHRcdHRoaXMuYXRncmFwaCA9IG5ldyBBVEdyYXBoKHRoaXMuYXRzdGFnZSlcclxuXHRcdHRoaXMubXRuID0gbmV3IE10bih0aGlzLm1haW5zdGFnZSwgdGhpcy5zZXR0aW5ncywgKCkgPT4ge1xyXG5cdFx0XHR0aGlzLmJ1dHRvbnMucmVzdGFydC5kaXNhYmxlZCA9IGZhbHNlXHJcblx0XHRcdHRoaXMuYnV0dG9ucy5wYXVzZS5kaXNhYmxlZCA9IHRydWVcclxuXHRcdH0pXHJcblx0XHR0aGlzLnBhdXNlID0gZmFsc2VcclxuXHRcdHRoaXMuYnV0dG9ucy5hZGRMaXN0ZW5lcihlID0+IHtcclxuXHRcdFx0c3dpdGNoKGUudGFyZ2V0LmlkKSB7XHJcblx0XHRcdGNhc2UgXCJydW5cIjpcclxuXHRcdFx0XHR0aGlzLmVuYWJsZVBsYXkoZmFsc2UpXHJcblx0XHRcdFx0dGhpcy5idXR0b25zLnBhdXNlLnZhbHVlID0gXCJQYXVzZVwiXHJcblx0XHRcdFx0dGhpcy5wYXVzZSA9IGZhbHNlXHJcblx0XHRcdFx0dGhpcy5tdG4ucGxheSgpXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInBhdXNlXCI6XHJcblx0XHRcdFx0dGhpcy5wYXVzZSA9ICF0aGlzLnBhdXNlXHJcblx0XHRcdFx0dGhpcy5tdG4ucGF1c2UodGhpcy5wYXVzZSlcclxuXHRcdFx0XHRlLnRhcmdldC52YWx1ZSA9IHRoaXMucGF1c2U/IFwiUmVzdW1lXCI6XCJQYXVzZVwiXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcInJlc3RhcnRcIjpcclxuXHRcdFx0XHR0aGlzLnJlc2V0KClcclxuXHRcdFx0XHR0aGlzLm10bi5jbGVhcigpXHJcblx0XHRcdFx0dGhpcy5ldGdyYXBoLmNsZWFyKClcclxuXHRcdFx0XHR0aGlzLmF0Z3JhcGguY2xlYXIoKVxyXG5cdFx0XHRcdHRoaXMuZXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0XHRcdHRoaXMuYXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0XHRcdHRoaXMubXRuLnJlc2V0KClcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHJlc2V0KCkge1xyXG5cdFx0dGhpcy5lbmFibGVQbGF5KHRydWUpXHJcblx0fVxyXG5cclxuXHRlbmFibGVQbGF5KHBsYXkpIHtcclxuXHRcdHRoaXMuYnV0dG9ucy5ydW4uZGlzYWJsZWQgPSAhcGxheVxyXG5cdFx0dGhpcy5idXR0b25zLnBhdXNlLmRpc2FibGVkID0gcGxheVxyXG5cdFx0dGhpcy5idXR0b25zLnJlc3RhcnQuZGlzYWJsZWQgPSAhcGxheVxyXG5cdH1cclxuXHJcblx0cmVuZGVyKCkge1xyXG5cdFx0dGhpcy5idXR0b25zLnJ1bi5kaXNhYmxlZCA9IGZhbHNlXHJcblx0XHR0aGlzLmJ1dHRvbnMubXV0ZS5jaGVja2VkID0gZmFsc2VcclxuXHRcdHRoaXMuYnV0dG9ucy5wYXVzZS5kaXNhYmxlZCA9IHRydWVcclxuXHRcdHRoaXMuYnV0dG9ucy5yZXN0YXJ0LmRpc2FibGVkID0gdHJ1ZVxyXG5cdFx0dGhpcy5yZXNldCgpXHJcblx0XHR0aGlzLmV0Z3JhcGgucmVuZGVyKClcclxuXHRcdHRoaXMuYXRncmFwaC5yZW5kZXIoKVxyXG5cdFx0dGhpcy5tdG4ucmVuZGVyKClcclxuXHRcdGNyZWF0ZWpzLlRpY2tlci5hZGRFdmVudExpc3RlbmVyKFwidGlja1wiLCBlID0+IHtcclxuXHRcdFx0dGhpcy5tdG4udGljayh0aGlzLmV0Z3JhcGgsIHRoaXMuYXRncmFwaClcclxuXHRcdFx0dGhpcy5ldHN0YWdlLnVwZGF0ZSgpXHJcblx0XHRcdHRoaXMuYXRzdGFnZS51cGRhdGUoKVxyXG5cdFx0XHR0aGlzLm1haW5zdGFnZS51cGRhdGUoKVxyXG5cdFx0fSlcclxuXHR9XHJcbn1cclxuXHJcbmdldFNldHRpbmdzKCkudGhlbihzZXR0aW5ncyA9PiAobmV3IE10blNpbShzZXR0aW5ncykpLnJlbmRlcigpKVxyXG4iLCJjb25zdCBtYXJnaW5YID0gNDAsIG1hcmdpblkgPSAzMCwgZW5kTWFyZ2luID0gNVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXhpcyB7XHJcblx0Y29uc3RydWN0b3Ioc3BlYykge1xyXG5cdFx0dGhpcy5zcGVjID0gc3BlY1xyXG5cdFx0dGhpcy5zdGFnZSA9IHNwZWMuc3RhZ2VcclxuXHRcdHRoaXMudyA9IHNwZWMuZGltLncgfHwgMTAwXHJcblx0XHR0aGlzLmggPSBzcGVjLmRpbS5oIHx8IDEwMFxyXG5cdFx0dGhpcy5taW4gPSBzcGVjLmRpbS5taW4gfHwgMFxyXG5cdFx0dGhpcy5tYXggPSBzcGVjLmRpbS5tYXggfHwgMTAwXHJcblx0XHR0aGlzLmZvbnQgPSBzcGVjLmZvbnQgfHwgXCIxMXB4IEFyaWFsXCJcclxuXHRcdHRoaXMuY29sb3IgPSBzcGVjLmNvbG9yIHx8IFwiIzAwMFwiXHJcblx0XHR0aGlzLmxhYmVsID0gc3BlYy5sYWJlbFxyXG5cdFx0dGhpcy5tYWpvciA9IHNwZWMubWFqb3IgfHwgMTBcclxuXHRcdHRoaXMubWlub3IgPSBzcGVjLm1pbm9yIHx8IHNwZWMubWFqb3JcclxuXHRcdHRoaXMucHJlY2lzaW9uID0gc3BlYy5wcmVjaXNpb24gfHwgMFxyXG5cdFx0dGhpcy52ZXJ0aWNhbCA9IHNwZWMub3JpZW50ICYmIHNwZWMub3JpZW50ID09IFwidmVydGljYWxcIiB8fCBmYWxzZVxyXG5cdFx0dGhpcy5saW5lYXIgPSBzcGVjLnNjYWxlICYmIHNwZWMuc2NhbGUgPT0gXCJsaW5lYXJcIiB8fCBmYWxzZVxyXG5cdFx0dGhpcy5pbnZlcnQgPSBzcGVjLmludmVydCB8fCBmYWxzZVxyXG5cdFx0aWYgKHNwZWMuZGltLngpIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5YID0gc3BlYy5kaW0ueFxyXG5cdFx0XHR0aGlzLmVuZFggPSB0aGlzLm9yaWdpblggKyB0aGlzLndcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMub3JpZ2luWCA9IG1hcmdpblhcclxuXHRcdFx0dGhpcy5lbmRYID0gdGhpcy53IC0gZW5kTWFyZ2luXHJcblx0XHR9XHJcblx0XHRpZiAoc3BlYy5kaW0ueSkge1xyXG5cdFx0XHR0aGlzLm9yaWdpblkgPSBzcGVjLmRpbS55XHJcblx0XHRcdHRoaXMuZW5kWSA9IHRoaXMub3JpZ2luWSAtIHRoaXMuaCArIGVuZE1hcmdpblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5vcmlnaW5ZID0gdGhpcy5oIC0gbWFyZ2luWVxyXG5cdFx0XHR0aGlzLmVuZFkgPSBlbmRNYXJnaW5cclxuXHRcdH1cclxuXHRcdHRoaXMuc2NhbGUgPSB0aGlzLnZlcnRpY2FsID8gTWF0aC5hYnModGhpcy5lbmRZIC0gdGhpcy5vcmlnaW5ZKS8odGhpcy5tYXggLSB0aGlzLm1pbik6IE1hdGguYWJzKHRoaXMuZW5kWCAtIHRoaXMub3JpZ2luWCkvKHRoaXMubWF4IC0gdGhpcy5taW4pXHJcblx0fVxyXG5cclxuXHRkcmF3TGluZSh4MSx5MSx4Mix5Mikge1xyXG5cdFx0bGV0IGxpbmUgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSgxKVxyXG5cdFx0bGluZS5ncmFwaGljcy5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKVxyXG5cdFx0bGluZS5ncmFwaGljcy5tb3ZlVG8oeDEsIHkxKVxyXG5cdFx0bGluZS5ncmFwaGljcy5saW5lVG8oeDIsIHkyKVxyXG5cdFx0bGluZS5ncmFwaGljcy5lbmRTdHJva2UoKTtcclxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQobGluZSlcclxuXHR9XHJcblxyXG5cdGRyYXdUZXh0KHRleHQseCx5KSB7XHJcblx0XHR0ZXh0LnggPSB4XHJcblx0XHR0ZXh0LnkgPSB5XHJcblx0XHRpZiAodGhpcy52ZXJ0aWNhbCAmJiB0ZXh0LnRleHQgPT0gdGhpcy5sYWJlbCkgdGV4dC5yb3RhdGlvbiA9IDI3MFxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZCh0ZXh0KVxyXG5cdFx0cmV0dXJuIHRleHRcclxuXHR9XHJcblxyXG5cdGdldFRleHQocykgeyByZXR1cm4gbmV3IGNyZWF0ZWpzLlRleHQocyx0aGlzLmZvbnQsdGhpcy5jb2xvcikgfVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgIFx0bGV0IGxhYmVsID0gdGhpcy5nZXRUZXh0KHRoaXMubGFiZWwpXHJcbiAgICBcdGxldCBsYWJlbF9ibmRzID0gbGFiZWwuZ2V0Qm91bmRzKClcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWCx0aGlzLm9yaWdpblksdGhpcy5vcmlnaW5YLHRoaXMuZW5kWSlcclxuICAgICAgICAgICAgbGV0IG1pblhMYWJlbCA9IHRoaXMub3JpZ2luWFxyXG4gICAgICAgICAgICBmb3IgKGxldCB2YWwgPSB0aGlzLm1pbjsgdmFsIDw9IHRoaXMubWF4OyB2YWwgKz0gdGhpcy5tYWpvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB0aGlzLmdldExvYyh2YWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWC00LHYsdGhpcy5vcmlnaW5YKzQsdilcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5nZXRUZXh0KHZhbC50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSlcclxuICAgICAgICAgICAgICAgIGxldCBibmRzID0gdGV4dC5nZXRCb3VuZHMoKVxyXG4gICAgICAgICAgICAgICAgbGV0IHggPSB0aGlzLm9yaWdpblgtNS1ibmRzLndpZHRoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KHRleHQseCx2K2JuZHMuaGVpZ2h0LzItMTApXHJcbiAgICAgICAgICAgICAgICBpZiAoeCA8IG1pblhMYWJlbCkgbWluWExhYmVsID0geFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IHZhbCA9IHRoaXMubWluOyB2YWwgPD0gdGhpcy5tYXg7IHZhbCArPSB0aGlzLm1pbm9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5vcmlnaW5YLTIsdix0aGlzLm9yaWdpblgrMix2KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWMubGFiZWwpIHtcclxuXHQgICAgICAgICAgICBsZXQgeSA9IHRoaXMub3JpZ2luWSAtICh0aGlzLm9yaWdpblkgLSBsYWJlbF9ibmRzLndpZHRoKS8yXHJcblx0ICAgICAgICAgICAgdGhpcy5kcmF3VGV4dChsYWJlbCwgbWluWExhYmVsIC0gbGFiZWxfYm5kcy5oZWlnaHQsIHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMub3JpZ2luWCx0aGlzLm9yaWdpblksIHRoaXMuZW5kWCx0aGlzLm9yaWdpblkpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWMubGFiZWwpIHtcclxuXHQgICAgICAgICAgICBsZXQgeCA9ICh0aGlzLncgLSBlbmRNYXJnaW4gLSBsYWJlbF9ibmRzLndpZHRoKS8yXHJcblx0ICAgICAgICAgICAgdGhpcy5kcmF3VGV4dChsYWJlbCwgdGhpcy5vcmlnaW5YICsgeCwgdGhpcy5vcmlnaW5ZICsgMTUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWFqb3IpICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdiA9IHRoaXMuZ2V0TG9jKHZhbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodix0aGlzLm9yaWdpblktNCx2LHRoaXMub3JpZ2luWSs0KVxyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldFRleHQodmFsLnRvRml4ZWQodGhpcy5wcmVjaXNpb24pKVxyXG4gICAgICAgICAgICAgICAgbGV0IGJuZHMgPSB0ZXh0LmdldEJvdW5kcygpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0KHRleHQsdi1ibmRzLndpZHRoLzIsdGhpcy5vcmlnaW5ZKzQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgdmFsID0gdGhpcy5taW47IHZhbCA8PSB0aGlzLm1heDsgdmFsICs9IHRoaXMubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ID0gdGhpcy5nZXRMb2ModmFsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh2LHRoaXMub3JpZ2luWS0yLHYsdGhpcy5vcmlnaW5ZKzIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TG9jKHZhbCkge1xyXG4gICAgICAgIGxldCBpdmFsID0gdGhpcy5saW5lYXI/IE1hdGgucm91bmQodGhpcy5zY2FsZSoodmFsLXRoaXMubWluKSk6IE1hdGgucm91bmQoTWF0aC5sb2codGhpcy5zY2FsZSoodmFsLXRoaXMubWluKSkpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmVydGljYWw/dGhpcy5vcmlnaW5ZIC0gaXZhbDp0aGlzLm9yaWdpblggKyBpdmFsXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VmFsdWUodikge1xyXG4gICAgXHRsZXQgZmFjdG9yID0gdGhpcy52ZXJ0aWNhbD8gKHRoaXMub3JpZ2luWSAtIHYpL3RoaXMub3JpZ2luWToodiAtIHRoaXMub3JpZ2luWCkvKHRoaXMudyAtIHRoaXMub3JpZ2luWClcclxuICAgICAgICByZXR1cm4gdGhpcy5taW4gKyAodGhpcy5tYXggLSB0aGlzLm1pbikgKiBmYWN0b3JcclxuICAgIH1cclxuXHJcbiAgICBpc0luc2lkZSh2KSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgIHJldHVybiB2ID49IHRoaXMub3JpZ2luWSAmJiB2IDw9ICh0aGlzLm9yaWdpblkgKyB0aGlzLmgpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gdiA+PSB0aGlzLm9yaWdpblggJiYgdiA8PSAodGhpcy5vcmlnaW5ZICsgdGhpcy53KVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCBBeGlzIGZyb20gXCIuL2F4aXNcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JhcGgge1xyXG5cdGNvbnN0cnVjdG9yKHNwZWMpIHtcclxuXHRcdHRoaXMuc3RhZ2UgPSBzcGVjLnN0YWdlXHJcblx0XHR0aGlzLnhheGlzID0gbmV3IEF4aXMoe1xyXG5cdFx0XHRzdGFnZTogdGhpcy5zdGFnZSxcclxuXHRcdFx0bGFiZWw6IHNwZWMueGxhYmVsLFxyXG5cdFx0XHRkaW06IHsgeDogc3BlYy54LCB5OiBzcGVjLnksIHc6IHNwZWMudywgaDogc3BlYy5oLCBtaW46IHNwZWMubWluWCwgbWF4OiBzcGVjLm1heFggfSxcclxuXHRcdFx0b3JpZW50OiBcImhvcml6b250YWxcIixcclxuXHRcdFx0c2NhbGU6IHNwZWMueHNjYWxlLFxyXG5cdFx0XHRtYWpvcjogc3BlYy5tYWpvclgsXHJcblx0XHRcdG1pbm9yOiBzcGVjLm1pbm9yWCxcclxuXHRcdFx0cHJlY2lzaW9uOiBzcGVjLnByZWNpc2lvblgsXHJcblx0XHRcdGludmVydDogc3BlYy54aW52ZXJ0XHJcblx0XHR9KVxyXG5cdFx0dGhpcy55YXhpcyA9IG5ldyBBeGlzKHtcclxuXHRcdFx0c3RhZ2U6IHRoaXMuc3RhZ2UsXHJcblx0XHRcdGxhYmVsOiBzcGVjLnlsYWJlbCxcclxuXHRcdFx0ZGltOiB7IHg6IHNwZWMueCwgeTogc3BlYy55LCB3OiBzcGVjLncsIGg6IHNwZWMuaCwgbWluOiBzcGVjLm1pblksIG1heDogc3BlYy5tYXhZIH0sXHJcblx0XHRcdG9yaWVudDogXCJ2ZXJ0aWNhbFwiLFxyXG5cdFx0XHRzY2FsZTogc3BlYy55c2NhbGUsXHJcblx0XHRcdG1ham9yOiBzcGVjLm1ham9yWSxcclxuXHRcdFx0bWlub3I6IHNwZWMubWlub3JZLFxyXG5cdFx0XHRwcmVjaXNpb246IHNwZWMucHJlY2lzaW9uWSxcclxuXHRcdFx0aW52ZXJ0OiBzcGVjLnlpbnZlcnRcclxuXHRcdH0pXHJcblx0XHR0aGlzLndpZHRoID0gMVxyXG5cdFx0dGhpcy5sYXN0ID0gbnVsbFxyXG5cdFx0dGhpcy5tYXJrZXIgPSBudWxsXHJcblx0XHR0aGlzLmNvbG9yID0gXCIjMDAwXCJcclxuXHRcdHRoaXMuZG90dGVkID0gZmFsc2VcclxuXHRcdGlmIChzcGVjLmJhY2tncm91bmQpIHtcclxuXHRcdFx0bGV0IGIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG5cdFx0XHRiLmdyYXBoaWNzLmJlZ2luU3Ryb2tlKFwiI0FBQVwiKS5iZWdpbkZpbGwoc3BlYy5iYWNrZ3JvdW5kKS5kcmF3UmVjdChzcGVjLngsc3BlYy55LXNwZWMuaCxzcGVjLncsc3BlYy5oKS5lbmRTdHJva2UoKVxyXG5cdFx0XHRiLmFscGhhID0gMC4zXHJcblx0XHRcdHNwZWMuc3RhZ2UuYWRkQ2hpbGQoYilcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHNldFdpZHRoKHdpZHRoKSB7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGhcclxuXHR9XHJcblxyXG5cdHNldERvdHRlZChkb3R0ZWQpIHtcclxuXHRcdHRoaXMuZG90dGVkID0gZG90dGVkXHJcblx0fVxyXG5cclxuXHRzZXRDb2xvcihjb2xvcikge1xyXG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yXHJcblx0XHR0aGlzLmVuZFBsb3QoKVxyXG5cdFx0dGhpcy5tYXJrZXIgPSBuZXcgY3JlYXRlanMuU2hhcGUoKVxyXG4gICAgXHR0aGlzLm1hcmtlci5ncmFwaGljcy5iZWdpblN0cm9rZShjb2xvcikuYmVnaW5GaWxsKGNvbG9yKS5kcmF3UmVjdCgwLDAsNCw0KVxyXG4gICAgXHR0aGlzLm1hcmtlci54ID0gLTEwXHJcbiAgICBcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5tYXJrZXIpXHJcblx0fVxyXG5cclxuICAgIHJlbmRlcigpIHtcclxuICAgIFx0dGhpcy54YXhpcy5yZW5kZXIoKVxyXG4gICAgXHR0aGlzLnlheGlzLnJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICBcdHRoaXMuc3RhZ2UucmVtb3ZlQWxsQ2hpbGRyZW4oKVxyXG4gICAgXHR0aGlzLmVuZFBsb3QoKVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVNYXJrZXIoeCx5KSB7XHJcbiAgICBcdGlmICh0aGlzLm1hcmtlcikge1xyXG4gICAgXHRcdHRoaXMubWFya2VyLnggPSB4LTJcclxuICAgIFx0XHR0aGlzLm1hcmtlci55ID0geS0yXHJcblxyXG4gICAgXHR9XHJcbiAgICB9XHJcblxyXG5cdGRyYXdMaW5lKHgxLHkxLHgyLHkyKSB7XHJcblx0XHRsZXQgbGluZSA9IG5ldyBjcmVhdGVqcy5TaGFwZSgpXHJcblx0XHRpZiAodGhpcy5kb3R0ZWQgPT09IHRydWUpXHJcblx0XHRcdGxpbmUuZ3JhcGhpY3Muc2V0U3Ryb2tlRGFzaChbMiwyXSkuc2V0U3Ryb2tlU3R5bGUodGhpcy53aWR0aCkuYmVnaW5TdHJva2UodGhpcy5jb2xvcikubW92ZVRvKHgxLCB5MSkubGluZVRvKHgyLCB5MikuZW5kU3Ryb2tlKClcclxuXHRcdGVsc2VcclxuXHRcdFx0bGluZS5ncmFwaGljcy5zZXRTdHJva2VTdHlsZSh0aGlzLndpZHRoKS5iZWdpblN0cm9rZSh0aGlzLmNvbG9yKS5tb3ZlVG8oeDEsIHkxKS5saW5lVG8oeDIsIHkyKS5lbmRTdHJva2UoKVxyXG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChsaW5lKVxyXG5cdFx0cmV0dXJuIGxpbmVcclxuXHR9XHJcblxyXG4gICAgcGxvdCh4dix5dikge1xyXG4gICAgICAgIGlmICh4diA+PSB0aGlzLnhheGlzLm1pbiAmJiB4diA8PSB0aGlzLnhheGlzLm1heCAmJiB5diA+PSB0aGlzLnlheGlzLm1pbiAmJiB5diA8PSB0aGlzLnlheGlzLm1heCkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IHRoaXMueGF4aXMuZ2V0TG9jKHh2KVxyXG4gICAgICAgICAgICBsZXQgeSA9IHRoaXMueWF4aXMuZ2V0TG9jKHl2KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0KSAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlTWFya2VyKHRoaXMubGFzdC54LHRoaXMubGFzdC55KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLmxhc3QueCx0aGlzLmxhc3QueSx4LHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbmV3IGNyZWF0ZWpzLlBvaW50KHgseSlcclxuICAgICAgICAgICAgdGhpcy5tb3ZlTWFya2VyKHgseSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZW5kUGxvdCgpIHsgdGhpcy5sYXN0ID0gbnVsbCB9XHJcbn1cclxuIiwidmFyIGFuc3dlciA9IG51bGxcbnZhciBvcmlnaW4gPSBudWxsXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBlID0+IHtcbiAgICAgIGlmIChlLnNvdXJjZSAhPSB3aW5kb3cucGFyZW50ICkgcmV0dXJuXG4gICAgICB2YXIgbXNnID0gZS5kYXRhXG4gICAgICBpZiAobXNnLmNtZCA9PSBcInNldEluZm9cIikge1xuICAgICAgICBhbnN3ZXIgPSBtc2cuYW5zd2VyXG4gICAgICAgIGNvbnNvbGUubG9nKG1zZylcbiAgICAgICAgb3JpZ2luID0gbXNnLm9yaWdpblxuICAgICAgICByZXNvbHZlKG1zZy5zZXR0aW5ncylcbiAgICAgIH1cbiAgICB9LCB7IG9uY2U6IHRydWUgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFuc3dlcigpIHtcbiAgcmV0dXJuIGFuc3dlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5zd2VyKHZhbHVlKSB7XG4gIGFuc3dlciA9IHZhbHVlXG4gIGNvbnNvbGUubG9nKGFuc3dlcilcbiAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7IGNtZDogXCJzZXRBbnN3ZXJcIiwgYW5zd2VyOiBhbnN3ZXIgfSwgb3JpZ2luKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29tcGxldGUodmFsaWQsIHRhcmdldCkge1xuICB0YXJnZXQucG9zdE1lc3NhZ2UoeyBjbWQ6IFwic2V0VmFsaWRpdHlcIiwgdmFsaWRpdHk6IHZhbGlkIH0sIG9yaWdpbilcbn1cbiJdfQ==
