var Benchmark = require('benchmark');
var BigInt = require('../');

var suite = new Benchmark.Suite();

var a = new BigInt('0xFEDCBA9876543210'),
    b = new BigInt('0x123456789ABCDEF0');

suite
.add('Creating BigInt from array', function () {
  new BigInt([0x07, 0x5B, 0xCD, 0x15]);
})
.add('Creating BigInt from BigInt', function () {
  new BigInt(a);
})
.add('Creating BigInt from number', function () {
  new BigInt(123456789);
})
.add('Creating BigInt from string', function () {
  new BigInt('123456789');
})
.add('Addition', function () {
  a.add(b);
})
.add('Subtraction', function () {
  a.subtract(b);
})
.add('Multiplication', function () {
  a.multiply(b);
})
.add('Bitwise AND', function () {
  a.and(b);
})
.add('Bitwise OR', function () {
  a.or(b);
})
.add('Bitwise XOR', function () {
  a.xor(b);
})
.add('Shift left', function () {
  a.shiftLeft(10);
})
.add('Shift right', function () {
  a.shiftRight(10);
})
.add('toString', function () {
  a.toString();
})
.on('cycle', function (event) {
  console.log(event.target.toString());
})
.on('complete', function () {
  phantom.exit(0);
})
.run({async: true});
