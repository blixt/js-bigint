var array = require('./lib/array');

module.exports = BigInt;


// Constants for a 16-bit backing store.
var BITS = 15,
    BASE = 1 << BITS,
    MASK = BASE - 1,
    DECIMAL_SHIFT = 4,
    DECIMAL_BASE = 10000;


function addValues(a, b) {
  if (a.length < b.length) {
    var temp = a; a = b; b = temp;
  }

  var carry = 0, diff = a.length - b.length,
      result = new Uint16Array(a.length + 1);

  // TODO: This is a bit messy – consider reversing value order.
  for (var i = a.length; i >= diff; i--) {
    carry += a[i] + b[i - diff];
    result[i + 1] = carry & MASK;
    carry >>= BITS;
  }

  while (i >= 0) {
    carry += a[i];
    result[i + 1] = carry & MASK;
    carry >>= BITS;

    i--;
  }

  if (carry) {
    result[0] = carry;
  } else {
    // Normalize the array.
    result = result.subarray(1);
  }

  var bigInt = new BigInt(result);
  return bigInt;
}

function subValues(a, b) {
  var negative = false, temp, i;

  if (a.length < b.length) {
    negative = true;
    temp = a; a = b; b = temp;
  } else if (a.length == b.length) {
    for (i = 0; i < a.length; i++) {
      if (a[i] != b[i]) break;
    }

    // The two numbers are equal.
    if (i == a.length) {
      return new BigInt(0);
    }

    if (a[i] < b[i]) {
      negative = true;
      temp = a; a = b; b = temp;
    }
  }

  var borrow = 0, diff = a.length - b.length,
      result = new Uint16Array(a.length);

  for (i = a.length - 1; i >= diff; i--) {
    // TODO: Is there a better way to do unsigned arithmetic? Rewrite this.
    borrow = a[i] - b[i - diff] - borrow;
    if (borrow < 0) borrow += 65536;
    result[i] = borrow & MASK;
    borrow >>= BITS;
  }

  while (i >= 0) {
    borrow = a[i] - borrow;
    if (borrow < 0) borrow += 65536;
    result[i] = borrow & MASK;
    borrow >>= BITS;

    i--;
  }

  var bigInt = new BigInt(array.normalized(result));
  bigInt.negative = negative;

  return bigInt;
}

function shiftLeft(values, bits) {
  bits = ~~bits;
  if (bits < 0 || bits > BITS) throw new Error('Not supported');

  // NOTE: Right now we guarantee that the left-most value is 0, but we may want
  // to revise this to ensure that the last carry is actually carried over.
  var carry = 0, invBits = BITS - bits;
  for (var i = values.length - 1; i >= 0; i--) {
    var value = values[i];
    values[i] = value << bits & MASK | carry;
    carry = value >> invBits;
  }
}

function shiftRight(values, bits) {
  bits = ~~bits;
  if (bits < 0 || bits > BITS) throw new Error('Not supported');

  var carry = 0, invBits = BITS - bits, mask = (1 << bits) - 1;
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    values[i] = value >> bits | (carry << invBits);
    carry = value & mask;
  }

  return carry;
}


/**
 * Represent integers of any size.
 *
 * The constructor takes one of the following inputs:
 *
 * - Another BigInt (this will create a copy)
 *
 * - A string of the number, optionally with a radix as the second argument
 *
 * - A JavaScript number (note that JavaScript can only accurately represent 53
 *   bits in a number, so use a string if you need bigger numbers)
 *
 * - An array of binary values to build the number from
 *
 *   By default it's assumed that the values are bytes (8 bits per item). If any
 *   other size is desired, pass in the number of bits per item as the second
 *   argument:
 *
 *       var int = new BigInt([1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1], 1);
 *       var int = new BigInt([1, 0], 32); // one above max 32-bit number.
 *
 */
function BigInt(opt_value, opt_extra) {
  if (this.constructor != BigInt) {
    return new BigInt(opt_value, opt_extra);
  }

  if (Array.isArray(opt_value)) {
    this._fromArray(opt_value, opt_extra);
  } else if (opt_value && opt_value.values instanceof Uint16Array) {
    this._fromBigInt(opt_value);
  } else if (typeof opt_value == 'number') {
    this._fromNumber(opt_value);
  } else if (typeof opt_value == 'string') {
    this._fromString(opt_value, opt_extra);
  } else if (opt_value instanceof Uint16Array) {
    this._fromTypedArray(opt_value);
  } else {
    throw new Error('Unsupported type');
  }
}

BigInt.prototype._fromArray = function (values, opt_bitsPerItem) {
  this.values = array.copy(values, opt_bitsPerItem || 8, BITS);
  this.negative = false;
};

