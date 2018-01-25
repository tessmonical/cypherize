const nodeMethods = require('./nodes');

const defineModel = (options) => {
  const { name, allowedFields } = options;

  const model = function () {
    this.allowedFields = allowedFields;
    this.name = name;
  };

  model.prototype.create = function (createOptions) {
    return nodeMethods.createNode(this.name, createOptions)
      .then(node => ({
        ...node.properties,
        id: node.identity.toString(),
      }));
  };

  model.prototype.delete = function (nodeOrId) {
    let id = nodeOrId;
    if (nodeOrId.id) id = nodeOrId.id; // if this is a node, use id
    return nodeMethods.deleteNode(id);
  };

  // setOptions example: {property: {name: 'Harry Potter'}}
  model.prototype.setProperty = function (nodeOrId, setOptions) {
    let id = nodeOrId;
    if (nodeOrId.id) id = nodeOrId.id; // if this is a node, use id
    return nodeMethods.setPropertyOnNode(id, setOptions);
  };

  return model;
};

module.exports = {
  defineModel,
};
