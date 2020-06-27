const Sequelize = require("sequelize");

const config = require("../config");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
});

const db = {};

// to add types to models
db.Sequelize = Sequelize;

// actual instance to create the models
db.sequelize = sequelize;

db.user = require("../models/user.js")(sequelize, Sequelize);
db.role = require("../models/role.js")(sequelize, Sequelize);
db.permission = require("../models/permission.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId",
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
});
db.permission.belongsToMany(db.role, {
  through: "role_permissions",
  foreignKey: "roleId",
  otherKey: "permissionId"
})

db.ROLES = ["user", "admin"];

module.exports = db;
