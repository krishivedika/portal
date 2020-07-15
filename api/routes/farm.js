const commonValidations = require("../validations/common");
const controller = require("../controllers/farm");
const validation = require("../validations/farm");

module.exports = (app) => {

  app.get("/farms", [commonValidations.verifyToken], controller.farmRecords);

  app.get("/farms/surveys/:FarmId", [commonValidations.verifyToken], controller.surveys);

  app.post("/farm/add", [commonValidations.verifyToken, validation.addFarmRecord], controller.addFarmRecord);

  app.post("/farm/update", [commonValidations.verifyToken, validation.updateFarmRecord], controller.updateFarmRecord);

  app.delete("/farm/delete/:id", [commonValidations.verifyToken], controller.deleteFarmRecord);

  app.delete("/farm/survey/delete/:id", [commonValidations.verifyToken], controller.deleteSurveyRecord);

  app.post("/farm/survey/add", [commonValidations.verifyToken, validation.addSurvey], controller.addSurveyRecord);

  app.post("/farm/survey/update", [commonValidations.verifyToken, validation.updateSurvey], controller.updateSurveyRecord);


};
