var arrayCopy = require('./lib/arraycopy');

module.exports = BigInt;


// Constants for a 16-bit backing store.
var BITS = 15,
    BASE = 1 << BITS,
    DECIMAL_SHIFT = 4,
    DECIMAL_BASE = 10000;


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
  var digits;

  if (opt_value instanceof BigInt) {
    digits = new Uint16Array(opt_value.digits);
    this.negative = opt_value.negative;
  } else if (typeof opt_value == 'number') {
    if (opt_value < 0) {
      this.negative = true;
      opt_value = -opt_value;
    } else {
      this.negative = false;
    }

    var temp = [], base = 0x100000000;
    while (opt_value > 0) {
      temp.unshift((opt_value & 0xFFFFFFFF) >>> 0);
      opt_value = Math.floor(opt_value / base);
    }

    digits = arrayCopy(temp, 32, BITS);
  } else if (typeof opt_value == 'string') {
    //
  } else if (Array.isArray(opt_value)) {
    digits = arrayCopy(opt_value, opt_extra || 8, BITS);
    this.negative = false;
  }

  this.digits = digits;
}

BigInt.prototype.copy = function () {
  return new BigInt(this);
};

BigInt.prototype.negate = function (opt_force) {
  this.negative = typeof opt_force != 'undefined' ? !!opt_force : !this.negative;
  delete this.value;
};

BigInt.prototype.normalize = function () {
  var index = 0;
  while (!this.digits[index]) i++;
  if (index) {
    this.digits = this.digits.subarray(index);
  }
};

BigInt.prototype.shiftRight = function (bits) {
  if (bits > BITS) throw new Error('Not supported');

  var carry = 0, mask = (1 << bits) - 1;
  for (var i = 0; i < this.digits.length; i++) {
    var value = this.digits[i];
    this.digits[i] = value >>> bits | (carry << (BITS - bits));
    carry = value & mask;
  }

  delete this.value;
  return carry;
};

BigInt.prototype.toBytes = function (opt_destArray) {
  return arrayCopy(this.digits, BITS, 8, opt_destArray);
};

BigInt.prototype.toJSON = function () {
  return this.valueOf();
};

/**
 * Stolen from Python. :)
 */
BigInt.prototype.toString = function (opt_radix) {
  if (!opt_radix) opt_radix = 10;
  if (opt_radix != 10) throw new Error('Not supported');

  // Create a temporary store with the maximum potential size.
  var size = 1 + Math.floor(this.digits.length * BITS / (3 * DECIMAL_SHIFT));
  var temp = new Uint16Array(size);

  size = 0;

  var i, j;
  for (i = 0; i < this.digits.length; i++) {
    var hi = this.digits[i];
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
  if ('value' in this) return this.value;

  var value = 0;
  for (var i = 0; i < this.digits.length; i++) {
    value *= BASE;
    value += this.digits[i];
  }

  this.value = this.negative ? -value : value;
  return this.value;
};
