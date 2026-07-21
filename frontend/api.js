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

  const protectedPages = new Set();

  function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function isProtectedPage() {
    return protectedPages.has(currentPage());
  }

  function safeReturnTo(value) {
    if (!value) return "index.html";
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return "index.html";
      const page = url.pathname.split("/").pop();
      return page ? `${page}${url.search}${url.hash}` : "index.html";
    } catch {
      return "index.html";
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
    if (response.status === 401) clearSession();
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
    const isForgotPassword = authAction === "forgot-password";
    const isResetPassword = authAction === "reset-password";
    if (!isLogin && !isSignup && !isForgotPassword && !isResetPassword) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const submit = form.querySelector("[type='submit']");
    const name = form.querySelector("[name='name']")?.value.trim() || form.querySelector("#name")?.value.trim() || "";
    const email = form.querySelector("[name='email']")?.value.trim() || form.querySelector("#email")?.value.trim() || "";
    const password = form.querySelector("[name='password']")?.value || form.querySelector("#password")?.value || "";
    const confirm = form.querySelector("[name='confirm']")?.value || form.querySelector("#confirm")?.value || "";

    if ((isSignup || isResetPassword) && password !== confirm) {
      notice("Passwords do not match", "error");
      (form.querySelector("[name='confirm']") || form.querySelector("#confirm"))?.focus();
      return;
    }

    try {
      if (isForgotPassword) {
        setButtonLoading(submit, true, "Sending code...");
        const data = await request("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email })
        });
        const resetForm = document.querySelector('[data-auth="reset-password"]');
        const resetEmail = resetForm?.querySelector('[name="email"]');
        const resetCode = resetForm?.querySelector('[name="code"]');
        const status = document.querySelector("#reset-status");
        if (resetEmail) resetEmail.value = email;
        if (data.developmentCode && resetCode) resetCode.value = data.developmentCode;
        if (resetForm) resetForm.hidden = false;
        if (status) {
          status.hidden = false;
          status.textContent = data.developmentCode
            ? `Local development code: ${data.developmentCode}`
            : data.message;
        }
        notice(data.message, "success");
        (resetCode || resetForm?.querySelector("input"))?.focus();
        return;
      }

      if (isResetPassword) {
        setButtonLoading(submit, true, "Resetting password...");
        const code = form.querySelector('[name="code"]')?.value.trim() || "";
        const resetEmail = form.querySelector('[name="email"]')?.value.trim() || email;
        const data = await request("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ email: resetEmail, code, password })
        });
        clearSession();
        notice(data.message, "success");
        window.setTimeout(() => {
          window.location.href = `login.html?email=${encodeURIComponent(resetEmail)}`;
        }, 700);
        return;
      }

      setButtonLoading(submit, true, isLogin ? "Logging in..." : "Creating...");
      const data = await request(isLogin ? "/auth/login" : "/auth/signup", {
        method: "POST",
        body: JSON.stringify(isLogin ? { email, password } : { name: name || email.split("@")[0], email, password })
      });

      setSession(data);
      updateAuthNav();
      notice(data.message || "Success", "success");

      const modalOverlay = document.querySelector(".cc-auth-modal-overlay");
      if (modalOverlay) modalOverlay.remove();

      const params = new URLSearchParams(location.search);
      const savedReturn = sessionStorage.getItem("careerCompassReturnTo");
      const destination = safeReturnTo(
        params.get("returnTo") || savedReturn
      );
      sessionStorage.removeItem("careerCompassReturnTo");

      if (["login.html", "signup.html"].includes(page) || (savedReturn && savedReturn !== "index.html")) {
        window.setTimeout(() => {
          window.location.href = destination;
        }, 400);
      }
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

  function getUser() {
    try {
      const raw = localStorage.getItem(storage.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isUserLoggedIn() {
    return Boolean(getToken() && getUser());
  }

  function updateAuthNav() {
    const user = getUser();
    const headers = document.querySelectorAll(".site-header, header");
    
    headers.forEach(header => {
      let authContainer = header.querySelector(".cc-header-auth");
      if (!authContainer) {
        authContainer = document.createElement("div");
        authContainer.className = "cc-header-auth";
        header.appendChild(authContainer);
      }

      if (user) {
        const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
        const displayName = escapeHtml(user.name || user.email || "User");
        authContainer.innerHTML = `
          <div class="cc-user-pill">
            <div class="cc-user-avatar">${initial}</div>
            <span class="cc-user-name">${displayName}</span>
            <button type="button" class="cc-logout-btn" data-cc-logout><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
          </div>
        `;
      } else {
        authContainer.innerHTML = `
          <a href="login.html" class="btn-header-login" data-cc-login><i class="fa-solid fa-right-to-bracket"></i> Login</a>
          <a href="signup.html" class="btn-header-signup" data-cc-signup><i class="fa-solid fa-user-plus"></i> Sign Up</a>
        `;
      }
    });
  }

  function openAuthModal(mode = "login", redirectTarget = null) {
    const existing = document.querySelector(".cc-auth-modal-overlay");
    if (existing) existing.remove();

    if (redirectTarget) {
      sessionStorage.setItem("careerCompassReturnTo", redirectTarget);
    }

    const overlay = document.createElement("div");
    overlay.className = "cc-auth-modal-overlay";

    overlay.innerHTML = `
      <div class="cc-auth-modal" role="dialog" aria-modal="true">
        <button type="button" class="cc-auth-modal-close" aria-label="Close">&times;</button>
        <div class="cc-auth-modal-header">
          <img src="careercompass-logo.png" class="cc-auth-brand-logo" alt="Career Compass">
          <h2>${mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h2>
          <p>${mode === 'signup' ? 'Sign up to unlock personalized career paths, roadmaps & tools.' : 'Log in to access your saved career roadmaps and progress.'}</p>
        </div>
        <div class="cc-auth-tabs">
          <button type="button" class="cc-auth-tab ${mode === 'login' ? 'active' : ''}" data-tab="login">Login</button>
          <button type="button" class="cc-auth-tab ${mode === 'signup' ? 'active' : ''}" data-tab="signup">Sign Up</button>
        </div>
        <div class="cc-auth-modal-body">
          <form class="modal-auth-form" data-auth="${mode}">
            ${mode === 'signup' ? `
            <div class="input-group">
              <label for="modal-name">Full Name</label>
              <div class="input-wrapper">
                <i class="fa-regular fa-user input-icon"></i>
                <input type="text" id="modal-name" name="name" placeholder="Enter your full name" required>
              </div>
            </div>
            ` : ''}
            <div class="input-group">
              <label for="modal-email">Email Address</label>
              <div class="input-wrapper">
                <i class="fa-regular fa-envelope input-icon"></i>
                <input type="email" id="modal-email" name="email" placeholder="Enter your email" required>
              </div>
            </div>
            <div class="input-group">
              <label for="modal-password">Password</label>
              <div class="input-wrapper">
                <i class="fa-solid fa-lock input-icon"></i>
                <input type="password" id="modal-password" name="password" minlength="6" placeholder="Enter password" required>
              </div>
            </div>
            ${mode === 'signup' ? `
            <div class="input-group">
              <label for="modal-confirm">Confirm Password</label>
              <div class="input-wrapper">
                <i class="fa-solid fa-lock input-icon"></i>
                <input type="password" id="modal-confirm" name="confirm" minlength="6" placeholder="Repeat password" required>
              </div>
            </div>
            ` : ''}
            <button type="submit" class="btn-submit">
              ${mode === 'login' ? 'Login to Continue' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".cc-auth-modal-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelectorAll(".cc-auth-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        openAuthModal(tab.dataset.tab, redirectTarget);
      });
    });
  }

  function preserveAuthDestination() {
    if (!["login.html", "signup.html"].includes(currentPage())) return;
    const params = new URLSearchParams(location.search);
    const destination = safeReturnTo(params.get("returnTo") || sessionStorage.getItem("careerCompassReturnTo"));
    sessionStorage.setItem("careerCompassReturnTo", destination);
    document.querySelectorAll('a[href="login.html"], a[href="signup.html"]')
      .forEach(link => { link.href = `${link.getAttribute("href")}?returnTo=${encodeURIComponent(destination)}`; });
  }

  const protectedPagesList = new Set([
    "test.html",
    "roadmap.html",
    "courses.html",
    "mentor.html",
    "skills-analyzer.html",
    "stream-analyzer.html",
    "settings.html",
    "profile.html",
    "results.html",
    "goals.html",
    "skills.html",
    "personality.html",
    "non-tech-roadmaps.html",
    "non-tech-course.html"
  ]);

  function handleProtectedLink(event) {
    if (isUserLoggedIn()) return;

    // Check if clicked element or parent is header login/signup
    const loginBtn = event.target.closest("[data-cc-login], a[href='login.html']");
    const signupBtn = event.target.closest("[data-cc-signup], a[href='signup.html']");
    if (loginBtn) {
      if (!["login.html", "signup.html"].includes(currentPage())) {
        event.preventDefault();
        openAuthModal("login");
        return;
      }
    }
    if (signupBtn) {
      if (!["login.html", "signup.html"].includes(currentPage())) {
        event.preventDefault();
        openAuthModal("signup");
        return;
      }
    }

    const link = event.target.closest("a[href], button[onclick], .feature-card, .nav-item, .chat-btn");
    if (!link) return;

    let targetHref = link.getAttribute("href") || "";
    if (!targetHref && link.getAttribute("onclick")) {
      const match = link.getAttribute("onclick").match(/href=['"]([^'"]+)['"]/);
      if (match) targetHref = match[1];
    }

    if (!targetHref) {
      const pageNav = link.querySelector("a[href]");
      if (pageNav) targetHref = pageNav.getAttribute("href") || "";
    }

    if (!targetHref) return;

    const targetPage = targetHref.split("/").pop().split("?")[0].split("#")[0];
    if (protectedPagesList.has(targetPage)) {
      event.preventDefault();
      event.stopPropagation();
      openAuthModal("login", targetHref);
    }
  }

  document.addEventListener("submit", handleAuthSubmit, true);
  document.addEventListener("click", handleQuizNext, true);
  document.addEventListener("click", handleResultRoadmap);
  document.addEventListener("click", handleProtectedLink, true);
  document.addEventListener("click", async event => {
    if (event.target.closest("[data-cc-logout]")) {
      event.preventDefault();
      await logout();
      updateAuthNav();
      notice("Logged out successfully", "info");
      if (protectedPagesList.has(currentPage())) {
        window.location.replace("index.html");
      }
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
    logout,
    openAuthModal,
    isUserLoggedIn,
    getUser
  };
  window.generateRoadmap = generateRoadmap;
  window.selectTopic = selectTopic;
  window.openAuthModal = openAuthModal;
})();

