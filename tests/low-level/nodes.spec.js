/* eslint prefer-arrow-callback: 0 */
/* eslint-env node, mocha, chai */

const { expect } = require('chai');

require('../../secrets'); // to set environment variables
const { driver } = require('../../lib');
const {
  createNode,
  deleteNode,
  setPropertyOnNode,
  setAllPropertiesOnNode,
  findById,
  findNodes,
} = require('../../lib/low-level/nodes');


describe('Node Tests', function () {
  describe('createNode Tests', function () {
    // clear the db before each test
    beforeEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
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
              // check that it adds all the properties
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
    // clear DB after each test
    afterEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
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
          return deleteNode(node, {});
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

  describe('setPropertyOnNode tests', function () {
    beforeEach(function () {
      // create a node for us to delete later
      const query = 'CREATE (n:THING {name:"mochi", _id:"test_id"}) RETURN n;';
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

    it('Correctly adds the property', function () {
      const session = driver.session();
      return session.run('MATCH (n:THING) WHERE n.name="mochi" RETURN n;')
        .then(function (results) {
          const node = results.records[0].get(0);
          return setPropertyOnNode(node, { property: { favoriteFood: 'tuna' } });
        })
        .then(function () {
          return session.run('MATCH (n:THING) WHERE n.name="mochi" RETURN n;');
        })
        .then(function (results) {
          const node = results.records[0].get(0);
          expect(node.properties).to.contain.property('favoriteFood', 'tuna');
        });
    });

    it('returns the modified node', function () {
      const session = driver.session();
      return session.run('MATCH (n:THING) WHERE n.name="mochi" RETURN n;')
        .then(function (results) {
          const node = results.records[0].get(0);
          return setPropertyOnNode(node, { property: { bestFriendName: 'timothy' } });
        })
        .then(function (returnedNode) {
          expect(returnedNode.properties).to.contain.property('bestFriendName', 'timothy');
        });
    });
  });

  describe('setAllPropertiesOnNode tests', function () {
    beforeEach(function () {
      // create a node for us to delete later
      const session = driver.session();
      return session.run('MATCH (n) DETACH DELETE n;')
        .then(function () {
          const query = 'CREATE (n:THING {name:"Toffee", _id:"ididid"}) RETURN n;';
          return session.run(query);
        })
        .then(function () { return session.close(); })
        .catch(console.error);
    });
    // clear DB after each test
    afterEach(function () {
      const query = 'MATCH (n) DETACH DELETE n;';
      const session = driver.session();
      return session.run(query)
        .then(function () { session.close(); });
    });

    it('overwrites all properties on the node', function () {
      const session = driver.session();
      return session.run('MATCH (n:THING) WHERE n._id="ididid" RETURN n;')
        .then(function (results) {
          const node = results.records[0].get(0);
          return setAllPropertiesOnNode(node, { properties: { favoriteFood: 'tuna', name: 'cat' } });
        })
        .then(function () {
          return session.run('MATCH (n:THING) WHERE n.name="cat" RETURN n;');
        })
        .then(function (results) {
          const node = results.records[0].get(0);
          expect(node.properties).to.contain.property('favoriteFood', 'tuna');
        })
        .catch(console.error);
    });


    it('returns the modified node', function () {
      const session = driver.session();
      return session.run('MATCH (n:THING) WHERE n._id="ididid" RETURN n;')
        .then(function (results) {
          const node = results.records[0].get(0);
          return setAllPropertiesOnNode(node, { properties: { bestFriendName: 'timothy' } });
        })
        .then(function (returnedNode) {
          expect(returnedNode.properties).to.contain.property('bestFriendName', 'timothy');
        })
        .then(function () { session.close(); });
    });
  });


  describe('findById', function () {
    beforeEach(function () {
      const query = 'CREATE (n1:CHARACTER {name:"Harry Potter", _id:"hpharry1980"})-[:LOVES {_id:"ginnyharry4eva99999"}]->(n2:CHARACTER {name:"Ginny Weasley", _id:"hpGinny3q4957"})-[:LOVES {_id:"ginnyharry4eva11111"}]->(n1) RETURN n1,n2;';
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
      return findById('hpGinny3q4957')
        .then(function (node) {
          expect(node.properties).to.include({ name: 'Ginny Weasley' });
        })
        .catch(console.error);
    });
  });

  describe('findNodes', function () {
    beforeEach(function () {
      const query = 'CREATE (n1:CHARACTER {name:"Dave Strider", _id:"TG1234567890"})-[:LOVES {_id:"davekat"}]->(n2:CHARACTER {name:"Karkat Vantas", _id:"CG1234567890"})-[:LOVES {_id:"daveisabuttbuthesmybuttiguess"}]->(n1), (n1)-[:FAVE_BEVERAGE {_id:"gottahavethatAJ"}]->(n3:BEVERAGE {_id: "aj1234567890", name:"Apple Juice"}) RETURN n1,n2,n3;';
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

    it('is a function', function () {
      expect(findNodes).to.be.a('function');
    });

    it('returns an array', function () {
      return findNodes({ label: 'CHARACTER' })
        .then(function (foundNodes) {
          expect(foundNodes).to.be.an('array');
        });
    });

    it('finds the correct number of nodes', function () {
      return findNodes({ label: 'CHARACTER' })
        .then((nodeList) => {
          expect(nodeList).to.have.lengthOf(2);
        });
    });

    it('returns array of objects, with the correct properties', function () {
      return findNodes({
        label: 'CHARACTER', logging: console.log,
      })
        .then(function (nodeList) {
          expect(nodeList.map(node => node.properties)).to.deep.include(
            { name: 'Dave Strider', _id: 'TG1234567890' },
            { name: 'Karkat Vantas', _id: 'CG1234567890' },
          );
        });
    });

    it('takes a where parameter that matches all specified properties', function () {
      return findNodes({
        where: { name: 'Karkat Vantas' },
        logging: console.log,
      })
        .then(function (nodeList) {
          expect(nodeList).to.have.lengthOf(1);
          expect(nodeList.map(node => node.properties)).to.deep.include(
            { name: 'Karkat Vantas', _id: 'CG1234567890' }
          );
        });
    });
  });
});
