const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Soil extends Model {};
  Soil.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Soil',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Soil;
};
