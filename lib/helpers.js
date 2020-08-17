const renameClass = ({name, baseClass}) => ({[name] : class extends baseClass {}})[name];

module.exports = {
    renameClass,
  };