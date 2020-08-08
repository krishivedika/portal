const multer = require('multer');

const commonValidations = require("../validations/common");
const controller = require("../controllers/user");
const validation = require("../validations/user");

const files = multer();

module.exports = (app) => {

  app.get("/user", [commonValidations.verifyToken], controller.user);

  app.get("/users", [commonValidations.verifyToken], controller.users);

  app.post("/user/member/onboard", [commonValidations.verifyToken, commonValidations.isAdmin, commonValidations.checkUpdateDuplicateUser], controller.onBoardMember);

  app.post("/user/member/bulk", [files.single('file'), commonValidations.verifyToken, commonValidations.isAdmin], controller.bulkOnboard);

  app.post("/user/member/create", [commonValidations.verifyToken, commonValidations.checkNewUserUpdateDuplicateUser, validation.createProfile], controller.createMember);

  app.post("/user/member/update", [commonValidations.verifyToken, commonValidations.checkUpdateDuplicateUser], controller.updateMember);

};
