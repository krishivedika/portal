const db = require("../models");
const { validator } = require("../middlewares");

const validationRule = {
  role: "required|string",
  firstName: "required|string|min: 2",
  lastName: "required|string|min: 1",
  gender: "required|string|min: 2",
  age: "required",
  phone: "required|string|min: 10",
  ration: "required|string",
  address: "required|string",
  state: "required|string",
}

const createProfile = (req, res, next) => {
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      console.log(err);
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

const validationUpdateRule = {
  role: "required|string",
  firstName: "required|string|min: 2",
  lastName: "required|string|min: 2",
  gender: "required|string|min: 2",
  age: "required",
  phone: "required|string|min: 10",
  address: "required|string",
}

const updateProfile = (req, res, next) => {
  validator(req.body, validationUpdateRule, {}, (err, status) => {
    if (!status) {
      console.log(err);
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

module.exports = {
  createProfile,
  updateProfile,
};
