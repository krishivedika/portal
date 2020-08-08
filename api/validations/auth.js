const Sequelize = require("sequelize");
const db = require("../models");
const { validator } = require("../middlewares");

const Op = Sequelize.Op;
const User = db.user;

const signup = (req, res, next) => {
  const validationRule = {
    phone: "required|string|min:10",
    aadhar: "required|string|min: 12",
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
    otp: "required|string|min:4",
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
    email: "required|string|min:6|email",
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

const forgot = (req, res, next) => {
  const validationRule = {
    email: "required|string",
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

const reset = (req, res, next) => {
  const validationRule = {
    key: "required|string",
    password: "required|string",
    confirmPassword: "required|string",
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
      if (req.body.phone === '1234567890') {
        return res.send({ message: 'OTP sent' });
      } else {
        next();
      }
    }
  });
};

const checkDuplicateUser = (req, res, next) => {
  User.scope('withoutPassword').findOne({
    where: {
      phone: req.body.phone,
    },
  }).then(user => {
    if (user) {
      return res.status(412).send({
        message: "Phone is already in use"
      });
    } else {
      next();
    }
  });
}

const isOnboarded = (req, res, next) => {
  User.scope('withoutPassword').findOne({
    where: {
      phone: req.body.phone,
    },
  }).then(user => {
    if (!user) {
      return res.status(412).send({
        message: "User Not found"
      });
    } else if (!user.isOnboarded) {
      return res.status(412).send({
        message: "Member onboarding is being processed"
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
  isOnboarded,
  forgot,
  reset,
};
