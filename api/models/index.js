'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

const config = require("../config");
const dbConfig = require(__dirname + '/../config/db.js')[config.NODE_ENV];
const db = {};

// let sequelize;
// if (dbConfig.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, dbConfig);
// }
// sequelize = new Sequelize(config.database, config.username, config.password, dbConfig);

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
  dialectOptions: {
    options: {
      encrypt: true,
    }
  }
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("../models/user.js")(sequelize, Sequelize);
db.role = require("../models/role.js")(sequelize, Sequelize);
db.farm = require("../models/farm.js")(sequelize, Sequelize);
db.survey = require("../models/survey.js")(sequelize, Sequelize);
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

db.ROLES = ["farmer", "admin", "csr", "sadmin", "field_agent"];

module.exports = db;
