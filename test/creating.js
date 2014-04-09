var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('creating').addBatch({
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

  'from a string': {
    topic: new BigInt('123456789012345678901234567890'),

    'is a BigInt': function (big) {
      assert.instanceOf(big, BigInt);
    },

    'has the correct value': function (big) {
      assert.strictEqual(big.toString(), '123456789012345678901234567890');
    },

    'in base 16': {
      topic: new BigInt('FFFFFFFF', 16),

      'has the correct value': function (big) {
        assert.strictEqual(big + 0, 0xFFFFFFFF);
      }
    },

    'that is negative': {
      topic: new BigInt('-123456789012345678901234567890'),

      'has the correct value': function (big) {
        assert.strictEqual(big.toString(), '-123456789012345678901234567890');
      }
    }
  },

  'from an array': {
    topic: new BigInt([255, 255, 255, 255, 255, 255, 255, 255]),

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
  },

  'without "new" operator': {
    topic: BigInt(123),

    'is a BigInt': function (big) {
      assert.instanceOf(big, BigInt);
    },

    'has the correct value': function (big) {
      assert.strictEqual(big.toString(), '123');
    }
  }
}).export(module);
