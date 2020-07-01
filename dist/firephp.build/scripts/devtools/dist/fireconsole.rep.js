PINF.bundle("", function(__require) {
	__require.memoize("/main.js", function (_require, _exports, _module) {
var bundle = { require: _require, exports: _exports, module: _module };
var exports = undefined;
var module = undefined;
var define = function (deps, init) {
_module.exports = init();
}; define.amd = true;
       var pmodule = bundle.module;

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mainModule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64) {
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}

function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;

  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 0xFF;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];

  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }

  return output.join('');
}

function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var parts = [];
  var maxChunkLength = 16383;

  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }

  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
  }

  return parts.join('');
}
},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":3,"ieee754":13}],4:[function(require,module,exports){
(function (global){
"use strict";

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g.mainModule = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
        o(t[i]);
      }

      return o;
    }

    return r;
  }()({
    1: [function (_require_, module, exports) {
      function _typeof(obj) {
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
          _typeof = function _typeof(obj) {
            return typeof obj;
          };
        } else {
          _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          };
        }

        return _typeof(obj);
      }

      var RT = _require_("./rt");

      var Renderer = exports.Renderer = _require_("./renderer").Renderer;

      function Domplate(exports) {
        exports.util = _require_("./util");

        exports.loadStyle = function (uri, baseUrl) {
          var WINDOW = window;

          if (typeof baseUrl === 'undefined' && WINDOW && typeof WINDOW.pmodule !== "undefined" && !/^\//.test(uri)) {
            uri = [WINDOW.pmodule.filename.replace(/\/([^\/]*)$/, ""), uri].join("/").replace(/\/\.?\//g, "/");
          } else if (typeof baseUrl !== 'undefined') {
            uri = [baseUrl, uri].join("/").replace(/\/\.?\//g, "/");
          }

          return new Promise(function (resolve, reject) {
            var link = window.document.createElementNS ? window.document.createElementNS("http://www.w3.org/1999/xhtml", "link") : window.document.createElement("link");
            link.rel = "stylesheet";
            link.href = uri;

            link.onload = function () {
              resolve();
            };

            var head = window.document.getElementsByTagName("head")[0] || window.document.documentElement;
            head.appendChild(link);
          });
        };

        exports.EVAL = {
          compileMarkup: function compileMarkup(code, context) {
            return context.compiled(context);
          },
          compileDOM: function compileDOM(code, context) {
            return context.compiled(context);
          }
        };
        exports.tags = {};
        exports.tags._domplate_ = exports;

        var DomplateTag = exports.DomplateTag = function DomplateTag(tagName) {
          this.tagName = tagName;
        };

        function DomplateEmbed() {}

        function DomplateLoop() {}

        function DomplateIf() {}

        function copyArray(oldArray) {
          var ary = [];
          if (oldArray) for (var i = 0; i < oldArray.length; ++i) {
            ary.push(oldArray[i]);
          }
          return ary;
        }

        function copyObject(l, r) {
          var m = {};
          extend(m, l);
          extend(m, r);
          return m;
        }

        function extend(l, r) {
          for (var n in r) {
            l[n] = r[n];
          }
        }

        var womb = null;

        var domplate = exports.domplate = function () {
          var lastSubject;

          for (var i = 0; i < arguments.length; ++i) {
            lastSubject = lastSubject ? copyObject(lastSubject, arguments[i]) : arguments[i];
          }

          for (var name in lastSubject) {
            var val = lastSubject[name];
            if (isTag(val)) val.tag.subject = lastSubject;
          }

          return lastSubject;
        };

        domplate.context = function (context, fn) {
          var lastContext = domplate.lastContext;
          domplate.topContext = context;
          fn.apply(context);
          domplate.topContext = lastContext;
        };

        exports.tags.TAG = function () {
          var embed = new DomplateEmbed();
          return embed.merge(arguments);
        };

        exports.tags.FOR = domplate.FOR = function () {
          var loop = new DomplateLoop();
          return loop.merge(arguments);
        };

        exports.tags.IF = domplate.IF = function () {
          var loop = new DomplateIf();
          return loop.merge(arguments);
        };

        DomplateTag.prototype = {
          merge: function merge(args, oldTag) {
            if (oldTag) this.tagName = oldTag.tagName;
            this.context = oldTag ? oldTag.context : null;
            this.subject = oldTag ? oldTag.subject : null;
            this.attrs = oldTag ? copyObject(oldTag.attrs) : {};
            this.classes = oldTag ? copyObject(oldTag.classes) : {};
            this.props = oldTag ? copyObject(oldTag.props) : null;
            this.listeners = oldTag ? copyArray(oldTag.listeners) : null;
            this.children = oldTag ? copyArray(oldTag.children) : [];
            this.vars = oldTag ? copyArray(oldTag.vars) : [];
            var attrs = args.length ? args[0] : null;
            var hasAttrs = _typeof(attrs) == "object" && !isTag(attrs);
            this.resources = {};
            this.children = [];
            if (domplate.topContext) this.context = domplate.topContext;
            if (args.length) parseChildren(args, hasAttrs ? 1 : 0, this.vars, this.children);
            if (hasAttrs) this.parseAttrs(attrs);
            return creator(this, DomplateTag);
          },
          parseAttrs: function parseAttrs(args) {
            for (var name in args) {
              var val = parseValue(args[name]);
              readPartNames(val, this.vars);

              if (name.indexOf("on") === 0) {
                var eventName = name.substr(2);
                if (!this.listeners) this.listeners = [];
                this.listeners.push(eventName, val);
              } else if (name[0] === "_" && name[1] !== "_") {
                var propName = name.substr(1);
                if (!this.props) this.props = {};
                this.props[propName] = val;
              } else if (name[0] === "$") {
                var className = name.substr(1);
                if (!this.classes) this.classes = {};
                this.classes[className] = val;
              } else {
                if (name === "class" && this.attrs.hasOwnProperty(name)) this.attrs[name] += " " + val;else this.attrs[name] = val;
              }
            }
          },
          compile: function compile() {
            if (this.renderMarkup) {
              return;
            }

            if (this.subject._resources) {
              this.resources = this.subject._resources();
            }

            this.compileMarkup();
            this.compileDOM();
          },
          compileMarkup: function compileMarkup() {
            this.markupArgs = [];
            var topBlock = [],
                topOuts = [],
                blocks = [],
                info = {
              args: this.markupArgs,
              argIndex: 0
            };
            this.generateMarkup(topBlock, topOuts, blocks, info, true);
            this.addCode(topBlock, topOuts, blocks);
            var fnBlock = ['(function (__code__, __context__, __in__, __out__'];

            for (var i = 0; i < info.argIndex; ++i) {
              fnBlock.push(', s', i);
            }

            fnBlock.push(') {');
            if (this.subject) fnBlock.push('  with (this) {');
            if (this.context) fnBlock.push('  with (__context__) {');
            fnBlock.push('  with (__in__) {');
            fnBlock.push.apply(fnBlock, blocks);
            if (this.subject) fnBlock.push('  }');
            if (this.context) fnBlock.push('  }');
            fnBlock.push('}})');
            var self = this;
            var js = fnBlock.join("");
            js = js.replace('__SELF__JS__', js.replace(/\'/g, '\\\''));
            this.renderMarkup = exports.EVAL.compileMarkup(js, RT.makeMarkupRuntime(exports.EVAL, {
              self: self,
              compiled: this.subject.__markup
            }));
          },
          getVarNames: function getVarNames(args) {
            if (this.vars) args.push.apply(args, this.vars);

            for (var i = 0; i < this.children.length; ++i) {
              var child = this.children[i];
              if (isTag(child)) child.tag.getVarNames(args);else if (child instanceof Parts) {
                for (var i = 0; i < child.parts.length; ++i) {
                  if (child.parts[i] instanceof Variables) {
                    var name = child.parts[i].names[0];
                    var names = name.split(".");
                    args.push(names[0]);
                  }
                }
              }
            }
          },
          generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info, topNode) {
            topBlock.push(',"<', this.tagName, '"');

            if (topNode) {
              if (this.subject.__dbid) this.attrs['__dbid'] = this.subject.__dbid;
              if (this.subject.__dtid) this.attrs['__dtid'] = this.subject.__dtid;
            }

            for (var name in this.attrs) {
              if (name != "class") {
                var val = this.attrs[name];
                topBlock.push(', " ', name, '=\\""');
                addParts(val, ',', topBlock, info, true);
                topBlock.push(', "\\""');
              }
            }

            if (this.listeners) {
              for (var i = 0; i < this.listeners.length; i += 2) {
                readPartNames(this.listeners[i + 1], topOuts);
              }
            }

            if (this.props) {
              for (var name in this.props) {
                readPartNames(this.props[name], topOuts);
              }
            }

            if (this.attrs.class || this.classes && Object.keys(this.classes).length > 0) {
              topBlock.push(', " class=\\""');
              if (this.attrs.hasOwnProperty("class")) addParts(this.attrs["class"], ',', topBlock, info, true);
              topBlock.push(', " "');

              for (var name in this.classes) {
                topBlock.push(', (');
                addParts(this.classes[name], '', topBlock, info);
                topBlock.push(' ? "', name, '" + " " : "")');
              }

              topBlock.push(', "\\""');
            }

            if (this.tagName == "br") {
              topBlock.push(',"/>"');
            } else {
              topBlock.push(',">"');
              this.generateChildMarkup(topBlock, topOuts, blocks, info);
              topBlock.push(',"</', this.tagName, '>"');
            }
          },
          generateChildMarkup: function generateChildMarkup(topBlock, topOuts, blocks, info) {
            for (var i = 0; i < this.children.length; ++i) {
              var child = this.children[i];
              if (isTag(child)) child.tag.generateMarkup(topBlock, topOuts, blocks, info);else addParts(child, ',', topBlock, info, true);
            }
          },
          addCode: function addCode(topBlock, topOuts, blocks) {
            if (topBlock.length) blocks.push('    __code__.push(""', topBlock.join(""), ');');
            if (topOuts.length) blocks.push('__out__.push(', topOuts.join(","), ');');
            topBlock.splice(0, topBlock.length);
            topOuts.splice(0, topOuts.length);
          },
          addLocals: function addLocals(blocks) {
            var varNames = [];
            this.getVarNames(varNames);
            var map = {};

            for (var i = 0; i < varNames.length; ++i) {
              var name = varNames[i];
              if (map.hasOwnProperty(name)) continue;
              map[name] = 1;
              var names = name.split(".");
              blocks.push('var ', names[0] + ' = ' + '__in__.' + names[0] + ';');
            }
          },
          compileDOM: function compileDOM() {
            var path = [];
            var blocks = [];
            this.domArgs = [];
            path.embedIndex = 0;
            path.loopIndex = 0;
            path.ifIndex = 0;
            path.staticIndex = 0;
            path.renderIndex = 0;
            var nodeCount = this.generateDOM(path, blocks, this.domArgs);
            var fnBlock = ['(function (root, context, o'];

            for (var i = 0; i < path.staticIndex; ++i) {
              fnBlock.push(', ', 's' + i);
            }

            for (var i = 0; i < path.renderIndex; ++i) {
              fnBlock.push(', ', 'd' + i);
            }

            fnBlock.push(') {');

            for (var i = 0; i < path.loopIndex; ++i) {
              fnBlock.push('  var l', i, ' = 0;');
            }

            for (var i = 0; i < path.ifIndex; ++i) {
              fnBlock.push('  var if_', i, ' = 0;');
            }

            for (var i = 0; i < path.embedIndex; ++i) {
              fnBlock.push('  var e', i, ' = 0;');
            }

            if (this.subject) {
              fnBlock.push('  with (this) {');
            }

            if (this.context) {
              fnBlock.push('    with (context) {');
            }

            fnBlock.push(blocks.join(""));
            if (this.context) fnBlock.push('    }');
            if (this.subject) fnBlock.push('  }');
            fnBlock.push('  return ', nodeCount, ';');
            fnBlock.push('})');
            var self = this;
            var js = fnBlock.join("");
            js = js.replace('__SELF__JS__', js.replace(/\'/g, '\\\''));
            this.renderDOM = exports.EVAL.compileDOM(js, RT.makeDOMRuntime(exports.EVAL, {
              self: self,
              compiled: this.subject.__dom
            }));
          },
          generateDOM: function generateDOM(path, blocks, args) {
            if (this.listeners || this.props) this.generateNodePath(path, blocks);

            if (this.listeners) {
              for (var i = 0; i < this.listeners.length; i += 2) {
                var val = this.listeners[i + 1];
                var arg = generateArg(val, path, args);
                blocks.push('node.addEventListener("', this.listeners[i], '", __bind__(this, ', arg, '), false);');
              }
            }

            if (this.props) {
              for (var name in this.props) {
                var val = this.props[name];
                var arg = generateArg(val, path, args);
                blocks.push('node.', name, ' = ', arg, ';');
              }
            }

            this.generateChildDOM(path, blocks, args);
            return 1;
          },
          generateNodePath: function generateNodePath(path, blocks) {
            blocks.push("        node = __path__(root, o");

            for (var i = 0; i < path.length; ++i) {
              blocks.push(",", path[i]);
            }

            blocks.push(");");
          },
          generateChildDOM: function generateChildDOM(path, blocks, args) {
            path.push(0);

            for (var i = 0; i < this.children.length; ++i) {
              var child = this.children[i];
              if (isTag(child)) path[path.length - 1] += '+' + child.tag.generateDOM(path, blocks, args);else path[path.length - 1] += '+1';
            }

            path.pop();
          }
        };
        DomplateEmbed.prototype = copyObject(DomplateTag.prototype, {
          merge: function merge(args, oldTag) {
            this.value = oldTag ? oldTag.value : parseValue(args[0]);
            this.attrs = oldTag ? oldTag.attrs : {};
            this.vars = oldTag ? copyArray(oldTag.vars) : [];
            var attrs = args[1];

            for (var name in attrs) {
              var val = parseValue(attrs[name]);
              this.attrs[name] = val;
              readPartNames(val, this.vars);
            }

            var retval = creator(this, DomplateEmbed);
            return retval;
          },
          getVarNames: function getVarNames(names) {
            if (this.value instanceof Parts) names.push(this.value.parts[0].name);
            if (this.vars) names.push.apply(names, this.vars);
          },
          generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info) {
            this.addCode(topBlock, topOuts, blocks);
            blocks.push('__link__(');
            addParts(this.value, '', blocks, info);
            blocks.push(', __code__, __out__, {');
            var lastName = null;

            for (var name in this.attrs) {
              if (lastName) blocks.push(',');
              lastName = name;
              var val = this.attrs[name];
              blocks.push('"', name, '":');
              addParts(val, '', blocks, info);
            }

            blocks.push('});');
          },
          generateDOM: function generateDOM(path, blocks, args) {
            var embedName = 'e' + path.embedIndex++;
            this.generateNodePath(path, blocks);
            var valueName = 'd' + path.renderIndex++;
            var argsName = 'd' + path.renderIndex++;
            blocks.push('        ', embedName + ' = __link__(node, ', valueName, ', ', argsName, ');');
            return embedName;
          }
        });
        DomplateLoop.prototype = copyObject(DomplateTag.prototype, {
          merge: function merge(args, oldTag) {
            this.varName = oldTag ? oldTag.varName : args[0];
            this.iter = oldTag ? oldTag.iter : parseValue(args[1]);
            this.vars = [];
            this.children = oldTag ? copyArray(oldTag.children) : [];
            var offset = Math.min(args.length, 2);
            parseChildren(args, offset, this.vars, this.children);
            var retval = creator(this, DomplateLoop);
            return retval;
          },
          getVarNames: function getVarNames(names) {
            if (this.iter instanceof Parts) names.push(this.iter.parts[0].name);
            DomplateTag.prototype.getVarNames.apply(this, [names]);
          },
          generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info) {
            this.addCode(topBlock, topOuts, blocks);
            var iterName;

            if (this.iter instanceof Parts) {
              var part = this.iter.parts[0];
              iterName = part.names.join(',');

              if (part.format) {
                for (var i = 0; i < part.format.length; ++i) {
                  iterName = part.format[i] + "(" + iterName + ")";
                }
              }
            } else {
              iterName = this.iter;
            }

            blocks.push('    __loop__.apply(this, [', iterName, ', __out__, function(', this.varName, ', __out__) {');
            this.generateChildMarkup(topBlock, topOuts, blocks, info);
            this.addCode(topBlock, topOuts, blocks);
            blocks.push('    }]);');
          },
          generateDOM: function generateDOM(path, blocks, args) {
            var iterName = 'd' + path.renderIndex++;
            var counterName = 'i' + path.loopIndex;
            var loopName = 'l' + path.loopIndex++;
            if (!path.length) path.push(-1, 0);
            var preIndex = path.renderIndex;
            path.renderIndex = 0;
            var nodeCount = 0;
            var subBlocks = [];
            var basePath = path[path.length - 1];

            for (var i = 0; i < this.children.length; ++i) {
              path[path.length - 1] = basePath + '+' + loopName + '+' + nodeCount;
              var child = this.children[i];
              if (isTag(child)) nodeCount += '+' + child.tag.generateDOM(path, subBlocks, args);else nodeCount += '+1';
            }

            path[path.length - 1] = basePath + '+' + loopName;
            blocks.push('      ', loopName, ' = __loop__.apply(this, [', iterName, ', function(', counterName, ',', loopName);

            for (var i = 0; i < path.renderIndex; ++i) {
              blocks.push(',d' + i);
            }

            blocks.push(') {');
            blocks.push(subBlocks.join(""));
            blocks.push('        return ', nodeCount, ';');
            blocks.push('      }]);');
            path.renderIndex = preIndex;
            return loopName;
          }
        });
        DomplateIf.prototype = copyObject(DomplateTag.prototype, {
          merge: function merge(args, oldTag) {
            this.booleanVar = oldTag ? oldTag.booleanVar : parseValue(args[0]);
            this.vars = [];
            this.children = oldTag ? copyArray(oldTag.children) : [];
            var offset = Math.min(args.length, 1);
            parseChildren(args, offset, this.vars, this.children);
            var retval = creator(this, DomplateIf);
            return retval;
          },
          getVarNames: function getVarNames(names) {
            if (this.booleanVar instanceof Parts) names.push(this.booleanVar.parts[0].name);
            DomplateTag.prototype.getVarNames.apply(this, [names]);
          },
          generateMarkup: function generateMarkup(topBlock, topOuts, blocks, info) {
            this.addCode(topBlock, topOuts, blocks);
            var expr;

            if (this.booleanVar instanceof Parts) {
              var part = this.booleanVar.parts[0];
              expr = part.names.join(',');

              if (part.format) {
                for (var i = 0; i < part.format.length; ++i) {
                  expr = part.format[i] + "(" + expr + ")";
                }
              }
            } else {
              expr = this.booleanVar;
            }

            blocks.push('__if__.apply(this, [', expr, ', __out__, function(__out__) {');
            this.generateChildMarkup(topBlock, topOuts, blocks, info);
            this.addCode(topBlock, topOuts, blocks);
            blocks.push('}]);');
          },
          generateDOM: function generateDOM(path, blocks, args) {
            var controlName = 'd' + path.renderIndex++;
            var ifName = 'if_' + path.ifIndex++;
            if (!path.length) path.push(-1, 0);
            var preIndex = path.renderIndex;
            path.renderIndex = 0;
            var nodeCount = 0;
            var subBlocks = [];

            for (var i = 0; i < this.children.length; ++i) {
              var child = this.children[i];
              if (isTag(child)) nodeCount += '+' + child.tag.generateDOM(path, subBlocks, args);else nodeCount += '+1';
            }

            blocks.push('      ', ifName, ' = __if__.apply(this, [', controlName, ', function(', ifName);

            for (var i = 0; i < path.renderIndex; ++i) {
              blocks.push(',d' + i);
            }

            blocks.push(') {');
            blocks.push(subBlocks.join(""));
            blocks.push('      }]);');
            path.renderIndex = preIndex;
            return controlName;
          }
        });

        function Variables(names, format) {
          this.names = names;
          this.format = format;
        }

        function Parts(parts) {
          this.parts = parts;
        }

        function parseParts(str) {
          var index = 0;
          var parts = [];
          var m;
          var re = /\$([_A-Za-z][$_A-Za-z0-9.,|]*)/g;

          while (m = re.exec(str)) {
            var pre = str.substr(index, re.lastIndex - m[0].length - index);
            if (pre) parts.push(pre);
            var segs = m[1].split("|");
            var vars = segs[0].split(",$");
            parts.push(new Variables(vars, segs.splice(1)));
            index = re.lastIndex;
          }

          if (!index) {
            return str;
          }

          var post = str.substr(index);
          if (post) parts.push(post);
          var retval = new Parts(parts);
          return retval;
        }

        function parseValue(val) {
          return typeof val == 'string' ? parseParts(val) : val;
        }

        function parseChildren(args, offset, vars, children) {
          for (var i = offset; i < args.length; ++i) {
            var val = parseValue(args[i]);
            children.push(val);
            readPartNames(val, vars);
          }
        }

        function readPartNames(val, vars) {
          if (val instanceof Parts) {
            for (var i = 0; i < val.parts.length; ++i) {
              var part = val.parts[i];
              if (part instanceof Variables) vars.push(part.names[0]);
            }
          }
        }

        function generateArg(val, path, args) {
          if (val instanceof Parts) {
            var vals = [];

            for (var i = 0; i < val.parts.length; ++i) {
              var part = val.parts[i];

              if (part instanceof Variables) {
                var varName = 'd' + path.renderIndex++;

                if (part.format) {
                  for (var j = 0; j < part.format.length; ++j) {
                    varName = part.format[j] + '(' + varName + ')';
                  }
                }

                vals.push(varName);
              } else vals.push('"' + part.replace(/"/g, '\\"') + '"');
            }

            return vals.join('+');
          } else {
            args.push(val);
            return 's' + path.staticIndex++;
          }
        }

        function addParts(val, delim, block, info, escapeIt) {
          var vals = [];

          if (val instanceof Parts) {
            for (var i = 0; i < val.parts.length; ++i) {
              var part = val.parts[i];

              if (part instanceof Variables) {
                var partName = part.names.join(",");

                if (part.format) {
                  for (var j = 0; j < part.format.length; ++j) {
                    partName = part.format[j] + "(" + partName + ")";
                  }
                }

                if (escapeIt) vals.push("__escape__(" + partName + ")");else vals.push(partName);
              } else vals.push('"' + part + '"');
            }
          } else if (isTag(val)) {
            info.args.push(val);
            vals.push('s' + info.argIndex++);
          } else vals.push('"' + val + '"');

          var parts = vals.join(delim);
          if (parts) block.push(delim, parts);
        }

        function isTag(obj) {
          return (typeof obj == "function" || obj instanceof Function) && !!obj.tag;
        }

        function creator(tag, cons) {
          var fn = function fn() {
            var tag = arguments.callee.tag;
            var cons = arguments.callee.cons;
            var newTag = new cons();
            return newTag.merge(arguments, tag);
          };

          fn.tag = tag;
          fn.cons = cons;
          extend(fn, Renderer);
          return fn;
        }

        function defineTags() {
          Array.from(arguments).forEach(function (tagName) {
            var fnName = tagName.toUpperCase();

            exports.tags[fnName] = function () {
              var newTag = new this._domplate_.DomplateTag(tagName);
              return newTag.merge(arguments);
            };
          });
        }

        defineTags("a", "button", "br", "canvas", "col", "colgroup", "div", "fieldset", "form", "h1", "h2", "h3", "hr", "img", "input", "label", "legend", "li", "ol", "optgroup", "option", "p", "pre", "select", "span", "strong", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "tr", "tt", "ul");
      }

      exports.domplate = {};
      Domplate(exports.domplate);

      exports.domplate.ensureLoader = function () {
        if (typeof window !== "undefined" && window.PINF) {
          return window.PINF;
        }

        var PINF = _require_("pinf-loader-js/loader.browser");

        return window.PINF;
      };

      exports.domplate.loadRep = function (url, options, successCallback, errorCallback) {
        if (typeof options === "function") {
          errorCallback = successCallback;
          successCallback = options;
          options = {};
        }

        var PINF = exports.domplate.ensureLoader();
        return PINF.sandbox(url + ".rep", function (sandbox) {
          var rep = sandbox.main(exports.domplate, options);
          successCallback(rep);
        }, errorCallback);
      };
    }, {
      "./renderer": 2,
      "./rt": 3,
      "./util": 4,
      "pinf-loader-js/loader.browser": 6
    }],
    2: [function (_require_, module, exports) {
      var Renderer = exports.Renderer = {
        checkDebug: function checkDebug() {},
        renderHTML: function renderHTML(args, outputs, self) {
          var code = [];
          var markupArgs = [code, this.tag.context ? this.tag.context : null, args, outputs];
          markupArgs.push.apply(markupArgs, this.tag.markupArgs);
          this.tag.renderMarkup.apply(self ? self : this.tag.subject, markupArgs);

          if (this.tag.resources && this.tag.subject._resourceListener) {
            this.tag.subject._resourceListener.register(this.tag.resources);
          }

          return code.join("");
        },
        insertRows: function insertRows(args, before, self) {
          this.tag.compile();
          var outputs = [];
          var html = this.renderHTML(args, outputs, self);
          var doc = before.ownerDocument;
          var table = doc.createElement("table");
          table.innerHTML = html;
          var tbody = table.firstChild;
          var parent = before.localName == "TR" ? before.parentNode : before;
          var after = before.localName == "TR" ? before.nextSibling : null;
          var firstRow = tbody.firstChild,
              lastRow;

          while (tbody.firstChild) {
            lastRow = tbody.firstChild;
            if (after) parent.insertBefore(lastRow, after);else parent.appendChild(lastRow);
          }

          var offset = 0;

          if (before.localName == "TR") {
            var node = firstRow.parentNode.firstChild;

            for (; node && node != firstRow; node = node.nextSibling) {
              ++offset;
            }
          }

          var domArgs = [firstRow, this.tag.context, offset];
          domArgs.push.apply(domArgs, this.tag.domArgs);
          domArgs.push.apply(domArgs, outputs);
          this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);
          return [firstRow, lastRow];
        },
        insertAfter: function insertAfter(args, before, self) {
          this.tag.compile();
          var outputs = [];
          var html = this.renderHTML(args, outputs, self);
          var doc = before.ownerDocument;
          var range = doc.createRange();
          range.selectNode(doc.body);
          var frag = range.createContextualFragment(html);
          var root = frag.firstChild;
          if (before.nextSibling) before.parentNode.insertBefore(frag, before.nextSibling);else before.parentNode.appendChild(frag);
          var domArgs = [root, this.tag.context, 0];
          domArgs.push.apply(domArgs, this.tag.domArgs);
          domArgs.push.apply(domArgs, outputs);
          this.tag.renderDOM.apply(self ? self : this.tag.subject ? this.tag.subject : null, domArgs);
          return root;
        },
        replace: function replace(args, parent, self) {
          this.tag.compile();
          var outputs = [];
          var html = this.renderHTML(args, outputs, self);
          var root;

          if (parent.nodeType == 1) {
            parent.innerHTML = html;
            root = parent.firstChild;
          } else {
            if (!parent || parent.nodeType != 9) parent = document;
            if (!womb || womb.ownerDocument != parent) womb = parent.createElement("div");
            womb.innerHTML = html;
            root = womb.firstChild;
          }

          var domArgs = [root, this.tag.context ? this.tag.context : null, 0];
          domArgs.push.apply(domArgs, this.tag.domArgs);
          domArgs.push.apply(domArgs, outputs);
          this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);
          return root;
        },
        append: function append(args, parent, self) {
          this.tag.compile();
          var outputs = [];
          var html = this.renderHTML(args, outputs, self);
          if (!womb || womb.ownerDocument != parent.ownerDocument) womb = parent.ownerDocument.createElement("div");
          womb.innerHTML = html;
          root = womb.firstChild;

          while (womb.firstChild) {
            parent.appendChild(womb.firstChild);
          }

          var domArgs = [root, this.tag.context, 0];
          domArgs.push.apply(domArgs, this.tag.domArgs);
          domArgs.push.apply(domArgs, outputs);
          this.tag.renderDOM.apply(self ? self : this.tag.subject, domArgs);
          return root;
        },
        render: function render(args, self) {
          this.tag.compile();
          var outputs = [];
          var html = this.renderHTML(args, outputs, self);
          return html;
        }
      };
    }, {}],
    3: [function (_require_, module, exports) {
      function _typeof(obj) {
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
          _typeof = function _typeof(obj) {
            return typeof obj;
          };
        } else {
          _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          };
        }

        return _typeof(obj);
      }

      function ArrayIterator(array) {
        var index = -1;

        this.next = function () {
          if (++index >= array.length) throw StopIteration;
          return array[index];
        };
      }

      function StopIteration() {}

      exports.makeMarkupRuntime = function (EVAL, context) {
        var self = context.self;
        var tagName = null;
        Object.keys(self.subject).forEach(function (name) {
          if (self.subject[name].tag === self) {
            tagName = name;
          }
        });

        if (!tagName) {
          throw new Error("Unable to determine 'tagName'!");
        }

        var exports = {};
        exports.compiled = context.compiled && context.compiled[tagName] || null;

        exports.__link__ = function (tag, code, outputs, args) {
          if (!tag) {
            return;
          }

          if (!tag.tag) {
            return;
          }

          if (!exports.compiled && EVAL.onMarkupCode) {
            return;
          }

          tag.tag.compile();

          if (self.resources && tag.tag.resources && tag.tag.resources !== self.resources) {
            for (var key in tag.tag.resources) {
              self.resources[key] = tag.tag.resources[key];
            }
          }

          var tagOutputs = [];
          var markupArgs = [code, tag.tag.context ? tag.tag.context : null, args, tagOutputs];
          markupArgs.push.apply(markupArgs, tag.tag.markupArgs);
          tag.tag.renderMarkup.apply(tag.tag.subject, markupArgs);
          outputs.push(tag);
          outputs.push(tagOutputs);
        };

        exports.__escape__ = function (value) {
          function replaceChars(ch) {
            switch (ch) {
              case "<":
                return "&lt;";

              case ">":
                return "&gt;";

              case "&":
                return "&amp;";

              case "'":
                return "&#39;";

              case '"':
                return "&quot;";
            }

            return "?";
          }

          ;
          return String(value).replace(/[<>&"']/g, replaceChars);
        };

        exports.__loop__ = function (iter, outputs, fn) {
          var iterOuts = [];
          outputs.push(iterOuts);

          if (iter instanceof Array || typeof iter === "array" || Array.isArray(iter)) {
            iter = new ArrayIterator(iter);
          }

          try {
            if (!iter || !iter.next) {
              console.error("Cannot iterate loop", iter, _typeof(iter), outputs, fn);
              throw new Error("Cannot iterate loop as iter.next() method is not defined");
            }

            while (1) {
              var value = iter.next();
              var itemOuts = [0, 0];
              iterOuts.push(itemOuts);
              fn.apply(this, [value, itemOuts]);
            }
          } catch (exc) {
            if (exc != StopIteration) throw exc;
          }
        };

        exports.__if__ = function (booleanVar, outputs, fn) {
          var ifControl = [];
          outputs.push(ifControl);

          if (booleanVar) {
            ifControl.push(1);
            fn.apply(this, [ifControl]);
          } else {
            ifControl.push(0);
          }
        };

        return exports;
      };

      exports.makeDOMRuntime = function (EVAL, context) {
        var self = context.self;
        var tagName = null;
        Object.keys(self.subject).forEach(function (name) {
          if (self.subject[name].tag === self) {
            tagName = name;
          }
        });

        if (!tagName) {
          throw new Error("Unable to determine 'tagName'!");
        }

        var exports = {};
        exports.compiled = context.compiled && context.compiled[tagName] || null;

        exports.__bind__ = function (object, fn) {
          return function (event) {
            return fn.apply(object, [event]);
          };
        };

        exports.__link__ = function (node, tag, args) {
          if (!tag) {
            return 0;
          }

          if (!tag.tag) {
            return 0;
          }

          if (!exports.compiled && EVAL.onMarkupCode) {
            return 0;
          }

          tag.tag.compile();
          var domArgs = [node, tag.tag.context ? tag.tag.context : null, 0];
          domArgs.push.apply(domArgs, tag.tag.domArgs);
          domArgs.push.apply(domArgs, args);
          var oo = tag.tag.renderDOM.apply(tag.tag.subject, domArgs);
          return oo;
        };

        exports.__loop__ = function (iter, fn) {
          if (!Array.isArray(iter)) {
            return 0;
          }

          var nodeCount = 0;

          for (var i = 0; i < iter.length; ++i) {
            iter[i][0] = i;
            iter[i][1] = nodeCount;
            nodeCount += fn.apply(this, iter[i]);
          }

          return nodeCount;
        };

        exports.__if__ = function (control, fn) {
          if (control && control[0]) {
            fn.apply(this, [0, control[1]]);
          } else {}
        };

        exports.__path__ = function (parent, offset) {
          var root = parent;

          for (var i = 2; i < arguments.length; ++i) {
            var index = arguments[i];
            if (i == 3) index += offset;

            if (index == -1) {
              parent = parent.parentNode;
            } else {
              parent = parent.childNodes[index];
            }
          }

          return parent;
        };

        return exports;
      };
    }, {}],
    4: [function (_require_, module, exports) {
      function _typeof(obj) {
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
          _typeof = function _typeof(obj) {
            return typeof obj;
          };
        } else {
          _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          };
        }

        return _typeof(obj);
      }

      var FBTrace = {};
      exports.merge = _require_("deepmerge");

      exports.escapeNewLines = function (value) {
        return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n");
      };

      exports.stripNewLines = function (value) {
        return typeof value == "string" ? value.replace(/[\r\n]/gm, " ") : value;
      };

      exports.escapeJS = function (value) {
        return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n").replace('"', '\\"', "g");
      };

      exports.cropString = function (text, limit, alterText) {
        if (!alterText) alterText = "...";
        text = text + "";
        if (!limit) limit = 50;
        var halfLimit = limit / 2;
        halfLimit -= 2;
        if (text.length > limit) return text.substr(0, halfLimit) + alterText + text.substr(text.length - halfLimit);else return text;
      };

      exports.cropStringLeft = function (text, limit, alterText) {
        if (!alterText) alterText = "...";
        text = text + "";
        if (!limit) limit = 50;
        limit -= alterText.length;
        if (text.length > limit) return alterText + text.substr(text.length - limit);else return text;
      };

      exports.hasClass = function (node, name) {
        if (!node || node.nodeType != 1) return false;else {
          for (var i = 1; i < arguments.length; ++i) {
            var name = arguments[i];
            var re = new RegExp("(^|\\s)" + name + "($|\\s)");
            if (!re.exec(node.getAttribute("class"))) return false;
          }

          return true;
        }
      };

      exports.setClass = function (node, name) {
        if (node && !exports.hasClass(node, name)) node.className += " " + name;
      };

      exports.getClassValue = function (node, name) {
        var re = new RegExp(name + "-([^ ]+)");
        var m = re.exec(node.className);
        return m ? m[1] : "";
      };

      exports.removeClass = function (node, name) {
        if (node && node.className) {
          var index = node.className.indexOf(name);

          if (index >= 0) {
            var size = name.length;
            node.className = node.className.substr(0, index - 1) + node.className.substr(index + size);
          }
        }
      };

      exports.toggleClass = function (elt, name) {
        if (exports.hasClass(elt, name)) exports.removeClass(elt, name);else exports.setClass(elt, name);
      };

      exports.setClassTimed = function (elt, name, context, timeout) {
        if (!timeout) timeout = 1300;
        if (elt.__setClassTimeout) context.clearTimeout(elt.__setClassTimeout);else exports.setClass(elt, name);

        if (!exports.isVisible(elt)) {
          if (elt.__invisibleAtSetPoint) elt.__invisibleAtSetPoint--;else elt.__invisibleAtSetPoint = 5;
        } else {
          delete elt.__invisibleAtSetPoint;
        }

        elt.__setClassTimeout = context.setTimeout(function () {
          delete elt.__setClassTimeout;
          if (elt.__invisibleAtSetPoint) exports.setClassTimed(elt, name, context, timeout);else {
            delete elt.__invisibleAtSetPoint;
            exports.removeClass(elt, name);
          }
        }, timeout);
      };

      exports.cancelClassTimed = function (elt, name, context) {
        if (elt.__setClassTimeout) {
          exports.removeClass(elt, name);
          context.clearTimeout(elt.__setClassTimeout);
          delete elt.__setClassTimeout;
        }
      };

      exports.$ = function (id, doc) {
        if (doc) return doc.getElementById(id);else return document.getElementById(id);
      };

      exports.getChildByClass = function (node) {
        for (var i = 1; i < arguments.length; ++i) {
          var className = arguments[i];
          var child = node.firstChild;
          node = null;

          for (; child; child = child.nextSibling) {
            if (exports.hasClass(child, className)) {
              node = child;
              break;
            }
          }
        }

        return node;
      };

      exports.getAncestorByClass = function (node, className) {
        for (var parent = node; parent; parent = parent.parentNode) {
          if (exports.hasClass(parent, className)) return parent;
        }

        return null;
      };

      exports.getElementByClass = function (node, className) {
        var args = cloneArray(arguments);
        args.splice(0, 1);
        var className = args.join(" ");
        var elements = node.getElementsByClassName(className);
        return elements[0];
      };

      exports.getElementsByClass = function (node, className) {
        var args = cloneArray(arguments);
        args.splice(0, 1);
        var className = args.join(" ");
        return node.getElementsByClassName(className);
      };

      exports.getElementsByAttribute = function (node, attrName, attrValue) {
        function iteratorHelper(node, attrName, attrValue, result) {
          for (var child = node.firstChild; child; child = child.nextSibling) {
            if (child.getAttribute(attrName) == attrValue) result.push(child);
            iteratorHelper(child, attrName, attrValue, result);
          }
        }

        var result = [];
        iteratorHelper(node, attrName, attrValue, result);
        return result;
      };

      exports.isAncestor = function (node, potentialAncestor) {
        for (var parent = node; parent; parent = parent.parentNode) {
          if (parent == potentialAncestor) return true;
        }

        return false;
      };

      exports.getNextElement = function (node) {
        while (node && node.nodeType != 1) {
          node = node.nextSibling;
        }

        return node;
      };

      exports.getPreviousElement = function (node) {
        while (node && node.nodeType != 1) {
          node = node.previousSibling;
        }

        return node;
      };

      exports.getBody = function (doc) {
        if (doc.body) return doc.body;
        var body = doc.getElementsByTagName("body")[0];
        if (body) return body;
        return doc.documentElement;
      };

      exports.findNextDown = function (node, criteria) {
        if (!node) return null;

        for (var child = node.firstChild; child; child = child.nextSibling) {
          if (criteria(child)) return child;
          var next = exports.findNextDown(child, criteria);
          if (next) return next;
        }
      };

      exports.findPreviousUp = function (node, criteria) {
        if (!node) return null;

        for (var child = node.lastChild; child; child = child.previousSibling) {
          var next = exports.findPreviousUp(child, criteria);
          if (next) return next;
          if (criteria(child)) return child;
        }
      };

      exports.findNext = function (node, criteria, upOnly, maxRoot) {
        if (!node) return null;

        if (!upOnly) {
          var next = exports.findNextDown(node, criteria);
          if (next) return next;
        }

        for (var sib = node.nextSibling; sib; sib = sib.nextSibling) {
          if (criteria(sib)) return sib;
          var next = exports.findNextDown(sib, criteria);
          if (next) return next;
        }

        if (node.parentNode && node.parentNode != maxRoot) return exports.findNext(node.parentNode, criteria, true);
      };

      exports.findPrevious = function (node, criteria, downOnly, maxRoot) {
        if (!node) return null;

        for (var sib = node.previousSibling; sib; sib = sib.previousSibling) {
          var prev = exports.findPreviousUp(sib, criteria);
          if (prev) return prev;
          if (criteria(sib)) return sib;
        }

        if (!downOnly) {
          var next = exports.findPreviousUp(node, criteria);
          if (next) return next;
        }

        if (node.parentNode && node.parentNode != maxRoot) {
          if (criteria(node.parentNode)) return node.parentNode;
          return exports.findPrevious(node.parentNode, criteria, true);
        }
      };

      exports.getNextByClass = function (root, state) {
        function iter(node) {
          return node.nodeType == 1 && exports.hasClass(node, state);
        }

        return exports.findNext(root, iter);
      };

      exports.getPreviousByClass = function (root, state) {
        function iter(node) {
          return node.nodeType == 1 && exports.hasClass(node, state);
        }

        return exports.findPrevious(root, iter);
      };

      exports.hasChildElements = function (node) {
        if (node.contentDocument) return true;

        for (var child = node.firstChild; child; child = child.nextSibling) {
          if (child.nodeType == 1) return true;
        }

        return false;
      };

      exports.isElement = function (o) {
        try {
          return o && o instanceof Element;
        } catch (ex) {
          return false;
        }
      };

      exports.isNode = function (o) {
        try {
          return o && o instanceof Node;
        } catch (ex) {
          return false;
        }
      };

      exports.cancelEvent = function (event) {
        event.stopPropagation();
        event.preventDefault();
      };

      exports.isLeftClick = function (event) {
        return event.button == 0 && exports.noKeyModifiers(event);
      };

      exports.isMiddleClick = function (event) {
        return event.button == 1 && exports.noKeyModifiers(event);
      };

      exports.isRightClick = function (event) {
        return event.button == 2 && exports.noKeyModifiers(event);
      };

      exports.noKeyModifiers = function (event) {
        return !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
      };

      exports.isControlClick = function (event) {
        return event.button == 0 && exports.isControl(event);
      };

      exports.isShiftClick = function (event) {
        return event.button == 0 && exports.isShift(event);
      };

      exports.isControl = function (event) {
        return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey;
      };

      exports.isControlShift = function (event) {
        return (event.metaKey || event.ctrlKey) && event.shiftKey && !event.altKey;
      };

      exports.isShift = function (event) {
        return event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey;
      };

      exports.bind = function () {
        var args = cloneArray(arguments),
            fn = args.shift(),
            object = args.shift();
        return function () {
          return fn.apply(object, arrayInsert(cloneArray(args), 0, arguments));
        };
      };

      exports.bindFixed = function () {
        var args = cloneArray(arguments),
            fn = args.shift(),
            object = args.shift();
        return function () {
          return fn.apply(object, args);
        };
      };

      exports.extend = function (l, r) {
        var newOb = {};

        for (var n in l) {
          newOb[n] = l[n];
        }

        for (var n in r) {
          newOb[n] = r[n];
        }

        return newOb;
      };

      exports.keys = function (map) {
        var keys = [];

        try {
          for (var name in map) {
            keys.push(name);
          }
        } catch (exc) {}

        return keys;
      };

      exports.values = function (map) {
        var values = [];

        try {
          for (var name in map) {
            try {
              values.push(map[name]);
            } catch (exc) {
              if (FBTrace.DBG_ERRORS) FBTrace.dumpPropreties("lib.values FAILED ", exc);
            }
          }
        } catch (exc) {
          if (FBTrace.DBG_ERRORS) FBTrace.dumpPropreties("lib.values FAILED ", exc);
        }

        return values;
      };

      exports.remove = function (list, item) {
        for (var i = 0; i < list.length; ++i) {
          if (list[i] == item) {
            list.splice(i, 1);
            break;
          }
        }
      };

      exports.sliceArray = function (array, index) {
        var slice = [];

        for (var i = index; i < array.length; ++i) {
          slice.push(array[i]);
        }

        return slice;
      };

      function cloneArray(array, fn) {
        var newArray = [];
        if (fn) for (var i = 0; i < array.length; ++i) {
          newArray.push(fn(array[i]));
        } else for (var i = 0; i < array.length; ++i) {
          newArray.push(array[i]);
        }
        return newArray;
      }

      function extendArray(array, array2) {
        var newArray = [];
        newArray.push.apply(newArray, array);
        newArray.push.apply(newArray, array2);
        return newArray;
      }

      exports.extendArray = extendArray;
      exports.cloneArray = cloneArray;

      function arrayInsert(array, index, other) {
        for (var i = 0; i < other.length; ++i) {
          array.splice(i + index, 0, other[i]);
        }

        return array;
      }

      exports.arrayInsert = arrayInsert;

      exports.isArrayLike = function (object) {
        return Object.prototype.toString.call(object) == "[object Array]" || exports.isArguments(object);
      };

      exports.isArguments = function (object) {
        if (Object.prototype.toString.call(object) == "[object Arguments]") return true;
        if (!_typeof(object) == "object" || !Object.prototype.hasOwnProperty.call(object, 'callee') || !object.callee || Object.prototype.toString.call(object.callee) !== '[object Function]' || typeof object.length != 'number') return false;

        for (var name in object) {
          if (name === 'callee' || name === 'length') return false;
        }

        return true;
      };
    }, {
      "deepmerge": 5
    }],
    5: [function (_require_, module, exports) {
      (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.deepmerge = factory();
      })(this, function () {
        'use strict';

        var isMergeableObject = function isMergeableObject(value) {
          return isNonNullObject(value) && !isSpecial(value);
        };

        function isNonNullObject(value) {
          return !!value && typeof value === 'object';
        }

        function isSpecial(value) {
          var stringValue = Object.prototype.toString.call(value);
          return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
        }

        var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
        var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

        function isReactElement(value) {
          return value.$$typeof === REACT_ELEMENT_TYPE;
        }

        function emptyTarget(val) {
          return Array.isArray(val) ? [] : {};
        }

        function cloneUnlessOtherwiseSpecified(value, options) {
          return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
        }

        function defaultArrayMerge(target, source, options) {
          return target.concat(source).map(function (element) {
            return cloneUnlessOtherwiseSpecified(element, options);
          });
        }

        function mergeObject(target, source, options) {
          var destination = {};

          if (options.isMergeableObject(target)) {
            Object.keys(target).forEach(function (key) {
              destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
            });
          }

          Object.keys(source).forEach(function (key) {
            if (!options.isMergeableObject(source[key]) || !target[key]) {
              destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
            } else {
              destination[key] = deepmerge(target[key], source[key], options);
            }
          });
          return destination;
        }

        function deepmerge(target, source, options) {
          options = options || {};
          options.arrayMerge = options.arrayMerge || defaultArrayMerge;
          options.isMergeableObject = options.isMergeableObject || isMergeableObject;
          var sourceIsArray = Array.isArray(source);
          var targetIsArray = Array.isArray(target);
          var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

          if (!sourceAndTargetTypesMatch) {
            return cloneUnlessOtherwiseSpecified(source, options);
          } else if (sourceIsArray) {
            return options.arrayMerge(target, source, options);
          } else {
            return mergeObject(target, source, options);
          }
        }

        deepmerge.all = function deepmergeAll(array, options) {
          if (!Array.isArray(array)) {
            throw new Error('first argument should be an array');
          }

          return array.reduce(function (prev, next) {
            return deepmerge(prev, next, options);
          }, {});
        };

        var deepmerge_1 = deepmerge;
        return deepmerge_1;
      });
    }, {}],
    6: [function (_require_, module, exports) {
      exports.PINF = function (global) {
        if (!global || typeof global !== "object") {
          throw new Error("No root object scope provided!");
        }

        if (typeof global.PINF !== "undefined") {
          return global.PINF;
        }

        var LOADER = _require_('./loader');

        var PINF = LOADER.Loader({
          document: global.document
        });
        global.PINF = PINF;

        if (typeof global.addEventListener === "function") {
          global.addEventListener("message", function (event) {
            var m = null;

            if (typeof event.data === "string" && (m = event.data.match(/^notify:\/\/pinf-loader-js\/sandbox\/load\?uri=(.+)$/)) && (m = decodeURIComponent(m[1])) && /^\/[^\/]/.test(m)) {
              return PINF.sandbox(m, function (sandbox) {
                sandbox.main();

                if (typeof global.postMessage === "function") {
                  global.postMessage(event.data.replace("/load?", "/loaded?"));
                }
              }, function (err) {
                throw err;
              });
            }
          }, false);
        }

        return global.PINF;
      }(typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : null);
    }, {
      "./loader": 7
    }],
    7: [function (_require_, module, exports) {
      (function (exports) {
        var Loader = function (global) {
          var loadedBundles = [],
              readyStates = {
            'loaded': 1,
            'interactive': 1,
            'complete': 1
          },
              lastModule = null,
              headTag = null;

          function keys(obj) {
            var keys = [];

            for (var key in obj) {
              keys.push(key);
            }

            return keys;
          }

          function create(proto) {
            function F() {}

            F.prototype = proto;
            return new F();
          }

          ;

          function normalizeSandboxArguments(implementation) {
            return function (programIdentifier, options, loadedCallback, errorCallback) {
              if (typeof options === "function" && typeof loadedCallback === "object") {
                throw new Error("Callback before options for `require.sandbox(programIdentifier, options, loadedCallback)`");
              }

              if (typeof options === "function" && !loadedCallback && !errorCallback) {
                loadedCallback = options;
                options = {};
              } else if (typeof options === "function" && typeof loadedCallback === "function" && !errorCallback) {
                errorCallback = loadedCallback;
                loadedCallback = options;
                options = {};
              } else {
                options = options || {};
              }

              implementation(programIdentifier, options, loadedCallback, errorCallback);
            };
          }

          function loadInBrowser(uri, loadedCallback, sandboxOptions) {
            try {
              if (typeof importScripts !== "undefined") {
                importScripts(uri.replace(/^\/?\{host\}/, ""));
                return loadedCallback(null);
              }

              var document = global.document;

              if (!document) {
                throw new Error("Unable to get reference to 'document'!");
              }

              var location = document.location;

              if (/^\/?\{host\}\//.test(uri)) {
                uri = location.protocol + "//" + location.host + uri.replace(/^\/?\{host\}/, "");
              } else if (/^\/\//.test(uri)) {
                uri = location.protocol + uri;
              }

              if (!headTag) {
                headTag = document.getElementsByTagName("head")[0];
              }

              var element = document.createElement("script");
              element.type = "text/javascript";

              element.onload = element.onreadystatechange = function (ev) {
                ev = ev || global.event;

                if (ev.type === "load" || readyStates[this.readyState]) {
                  this.onload = this.onreadystatechange = this.onerror = null;
                  loadedCallback(null, function () {
                    if (!sandboxOptions || sandboxOptions.keepScriptTags !== true) {
                      element.parentNode.removeChild(element);
                    }
                  });
                }
              };

              element.onerror = function (err) {
                console.error(err);
                return loadedCallback(new Error("Error loading '" + uri + "'"));
              };

              element.charset = "utf-8";
              element.async = true;
              element.src = uri;
              element = headTag.insertBefore(element, headTag.firstChild);
            } catch (err) {
              loadedCallback(err);
            }
          }

          var Sandbox = function (sandboxIdentifier, sandboxOptions, loadedCallback) {
            var moduleInitializers = {},
                initializedModules = {},
                bundleIdentifiers = {},
                packages = {},
                loadingBundles = {};
            var sandbox = {
              id: sandboxIdentifier
            };

            function logDebug() {
              if (sandboxOptions.debug !== true) return;

              if (arguments.length === 1) {
                console.log(arguments[0]);
              } else if (arguments.length === 2) {
                  console.log(arguments[0], arguments[1]);
                } else if (arguments.length === 3) {
                    console.log(arguments[0], arguments[1], arguments[2]);
                  } else if (arguments.length === 4) {
                      console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
                    }
            }

            function rebaseUri(uri) {
              if (!sandboxOptions.baseUrl) {
                return uri;
              }

              return sandboxOptions.baseUrl + "/" + uri;
            }

            function load(bundleIdentifier, packageIdentifier, bundleSubPath, loadedCallback) {
              var loadSandboxIdentifier = sandboxIdentifier;
              var finalBundleIdentifier = null;
              var moduleIdentifierPrefix = "";
              var finalPackageIdentifier = "";

              try {
                if (packageIdentifier !== "") {
                  if (/^@bundle:/.test(packageIdentifier)) {
                    var absPackageIdentifier = packageIdentifier;

                    if (/^@bundle:\./.test(absPackageIdentifier)) {
                      absPackageIdentifier = absPackageIdentifier.replace(/^(@bundle:)\./, "$1" + sandboxIdentifier + "/.");
                    }

                    moduleIdentifierPrefix = packageIdentifier;
                    finalPackageIdentifier = packageIdentifier;
                    bundleIdentifier = absPackageIdentifier.replace(/^@bundle:/, "") + ".js";
                    loadSandboxIdentifier = "";
                    finalBundleIdentifier = "@bundle:" + packageIdentifier.replace(/^@bundle:/, "") + ".js";
                  } else {
                    bundleIdentifier = ("/" + packageIdentifier + "/" + bundleIdentifier).replace(/\/+/g, "/");
                  }
                }

                if (initializedModules[bundleIdentifier]) {
                  loadedCallback(null, sandbox);
                } else {
                  if (loadingBundles[bundleIdentifier]) {
                    loadingBundles[bundleIdentifier].push(loadedCallback);
                  } else {
                    loadingBundles[bundleIdentifier] = [];
                    bundleIdentifier = (loadSandboxIdentifier + bundleSubPath + bundleIdentifier).replace(/\/$/, ".js");
                    bundleIdentifier = bundleIdentifier.replace(/\.php\.js$/, ".php");

                    if (!finalBundleIdentifier) {
                      finalBundleIdentifier = bundleIdentifier;
                    }

                    (sandboxOptions.rootBundleLoader || sandboxOptions.load || loadInBrowser)(rebaseUri(bundleIdentifier), function (err, cleanupCallback) {
                      if (err) return loadedCallback(err);
                      delete sandboxOptions.rootBundleLoader;
                      finalizeLoad(moduleIdentifierPrefix, finalBundleIdentifier, finalPackageIdentifier, function () {
                        loadedCallback(null, sandbox);

                        if (cleanupCallback) {
                          cleanupCallback();
                        }
                      });
                    }, sandboxOptions);
                  }
                }
              } catch (err) {
                loadedCallback(err);
              }
            }

            function finalizeLoad(moduleIdentifierPrefix, bundleIdentifier, packageIdentifier, loadFinalized) {
              var pending = 0;

              function finalize() {
                if (pending !== 0) {
                  return;
                }

                if (loadFinalized) loadFinalized();
              }

              pending += 1;

              if (!loadedBundles[0]) {
                throw new Error("No bundle memoized for '" + bundleIdentifier + "'! Check the file to ensure it contains JavaScript and that a bundle is memoized against the correct loader instance.");
              }

              bundleIdentifiers[bundleIdentifier] = loadedBundles[0][0];
              var loadedModuleInitializers = loadedBundles[0][1]({
                id: sandboxIdentifier
              });
              var key;

              for (key in loadedModuleInitializers) {
                var memoizeKey = moduleIdentifierPrefix + key;

                if (/^[^\/]*\/package.json$/.test(key)) {
                  if (sandboxOptions.rewritePackageDescriptor) {
                    loadedModuleInitializers[key][0] = sandboxOptions.rewritePackageDescriptor(loadedModuleInitializers[key][0], memoizeKey);
                  }

                  if (loadedModuleInitializers[key][0].mappings) {
                    for (var alias in loadedModuleInitializers[key][0].mappings) {
                      if (/^@script:\/\//.test(loadedModuleInitializers[key][0].mappings[alias])) {
                        pending += 1;
                        loadInBrowser(rebaseUri(loadedModuleInitializers[key][0].mappings[alias].replace(/^@script:/, "")), function () {
                          pending -= 1;
                          finalize();
                        }, sandboxOptions);
                      }
                    }
                  }

                  if (moduleInitializers[memoizeKey]) {
                    moduleInitializers[memoizeKey][0] = bundleIdentifier;

                    if (typeof moduleInitializers[memoizeKey][1].main === "undefined") {
                      moduleInitializers[memoizeKey][1].main = loadedModuleInitializers[key][0].main;
                    }

                    if (loadedModuleInitializers[key][0].mappings) {
                      if (!moduleInitializers[memoizeKey][1].mappings) {
                        moduleInitializers[memoizeKey][1].mappings = {};
                      }

                      for (var alias in loadedModuleInitializers[key][0].mappings) {
                        if (typeof moduleInitializers[memoizeKey][1].mappings[alias] === "undefined") {
                          moduleInitializers[memoizeKey][1].mappings[alias] = loadedModuleInitializers[key][0].mappings[alias];
                        }
                      }
                    }
                  } else {
                    moduleInitializers[memoizeKey] = [bundleIdentifier, loadedModuleInitializers[key][0], loadedModuleInitializers[key][1]];
                  }

                  var packageIdentifier = packageIdentifier || key.split("/").shift();

                  if (packages[packageIdentifier]) {
                    packages[packageIdentifier].init();
                  }
                }

                if (typeof moduleInitializers[memoizeKey] === "undefined") {
                  moduleInitializers[memoizeKey] = [bundleIdentifier, loadedModuleInitializers[key][0], loadedModuleInitializers[key][1]];
                }
              }

              loadedBundles.shift();
              pending -= 1;
              finalize();
              return;
            }

            var Package = function (packageIdentifier) {
              if (packages[packageIdentifier]) {
                return packages[packageIdentifier];
              }

              var pkg = {
                id: packageIdentifier,
                descriptor: {},
                main: "/main.js",
                mappings: {},
                directories: {},
                libPath: ""
              };
              var parentModule = lastModule;

              pkg.init = function () {
                var descriptor = moduleInitializers[packageIdentifier + "/package.json"] && moduleInitializers[packageIdentifier + "/package.json"][1] || {};

                if (descriptor) {
                  pkg.descriptor = descriptor;

                  if (typeof descriptor.main === "string") {
                    pkg.main = descriptor.main;
                  }

                  pkg.mappings = descriptor.mappings || pkg.mappings;
                  pkg.directories = descriptor.directories || pkg.directories;
                  pkg.libPath = typeof pkg.directories.lib !== "undefined" && pkg.directories.lib != "" ? pkg.directories.lib + "/" : pkg.libPath;
                }
              };

              pkg.init();

              function normalizeIdentifier(identifier) {
                if (identifier.split("/").pop().indexOf(".") === -1) {
                  identifier = identifier + ".js";
                } else if (!/^\//.test(identifier)) {
                  identifier = "/" + identifier;
                }

                return identifier;
              }

              var Module = function (moduleIdentifier, parentModule) {
                var moduleIdentifierSegment = null;

                if (/^@bundle:/.test(moduleIdentifier)) {
                  moduleIdentifierSegment = moduleIdentifier.replace(packageIdentifier, "").replace(/\/[^\/]*$/, "").split("/");
                } else {
                  moduleIdentifierSegment = moduleIdentifier.replace(/\/[^\/]*$/, "").split("/");
                }

                var module = {
                  id: moduleIdentifier,
                  exports: {},
                  parentModule: parentModule,
                  bundle: null,
                  pkg: packageIdentifier
                };

                function resolveIdentifier(identifier) {
                  if (/\/$/.test(identifier)) {
                    identifier += "index";
                  }

                  lastModule = module;
                  var plugin = null;

                  if (/^[^!]*!/.test(identifier)) {
                    var m = identifier.match(/^([^!]*)!(.+)$/);
                    identifier = m[2];
                    plugin = m[1];
                  }

                  function pluginify(id) {
                    if (!plugin) return id;
                    id = new String(id);
                    id.plugin = plugin;
                    return id;
                  }

                  if (/^\./.test(identifier)) {
                    var segments = identifier.replace(/^\.\//, "").split("../");
                    identifier = "/" + moduleIdentifierSegment.slice(1, moduleIdentifierSegment.length - segments.length + 1).concat(segments[segments.length - 1]).join("/");

                    if (identifier === "/.") {
                      return [pkg, pluginify("")];
                    }

                    return [pkg, pluginify(normalizeIdentifier(identifier.replace(/\/\.$/, "/")))];
                  }

                  var splitIdentifier = identifier.split("/");

                  if (typeof pkg.mappings[splitIdentifier[0]] !== "undefined") {
                    return [Package(pkg.mappings[splitIdentifier[0]]), pluginify(splitIdentifier.length > 1 ? normalizeIdentifier(splitIdentifier.slice(1).join("/")) : "")];
                  }

                  if (!moduleInitializers["/" + normalizeIdentifier(identifier)]) {
                    throw new Error("Descriptor for package '" + pkg.id + "' in sandbox '" + sandbox.id + "' does not declare 'mappings[\"" + splitIdentifier[0] + "\"]' property nor does sandbox have module memoized at '" + "/" + normalizeIdentifier(identifier) + "' needed to satisfy module path '" + identifier + "' in module '" + moduleIdentifier + "'!");
                  }

                  return [Package(""), pluginify("/" + normalizeIdentifier(identifier))];
                }

                module.require = function (identifier) {
                  identifier = resolveIdentifier(identifier);
                  return identifier[0].require(identifier[1]).exports;
                };

                module.require.supports = ["ucjs-pinf-0"];

                module.require.id = function (identifier) {
                  identifier = resolveIdentifier(identifier);
                  return identifier[0].require.id(identifier[1]);
                };

                module.require.async = function (identifier, loadedCallback, errorCallback) {
                  identifier = resolveIdentifier(identifier);
                  var mi = moduleIdentifier;

                  if (/^\//.test(identifier[0].id)) {
                    mi = "/main.js";
                  }

                  identifier[0].load(identifier[1], module.bundle, function (err, moduleAPI) {
                    if (err) {
                      if (errorCallback) return errorCallback(err);
                      throw err;
                    }

                    loadedCallback(moduleAPI);
                  });
                };

                module.require.sandbox = normalizeSandboxArguments(function (programIdentifier, options, loadedCallback, errorCallback) {
                  options.load = options.load || sandboxOptions.load;

                  if (/^\./.test(programIdentifier)) {
                    programIdentifier = sandboxIdentifier + "/" + programIdentifier;
                    programIdentifier = programIdentifier.replace(/\/\.\//g, "/");
                  }

                  return PINF.sandbox(programIdentifier, options, loadedCallback, errorCallback);
                });
                module.require.sandbox.id = sandboxIdentifier;

                module.load = function () {
                  module.bundle = moduleInitializers[moduleIdentifier][0];

                  if (typeof moduleInitializers[moduleIdentifier][1] === "function") {
                    var moduleInterface = {
                      id: module.id,
                      filename: moduleInitializers[moduleIdentifier][2].filename || (module.bundle.replace(/\.js$/, "") + "/" + module.id).replace(/\/+/g, "/"),
                      exports: {}
                    };

                    if (packageIdentifier === "" && pkg.main === moduleIdentifier) {
                      module.require.main = moduleInterface;
                    }

                    if (sandboxOptions.onInitModule) {
                      sandboxOptions.onInitModule(moduleInterface, module, pkg, sandbox, {
                        normalizeIdentifier: normalizeIdentifier,
                        resolveIdentifier: resolveIdentifier,
                        finalizeLoad: finalizeLoad,
                        moduleInitializers: moduleInitializers,
                        initializedModules: initializedModules
                      });
                    }

                    var exports = moduleInitializers[moduleIdentifier][1].call(exports, module.require, module.exports, moduleInterface);

                    if (typeof moduleInterface.exports !== "undefined" && (typeof moduleInterface.exports !== "object" || keys(moduleInterface.exports).length !== 0)) {
                      module.exports = moduleInterface.exports;
                    } else if (typeof exports !== "undefined") {
                      module.exports = exports;
                    }
                  } else if (typeof moduleInitializers[moduleIdentifier][1] === "string") {
                    module.exports = decodeURIComponent(moduleInitializers[moduleIdentifier][1]);
                  } else {
                    module.exports = moduleInitializers[moduleIdentifier][1];
                  }
                };

                module.getReport = function () {
                  var exportsCount = 0,
                      key;

                  for (key in module.exports) {
                    exportsCount++;
                  }

                  return {
                    exports: exportsCount
                  };
                };

                return module;
              };

              pkg.load = function (moduleIdentifier, bundleIdentifier, loadedCallback) {
                if (moduleInitializers[packageIdentifier + (moduleIdentifier || pkg.main)]) {
                  return loadedCallback(null, pkg.require(moduleIdentifier).exports);
                }

                var bundleSubPath = bundleIdentifier.substring(sandboxIdentifier.length);
                load((!/^\//.test(moduleIdentifier) ? "/" + pkg.libPath : "") + moduleIdentifier, packageIdentifier, bundleSubPath.replace(/\.js$/g, ""), function (err) {
                  if (err) return loadedCallback(err);
                  loadedCallback(null, pkg.require(moduleIdentifier).exports);
                });
              };

              pkg.require = function (moduleIdentifier) {
                var plugin = moduleIdentifier.plugin;

                if (moduleIdentifier) {
                  if (!/^\//.test(moduleIdentifier)) {
                    moduleIdentifier = ("/" + (moduleIdentifier.substring(0, pkg.libPath.length) === pkg.libPath ? "" : pkg.libPath)).replace(/\/\.\//, "/") + moduleIdentifier;
                  }

                  moduleIdentifier = packageIdentifier + moduleIdentifier;
                } else {
                  moduleIdentifier = packageIdentifier + pkg.main;
                }

                if (!moduleInitializers[moduleIdentifier] && moduleInitializers[moduleIdentifier.replace(/\.js$/, "/index.js")]) {
                  moduleIdentifier = moduleIdentifier.replace(/\.js$/, "/index.js");
                }

                if (plugin && moduleInitializers[moduleIdentifier + ":" + plugin]) {
                  moduleIdentifier += ":" + plugin;
                }

                if (!initializedModules[moduleIdentifier]) {
                  if (!moduleInitializers[moduleIdentifier]) {
                    console.error("[pinf-loader-js]", "moduleInitializers", moduleInitializers);
                    throw new Error("Module '" + moduleIdentifier + "' " + (plugin ? "for format '" + plugin + "' " : "") + "not found in sandbox '" + sandbox.id + "'!");
                  }

                  (initializedModules[moduleIdentifier] = Module(moduleIdentifier, lastModule)).load();
                }

                var loadingBundlesCallbacks;

                if (loadingBundles[moduleIdentifier]) {
                  loadingBundlesCallbacks = loadingBundles[moduleIdentifier];
                  delete loadingBundles[moduleIdentifier];

                  for (var i = 0; i < loadingBundlesCallbacks.length; i++) {
                    loadingBundlesCallbacks[i](null, sandbox);
                  }
                }

                var moduleInfo = create(initializedModules[moduleIdentifier]);

                if (plugin === "i18n") {
                  moduleInfo.exports = moduleInfo.exports.root;
                }

                return moduleInfo;
              };

              pkg.require.id = function (moduleIdentifier) {
                if (!/^\//.test(moduleIdentifier)) {
                  moduleIdentifier = "/" + pkg.libPath + moduleIdentifier;
                }

                return ((packageIdentifier !== "" ? "/" + packageIdentifier + "/" : "") + moduleIdentifier).replace(/\/+/g, "/");
              };

              pkg.getReport = function () {
                return {
                  main: pkg.main,
                  mappings: pkg.mappings,
                  directories: pkg.directories,
                  libPath: pkg.libPath
                };
              };

              if (sandboxOptions.onInitPackage) {
                sandboxOptions.onInitPackage(pkg, sandbox, {
                  normalizeIdentifier: normalizeIdentifier,
                  finalizeLoad: finalizeLoad,
                  moduleInitializers: moduleInitializers,
                  initializedModules: initializedModules
                });
              }

              packages[packageIdentifier] = pkg;
              return pkg;
            };

            sandbox.require = function (moduleIdentifier) {
              return Package("").require(moduleIdentifier).exports;
            };

            sandbox.boot = function () {
              if (typeof Package("").main !== "string") {
                throw new Error("No 'main' property declared in '/package.json' in sandbox '" + sandbox.id + "'!");
              }

              return sandbox.require(Package("").main);
            };

            sandbox.main = function () {
              var exports = sandbox.boot();
              return exports.main ? exports.main.apply(null, arguments) : exports;
            };

            sandbox.getReport = function () {
              var report = {
                bundles: {},
                packages: {},
                modules: {}
              },
                  key;

              for (key in bundleIdentifiers) {
                report.bundles[key] = bundleIdentifiers[key];
              }

              for (key in packages) {
                report.packages[key] = packages[key].getReport();
              }

              for (key in moduleInitializers) {
                if (initializedModules[key]) {
                  report.modules[key] = initializedModules[key].getReport();
                } else {
                  report.modules[key] = {};
                }
              }

              return report;
            };

            sandbox.reset = function () {
              moduleInitializers = {};
              initializedModules = {};
              bundleIdentifiers = {};
              packages = {};
              loadingBundles = {};
            };

            load(sandboxIdentifier.indexOf("?") === -1 ? ".js" : "", "", "", loadedCallback);
            return sandbox;
          };

          var bundleIdentifiers = {},
              sandboxes = {};

          var Require = function (bundle) {
            var self = this;

            var bundleHandler = function (uid, callback) {
              if (uid && bundleIdentifiers[uid]) {
                throw new Error("You cannot split require.bundle(UID) calls where UID is constant!");
              }

              bundleIdentifiers[uid] = true;
              loadedBundles.push([uid, function (sandbox) {
                var moduleInitializers = {},
                    req = new Require(uid);
                delete req.bundle;
                req.sandbox = sandbox;

                req.memoize = function (moduleIdentifier, moduleInitializer, moduleMeta) {
                  moduleInitializers[moduleIdentifier + (moduleMeta && moduleMeta.variation ? ":" + moduleMeta.variation : "")] = [moduleInitializer, moduleMeta || {}];
                };

                callback(req, global || null);
                return moduleInitializers;
              }]);
            };

            var activeBundleHandler = bundleHandler;

            this.bundle = function () {
              return activeBundleHandler.apply(null, arguments);
            };

            this.setActiveBundleHandler = function (handler) {
              var oldHandler = activeBundleHandler;
              activeBundleHandler = handler;
              return oldHandler;
            };
          };

          var PINF = new Require();
          PINF.supports = ["ucjs-pinf-0"];
          PINF.sandbox = normalizeSandboxArguments(function (programIdentifier, options, loadedCallback, errorCallback) {
            if (typeof programIdentifier === "function") {
              options = options || {};
              var bundle = programIdentifier;
              var fallbackLoad = options.load || loadInBrowser;

              options.load = function (uri, loadedCallback) {
                if (uri === programIdentifier + ".js") {
                  PINF.bundle("", bundle);
                  loadedCallback(null);
                  return;
                }

                return fallbackLoad(uri, loadedCallback, options);
              };

              programIdentifier = bundle.uri || "#pinf:" + Math.random().toString(36).substr(2, 9);
            }

            var sandboxIdentifier = programIdentifier.replace(/\.js$/, "");
            return sandboxes[sandboxIdentifier] = Sandbox(sandboxIdentifier, options, function (err, sandbox) {
              if (err) {
                if (errorCallback) return errorCallback(err);
                throw err;
              }

              loadedCallback(sandbox);
            });
          });
          PINF.Loader = Loader;

          PINF.getReport = function () {
            var report = {
              sandboxes: {}
            };

            for (var key in sandboxes) {
              report.sandboxes[key] = sandboxes[key].getReport();
            }

            return report;
          };

          PINF.reset = function () {
            for (var key in sandboxes) {
              sandboxes[key].reset();
            }

            sandboxes = {};
            bundleIdentifiers = {};
            loadedBundles = [];
          };

          return PINF;
        };

        if (exports) exports.Loader = Loader;
      })(typeof exports !== "undefined" ? exports : null);
    }, {}]
  }, {}, [1])(1);
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (process){
"use strict";

;
!function (undefined) {
  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};

    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;
      conf.delimiter && (this.delimiter = conf.delimiter);
      this._maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' + 'leak detected. ' + count + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.';

    if (this.verboseMemoryLeak) {
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if (typeof process !== 'undefined' && process.emitWarning) {
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace) {
        console.trace();
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }

  EventEmitter.EventEmitter2 = EventEmitter;

  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }

    var listeners = [],
        leaf,
        len,
        branch,
        xTree,
        xxTree,
        isolatedBranch,
        endReached,
        typeLength = type.length,
        currentType = type[i],
        nextType = type[i + 1];

    if (i === typeLength && tree._listeners) {
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }

        return [tree];
      }
    }

    if (currentType === '*' || currentType === '**' || tree[currentType]) {
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 1));
          }
        }

        return listeners;
      } else if (currentType === '**') {
        endReached = i + 1 === typeLength || i + 2 === typeLength && nextType === '*';

        if (endReached && tree._listeners) {
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if (branch === '*' || branch === '**') {
              if (tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }

              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if (branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 2));
            } else {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }

        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i + 1));
    }

    xTree = tree['*'];

    if (xTree) {
      searchListenerTree(handlers, type, xTree, i + 1);
    }

    xxTree = tree['**'];

    if (xxTree) {
      if (i < typeLength) {
        if (xxTree._listeners) {
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        for (branch in xxTree) {
          if (branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if (branch === nextType) {
              searchListenerTree(handlers, type, xxTree[branch], i + 2);
            } else if (branch === currentType) {
              searchListenerTree(handlers, type, xxTree[branch], i + 1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, {
                '**': isolatedBranch
              }, i + 1);
            }
          }
        }
      } else if (xxTree._listeners) {
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if (xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {
    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    for (var i = 0, len = type.length; i + 1 < len; i++) {
      if (type[i] === '**' && type[i + 1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {
      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {
        if (!tree._listeners) {
          tree._listeners = listener;
        } else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (!tree._listeners.warned && this._maxListeners > 0 && tree._listeners.length > this._maxListeners) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }

        return true;
      }

      name = type.shift();
    }

    return true;
  }

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function (n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function (event, fn) {
    return this._once(event, fn, false);
  };

  EventEmitter.prototype.prependOnceListener = function (event, fn) {
    return this._once(event, fn, true);
  };

  EventEmitter.prototype._once = function (event, fn, prepend) {
    this._many(event, 1, fn, prepend);

    return this;
  };

  EventEmitter.prototype.many = function (event, ttl, fn) {
    return this._many(event, ttl, fn, false);
  };

  EventEmitter.prototype.prependMany = function (event, ttl, fn) {
    return this._many(event, ttl, fn, true);
  };

  EventEmitter.prototype._many = function (event, ttl, fn, prepend) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }

      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    this._on(event, listener, prepend);

    return self;
  };

  EventEmitter.prototype.emit = function () {
    this._events || init.call(this);
    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args, l, i, j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();

      if (al > 3) {
        args = new Array(al);

        for (j = 0; j < al; j++) {
          args[j] = arguments[j];
        }
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;

        switch (al) {
          case 1:
            handler[i].call(this, type);
            break;

          case 2:
            handler[i].call(this, type, arguments[1]);
            break;

          case 3:
            handler[i].call(this, type, arguments[1], arguments[2]);
            break;

          default:
            handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];

      if (typeof handler === 'function') {
        this.event = type;

        switch (al) {
          case 1:
            handler.call(this);
            break;

          case 2:
            handler.call(this, arguments[1]);
            break;

          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;

          default:
            args = new Array(al - 1);

            for (j = 1; j < al; j++) {
              args[j - 1] = arguments[j];
            }

            handler.apply(this, args);
        }

        return true;
      } else if (handler) {
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);

        for (j = 1; j < al; j++) {
          args[j - 1] = arguments[j];
        }
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;

        switch (al) {
          case 1:
            handler[i].call(this);
            break;

          case 2:
            handler[i].call(this, arguments[1]);
            break;

          case 3:
            handler[i].call(this, arguments[1], arguments[2]);
            break;

          default:
            handler[i].apply(this, args);
        }
      }

      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1];
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }

      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function () {
    this._events || init.call(this);
    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return Promise.resolve([false]);
      }
    }

    var promises = [];
    var al = arguments.length;
    var args, l, i, j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);

        for (j = 1; j < al; j++) {
          args[j] = arguments[j];
        }
      }

      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;

        switch (al) {
          case 1:
            promises.push(this._all[i].call(this, type));
            break;

          case 2:
            promises.push(this._all[i].call(this, type, arguments[1]));
            break;

          case 3:
            promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
            break;

          default:
            promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;

      switch (al) {
        case 1:
          promises.push(handler.call(this));
          break;

        case 2:
          promises.push(handler.call(this, arguments[1]));
          break;

        case 3:
          promises.push(handler.call(this, arguments[1], arguments[2]));
          break;

        default:
          args = new Array(al - 1);

          for (j = 1; j < al; j++) {
            args[j - 1] = arguments[j];
          }

          promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();

      if (al > 3) {
        args = new Array(al - 1);

        for (j = 1; j < al; j++) {
          args[j - 1] = arguments[j];
        }
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;

        switch (al) {
          case 1:
            promises.push(handler[i].call(this));
            break;

          case 2:
            promises.push(handler[i].call(this, arguments[1]));
            break;

          case 3:
            promises.push(handler[i].call(this, arguments[1], arguments[2]));
            break;

          default:
            promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]);
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function (type, listener) {
    return this._on(type, listener, false);
  };

  EventEmitter.prototype.prependListener = function (type, listener) {
    return this._on(type, listener, true);
  };

  EventEmitter.prototype.onAny = function (fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function (fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function (fn, prepend) {
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    if (prepend) {
      this._all.unshift(fn);
    } else {
      this._all.push(fn);
    }

    return this;
  };

  EventEmitter.prototype._on = function (type, listener, prepend) {
    if (typeof type === 'function') {
      this._onAny(type, listener);

      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }

    this._events || init.call(this);
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      this._events[type] = listener;
    } else {
      if (typeof this._events[type] === 'function') {
        this._events[type] = [this._events[type]];
      }

      if (prepend) {
        this._events[type].unshift(listener);
      } else {
        this._events[type].push(listener);
      }

      if (!this._events[type].warned && this._maxListeners > 0 && this._events[type].length > this._maxListeners) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  };

  EventEmitter.prototype.off = function (type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,
        leafs = [];

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    } else {
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({
        _listeners: handlers
      });
    }

    for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;

      if (isArray(handlers)) {
        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener || handlers[i].listener && handlers[i].listener === listener || handlers[i]._origin && handlers[i]._origin === listener) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if (this.wildcard) {
          leaf._listeners.splice(position, 1);
        } else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if (this.wildcard) {
            delete leaf._listeners;
          } else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);
        return this;
      } else if (handlers === listener || handlers.listener && handlers.listener === listener || handlers._origin && handlers._origin === listener) {
        if (this.wildcard) {
          delete leaf._listeners;
        } else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }

      var keys = Object.keys(root);

      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if (obj instanceof Function || typeof obj !== "object" || obj === null) continue;

        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }

        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }

    recursivelyGarbageCollect(this.listenerTree);
    return this;
  };

  EventEmitter.prototype.offAny = function (fn) {
    var i = 0,
        l = 0,
        fns;

    if (fn && this._all && this._all.length > 0) {
      fns = this._all;

      for (i = 0, l = fns.length; i < l; i++) {
        if (fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;

      for (i = 0, l = fns.length; i < l; i++) {
        this.emit("removeListenerAny", fns[i]);
      }

      this._all = [];
    }

    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function (type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    } else if (this._events) {
      this._events[type] = null;
    }

    return this;
  };

  EventEmitter.prototype.listeners = function (type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);
    if (!this._events[type]) this._events[type] = [];

    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }

    return this._events[type];
  };

  EventEmitter.prototype.eventNames = function () {
    return Object.keys(this._events);
  };

  EventEmitter.prototype.listenerCount = function (type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function () {
    if (this._all) {
      return this._all;
    } else {
      return [];
    }
  };

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    module.exports = EventEmitter;
  } else {
    window.EventEmitter2 = EventEmitter;
  }
}();
}).call(this,require('_process'))
},{"_process":115}],6:[function(require,module,exports){
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

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],7:[function(require,module,exports){
"use strict";

var WINDOW = window;

var LODASH_MERGE = require("lodash/merge");

var EVENT_EMITTER = require("eventemitter2").EventEmitter2;

var REPS = require("insight.domplate.reps");

var repsBaseUrl = "/reps";

if (typeof bundle !== "undefined") {
  repsBaseUrl = bundle.module.filename.replace(/(^|\/)[^\/]+\/[^\/]+$/, '$1dist/reps/insight.domplate.reps/dist/reps');
}

var repLoader = new REPS.Loader({
  repsBaseUrl: repsBaseUrl
});

var WILDFIRE = require("wildfire-for-js/lib/wildfire");

var BROWSER_API_ENCODER = require("./encoders/BrowserApi-0.1");

var FIREBUG_CONSOLE_DECODER = require("./decoders/FirebugConsole-0.1");

var INSIGHT_DECODER = require("./decoders/Insight-0.1");

var encoder = new BROWSER_API_ENCODER.Encoder();
var decoder = new FIREBUG_CONSOLE_DECODER.Decoder();
var insightDecoder = new INSIGHT_DECODER.Decoder();
var receiver = WILDFIRE.Receiver();
receiver.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1");
receiver.addListener({
  onMessageReceived: function (request, message) {
    exports.fireconsole.appendMessage(decoder.formatMessage(message));
  }
});
var receiverDump = WILDFIRE.Receiver();
receiverDump.setId("http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1");
receiverDump.addListener({
  onMessageReceived: function (request, message) {
    exports.fireconsole.appendMessage(decoder.formatMessage(message));
  }
});
var receiverChannel = WILDFIRE.PostMessageChannel();
receiverChannel.addReceiver(receiver);
receiverChannel.addReceiver(receiverDump);

function FireConsole() {
  var self = this;

  self.parseReceivedPostMessage = function () {
    return receiverChannel.parseReceivedPostMessage.apply(receiverChannel, arguments);
  };

  var panelEl = null;

  self.setPanelElement = function (el) {
    panelEl = el;
    flushBuffer();
  };

  var Supervisor = exports.Supervisor = function () {
    this.groupStack = [];
    this._appendMessageToNode__queue = false;
    this.on = {};
  };

  Supervisor.prototype.ensureCssForDocument = function (document) {
    console.error("Supervisor.prototype.ensureCssForDocument", document);
  };

  Supervisor.prototype.resetGroupStack = function () {
    this.groupStack = [];
  };

  Supervisor.prototype.appendMessageToNode = function (domNode, message) {
    if (this._appendMessageToNode__queue === false) {
      this._appendMessageToNode__queue = [];
      doSynchronizedappendMessageToNode(this, domNode, message);
    } else if (this._appendMessageToNode__queue !== false) this._appendMessageToNode__queue.push([domNode, message]);
  };

  function doSynchronizedappendMessageToNode(supervisor, panelEl, message) {
    if (supervisor.groupStack.length > 0) {
      panelEl = supervisor.groupStack[supervisor.groupStack.length - 1];

      if (!panelEl) {
        throw new Error("panelEl is null!");
      }
    }

    var options = message.options;
    var meta = message.meta;
    var domNode = null;

    if (typeof meta["group.end"] === "undefined") {
      domNode = WINDOW.document.createElement("div");
      domNode.setAttribute("class", "message");
      panelEl.appendChild(domNode);
    }

    new Promise(function (resolve, reject) {
      if (domNode) {
        var nodeTree = message.node;
        nodeTree.meta = nodeTree.meta || {};
        nodeTree.meta.wrapper = 'wrappers/console';
        repRenderer.renderNodeInto(nodeTree, domNode).then(resolve, reject);
      } else {
        resolve();
      }
    }).then(function () {
      if (typeof meta["group.start"] !== "undefined") {
        var node = repLoader.domplate.util.getElementByClass(domNode, "body");
        supervisor.groupStack.push(node);

        if (typeof meta["group.expand"] && meta["group.expand"] === meta["group"] && node.parentNode) {
          node.parentNode.setAttribute("expanded", "true");
        }
      }

      if (typeof meta["group.end"] !== "undefined") {
        var count = meta["group.end"];

        if (count === true) {
          count = 1;
        }

        for (var i = 0; i < count; i++) {
          var groupStartNode = supervisor.groupStack.pop();

          if (groupStartNode.parentNode.templateObject) {
            groupStartNode.parentNode.templateObject.setCount(groupStartNode.parentNode, groupStartNode.children.length);
          }
        }
      }

      if (meta["expand"]) {
        var node = repLoader.domplate.util.getElementByClass(domNode, "body");

        if (node.parentNode && node.parentNode.templateObject) {
          node.parentNode.templateObject.expandForMasterRow(node.parentNode, node);
        } else {
          console.error("NYI - expand for message - in " + module.id);
        }
      }

      if (meta["actions"] === false) {
        var node = repLoader.domplate.util.getElementByClass(domNode, "actions");

        if (node) {
          node.style.display = "none";
        }
      }

      try {
        if (domNode && domNode.children[0] && domNode.children[0].templateObject && domNode.children[0].templateObject.postRender) {
          domNode.children[0].templateObject.postRender(domNode.children[0]);
        }
      } catch (e) {
        console.warn("Error during template postRender", e, e.stack);
      }

      if (supervisor._appendMessageToNode__queue.length > 0) {
        doSynchronizedappendMessageToNode.apply(null, [supervisor].concat(supervisor._appendMessageToNode__queue.shift()));
      } else {
        supervisor._appendMessageToNode__queue = false;
      }
    }).catch(function (err) {
      throw err;
    });
  }

  self.getPanelEl = function () {
    return panelEl;
  };

  self.clear = function (options) {
    options = options || {};
    var panelEl = options.panelEl || self.getPanelEl();
    panelEl.innerHTML = "";
  };

  self.hide = function () {
    self.getPanelEl().style.display = "none";
  };

  self.show = function () {
    self.getPanelEl().style.display = "";
  };

  self.isShowing = function () {
    return self.getPanelEl().style.display === "";
  };

  self.destroy = function () {};

  var buffer = [];

  function flushBuffer() {
    if (!buffer.length || !panelEl) return;
    buffer.map(function (message) {
      self.appendMessage(message);
    });
    buffer = [];
  }

  var renderSupervisor = new Supervisor();
  var repRenderer = self.repRenderer = new REPS.Renderer({
    loader: repLoader,
    onEvent: function (name, args) {
      console.log('repRenderer.onEvent()', name, args);

      if (name === "click") {
        self.emit("click", args[1]);
      } else if (name === "expand") {} else if (name === "contract") {} else if (name === "inspectMessage") {
        self.emit(name, {
          node: args[1].args.node
        });
      } else if (name === "inspectFile") {
        self.emit(name, args[1].args);
      } else if (name === "inspectNode") {
        args[1].args.node['#'] = "InsightTree";
        self.emit(name, {
          node: args[1].args.node
        });
      } else {
        console.error("No handler for: repRenderer.onEvent()", name, args);
        throw new Error("NYI");
      }
    }
  });

  self.appendMessage = function (message, options) {
    options = options || {};

    if (options.clear) {
      self.clear(options);
    }

    var panelEl = options.panelEl || self.getPanelEl();

    if (!panelEl) {
      buffer.push(message);
      return;
    }

    if (options.view === "detail") {
      repRenderer.renderNodeInto(message, panelEl);
    } else {
      if (message["#"] !== "InsightTree") {
        message = encoder.formatMessage(message, options);
      }

      var msg = {
        render: function (el, view, messageObject) {
          throw new Error("Render!!");

          if (typeof meta["group.start"] !== "undefined" && meta["group.start"]) {
            return;
          }

          var options = {};

          if (view) {
            options.view = view;
          }

          if (typeof options.view !== "array") {
            options.view = [options.view];
          }

          if (node.type === "reference" || node.meta.renderer === "structures/table" || node.meta.renderer === "structures/trace") {
            var tpl = null;

            if (node.type === "reference") {
              throw new Error("Get REFERENCE");
              tpl = commonHelpers.getTemplateModuleForNode(node.instances[0]);
            } else if (node.meta.renderer === "structures/table" || node.meta.renderer === "structures/trace") {
              tpl = commonHelpers.getTemplateModuleForNode(_og.origin);
            }

            var tplDec = tpl.getTemplateDeclaration();

            if (tplDec.VAR_hideShortTagOnExpand === false) {
              messageObject.postRender.keeptitle = true;
            }
          }
        },
        meta: message.meta,
        node: message,
        options: {},
        context: message.context || undefined
      };
      renderSupervisor.appendMessageToNode(panelEl, msg);
    }
  };

  var consoles = {};

  self.consoleForId = function (id) {
    var el = panelEl.querySelector('DIV[fireconsoleid="' + id + '"]');

    if (!el) {
      el = WINDOW.document.createElement('div');
      el.setAttribute("fireconsoleid", id);
      panelEl.appendChild(el);
    }

    if (!consoles[id]) {
      consoles[id] = new FireConsole();
      consoles[id].setPanelElement(el);
      consoles[id].onAny(function () {
        self.emit.apply(self, arguments);
      });
    }

    return consoles[id];
  };

  self.destroyConsoleForId = function (id) {
    if (!consoles[id]) {
      return;
    }

    consoles[id].destroy();
    delete consoles[id];
    var el = panelEl.querySelector('DIV[fireconsoleid="' + id + '"]');

    if (el) {
      el.parentNode.removeChild(el);
    }
  };

  var publicAPI = new PublicAPI(self);

  self.getAPI = function () {
    return publicAPI;
  };
}

FireConsole.prototype = Object.create(EVENT_EMITTER.prototype);

class PublicAPI {
  constructor(fireconsole, options) {
    this.fireconsole = fireconsole;
    this.options = options || {};
    this.FireConsole = FireConsole;
  }

  clear() {
    return this.fireconsole.clear.apply(this.fireconsole, arguments);
  }

  on() {
    return this.fireconsole.on.apply(this.fireconsole, arguments);
  }

  off() {
    return this.fireconsole.off.apply(this.fireconsole, arguments);
  }

  _logObjectWithPriority(priority, message) {
    this.fireconsole.appendMessage(message, LODASH_MERGE({}, this.options, {
      priority: priority
    }));
  }

  renderMessageInto(panelEl, message) {
    this.fireconsole.appendMessage(message, {
      panelEl: panelEl,
      clear: true,
      view: "detail"
    });
  }

  label(label) {
    return new PublicAPI(this.fireconsole, {
      label: label
    });
  }

  log(message) {
    this._logObjectWithPriority("log", message);
  }

  info(message) {
    this._logObjectWithPriority("info", message);
  }

  warn(message) {
    this._logObjectWithPriority("warn", message);
  }

  error(message) {
    this._logObjectWithPriority("error", message);
  }

  send(message) {
    if (message.sender && message.receiver) {
      if (message.receiver === "http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1") {
        this.fireconsole.appendMessage(decoder.formatMessage(message));
      } else if (message.receiver === "http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1") {
        this.fireconsole.appendMessage(decoder.formatMessage(message));
      } else if (message.receiver === "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/firephp/0" || message.receiver === "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/page/0") {
        this.fireconsole.appendMessage(insightDecoder.formatMessage(message));
      } else if (message.receiver === "https://gi0.FireConsole.org/rep.js/InsightTree/0.1") {
        message.data["#"] = "InsightTree";
        this.fireconsole.appendMessage(message.data);
      } else {
        throw new Error("Receiver for ID '".concat(message.receiver, "' not implemented!"));
      }
    } else {
      if (!Array.isArray(message)) {
        message = [message];
      }

      this.fireconsole.parseReceivedPostMessage(message);
    }
  }

}

;
exports.fireconsole = new FireConsole();

if (typeof WINDOW.FC === "undefined") {
  WINDOW.FC = exports.fireconsole.getAPI();
}

exports.main = function (JSONREP, node) {
  return Promise.all(Object.keys(node.plugins || []).map(function (key) {
    var panelNode = {};
    panelNode[key] = node[key];
    return JSONREP.markupNode(panelNode).then(function () {
      return null;
    });
  })).then(function () {
    if (node.messages) {
      node.messages.map(function (message) {
        exports.fireconsole.appendMessage(message);
      });
    }

    if (node.load) {
      node.load.map(function (uri) {
        var script = WINDOW.document.createElement('script');
        script.type = 'text/javascript';
        script.src = uri;
        WINDOW.document.getElementsByTagName('head')[0].appendChild(script);
      });
    }

    return JSONREP.makeRep('<div></div>', {
      css: {
        ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
        "_code": "{\"_cssid\":\"e89c1c9331aa7abb16042f9573f69f4fd9ca5d7c\",\"repUri\":\"fireconsole\"}",
        "_format": "json",
        "_args": [],
        "_compiled": false
      },
      on: {
        mount: function (el) {
          exports.fireconsole.setPanelElement(el);
        }
      }
    });
  });
};
},{"./decoders/FirebugConsole-0.1":8,"./decoders/Insight-0.1":9,"./encoders/BrowserApi-0.1":10,"eventemitter2":5,"insight.domplate.reps":17,"lodash/merge":111,"wildfire-for-js/lib/wildfire":146}],8:[function(require,module,exports){
"use strict";

var VERBOSE = false;

var ENCODER = require("insight-for-js/lib/encoder/default");

var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);

class Decoder {
  formatMessage(message) {
    var node = {
      "#": "InsightTree",
      "meta": {}
    };

    try {
      if (VERBOSE) console.log("Decoder.formatMessage():", message);
      var dataNode = null;
      var meta = typeof message.meta === "string" ? JSON.parse(message.meta) : message.meta;
      var data = JSON.parse(message.data);
      if (VERBOSE) console.log("Decoder.formatMessage() meta:", JSON.stringify(meta, null, 4));
      if (VERBOSE) console.log("Decoder.formatMessage() data:", JSON.stringify(data, null, 4));

      if (meta["lang.id"] === "registry.pinf.org/cadorn.org/github/renderers/packages/php/master" && meta["msg.preprocessor"] === "FirePHPCoreCompatibility") {
        if (meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
          node.meta = {
            "lang": "default",
            "lang.type": "table"
          };
          node.value = {
            title: {
              type: "string",
              value: data.title
            },
            header: data.header.map(function (value) {
              return {
                type: "string",
                value: value
              };
            })
          };
          dataNode = encoder.encode(data.data, {
            "lang": "php"
          }, {
            "jsonEncode": false
          });
          node.value.body = dataNode.origin.value.map(function (row) {
            return row.value;
          });
          node.instances = dataNode.instances;
        } else if (meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/trace") {
            node.meta = {
              "lang": "default",
              "lang.type": "trace"
            };
            node.value = {
              title: {
                type: "string",
                value: data.title
              }
            };
            node.value.stack = data.trace.map(function (frame) {
              dataNode = encoder.encode(frame.args || [], {
                "lang": "php"
              }, {
                "jsonEncode": false
              });
              return {
                file: frame.file,
                line: frame.line,
                class: frame.class,
                function: frame.function,
                args: dataNode.origin.value.map(function (arg) {
                  return arg;
                })
              };
            });
          } else if (data && data.__isException === true) {
              node.meta = {
                "lang": "default",
                "lang.type": "trace"
              };
              node.value = {
                title: {
                  type: "string",
                  value: data['protected:message']
                }
              };
              node.value.stack = data["private:trace"].map(function (frame) {
                dataNode = encoder.encode(frame.args || [], {
                  "lang": "php"
                }, {
                  "jsonEncode": false
                });
                return {
                  file: frame.file,
                  line: frame.line,
                  class: frame.class,
                  function: frame.function,
                  args: dataNode.origin.value.map(function (arg) {
                    return arg;
                  })
                };
              });
            } else if (data && typeof data === "object" && typeof data.__className === "string") {
                dataNode = encoder.encode(data, {
                  "lang": "php"
                }, {
                  "jsonEncode": false
                });
                node.meta = dataNode.origin.meta;
                node.type = dataNode.origin.type;
                node.value = dataNode.origin.value;
                node.instances = dataNode.instances;
              } else {
                dataNode = encoder.encode(data, {
                  "lang": "php"
                }, {
                  "jsonEncode": false
                });
                node.meta = dataNode.origin.meta;
                node.value = dataNode.origin.value;
                node.instances = dataNode.instances;
              }
      }

      ['priority', 'label', 'file', 'line', 'target', 'group', 'group.start', 'group.end', 'group.title', 'group.expand', 'console'].forEach(function (name) {
        if (typeof meta[name] !== 'undefined') node.meta[name] = meta[name];
      });

      if (typeof node.meta["group.start"] != "undefined") {
        node.value = node.meta["group.title"] || '?';
        node.type = 'string';
      }

      if (VERBOSE) console.log("Decoder.formatMessage() RETURN:", node);
      return node;
    } catch (err) {
      console.error("message", message);
      console.error("node", node);
      throw err;
    }
  }

}

exports.Decoder = Decoder;
},{"insight-for-js/lib/encoder/default":16}],9:[function(require,module,exports){
"use strict";

var DECODER = require("insight-for-js/lib/decoder/default");

class Decoder {
  formatMessage(message) {
    var meta = typeof message.meta === "string" ? JSON.parse(message.meta) : message.meta;

    if (meta["lang.id"] === "registry.pinf.org/cadorn.org/github/renderers\/packages\/php\/master") {
      meta["lang"] = "php";
      delete meta["lang.id"];
    } else {
      throw new Error("'lang.id of '" + meta["lang.id"] + "' not supported!");
    }

    var data = JSON.parse(message.data);

    if (!data.origin) {
      throw new Error("No 'data.origin' found in message data");
    }

    Object.keys(data.origin).forEach(function (name) {
      meta[name] = data.origin[name];
    });
    var node = {
      "#": "InsightTree",
      meta: meta,
      type: meta.type,
      value: meta.value
    };
    delete meta.type;
    delete meta.value;

    if (data.instances) {
      node.instances = data.instances;
    }

    return node;
  }

}

exports.Decoder = Decoder;
},{"insight-for-js/lib/decoder/default":15}],10:[function(require,module,exports){
"use strict";

var VERBOSE = false;

var ENCODER = require("insight-for-js/lib/encoder/default");

var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);

class Encoder {
  formatMessage(message, options) {
    var node = {
      "#": "InsightTree",
      "meta": {}
    };

    try {
      if (VERBOSE) console.log("Encoder.formatMessage():", message);
      var dataNode = encoder.encode(message, {}, {
        "jsonEncode": false
      });
      node.meta = dataNode.origin.meta;
      node.type = dataNode.origin.type || undefined;
      node.value = dataNode.origin.value;

      if (options.priority) {
        node.meta.priority = options.priority;
      }

      if (options.label) {
        node.meta.label = options.label;
      }

      if (VERBOSE) console.log("Encoder.formatMessage() RETURN:", node);
      return node;
    } catch (err) {
      console.error("message", message);
      console.error("node", node);
      throw err;
    }
  }

}

exports.Encoder = Encoder;
},{"insight-for-js/lib/encoder/default":16}],11:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var Transform = require('readable-stream').Transform;

