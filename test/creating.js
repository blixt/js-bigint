var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('Creating BigInt').addBatch({
  'with a huge number': {
    topic: new BigInt([255, 255, 255, 255, 255, 255, 255, 255]),

    'works': function (big) {
      assert.instanceOf(big, BigInt);
      assert.equal(big.toString(), '18446744073709551615');
    }
  },

  'with 1-bit values': {
    topic: new BigInt([1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1], 1),

    'works': function (big) {
      assert.equal(big.toString(), '1337');
    }
  },

  'with 32-bit values': {
    topic: new BigInt([0xFF000000, 0x00000000, 0x00000000, 0x00000000], 32),

    'works': function (big) {
      assert.equal(big.toString(), '338953138925153547590470800371487866880');
    }
  }
}).export(module);
