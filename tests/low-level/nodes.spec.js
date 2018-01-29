/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');

require('../../secrets'); // to set environment variables
const { driver } = require('../../lib/run-driver');
const { createNode, deleteNode } = require('../../lib/low-level/nodes');


describe('Node Tests', function () {
  describe('createNode Tests', function () {
    // clear the db before each test
    beforeEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    it('Can add a single new node', function () {
      return createNode('TEST_NODE', { properties: { name: 'test' } })
        .then(() => {
          const query = 'MATCH (n) WHERE n.name = "test" RETURN n;';
          const session = driver.session();
          return session.run(query)
            // must nest these .thens for closure
            .then(function (results) {
              return results.records;
            })
            .then(function (records) {
              expect(records).to.have.length(1); // adds it once only
              const singleRecord = records[0].get(0);
              // check that it adds all the properties and nothing else
              expect(singleRecord.properties).to.have.property('name', 'test');
            })
            .then(function () {
              session.close();
            });
        });
    });

    it('Returns the added node from createNode', function () {
      return createNode('TEST_NODE', { properties: { name: 'test2000' } })
        .then(function (result) {
          expect(result.properties).to.have.property('name', 'test2000');
        });
    });
  });

  describe('deleteNode Tests', function () {
    beforeEach(function () {
      // create a node for us to delete later
      const query = 'CREATE (n:THING {name:"dorkface", _id:"test_id"}) RETURN n;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    it('Can delete a single node', function () {
      const query = 'MATCH (n:THING) WHERE n.name="dorkface" RETURN n;';
      const session = driver.session();
      const nodePromise = session.run(query)
        .then(function (results) {
          return results.records[0].get(0);
        })
        .then(function (node) {
          console.log(node);
          return deleteNode(node, { logging: console.log });
        })
        .then(function () {
          return session.run('MATCH (n:THING) RETURN n;');
        })
        .then(function (results) {
          session.close();
          const nodes = results.records;
          expect(nodes).to.have.a.lengthOf(0);
        });

      return nodePromise;
    });
  });

  after(function () {
    driver.close();
  });
});

