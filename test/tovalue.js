var assert = require('assert'),
    vows = require('vows');

var BigInt = require('../');

vows.describe('tovalue').addBatch({
  'for a number just under 53 bits': {
    topic: new BigInt([15, 255, 255, 255, 255, 255, 255]),

    'has the correct value': function (big) {
      assert.strictEqual(big + 0, 4503599627370495);
    }
  }
}).export(module);
