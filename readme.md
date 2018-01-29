# Cypherize

## Goal
To create a package which can be used similarly to Sequelize on the backend, but which connects a Cypher-based database (Neo4j) to the application instead of a SQL-based one like PostgreSQL.

## Usage
Don't use this yet, it's not ready!
Very very much in development still. Tests are being written, bugs are being found, etc. I'll update this readme when the basics are here.

## Caveats and warnings
- Currently, we DO NOT escape key names when setting a property on a node. If you must use user-supplied key names, be sure to escape them yourself to avoid injection attacks
