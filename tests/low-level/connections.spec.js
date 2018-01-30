/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');

require('../../secrets'); // to set environment variables
const { driver } = require('../../lib');
const {
  createConnection,
  deleteConnection,
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
      return session.run(query);
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
});
