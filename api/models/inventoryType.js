const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryType extends Model {};
  InventoryType.init({
    item: DataTypes.STRING,
    price: DataTypes.INTEGER,
    metric: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'InventoryType',
  });
  return InventoryType;
};