var inherits = require('inherits');

function throwIfNotStringOrBuffer(val, prefix) {
  if (!Buffer.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer');
  }
}

function HashBase(blockSize) {
  Transform.call(this);
  this._block = Buffer.allocUnsafe(blockSize);
  this._blockSize = blockSize;
  this._blockOffset = 0;
  this._length = [0, 0, 0, 0];
  this._finalized = false;
}

inherits(HashBase, Transform);

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null;

  try {
    this.update(chunk, encoding);
  } catch (err) {
    error = err;
  }

  callback(error);
};

HashBase.prototype._flush = function (callback) {
  var error = null;

  try {
    this.push(this.digest());
  } catch (err) {
    error = err;
  }

  callback(error);
};

HashBase.prototype.update = function (data, encoding) {
  throwIfNotStringOrBuffer(data, 'Data');
  if (this._finalized) throw new Error('Digest already called');
  if (!Buffer.isBuffer(data)) data = Buffer.from(data, encoding);
  var block = this._block;
  var offset = 0;

  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) {
      block[i++] = data[offset++];
    }

    this._update();

    this._blockOffset = 0;
  }

  while (offset < data.length) {
    block[this._blockOffset++] = data[offset++];
  }

  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry;
    carry = this._length[j] / 0x0100000000 | 0;
    if (carry > 0) this._length[j] -= 0x0100000000 * carry;
  }

  return this;
};

