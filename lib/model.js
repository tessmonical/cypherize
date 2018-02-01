const nodeMethods = require('./low-level/nodes');

const defineModel = (modelOptions) => {
  const Model = function () {
    const { name, fields } = modelOptions;
    this._fields = fields;
    this._name = name.toUpperCase();
  };

  // match is similar to sequelize "where"
  // ex: {match: {name: 'Harry Potter', gender: 'm', .......}}
  Model.prototype.findAll = function (options) {
    // filter out any options that are not explicitly allowed
    const matchObject = Object.keys(options.match).filter((option) => {
      if (!this._fields.includes(option)) {
        throw new Error(`Unknown field in match: ${option}`);
      } else return true;
    });

    const newOptions = { ...options, match: matchObject };

    // convert the weird Node object to an object
    return nodeMethods.findNodes({
      ...newOptions,
      label: this._name,
    });
  };

  Model.prototype.findOne = function (options) {
    return this.findAll({ ...options, limit: 1 });
  };

  Model.prototype.create = function (fields) {

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

  Model.prototype.delete = function (nodeOrId) {
    const id = nodeOrId.id || nodeOrId;
    return nodeMethods.deleteNode(id);
  };

  // setOptions example: {property: {name: 'Harry Potter'}}
  Model.prototype.setProperty = function (nodeOrId, setOptions) {
    const id = nodeOrId.id || nodeOrId;
    return nodeMethods.setPropertyOnNode(id, setOptions)
      .then(node => ({
        ...node.properties,
        id: node.identity.toString(),
      }));
  };

  return Model;
};

module.exports = {
  defineModel,
};
