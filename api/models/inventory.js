const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {};
  Inventory.init({
    item: DataTypes.STRING,
    quantity: DataTypes.DOUBLE,
    metric: DataTypes.STRING,
    price: DataTypes.INTEGER,
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