HashBase.prototype._update = function () {
  throw new Error('_update is not implemented');
};

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called');
  this._finalized = true;

  var digest = this._digest();

  if (encoding !== undefined) digest = digest.toString(encoding);

  this._block.fill(0);

  this._blockOffset = 0;

  for (var i = 0; i < 4; ++i) {
    this._length[i] = 0;
  }

  return digest;
};

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented');
};

module.exports = HashBase;
},{"inherits":14,"readable-stream":130,"safe-buffer":12}],12:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],13:[function(require,module,exports){
"use strict";

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;

  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);

    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }

    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }

    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;

  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};
},{}],14:[function(require,module,exports){
"use strict";

if (typeof Object.create === 'function') {
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;

      var TempCtor = function () {};

      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}
},{}],15:[function(require,module,exports){
"use strict";

var ENCODER = require("../encoder/default");

exports.EXTENDED = "EXTENDED";
exports.SIMPLE = "SIMPLE";

exports.generateFromMessage = function (message, format) {
  format = format || exports.EXTENDED;
  var og = new ObjectGraph();
  var meta = {},
      data;

  if (typeof message.getMeta == "function") {
    meta = JSON.parse(message.getMeta() || "{}");
  } else if (typeof message.meta == "string") {
    meta = JSON.parse(message.meta);
  } else if (typeof message.meta == "object") {
    meta = message.meta;
  }

  if (typeof message.getData == "function") {
    data = message.getData();
  } else if (typeof message.data != "undefined") {
    data = message.data;
  } else throw new Error("NYI");

  if (meta["msg.preprocessor"] && meta["msg.preprocessor"] == "FirePHPCoreCompatibility") {
    var parts = convertFirePHPCoreData(meta, data);
    if (typeof message.setMeta == "function") message.setMeta(JSON.stringify(parts[0]));else message.meta = JSON.stringify(parts[0]);
    data = parts[1];
  } else if (typeof data !== "undefined" && data != "") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("Error decoding JSON data: " + data);
      throw e;
    }
  } else {
    data = {};
  }

  if (typeof meta["group.title"] != "undefined") {
    data = {
      "origin": {
        "type": "string",
        "string": meta["group.title"]
      }
    };
  }

  if (data.instances) {
    for (var i = 0; i < data.instances.length; i++) {
      data.instances[i] = generateNodesFromData(og, data.instances[i]);
    }

    og.setInstances(data.instances);
  }

  if (meta["lang.id"]) {
    og.setLanguageId(meta["lang.id"]);
  }

  og.setMeta(meta);

  if (data.origin) {
    if (format == exports.EXTENDED) {
      og.setOrigin(generateNodesFromData(og, data.origin));
    } else if (format == exports.SIMPLE) {
      og.setOrigin(generateObjectsFromData(og, data.origin));
    } else {
      throw new Error("unsupported format: " + format);
    }
  }

  return og;
};

