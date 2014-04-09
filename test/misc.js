var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('misc').addBatch({
  'operations': {
    'create copies': function () {
      var big = new BigInt(3);

      assert.strictEqual(big.shiftLeft(1) + 0, 6);
      assert.strictEqual(big.shiftRight(1) + 0, 1);
      assert.strictEqual(big.and(1) + 0, 1);
      assert.strictEqual(big.add(10) + 0, 13);
      assert.strictEqual(big.subtract(5) + 0, -2);

      assert.strictEqual(big.toString(), '3');
    },

    'accept numbers, strings, and BigInt': {
      topic: new BigInt(5),

      'add': function (big) {
        assert.strictEqual(big.add(10).toString(), '15');
        assert.strictEqual(big.add('10').toString(), '15');
        assert.strictEqual(big.add(new BigInt(10)).toString(), '15');
      },

      'and': function (big) {
        assert.strictEqual(big.and(6).toString(), '4');
        assert.strictEqual(big.and('6').toString(), '4');
        assert.strictEqual(big.and(new BigInt(6)).toString(), '4');
      },

      'shiftLeft': function (big) {
        assert.strictEqual(big.shiftLeft(1).toString(), '10');
        assert.strictEqual(big.shiftLeft('1').toString(), '10');
        assert.strictEqual(big.shiftLeft(new BigInt(1)).toString(), '10');
      },

      'shiftRight': function (big) {
        assert.strictEqual(big.shiftRight(1).toString(), '2');
        assert.strictEqual(big.shiftRight('1').toString(), '2');
        assert.strictEqual(big.shiftRight(new BigInt(1)).toString(), '2');
      },

      'subtract': function (big) {
        assert.strictEqual(big.subtract(10).toString(), '-5');
        assert.strictEqual(big.subtract('10').toString(), '-5');
        assert.strictEqual(big.subtract(new BigInt(10)).toString(), '-5');
      }
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
