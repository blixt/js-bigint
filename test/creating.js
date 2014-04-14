var test = require('tape');

var BigInt = require('../');

test('creating from a JavaScript number', function (t) {
  var big = new BigInt(0xABCDEF0ABCDEF);

  // is a BigInt
  t.ok(big instanceof BigInt);

  // has the correct value
  t.equal(big.toString(), '3022415473659375');
  t.equal(+big, 0xABCDEF0ABCDEF);

  // that is negative
  var big = new BigInt(-0xFEDCBA);

  // has the correct value
  t.equal(+big, -0xFEDCBA);

  t.end();
});

test('creating from a string', function (t) {
  var big = new BigInt('123456789012345678901234567890');

  // is a BigInt
  t.ok(big instanceof BigInt);

  // has the correct value
  t.equal(big.toString(), '123456789012345678901234567890');

  // in base 16
  big = new BigInt('FFFFFFFF', 16);

  // has the correct value
  t.equal(+big, 0xFFFFFFFF);

  // in implied base 16
  big = new BigInt('0xFFFFFFFF');

  // has the correct value
  t.equal(+big, 0xFFFFFFFF);

  // that is negative
  big = new BigInt('-123456789012345678901234567890');

  // has the correct value
  t.equal(big.toString(), '-123456789012345678901234567890');

  t.end();
});

test('creating from an array', function (t) {
  var big = new BigInt([255, 255, 255, 255, 255, 255, 255, 255]);

  // has the correct value
  t.equal(big.toString(), '18446744073709551615');

  // with 1-bit values
  big = new BigInt([1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1], 1);

  // has the correct value
  t.equal(+big, 1337);
  t.equal(big.toString(), '1337');

  // with 32-bit values
  big = new BigInt([0xFF000000, 0x00000000, 0x00000000, 0x00000000], 32);

  // has the correct value
  t.equal(big.toString(), '338953138925153547590470800371487866880');

  t.end();
});

test('creating without "new" operator', function (t) {
  big = BigInt(123);

  // is a BigInt
  t.ok(big instanceof BigInt);

  // has the correct value
  t.equal(big.toString(), '123');

  t.end();
});
