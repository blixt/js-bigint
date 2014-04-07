var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('arithmetic').addBatch({
  'addition': {
    topic: new BigInt(123),

    'with a positive number': function (big) {
      assert.strictEqual(big.add(0).toString(), '123');
      assert.strictEqual(big.add(1).toString(), '124');
      assert.strictEqual(big.add(456).toString(), '579');
    },

    'with a string': function (big) {
      var result = big.add('100000000000000000');
      assert.strictEqual(result.toString(), '100000000000000123');
    },

    'with a negative number': function (big) {
      assert.strictEqual(big.add(-1).toString(), '-122');
      assert.strictEqual(big.add(-456).toString(), '-333');
    },

    'with another BigInt': function (big) {
      var other = new BigInt(456);
      assert.strictEqual(big.add(other).toString(), '579');
    }
  }
}).export(module);
