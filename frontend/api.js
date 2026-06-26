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
    const isLogin = page === "login.html";
    const isSignup = page === "signup.html";
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
      window.setTimeout(() => {
        window.location.href = "test.html";
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
    const user = JSON.parse(localStorage.getItem(storage.user) || "null");
    const navActions = document.querySelector(".nav-actions");
    if (!user || !navActions) return;

    navActions.innerHTML = `
      <span class="btn-login" style="cursor: default;">Hi, ${escapeHtml(user.name.split(" ")[0])}</span>
      <a class="btn-signup" href="#" id="ccLogout">Logout</a>
    `;
  }

  document.addEventListener("submit", handleAuthSubmit, true);
  document.addEventListener("click", handleQuizNext, true);
  document.addEventListener("click", handleResultRoadmap);
  document.addEventListener("click", event => {
    if (event.target.closest("#ccLogout")) {
      event.preventDefault();
      clearSession();
      window.location.href = "index.html";
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    getGuestId();
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
    logout: clearSession
  };
  window.generateRoadmap = generateRoadmap;
  window.selectTopic = selectTopic;
})();
