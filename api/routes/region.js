const commonValidations = require("../validations/common");
const controller = require("../controllers/region");

module.exports = (app) => {

  app.get("/regions", [commonValidations.verifyToken], controller.getRegions);

};
