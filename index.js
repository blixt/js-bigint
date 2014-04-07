var arrayCopy = require('./lib/arraycopy');

module.exports = BigInt;


// Constants for a 16-bit backing store.
var BITS = 15,
    BASE = 1 << BITS,
    MASK = BASE - 1,
    DECIMAL_SHIFT = 4,
    DECIMAL_BASE = 10000;


function and(values, bits) {
  if (!(bits instanceof BigInt)) bits = new BigInt(bits);

  var length = values.length,
      bitsLength = bits.values.length,
      min = Math.min(length, bitsLength);

  for (var i = length - min, j = bitsLength - min; i < length; i++, j++) {
    values[i] &= bits.values[j];
  }
}

function shiftLeft(values, bits) {
  if (bits > BITS) throw new Error('Not supported');

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
  if (bits > BITS) throw new Error('Not supported');

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
  } else if (opt_value instanceof BigInt) {
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

BigInt.prototype._fromArray = function (array, opt_bitsPerItem) {
  this.values = arrayCopy(array, opt_bitsPerItem || 8, BITS);
  this.negative = false;
};

BigInt.prototype._fromBigInt = function (bigInt) {
  this.values = new Uint16Array(bigInt.values);
  this.negative = bigInt.negative;
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

  this.values = arrayCopy(temp, 32, BITS);
};

BigInt.prototype._fromString = function (string, opt_radix) {
  this.values = new Uint16Array();
  this.negative = false;
};

BigInt.prototype._fromTypedArray = function (values) {
  this.values = values;
  this.negative = false;
}

BigInt.prototype.and = function (bits) {
  var bigInt = new BigInt(this);
  and(bigInt.values, bits);
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
  return bigInt;
};

BigInt.prototype.shiftRight = function (bits) {
  var bigInt = new BigInt(this);
  shiftRight(bigInt.values, bits);
  return bigInt;
};

BigInt.prototype.toBytes = function (opt_destArray) {
  return arrayCopy(this.values, BITS, 8, opt_destArray);
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
