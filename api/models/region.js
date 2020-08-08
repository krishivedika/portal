const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Region extends Model {};
  Region.init({
    state: DataTypes.STRING,
    district: DataTypes.STRING,
    mandal: DataTypes.STRING,
    village: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Region',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Region;
};
