const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MachineryType extends Model {};
  MachineryType.init({
    item: DataTypes.STRING,
    price: DataTypes.INTEGER,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'MachineryType',
  });
  return MachineryType;
};