function generateObjectsFromData(objectGraph, data) {
  var node;

  if (data.type == "array") {
    node = [];

    for (var i = 0; i < data[data.type].length; i++) {
      node.push(generateObjectsFromData(objectGraph, data[data.type][i]));
    }
  } else if (data.type == "map") {
    node = [];

    for (var i = 0; i < data[data.type].length; i++) {
      node.push([generateObjectsFromData(objectGraph, data[data.type][i][0]), generateObjectsFromData(objectGraph, data[data.type][i][1])]);
    }
  } else if (data.type == "dictionary") {
    node = {};

    for (var name in data[data.type]) {
      node[name] = generateObjectsFromData(objectGraph, data[data.type][name]);
    }
  } else {
    node = data[data.type];
  }

  return node;
}

function generateNodesFromData(objectGraph, data, parentNode) {
  parentNode = parentNode || null;
  var node = new Node(objectGraph, data, parentNode);

  if (node.value !== null && typeof node.value != "undefined") {
    if (node.type == "array") {
      for (var i = 0; i < node.value.length; i++) {
        node.value[i] = generateNodesFromData(objectGraph, node.value[i], node);
      }
    } else if (node.type == "map") {
      for (var i = 0; i < node.value.length; i++) {
        node.value[i][0] = generateNodesFromData(objectGraph, node.value[i][0], node);
        node.value[i][1] = generateNodesFromData(objectGraph, node.value[i][1], node);
      }
    } else if (node.type == "dictionary") {
      for (var name in node.value) {
        node.value[name] = generateNodesFromData(objectGraph, node.value[name], node);
      }
    }
  } else {
    node.value = null;
  }

  return node;
}

var Node = function (objectGraph, data, parentNode) {
  var self = this;
  self.type = data.type;
  self.value = typeof data.value !== "undefined" && data.value || date[data.type];
  self.meta = objectGraph.meta || {};
  Object.keys(data, function (name) {
    if (name != "type" && name != self.type) {
      self.meta[name] = data[name];
    }
  });

  if (self.type == "reference") {
    self.getInstance = function () {
      return objectGraph.getInstance(self.value);
    };
  }
};

