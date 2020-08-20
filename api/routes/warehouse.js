const commonValidations = require("../validations/common");
const controller = require("../controllers/warehouse");
const validation = require("../validations/warehouse");

module.exports = (app) => {

  app.get("/warehouses", [commonValidations.verifyToken], controller.warehouses);

  app.post("/warehouse/add", [commonValidations.verifyToken, validation.addWarehouse], controller.addWarehouse);

  app.post("/warehouse/inventory/add", [commonValidations.verifyToken, validation.addInventory], controller.addInventory);

};
