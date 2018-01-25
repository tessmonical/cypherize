const neo4j = require('neo4j-driver').v1;

const uri = process.env.databaseURI;
const user = process.env.databaseUser;
const password = process.env.databasePassword;
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

module.exports = driver;
