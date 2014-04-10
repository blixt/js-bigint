var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('bitwise').addBatch({
  'and': {
    topic: new BigInt(0xF0F0F0F0),

    'with bigger bitmask': function (big) {
      assert.strictEqual(big.and(0xAAAAAAAAAAAA) + 0, 0xA0A0A0A0);
    },

    'with equal size bitmask': function (big) {
      assert.strictEqual(big.and(0xAAAAAAAA) + 0, 0xA0A0A0A0);
    },

    'with smaller bitmask': function (big) {
      assert.strictEqual(big.and(0xAA) + 0, 0xA0);
    }
  },

  'or': {
    topic: new BigInt('0x1100011'),

    'with bigger bitmask': function (big) {
      assert.strictEqual(big.or('0xA0A0A0A0A0A0A0A') + 0, 723401728398592539);
    },

    'with equal size bitmask': function (big) {
      assert.strictEqual(big.or('0x1234321') + 0, 20136753);
    },

    'with smaller bitmask': function (big) {
      assert.strictEqual(big.or('0xAB') + 0, 17825979);
    }
  },

  'shift': {
    topic: new BigInt(0xDDCCBBAA),

    'left': function (big) {
      assert.strictEqual(big.shiftLeft(8) + 0, 0xDDCCBBAA00);
      // Corner case where value fits perfectly in one value before shift.
      assert.strictEqual(new BigInt(32767).shiftLeft(1) + 0, 65534);
    },

    'right': function (big) {
      assert.strictEqual(big.shiftRight(8) + 0, 0xDDCCBB);
    }
  },

  'xor': {
    topic: new BigInt('0x1100011'),

    'with bigger bitmask': function (big) {
      assert.strictEqual(big.xor('0xA0A0A0A0A0A0A0A') + 0, 723401728398592539);
    },

    'with equal size bitmask': function (big) {
      assert.strictEqual(big.xor('0x1234321') + 0, 3359536);
    },

    'with smaller bitmask': function (big) {
      assert.strictEqual(big.xor('0xAB') + 0, 17825978);
    }
  }
}).export(module);
