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
      assert.strictEqual(big.or(28) + 0, 31);
      assert.strictEqual(big.add(10) + 0, 13);
      assert.strictEqual(big.negate() + 0, -3);
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

      'or': function (big) {
        assert.strictEqual(big.or(6).toString(), '7');
        assert.strictEqual(big.or('6').toString(), '7');
        assert.strictEqual(big.or(new BigInt(6)).toString(), '7');
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

  'converting to bytes': {
    topic: new BigInt(65535),

    'creates a byte array correctly': function (big) {
      var bytes = big.toBytes();

      // This might seem counter-intuitive, but the array has to be padded when
      // signed, to avoid confusion with a negative number (the first bit can
      // only be set if the number is negative).
      assert.strictEqual(bytes.length, 3);
      assert.strictEqual(bytes[0], 0);
      assert.strictEqual(bytes[1], 255);
      assert.strictEqual(bytes[2], 255);
    },

    'fills an existing array correctly': function (big) {
      var bytes = big.toBytes(new Uint8Array(4));

      assert.strictEqual(bytes.length, 4);
      assert.strictEqual(bytes[0], 0);
      assert.strictEqual(bytes[1], 0);
      assert.strictEqual(bytes[2], 255);
      assert.strictEqual(bytes[3], 255);
    },

    'does not pad array when unsigned': function (big) {
      var bytes = big.toUnsignedBytes();

      assert.strictEqual(bytes.length, 2);
      assert.strictEqual(bytes[0], 255);
      assert.strictEqual(bytes[1], 255);
    },

    'for a negative value': {
      'uses two\'s complement': function () {
        var bytes;

        bytes = new BigInt(-1).toBytes();
        assert.strictEqual(bytes.length, 1);
        assert.strictEqual(bytes[0], 255);

        bytes = new BigInt(-128).toBytes();
        assert.strictEqual(bytes.length, 1);
        assert.strictEqual(bytes[0], 128);

        bytes = new BigInt(-129).toBytes();
        assert.strictEqual(bytes.length, 2);
        assert.strictEqual(bytes[0], 255);
        assert.strictEqual(bytes[1], 127);

        bytes = new BigInt(-32768).toBytes();
        assert.strictEqual(bytes.length, 2);
        assert.strictEqual(bytes[0], 128);
        assert.strictEqual(bytes[1], 0);
      }
    }
  },

  'sign': {
    'for a negative number': {
      topic: new BigInt(-123456),

      'is -1': function (big) {
        assert.strictEqual(big.sign(), -1);
      }
    },

    'for a positive number': {
      topic: new BigInt(123456),

      'is 1': function (big) {
        assert.strictEqual(big.sign(), 1);
      }
    },

    'for zero': {
      topic: new BigInt(0),

      'is 0': function (big) {
        assert.strictEqual(big.sign(), 0);
      },

      'is 0 after arithmetics': function (big) {
        assert.strictEqual(big.subtract(123456).add(123456).sign(), 0);
      }
    }
  }
}).export(module);
