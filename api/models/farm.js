const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Farm extends Model {};
  Farm.init({
    name: DataTypes.STRING,
    streetAddress: DataTypes.STRING,
    state: DataTypes.STRING,
    district: DataTypes.STRING,
    mandala: DataTypes.STRING,
    panchayat: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Farm',
  });
  return Farm;
};
