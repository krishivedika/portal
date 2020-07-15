const db = require("../models");
const { validator } = require("../middlewares");

const Farm = db.farm;

const addFarmRecord = (req, res, next) => {
  const validationRule = {
    streetAddress: "required|string|min:10|max:50",
    state: "required|string|min: 6",
    district: "required|string|min: 6",
    mandala: "required|string|min: 6",
    panchayat: "required|string|min: 6",
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

const updateFarmRecord = (req, res, next) => {
  const validationRule = {
    id: "required",
    name: "required|string",
    streetAddress: "required|string|min:10|max:50",
    state: "required|string|min: 6",
    district: "required|string|min: 6",
    mandala: "required|string|min: 6",
    panchayat: "required|string|min: 6",
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

const addSurvey = (req, res, next) => {
  const validationRule = {
    FarmId: "required",
    name: "required|string|min:10|max:50",
    subdivision: "required|string|min: 6",
    extent: "required|string|min: 6",
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

const updateSurvey = (req, res, next) => {
  const validationRule = {
    id: "required",
    FarmId: "required",
    name: "required|string|min:10|max:50",
    subdivision: "required|string|min: 6",
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

module.exports = {
  addFarmRecord,
  addSurvey,
  updateFarmRecord,
  updateSurvey
};
