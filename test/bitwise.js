var test = require('tape');

var BigInt = require('../');

test('bitwise and', function (t) {
  var big = new BigInt(0xF0F0F0F0);

  // with bigger bitmask
  t.equal(+big.and(0xAAAAAAAAAAAA), 0xA0A0A0A0);

  // with equal size bitmask
  t.equal(+big.and(0xAAAAAAAA), 0xA0A0A0A0);

  // with smaller bitmask
  t.equal(+big.and(0xAA), 0xA0);

  t.end();
});

test('bitwise or', function (t) {
  var big = new BigInt('0x1100011');

  // with bigger bitmask
  t.equal(big.or('0xA0A0A0A0A0A0A0A').toString(), '723401728398592539');

  // with equal size bitmask
  t.equal(+big.or('0x1234321'), 20136753);

  // with smaller bitmask
  t.equal(+big.or('0xAB'), 17825979);

  t.end();
});

test('bitwise shift', function (t) {
  var big = new BigInt(0xDDCCBBAA);

  // left
  t.equal(+big.shiftLeft(8), 0xDDCCBBAA00);

  // Corner case where value fits perfectly in one value before shift.
  t.equal(+new BigInt(32767).shiftLeft(1), 65534);

  // right
  t.equal(+big.shiftRight(8), 0xDDCCBB);

  t.end();
});

test('bitwise xor', function (t) {
  var big = new BigInt('0x1100011');

  // with bigger bitmask
  t.equal(big.xor('0xABABABABABABABA').toString(), '773135597222673067');

  // with equal size bitmask
  t.equal(+big.xor('0x1234321'), 3359536);

  // with smaller bitmask
  t.equal(+big.xor('0xAB'), 17825978);

  t.end();
});
