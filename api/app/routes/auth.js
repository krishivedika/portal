const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth");

module.exports = (app) => {
  app.use((_, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  app.post("/signin", controller.signin);
};
