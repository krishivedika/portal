const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {};
  Activity.init({
    name: DataTypes.STRING,
    woman_price: DataTypes.INTEGER,
    man_price: DataTypes.INTEGER,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};
