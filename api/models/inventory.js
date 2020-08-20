const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {};
  Inventory.init({
    item: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    metric: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'Inventory',
  });
  return Inventory;
};
