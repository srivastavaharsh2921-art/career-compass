(function () {
  window.CAREER_COMPASS_PUBLIC_ACCESS = true;

  const page = location.pathname.split("/").pop() || "index.html";
  const retiredAuthPages = new Set(["login.html", "signup.html", "forgot-password.html"]);
  if (retiredAuthPages.has(page)) {
    location.replace("index.html");
  }
})();
