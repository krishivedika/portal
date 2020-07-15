const commonValidations = require("../validations/common");
const controller = require("../controllers/user");
const validation = require("../validations/user");

module.exports = (app) => {

  app.get("/user", [commonValidations.verifyToken], controller.user);

  app.get("/users", [commonValidations.verifyToken], controller.users);

  app.get("/farms", [commonValidations.verifyToken], controller.farmRecords);

  app.get("/farms/surveys/:FarmId", [commonValidations.verifyToken], controller.surveys);

  app.post("/user/member/onboard", [commonValidations.verifyToken, commonValidations.isAdmin, commonValidations.checkUpdateDuplicateUser], controller.onBoardMember);

  app.post("/user/member/update", [commonValidations.verifyToken, commonValidations.checkUpdateDuplicateUser], controller.updateMember);

  app.post("/farm/add", [commonValidations.verifyToken, validation.addFarmRecord], controller.addFarmRecord);

  app.post("farm/update", [commonValidations.verifyToken, validation.updateFarmRecord], controller.updateFarmRecord);

  app.delete("farm/delete/:id", [commonValidations.verifyToken, validation.updateFarmRecord], controller.updateFarmRecord);

  app.post("farm/survey/add", [commonValidations.verifyToken, validation.addSurvey], controller.addSurveyRecord);

  app.post("farm/survey/update", [commonValidations.verifyToken, validation.updateSurvey], controller.updateSurveyRecord);

  app.delete("farm/survey/delete/:id", [commonValidations.verifyToken, validation.updateFarmRecord], controller.updateFarmRecord);

};
