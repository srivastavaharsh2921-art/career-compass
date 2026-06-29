(function () {
  const API_BASE = (() => {
    const localHosts = new Set(["localhost", "127.0.0.1", ""]);
    if (location.protocol === "file:" || (localHosts.has(location.hostname) && location.port !== "5000")) {
      return "http://localhost:5000/api";
    }
    return "/api";
  })();

  const storage = {
    token: "careerCompassToken",
    user: "careerCompassUser",
    guest: "careerCompassGuestId",
    quiz: "careerCompassQuiz"
  };

  const protectedPages = new Set([
    "test.html", "skills.html", "personality.html", "goals.html", "results.html",
    "roadmap.html", "courses.html", "mentor.html", "skills-analyzer.html",
    "stream-analyzer.html", "profile.html", "settings.html", "notifications.html"
  ]);

  function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function isProtectedPage() {
    return protectedPages.has(currentPage());
  }

  function safeReturnTo(value) {
    if (!value) return "test.html";
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return "test.html";
      const page = url.pathname.split("/").pop();
      return protectedPages.has(page) ? `${page}${url.search}${url.hash}` : "test.html";
    } catch {
      return "test.html";
    }
  }

  function loginUrl(returnTo) {
    return `login.html?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`;
  }

  function rememberReturnTo(returnTo) {
    const destination = safeReturnTo(returnTo);
    sessionStorage.setItem("careerCompassReturnTo", destination);
    return destination;
  }

  function getGuestId() {
    let guestId = localStorage.getItem(storage.guest);
    if (!guestId) {
      guestId = crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(storage.guest, guestId);
    }
    return guestId;
  }

  function getToken() {
    return localStorage.getItem(storage.token) || "";
  }

  function setSession(data) {
    if (data.token) localStorage.setItem(storage.token, data.token);
    if (data.user) localStorage.setItem(storage.user, JSON.stringify(data.user));
  }

  function clearSession() {
    localStorage.removeItem(storage.token);
    localStorage.removeItem(storage.user);
  }

  async function logout() {
    try {
      if (getToken()) await request("/auth/logout", { method: "POST" });
    } catch {
      // Local session cleanup must still succeed if the network is unavailable.
    } finally {
      clearSession();
    }
  }

  function headers() {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      "X-Guest-Id": getGuestId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...headers(),
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && isProtectedPage()) {
      clearSession();
      const destination = rememberReturnTo(`${currentPage()}${location.search}${location.hash}`);
      location.replace(loginUrl(destination));
    }
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }

  function notice(message, type = "info") {
    let el = document.querySelector(".cc-api-notice");
    if (!el) {
      el = document.createElement("div");
      el.className = "cc-api-notice";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.dataset.type = type;
    Object.assign(el.style, {
      position: "fixed",
      top: "18px",
      right: "18px",
      zIndex: "9999",
      maxWidth: "340px",
      padding: "12px 14px",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "14px",
      lineHeight: "1.35",
      boxShadow: "0 16px 45px rgba(15, 23, 42, 0.22)",
      background: type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#2563eb"
    });

    window.clearTimeout(notice.timer);
    notice.timer = window.setTimeout(() => el.remove(), 3500);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function setButtonLoading(button, isLoading, label) {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = label;
    } else {
      button.disabled = false;
      if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
    }
  }

  async function handleAuthSubmit(event) {
    const form = event.target.closest("form");
    if (!form) return;

    const page = location.pathname.split("/").pop();
    const authAction = form.dataset.auth || (page === "login.html" ? "login" : page === "signup.html" ? "signup" : "");
    const isLogin = authAction === "login";
    const isSignup = authAction === "signup";
    if (!isLogin && !isSignup) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const submit = form.querySelector("[type='submit']");
    const name = form.querySelector("#name")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const password = form.querySelector("#password")?.value || "";
    const confirm = form.querySelector("#confirm")?.value || "";

    if (isSignup && password !== confirm) {
      notice("Passwords do not match", "error");
      form.querySelector("#confirm")?.focus();
      return;
    }

    try {
      setButtonLoading(submit, true, isLogin ? "Logging in..." : "Creating...");
      const data = await request(isLogin ? "/auth/login" : "/auth/signup", {
        method: "POST",
        body: JSON.stringify(isLogin ? { email, password } : { name, email, password })
      });

      setSession(data);
      notice(data.message || "Success", "success");
      const params = new URLSearchParams(location.search);
      const destination = safeReturnTo(
        params.get("returnTo") || sessionStorage.getItem("careerCompassReturnTo")
      );
      sessionStorage.removeItem("careerCompassReturnTo");
      window.setTimeout(() => {
        window.location.href = destination;
      }, 500);
    } catch (error) {
      notice(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  }

  const stepByPage = {
    "test.html": { step: "interests", next: "skills.html" },
    "skills.html": { step: "skills", next: "personality.html" },
    "personality.html": { step: "personality", next: "goals.html" },
    "goals.html": { step: "goals", next: "results.html" }
  };

  function currentQuizPage() {
    const page = location.pathname.split("/").pop() || "index.html";
    return stepByPage[page] || null;
  }

  function selectedOptions() {
    return Array.from(document.querySelectorAll(".option-box.selected .option-title"))
      .map(item => item.textContent.trim())
      .filter(Boolean);
  }

  function otherValue() {
    return document.querySelector(".other-input-container input")?.value.trim() || "";
  }

  function saveLocalQuiz(step, payload) {
    const existing = JSON.parse(localStorage.getItem(storage.quiz) || "{}");
    existing[step] = payload;
    localStorage.setItem(storage.quiz, JSON.stringify(existing));
    return existing;
  }

  async function saveQuizStep(step, payload) {
    saveLocalQuiz(step, payload);
    return request(`/quiz/${step}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async function handleQuizNext(event) {
    const button = event.target.closest(".next-btn");
    const quizPage = currentQuizPage();
    if (!button || !quizPage) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const selections = selectedOptions();
    if (!selections.length) {
      notice("Please select at least one option to proceed.", "error");
      return;
    }

    try {
      setButtonLoading(button, true, "Saving...");
      await saveQuizStep(quizPage.step, {
        selections,
        other: otherValue()
      });
      window.location.href = quizPage.next;
    } catch (error) {
      notice(error.message, "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  function renderRoadmap(roadmap) {
    const preview = document.getElementById("roadmapPreview");
    if (!preview) return;

    preview.innerHTML = `
      <h2>${escapeHtml(roadmap.topic)} Roadmap</h2>
      <p>${escapeHtml(roadmap.summary)}</p>
      <div class="generated-roadmap">
        ${roadmap.steps.map((step, index) => `
          <div class="roadmap-step">
            <strong>Step ${index + 1}: ${escapeHtml(step.title)}</strong>
            <ul>
              ${step.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>
    `;
  }

  async function generateRoadmap() {
    const input = document.getElementById("roadmapInput");
    const button = document.querySelector(".roadmap-search button");
    const topic = input?.value.trim();

    if (!topic) {
      notice("Please enter a roadmap topic", "error");
      input?.focus();
      return;
    }

    try {
      setButtonLoading(button, true, "Generating...");
      const data = await request("/roadmaps", {
        method: "POST",
        body: JSON.stringify({ topic })
      });
      renderRoadmap(data.roadmap);
      notice("Roadmap generated", "success");
    } catch (error) {
      notice(error.message, "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function askMentor(message) {
    return request("/mentor", {
      method: "POST",
      body: JSON.stringify({ message })
    });
  }

  function selectTopic(topic) {
    const input = document.getElementById("roadmapInput");
    if (input) input.value = topic;
    generateRoadmap();
  }

  async function initResults() {
    const resultsRoot = document.getElementById("resultsRoot");
    if (!resultsRoot) return;

    try {
      const localQuiz = JSON.parse(localStorage.getItem(storage.quiz) || "{}");
      const data = await request("/results", {
        method: "POST",
        body: JSON.stringify({ quiz: localQuiz })
      });

      resultsRoot.innerHTML = `
        <div class="results-summary">
          <p>${escapeHtml(data.summary)}</p>
        </div>
        <div class="results-grid">
          ${data.matches.map(match => `
            <article class="result-card">
              <div class="result-score">${escapeHtml(match.match)}%</div>
              <h2>${escapeHtml(match.title)}</h2>
              <p>${escapeHtml(match.reason)}</p>
              <button class="next-btn result-roadmap" data-topic="${escapeHtml(match.title)}">Generate Roadmap</button>
            </article>
          `).join("")}
        </div>
      `;
    } catch (error) {
      resultsRoot.innerHTML = `<p class="results-error">${escapeHtml(error.message)}</p>`;
    }
  }

  async function handleResultRoadmap(event) {
    const button = event.target.closest(".result-roadmap");
    if (!button) return;

    event.preventDefault();
    const topic = button.dataset.topic;
    localStorage.setItem("careerCompassRoadmapTopic", topic);
    window.location.href = `roadmap.html?topic=${encodeURIComponent(topic)}`;
  }

  function prefillRoadmapTopic() {
    const input = document.getElementById("roadmapInput");
    if (!input) return;

    const params = new URLSearchParams(location.search);
    const queryTopic = params.get("topic");
    const topic = queryTopic || localStorage.getItem("careerCompassRoadmapTopic");
    if (topic && !input.value) input.value = topic;
    if (queryTopic) window.setTimeout(generateRoadmap, 0);
  }

  function updateAuthNav() {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem(storage.user) || "null");
    } catch {
      clearSession();
    }
    const navActions = document.querySelector(".nav-actions");
    if (user && navActions) {
      navActions.innerHTML = `
        <span class="btn-login" style="cursor: default;">Hi, ${escapeHtml(user.name.split(" ")[0])}</span>
        <a class="btn-signup" href="#" data-cc-logout>Logout</a>
      `;
    }

    document.querySelectorAll('.nav-item.mobile-only-nav[href="login.html"], .nav-item.mobile-only-nav[href="signup.html"]')
      .forEach(link => { link.hidden = Boolean(user); });

    if (document.querySelector(".mobile-auth-actions") || ["login.html", "signup.html"].includes(currentPage())) return;
    const mobileActions = document.createElement("div");
    mobileActions.className = "mobile-auth-actions";
    mobileActions.setAttribute("aria-label", "Account actions");
    mobileActions.innerHTML = user
      ? `<a href="profile.html">Hi, ${escapeHtml(user.name.split(" ")[0])}</a><button type="button" class="mobile-signup" data-cc-logout>Logout</button>`
      : `<a href="login.html">Login</a><a class="mobile-signup" href="signup.html">Sign Up</a>`;
    document.body.appendChild(mobileActions);
  }

  function preserveAuthDestination() {
    if (!["login.html", "signup.html"].includes(currentPage())) return;
    const params = new URLSearchParams(location.search);
    const destination = safeReturnTo(params.get("returnTo") || sessionStorage.getItem("careerCompassReturnTo"));
    sessionStorage.setItem("careerCompassReturnTo", destination);
    document.querySelectorAll('a[href="login.html"], a[href="signup.html"]')
      .forEach(link => { link.href = `${link.getAttribute("href")}?returnTo=${encodeURIComponent(destination)}`; });
  }

  function handleProtectedLink(event) {
    const link = event.target.closest("a[href]");
    if (!link || getToken()) return;
    const url = new URL(link.href, location.href);
    const page = url.pathname.split("/").pop();
    if (!protectedPages.has(page) || url.origin !== location.origin) return;
    event.preventDefault();
    const destination = rememberReturnTo(`${page}${url.search}${url.hash}`);
    window.location.href = loginUrl(destination);
  }

  document.addEventListener("submit", handleAuthSubmit, true);
  document.addEventListener("click", handleQuizNext, true);
  document.addEventListener("click", handleResultRoadmap);
  document.addEventListener("click", handleProtectedLink, true);
  document.addEventListener("click", async event => {
    if (event.target.closest("[data-cc-logout]")) {
      event.preventDefault();
      await logout();
      window.location.replace("index.html");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    getGuestId();
    preserveAuthDestination();
    updateAuthNav();
    prefillRoadmapTopic();
    initResults();
  });

  window.CareerCompassApi = {
    request,
    saveQuizStep,
    generateRoadmap,
    selectTopic,
    askMentor,
    logout
  };
  window.generateRoadmap = generateRoadmap;
  window.selectTopic = selectTopic;
})();
