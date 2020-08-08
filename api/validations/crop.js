const { validator } = require("../middlewares");

const validationRule = {
  farmId: "required",
  crops: "required",
}

const addCropRecord = (req, res, next) => {
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

const updateCropRecord = (req, res, next) => {
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

module.exports = {
  addCropRecord,
  updateCropRecord,
};
