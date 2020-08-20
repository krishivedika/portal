const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WarehouseFarm extends Model {};
  WarehouseFarm.init({
    WarehouseId: DataTypes.INTEGER,
    FarmId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'WarehouseFarm',
  });
  return WarehouseFarm;
};
