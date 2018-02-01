// currently we only allow alphanumeric characters and underscores and dash
// anything else is stripped out
const escape = str => str.replace(/[^a-zA-Z0-9_]/g, '');

const buildWhere = (where) => {
  const subquery = 'WHERE ';
  const whereStrings = Object.keys(where).map(key => `n.${escape(key)}=$${escape(key)}`);
  return subquery + whereStrings.join(',');
};

module.exports = {
  escape,
  buildWhere,
};
