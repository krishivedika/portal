const Sequelize = require("sequelize");
const db = require("../models");
const { validator } = require("../middlewares");

const Op = Sequelize.Op;
const User = db.user;

const signup = (req, res, next) => {
  const validationRule = {
    phone: "required|string|min:10",
    aadhar: "required|string|min: 16",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  });
};

const signin = (req, res, next) => {
  const validationRule = {
    phone: "required|string|min:10",
    otp: "required|string|min:6",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  });
};

const staffSignin = (req, res, next) => {
  const validationRule = {
    email: "required|string|min:6",
    password: "required|string|min:6",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  });
};

const newOtp = (req, res, next) => {
  const validationRule = {
    phone: "required|string|min:10",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      return res.status(412).send({
        success: false,
        message: "Validation failed",
        data: err,
      });
    } else {
      next();
    }
  });
};

const checkDuplicateUser = (req, res, next) => {
  User.scope('withoutPassword').findOne({
    where: {
      [Op.or]: [
        { email: req.query.email || ''},
        { phone: req.query.phone || ''},
      ]
    },
  }).then(user => {
    if (user) {
      return res.status(400).send({
        message: "Failed! Phone / Email is already in use!"
      });
    } else {
      next();
    }
  });
}

module.exports = {
  signup,
  signin,
  staffSignin,
  newOtp,
  checkDuplicateUser,
};