Node.prototype.getTemplateId = function () {
  if (this.meta["tpl.id"]) {
    return this.meta["tpl.id"];
  }

  return false;
};

Node.prototype.compact = function () {
  if (!this.compacted) {
    if (this.type == "map") {
      this.compacted = {};

      for (var i = 0; i < this.value.length; i++) {
        this.compacted[this.value[i][0].value] = this.value[i][1];
      }
    }
  }

  return this.compacted;
};

Node.prototype.forPath = function (path) {
  if (!path || path.length === 0) return this;

  if (this.type == "map") {
    var m = path[0].match(/^value\[(\d*)\]\[1\]$/);
    return this.value[parseInt(m[1])][1].forPath(path.slice(1));
  } else if (this.type == "dictionary") {
    var m = path[0].match(/^value\['(.*?)'\]$/);
    return this.value[m[1]].forPath(path.slice(1));
  } else if (this.type == "array") {
    var m = path[0].match(/^value\[(\d*)\]$/);
    return this.value[parseInt(m[1])].forPath(path.slice(1));
  } else {}

  return null;
};

var ObjectGraph = function () {};

ObjectGraph.prototype.setOrigin = function (node) {
  this.origin = node;
};

ObjectGraph.prototype.getOrigin = function () {
  return this.origin;
};

ObjectGraph.prototype.setInstances = function (instances) {
  this.instances = instances;
};

ObjectGraph.prototype.getInstance = function (index) {
  return this.instances[index];
};

ObjectGraph.prototype.setLanguageId = function (id) {
  this.languageId = id;
};

ObjectGraph.prototype.getLanguageId = function () {
  return this.languageId;
};

ObjectGraph.prototype.setMeta = function (meta) {
  this.meta = meta;
};

ObjectGraph.prototype.getMeta = function () {
  return this.meta;
};

ObjectGraph.prototype.nodeForPath = function (path) {
  var m = path[0].match(/^instances\[(\d*)\]$/);

  if (m) {
    return this.instances[parseInt(m[1])].forPath(path.slice(1));
  } else {
    return this.origin.forPath(path.slice(1));
  }

  return node;
};

var encoder = ENCODER.Encoder();
encoder.setOption("maxObjectDepth", 1000);
encoder.setOption("maxArrayDepth", 1000);
encoder.setOption("maxOverallDepth", 1000);

function convertFirePHPCoreData(meta, data) {
  data = encoder.encode(JSON.parse(data), null, {
    "jsonEncode": false
  });
  return [meta, data];
}
},{"../encoder/default":16}],16:[function(require,module,exports){
"use strict";

var Encoder = exports.Encoder = function () {
  if (!(this instanceof exports.Encoder)) return new exports.Encoder();
  this.options = {
    "maxObjectDepth": 4,
    "maxArrayDepth": 4,
    "maxOverallDepth": 6,
    "includeLanguageMeta": true
  };
};

Encoder.prototype.setOption = function (name, value) {
  this.options[name] = value;
};

Encoder.prototype.setOrigin = function (variable) {
  this.origin = variable;
  this.instances = [];
  return true;
};

Encoder.prototype.encode = function (data, meta, options) {
  options = options || {};

  if (typeof data != "undefined") {
    this.setOrigin(data);
  }

  var graph = {};

  try {
    if (typeof this.origin != "undefined") {
      graph["origin"] = this.encodeVariable(meta, this.origin);
    }
  } catch (err) {
    console.warn("Error encoding variable", err.stack);
    throw err;
  }

  if (this.instances.length > 0) {
    graph["instances"] = [];
    this.instances.forEach(function (instance) {
      graph["instances"].push(instance[1]);
    });
  }

  if (typeof options.jsonEncode !== 'undefined' && !options.jsonEncode) {
    return graph;
  }

  try {
    return JSON.stringify(graph);
  } catch (e) {
    console.warn("Error jsonifying object graph" + e);
    throw e;
  }

  return null;
};

function setMeta(node, name, value) {
  node.meta = node.meta || {};
  node.meta[name] = value;
}

function completeWithMeta(meta, node) {
  node.meta = node.meta || {};
  Object.keys(meta).forEach(function (name) {
    if (typeof node.meta[name] === 'undefined') {
      node.meta[name] = meta[name];
    }
  });
  return node;
}

Encoder.prototype.encodeVariable = function (meta, variable, objectDepth, arrayDepth, overallDepth) {
  objectDepth = objectDepth || 1;
  arrayDepth = arrayDepth || 1;
  overallDepth = overallDepth || 1;

  if (variable === null) {
    var ret = {
      "type": "constant",
      "value": "null"
    };

    if (this.options["includeLanguageMeta"]) {
      setMeta(ret, "lang.type", "null");
    }

    ret = completeWithMeta(meta, ret);
    return ret;
  } else if (variable === true || variable === false) {
    var ret = {
      "type": "constant",
      "value": variable === true ? "true" : "false"
    };

    if (this.options["includeLanguageMeta"]) {
      setMeta(ret, "lang.type", "boolean");
    }

    ret = completeWithMeta(meta, ret);
    return ret;
  }

  var type = typeof variable;

  if (type == "undefined") {
    var ret = {
      "type": "constant",
      "value": "undefined"
    };

    if (this.options["includeLanguageMeta"]) {
      setMeta(ret, "lang.type", "undefined");
    }

    completeWithMeta(meta, ret);
    return ret;
  } else if (type == "number") {
    if (Math.round(variable) == variable) {
      var ret = {
        "type": "string",
        "value": "" + variable
      };

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "integer");
      }

      completeWithMeta(meta, ret);
      return ret;
    } else {
      var ret = {
        "type": "string",
        "value": "" + variable
      };

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "float");
      }

      completeWithMeta(meta, ret);
      return ret;
    }
  } else if (type == "string") {
    if (variable == "** Excluded by Filter **") {
      var ret = {
        "type": "string",
        "value": variable
      };
      setMeta(ret, "encoder.notice", "Excluded by Filter");
      setMeta(ret, "encoder.trimmed", true);

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "string");
      }

      completeWithMeta(meta, ret);
      return ret;
    } else if (variable.match(/^\*\*\sRecursion\s\([^\(]*\)\s\*\*$/)) {
      var ret = {
        "type": "string",
        "value": variable
      };
      setMeta(ret, "encoder.notice", "Recursion");
      setMeta(ret, "encoder.trimmed", true);

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "string");
      }

      completeWithMeta(meta, ret);
      return ret;
    } else if (variable.match(/^\*\*\sResource\sid\s#\d*\s\*\*$/)) {
      var ret = {
        "type": "string",
        "value": variable.substring(3, variable.length - 3)
      };

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "resource");
      }

      completeWithMeta(meta, ret);
      return ret;
    } else {
      var ret = {
        "type": "string",
        "value": variable
      };

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "string");
      }

      completeWithMeta(meta, ret);
      return ret;
    }
  }

  if (variable && variable.__no_serialize === true) {
    var ret = {
      "type": "string",
      "value": "Object"
    };
    setMeta(ret, "encoder.notice", "Excluded by __no_serialize");
    setMeta(ret, "encoder.trimmed", true);
    completeWithMeta(meta, ret);
    return ret;
  }

  if (type == "function") {
    var ret = {
      "type": "string",
      "string": "" + variable
    };

    if (this.options["includeLanguageMeta"]) {
      setMeta(ret, "lang.type", "function");
    }

    completeWithMeta(meta, ret);
    return ret;
  } else if (type == "object") {
    try {
      if (Array.isArray(variable)) {
        var ret = {
          "type": "array",
          "value": this.encodeArray(meta, variable, objectDepth, arrayDepth, overallDepth)
        };

        if (this.options["includeLanguageMeta"]) {
          setMeta(ret, "lang.type", "array");
        }

        ret = completeWithMeta(meta, ret);
        return ret;
      }
    } catch (err) {
      var ret = {
        "type": "string",
        "string": "Cannot serialize"
      };
      setMeta(ret, "encoder.notice", "Cannot serialize");
      setMeta(ret, "encoder.trimmed", true);
      completeWithMeta(meta, ret);
      return ret;
    }

    if (typeof variable["__className"] != "undefined") {
      var ret = {
        "type": "reference",
        "value": this.encodeInstance(meta, variable, objectDepth, arrayDepth, overallDepth)
      };
      completeWithMeta(meta, ret);
      return ret;
    } else {
      var ret;

      if (/^\[Exception\.\.\.\s/.test(variable)) {
        ret = {
          "type": "map",
          "value": this.encodeException(meta, variable, objectDepth, arrayDepth, overallDepth)
        };
      } else {
        ret = {
          "type": "map",
          "value": this.encodeAssociativeArray(meta, variable, objectDepth, arrayDepth, overallDepth)
        };
      }

      if (this.options["includeLanguageMeta"]) {
        setMeta(ret, "lang.type", "map");
      }

      completeWithMeta(meta, ret);
      return ret;
    }
  }

  var ret = {
    "type": "string",
    "value": "Variable with type '" + type + "' unknown: " + variable
  };

  if (this.options["includeLanguageMeta"]) {
    setMeta(ret, "lang.type", "unknown");
  }

  completeWithMeta(meta, ret);
  return ret;
};

Encoder.prototype.encodeArray = function (meta, variable, objectDepth, arrayDepth, overallDepth) {
  objectDepth = objectDepth || 1;
  arrayDepth = arrayDepth || 1;
  overallDepth = overallDepth || 1;

  if (arrayDepth > this.options["maxArrayDepth"]) {
    return {
      "notice": "Max Array Depth (" + this.options["maxArrayDepth"] + ")"
    };
  } else if (overallDepth > this.options["maxOverallDepth"]) {
    return {
      "notice": "Max Overall Depth (" + this.options["maxOverallDepth"] + ")"
    };
  }

  var self = this,
      items = [];
  Object.keys(variable).forEach(function (name) {
    items.push(self.encodeVariable(meta, [name, variable[name]], 1, arrayDepth + 1, overallDepth + 1));
  });
  return items;
};

Encoder.prototype.encodeAssociativeArray = function (meta, variable, objectDepth, arrayDepth, overallDepth) {
  objectDepth = objectDepth || 1;
  arrayDepth = arrayDepth || 1;
  overallDepth = overallDepth || 1;

  if (arrayDepth > this.options["maxArrayDepth"]) {
    return {
      "notice": "Max Array Depth (" + this.options["maxArrayDepth"] + ")"
    };
  } else if (overallDepth > this.options["maxOverallDepth"]) {
    return {
      "notice": "Max Overall Depth (" + this.options["maxOverallDepth"] + ")"
    };
  }

  var self = this,
      items = [];

  for (var key in variable) {
    if (isNumber(key) && Math.round(key) == key) {
      key = parseInt(key);
    }

    items.push([self.encodeVariable(meta, key, 1, arrayDepth + 1, overallDepth + 1), self.encodeVariable(meta, variable[key], 1, arrayDepth + 1, overallDepth + 1)]);
  }

  return items;
};

Encoder.prototype.encodeException = function (meta, variable, objectDepth, arrayDepth, overallDepth) {
  var self = this,
      items = [];
  items.push([self.encodeVariable(meta, "message", 1, arrayDepth + 1, overallDepth + 1), self.encodeVariable(meta, "" + variable, 1, arrayDepth + 1, overallDepth + 1)]);
  return items;
};

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

Encoder.prototype.getInstanceId = function (object) {
  for (var i = 0; i < this.instances.length; i++) {
    if (this.instances[i][0] === object) {
      return i;
    }
  }

  return null;
};

Encoder.prototype.encodeInstance = function (meta, object, objectDepth, arrayDepth, overallDepth) {
  objectDepth = objectDepth || 1;
  arrayDepth = arrayDepth || 1;
  overallDepth = overallDepth || 1;
  var id = this.getInstanceId(object);

  if (id != null) {
    return id;
  }

  this.instances.push([object, this.encodeObject(meta, object, objectDepth, arrayDepth, overallDepth)]);
  return this.instances.length - 1;
};

Encoder.prototype.encodeObject = function (meta, object, objectDepth, arrayDepth, overallDepth) {
  objectDepth = objectDepth || 1;
  arrayDepth = arrayDepth || 1;
  overallDepth = overallDepth || 1;

  if (arrayDepth > this.options["maxObjectDepth"]) {
    return {
      "notice": "Max Object Depth (" + this.options["maxObjectDepth"] + ")"
    };
  } else if (overallDepth > this.options["maxOverallDepth"]) {
    return {
      "notice": "Max Overall Depth (" + this.options["maxOverallDepth"] + ")"
    };
  }

  var self = this,
      ret = {
    "type": "dictionary",
    "value": {}
  };
  var isPHPClass = false;

  if (typeof object["__className"] != "undefined") {
    isPHPClass = true;
    setMeta(ret, "lang.class", object["__className"]);
    delete object["__className"];

    if (this.options["includeLanguageMeta"]) {
      setMeta(ret, "lang.type", "object");
    }
  }

  if (typeof object["__isException"] != "undefined" && object["__isException"]) {
    setMeta(ret, "lang.type", "exception");
  }

  Object.keys(object).forEach(function (name) {
    var item = [name, object[name]];

    try {
      if (item[0] == "__fc_tpl_id") {
        ret['fc.tpl.id'] = item[1];
        return;
      }

      if (isPHPClass) {
        var val = self.encodeVariable(meta, item[1], objectDepth + 1, 1, overallDepth + 1),
            parts = item[0].split(":"),
            name = parts[parts.length - 1];

        if (parts[0] == "public") {
          val["lang.visibility"] = "public";
        } else if (parts[0] == "protected") {
          val["lang.visibility"] = "protected";
        } else if (parts[0] == "private") {
          val["lang.visibility"] = "private";
        } else if (parts[0] == "undeclared") {
          val["lang.undeclared"] = 1;
        }

        if (parts.length == 2 && parts[1] == "static") {
          val["lang.static"] = 1;
        }

        ret["value"][name] = val;
      } else {
        ret["value"][item[0]] = self.encodeVariable(meta, item[1], objectDepth + 1, 1, overallDepth + 1);
      }
    } catch (e) {
      console.warn(e);
      ret["value"]["__oops__"] = {
        "notice": "Error encoding member (" + e + ")"
      };
    }
  });
  completeWithMeta(meta, ret);
  return ret;
};
},{}],17:[function(require,module,exports){
"use strict";

var WINDOW = window;

var DOMPLATE = require("domplate/dist/domplate.js").domplate;

function Renderer(options) {
  var self = this;
  var loader = options.loader || new exports.Loader(options);
  self.domplate = DOMPLATE;

  function InsightDomplateContext() {
    var self = this;
    self.repForNode = loader.repForNode.bind(loader);
    self.wrapperRepForNode = loader.wrapperRepForNode.bind(loader);

    self.dispatchEvent = function (name, args) {
      if (options.onEvent) {
        try {
          options.onEvent(name, args);
        } catch (err) {
          err.message += "(while dispatching event with name '" + name + "')";
          err.stack[0] += "(while dispatching event with name '" + name + "')";
          throw err;
        }
      }
    };

    self.forNode = function (rootNode) {
      var context = Object.create(self);

      context.getInstanceNode = function (node) {
        if (!rootNode.instances || !rootNode.instances[node.value]) {
          console.error("node", node);
          throw new Error("Object instance for reference '" + node.value + "' not found in 'instances'!");
        }

        return rootNode.instances[node.value];
      };

      return context;
    };
  }

  var context = new InsightDomplateContext();

  function ensureRepsForNodeLoaded(node) {
    try {
      var loadTypes = {};

      function traverse(node) {
        if (node.type) {
          loadTypes["default/" + node.type] = true;
        }

        if (node.meta) {
          if (node.meta["encoder.trimmed"]) {
            loadTypes["default/trimmed"] = true;
          } else if (node.meta.renderer === "structures/table") {
              loadTypes["default/table"] = true;
              loadTypes["default/string"] = true;
              node.type = "table";
            } else if (node.meta.renderer === "structures/trace") {
                loadTypes["default/trace"] = true;
                loadTypes["default/string"] = true;
                node.type = "trace";
              } else if (node.meta["lang"] && node.meta["lang.type"]) {
                if (node.meta["lang"] === "php") {
                  if (node.meta["lang.type"] === "array") {
                    if (node.value[0] && Array.isArray(node.value[0])) {
                      loadTypes["php/array-associative"] = true;
                      node.value.forEach(function (pair) {
                        traverse(pair[0]);
                        traverse(pair[1]);
                      });
                    } else {
                      loadTypes["php/array-indexed"] = true;
                      node.value.forEach(function (node) {
                        traverse(node);
                      });
                    }
                  } else if (node.meta["lang.type"] === "map") {
                    loadTypes["php/array-associative"] = true;
                    node.value.forEach(function (pair) {
                      traverse(pair[0]);
                      traverse(pair[1]);
                    });
                  } else if (node.meta["lang.type"] === "exception") {
                    loadTypes["php/exception"] = true;
                    loadTypes["default/string"] = true;

                    if (node.value.title) {
                      traverse(node.value.title);
                    }

                    if (node.value.stack) {
                      node.value.stack.forEach(function (frame) {
                        frame.args.forEach(function (arg) {
                          traverse(arg);
                        });
                      });
                    }
                  } else {
                    loadTypes[node.meta["lang"] + "/" + node.meta["lang.type"]] = true;

                    if (node.meta["lang.type"] === "table") {
                      loadTypes["default/string"] = true;
                    } else if (node.meta["lang.type"] === "trace") {
                      loadTypes["default/string"] = true;
                    }
                  }
                } else {
                  loadTypes[node.meta["lang"] + "/" + node.meta["lang.type"]] = true;

                  if (node.meta["lang.type"] === "table") {
                    loadTypes["default/string"] = true;
                  } else if (node.meta["lang.type"] === "trace") {
                    loadTypes["default/string"] = true;
                  } else if (node.meta["lang.type"] === "pathtree") {
                    loadTypes["default/string"] = true;
                  } else if (node.meta["lang.type"] === "optiontree") {
                    loadTypes["default/string"] = true;
                  }
                }
              }

          if (node.meta.wrapper) {
            loadTypes[node.meta.wrapper] = true;

            if (node.meta.wrapper === "wrappers/request") {
              if (node.value.title) {
                traverse(node.value.title);
              }
            }
          }
        }

        if (node.value !== null && typeof node.value !== 'undefined') {
          var type = node.type || node.meta["lang.type"];

          if (type === "array") {
            node.value.forEach(function (node) {
              traverse(node);
            });
          } else if (type === "dictionary") {
            Object.keys(node.value).forEach(function (key) {
              traverse(node.value[key]);
            });
          } else if (type === "map") {
            node.value.forEach(function (pair) {
              traverse(pair[0]);
              traverse(pair[1]);
            });
          } else if (type === "reference") {
            if (node.value.instance) {
              traverse(node.value.instance);
            } else if (node.instances && typeof node.value === "number") {
              traverse(node.instances[node.value]);
            } else if (typeof node.getInstance === 'function') {
              traverse(node.getInstance());
            }
          } else if (type === "table") {
            if (node.value.title) {
              traverse(node.value.title);
            }

            if (node.value.header) {
              node.value.header.forEach(function (node) {
                traverse(node);
              });
            }

            if (node.value.body) {
              node.value.body.forEach(function (row) {
                row.forEach(function (cell) {
                  traverse(cell);
                });
              });
            }
          } else if (type === "trace") {
            if (node.value.title) {
              traverse(node.value.title);
            }

            if (node.value.stack) {
              node.value.stack.forEach(function (frame) {
                frame.args.forEach(function (arg) {
                  traverse(arg);
                });
              });
            }
          }
        }
      }

      traverse(node);
      return Promise.all(Object.keys(loadTypes).map(function (type) {
        type = type.split("/");
        var repUri = loader.repUriForType(type[0], type[1]);
        return loader.ensureRepForUri(repUri).then(function () {
          return null;
        });
      }));
    } catch (err) {
      console.error('Error checking node:', node);
      throw err;
    }
  }

  self.renderNodeInto = function (node, selectorOrElement, options) {
    options = options || {};
    var el = typeof selectorOrElement === 'string' && document.querySelector(selectorOrElement) || selectorOrElement;

    if (!el) {
      throw new Error("Could not find element for selector '" + selectorOrElement + "'!");
    }

    return ensureRepsForNodeLoaded(node).then(function () {
      var wrapperRep = context.wrapperRepForNode(node);

      if (wrapperRep) {
        if (!wrapperRep[options.tagName || 'tag']) {
          console.error("node", node);
          console.error("wrapperRep", wrapperRep);
          throw new Error("Could not get tag '".concat(options.tagName || 'tag', "' from wrapper!"));
        }

        wrapperRep[options.tagName || 'tag'].replace({
          context: context.forNode(node),
          node: node
        }, el);
        return;
      }

      var rep = context.repForNode(node);
      rep[options.tagName || 'tag'].replace({
        context: context.forNode(node),
        node: node
      }, el);
    });
  };
}

exports.Renderer = Renderer;

function Loader(options) {
  var self = this;

  if (!options.repsBaseUrl) {
    throw new Error("'options.repsBaseUrl' not set!");
  }

  var loadingReps = {};
  var loadedReps = {};
  self.domplate = DOMPLATE;

  self.ensureRepForUri = function (repUri) {
    if (!loadingReps[repUri]) {
      loadingReps[repUri] = new WINDOW.Promise(function (resolve, reject) {
        var url = options.repsBaseUrl + "/" + repUri;
        DOMPLATE.loadRep(url, {
          cssBaseUrl: options.repsBaseUrl.replace(/\/?$/, "/")
        }, function (rep) {
          setTimeout(function () {
            rep.__ensureCssInjected();
          }, 0);
          loadedReps[repUri] = rep;
          resolve(rep);
        }, function (err) {
          var error = new Error("Error loading rep for uri '" + repUri + "' from '" + url + "'!");
          error.previous = err;
          reject(error);
        });
      });
    }

    return loadingReps[repUri];
  };

  self.repUriForType = function (lang, type) {
    type = type || "unknown";
    return lang + "/" + type;
  };

  function repUriForNode(node) {
    var lang = "default";
    var type = node.type;

    if (node.meta) {
      if (node.meta["encoder.trimmed"]) {
        type = "trimmed";
      } else if (node.meta.renderer === "structures/table") {
          type = "table";
        } else if (node.meta.renderer === "structures/trace") {
            type = "trace";
          } else if (node.meta["lang"] && node.meta["lang.type"]) {
            lang = node.meta["lang"];
            type = node.meta["lang.type"];

            if (lang === "php") {
              if (type === "array") {
                if (node.value[0] && Array.isArray(node.value[0])) {
                  type = "array-associative";
                } else {
                  type = "array-indexed";
                }
              } else if (type === "map") {
                type = "array-associative";
              }
            }
          } else if (node.meta["lang.id"] === "registry.pinf.org/cadorn.org/github/renderers/packages/php/master") {
            lang = "php";
            type = node.meta["lang.type"];

            if (node.meta["renderer"] === "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
              lang = "default";
              type = "table";
            }
          }
    }

    if (!type) {
      console.error("node", node);
      console.error("lang", lang);
      throw new Error('Could not determine type for node!');
    }

    return self.repUriForType(lang, type);
  }

  self.repForNode = function (node) {
    var repUri = repUriForNode(node);

    if (!loadedReps[repUri]) {
      throw new Error("Rep for uri '" + repUri + "' not loaded!");
    }

    return loadedReps[repUri];
  };

  self.wrapperRepForNode = function (node) {
    if (node.meta && node.meta.wrapper) {
      if (!loadedReps[node.meta.wrapper]) {
        throw new Error("Wrapper Rep for uri '" + node.meta.wrapper + "' not loaded!");
      }

      return loadedReps[node.meta.wrapper];
    }

    return null;
  };
}

exports.Loader = Loader;
},{"domplate/dist/domplate.js":4}],18:[function(require,module,exports){
"use strict";

var hashClear = require('./_hashClear'),
    hashDelete = require('./_hashDelete'),
    hashGet = require('./_hashGet'),
    hashHas = require('./_hashHas'),
    hashSet = require('./_hashSet');

function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
module.exports = Hash;
},{"./_hashClear":59,"./_hashDelete":60,"./_hashGet":61,"./_hashHas":62,"./_hashSet":63}],19:[function(require,module,exports){
"use strict";

var listCacheClear = require('./_listCacheClear'),
    listCacheDelete = require('./_listCacheDelete'),
    listCacheGet = require('./_listCacheGet'),
    listCacheHas = require('./_listCacheHas'),
    listCacheSet = require('./_listCacheSet');

function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
module.exports = ListCache;
},{"./_listCacheClear":70,"./_listCacheDelete":71,"./_listCacheGet":72,"./_listCacheHas":73,"./_listCacheSet":74}],20:[function(require,module,exports){
"use strict";

var getNative = require('./_getNative'),
    root = require('./_root');

var Map = getNative(root, 'Map');
module.exports = Map;
},{"./_getNative":55,"./_root":86}],21:[function(require,module,exports){
"use strict";

var mapCacheClear = require('./_mapCacheClear'),
    mapCacheDelete = require('./_mapCacheDelete'),
    mapCacheGet = require('./_mapCacheGet'),
    mapCacheHas = require('./_mapCacheHas'),
    mapCacheSet = require('./_mapCacheSet');

function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
module.exports = MapCache;
},{"./_mapCacheClear":75,"./_mapCacheDelete":76,"./_mapCacheGet":77,"./_mapCacheHas":78,"./_mapCacheSet":79}],22:[function(require,module,exports){
"use strict";

var ListCache = require('./_ListCache'),
    stackClear = require('./_stackClear'),
    stackDelete = require('./_stackDelete'),
    stackGet = require('./_stackGet'),
    stackHas = require('./_stackHas'),
    stackSet = require('./_stackSet');

function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
module.exports = Stack;
},{"./_ListCache":19,"./_stackClear":90,"./_stackDelete":91,"./_stackGet":92,"./_stackHas":93,"./_stackSet":94}],23:[function(require,module,exports){
"use strict";

var root = require('./_root');

var Symbol = root.Symbol;
module.exports = Symbol;
},{"./_root":86}],24:[function(require,module,exports){
"use strict";

var root = require('./_root');

var Uint8Array = root.Uint8Array;
module.exports = Uint8Array;
},{"./_root":86}],25:[function(require,module,exports){
"use strict";

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);

    case 1:
      return func.call(thisArg, args[0]);

    case 2:
      return func.call(thisArg, args[0], args[1]);

    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }

  return func.apply(thisArg, args);
}

