const commonValidations = require("../validations/common");
const controller = require("../controllers/crop");
const validation = require("../validations/crop");

module.exports = (app) => {

  app.get("/crops", [commonValidations.verifyToken], controller.cropRecords);

  app.get("/crops/categories", [commonValidations.verifyToken], controller.cropTypes);

  app.post("/crop/add", [commonValidations.verifyToken, validation.addCropRecord], controller.addCropRecord);

  app.post("/crop/delete", [commonValidations.verifyToken, validation.deleteCropRecord], controller.deleteCropRecord);

  app.get("/crop/layer", [commonValidations.verifyToken], controller.getLayerRecord);

  app.post("/crop/layer/update", [commonValidations.verifyToken], controller.updateLayerRecord);

};