BigInt.prototype._fromBigInt = function (bigInt) {
  this.values = new Uint16Array(bigInt.values);
  this.negative = !!bigInt.negative;
};

BigInt.prototype._fromNumber = function (number) {
  if (number < 0) {
    this.negative = true;
    number = -number;
  } else {
    this.negative = false;
  }

  var temp = [], base = 0x100000000;
  while (number > 0) {
    temp.unshift((number & 0xFFFFFFFF) >>> 0);
    number = Math.floor(number / base);
  }

  this.values = array.copy(temp, 32, BITS);
};

var lookupLog = [], lookupConvWidth = [], lookupConvMultMax = [];

var lookupValue = new Uint8Array([
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  37, 37, 37, 37, 37, 37,
  37, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 37, 37, 37, 37,
  37, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37,
  37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37
]);

BigInt.prototype._fromString = function (string, opt_radix) {
  if (opt_radix && (opt_radix < 2 || opt_radix > 36)) {
    throw new Error('Radix not in range 2–36');
  }

  var negative = false;

  var a = 0;
  if (string[a] == '+') {
    a++;
  } else if (string[a] == '-') {
    a++;
    negative = true;
  }

  if (!opt_radix) {
    if (string[a] == '0') {
      a++;
      if (string[a] == 'x' || string[a] == 'X') {
        a++;
        opt_radix = 16;
      } else if (string[a] == 'b' || string[a] == 'B') {
        a++;
        opt_radix = 2;
      } else {
        opt_radix = 8;
      }
    } else {
      opt_radix = 10;
    }
  }

  var convMultMax, convWidth,
      log = lookupLog[opt_radix];

  if (log) {
    convMultMax = lookupConvMultMax[opt_radix];
    convWidth = lookupConvWidth[opt_radix];
  } else {
    // Build lookup table on the fly.
    log = Math.log(opt_radix) / Math.log(BASE);

    convMultMax = opt_radix;
    convWidth = 1;

    while (true) {
      var next = convMultMax * opt_radix;
      if (next > BASE) break;
      convMultMax = next;
      convWidth++;
    }

    lookupConvMultMax[opt_radix] = convMultMax;
    lookupConvWidth[opt_radix] = convWidth;
    lookupLog[opt_radix] = log;
  }

  // Find the last character within the specified radix.
  var b = a;
  while (lookupValue[string.charCodeAt(b)] < opt_radix) b++;

  var maxSize = Math.ceil((b - a) * log), index = maxSize - 1;
  var result = new Uint16Array(maxSize);

  while (a < b) {
    var i, value = lookupValue[string.charCodeAt(a++)];
    for (i = 1; i < convWidth && a < b; i++, a++) {
      value = value * opt_radix + lookupValue[string.charCodeAt(a)];
    }

    var convMult;
    if (i == convWidth) {
      convMult = convMultMax;
    } else {
      convMult = opt_radix;
      while (i > 1) {
        convMult *= opt_radix;
        i--;
      }
    }

    for (i = maxSize - 1; i >= index; i--) {
      value += result[i] * convMult;
      result[i] = value & MASK;
      value >>= BITS;
    }

    if (value) {
      result[i] = value;
      index--;
    }
  }

  this.values = result.subarray(index);
  this.negative = negative;
};

BigInt.prototype._fromTypedArray = function (values) {
  this.values = values;
  this.negative = false;
};

BigInt.prototype._isZero = function () {
  // Always assume the internal store is normalized.
  return !this.values.length || !this.values[0];
};

BigInt.prototype.add = function (amount) {
  // TODO: If amount is a number, we could optimize it.
  if (!(amount instanceof BigInt)) amount = new BigInt(amount);

  var result, a = this.values, b = amount.values;

  if (this.negative) {
    if (amount.negative) {
      result = addValues(a, b);
      if (!this._isZero()) result.negative = !result.negative;
    } else {
      result = subValues(b, a);
    }
  } else {
    if (amount.negative) {
      result = subValues(a, b);
    } else {
      result = addValues(a, b);
    }
  }

  return result;
};

BigInt.prototype.and = function (bits) {
  bits = new BigInt(bits);

  var bitsLength = bits.values.length,
      diff = bitsLength - this.values.length;

  var i;
  for (i = 0; i < diff; i++) {
    bits.values[i] = 0;
  }

  while (i < bitsLength) {
    bits.values[i] &= this.values[i - diff];
    i++;
  }

  bits.values = array.normalized(bits.values);
  return bits;
};

BigInt.prototype.negate = function () {
  // TODO: Is there a reason for why we would always want to copy?
  if (this._isZero()) return this;

  var bigInt = new BigInt(this);
  bigInt.negative = !bigInt.negative;
  return bigInt;
};

