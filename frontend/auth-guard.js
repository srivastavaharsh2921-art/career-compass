(function () {
  const protectedPages = new Set([
    "test.html",
    "skills.html",
    "personality.html",
    "goals.html",
    "results.html",
    "roadmap.html",
    "courses.html",
    "mentor.html",
    "skills-analyzer.html",
    "stream-analyzer.html",
    "profile.html",
    "settings.html",
    "notifications.html"
  ]);

  const page = location.pathname.split("/").pop() || "index.html";
  if (!protectedPages.has(page)) return;
  if (localStorage.getItem("careerCompassToken")) return;

  const returnTo = `${page}${location.search}${location.hash}`;
  sessionStorage.setItem("careerCompassReturnTo", returnTo);
  location.replace(`login.html?returnTo=${encodeURIComponent(returnTo)}`);
})();
