var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('misc').addBatch({
  'operations create copies': function () {
    var big = new BigInt(3);

    assert.strictEqual(big.shiftLeft(1) + 0, 6);
    assert.strictEqual(big.shiftRight(1) + 0, 1);
    assert.strictEqual(big.and(1) + 0, 1);

    assert.strictEqual(big.toString(), '3');
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
