const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cultivation extends Model {};
  Cultivation.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Cultivation',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Cultivation;
};
