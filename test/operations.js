var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('operations').addBatch({
  'copy': {
    topic: new BigInt(-512),

    'is created correctly': function (big) {
      var copy = big.copy();
      assert.strictEqual(big + 0, copy + 0);
    },

    'does not affect original': function (big) {
      var copy = big.copy();
      copy.shiftRight(1);

      assert.strictEqual(big + 0, -512);
      assert.strictEqual(copy + 0, -256);
    }
  },

  'rightShift': {
    topic: new BigInt([0xDD, 0xCC, 0xBB, 0xAA]),

    'returns the unshifted values': function (big) {
      var copy = big.copy();
      var result = copy.shiftRight(8);

      assert.strictEqual(result, 0xAA);
    },

    'shifts correctly': function (big) {
      var copy = big.copy();
      copy.shiftRight(8);

      assert.strictEqual(copy + 0, 0xDDCCBB);
    }
  }
}).export(module);
