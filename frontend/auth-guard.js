(function () {
  window.CAREER_COMPASS_PUBLIC_ACCESS = true;

  window.isLoggedIn = function () {
    const userStr = localStorage.getItem("careerCompassUser");
    const token = localStorage.getItem("careerCompassToken");
    return Boolean(userStr && token);
  };

  window.getCurrentUser = function () {
    try {
      const userStr = localStorage.getItem("careerCompassUser");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };
})();

