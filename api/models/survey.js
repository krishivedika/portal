const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {};
  Survey.init({
    number: DataTypes.INTEGER,
    subdivision: DataTypes.INTEGER,
    landType: DataTypes.STRING,
    extent: DataTypes.DOUBLE,
    comment: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Survey',
  });
  return Survey;
};
