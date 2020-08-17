/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');
const { findNodes, createNode } = require('../../lib/low-level/nodes');
const { defineModel } = require('../../lib/model');
const { driver } = require('../../lib');


describe('Model functions', function () {
  before(function () {
    const session = driver.session();
    session.run('MATCH (n) DETACH DELETE (n)').then()
      .finally(function () { session.close();  })
  });

  after(function () {
    const session = driver.session();
    session.run('MATCH (n) DETACH DELETE (n)')
      .then(function () { session.close();  })
      .catch(err => console.err);;
  });

  describe('Model.create', function () {
    let Character;
    before(function () {
      Character = defineModel({
        name: 'character',
        fields: ['name', 'gender'],
      });
    })

    it('Creates the node in the database', function () {
      return Character.create({
        name: 'Hermione Granger',
        gender: 'female',
      })
        .then(function (chararcter) {
          return findNodes({});
        })
        .then(function (nodes) {
          expect(nodes).to.have.lengthOf(1);
          expect(nodes[0].properties).to.have.property('name', 'Hermione Granger');
          expect(nodes[0].properties).to.have.property('gender', 'female');
        });
    });

    it('Returns an object with the correct properties', function () {
      Character.create({
        name: 'Harry Potter',
        gender: 'male',
      })
        .then(function (createdNode) {
          expect(createdNode.fields.name).to.equal('Harry Potter');
          expect(createdNode.fields.gender).to.equal('male');
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
        })
        .finally(function () {  session.close();  })
    });

    it('Can find all models of specific type', function () {
      return Fanfic.findAll()
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

  describe('Model.findOne', function () {
    let Podfic;
    before(function () {
      Podfic = defineModel({
        name: 'podfic',
        fields: ['title', 'text', 'rating'],
      });
      const session = driver.session();
      return session.run('MATCH (n) DETACH DELETE (n)')
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
            createNode('PODFIC', {
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
        })
        .finally(function () { session.close();  })
    });

    it('returns only one thing', function () {
      return Podfic.findOne()
        .then(function (podfic) {
          expect(podfic).to.be.an('object');
          expect(podfic).not.to.be.an('array');
        });
    });
  });


  describe('Model.delete', function () {
    let Podfic;
    let Fanfic;
    beforeEach(function () {
      Podfic = defineModel({
        name: 'podfic',
        fields: ['title', 'text', 'rating'],
      });
      Fanfic = defineModel({
        name: 'fanfic',
        fields: ['title', 'text', 'rating'],
      });
      const session = driver.session();
      return session.run('MATCH (n) DETACH DELETE (n)')
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
            createNode('PODFIC', {
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
        })
        .finally(function () { session.close();  })
    });

    it('Deletes all models if no options are passed', function () {
      return Fanfic.delete()
        .then(function () {
          return Promise.all([
            Podfic.findAll(),
            Fanfic.findAll(),
          ]);
        })
        .then(function ([podfics, fanfics]) {
          expect(podfics).to.have.lengthOf(2);
          expect(fanfics).to.have.lengthOf(0);
        });
    });

    it('Deletes the correct things (and nothing else)', function () {
      return Fanfic.delete({
        where: {
          rating: 'E for everyone',
        },
      })
        .then(function () {
          return Fanfic.findAll();
        })
        .then(function (fanfics) {
          expect(fanfics).to.have.lengthOf(1);
          expect(fanfics[0]).to.have.property('title', 'The Most Scandelous Fanfic Ever');
        });
    });
  });
});
