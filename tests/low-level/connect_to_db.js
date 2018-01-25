/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');

describe('Sanity Tests', function () {
  it('Sanity checks', function () {
    expect(0).to.equal(0);
    expect(2).not.to.equal(3);
  });
});

describe('Connection', function () {
  it('Connects to the database without erroring', function () {
    require('../../secrets');
    require('../../lib/index');
  });
});
