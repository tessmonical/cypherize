// currently we only allow alphanumeric characters and underscores and dash
// anything else is stripped out
const escape = str => str.replace(/[^a-zA-Z0-9_-]+/, '');

module.exports = {
  escape,
};
