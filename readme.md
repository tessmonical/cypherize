# Cypherize

## Goal
Cypherize is an OGM which connects a Cypher-based database (Neo4j) to a JS application. Cypherize is intended to be familiar to those who have used Sequelize.

## Functionality

- [x] TESTED (works to the best of my knowledge)
- [ ] UNTESTED (may or may not work)
- [-] UNTESTED (don't use!)

### Low level
- [x] We can connect to the database and use the methods in connection.js and nodes.js to...
  - [x] add node
  - [x] find nodes
  - [x] update nodes
  - [x] delete node
  - [x] add connection
  - [x] find connections
  - [x] update connections
  - [x] delete connection


### Higher level
- [x] We can define models which have a name and fields
- These models have methods...
  - [x] Model.create(options)
  - [x] Model.findAll(options)
  - [ ] Model.findOne(options)
  - [ ] Model.delete(options)
  - [x] Model.setProperty(options)

## Caveats and warnings
- Key names for properties on a node/connection set using Cypherize must adhere to the following rules
  - Alphanumeric and underscore are the only characters allowed (Any other characters will be stripped)
