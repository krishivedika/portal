const { validator } = require("../middlewares");

const validationRule = {
  name: "required|string",
  state: "required|string|min: 2",
  district: "required|string|min: 2",
  mandala: "required|string|min: 2",
  panchayat: "required|string|min: 2",
  khata: "required",
  isSelf: "required",
  ownerFirstName: "required|string|min: 2",
  ownerLastName: "required|string|min: 1",
  ownerAge: "required",
  ownerGender: "required",
}

const addFarmRecord = (req, res, next) => {
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

const updateFarmRecord = (req, res, next) => {
  const validationRuleUpdate = {
    id: "required",
    ...validationRule,
  };
  validator(req.body, validationRuleUpdate, {}, (err, status) => {
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

const restoreFarmRecord = (req, res, next) => {
  const validationRuleUpdate = {
    id: "required",
  };
  validator(req.body, validationRuleUpdate, {}, (err, status) => {
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

const partitionFarmRecord = (req, res, next) => {
  const validationRuleUpdate = {
    id: "required",
    partitions: "required",
  };
  validator(req.body, validationRuleUpdate, {}, (err, status) => {
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

const validationRuleSurvey = {
  FarmId: "required",
  number: "required",
  subdivision: "required",
  extent: "required",
  landType: "required|string|min:2",
};

const addSurvey = (req, res, next) => {
  validator(req.body, validationRuleSurvey, {}, (err, status) => {
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

const updateSurvey = (req, res, next) => {
  const validationRuleSurveyUpdate = {
    id: "required",
    ...validationRuleSurvey
  };
  validator(req.body, validationRuleSurveyUpdate, {}, (err, status) => {
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
  updateSurvey,
  partitionFarmRecord,
  restoreFarmRecord,
};
