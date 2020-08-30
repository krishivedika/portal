const commonValidations = require("../validations/common");
const controller = require("../controllers/warehouse");
const validation = require("../validations/warehouse");

module.exports = (app) => {

  app.get("/warehouses", [commonValidations.verifyToken], controller.warehouses);

  app.post("/warehouse/add", [commonValidations.verifyToken, validation.addWarehouse], controller.addWarehouse);

  app.post("/warehouse/delete", [commonValidations.verifyToken, validation.deleteWarehouse], controller.deleteWarehouse);

  app.post("/warehouse/inventory/add", [commonValidations.verifyToken, validation.addInventory], controller.addInventory);

  app.post("/warehouse/inventory/update", [commonValidations.verifyToken, validation.editInventory], controller.editInventory);

  app.post("/warehouse/machinery/add", [commonValidations.verifyToken, validation.addMachinery], controller.addMachinery);

  app.post("/warehouse/machinery/update", [commonValidations.verifyToken, validation.editMachinery], controller.editMachinery);

};
