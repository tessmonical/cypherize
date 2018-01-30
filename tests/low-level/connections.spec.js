/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');

require('../../secrets'); // to set environment variables
const { driver } = require('../../lib');
const {
  createConnection,
  deleteConnection,
  findById,
} = require('../../lib/low-level/connection');

describe('Connection Tests', function () {
  describe('createConnection', function () {
    beforeEach(function () {
      const query =
        'CREATE (n1:THING {name:"thing1", _id:"thing1"}), (n2:THING {name:"thing2", _id:"thing2"}) RETURN n1,n2;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    // clear DB after each test
    afterEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    it('Creates the connection', function () {
      const query = 'WITH ["thing1", "thing2"] AS names MATCH (n:THING) WHERE n.name IN names RETURN n;';
      const session = driver.session();
      return session.run(query)
        .then(function (results) {
          return results.records.map(result => result.get(0));
        })
        .then(function (nodes) {
          return createConnection(nodes[0], 'IS_SIBLING_OF', nodes[1]);
        })
        .then(function () {
          return session.run('MATCH (n)-[c]->(n2) RETURN c;');
        })
        .then(function (results) {
          const connection = results.records[0].get(0);
          expect(connection.type).to.equal('IS_SIBLING_OF');
        })
        .then(function () { session.close(); });
    });


    it('Returns the connection', function () {
      const query = 'WITH ["thing1", "thing2"] AS names MATCH (n:THING) WHERE n.name IN names RETURN n;';
      const session = driver.session();
      return session.run(query)
        .then(function (results) {
          return results.records.map(result => result.get(0));
        })
        .then(function (nodes) {
          return createConnection(nodes[0], 'IS_SIBLING_OF', nodes[1]);
        })
        .then(function (connection) {
          expect(connection.type).to.equal('IS_SIBLING_OF');
        })
        .then(function () { session.close(); });
    });
  });

  describe('deleteConnection', function () {
    beforeEach(function () {
      // Ron loves Hermione, who loves her back :)
      const query =
        'CREATE (n1:CHARACTER {name:"Ron Weasley", _id:"hpron"})-[:LOVES {_id:"ronmionehr321"}]->(n2:CHARACTER {name:"Hermione Granger", _id:"hphermione"})-[:LOVES {_id:"ronmionerh123"}]->(n1) RETURN n1,n2;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    it('can delete a connection', function () {
      // Hermione loves someone-- let's return that "love" connection
      const query = 'MATCH (hermione:CHARACTER)-[love:LOVES]->(:CHARACTER) WHERE hermione.name="Hermione Granger" RETURN love;';
      const session = driver.session();
      return session.run(query)
        .then(function (results) {
          const connection = results.records[0].get(0);
          deleteConnection(connection); // oh no! Hermione has fallen out of love
        })
        .then(function () {
          return session.run(query);
        })
        .then(function (results) {
          expect(results.records).to.have.lengthOf(0); // Hermione loves no one now
        })
        .then(function () { session.close(); });
    });

    // clear DB after each test
    afterEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
      const session = driver.session();
      return session.run(query)
        .then(function () {
          session.close();
        });
    });
  });

  describe('findById', function () {
    beforeEach(function () {
      const query = 'CREATE (n1:CHARACTER {name:"Harry Potter", _id:"hpharry1980"})-[:LOVES {_id:"ginnyharry4eva99999"}]->(n2:CHARACTER {name:"Ginny Weasley", _id:"hpGinny3q4957"})-[:LOVES {_id:"ginnyharry4eva11111", random_attribute:"best ship" }]->(n1) RETURN n1,n2;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });
    // clear DB after each test
    afterEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    it('Returns the correct node', function () {
      return findById('ginnyharry4eva11111')
        .then(function (connection) {
          expect(connection.properties).to.include({ random_attribute: 'best ship' });
        })
        .catch(console.error);
    });
  });
});
