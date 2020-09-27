const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityMaster extends Model {};
  ActivityMaster.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    order: DataTypes.INTEGER,
    dimension: DataTypes.STRING,
    dimensionType: DataTypes.STRING,
    crop: DataTypes.STRING,
    day: DataTypes.INTEGER,
    mlm: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'ActivityMaster',
  });
  return ActivityMaster;
};
