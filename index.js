const neo4j = require('neo4j-driver').v1;

const uri = process.env.databaseURI
const user = process.env.databaseUser
const password = process.env.databasePassword

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));


const createNode = async (type, options = {}) => {
  const session = driver.session();
  let query = `CREATE (newNode:${type}) RETURN newNode`;
  if (options.properties) {
    query = `CREATE (newNode:${type}) SET newNode=$properties RETURN newNode`
  }

  const results = await session.run(query,
    { type, properties: options.properties },
  );
  // uses built-in getter to get the record in a nicer format
  return results.records[0].get(0);
};

const createConnection = async (nodeOrId1, type, nodeOrId2) => {
  let id1;
  let id2;
  // this will be used in string interpolation so having this num be
  // a string is fine-- converting to a number could result in overflow since neo4j allows larger numbers than javascipt
  if (typeof nodeOrId1 === 'number') id1 = nodeOrId1;
  else id1 = nodeOrId1.identity.toString();
  if (typeof nodeOrId2 === 'number') id2 = nodeOrId2;
  else id2 = nodeOrId2.identity.toString();

  const session = driver.session();
  const results = await session.run(
    `
    MATCH (node1) WHERE ID(node1)=$id1
    MATCH (node2) WHERE ID(node2)=$id2
    CREATE
    (node1)-[newConnection:${type}]->(node2)
    RETURN newConnection;
    `,
    { id1, id2 },
  );
  // uses built-in getter to get the record in a nicer format
  return results.records[0].get(0);
};

const deleteNode = (nodeOrId, options) => {
  let id
  if (typeof nodeOrId === 'number') id = nodeOrId;
  //safer than toNumber since Neo4j numbers can be larger than JS numbers
  else id = nodeOrId.identity.toString();

  let force
  if (!options) force = false
  else force = options.force

  const session = driver.session();

  let query = `MATCH (n) WHERE ID(n)=${id} DELETE n;`
  if (force) { // add DETACH (deletes all connections if node is connected)
    query = `MATCH (n) WHERE ID(n)=${id} DETACH DELETE n;`
  }

  return session.run(query)
    .then(() => true)
    .catch((err) => {
      console.error(err)
      return false
    })
}

const deleteConnection = (connectionId) => {
  if (typeof connectionId !== 'number') connectionId = connectionId.identity.toString()

  const session = driver.session();
  let query = `MATCH [n] WHERE ID[n]=${connectionId} DELETE n;`
  return session.run(query)
    .then(() => true)
    .catch((err) => {
      console.error(err)
      return false
    })
}

//options: {property: {name: 'Harry Potter'}}
const setPropertyOnNode = async (nodeOrId, options) => {
  if (typeof nodeOrId !== 'number') nodeOrId = nodeOrId.identity.toNumber();
  const params = { id: nodeOrId };
  if (!options.property) throw new Error ('You must specify a property to set');
  const [key, value] = Object.entries(options.property)
  params.propValue = value;

  let query = `MATCH (n) WHERE ID(n)=$id set n.${key} = n.$propValue RETURN n;`
  const session = driver.session();

  return session.run(query, params)
    .then(() => true)
    .catch((err) => {
      console.error(err)
      return false
    });
}

// properties: {name: 'Harry Potter', gender: 'm', etc}
const setAllPropertiesOnNode = async (nodeOrId, properties) => {

  if (typeof nodeOrId !== 'number') nodeOrId = nodeOrId.identity.toNumber()
  const props = { id: nodeOrId, properties };

  let query = 'MATCH (n) WHERE ID(n) = $id SET n=$properties RETURN n';
  const session = driver.session();
  const results = await session.run(query, props)
  if (results.records[0]) return results.records[0].get(0);
}

module.exports = {
  createNode,
  deleteNode,
  setPropertyOnNode,
  setAllPropertiesOnNode,
  createConnection,
  deleteConnection,
}
