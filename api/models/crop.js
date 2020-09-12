const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Crop extends Model {};
  Crop.init({
    name: DataTypes.STRING,
    size: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'Crop',
  });
  return Crop;
};
