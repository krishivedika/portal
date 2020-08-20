const { validator } = require("../middlewares");

const addWarehouse = (req, res, next) => {
  const validationRule = {
    name: "required|string",
    address: "required|string"
  };
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

const addInventory = (req, res, next) => {
  const validationRule = {
    name: "required|string",
    quantity: "required",
    metric: "required|string",
  };
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

module.exports = {
  addWarehouse,
  addInventory,
};