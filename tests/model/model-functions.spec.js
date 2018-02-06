/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { findNodes, createNode } = require('../../lib/low-level/nodes');
const { defineModel } = require('../../lib/model');
const { driver } = require('../../lib');


describe('Model functions', function () {
  describe('Model.create', function () {
    let Character;
    before(function () {
      Character = defineModel({
        name: 'character',
        fields: ['name', 'gender'],
      });
      const session = driver.session();
      session.run('MATCH (n) DETACH DELETE (n)')
        .then(function () {
          session.close();
        });
    });

    after(function () {
      const session = driver.session();
      session.run('MATCH (n) DETACH DELETE (n)')
        .then(function () {
          session.close();
        });
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
          expect(nodes[0].properties).to.have.property('gender', 'female');
          expect(nodes[0].properties).to.have.property('_id');
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

  describe('Model.findAll', function () {
    let Fanfic;
    before(function () {
      Fanfic = defineModel({
        name: 'fanfic',
        fields: ['title', 'text', 'rating'],
      });
      const session = driver.session();
      return session.run('MATCH (n) DETACH DELETE (n)')
        .then(function () {
          session.close();
        })
        .then(function () {
          return Promise.all([
            createNode('PODFIC', {
              properties: {
                title: 'The Best Fanfic Ever',
                text: 'Ron and Hermione went on a date. The End.',
                rating: 'E for everyone',
              },
            }),
            createNode('FANFIC', {
              properties: {
                title: 'The Best Fanfic Ever',
                text: 'Ron and Hermione went on a date. The End.',
                rating: 'E for everyone',
              },
            }),
            createNode('FANFIC', {
              properties: {
                title: 'The Worst Fanfic Ever',
                text: 'Ron and Hermione broke up. The End.',
                rating: 'N for no one',
              },
            }),
            createNode('FANFIC', {
              properties: {
                title: 'The Most Scandelous Fanfic Ever',
                text: 'Harry and Draco kiss passionately. The End.',
                rating: 'T for teens',
              },
            }),
          ]);
        });
    });

    it('Can find all models of specific type', function () {
      return Fanfic.findAll({
        logging: console.log.bind(console),
      })
        .then(function (fanfics) {
          expect(fanfics).to.have.lengthOf(3);
        });
    });

    it('Can find based on key', function () {
      return Fanfic.findAll({
        where: {
          title: 'The Worst Fanfic Ever',
        },
      })
        .then((foundArr) => {
          expect(foundArr).to.have.lengthOf(1);
          expect(foundArr[0]).to.have.property('title', 'The Worst Fanfic Ever');
        });
    });
  });
});
