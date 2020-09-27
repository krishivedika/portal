const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

const config = require("../config");
const db = require("../models");

const Op = Sequelize.Op;
const User = db.user;

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({
      message: "No token provided",
    });
  }

  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.userRoleId = decoded.roleId;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.scope('withoutPassword').findByPk(req.userId).then((user) => {
    if (!user) {
      return res.status(403).send({
        message: "Admin not found",
      });
    }

    user.getRoles().then((roles) => {
      if (roles[0].name !== "farmer") {
        next();
      }
      else {
        return res.status(403).send({
          message: "Require Staff Role",
        });
      }
    });
  });
};

const checkUpdateDuplicateUser = (req, res, next) => {
  User.scope('withoutPassword').findOne({
    where: {
      id: {[Op.not]: req.body.id},
      [Op.or]: [
        { email: req.body.email || ''},
        { phone: req.body.phone || ''},
      ]
    },
  }).then(user => {
    if (user) {
      return res.status(412).send({
        message: "Phone / Email is already in use"
      });
    } else {
      next();
    }
  });
}

const checkNewUserUpdateDuplicateUser = (req, res, next) => {
  User.scope('withoutPassword').findOne({
    where: {
      [Op.or]: [
        { email: req.body.email || ''},
        { phone: req.body.phone || ''},
      ]
    },
  }).then(user => {
    if (user) {
      return res.status(412).send({
        message: "Phone / Email is already in use"
      });
    } else {
      next();
    }
  });
}

module.exports = {
  verifyToken,
  isAdmin,
  checkUpdateDuplicateUser,
  checkNewUserUpdateDuplicateUser,
};
