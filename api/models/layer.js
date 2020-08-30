const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layer extends Model {};
  Layer.init({
    name: DataTypes.STRING,
    seed: DataTypes.STRING,
    crop: DataTypes.STRING,
    brand: DataTypes.STRING,
    irrigation: DataTypes.STRING,
    date: DataTypes.DATE,
    config: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'Layer',
  });
  return Layer;
};
