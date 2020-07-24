const { Model } = require('sequelize');

const { storage } = require("../utils");
const config = require("../config");

module.exports = (sequelize, DataTypes) => {
  class SurveyFile extends Model {};
  SurveyFile.init({
    path: DataTypes.STRING,
    filename: DataTypes.STRING,
    fileType: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    getterMethods: {
      url() {
        return storage.downloadFileUrl(config.STORAGE_ACCOUNT_SURVEYS, this.path);
      }
    },
    sequelize,
    modelName: 'SurveyFile',
  });
  return SurveyFile;
};
