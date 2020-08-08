const commonValidations = require("../validations/common");
const controller = require("../controllers/crop");
const validation = require("../validations/crop");

module.exports = (app) => {

  app.get("/crops", [commonValidations.verifyToken], controller.cropRecords);

  app.get("/crops/categories", [commonValidations.verifyToken], controller.cropTypes);

  app.post("/crop/add", [commonValidations.verifyToken, validation.addCropRecord], controller.addCropRecord);

  app.post("/crop/update", [commonValidations.verifyToken, validation.updateCropRecord], controller.updateCropRecord);

};
