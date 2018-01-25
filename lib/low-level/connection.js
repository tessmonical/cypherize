const driver = require('../index');

const createConnection = async (nodeOrId1, type, nodeOrId2) => {
  let id1;
  let id2;
  // this will be used in string interpolation so having this num be
  // a string is fine-- converting directly to a number could result in
  // overflow since neo4j allows larger numbers than javascipt
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

const deleteConnection = (connectionId) => {
  let id = connectionId;
  if (typeof connectionId !== 'number') id = connectionId.identity.toString();

  const session = driver.session();
  const query = `MATCH [n] WHERE ID[n]=${id} DELETE n;`;
  return session.run(query)
    .then(() => true)
    .catch(console.error.bind(console));
};

module.exports = {
  createConnection,
  deleteConnection,
};
