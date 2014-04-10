var Benchmark = require('benchmark');
var BigInt = require('../');

var suite = new Benchmark.Suite();

suite
.add('Creating BigInt from array', function () {
  new BigInt([0x07, 0x5B, 0xCD, 0x15]);
})
.add('Creating BigInt from number', function () {
  new BigInt(123456789);
})
.add('Creating BigInt from string', function () {
  new BigInt('123456789');
})
.on('cycle', function (event) {
  console.log(event.target.toString());
})
.on('complete', function () {
  phantom.exit(0);
})
.run({async: true});
