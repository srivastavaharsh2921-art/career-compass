const { requestHandler } = require("../backend/server");

module.exports = function vercelHandler(req, res) {
  const route = req.query?.path;

  if (route) {
    const routePath = (Array.isArray(route) ? route.join("/") : String(route))
      .replace(/^\/+/, "");
    const incomingUrl = new URL(req.url, "http://localhost");
    incomingUrl.searchParams.delete("path");
    const query = incomingUrl.searchParams.toString();
    req.url = `/api/${routePath}${query ? `?${query}` : ""}`;
  }

  return requestHandler(req, res);
};
