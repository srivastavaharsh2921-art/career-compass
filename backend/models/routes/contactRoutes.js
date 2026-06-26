const { sendContact } = require("../../controllers/contactController");

function registerContactRoutes(app, basePath = "/api/contact") {
  app.post(basePath, sendContact);
  return app;
}

module.exports = registerContactRoutes;
module.exports.sendContact = sendContact;
