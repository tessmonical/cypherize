const nodeMethods = require('./nodes');

const defineModel = (modelOptions) => {
  const model = function () {
    const { name, fields } = modelOptions;
    this._fields = fields;
    this._name = name;
  };

  // match is similar to sequelize "where"
  // {match: {name: 'Harry Potter', gender: 'm', .......}}
  model.prototype.findOne = function (options) {
    // filter out any options that are not explicitly allowed
    const matchObject = Object.keys(options.match).filter((option) => {
      if (!this._fields.includes(option)) {
        throw new Error(`Unknown field in match: ${option}`);
      } else return true;
    });
    // convert the weird Node object to an object
    return nodeMethods.findNodes({
      ...matchObject,
      label: this._name,
      limit: 1,
    });
  };

  model.prototype.create = function (fields) {

    // filter out any fields that are not explicitly allowed
    const cleanFields = Object.keys(fields).filter((field) => {
      if (!this._fields.includes(field)) {
        throw new Error(`Unknown field: ${field}`);
      } else return true;
    });

    return nodeMethods.createNode(this.name, cleanFields)
      .then(node => ({
        ...node.properties,
        id: node.identity.toString(),
      }));
  };

  model.prototype.delete = function (nodeOrId) {
    const id = nodeOrId.id || nodeOrId;
    return nodeMethods.deleteNode(id);
  };

  // setOptions example: {property: {name: 'Harry Potter'}}
  model.prototype.setProperty = function (nodeOrId, setOptions) {
    const id = nodeOrId.id || nodeOrId;
    return nodeMethods.setPropertyOnNode(id, setOptions)
      .then(node => ({
        ...node.properties,
        id: node.identity.toString(),
      }));
  };

  return model;
};

module.exports = {
  defineModel,
};
