const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {};
  Survey.init({
    name: DataTypes.STRING,
    subdivision: DataTypes.STRING,
    extent: DataTypes.STRING,
    link: DataTypes.STRING,
    comment: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Survey',
  });
  return Survey;
};
