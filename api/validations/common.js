const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

const config = require("../config");
const db = require("../models");

const Op = Sequelize.Op;
const User = db.user;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({
      message: "No token provided",
    });
  }

  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
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
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "sadmin") {
          next();
          return;
        }
      }

      return res.status(403).send({
        message: "Require Admin Role",
      });
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

module.exports = {
  verifyToken,
  isAdmin,
  checkUpdateDuplicateUser,
};