module.exports = apply;
},{}],26:[function(require,module,exports){
"use strict";

var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isIndex = require('./_isIndex'),
    isTypedArray = require('./isTypedArray');

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;

function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isBuff && (key == 'offset' || key == 'parent') || isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}

module.exports = arrayLikeKeys;
},{"./_baseTimes":42,"./_isIndex":65,"./isArguments":99,"./isArray":100,"./isBuffer":103,"./isTypedArray":109}],27:[function(require,module,exports){
"use strict";

var baseAssignValue = require('./_baseAssignValue'),
    eq = require('./eq');

function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;
},{"./_baseAssignValue":30,"./eq":97}],28:[function(require,module,exports){
"use strict";

var baseAssignValue = require('./_baseAssignValue'),
    eq = require('./eq');

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;

function assignValue(object, key, value) {
  var objValue = object[key];

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;
},{"./_baseAssignValue":30,"./eq":97}],29:[function(require,module,exports){
"use strict";

var eq = require('./eq');

function assocIndexOf(array, key) {
  var length = array.length;

  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }

  return -1;
}

module.exports = assocIndexOf;
},{"./eq":97}],30:[function(require,module,exports){
"use strict";

var defineProperty = require('./_defineProperty');

function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;
},{"./_defineProperty":52}],31:[function(require,module,exports){
"use strict";

var isObject = require('./isObject');

var objectCreate = Object.create;

var baseCreate = function () {
  function object() {}

  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }

    if (objectCreate) {
      return objectCreate(proto);
    }

    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();

module.exports = baseCreate;
},{"./isObject":106}],32:[function(require,module,exports){
"use strict";

var createBaseFor = require('./_createBaseFor');

var baseFor = createBaseFor();
module.exports = baseFor;
},{"./_createBaseFor":51}],33:[function(require,module,exports){
"use strict";

var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

module.exports = baseGetTag;
},{"./_Symbol":23,"./_getRawTag":57,"./_objectToString":83}],34:[function(require,module,exports){
"use strict";

var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

var argsTag = '[object Arguments]';

function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;
},{"./_baseGetTag":33,"./isObjectLike":107}],35:[function(require,module,exports){
"use strict";

var isFunction = require('./isFunction'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype,
    objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }

  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;
},{"./_isMasked":68,"./_toSource":95,"./isFunction":104,"./isObject":106}],36:[function(require,module,exports){
"use strict";

var baseGetTag = require('./_baseGetTag'),
    isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;
},{"./_baseGetTag":33,"./isLength":105,"./isObjectLike":107}],37:[function(require,module,exports){
"use strict";

var isObject = require('./isObject'),
    isPrototype = require('./_isPrototype'),
    nativeKeysIn = require('./_nativeKeysIn');

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;

function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }

  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }

  return result;
}

module.exports = baseKeysIn;
},{"./_isPrototype":69,"./_nativeKeysIn":81,"./isObject":106}],38:[function(require,module,exports){
"use strict";

var Stack = require('./_Stack'),
    assignMergeValue = require('./_assignMergeValue'),
    baseFor = require('./_baseFor'),
    baseMergeDeep = require('./_baseMergeDeep'),
    isObject = require('./isObject'),
    keysIn = require('./keysIn'),
    safeGet = require('./_safeGet');

function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }

  baseFor(source, function (srcValue, key) {
    stack || (stack = new Stack());

    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }

      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;
},{"./_Stack":22,"./_assignMergeValue":27,"./_baseFor":32,"./_baseMergeDeep":39,"./_safeGet":87,"./isObject":106,"./keysIn":110}],39:[function(require,module,exports){
"use strict";

var assignMergeValue = require('./_assignMergeValue'),
    cloneBuffer = require('./_cloneBuffer'),
    cloneTypedArray = require('./_cloneTypedArray'),
    copyArray = require('./_copyArray'),
    initCloneObject = require('./_initCloneObject'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isArrayLikeObject = require('./isArrayLikeObject'),
    isBuffer = require('./isBuffer'),
    isFunction = require('./isFunction'),
    isObject = require('./isObject'),
    isPlainObject = require('./isPlainObject'),
    isTypedArray = require('./isTypedArray'),
    safeGet = require('./_safeGet'),
    toPlainObject = require('./toPlainObject');

function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }

  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;

    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;

      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }

  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }

  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;
},{"./_assignMergeValue":27,"./_cloneBuffer":45,"./_cloneTypedArray":46,"./_copyArray":47,"./_initCloneObject":64,"./_safeGet":87,"./isArguments":99,"./isArray":100,"./isArrayLikeObject":102,"./isBuffer":103,"./isFunction":104,"./isObject":106,"./isPlainObject":108,"./isTypedArray":109,"./toPlainObject":113}],40:[function(require,module,exports){
"use strict";

var identity = require('./identity'),
    overRest = require('./_overRest'),
    setToString = require('./_setToString');

function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;
},{"./_overRest":85,"./_setToString":88,"./identity":98}],41:[function(require,module,exports){
"use strict";

var constant = require('./constant'),
    defineProperty = require('./_defineProperty'),
    identity = require('./identity');

var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
module.exports = baseSetToString;
},{"./_defineProperty":52,"./constant":96,"./identity":98}],42:[function(require,module,exports){
"use strict";

function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}

module.exports = baseTimes;
},{}],43:[function(require,module,exports){
"use strict";

function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

module.exports = baseUnary;
},{}],44:[function(require,module,exports){
"use strict";

var Uint8Array = require('./_Uint8Array');

function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;
},{"./_Uint8Array":24}],45:[function(require,module,exports){
"use strict";

var root = require('./_root');

var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }

  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
},{"./_root":86}],46:[function(require,module,exports){
"use strict";

var cloneArrayBuffer = require('./_cloneArrayBuffer');

function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;
},{"./_cloneArrayBuffer":44}],47:[function(require,module,exports){
"use strict";

function copyArray(source, array) {
  var index = -1,
      length = source.length;
  array || (array = Array(length));

  while (++index < length) {
    array[index] = source[index];
  }

  return array;
}

module.exports = copyArray;
},{}],48:[function(require,module,exports){
"use strict";

var assignValue = require('./_assignValue'),
    baseAssignValue = require('./_baseAssignValue');

function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }

    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }

  return object;
}

module.exports = copyObject;
},{"./_assignValue":28,"./_baseAssignValue":30}],49:[function(require,module,exports){
"use strict";

var root = require('./_root');

var coreJsData = root['__core-js_shared__'];
module.exports = coreJsData;
},{"./_root":86}],50:[function(require,module,exports){
"use strict";

var baseRest = require('./_baseRest'),
    isIterateeCall = require('./_isIterateeCall');

function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }

    object = Object(object);

    while (++index < length) {
      var source = sources[index];

      if (source) {
        assigner(object, source, index, customizer);
      }
    }

    return object;
  });
}

module.exports = createAssigner;
},{"./_baseRest":40,"./_isIterateeCall":66}],51:[function(require,module,exports){
"use strict";

function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];

      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }

    return object;
  };
}

module.exports = createBaseFor;
},{}],52:[function(require,module,exports){
"use strict";

var getNative = require('./_getNative');

var defineProperty = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

module.exports = defineProperty;
},{"./_getNative":55}],53:[function(require,module,exports){
(function (global){
"use strict";

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
module.exports = freeGlobal;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],54:[function(require,module,exports){
"use strict";

var isKeyable = require('./_isKeyable');

function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

module.exports = getMapData;
},{"./_isKeyable":67}],55:[function(require,module,exports){
"use strict";

var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;
},{"./_baseIsNative":35,"./_getValue":58}],56:[function(require,module,exports){
"use strict";

var overArg = require('./_overArg');

var getPrototype = overArg(Object.getPrototypeOf, Object);
module.exports = getPrototype;
},{"./_overArg":84}],57:[function(require,module,exports){
"use strict";

var Symbol = require('./_Symbol');

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);

  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}

module.exports = getRawTag;
},{"./_Symbol":23}],58:[function(require,module,exports){
"use strict";

function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;
},{}],59:[function(require,module,exports){
"use strict";

var nativeCreate = require('./_nativeCreate');

function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;
},{"./_nativeCreate":80}],60:[function(require,module,exports){
"use strict";

function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;
},{}],61:[function(require,module,exports){
"use strict";

var nativeCreate = require('./_nativeCreate');

var HASH_UNDEFINED = '__lodash_hash_undefined__';
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;

function hashGet(key) {
  var data = this.__data__;

  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }

  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;
},{"./_nativeCreate":80}],62:[function(require,module,exports){
"use strict";

var nativeCreate = require('./_nativeCreate');

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;

function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

module.exports = hashHas;
},{"./_nativeCreate":80}],63:[function(require,module,exports){
"use strict";

var nativeCreate = require('./_nativeCreate');

var HASH_UNDEFINED = '__lodash_hash_undefined__';

function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;
},{"./_nativeCreate":80}],64:[function(require,module,exports){
"use strict";

var baseCreate = require('./_baseCreate'),
    getPrototype = require('./_getPrototype'),
    isPrototype = require('./_isPrototype');

function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}

module.exports = initCloneObject;
},{"./_baseCreate":31,"./_getPrototype":56,"./_isPrototype":69}],65:[function(require,module,exports){
"use strict";

var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;

function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;
},{}],66:[function(require,module,exports){
"use strict";

var eq = require('./eq'),
    isArrayLike = require('./isArrayLike'),
    isIndex = require('./_isIndex'),
    isObject = require('./isObject');

function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }

  var type = typeof index;

  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }

  return false;
}

module.exports = isIterateeCall;
},{"./_isIndex":65,"./eq":97,"./isArrayLike":101,"./isObject":106}],67:[function(require,module,exports){
"use strict";

function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

module.exports = isKeyable;
},{}],68:[function(require,module,exports){
"use strict";

var coreJsData = require('./_coreJsData');

var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();

function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

module.exports = isMasked;
},{"./_coreJsData":49}],69:[function(require,module,exports){
"use strict";

var objectProto = Object.prototype;

function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}

module.exports = isPrototype;
},{}],70:[function(require,module,exports){
"use strict";

function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;
},{}],71:[function(require,module,exports){
"use strict";

var assocIndexOf = require('./_assocIndexOf');

var arrayProto = Array.prototype;
var splice = arrayProto.splice;

function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }

  var lastIndex = data.length - 1;

  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }

  --this.size;
  return true;
}

module.exports = listCacheDelete;
},{"./_assocIndexOf":29}],72:[function(require,module,exports){
"use strict";

var assocIndexOf = require('./_assocIndexOf');

function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;
},{"./_assocIndexOf":29}],73:[function(require,module,exports){
"use strict";

var assocIndexOf = require('./_assocIndexOf');

function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;
},{"./_assocIndexOf":29}],74:[function(require,module,exports){
"use strict";

var assocIndexOf = require('./_assocIndexOf');

function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }

  return this;
}

module.exports = listCacheSet;
},{"./_assocIndexOf":29}],75:[function(require,module,exports){
"use strict";

var Hash = require('./_Hash'),
    ListCache = require('./_ListCache'),
    Map = require('./_Map');

function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}

module.exports = mapCacheClear;
},{"./_Hash":18,"./_ListCache":19,"./_Map":20}],76:[function(require,module,exports){
"use strict";

var getMapData = require('./_getMapData');

function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;
},{"./_getMapData":54}],77:[function(require,module,exports){
"use strict";

var getMapData = require('./_getMapData');

function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;
},{"./_getMapData":54}],78:[function(require,module,exports){
"use strict";

var getMapData = require('./_getMapData');

function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;
},{"./_getMapData":54}],79:[function(require,module,exports){
"use strict";

var getMapData = require('./_getMapData');

function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;
},{"./_getMapData":54}],80:[function(require,module,exports){
"use strict";

var getNative = require('./_getNative');

var nativeCreate = getNative(Object, 'create');
module.exports = nativeCreate;
},{"./_getNative":55}],81:[function(require,module,exports){
"use strict";

function nativeKeysIn(object) {
  var result = [];

  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }

  return result;
}

module.exports = nativeKeysIn;
},{}],82:[function(require,module,exports){
"use strict";

var freeGlobal = require('./_freeGlobal');

var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal.process;

var nodeUtil = function () {
  try {
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

module.exports = nodeUtil;
},{"./_freeGlobal":53}],83:[function(require,module,exports){
"use strict";

var objectProto = Object.prototype;
var nativeObjectToString = objectProto.toString;

function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;
},{}],84:[function(require,module,exports){
"use strict";

function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;
},{}],85:[function(require,module,exports){
"use strict";

var apply = require('./_apply');

var nativeMax = Math.max;

function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }

    index = -1;
    var otherArgs = Array(start + 1);

    while (++index < start) {
      otherArgs[index] = args[index];
    }

    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;
},{"./_apply":25}],86:[function(require,module,exports){
"use strict";

var freeGlobal = require('./_freeGlobal');

var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function('return this')();
module.exports = root;
},{"./_freeGlobal":53}],87:[function(require,module,exports){
"use strict";

function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;
},{}],88:[function(require,module,exports){
"use strict";

var baseSetToString = require('./_baseSetToString'),
    shortOut = require('./_shortOut');

var setToString = shortOut(baseSetToString);
module.exports = setToString;
},{"./_baseSetToString":41,"./_shortOut":89}],89:[function(require,module,exports){
"use strict";

var HOT_COUNT = 800,
    HOT_SPAN = 16;
var nativeNow = Date.now;

function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;

    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }

    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;
},{}],90:[function(require,module,exports){
"use strict";

var ListCache = require('./_ListCache');

function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

module.exports = stackClear;
},{"./_ListCache":19}],91:[function(require,module,exports){
"use strict";

function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}

module.exports = stackDelete;
},{}],92:[function(require,module,exports){
"use strict";

function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;
},{}],93:[function(require,module,exports){
"use strict";

function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;
},{}],94:[function(require,module,exports){
"use strict";

var ListCache = require('./_ListCache'),
    Map = require('./_Map'),
    MapCache = require('./_MapCache');

var LARGE_ARRAY_SIZE = 200;

function stackSet(key, value) {
  var data = this.__data__;

  if (data instanceof ListCache) {
    var pairs = data.__data__;

    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }

    data = this.__data__ = new MapCache(pairs);
  }

  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;
},{"./_ListCache":19,"./_Map":20,"./_MapCache":21}],95:[function(require,module,exports){
"use strict";

var funcProto = Function.prototype;
var funcToString = funcProto.toString;

function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}

    try {
      return func + '';
    } catch (e) {}
  }

  return '';
}

module.exports = toSource;
},{}],96:[function(require,module,exports){
"use strict";

function constant(value) {
  return function () {
    return value;
  };
}

module.exports = constant;
},{}],97:[function(require,module,exports){
"use strict";

function eq(value, other) {
  return value === other || value !== value && other !== other;
}

module.exports = eq;
},{}],98:[function(require,module,exports){
"use strict";

function identity(value) {
  return value;
}

module.exports = identity;
},{}],99:[function(require,module,exports){
"use strict";

var baseIsArguments = require('./_baseIsArguments'),
    isObjectLike = require('./isObjectLike');

var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var propertyIsEnumerable = objectProto.propertyIsEnumerable;
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};
module.exports = isArguments;
},{"./_baseIsArguments":34,"./isObjectLike":107}],100:[function(require,module,exports){
"use strict";

var isArray = Array.isArray;
module.exports = isArray;
},{}],101:[function(require,module,exports){
"use strict";

var isFunction = require('./isFunction'),
    isLength = require('./isLength');

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;
},{"./isFunction":104,"./isLength":105}],102:[function(require,module,exports){
"use strict";

var isArrayLike = require('./isArrayLike'),
    isObjectLike = require('./isObjectLike');

function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;
},{"./isArrayLike":101,"./isObjectLike":107}],103:[function(require,module,exports){
"use strict";

var root = require('./_root'),
    stubFalse = require('./stubFalse');

var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? root.Buffer : undefined;
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
var isBuffer = nativeIsBuffer || stubFalse;
module.exports = isBuffer;
},{"./_root":86,"./stubFalse":112}],104:[function(require,module,exports){
"use strict";

var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }

  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;
},{"./_baseGetTag":33,"./isObject":106}],105:[function(require,module,exports){
"use strict";

var MAX_SAFE_INTEGER = 9007199254740991;

function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;
},{}],106:[function(require,module,exports){
"use strict";

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;
},{}],107:[function(require,module,exports){
"use strict";

function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;
},{}],108:[function(require,module,exports){
"use strict";

var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

var objectTag = '[object Object]';
var funcProto = Function.prototype,
    objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objectCtorString = funcToString.call(Object);

function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }

  var proto = getPrototype(value);

  if (proto === null) {
    return true;
  }

  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;
},{"./_baseGetTag":33,"./_getPrototype":56,"./isObjectLike":107}],109:[function(require,module,exports){
"use strict";

var baseIsTypedArray = require('./_baseIsTypedArray'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
module.exports = isTypedArray;
},{"./_baseIsTypedArray":36,"./_baseUnary":43,"./_nodeUtil":82}],110:[function(require,module,exports){
"use strict";

var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeysIn = require('./_baseKeysIn'),
    isArrayLike = require('./isArrayLike');

function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;
},{"./_arrayLikeKeys":26,"./_baseKeysIn":37,"./isArrayLike":101}],111:[function(require,module,exports){
"use strict";

var baseMerge = require('./_baseMerge'),
    createAssigner = require('./_createAssigner');

var merge = createAssigner(function (object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});
module.exports = merge;
},{"./_baseMerge":38,"./_createAssigner":50}],112:[function(require,module,exports){
"use strict";

function stubFalse() {
  return false;
}

module.exports = stubFalse;
},{}],113:[function(require,module,exports){
"use strict";

var copyObject = require('./_copyObject'),
    keysIn = require('./keysIn');

function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;
},{"./_copyObject":48,"./keysIn":110}],114:[function(require,module,exports){
'use strict';

var inherits = require('inherits');

var HashBase = require('hash-base');

var Buffer = require('safe-buffer').Buffer;

var ARRAY16 = new Array(16);

function MD5() {
  HashBase.call(this, 64);
  this._a = 0x67452301;
  this._b = 0xefcdab89;
  this._c = 0x98badcfe;
  this._d = 0x10325476;
}

inherits(MD5, HashBase);

MD5.prototype._update = function () {
  var M = ARRAY16;

  for (var i = 0; i < 16; ++i) {
    M[i] = this._block.readInt32LE(i * 4);
  }

  var a = this._a;
  var b = this._b;
  var c = this._c;
  var d = this._d;
  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7);
  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12);
  c = fnF(c, d, a, b, M[2], 0x242070db, 17);
  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22);
  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7);
  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12);
  c = fnF(c, d, a, b, M[6], 0xa8304613, 17);
  b = fnF(b, c, d, a, M[7], 0xfd469501, 22);
  a = fnF(a, b, c, d, M[8], 0x698098d8, 7);
  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12);
  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17);
  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22);
  a = fnF(a, b, c, d, M[12], 0x6b901122, 7);
  d = fnF(d, a, b, c, M[13], 0xfd987193, 12);
  c = fnF(c, d, a, b, M[14], 0xa679438e, 17);
  b = fnF(b, c, d, a, M[15], 0x49b40821, 22);
  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5);
  d = fnG(d, a, b, c, M[6], 0xc040b340, 9);
  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14);
  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20);
  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5);
  d = fnG(d, a, b, c, M[10], 0x02441453, 9);
  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14);
  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20);
  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5);
  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9);
  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14);
  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20);
  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5);
  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9);
  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14);
  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20);
  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4);
  d = fnH(d, a, b, c, M[8], 0x8771f681, 11);
  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16);
  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23);
  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4);
  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11);
  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16);
  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23);
  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4);
  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11);
  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16);
  b = fnH(b, c, d, a, M[6], 0x04881d05, 23);
  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4);
  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11);
  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16);
  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23);
  a = fnI(a, b, c, d, M[0], 0xf4292244, 6);
  d = fnI(d, a, b, c, M[7], 0x432aff97, 10);
  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15);
  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21);
  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6);
  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10);
  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15);
  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21);
  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6);
  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10);
  c = fnI(c, d, a, b, M[6], 0xa3014314, 15);
  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21);
  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6);
  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10);
  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15);
  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21);
  this._a = this._a + a | 0;
  this._b = this._b + b | 0;
  this._c = this._c + c | 0;
  this._d = this._d + d | 0;
};

MD5.prototype._digest = function () {
  this._block[this._blockOffset++] = 0x80;

  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64);

    this._update();

    this._blockOffset = 0;
  }

  this._block.fill(0, this._blockOffset, 56);

  this._block.writeUInt32LE(this._length[0], 56);

  this._block.writeUInt32LE(this._length[1], 60);

  this._update();

  var buffer = Buffer.allocUnsafe(16);
  buffer.writeInt32LE(this._a, 0);
  buffer.writeInt32LE(this._b, 4);
  buffer.writeInt32LE(this._c, 8);
  buffer.writeInt32LE(this._d, 12);
  return buffer;
};

function rotl(x, n) {
  return x << n | x >>> 32 - n;
}

function fnF(a, b, c, d, m, k, s) {
  return rotl(a + (b & c | ~b & d) + m + k | 0, s) + b | 0;
}

function fnG(a, b, c, d, m, k, s) {
  return rotl(a + (b & d | c & ~d) + m + k | 0, s) + b | 0;
}

function fnH(a, b, c, d, m, k, s) {
  return rotl(a + (b ^ c ^ d) + m + k | 0, s) + b | 0;
}

function fnI(a, b, c, d, m, k, s) {
  return rotl(a + (c ^ (b | ~d)) + m + k | 0, s) + b | 0;
}

module.exports = MD5;
},{"hash-base":11,"inherits":14,"safe-buffer":131}],115:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],116:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError = function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
}

function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
}

function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
}

function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;
},{}],117:[function(require,module,exports){
(function (process){
'use strict';

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};

module.exports = Duplex;

var Readable = require('./_stream_readable');

var Writable = require('./_stream_writable');

require('inherits')(Duplex, Readable);

{
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function onend() {
  if (this._writableState.ended) return;
  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this,require('_process'))
},{"./_stream_readable":119,"./_stream_writable":121,"_process":115,"inherits":14}],118:[function(require,module,exports){
'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

require('inherits')(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":120,"inherits":14}],119:[function(require,module,exports){
(function (process,global){
'use strict';

module.exports = Readable;
var Duplex;
Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};

var Stream = require('./internal/streams/stream');

var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var debugUtil = require('util');

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}

var BufferList = require('./internal/streams/buffer_list');

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

require('inherits')(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;
  this.sync = true;
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true;
  this.emitClose = options.emitClose !== false;
  this.autoDestroy = !!options.autoDestroy;
  this.destroyed = false;
  this.defaultEncoding = options.defaultEncoding || 'utf8';
  this.awaitDrain = 0;
  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options);
  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex);
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    if (!this._readableState) {
      return;
    }

    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
};

Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  }

  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  this._readableState.encoding = this._readableState.decoder.encoding;
  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
}

function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }

  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
}

Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false;

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  var doRead = state.needReadable;
  debug('need readable', doRead);

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    if (state.length === 0) state.needReadable = true;

    this._read(state.highWaterMark);

    state.sync = false;
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    if (!state.ended) state.needReadable = true;
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    emitReadable(stream);
  } else {
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
}

function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) break;
  }

  state.readingMore = false;
}

Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup');
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  }

  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  }

  prependListener(dest, 'error', onerror);

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  dest.emit('pipe', src);

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };
  if (state.pipesCount === 0) return this;

  if (state.pipesCount === 1) {
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  if (!dest) {
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  }

  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    state.readableListening = this.listenerCount('readable') > 0;
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    state.flowing = true;
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume');
    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
}

Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
});
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
});

function fromList(n, state) {
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":116,"./_stream_duplex":117,"./internal/streams/async_iterator":122,"./internal/streams/buffer_list":123,"./internal/streams/destroy":124,"./internal/streams/from":126,"./internal/streams/state":128,"./internal/streams/stream":129,"_process":115,"buffer":3,"events":6,"inherits":14,"string_decoder/":132,"util":2}],120:[function(require,module,exports){
'use strict';

module.exports = Transform;

var _require$codes = require('../errors').codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = require('./_stream_duplex');

require('inherits')(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };
  this._readableState.needReadable = true;
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) stream.push(data);
  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":116,"./_stream_duplex":117,"inherits":14}],121:[function(require,module,exports){
(function (process,global){
'use strict';

module.exports = Writable;

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}

var Duplex;
Writable.WritableState = WritableState;
var internalUtil = {
  deprecate: require('util-deprecate')
};

var Stream = require('./internal/streams/stream');

var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

require('inherits')(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);
  this.finalCalled = false;
  this.needDrain = false;
  this.ending = false;
  this.ended = false;
  this.finished = false;
  this.destroyed = false;
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;
  this.defaultEncoding = options.defaultEncoding || 'utf8';
  this.length = 0;
  this.writing = false;
  this.corked = 0;
  this.sync = true;
  this.bufferProcessing = false;

  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  this.writecb = null;
  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null;
  this.pendingcb = 0;
  this.prefinished = false;
  this.errorEmitted = false;
  this.emitClose = options.emitClose !== false;
  this.autoDestroy = !!options.autoDestroy;
  this.bufferedRequestCount = 0;
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END();
  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
}

function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark;
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    process.nextTick(cb, er);
    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish);
    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    if (!this._writableState) {
      return;
    }

    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":116,"./_stream_duplex":117,"./internal/streams/destroy":124,"./internal/streams/state":128,"./internal/streams/stream":129,"_process":115,"buffer":3,"inherits":14,"util-deprecate":134}],122:[function(require,module,exports){
(function (process){
'use strict';

var _Object$setPrototypeO;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var finished = require('./end-of-stream');

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read();

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    }

    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject];

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;
}).call(this,require('_process'))
},{"./end-of-stream":125,"_process":115}],123:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var _require = require('buffer'),
    Buffer = _require.Buffer;

