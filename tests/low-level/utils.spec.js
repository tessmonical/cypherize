/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { escape } = require('../../lib/low-level/utils');

describe('Utiity Function Tests', function () {
  describe('Escape function', function () {
    it('Removes unsafe characters', function () {
      const unescaped = '\'thingthatisunsafe DETACH DELETE;//';
      const escaped = escape(unescaped);
      expect(escaped).to.equal('thingthatisunsafeDETACHDELETE');
    });
  });
});

