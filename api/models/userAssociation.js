const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserAssociation extends Model {};
  UserAssociation.init({
    userId: DataTypes.INTEGER,
    csrId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserAssociation',
  });
  return UserAssociation;
};
