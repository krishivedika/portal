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
db.survey = require("../models/survey")(sequelize, Sequelize);
db.surveyFile = require("../models/surveyFile")(sequelize, Sequelize);
db.reset = require("../models/reset")(sequelize, Sequelize);

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

db.user.hasMany(db.farm, {
  foreignKey: "userId"
});

db.farm.belongsTo(db.user, {
  foreignKey: "userId"
});

db.farm.hasMany(db.survey);
db.survey.hasMany(db.surveyFile);

db.ROLES = ["farmer", "admin", "csr", "sadmin", "field_agent"];

module.exports = db;
