const nodeMethods = require('./low-level/nodes');

const defineModel = function (modelOptions) {
  const Model = function () {};
  const { name, fields } = modelOptions;
  Model._fields = [...fields];
  Model._name = name.toUpperCase();

  // where is similar to sequelize "where"
  // ex: {where: {name: 'Harry Potter', gender: 'm', .......}}
  Model.prototype.findAll = function (options) {
    // filter out any options that are not explicitly allowed
    const whereObject = Object.keys(options.where).filter((option) => {
      if (!this._fields.includes(option)) {
        throw new Error(`Unknown field in where: ${option}`);
      } else return true;
    });

    const newOptions = { ...options, match: whereObject };

    // convert the weird Node object to an object
    return nodeMethods.findNodes({
      ...newOptions,
      label: this._name,
    });
  };

  Model.prototype.findOne = function (options) {
    return this.findAll({ ...options, limit: 1 });
  };

  Model.prototype.create = function (fieldsForNode) {

    // filter out any fields that are not explicitly allowed
    const cleanFields = Object.keys(fieldsForNode).filter((field) => {
      if (!this._fields.includes(field)) {
        throw new Error(`Unknown field ${field}`);
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
