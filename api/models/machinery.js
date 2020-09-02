const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Machinery extends Model {};
  Machinery.init({
    item: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    details: DataTypes.TEXT,
    date: DataTypes.DATE,
    manufacturer: DataTypes.STRING,
    price: DataTypes.INTEGER,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'Machinery',
  });
  return Machinery;
};
