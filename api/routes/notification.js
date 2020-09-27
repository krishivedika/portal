const commonValidations = require("../validations/common");
const controller = require("../controllers/notification");

module.exports = (app) => {

  app.get("/notifications", [commonValidations.verifyToken], controller.getNotifications);

  app.post("/notification/update", [commonValidations.verifyToken], controller.updateNotification);

};
