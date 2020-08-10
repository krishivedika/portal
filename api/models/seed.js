const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Seed extends Model {};
  Seed.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Seed',
  });
  return Seed;
};
