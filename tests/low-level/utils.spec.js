/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { escape, buildWhere } = require('../../lib/low-level/utils');

describe('Utiity Function Tests', function () {
  describe('Escape function', function () {
    it('Removes unsafe characters', function () {
      const unescaped = '\'thingthatisunsafe DETACH DELETE;//';
      const escaped = escape(unescaped);
      expect(escaped).to.equal('thingthatisunsafeDETACHDELETE');
    });
  });

  describe('buildWhere function', function () {
    it('Builds a "WHERE" subquery', function () {
      const where = {
        name: 'Pandas',
        population: 5,
      };
      const whereString = buildWhere(where);
      expect(whereString).to.equal('WHERE n.name=$name, n.population=$population');
    });
  });
});
