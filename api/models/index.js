const Sequelize = require('sequelize');

const config = require("../config");
const db = {};

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
  dialectOptions: {
    options: {
      encrypt: true,
    }
  }
});

db.sequelize = sequelize;

db.user = require("../models/user")(sequelize, Sequelize);
db.role = require("../models/role")(sequelize, Sequelize);
db.farm = require("../models/farm")(sequelize, Sequelize);
db.crop = require("../models/crop")(sequelize, Sequelize);
db.layer = require("../models/layer")(sequelize, Sequelize);
db.survey = require("../models/survey")(sequelize, Sequelize);
db.surveyFile = require("../models/surveyFile")(sequelize, Sequelize);
db.reset = require("../models/reset")(sequelize, Sequelize);
db.region = require("../models/region")(sequelize, Sequelize);
db.cropType = require("../models/cropType")(sequelize, Sequelize);
db.seed = require("../models/seed")(sequelize, Sequelize);
db.irrigation = require("../models/irrigationDimension")(sequelize, Sequelize);
db.cultivation = require("../models/cultivationDimension")(sequelize, Sequelize);
db.soil = require("../models/soilDimension")(sequelize, Sequelize);
db.farming = require("../models/farmingDimension")(sequelize, Sequelize);
db.season = require("../models/seasonDimension")(sequelize, Sequelize);
db.brand = require("../models/brand")(sequelize, Sequelize);
db.userRole = require("../models/userRole")(sequelize, Sequelize);
db.userAssociation = require("../models/userAssociation")(sequelize, Sequelize);
db.warehouse = require("../models/warehouse")(sequelize, Sequelize);
db.warehouseFarm = require("../models/warehouseFarm")(sequelize, Sequelize);
db.inventory = require("../models/inventory")(sequelize, Sequelize);
db.inventoryType = require("../models/inventoryType")(sequelize, Sequelize);
db.machinery = require("../models/machinery")(sequelize, Sequelize);
db.machineryType = require("../models/machineryType")(sequelize, Sequelize);
db.activity = require("../models/activity")(sequelize, Sequelize);
db.activityMaster = require("../models/activityMaster")(sequelize, Sequelize);
db.notification = require("../models/notification")(sequelize, Sequelize);

// Associations
db.role.belongsToMany(db.user, {
  through: "UserRoles",
  foreignKey: "roleId",
  otherKey: "userId",
});

db.user.belongsToMany(db.role, {
  through: "UserRoles",
  foreignKey: "userId",
  otherKey: "roleId",
});

db.user.belongsToMany(db.user, {
  as: 'managedBy',
  through: "UserAssociations",
  foreignKey: "userId",
  otherKey: "csrId",
});

db.user.hasMany(db.farm, {
  foreignKey: "userId"
});

db.farm.belongsTo(db.user, {
  foreignKey: "userId"
});

db.farm.hasMany(db.survey);
db.survey.belongsTo(db.farm);
db.survey.hasMany(db.surveyFile);
db.crop.belongsTo(db.farm);
db.crop.hasMany(db.layer);
db.layer.belongsTo(db.crop);
db.warehouse.belongsTo(db.user);
db.warehouse.hasMany(db.inventory);
db.warehouse.hasMany(db.machinery);
db.warehouse.belongsToMany(db.farm, {through: 'WarehouseFarms'});
db.farm.belongsToMany(db.warehouse, {through: 'WarehouseFarms'});

db.user.hasMany(db.notification);
db.notification.belongsTo(db.user);

db.ROLES = ["farmer", "admin", "csr", "sadmin", "field_agent", "sme"];

module.exports = db;
