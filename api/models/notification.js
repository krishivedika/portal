const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {};
  Notification.init({
    type: DataTypes.INTEGER,
    subtype: DataTypes.INTEGER,
    text: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    entityId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};

// Type 1: Activity for farmer notification
// Type 10: No activity for crop SME notification
