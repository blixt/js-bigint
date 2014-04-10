var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('arithmetic').addBatch({
  'addition': {
    topic: new BigInt(123456),

    'with a positive number': function (big) {
      assert.strictEqual(big.add(0).toString(), '123456');
      assert.strictEqual(big.add(1).toString(), '123457');
      assert.strictEqual(big.add(123).toString(), '123579');
      assert.strictEqual(big.add(123456789).toString(), '123580245');
    },

    'with a negative number': function (big) {
      assert.strictEqual(big.add(-1).toString(), '123455');
      assert.strictEqual(big.add(-456).toString(), '123000');
      assert.strictEqual(big.add(-123000).toString(), '456');
      assert.strictEqual(big.add(-123456789).toString(), '-123333333');
    },

    'with the same number, negated': function (big) {
      assert.strictEqual(big.add(-123456).toString(), '0');
    },

    'on a negative number': {
      topic: new BigInt(-123456),

      'with a positive number': function (big) {
        assert.strictEqual(big.add(0).toString(), '-123456');
        assert.strictEqual(big.add(1).toString(), '-123455');
        assert.strictEqual(big.add(123).toString(), '-123333');
        assert.strictEqual(big.add(123456789).toString(), '123333333');
      },

      'with another negative number': function (big) {
        assert.strictEqual(big.add(-1).toString(), '-123457');
        assert.strictEqual(big.add(-456).toString(), '-123912');
        assert.strictEqual(big.add(-123000).toString(), '-246456');
        assert.strictEqual(big.add(-123456789).toString(), '-123580245');
      }
    }
  },

  'multiplication': {
    topic: new BigInt(123456),

    'with a negative number': function (big) {
      assert.strictEqual(big.multiply(-1).toString(), '-123456');
      assert.strictEqual(big.multiply(-10).toString(), '-1234560');
      assert.strictEqual(big.multiply(-987654321).toString(), '-121931851853376');
    },

    'with a positive number': function (big) {
      assert.strictEqual(big.multiply(0).toString(), '0');
      assert.strictEqual(big.multiply(1).toString(), '123456');
      assert.strictEqual(big.multiply(10).toString(), '1234560');
      assert.strictEqual(big.multiply(987654321).toString(), '121931851853376');
    }
  },

  'subtraction': {
    topic: new BigInt(123456),

    'with a positive number': function (big) {
      assert.strictEqual(big.subtract(0).toString(), '123456');
      assert.strictEqual(big.subtract(1).toString(), '123455');
      assert.strictEqual(big.subtract(123).toString(), '123333');
      assert.strictEqual(big.subtract(123456789).toString(), '-123333333');
    },

    'with a negative number': function (big) {
      assert.strictEqual(big.subtract(-1).toString(), '123457');
      assert.strictEqual(big.subtract(-456).toString(), '123912');
      assert.strictEqual(big.subtract(-123000).toString(), '246456');
      assert.strictEqual(big.subtract(-123456789).toString(), '123580245');
    },

    'with the same number': function (big) {
      assert.strictEqual(big.subtract(123456).toString(), '0');
    },

    'on a negative number': {
      topic: new BigInt(-123456),

      'with a positive number': function (big) {
        assert.strictEqual(big.subtract(0).toString(), '-123456');
        assert.strictEqual(big.subtract(1).toString(), '-123457');
        assert.strictEqual(big.subtract(123).toString(), '-123579');
        assert.strictEqual(big.subtract(123456789).toString(), '-123580245');
      },

      'with another negative number': function (big) {
        assert.strictEqual(big.subtract(-1).toString(), '-123455');
        assert.strictEqual(big.subtract(-456).toString(), '-123000');
        assert.strictEqual(big.subtract(-123000).toString(), '-456');
        assert.strictEqual(big.subtract(-123456789).toString(), '123333333');
      }
    }
  }
}).export(module);
