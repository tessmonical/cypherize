const nodeMethods = require('./low-level/nodes');

const defineModel = function (modelOptions) {
  const Model = function () { };
  const { name, fields } = modelOptions;
  Model._fields = [...fields];
  Model._name = name.toUpperCase();

  // where is similar to sequelize "where"
  // ex: {where: {name: 'Harry Potter', gender: 'm', .......}}
  Model.findAll = function (options) {
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

  Model.findOne = function (options) {
    return this.findAll({ ...options, limit: 1 });
  };

  Model.create = function (fieldsForNode) {
    // filter out any fields that are not explicitly allowed
    Object.keys(fieldsForNode).forEach((field) => {
      if (!this._fields.includes(field)) {
        throw new Error(`Unknown field ${field}`);
      }
    });

    return nodeMethods.createNode(this.name, { properties: fieldsForNode })
      .then(node => ({
        ...node.properties,
      }));
  };

  Model.delete = function (nodeOrId) {
    const id = nodeOrId.id || nodeOrId;
    return nodeMethods.deleteNode(id);
  };

  // setOptions example: {property: {name: 'Harry Potter'}}
  Model.prototype.setProperty = function (setOptions) {
    const id = this._id;
    return nodeMethods.setPropertyOnNode(id, setOptions)
      .then(node => ({
        ...node.properties,
      }));
  };

  return Model;
};

module.exports = {
  defineModel,
};
