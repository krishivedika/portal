const controller = require("../controllers/auth");
const validation = require("../validations/auth");

module.exports = (app) => {

  app.post("/otp/resend", [validation.newOtp], controller.resendOtp);

  app.post("/logout", controller.logout);

  app.post(
    "/otp/new",
    [validation.checkDuplicateUser, validation.newOtp],
    controller.newOtp
  );

  app.post(
    "/otp/signin",
    [validation.isOnboarded, validation.newOtp],
    controller.newOtp
  );

  app.post("/signup", [validation.signup], controller.signup);

  app.post("/signin/staff", [validation.staffSignin], controller.staffSignin);

  app.post("/forgot", [validation.forgot], controller.forgotPassword);

  app.post("/reset", [validation.reset], controller.resetPassword);

  app.post("/signin", [validation.signin], controller.signin);
};
