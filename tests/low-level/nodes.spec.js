/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');

require('../../secrets'); // to set environment variables
const { driver } = require('../../lib/run-driver');
const { createNode } = require('../../lib/low-level/nodes');


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
              expect(singleRecord.properties).to.deep.equal({ name: 'test' });
            })
            .then(function () {
              session.close();
            });
        });
    });


    it('Returns the added node from createNode', function () {
      return createNode('TEST_NODE', { properties: { name: 'test2000' } })
        .then(function (result) {
          expect(result.properties).to.deep.equal({ name: 'test2000' });
        });
    });
  });

  after(function () {
    driver.close();
  });
});

