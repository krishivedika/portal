const controller = require("../controllers/auth");
const validation = require("../validations/auth");

module.exports = (app) => {

  app.post("/otp", [validation.newOtp], controller.newOtp);

  app.post(
    "/signup",
    [validation.checkDuplicateUser, validation.signup],
    controller.signup
  );

  app.post("/signin/staff", [validation.staffSignin], controller.staffSignin);
  app.post("/signin", [validation.signin], controller.signin);
};
