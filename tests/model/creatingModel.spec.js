/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { defineModel } = require('../../lib/model');

describe('Defining a Model', function () {
  let Model;
  before(function () {
    Model = defineModel({
      name: 'character',
      fields: ['name', 'gender'],
    });
  });

  it('defineModel is a function', function () {
    expect(defineModel).to.be.a('function');
  });

  it('defineModel returns a function', function () {
    expect(Model).to.be.a('function');
  });

  it('defineModel returns function with correct prototype methods', function () {
    expect(Model.findAll).to.be.a('function');
    expect(Model.findOne).to.be.a('function');
    expect(Model.create).to.be.a('function');
    expect(Model.delete).to.be.a('function');
  });

  it('defineModel returns function with correct properties', function () {
    expect(Model.name).to.be.a('string');
    expect(Model.name).to.eq('CHARACTER');
    expect(Model.allowedFields).to.be.an('array');
    expect(Model.allowedFields).to.deep.equal(['name', 'gender'])
  });
});
