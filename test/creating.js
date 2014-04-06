var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('Creating BigInt').addBatch({
  'from a JavaScript number': {
    topic: new BigInt(0xABCDEF0ABCDEF),

    'is a BigInt': function (big) {
      assert.instanceOf(big, BigInt);
    },

    'has the correct value': function (big) {
      assert.strictEqual(big.toString(), '3022415473659375');
      assert.strictEqual(big + 0, 0xABCDEF0ABCDEF);
    },

    'that is negative': {
      topic: new BigInt(-0xFEDCBA),

      'has the correct value': function (big) {
        assert.strictEqual(big + 0, -0xFEDCBA);
      }
    }
  },

  'from an array': {
    topic: new BigInt([255, 255, 255, 255, 255, 255, 255, 255]),

    'is a BigInt': function (big) {
      assert.instanceOf(big, BigInt);
    },

    'has the correct value': function (big) {
      assert.strictEqual(big.toString(), '18446744073709551615');
    },

    'with 1-bit values': {
      topic: new BigInt([1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1], 1),

      'has the correct value': function (big) {
        assert.strictEqual(big + 0, 1337);
        assert.strictEqual(big.toString(), '1337');
      }
    },

    'with 32-bit values': {
      topic: new BigInt([0xFF000000, 0x00000000, 0x00000000, 0x00000000], 32),

      'has the correct value': function (big) {
        assert.strictEqual(big.toString(), '338953138925153547590470800371487866880');
      }
    }
  }
}).export(module);