var _require2 = require('util'),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    }
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        ret = this.shift();
      } else {
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }
  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    }
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    }
  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        depth: 0,
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();
},{"buffer":3,"util":2}],124:[function(require,module,exports){
(function (process){
'use strict';

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  }

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this,require('_process'))
},{"_process":115}],125:[function(require,module,exports){
'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;
},{"../../../errors":116}],126:[function(require,module,exports){
"use strict";

module.exports = function () {
  throw new Error('Readable.from is not available in the browser');
};
},{}],127:[function(require,module,exports){
'use strict';

var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = require('../../../errors').codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;
},{"../../../errors":116,"./end-of-stream":125}],128:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  }

  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":116}],129:[function(require,module,exports){
"use strict";

module.exports = require('events').EventEmitter;
},{"events":6}],130:[function(require,module,exports){
"use strict";

exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');
exports.finished = require('./lib/internal/streams/end-of-stream.js');
exports.pipeline = require('./lib/internal/streams/pipeline.js');
},{"./lib/_stream_duplex.js":117,"./lib/_stream_passthrough.js":118,"./lib/_stream_readable.js":119,"./lib/_stream_transform.js":120,"./lib/_stream_writable.js":121,"./lib/internal/streams/end-of-stream.js":125,"./lib/internal/streams/pipeline.js":127}],131:[function(require,module,exports){
"use strict";

var buffer = require('buffer');

var Buffer = buffer.Buffer;

function copyProps(src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}

if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }

  return Buffer(arg, encodingOrOffset, length);
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }

  var buf = Buffer(size);

  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }

  return buf;
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }

  return Buffer(size);
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }

  return buffer.SlowBuffer(size);
};
},{"buffer":3}],132:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;

  switch (encoding && encoding.toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;

  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';

      case 'latin1':
      case 'binary':
        return 'latin1';

      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;

      default:
        if (retried) return;
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
}

;

function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);

  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

exports.StringDecoder = StringDecoder;

function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;

  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;

    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;

    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;

    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }

  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;

  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }

  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;
StringDecoder.prototype.text = utf8Text;

StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }

  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);

  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }

  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);

  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }

  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);

  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }

    return nb;
  }

  return 0;
}

function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }

  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }

    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;

  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }

  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);

    if (r) {
      var c = r.charCodeAt(r.length - 1);

      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }

    return r;
  }

  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';

  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }

  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;

  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }

  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":133}],133:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"buffer":3,"dup":12}],134:[function(require,module,exports){
(function (global){
"use strict";

module.exports = deprecate;

function deprecate(fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;

  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }

      warned = true;
    }

    return fn.apply(this, arguments);
  }

  return deprecated;
}

function config(name) {
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }

  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],135:[function(require,module,exports){
"use strict";

var CHANNEL = require("./channel");

var HEADER_PREFIX = 'x-wf-';
var requestIndex = 0;

var HttpHeaderChannel = exports.HttpHeaderChannel = function (options) {
  if (!(this instanceof exports.HttpHeaderChannel)) return new exports.HttpHeaderChannel(options);

  this.__construct(options);

  this.HEADER_PREFIX = HEADER_PREFIX;
};

HttpHeaderChannel.prototype = CHANNEL.Channel();

HttpHeaderChannel.prototype.getFirebugNetMonitorListener = function () {
  if (!this.firebugNetMonitorListener) {
    var self = this;
    this.firebugNetMonitorListener = {
      onResponseBody: function (context, file) {
        if (file) {
          try {
            var requestId = false;

            for (var i = file.requestHeaders.length - 1; i >= 0; i--) {
              if (file.requestHeaders[i].name == "x-request-id") {
                requestId = file.requestHeaders[i].value;
                break;
              }
            }

            self.parseReceived(file.responseHeaders, {
              "FirebugNetMonitorListener": {
                "context": context,
                "file": file
              },
              "id": requestId || "id:" + file.href + ":" + requestIndex++,
              "url": file.href,
              "method": file.method,
              "requestHeaders": file.requestHeaders
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
  }

  return this.firebugNetMonitorListener;
};

HttpHeaderChannel.prototype.getMozillaRequestObserverListener = function (globals) {
  if (!this.mozillaRequestObserverListener) {
    var self = this;
    this.mozillaRequestObserverListener = {
      observe: function (subject, topic, data) {
        if (topic == "http-on-examine-response") {
          var httpChannel = subject.QueryInterface(globals.Ci.nsIHttpChannel);

          try {
            var requestHeaders = [];
            var requestId;
            httpChannel.visitRequestHeaders({
              visitHeader: function (name, value) {
                requestHeaders.push({
                  name: name,
                  value: value
                });

                if (name.toLowerCase() == "x-request-id") {
                  requestId = value;
                }
              }
            });
            var responseHeaders = [],
                contentType = false;
            httpChannel.visitResponseHeaders({
              visitHeader: function (name, value) {
                responseHeaders.push({
                  name: name,
                  value: value
                });
                if (name.toLowerCase() == "content-type") contentType = value;
              }
            });
            self.parseReceived(responseHeaders, {
              "MozillaRequestObserverListener": {
                "httpChannel": httpChannel
              },
              "id": requestId || "id:" + httpChannel.URI.spec + ":" + requestIndex++,
              "url": httpChannel.URI.spec,
              "hostname": httpChannel.URI.host,
              "port": httpChannel.URI.port,
              "method": httpChannel.requestMethod,
              "status": httpChannel.responseStatus,
              "contentType": contentType,
              "requestHeaders": requestHeaders
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
  }

  return this.mozillaRequestObserverListener;
};
},{"./channel":138}],136:[function(require,module,exports){
"use strict";

var CHANNEL = require("./channel");

var HEADER_PREFIX = 'x-wf-';

var PostMessageChannel = exports.PostMessageChannel = function () {
  if (!(this instanceof exports.PostMessageChannel)) return new exports.PostMessageChannel();

  this.__construct();

  this.HEADER_PREFIX = HEADER_PREFIX;
  this.postMessageSender = null;
};

PostMessageChannel.prototype = CHANNEL.Channel();

PostMessageChannel.prototype.enqueueOutgoing = function (message, bypassReceivers) {
  var ret = this._enqueueOutgoing(message, bypassReceivers);

  var parts = {};
  this.flush({
    setMessagePart: function (key, value) {
      parts[key] = value;
    },
    getMessagePart: function (key) {
      if (typeof parts[key] == "undefined") return null;
      return parts[key];
    }
  });
  var self = this;
  var payload = [];
  Object.keys(parts).forEach(function (name) {
    payload.push(name + ": " + parts[name]);
  });
  self.postMessageSender(payload.join("\n"));
  return ret;
};

PostMessageChannel.prototype.setPostMessageSender = function (postMessage) {
  this.postMessageSender = postMessage;
};

PostMessageChannel.prototype.parseReceivedPostMessage = function (msg) {
  if (this.status != "open") this.open();
  this.parseReceived(msg, null, {
    skipChannelOpen: true,
    skipChannelClose: true,
    enableContinuousParsing: true
  });
};
},{"./channel":138}],137:[function(require,module,exports){
"use strict";

var CHANNEL = require("./channel");

var HEADER_PREFIX = '#x-wf-';

var ShellCommandChannel = exports.ShellCommandChannel = function () {
  if (!(this instanceof exports.ShellCommandChannel)) return new exports.ShellCommandChannel();

  this.__construct();

  this.HEADER_PREFIX = HEADER_PREFIX;
};

ShellCommandChannel.prototype = CHANNEL.Channel();
},{"./channel":138}],138:[function(require,module,exports){
"use strict";

var PROTOCOL = require("./protocol");

var TRANSPORT = require("./transport");

var Channel = exports.Channel = function () {
  if (!(this instanceof exports.Channel)) return new exports.Channel();
};

Channel.prototype.__construct = function (options) {
  options = options || {};
  this.status = "closed";
  this.receivers = [];
  this.listeners = [];
  this.options = {
    "messagePartMaxLength": 5000
  };
  this.outgoingQueue = [];
  this.onError = options.onError || null;

  if (typeof options.enableTransport != "undefined" && options.enableTransport === false) {} else {
    this.addReceiver(TRANSPORT.newReceiver(this));
  }
};

Channel.prototype.enqueueOutgoing = function (message, bypassReceivers) {
  return this._enqueueOutgoing(message, bypassReceivers);
};

Channel.prototype._enqueueOutgoing = function (message, bypassReceivers) {
  if (!bypassReceivers) {
    var enqueue = true;

    for (var i = 0; i < this.receivers.length; i++) {
      if (this.receivers[i].hasId(message.getReceiver())) {
        if (!this.receivers[i].onMessageReceived(null, message)) enqueue = false;
      }
    }

    if (!enqueue) return true;
  }

  this.outgoingQueue.push(this.encode(message));
  return true;
};

Channel.prototype.getOutgoing = function () {
  return this.outgoingQueue;
};

Channel.prototype.clearOutgoing = function () {
  this.outgoingQueue = [];
};

Channel.prototype.setMessagePartMaxLength = function (length) {
  this.options.messagePartMaxLength = length;
};

Channel.prototype.flush = function (applicator, bypassTransport) {
  return this._flush(applicator, bypassTransport);
};

Channel.prototype._flush = function (applicator, bypassTransport) {
  if (!applicator.getMessagePart("x-request-id")) {
    applicator.setMessagePart("x-request-id", "" + new Date().getTime() + "" + Math.floor(Math.random() * 1000 + 1));
  }

  var messages = this.getOutgoing();

  if (messages.length == 0) {
    return 0;
  }

  var util = {
    "applicator": applicator,
    "HEADER_PREFIX": this.HEADER_PREFIX
  };

  if (this.transport && !bypassTransport) {
    util.applicator = this.transport.newApplicator(applicator);
  }

  for (var i = 0; i < messages.length; i++) {
    var headers = messages[i];

    for (var j = 0; j < headers.length; j++) {
      util.applicator.setMessagePart(PROTOCOL.factory(headers[j][0]).encodeKey(util, headers[j][1], headers[j][2]), headers[j][3]);
    }
  }

  var count = messages.length;
  this.clearOutgoing();

  if (util.applicator.flush) {
    util.applicator.flush(this);
  }

  return count;
};

Channel.prototype.setMessagePart = function (key, value) {};

Channel.prototype.getMessagePart = function (key) {
  return null;
};

Channel.prototype.encode = function (message) {
  var protocol_id = message.getProtocol();

  if (!protocol_id) {
    var err = new Error("Protocol not set for message");

    if (this.onError) {
      this.onError(err);
    } else {
      throw err;
    }
  }

  return PROTOCOL.factory(protocol_id).encodeMessage(this.options, message);
};

Channel.prototype.setNoReceiverCallback = function (callback) {
  this.noReceiverCallback = callback;
};

Channel.prototype.addReceiver = function (receiver) {
  for (var i = 0; i < this.receivers.length; i++) {
    if (this.receivers[i] == receiver) {
      return;
    }
  }

  this.receivers.push(receiver);
};

Channel.prototype.addListener = function (listener) {
  for (var i = 0; i < this.listeners.length; i++) {
    if (this.listeners[i] == listener) {
      return;
    }
  }

  this.listeners.push(listener);
};

function dispatch(channel, method, args) {
  args = args || [];

  for (var i = 0; i < channel.listeners.length; i++) {
    if (typeof channel.listeners[i][method] === "function") {
      channel.listeners[i][method].apply(null, args);
    }
  }
}

Channel.prototype.open = function (context) {
  this.status = "open";
  dispatch(this, "beforeChannelOpen", [context]);

  for (var i = 0; i < this.receivers.length; i++) {
    if (this.receivers[i]["onChannelOpen"]) {
      this.receivers[i].onChannelOpen(context);
    }
  }

  this.sinks = {
    protocolBuffers: {},
    buffers: {},
    protocols: {},
    receivers: {},
    senders: {},
    messages: {}
  };
  dispatch(this, "afterChannelOpen", [context]);
};

Channel.prototype.close = function (context) {
  this.status = "close";
  dispatch(this, "beforeChannelClose", [context]);

  for (var i = 0; i < this.receivers.length; i++) {
    if (this.receivers[i]["onChannelClose"]) {
      this.receivers[i].onChannelClose(context);
    }
  }

  dispatch(this, "afterChannelClose", [context]);
};

var parsing = false;

Channel.prototype.parseReceived = function (rawHeaders, context, options) {
  var self = this;

  if (parsing) {
    var err = new Error("Already parsing!");

    if (self.onError) {
      self.onError(err);
    } else {
      throw err;
    }
  }

  options = options || {};
  options.skipChannelOpen = options.skipChannelOpen || false;
  options.skipChannelClose = options.skipChannelClose || false;
  options.enableContinuousParsing = options.enableContinuousParsing || false;

  if (typeof rawHeaders != "object" || Array.isArray(rawHeaders) && typeof rawHeaders[0] === "string") {
    rawHeaders = text_header_to_object(rawHeaders);
  }

  var headersFound = false;
  rawHeaders.forEach(function (header) {
    if (/x-wf-/i.test(header.name)) {
      headersFound = true;
    }
  });

  if (!headersFound) {
    return;
  }

  if (!options.skipChannelOpen) {
    self.open(context);
  }

  parsing = true;
  var protocolBuffers = options.enableContinuousParsing ? this.sinks.protocolBuffers : {};
  var buffers = options.enableContinuousParsing ? this.sinks.buffers : {};
  var protocols = options.enableContinuousParsing ? this.sinks.protocols : {};
  var receivers = options.enableContinuousParsing ? this.sinks.receivers : {};
  var senders = options.enableContinuousParsing ? this.sinks.senders : {};
  var messages = options.enableContinuousParsing ? this.sinks.messages : {};

  try {
    for (var i in rawHeaders) {
      parseHeader(rawHeaders[i].name.toLowerCase(), rawHeaders[i].value);
    }

    if (protocolBuffers) {
      Object.keys(protocolBuffers).forEach(function (name) {
        var item = [name, protocolBuffers[name]];

        if (protocols[item[0]]) {
          if (typeof buffers[item[0]] == "undefined") {
            buffers[item[0]] = {};
          }

          if (typeof receivers[item[0]] == "undefined") {
            receivers[item[0]] = {};
          }

          if (typeof senders[item[0]] == "undefined") {
            senders[item[0]] = {};
          }

          if (typeof messages[item[0]] == "undefined") {
            messages[item[0]] = {};
          }

          item[1].forEach(function (info) {
            protocols[item[0]].parse(buffers[item[0]], receivers[item[0]], senders[item[0]], messages[item[0]], info[0], info[1]);
          });
          delete protocolBuffers[item[0]];
        }
      });
    }
  } catch (e) {
    parsing = false;
    buffers = {};
    protocols = {};
    receivers = {};
    senders = {};
    messages = {};
    console.error("Error parsing raw data", e);

    if (self.onError) {
      self.onError(e);
    } else {
      throw e;
    }
  }

  var deliveries = [];
  var messageCount = 0;

  for (var protocolId in protocols) {
    for (var receiverKey in messages[protocolId]) {
      messages[protocolId][receiverKey].sort(function (a, b) {
        if (parseInt(a[0]) > parseInt(b[0])) return 1;
        if (parseInt(a[0]) < parseInt(b[0])) return -1;
        return 0;
      });
      var receiverId = receivers[protocolId][receiverKey];
      var targetReceivers = [];

      for (var i = 0; i < this.receivers.length; i++) {
        if (this.receivers[i].hasId(receiverId)) {
          if (this.receivers[i]["onMessageGroupStart"]) {
            this.receivers[i].onMessageGroupStart(context);
          }

          targetReceivers.push(this.receivers[i]);
        }
      }

      messageCount += messages[protocolId][receiverKey].length;

      if (targetReceivers.length > 0) {
        for (var j = 0; j < messages[protocolId][receiverKey].length; j++) {
          messages[protocolId][receiverKey][j][1].setSender(senders[protocolId][receiverKey + ":" + messages[protocolId][receiverKey][j][1].getSender()]);
          messages[protocolId][receiverKey][j][1].setReceiver(receiverId);

          for (var k = 0; k < targetReceivers.length; k++) {
            deliveries.push([targetReceivers[k], messages[protocolId][receiverKey][j][1]]);
          }
        }

        for (var k = 0; k < targetReceivers.length; k++) {
          if (targetReceivers[k]["onMessageGroupEnd"]) {
            targetReceivers[k].onMessageGroupEnd(context);
          }
        }

        if (options.enableContinuousParsing) delete messages[protocolId][receiverKey];
      } else if (this.noReceiverCallback) {
        this.noReceiverCallback(receiverId);
      }
    }
  }

  if (options.enableContinuousParsing) {} else {
    buffers = {};
    protocols = {};
    receivers = {};
    senders = {};
    messages = {};
  }

  parsing = false;
  var onMessageReceivedOptions;
  deliveries.forEach(function (delivery) {
    try {
      onMessageReceivedOptions = delivery[0].onMessageReceived(context, delivery[1]);
    } catch (e) {
      console.error("Error delivering message: " + e, e.stack);

      if (self.onError) {
        self.onError(e);
      } else {
        throw e;
      }
    }

    if (onMessageReceivedOptions) {
      if (onMessageReceivedOptions.skipChannelClose) {
        options.skipChannelClose = true;
      }
    }
  });

  if (!options.skipChannelClose) {
    this.close(context);
  }

  return messageCount;

  function parseHeader(name, value) {
    if (name.substr(0, self.HEADER_PREFIX.length) == self.HEADER_PREFIX) {
      if (name.substring(0, self.HEADER_PREFIX.length + 9) == self.HEADER_PREFIX + 'protocol-') {
        var id = parseInt(name.substr(self.HEADER_PREFIX.length + 9));
        protocols[id] = PROTOCOL.factory(value);
      } else {
        var index = name.indexOf('-', self.HEADER_PREFIX.length);
        var id = parseInt(name.substr(self.HEADER_PREFIX.length, index - self.HEADER_PREFIX.length));

        if (protocols[id]) {
          if (typeof buffers[id] == "undefined") {
            buffers[id] = {};
          }

          if (typeof receivers[id] == "undefined") {
            receivers[id] = {};
          }

          if (typeof senders[id] == "undefined") {
            senders[id] = {};
          }

          if (typeof messages[id] == "undefined") {
            messages[id] = {};
          }

          if (protocolBuffers[id]) {
            protocolBuffers[id].forEach(function (info) {
              protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], info[0], info[1]);
            });
            delete protocolBuffers[id];
          }

          protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], name.substr(index + 1), value);
        } else {
          if (!protocolBuffers[id]) {
            protocolBuffers[id] = [];
          }

          protocolBuffers[id].push([name.substr(index + 1), value]);
        }
      }
    }
  }

  function text_header_to_object(text) {
    if (Array.isArray(text)) {
      text = text.join("\n");
    }

    if (text.charCodeAt(0) == 27 && text.charCodeAt(3) == 109) {
      text = text.substring(4);
    }

    var headers = [];
    var lines = text.replace().split("\n");
    var expression = new RegExp("^.{0,2}(" + self.HEADER_PREFIX + "[^:]*): (.*)$", "i");
    var m,
        offset,
        len,
        fuzzy = false;

    for (var i = 0; i < lines.length; i++) {
      if (lines[i]) {
        if (m = expression.exec(lines[i])) {
          if (m[1].toLowerCase() === "x-request-id") context.id = m[2];
          headers.push({
            "name": m[1],
            "value": m[2]
          });
        }
      }
    }

    return headers;
  }
};

Channel.prototype.setTransport = function (transport) {
  this.transport = transport;
};
},{"./protocol":142,"./transport":145}],139:[function(require,module,exports){
"use strict";

var CHANNEL = require("../channel"),
    HTTP_CLIENT = {};

var HOST = "localhost";
var PORT = 8099;
var HEADER_PREFIX = 'x-wf-';

var HttpClientChannel = exports.HttpClientChannel = function () {
  if (!(this instanceof exports.HttpClientChannel)) return new exports.HttpClientChannel();

  this.__construct();

  this.HEADER_PREFIX = HEADER_PREFIX;
};

HttpClientChannel.prototype = CHANNEL.Channel();

HttpClientChannel.prototype.flush = function (applicator, bypassTransport) {
  var self = this;

  if (typeof applicator === "undefined") {
    var parts = {};
    applicator = {
      setMessagePart: function (key, value) {
        parts[key] = value;
      },
      getMessagePart: function (key) {
        if (typeof parts[key] === "undefined") return null;
        return parts[key];
      },
      flush: function (clannel) {
        if (Object.keys(parts).length === 0) return false;
        var data = [];
        Object.keys(parts).forEach(function (name) {
          data.push(name + ": " + parts[name]);
        });
        data = data.join("\n");
        HTTP_CLIENT.request({
          host: HOST,
          port: PORT,
          path: "/wildfire-server",
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "content-length": data.length,
            "connection": "close"
          },
          data: data
        }, function (response) {
          if (response.status == 200) {
            try {
              var data = JSON.parse(response.data);

              if (data.success === true) {} else console.error("ERROR Got error from wildfire server: " + data.error);
            } catch (e) {
              console.error("ERROR parsing JSON response from wildfire server (error: " + e + "): " + response.data);
            }
          } else console.error("ERROR from wildfire server (status: " + response.status + "): " + response.data);
        }, function (e) {
          if (!/ECONNREFUSED/.test(e)) console.error("ERROR sending message to wildfire server: " + e);
        });
        return true;
      }
    };
  }

  return self._flush(applicator);
};
},{"../channel":138}],140:[function(require,module,exports){
"use strict";

var Dispatcher = exports.Dispatcher = function () {
  if (!(this instanceof exports.Dispatcher)) return new exports.Dispatcher();
  this.channel = null;
};

Dispatcher.prototype.setChannel = function (channel) {
  return this._setChannel(channel);
};

Dispatcher.prototype._setChannel = function (channel) {
  this.channel = channel;
};

Dispatcher.prototype.setProtocol = function (protocol) {
  this.protocol = protocol;
};

Dispatcher.prototype.setSender = function (sender) {
  this.sender = sender;
};

Dispatcher.prototype.setReceiver = function (receiver) {
  this.receiver = receiver;
};

Dispatcher.prototype.dispatch = function (message, bypassReceivers) {
  return this._dispatch(message, bypassReceivers);
};

Dispatcher.prototype._dispatch = function (message, bypassReceivers) {
  if (!message.getProtocol()) message.setProtocol(this.protocol);
  if (!message.getSender()) message.setSender(this.sender);
  if (!message.getReceiver()) message.setReceiver(this.receiver);
  this.channel.enqueueOutgoing(message, bypassReceivers);
};
},{}],141:[function(require,module,exports){
"use strict";

var Message = exports.Message = function (dispatcher) {
  if (!(this instanceof exports.Message)) return new exports.Message(dispatcher);
  this.meta = null;
  this.data = null;
  var self = this;

  self.dispatch = function () {
    if (!dispatcher) {
      throw new Error("dispatcher not set");
    }

    return dispatcher.dispatch(self);
  };
};

Message.prototype.setProtocol = function (protocol) {
  this.protocol = protocol;
};

Message.prototype.getProtocol = function () {
  return this.protocol;
};

Message.prototype.setSender = function (sender) {
  this.sender = sender;
};

Message.prototype.getSender = function () {
  return this.sender;
};

Message.prototype.setReceiver = function (receiver) {
  this.receiver = receiver;
};

Message.prototype.getReceiver = function () {
  return this.receiver;
};

Message.prototype.setMeta = function (meta) {
  this.meta = meta;
};

Message.prototype.getMeta = function () {
  return this.meta;
};

Message.prototype.setData = function (data) {
  this.data = data;
};

Message.prototype.getData = function () {
  return this.data;
};
},{}],142:[function(require,module,exports){
"use strict";

var MESSAGE = require("./message");

var FUZZY_MESSAGE_LENGTH_TOLERANCE = 200;
var instances = {};
var protocols = {};

exports.factory = function (uri) {
  if (instances[uri]) {
    return instances[uri];
  }

  if (protocols[uri]) {
    return instances[uri] = protocols[uri](uri);
  }

  return null;
};

protocols["http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0"] = protocols["__TEST__"] = function (uri) {
  return {
    parse: function (buffers, receivers, senders, messages, key, value) {
      var parts = key.split('-');

      if (parts[0] == 'index') {
        return;
      } else if (parts[1] == 'receiver') {
        receivers[parts[0]] = value;
        return;
      } else if (parts[2] == 'sender') {
        senders[parts[0] + ':' + parts[1]] = value;
        return;
      }

      var m = [],
          i,
          j;
      m.push(value.charAt(0) == "~" ? true : false);
      i = value.indexOf("|");
      if (value.charAt(i - 1) === "\\") throw new Error("Found \\ before |! in module " + module.id);
      m.push(value.substring(m[0] ? 1 : 0, i));

      if (value.charAt(value.length - 1) === "|") {
        m.push(value.substring(i + 1, value.length - 1));
        m.push("");
      } else if (value.charAt(value.length - 1) === "\\") {
        m.push(value.substring(i + 1, value.length - 2));
        m.push("\\");
      } else throw new Error("Error parsing for trailing '|' in message part: " + value);

      if (m[1] && (m[0] && Math.abs(m[1] - m[2].length) < FUZZY_MESSAGE_LENGTH_TOLERANCE || !m[0] && m[1] == m[2].length) && !m[3]) {
        enqueueMessage(parts[2], parts[0], parts[1], m[2]);
      } else if (m[3]) {
          enqueueBuffer(parts[2], parts[0], parts[1], m[2], m[1] ? 'first' : 'part', m[1], m[0]);
        } else if (!m[1] && !m[3]) {
            enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last', void 0, m[0]);
          } else {
            throw new Error('Error parsing message: ' + value);
          }

      function enqueueBuffer(index, receiver, sender, value, position, length, fuzzy) {
        if (!buffers[receiver]) {
          buffers[receiver] = {
            "firsts": 0,
            "lasts": 0,
            "messages": []
          };
        }

        if (position == "first") buffers[receiver].firsts += 1;else if (position == "last") buffers[receiver].lasts += 1;
        buffers[receiver].messages.push([index, value, position, length, fuzzy]);

        if (buffers[receiver].firsts > 0 && buffers[receiver].firsts == buffers[receiver].lasts) {
          buffers[receiver].messages.sort(function (a, b) {
            return a[0] - b[0];
          });
          var startIndex = null;
          var buffer = null;
          fuzzy = false;

          for (i = 0; i < buffers[receiver].messages.length; i++) {
            if (buffers[receiver].messages[i][4]) fuzzy = true;

            if (buffers[receiver].messages[i][2] == "first") {
              startIndex = i;
              buffer = buffers[receiver].messages[i][1];
            } else if (startIndex !== null) {
              buffer += buffers[receiver].messages[i][1];

              if (buffers[receiver].messages[i][2] == "last") {
                if (fuzzy && Math.abs(buffers[receiver].messages[startIndex][3] - buffer.length) < FUZZY_MESSAGE_LENGTH_TOLERANCE || !fuzzy && buffer.length == buffers[receiver].messages[startIndex][3]) {
                  enqueueMessage(buffers[receiver].messages[startIndex][0], receiver, sender, buffer);
                  buffers[receiver].messages.splice(startIndex, i - startIndex + 1);
                  buffers[receiver].firsts -= 1;
                  buffers[receiver].lasts -= 1;
                  startIndex = null;
                  buffer = null;
                  fuzzy = false;
                } else {}
              }
            }
          }
        }
      }

      function enqueueMessage(index, receiver, sender, value) {
        if (!messages[receiver]) {
          messages[receiver] = [];
        }

        var m = [value],
            i = 0;

        while (true) {
          i = value.indexOf("|", i);
          if (i === -1) throw new Error("Error parsing for '|' in message part: " + value);
          if (value.charAt(i - 1) != "\\") break;
        }

        m.push(value.substring(0, i));
        m.push(value.substring(i + 1, value.length));
        var message = MESSAGE.Message();
        message.setReceiver(receiver);
        message.setSender(sender);
        message.setMeta(m[1] ? m[1].replace(/\\\|/g, "|").replace(/&!10;/g, "\n") : null);
        message.setData(m[2].replace(/&!10;/g, "\\n"));
        message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
        messages[receiver].push([index, message]);
      }
    },
    encodeMessage: function (options, message) {
      var protocol_id = message.getProtocol();

      if (!protocol_id) {
        throw new Error("Protocol not set for message");
      }

      var receiver_id = message.getReceiver();

      if (!receiver_id) {
        throw new Error("Receiver not set for message");
      }

      var sender_id = message.getSender();

      if (!sender_id) {
        throw new Error("Sender not set for message");
      }

      var headers = [];
      var meta = message.getMeta();
      if (!meta) meta = "";
      var data = message.getData() || "";
      if (typeof data != "string") throw new Error("Data in wildfire message is not a string!");
      data = meta.replace(/\|/g, "\\|").replace(/\n|\u000a|\\u000a/g, "&!10;") + '|' + data.replace(/\n|\u000a|\\u000a/g, "&!10;");
      var parts = chunk_split(data, options.messagePartMaxLength);
      var part, msg;

      for (var i = 0; i < parts.length; i++) {
        if (part = parts[i]) {
          msg = "";

          if (parts.length > 1) {
            msg = (i == 0 ? data.length : '') + '|' + part + '|' + (i < parts.length - 1 ? "\\" : "");
          } else {
            msg = part.length + '|' + part + '|';
          }

          headers.push([protocol_id, receiver_id, sender_id, msg]);
        }
      }

      return headers;
    },
    encodeKey: function (util, receiverId, senderId) {
      if (!util["protocols"]) util["protocols"] = {};
      if (!util["messageIndexes"]) util["messageIndexes"] = {};
      if (!util["receivers"]) util["receivers"] = {};
      if (!util["senders"]) util["senders"] = {};
      var protocol = getProtocolIndex(uri);
      var messageIndex = getMessageIndex(protocol);
      var receiver = getReceiverIndex(protocol, receiverId);
      var sender = getSenderIndex(protocol, receiver, senderId);
      return util.HEADER_PREFIX + protocol + "-" + receiver + "-" + sender + "-" + messageIndex;

      function getProtocolIndex(protocolId) {
        if (util["protocols"][protocolId]) return util["protocols"][protocolId];

        for (var i = 1;; i++) {
          var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);

          if (!value) {
            util["protocols"][protocolId] = i;
            util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
            return i;
          } else if (value == protocolId) {
            util["protocols"][protocolId] = i;
            return i;
          }
        }
      }

      function getMessageIndex(protocolIndex) {
        var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");

        if (!value) {
          value = 0;
        }

        value++;
        util["messageIndexes"][protocolIndex] = value;
        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
        return value;
      }

      function getReceiverIndex(protocolIndex, receiverId) {
        if (util["receivers"][protocolIndex + ":" + receiverId]) return util["receivers"][protocolIndex + ":" + receiverId];

        for (var i = 1;; i++) {
          var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-receiver");

          if (!value) {
            util["receivers"][protocolIndex + ":" + receiverId] = i;
            util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-receiver", receiverId);
            return i;
          } else if (value == receiverId) {
            util["receivers"][protocolIndex + ":" + receiverId] = i;
            return i;
          }
        }
      }

      function getSenderIndex(protocolIndex, receiverIndex, senderId) {
        if (util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId]) return util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId];

        for (var i = 1;; i++) {
          var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + receiverIndex + "-" + i + "-sender");

          if (!value) {
            util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId] = i;
            util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + receiverIndex + "-" + i + "-sender", senderId);
            return i;
          } else if (value == senderId) {
            util["senders"][protocolIndex + ":" + receiverIndex + ":" + senderId] = i;
            return i;
          }
        }
      }
    }
  };
};

protocols["http://meta.wildfirehq.org/Protocol/JsonStream/0.2"] = function (uri) {
  var groupStack = [];
  var groupIndex = 0;
  return {
    parse: function (buffers, receivers, senders, messages, key, value) {
      var parts = key.split('-');

      if (parts[0] == 'index') {
        return;
      } else if (parts[0] == 'structure') {
        receivers[parts[1]] = value;

        if (Object.keys(senders).length > 0) {
          var newSenders = {};

          for (var senderKey in senders) {
            var senderParts = senderKey.split(":");
            newSenders[parts[1] + ":" + senderParts[1]] = senders[senderKey];
          }

          Object.keys(newSenders).forEach(function (name) {
            if (typeof senders[name] === 'undefined') {
              senders[name] = newSenders[name];
            }
          });
        }

        return;
      } else if (parts[0] == 'plugin') {
        if (Object.keys(receivers).length > 0) {
          senders["1" + ":" + parts[1]] = value;
        } else {
          for (var receiverKey in receivers) {
            senders[receiverKey + ":" + parts[1]] = value;
          }
        }

        return;
      }

      var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);

      if (!m) {
        throw new Error("Error parsing message: " + value);
      }

      if (m[1] && m[1] == m[2].length && !m[3]) {
        enqueueMessage(parts[2], parts[0], parts[1], m[2]);
      } else if (m[3]) {
          enqueueBuffer(parts[2], parts[0], parts[1], m[2], m[1] ? 'first' : 'part', m[1]);
        } else if (!m[1] && !m[3]) {
            enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last');
          } else {
            console.error("m", m);
            console.error("m[1]", m[1]);
            console.error("m[2].length", m[2].length);
            throw new Error('Error parsing message parts: ' + value);
          }

      function enqueueBuffer(index, receiver, sender, value, position, length) {
        if (!buffers[receiver]) {
          buffers[receiver] = {
            "firsts": 0,
            "lasts": 0,
            "messages": []
          };
        }

        if (position == "first") buffers[receiver].firsts += 1;else if (position == "last") buffers[receiver].lasts += 1;
        buffers[receiver].messages.push([index, value, position, length]);

        if (buffers[receiver].firsts > 0 && buffers[receiver].firsts == buffers[receiver].lasts) {
          buffers[receiver].messages.sort(function (a, b) {
            return a[0] - b[0];
          });
          var startIndex = null;
          var buffer = null;

          for (i = 0; i < buffers[receiver].messages.length; i++) {
            if (buffers[receiver].messages[i][2] == "first") {
              startIndex = i;
              buffer = buffers[receiver].messages[i][1];
            } else if (startIndex !== null) {
              buffer += buffers[receiver].messages[i][1];

              if (buffers[receiver].messages[i][2] == "last") {
                if (buffer.length == buffers[receiver].messages[startIndex][3]) {
                  enqueueMessage(buffers[receiver].messages[startIndex][0], receiver, sender, buffer);
                  buffers[receiver].messages.splice(startIndex, i - startIndex);
                  buffers[receiver].firsts -= 1;
                  buffers[receiver].lasts -= 1;
                  if (buffers[receiver].messages.length == 0) delete buffers[receiver];
                  startIndex = null;
                  buffer = null;
                } else {}
              }
            }
          }
        }
      }

      function enqueueMessage(index, receiver, sender, value) {
        if (!messages[receiver]) {
          messages[receiver] = [];
        }

        var meta = {
          "msg.preprocessor": "FirePHPCoreCompatibility",
          "target": "console",
          "lang.id": "registry.pinf.org/cadorn.org/github/renderers/packages/php/master"
        },
            data,
            parts;

        try {
          parts = JSON.parse(value);
        } catch (e) {
          console.error("Error parsing JsonStream message", e, value);
          throw e;
        }

        if (Array.isArray(parts) && parts.length == 2 && typeof parts[0] == "object" && parts[0].Type) {
          data = parts[1];

          for (var name in parts[0]) {
            if (name == "Type") {
              if (groupStack.length > 0) {
                meta["group"] = groupStack[groupStack.length - 1];
              }

              switch (parts[0][name]) {
                case "LOG":
                  meta["priority"] = "log";
                  break;

                case "INFO":
                  meta["priority"] = "info";
                  break;

                case "WARN":
                  meta["priority"] = "warn";
                  break;

                case "ERROR":
                  meta["priority"] = "error";
                  break;

                case "EXCEPTION":
                  var originalData = data;
                  data = {
                    "__className": originalData.Class,
                    "__isException": true,
                    "protected:message": originalData.Message,
                    "protected:file": originalData.File,
                    "protected:line": originalData.Line,
                    "private:trace": originalData.Trace
                  };

                  if (data["private:trace"] && data["private:trace"].length > 0) {
                    if (data["private:trace"][0].file != originalData.File || data["private:trace"][0].line != originalData.Line) {
                      data["private:trace"].unshift({
                        "class": originalData.Class || "",
                        "type": originalData.Type || "",
                        "function": originalData.Function || "",
                        "file": originalData.File || "",
                        "line": originalData.Line || "",
                        "args": originalData.Args || ""
                      });
                    }
                  }

                  meta["priority"] = "error";
                  break;

                case "TRACE":
                  meta["renderer"] = "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/trace";
                  var trace = [{
                    "class": data.Class || "",
                    "type": data.Type || "",
                    "function": data.Function || "",
                    "file": data.File || "",
                    "line": data.Line || "",
                    "args": data.Args || ""
                  }];

                  if (data.Trace) {
                    trace = trace.concat(data.Trace);
                  }

                  data = {
                    "title": data.Message,
                    "trace": trace
                  };
                  break;

                case "TABLE":
                  meta["renderer"] = "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table";
                  data = {
                    "data": data
                  };

                  if (data.data.length == 2 && typeof data.data[0] == "string") {
                    data.header = data.data[1].splice(0, 1)[0];
                    data.title = data.data[0];
                    data.data = data.data[1];
                  } else {
                    data.header = data.data.splice(0, 1)[0];
                  }

                  break;

                case "GROUP_START":
                  groupIndex++;
                  meta["group.start"] = true;
                  meta["group"] = "group-" + groupIndex;
                  groupStack.push("group-" + groupIndex);
                  break;

                case "GROUP_END":
                  meta["group.end"] = true;

                  if (groupStack.length > 0) {
                    groupStack.pop();
                  }

                  break;

                default:
                  throw new Error("Log type '" + parts[0][name] + "' not implemented");
                  break;
              }
            } else if (name == "Label") {
              meta["label"] = parts[0][name];
            } else if (name == "File") {
              meta["file"] = parts[0][name];
            } else if (name == "Line") {
              meta["line"] = parts[0][name];
            } else if (name == "Collapsed") {
              meta[".collapsed"] = parts[0][name] == 'true' ? true : false;
            }
          }
        } else {
            data = parts;
            meta["label"] = "Dump";
          }

        if (meta["renderer"] == "http://registry.pinf.org/cadorn.org/renderers/packages/insight/0:structures/table") {
          if (meta["label"]) {
            data.title = meta["label"];
            delete meta["label"];
          }
        } else if (meta["group.start"]) {
          meta["group.title"] = meta["label"];
          delete meta["label"];

          if (typeof meta[".collapsed"] == "undefined" || !meta[".collapsed"]) {
            meta["group.expand"] = meta["group"];
          }

          delete meta[".collapsed"];
        }

        var message = MESSAGE.Message();
        message.setReceiver(receiver);
        message.setSender(sender);

        try {
          message.setMeta(JSON.parse(meta));
        } catch (e) {
          console.error("Error encoding object (JsonStream compatibility)", e, meta);
          throw e;
        }

        try {
          message.setData(JSON.parse(data));
        } catch (e) {
          console.error("Error encoding object (JsonStream compatibility)", e, data);
          throw e;
        }

        messages[receiver].push([index, message]);
      }
    },
    encodeMessage: function (options, message) {
      throw new Error("Not implemented!");
    },
    encodeKey: function (util, receiverId, senderId) {
      throw new Error("Not implemented!");
    }
  };
};

protocols["http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/announce/0.1.0"] = function (uri) {
  return {
    parse: function (buffers, receivers, senders, messages, key, value) {
      var parts = key.split('-');

      if (parts[0] == 'index') {
        return;
      }

      var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);

      if (!m) {
        throw new Error("Error parsing message: " + value);
      }

      if (m[1] && m[1] == m[2].length && !m[3]) {
        enqueueMessage(key, m[2]);
      } else if (m[3]) {
          enqueueBuffer(key, m[2], m[1] ? 'first' : 'part', m[1]);
        } else if (!m[1] && !m[3]) {
            enqueueBuffer(key, m[2], 'last');
          } else {
            throw new Error('Error parsing message: ' + value);
          }

      function enqueueBuffer(index, value, position, length) {
        receiver = "*";

        if (!buffers[receiver]) {
          buffers[receiver] = {
            "firsts": 0,
            "lasts": 0,
            "messages": []
          };
        }

        if (position == "first") buffers[receiver].firsts += 1;else if (position == "last") buffers[receiver].lasts += 1;
        buffers[receiver].messages.push([index, value, position, length]);

        if (buffers[receiver].firsts > 0 && buffers[receiver].firsts == buffers[receiver].lasts) {
          buffers[receiver].messages.sort(function (a, b) {
            return a[0] - b[0];
          });
          var startIndex = null;
          var buffer = null;

          for (i = 0; i < buffers[receiver].messages.length; i++) {
            if (buffers[receiver].messages[i][2] == "first") {
              startIndex = i;
              buffer = buffers[receiver].messages[i][1];
            } else if (startIndex !== null) {
              buffer += buffers[receiver].messages[i][1];

              if (buffers[receiver].messages[i][2] == "last") {
                if (buffer.length == buffers[receiver].messages[startIndex][3]) {
                  enqueueMessage(buffers[receiver].messages[startIndex][0], buffer);
                  buffers[receiver].messages.splice(startIndex, i - startIndex);
                  buffers[receiver].firsts -= 1;
                  buffers[receiver].lasts -= 1;
                  if (buffers[receiver].messages.length == 0) delete buffers[receiver];
                  startIndex = null;
                  buffer = null;
                } else {}
              }
            }
          }
        }
      }

      function enqueueMessage(index, value) {
        receiver = "*";

        if (!messages[receiver]) {
          messages[receiver] = [];
        }

        var m = /^(.*?[^\\])?\|(.*)$/.exec(value);
        var message = MESSAGE.Message();
        message.setReceiver(receiver);
        message.setMeta(m[1] || null);
        message.setData(m[2]);
        messages[receiver].push([index, message]);
      }
    },
    encodeMessage: function (options, message) {
      var protocol_id = message.getProtocol();

      if (!protocol_id) {
        throw new Error("Protocol not set for message");
      }

      var headers = [];
      var meta = message.getMeta() || "";
      var data = meta.replace(/\|/g, "\\|") + '|' + message.getData().replace(/\|/g, "\\|");
      var parts = chunk_split(data, options.messagePartMaxLength);
      var part, msg;

      for (var i = 0; i < parts.length; i++) {
        if (part = parts[i]) {
          msg = "";
          part = part.replace(/\\/g, "\\\\");

          if (parts.length > 2) {
            msg = (i == 0 ? data.length : '') + '|' + part + '|' + (i < parts.length - 2 ? "\\" : "");
          } else {
            msg = part.length + '|' + part + '|';
          }

          headers.push([protocol_id, "", "", msg]);
        }
      }

      return headers;
    },
    encodeKey: function (util) {
      if (!util["protocols"]) util["protocols"] = {};
      if (!util["messageIndexes"]) util["messageIndexes"] = {};
      var protocol = getProtocolIndex(uri);
      var messageIndex = getMessageIndex(protocol);
      return util.HEADER_PREFIX + protocol + "-" + messageIndex;

      function getProtocolIndex(protocolId) {
        if (util["protocols"][protocolId]) return util["protocols"][protocolId];

        for (var i = 1;; i++) {
          var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);

          if (!value) {
            util["protocols"][protocolId] = i;
            util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
            return i;
          } else if (value == protocolId) {
            util["protocols"][protocolId] = i;
            return i;
          }
        }
      }

      function getMessageIndex(protocolIndex) {
        var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");

        if (!value) {
          value = 0;
        }

        value++;
        util["messageIndexes"][protocolIndex] = value;
        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
        return value;
      }
    }
  };
};

