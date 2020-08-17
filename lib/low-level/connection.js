const uuidv4 = require('uuid/v4');
const { driver } = require('../index');
const { escape } = require('./utils');

const createConnection = async (nodeOrId1, type, nodeOrId2) => {
  let id1 = nodeOrId1;
  let id2 = nodeOrId2;

  const _id = escape(uuidv4());

  // if the nodeOrId isn't a string, it's the actual node
  if (typeof nodeOrId1 !== 'string') id1 = nodeOrId1.properties._id;
  if (typeof nodeOrId2 !== 'string') id2 = nodeOrId2.properties._id;

  const session = driver.session();
  const resultsPromise = session.run(
    `
    MATCH (node1) WHERE node1._id=$id1
    MATCH (node2) WHERE node2._id=$id2
    CREATE
    (node1)-[newConnection:${escape(type)} {_id:$_id}]->(node2)
    RETURN newConnection;
    `,
    { id1, id2, _id },
  ).then();
  resultsPromise.finally(() => session.close());

  const results = await resultsPromise;
  // uses built-in getter to get the record in a nicer format
  return results.records[0].get(0);
};

const deleteConnection = (connectionOrId) => {
  let _id = connectionOrId;
  if (typeof connectionOrId !== 'string') _id = connectionOrId.properties._id;

  const session = driver.session();
  const query = 'MATCH (n1)-[c]->(n2) WHERE c._id=$_id DELETE c;';
  return session.run(query, { _id })
  .catch(console.error)
  .finally(() => session.close())
};


const findById = async (id) => {
  const query = 'MATCH (n1)-[c]->(n2) WHERE c._id=$_id RETURN c;';
  const session = driver.session();
  const resultsPromise = session.run(query, { _id: id });
  resultsPromise
    .catch(console.error)
    .finally(() => session.close());
  const results = await resultsPromise;
  if (results.records.length) return results.records[0].get(0);
  return null;
};

module.exports = {
  createConnection,
  deleteConnection,
  findById,
};
