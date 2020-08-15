const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Seed extends Model {};
  Seed.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Seed',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Seed;
};
