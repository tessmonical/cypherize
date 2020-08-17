const { driver } = require('../../lib');

afterAll(done) {
    await driver.close()

    done();
  }
};