BigInt.prototype.shiftLeft = function (bits) {
  var bigInt;

  if (this.values[0]) {
    // Grow the BigInt backing store if necessary.
    var values = new Uint16Array(this.values.length + 1);
    values.set(this.values, 1);

    bigInt = new BigInt(values);
    bigInt.negative = this.negative;
  } else {
    bigInt = new BigInt(this);
  }

  shiftLeft(bigInt.values, bits);
  bigInt.values = array.normalized(bigInt.values);
  return bigInt;
};

BigInt.prototype.shiftRight = function (bits) {
  var bigInt = new BigInt(this);
  shiftRight(bigInt.values, bits);
  bigInt.values = array.normalized(bigInt.values);
  return bigInt;
};

BigInt.prototype.sign = function () {
  if (this._isZero()) return 0;
  return this.negative ? -1 : 1;
};

BigInt.prototype.subtract = function (amount) {
  // TODO: If amount is a number, we could optimize it.
  if (!(amount instanceof BigInt)) amount = new BigInt(amount);

  var result, a = this.values, b = amount.values;

  if (this.negative) {
    if (amount.negative) {
      result = subValues(a, b);
    } else {
      result = addValues(a, b);
    }

    if (!this._isZero()) result.negative = !result.negative;
  } else {
    if (amount.negative) {
      result = addValues(a, b);
    } else {
      result = subValues(a, b);
    }
  }

  return result;
};

BigInt.prototype.toBytes = function (opt_destArray, opt_signed) {
  if (typeof opt_signed == 'undefined') opt_signed = true;

  if (opt_destArray && !(opt_destArray instanceof Uint8Array)) {
    throw new Error('toBytes only supports Uint8Array');
  }

  if (!opt_signed && this.negative) {
    throw new Error('Can\'t convert negative BigInt to unsigned');
  }

  var values = array.copy(this.values, BITS, 8, opt_destArray);

  // If the value should be unsigned, just return the array.
  if (!opt_signed) return values;

  // If the highest bit is set, we may need to add a byte to the array.
  var extend = values[0] & 128 && (!this.negative || values[0] & 127 || values.length > 1);
  if (extend && this.negative && values.length > 1) {
    // If all the bits after the first are 0, we don't need to extend.
    for (var i = 1; i < values.length; i++) {
      if (values[i]) break;
    }
    if (i == values.length) extend = false;
  }

  // Extend the array if necessary.
  if (extend) {
    if (opt_destArray) {
      // We can't modify a provided array.
      throw new Error('Destination array is too small');
    }

    var temp = values;
    values = new Uint8Array(temp.length + 1);
    values.set(temp, 1);
  }

  // Change to two's complement if the number is negative.
  if (this.negative) {
    var carry = 1;
    for (var i = values.length - 1; i >= 0; i--) {
      var value = (values[i] ^ 0xFF) + carry;
      values[i] = value & 0xFF;
      carry = value >> 8;
    }
  }

  return values;
};

BigInt.prototype.toJSON = function () {
  return this.valueOf();
};

/**
 * Represent the integer as a string.
 */
BigInt.prototype.toString = function (opt_radix) {
  if (!opt_radix) opt_radix = 10;
  if (opt_radix != 10) throw new Error('Not supported');

  // Create a temporary store with the maximum potential size.
  var size = 1 + Math.floor(this.values.length * BITS / (3 * DECIMAL_SHIFT));
  var temp = new Uint16Array(size);

  size = 0;

  var i, j;
  for (i = 0; i < this.values.length; i++) {
    var hi = this.values[i];
    for (j = 0; j < size; j++) {
      var z = temp[j] << BITS | hi;
      hi = Math.floor(z / DECIMAL_BASE);
      temp[j] = z - hi * DECIMAL_BASE;
    }

    while (hi) {
      temp[size++] = hi % DECIMAL_BASE;
      hi = Math.floor(hi / DECIMAL_BASE);
    }
  }

  if (!size) size = 1;

  var str = '', rem;
  for (i = 0; i < size - 1; i++) {
    rem = temp[i];
    for (j = 0; j < DECIMAL_SHIFT; j++) {
      str = (rem % 10) + str;
      rem = Math.floor(rem / 10);
    }
  }

  rem = temp[i];
  do {
    str = (rem % 10) + str;
    rem = Math.floor(rem / 10);
  } while (rem);

  return (this.negative ? '-' : '') + str;
};

BigInt.prototype.toUnsignedBytes = function (opt_destArray) {
  return this.toBytes(opt_destArray, false);
};

/**
 * Best effort conversion to a JavaScript Number.
 */
BigInt.prototype.valueOf = function () {
  var value = 0;
  for (var i = 0; i < this.values.length; i++) {
    value *= BASE;
    value += this.values[i];
  }

  return this.negative ? -value : value;
};