function chunk_split(value, length) {
  var parts = [];
  var part;

  while ((part = value.substr(0, length)) && part.length > 0) {
    parts.push(part);
    value = value.substr(length);
  }

  return parts;
}
},{"./message":141}],143:[function(require,module,exports){
"use strict";

var Receiver = exports.Receiver = function () {
  if (!(this instanceof exports.Receiver)) return new exports.Receiver();
  this.listeners = [];
  this.ids = [];
};

Receiver.prototype.setId = function (id) {
  if (this.ids.length > 0) {
    throw new Error("ID already set for receiver!");
  }

  this.ids.push(id);
};

Receiver.prototype.addId = function (id) {
  this.ids.push(id);
};

Receiver.prototype.getId = function () {
  if (this.ids.length > 1) {
    throw new Error("DEPRECATED: Multiple IDs for receiver. Cannot use getId(). Use getIds() instead!");
  }

  return this.ids[0];
};

Receiver.prototype.getIds = function () {
  return this.ids;
};

Receiver.prototype.hasId = function (id) {
  for (var i = 0; i < this.ids.length; i++) {
    if (this.ids[i] == id) {
      return true;
    }
  }

  return false;
};

Receiver.prototype.onChannelOpen = function (context) {
  this._dispatch("onChannelOpen", [context]);
};

Receiver.prototype.onChannelClose = function (context) {
  this._dispatch("onChannelClose", [context]);
};

Receiver.prototype.onMessageGroupStart = function (context) {
  this._dispatch("onMessageGroupStart", [context]);
};

Receiver.prototype.onMessageGroupEnd = function (context) {
  this._dispatch("onMessageGroupEnd", [context]);
};

Receiver.prototype.onMessageReceived = function (message, context) {
  return this._dispatch("onMessageReceived", [message, context]);
};

Receiver.prototype.addListener = function (listener) {
  this.listeners.push(listener);
};

Receiver.prototype._dispatch = function (event, args) {
  if (this.listeners.length == 0) {
    return;
  }

  var returnOptions, opt;

  for (var i = 0; i < this.listeners.length; i++) {
    if (this.listeners[i][event]) {
      opt = this.listeners[i][event].apply(this.listeners[i], args);

      if (opt) {
        if (!returnOptions) {
          returnOptions = opt;
        } else {
          for (var key in opt) {
            returnOptions[key] = opt[key];
          }
        }
      }
    }
  }

  return returnOptions;
};
},{}],144:[function(require,module,exports){
"use strict";

var WILDFIRE = require("../wildfire");

var CallbackStream = exports.CallbackStream = function CallbackStream() {
  if (!(this instanceof exports.CallbackStream)) return new exports.CallbackStream();
  this.messagesIndex = 1;
  this.messages = {};
  var self = this;
  this.dispatcher = WILDFIRE.Dispatcher();
  this.dispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
  this.receiver = WILDFIRE.Receiver();
  this.receiveHandler = null;
  this.receiver.addListener({
    onMessageReceived: function (context, message) {
      var meta = JSON.parse(message.getMeta());

      if (meta[".action"] == "request") {
        self.receiveHandler({
          meta: meta,
          data: JSON.parse(message.getData())
        }, function (message) {
          if (!message || typeof message !== "object") throw new Error("Did not get message object for receiveHandler response");
          if (typeof message.data === "undefined") throw new Error("Message object from receiveHandler response does not include 'data' property.");
          var msg = WILDFIRE.Message();
          if (typeof message.meta == "undefined") message.meta = {};
          message.meta[".callbackid"] = meta[".callbackid"];
          message.meta[".action"] = "respond";

          try {
            msg.setMeta(JSON.parse(message.meta));
          } catch (e) {
            console.warn("Error JSON encoding meta", e);
            throw new Error("Error JSON encoding meta: " + e);
          }

          try {
            msg.setData(JSON.parse(message.data));
          } catch (e) {
            console.warn("Error JSON encoding data", e);
            throw new Error("Error JSON encoding data: " + e);
          }

          try {
            self.dispatcher.dispatch(msg, true);
          } catch (e) {
            console.warn("Error dispatching message in " + module.id, e);
            throw new Error("Error '" + e + "' dispatching message in " + module.id);
          }
        });
      } else if (meta[".action"] == "respond") {
        if (self.messages["i:" + meta[".callbackid"]]) {
          self.messages["i:" + meta[".callbackid"]][1]({
            meta: meta,
            data: JSON.parse(message.getData())
          });
          delete self.messages["i:" + meta[".callbackid"]];
        }
      } else throw new Error("NYI");
    }
  });
};

CallbackStream.prototype.setChannel = function (channel) {
  this.dispatcher.setChannel(channel);
  channel.addReceiver(this.receiver);
};

CallbackStream.prototype.setHere = function (id) {
  this.receiver.setId(id + "-callback");
  this.dispatcher.setSender(id + "-callback");
};

CallbackStream.prototype.setThere = function (id) {
  this.dispatcher.setReceiver(id + "-callback");
};

CallbackStream.prototype.send = function (message, callback) {
  var msg = WILDFIRE.Message();
  if (typeof message.meta == "undefined") message.meta = {};
  message.meta[".callbackid"] = this.messagesIndex;
  message.meta[".action"] = "request";
  msg.setMeta(JSON.stringify(message.meta));
  msg.setData(JSON.stringify(message.data));
  this.messages["i:" + this.messagesIndex] = [msg, callback];
  this.messagesIndex++;
  this.dispatcher.dispatch(msg, true);
};

CallbackStream.prototype.receive = function (handler) {
  this.receiveHandler = handler;
};
},{"../wildfire":146}],145:[function(require,module,exports){
"use strict";

var RECEIVER_ID = "http://registry.pinf.org/cadorn.org/wildfire/@meta/receiver/transport/0";

var MD5 = require("md5.js");

var MESSAGE = require("./message");

var RECEIVER = require("./receiver");

var Transport = exports.Transport = function (options) {
  if (!(this instanceof exports.Transport)) return new exports.Transport(options);
  this.options = options;
};

Transport.prototype.newApplicator = function (applicator) {
  return Applicator(this, applicator);
};

Transport.prototype.serviceDataRequest = function (key) {
  return require("./wildfire").getBinding().formatResponse({
    "contentType": "text/plain"
  }, this.getData(key));
};

Transport.prototype.getUrl = function (key) {
  return this.options.getUrl(key);
};

Transport.prototype.setData = function (key, value) {
  return this.options.setData(key, value);
};

Transport.prototype.getData = function (key) {
  return this.options.getData(key);
};

var Applicator = function (transport, applicator) {
  if (!(this instanceof Applicator)) return new Applicator(transport, applicator);
  this.transport = transport;
  this.applicator = applicator;
  this.buffer = {};
};

Applicator.prototype.setMessagePart = function (key, value) {
  this.buffer[key] = value;
};

Applicator.prototype.getMessagePart = function (key) {
  if (!this.buffer[key]) return null;
  return this.buffer[key];
};

Applicator.prototype.flush = function (channel) {
  var data = [];
  var seed = [];

  for (var key in this.buffer) {
    data.push(key + ": " + this.buffer[key]);
    if (data.length % 3 == 0 && seed.length < 5) seed.push(this.buffer[key]);
  }

  var key = new MD5().update(Math.random() + ":" + module.path + ":" + seed.join("")).digest('hex');
  this.transport.setData(key, data.join("\n"));
  var message = MESSAGE.Message();
  message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0');
  message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js/lib/transport.js');
  message.setReceiver(RECEIVER_ID);
  message.setData(JSON.stringify({
    "url": this.transport.getUrl(key)
  }));
  channel.enqueueOutgoing(message, true);
  return channel.flush(this.applicator, true);
};

exports.newReceiver = function (channel) {
  var receiver = RECEIVER.Receiver();
  receiver.setId(RECEIVER_ID);
  receiver.addListener({
    onMessageReceived: function (context, message) {
      try {
        context.transporter = RECEIVER_ID;
        throw new Error("OOPS!!!");
      } catch (e) {
        console.warn(e);
      }
    }
  });
  return receiver;
};
},{"./message":141,"./receiver":143,"./wildfire":146,"md5.js":114}],146:[function(require,module,exports){
"use strict";

exports.Receiver = function () {
  return require("./receiver").Receiver();
};

exports.Dispatcher = function () {
  return require("./dispatcher").Dispatcher();
};

exports.Message = function () {
  return require("./message").Message();
};

exports.HttpHeaderChannel = function (options) {
  return require("./channel-httpheader").HttpHeaderChannel(options);
};

exports.HttpClientChannel = function () {
  return require("./channel/http-client").HttpClientChannel();
};

exports.ShellCommandChannel = function () {
  return require("./channel-shellcommand").ShellCommandChannel();
};

exports.PostMessageChannel = function () {
  return require("./channel-postmessage").PostMessageChannel();
};

exports.CallbackStream = function () {
  return require("./stream/callback").CallbackStream();
};
},{"./channel-httpheader":135,"./channel-postmessage":136,"./channel-shellcommand":137,"./channel/http-client":139,"./dispatcher":140,"./message":141,"./receiver":143,"./stream/callback":144}]},{},[7])(7)
});

	});
});