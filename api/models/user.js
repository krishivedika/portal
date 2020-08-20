const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {};
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    prefix: DataTypes.STRING,
    phone: DataTypes.STRING,
    ration: DataTypes.STRING,
    gender: DataTypes.STRING,
    age: DataTypes.DATE,
    district: DataTypes.STRING,
    mandala: DataTypes.STRING,
    panchayat: DataTypes.STRING,
    hamlet: DataTypes.STRING,
    address: DataTypes.TEXT,
    isActive: DataTypes.BOOLEAN,
    isOnboarded: DataTypes.BOOLEAN,
    updatedBy: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password'] },
      }
    }
  }
);
  return User;
};
