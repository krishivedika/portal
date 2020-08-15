const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Practice extends Model {};
  Practice.init({
    brand: DataTypes.STRING,
    seed: DataTypes.STRING,
    irrigation: DataTypes.STRING,
    config: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Practice',
  });
  return Practice;
};
