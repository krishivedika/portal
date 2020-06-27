const { authJwt } = require("../middlewares");
const controller = require("../controllers/user");

module.exports = (app) => {
  app.use((_, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/role/all", controller.allAccess);

  app.get("/role/user", [authJwt.verifyToken], controller.userBoard);

  app.get(
    "/role/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};
