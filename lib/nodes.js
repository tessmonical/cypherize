const driver = require('./driver.js');

const createNode = async (type, options = {}) => {
  const session = driver.session();
  let query = `CREATE (newNode:${type}) RETURN newNode`;
  if (options.properties) {
    query = `CREATE (newNode:${type}) SET newNode=$properties RETURN newNode`;
  }

  const results = await session.run(
    query,
    { type, properties: options.properties },
  );
  // uses built-in getter to get the record in a nicer format
  return results.records[0].get(0);
};

const deleteNode = async (nodeOrId, options) => {
  let id;
  if (typeof nodeOrId === 'number') id = nodeOrId;
  // safer than toNumber since Neo4j numbers can be larger than JS numbers
  else id = nodeOrId.identity.toString();

  let force;
  if (!options) force = false;
  else force = options.force;

  const session = driver.session();

  let query = `MATCH (n) WHERE ID(n)=${id} DELETE n;`;
  if (force) { // add DETACH (deletes all connections if node is connected)
    query = `MATCH (n) WHERE ID(n)=${id} DETACH DELETE n;`;
  }

  await session.run(query)
    .then(() => true)
    .catch(console.error.bind(console));
};


// options: {property: {name: 'Harry Potter'}}
const setPropertyOnNode = async (nodeOrId, options) => {
  let id;
  if (typeof nodeOrId !== 'number') id = nodeOrId.identity.toNumber();
  else id = nodeOrId;
  const params = { id };

  if (!options.property) throw new Error('You must specify a property to set');
  const [key, value] = Object.entries(options.property);
  params.propValue = value;

  const query = `MATCH (n) WHERE ID(n)=$id set n.${key} = n.$propValue RETURN n;`;
  const session = driver.session();

  return session.run(query, params)
    .then(() => true)
    .catch(console.error.bind(console));
};

// properties: {name: 'Harry Potter', gender: 'm', etc}
const setAllPropertiesOnNode = async (nodeOrId, properties) => {
  let id;
  if (typeof nodeOrId !== 'number') id = nodeOrId.identity.toNumber();
  else id = nodeOrId;
  const props = { id, properties };

  const query = 'MATCH (n) WHERE ID(n) = $id SET n=$properties RETURN n';
  const session = driver.session();
  const results = await session.run(query, props);
  if (results.records[0]) return results.records[0].get(0);
  return [];
};

module.exports = {
  createNode,
  deleteNode,
  setPropertyOnNode,
  setAllPropertiesOnNode,
};
