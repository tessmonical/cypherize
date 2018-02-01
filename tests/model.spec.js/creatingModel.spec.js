/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { defineModel } = require('../../lib/model');

describe('defineModel', function () {
  let Model;
  beforeEach(function () {
    Model = defineModel({
      name: 'character',
      fields: ['name', 'gender'],
    });
  });

  it('is a function', function () {
    expect(defineModel).to.be.a('function');
  });

  it('returns a function', function () {
    expect(Model).to.be.a('function');
  });

  it('returns function with correct prototype methods', function () {
    expect(Model.prototype.findAll).to.be.a('function');
    expect(Model.prototype.findOne).to.be.a('function');
    expect(Model.prototype.create).to.be.a('function');
    expect(Model.prototype.delete).to.be.a('function');
    expect(Model.prototype.setProperty).to.be.a('function');
  });
});
