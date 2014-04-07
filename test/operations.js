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

  'shiftRight': {
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
  },

  'toBytes': {
    topic: new BigInt(65535),

    'creates a byte array correctly': function (big) {
      var bytes = big.toBytes();

      assert.strictEqual(bytes.length, 2);
      assert.strictEqual(bytes[0], 255);
      assert.strictEqual(bytes[1], 255);
    },

    'fills an existing array correctly': function (big) {
      var bytes = big.toBytes(new Uint8Array(4));

      assert.strictEqual(bytes.length, 4);
      assert.strictEqual(bytes[0], 0);
      assert.strictEqual(bytes[1], 0);
      assert.strictEqual(bytes[2], 255);
      assert.strictEqual(bytes[3], 255);
    },

    'for a negative value': {
      topic: new BigInt(-1),

      'uses two\'s complement': function (big) {
        var bytes = big.toBytes(new Uint8Array(4));

        assert.strictEqual(bytes.length, 4);
        assert.strictEqual(bytes[0], 255);
        assert.strictEqual(bytes[1], 255);
        assert.strictEqual(bytes[2], 255);
        assert.strictEqual(bytes[3], 255);
      }
    }
  }
}).export(module);
