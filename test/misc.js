var test = require('tape');

var BigInt = require('../');

test('operations return copies', function (t) {
  var big = new BigInt(3);

  t.equal(+big.shiftLeft(1), 6);
  t.equal(+big.shiftRight(1), 1);
  t.equal(+big.and(1), 1);
  t.equal(+big.or(28), 31);
  t.equal(+big.add(10), 13);
  t.equal(+big.multiply(123), 369);
  t.equal(+big.negate(), -3);
  t.equal(+big.subtract(5), -2);

  t.equal(big.toString(), '3');

  t.end();
});

test('operations accept numbers, strings, and BigInt', function (t) {
  var big = new BigInt(5);

  // add
  t.equal(big.add(10).toString(), '15');
  t.equal(big.add('10').toString(), '15');
  t.equal(big.add(new BigInt(10)).toString(), '15');

  // and
  t.equal(big.and(6).toString(), '4');
  t.equal(big.and('6').toString(), '4');
  t.equal(big.and(new BigInt(6)).toString(), '4');

  // multiply
  t.equal(big.multiply(10).toString(), '50');
  t.equal(big.multiply('10').toString(), '50');
  t.equal(big.multiply(new BigInt(10)).toString(), '50');

  // or
  t.equal(big.or(6).toString(), '7');
  t.equal(big.or('6').toString(), '7');
  t.equal(big.or(new BigInt(6)).toString(), '7');

  // shiftLeft
  t.equal(big.shiftLeft(1).toString(), '10');
  t.equal(big.shiftLeft('1').toString(), '10');
  t.equal(big.shiftLeft(new BigInt(1)).toString(), '10');

  // shiftRight
  t.equal(big.shiftRight(1).toString(), '2');
  t.equal(big.shiftRight('1').toString(), '2');
  t.equal(big.shiftRight(new BigInt(1)).toString(), '2');

  // subtract
  t.equal(big.subtract(10).toString(), '-5');
  t.equal(big.subtract('10').toString(), '-5');
  t.equal(big.subtract(new BigInt(10)).toString(), '-5');

  t.end();
});

test('converting to bytes', function (t) {
  var big = new BigInt(65535);

  // creates a byte array correctly
  var bytes = big.toBytes();

  // This might seem counter-intuitive, but the array has to be padded when
  // signed, to avoid confusion with a negative number (the first bit can
  // only be set if the number is negative).
  t.equal(bytes.length, 3);
  t.equal(bytes[0], 0);
  t.equal(bytes[1], 255);
  t.equal(bytes[2], 255);

  // fills an existing array correctly
  bytes = big.toBytes(new Uint8Array(4));

  t.equal(bytes.length, 4);
  t.equal(bytes[0], 0);
  t.equal(bytes[1], 0);
  t.equal(bytes[2], 255);
  t.equal(bytes[3], 255);

  // does not pad array when unsigned
  bytes = big.toUnsignedBytes();

  t.equal(bytes.length, 2);
  t.equal(bytes[0], 255);
  t.equal(bytes[1], 255);

  // for a negative value uses two's complement
  bytes = new BigInt(-1).toBytes();
  t.equal(bytes.length, 1);
  t.equal(bytes[0], 255);

  bytes = new BigInt(-128).toBytes();
  t.equal(bytes.length, 1);
  t.equal(bytes[0], 128);

  bytes = new BigInt(-129).toBytes();
  t.equal(bytes.length, 2);
  t.equal(bytes[0], 255);
  t.equal(bytes[1], 127);

  bytes = new BigInt(-32768).toBytes();
  t.equal(bytes.length, 2);
  t.equal(bytes[0], 128);
  t.equal(bytes[1], 0);

  t.end();
});

test('sign()', function (t) {
  // for a negative number
  big = new BigInt(-123456);

  // is -1
  t.equal(big.sign(), -1);

  // for a positive number
  big = new BigInt(123456);

  // is 1
  t.equal(big.sign(), 1);

  // for zero
  big = new BigInt(0);

  // is 0
  t.equal(big.sign(), 0);

  // is 0 after arithmetics
  t.equal(big.subtract(123456).add(123456).sign(), 0);

  t.end();
});

test('toValue()', function (t) {
  var big = new BigInt(4503599627370495);

  // has the correct value
  t.equal(+big, 4503599627370495);

  // that is negative
  big = new BigInt(-4503599627370495);

  // has the correct value
  t.equal(+big, -4503599627370495);

  t.end();
});
