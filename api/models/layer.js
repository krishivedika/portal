const constants = require("../constants");

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layer extends Model {};
  Layer.init({
    name: DataTypes.STRING,
    seed: DataTypes.STRING,
    crop: DataTypes.STRING,
    brand: DataTypes.STRING,
    irrigation: DataTypes.STRING,
    soil: DataTypes.STRING,
    season: DataTypes.STRING,
    farming: DataTypes.STRING,
    cultivation: DataTypes.STRING,
    geography: DataTypes.STRING,
    date: DataTypes.DATE,
    config: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    machineryPrice: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    initialVersion: DataTypes.INTEGER,
    currentVersion: DataTypes.INTEGER,
    currentOrder: DataTypes.INTEGER,
    labourCost:  {
      type: DataTypes.INTEGER,
      defaultValue: () => constants.LABOUR_COST,
    },
    isStarted: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => false,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => false,
    },
    isAbandoned: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: () => true,
    },
  }, {
    sequelize,
    modelName: 'Layer',
  });
  return Layer;
};
