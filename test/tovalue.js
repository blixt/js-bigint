var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('tovalue').addBatch({
  'for a number just under 53 bits': {
    topic: new BigInt(4503599627370495),

    'has the correct value': function (big) {
      assert.strictEqual(+big, 4503599627370495);
    },

    'that is negative': {
      topic: new BigInt(-4503599627370495),

      'has the correct value': function (big) {
        assert.strictEqual(+big, -4503599627370495);
      }
    }
  }
}).export(module);
