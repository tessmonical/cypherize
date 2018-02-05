/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { findNodes } = require('../../lib/low-level/nodes')
const { defineModel } = require('../../lib/model');
const { driver } = require('../../lib');


describe('Model functions', function () {
  let Character;
  before(function () {
    Character = defineModel({
      name: 'character',
      fields: ['name', 'gender'],
    });
    const session = driver.session()
    session.run('MATCH (n) DETACH DELETE (n)')
      .then(function () {
        session.close();
      })
  });

  it('Creates the node in the database', function () {
    return Character.create({
      name: 'Hermione Granger',
      gender: 'female',
    })
      .then(function () {
        return findNodes({ properties: { name: 'Hermione Granger' } });
      })
      .then(function (nodes) {
        expect(nodes).to.have.lengthOf(1);
        expect(nodes[0].properties).to.have.property('name', 'Hermione Granger');
      });
  });

  it('Returns an object with the correct properties', function () {
    Character.create({
      name: 'Harry Potter',
      gender: 'male',
    })
      .then(function (createdNode) {
        expect(createdNode.name).to.equal('Harry Potter');
        expect(createdNode.gender).to.equal('male');
        expect(createdNode._id).to.be.a('string');
      });
  });
});
