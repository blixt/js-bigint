var test = require('tape');

var BigInt = require('../');

test('addition', function (t) {
  var big = new BigInt(123456);

  // with a positive number
  t.equal(big.add(0).toString(), '123456');
  t.equal(big.add(1).toString(), '123457');
  t.equal(big.add(123).toString(), '123579');
  t.equal(big.add(123456789).toString(), '123580245');

  // with a negative number
  t.equal(big.add(-1).toString(), '123455');
  t.equal(big.add(-456).toString(), '123000');
  t.equal(big.add(-123000).toString(), '456');
  t.equal(big.add(-123456789).toString(), '-123333333');

  // on a negative number
  big = new BigInt(-123456);

  // with a positive number
  t.equal(big.add(0).toString(), '-123456');
  t.equal(big.add(1).toString(), '-123455');
  t.equal(big.add(123).toString(), '-123333');
  t.equal(big.add(123456789).toString(), '123333333');

  // with another negative number
  t.equal(big.add(-1).toString(), '-123457');
  t.equal(big.add(-456).toString(), '-123912');
  t.equal(big.add(-123000).toString(), '-246456');
  t.equal(big.add(-123456789).toString(), '-123580245');

  t.end();
});

test('multiplication', function (t) {
  var big = new BigInt(123456);

  // with a negative number
  t.equal(big.multiply(-1).toString(), '-123456');
  t.equal(big.multiply(-10).toString(), '-1234560');
  t.equal(big.multiply(-987654321).toString(), '-121931851853376');

  // with a positive number
  t.equal(big.multiply(0).toString(), '0');
  t.equal(big.multiply(1).toString(), '123456');
  t.equal(big.multiply(10).toString(), '1234560');
  t.equal(big.multiply(987654321).toString(), '121931851853376');

  t.end();
});

test('subtraction', function (t) {
  var big = new BigInt(123456);

  // with a positive number
  t.equal(big.subtract(0).toString(), '123456');
  t.equal(big.subtract(1).toString(), '123455');
  t.equal(big.subtract(123).toString(), '123333');
  t.equal(big.subtract(123456789).toString(), '-123333333');

  // with a negative number
  t.equal(big.subtract(-1).toString(), '123457');
  t.equal(big.subtract(-456).toString(), '123912');
  t.equal(big.subtract(-123000).toString(), '246456');
  t.equal(big.subtract(-123456789).toString(), '123580245');

  // with the same number
  t.equal(big.subtract(123456).toString(), '0');

  // on a negative number
  big = new BigInt(-123456);

  // with a positive number
  t.equal(big.subtract(0).toString(), '-123456');
  t.equal(big.subtract(1).toString(), '-123457');
  t.equal(big.subtract(123).toString(), '-123579');
  t.equal(big.subtract(123456789).toString(), '-123580245');

  // with another negative number
  t.equal(big.subtract(-1).toString(), '-123455');
  t.equal(big.subtract(-456).toString(), '-123000');
  t.equal(big.subtract(-123000).toString(), '-456');
  t.equal(big.subtract(-123456789).toString(), '123333333');

  t.end();
});
