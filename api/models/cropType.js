const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CropType extends Model {};
  CropType.init({
    section: DataTypes.STRING,
    category: DataTypes.STRING,
    subcategory: DataTypes.STRING,
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CropType',
    scopes: {
      withoutDates: {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    }
  });
  return CropType;
};
