const { validator } = require("../middlewares");

const validationRule = {
  farm: "required",
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

const deleteCropRecord = (req, res, next) => {
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

const restoreCropRecord = (req, res, next) => {
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

module.exports = {
  addCropRecord,
  deleteCropRecord,
  restoreCropRecord,
};
