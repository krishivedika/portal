const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Season extends Model {};
  Season.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Season',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Season;
};
