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

const deleteWarehouse = (req, res, next) => {
  const validationRule = {
    id: "required"
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
    item: "required|string",
    quantity: "required",
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

const editInventory = (req, res, next) => {
  const validationRule = {
    id: "required",
    item: "required|string",
    quantity: "required",
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

const addMachinery = (req, res, next) => {
  const validationRule = {
    item: "required|string",
    quantity: "required",
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

const editMachinery = (req, res, next) => {
  const validationRule = {
    id: "required",
    item: "required|string",
    quantity: "required",
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
  deleteWarehouse,
  editInventory,
  addInventory,
  addMachinery,
  editMachinery,
};
