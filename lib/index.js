const driver = require('./low-level/driver.js')(
  process.env.databaseURI,
  process.env.databaseUser,
  process.env.databasePassword,
);

module.exports = {
  driver,
};
