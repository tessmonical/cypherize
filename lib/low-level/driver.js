const neo4j = require('neo4j-driver').v1;

const driver = (uri, user, password) => neo4j.driver(
  uri,
  neo4j.auth.basic(user, password),
);

module.exports = driver;
