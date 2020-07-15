const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reset extends Model {};
  Reset.init({
    key: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    sequelize,
    modelName: 'Reset',
  });
  return Reset;
};
