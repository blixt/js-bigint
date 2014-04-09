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

BigInt.prototype._fromArray = function (values, opt_bitsPerItem) {
  this.values = array.copy(values, opt_bitsPerItem || 8, BITS);
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

  this.values = array.copy(temp, 32, BITS);
};

BigInt.prototype._fromString = function (string, opt_radix) {
  this.values = new Uint16Array();
  this.negative = false;
};

BigInt.prototype._fromTypedArray = function (values) {
  this.values = values;
  this.negative = false;
};

BigInt.prototype.add = function (amount) {
  // TODO: If amount is a number, we could optimize it.
  if (!(amount instanceof BigInt)) amount = new BigInt(amount);

  var result, a = this.values, b = amount.values;

  if (this.negative) {
    if (amount.negative) {
      result = addValues(a, b);

      // TODO: Better way to determine if value is non-zero.
      if (result.values[result.values.length - 1]) {
        result.negative = !result.negative;
      }
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

    // TODO: Better way to determine if value is non-zero.
    if (result.values[result.values.length - 1]) {
      result.negative = !result.negative;
    }
  } else {
    if (amount.negative) {
      result = addValues(a, b);
    } else {
      result = subValues(a, b);
    }
  }

  return result;
};

BigInt.prototype.toBytes = function (opt_destArray) {
  return array.copy(this.values, BITS, 8, opt_destArray);
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
