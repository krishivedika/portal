const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {};
  Brand.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Brand',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return Brand;
};
