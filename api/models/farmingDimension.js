const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Farming extends Model {};
  Farming.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Farming',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Farming;
};
