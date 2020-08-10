const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Irrigation extends Model {};
  Irrigation.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Irrigation',
  });
  return Irrigation;
};
