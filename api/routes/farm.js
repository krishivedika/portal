const multer = require('multer');

const commonValidations = require("../validations/common");
const controller = require("../controllers/farm");
const validation = require("../validations/farm");

const files = multer();

module.exports = (app) => {

  app.get("/farms", [commonValidations.verifyToken], controller.farmRecords);

  app.get("/farms/surveys/:FarmId", [commonValidations.verifyToken], controller.surveys);

  app.post("/farm/add", [commonValidations.verifyToken, validation.addFarmRecord], controller.addFarmRecord);

  app.post("/farm/update", [commonValidations.verifyToken, validation.updateFarmRecord], controller.updateFarmRecord);

  app.post("/farm/restore", [commonValidations.verifyToken, validation.restoreFarmRecord], controller.restoreFarmRecord);

  app.post("/farm/partition", [commonValidations.verifyToken, validation.partitionFarmRecord], controller.partitionFarmRecord);

  app.delete("/farm/delete/:id", [commonValidations.verifyToken], controller.deleteFarmRecord);

  app.delete("/farm/survey/delete/:id", [commonValidations.verifyToken], controller.deleteSurveyRecord);

  app.post("/farm/survey/add", [commonValidations.verifyToken, validation.addSurvey], controller.addSurveyRecord);

  app.post("/farm/survey/update", [commonValidations.verifyToken, validation.updateSurvey], controller.updateSurveyRecord);

  app.post("/farm/survey/delete", [commonValidations.verifyToken, validation.deleteSurvey], controller.deleteSurveyRecord);

  app.post("/farm/survey/upload/delete", [commonValidations.verifyToken], controller.deleteUpload);

  app.post("/farm/survey/upload", [files.single('file'), commonValidations.verifyToken], controller.fileUpload);
};
