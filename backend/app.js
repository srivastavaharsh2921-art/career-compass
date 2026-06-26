// Compatibility entry point for tooling that imports backend/app.js.
// The project now uses the dependency-light HTTP server in server.js.
module.exports = require("./server");
