const commonValidations = require("../validations/common");
const controller = require("../controllers/user");

module.exports = (app) => {

  app.get("/user", [commonValidations.verifyToken], controller.user); 

  app.get("/users", [commonValidations.verifyToken], controller.users);

  app.post("/user/member/onboard", [commonValidations.verifyToken, commonValidations.isAdmin, commonValidations.checkUpdateDuplicateUser], controller.onBoardMember);

  app.post("/user/member/update", [commonValidations.verifyToken, commonValidations.checkUpdateDuplicateUser], controller.updateMember);

};
