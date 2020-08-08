const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Crop extends Model {};
  Crop.init({
    name: DataTypes.STRING,
    layerOne: DataTypes.STRING,
    layerTwo: DataTypes.STRING,
    layerThree: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Crop',
  });
  return Crop;
};
