const commonValidations = require("../validations/common");
const controller = require("../controllers/crop");
const validation = require("../validations/crop");

module.exports = (app) => {

  app.get("/crops", [commonValidations.verifyToken], controller.cropRecords);

  app.get("/crops/categories", [commonValidations.verifyToken], controller.cropTypes);

  app.post("/crop/add", [commonValidations.verifyToken, validation.addCropRecord], controller.addCropRecord);

  app.post("/crop/restore", [commonValidations.verifyToken, validation.restoreCropRecord], controller.restoreCropRecord);

  app.post("/crop/delete", [commonValidations.verifyToken, validation.deleteCropRecord], controller.deleteCropRecord);

  app.get("/crop/layer", [commonValidations.verifyToken], controller.getLayerRecord);

  app.get("/crop/activities", [commonValidations.verifyToken], controller.getActivities);

  app.post("/crop/activity/create", [commonValidations.verifyToken], controller.createActivity);

  app.post("/crop/activity/delete", [commonValidations.verifyToken], controller.deleteActivity);

  app.post("/crop/activity/changeOrder", [commonValidations.verifyToken], controller.changeOrder);

  app.get("/crop/layer/activity", [commonValidations.verifyToken], controller.getLayerActivity);

  app.post("/crop/layer/edit", [commonValidations.verifyToken], controller.editLayerRecord);

  app.post("/crop/layer/update", [commonValidations.verifyToken], controller.updateLayerRecord);

  app.post("/crop/layer/delete", [commonValidations.verifyToken], controller.deleteLayerRecord);

  app.post("/crop/layer/abandon", [commonValidations.verifyToken], controller.abandonLayerRecord);

};
