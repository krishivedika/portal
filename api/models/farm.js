const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Farm extends Model {};
  Farm.init({
    name: DataTypes.STRING,
    state: DataTypes.STRING,
    district: DataTypes.STRING,
    mandala: DataTypes.STRING,
    panchayat: DataTypes.STRING,
    khata: DataTypes.INTEGER,
    isSelf: DataTypes.BOOLEAN,
    relationship: DataTypes.STRING,
    ownerFirstName: DataTypes.STRING,
    ownerLastName: DataTypes.STRING,
    ownerAge: DataTypes.DATE,
    ownerGender: DataTypes.STRING,
    partitions: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Farm',
  });
  return Farm;
};
