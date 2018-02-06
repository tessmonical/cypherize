# Cypherize

## Goal
Cypherize is an OGM which connects a Cypher-based database (Neo4j) to a JS application. Cypherize is intended to be familiar to those who have used Sequelize.

## Functionality

- [✓] TESTED (works to the best of my knowledge)
- [ ] UNTESTED (may or may not work)
- [x] UNTESTED (don't use)

### Low level
- [✓] We can connect to the database and use the methods in connection.js and nodes.js to...

- [✓] add node
- [✓] find nodes
- [✓] update nodes
- [✓] delete node
- [✓] add connection
- [✓] find connections
- [✓] update connections
- [✓] delete connection


### Higher level
- [✓] We can define models which have a name and fields
- These models have methods...
  - [✓] Model.create(options)
  - [✓] Model.findAll(options)
  - [ ] Model.findOne(options)
  - [ ] Model.delete(options)
  - [x] Model.setProperty(options)

## Caveats and warnings
- Key names for properties on a node/connection set using Cypherize must adhere to the following rules
  - Alphanumeric and underscore are the only characters allowed (Any other characters will be stripped)
