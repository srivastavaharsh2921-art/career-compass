const { signup, login } = require("../../controllers/authcontroller");

function registerAuthRoutes(app, basePath = "/api/auth") {
  app.post(`${basePath}/signup`, signup);
  app.post(`${basePath}/login`, login);
  return app;
}

module.exports = registerAuthRoutes;
module.exports.signup = signup;
module.exports.login = login;
