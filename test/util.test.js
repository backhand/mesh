'use strict';

const assert = require('assert');
const mesh   = require('../lib/mesh');

describe('util', function() {
  describe('deepCopy', function() {
    it('should recursively clone an object', function() {
      const aString = 'astring';
      const aDate   = new Date();
      const anObject = { hejsa: 123 };
      const aNumber = 1234;

      const original = {
        a: {
          b: {
            c: aString
          },
          aList: [anObject],
          aDate: aDate
        },
        aNumber: aNumber
      };
      const copy = mesh.util.deepCopy(original);
      assert.ok(copy);
      assert.deepEqual(copy, original);

      // Modify copy and check that original is unchanged
      copy.a.b.c = 'hovsa';
      assert.equal(original.a.b.c, aString);

      copy.a.aList[0].hejsa = 200;
      assert.equal(original.a.aList[0].hejsa, anObject.hejsa);

      copy.a.aDate = new Date();
      assert.equal(original.a.aDate, aDate);

      copy.aNumber = 500;
      assert.equal(original.aNumber, aNumber);
    });
  }); // End describe deepCopy
}); // End describe util
