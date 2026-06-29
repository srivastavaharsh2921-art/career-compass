/* Career Compass Pro — connected career and learning ecosystem.
   Roadmap content lives in data/roadmaps.json; this file owns rendering,
   personalization, progress, practice, projects, mentoring, and career tools. */
(() => {
  "use strict";

  const DATA_URL = "data/roadmaps.json";
  const STORE_KEY = "careerCompassLearningOS_v4";
  const LEVEL_RANK = { Beginner: 0, Intermediate: 1, Advanced: 2, Expert: 3 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const elements = {};

  const state = {
    catalog: [], roadmap: null, key: null, selectedNode: null,
    pendingId: null, panelTab: "learn", view: "roadmap", flow: "vertical",
    preferences: { level: "Beginner", duration: 90, hours: 10 },
    store: loadStore()
  };

  function initialStore() {
    return { roadmaps: {}, xp: 0, coins: 0, streak: 1, lastActive: "", posts: [], achievements: [] };
  }

  function loadStore() {
    try { return { ...initialStore(), ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") }; }
    catch { return initialStore(); }
  }

  function saveStore() { localStorage.setItem(STORE_KEY, JSON.stringify(state.store)); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
  function slug(value) { return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function titleCase(value) { return String(value).replace(/\b\w/g, char => char.toUpperCase()); }
  function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
  function formatHours(hours) { return hours >= 100 ? `${Math.round(hours / 10) * 10}h` : `${hours}h`; }
  function unique(values) { return [...new Set(values)]; }
  function roadmapById(id) { return state.catalog.find(item => item.id === id); }

  const ZERO_STARTERS = {
    "Web Development": ["Using a computer and browser", "Files and folders", "Typing and shortcuts", "How websites work", "Install a code editor", "Learning how to learn"],
    "Programming Languages": ["Using a computer", "Files and folders", "Logical thinking", "Terminal basics", "Install an editor and runtime", "Reading error messages"],
    "Backend & Data": ["Computer and operating-system basics", "Files and folders", "Terminal basics", "How the internet works", "Data and databases explained", "Install the required tools"],
    "Data & AI": ["Computer and file basics", "Spreadsheets from scratch", "Numbers and basic algebra", "Charts and data questions", "Install Python and an editor", "Responsible use of data"],
    "Security & Cloud": ["Computer and operating-system basics", "Files, users and permissions", "Internet and network basics", "Terminal basics", "Digital safety", "Build a safe practice lab"],
    "Design & Product": ["Computer and browser basics", "Files and image formats", "Visual observation", "Everyday product thinking", "Install and navigate design tools", "Give and receive feedback"],
    "Mobile & Emerging": ["Computer and smartphone basics", "Files and folders", "Logical thinking", "Install an editor and SDK", "Run a first sample", "Debugging without fear"],
    "Business & Growth": ["Computer and browser basics", "Documents and spreadsheets", "Clear written communication", "Customer and business basics", "Digital research", "Set a measurable learning goal"],
    "Computer Science": ["Using a computer", "Files and folders", "Logical problem solving", "Basic mathematics", "Terminal and editor basics", "How programs execute"]
  };

  function addZeroStartingPoint(item) {
    if (item.nodes[0]?.zeroStart) return item;
    const topics = ZERO_STARTERS[item.category] || ZERO_STARTERS["Computer Science"];
    return {
      ...item,
      nodes: [{
        title: "Start Here: Absolute Beginner",
        difficulty: "Beginner",
        time: 12,
        zeroStart: true,
        topics
      }, ...item.nodes]
    };
  }
  function currentSaved() {
    if (!state.store.roadmaps[state.key]) state.store.roadmaps[state.key] = { completed: [], notes: {}, quizzes: {}, projects: {}, practice: {}, hours: 0, startedAt: new Date().toISOString() };
    return state.store.roadmaps[state.key];
  }
  function isCompleted(index) { return currentSaved().completed.includes(index); }
  function isUnlocked(index) { return index === 0 || isCompleted(index - 1); }

  function updateStreak() {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    if (!state.store.lastActive) state.store.streak = 1;
    else if (state.store.lastActive !== todayKey) {
      const previous = new Date(`${state.store.lastActive}T00:00:00`);
      const diff = Math.round((new Date(`${todayKey}T00:00:00`) - previous) / 86400000);
      state.store.streak = diff === 1 ? state.store.streak + 1 : 1;
    }
    state.store.lastActive = todayKey;
    saveStore();
  }

  function cacheElements() {
    Object.assign(elements, {
      form: $("#roadmapForm"), input: $("#roadmapInput"), suggestions: $("#searchSuggestions"), chips: $("#topicChips"),
      level: $("#levelSelect"), duration: $("#durationSelect"), hours: $("#hoursSelect"), category: $("#categoryFilter"), sort: $("#sortFilter"), catalog: $("#roadmapCatalog"), catalogCount: $("#catalogCount"),
      discovery: $("#discoverySection"), workspace: $("#roadmapWorkspace"), title: $("#roadmapTitle"), role: $("#roadmapRole"), description: $("#roadmapDescription"), tags: $("#roadmapTags"),
      tabs: $("#workspaceTabs"), flow: $("#roadmapFlow"), preview: $("#roadmapPreview"), ring: $("#progressRing"), percent: $("#progressPercent"), bar: $("#progressBar"), message: $("#progressMessage"), count: $("#progressCount"), completed: $("#completedStat"), locked: $("#lockedStat"), time: $("#timeStat"),
      continueButton: $("#continueButton"), certificateButton: $("#certificateButton"), resetButton: $("#resetButton"),
      xp: $("#xpStat"), coins: $("#coinStat"), streak: $("#streakStat"), xpBar: $("#xpBar"), learnerLevel: $("#learnerLevel"), mission: $("#missionProgress"),
      panel: $("#detailPanel"), backdrop: $("#panelBackdrop"), closePanel: $("#panelClose"), panelTabs: $("#panelTabs"), panelStep: $("#panelStep"), detailTitle: $("#detailTitle"), panelBody: $("#panelBody"), panelFooter: $("#panelFooter"),
      resetDialog: $("#resetDialog"), cancelReset: $("#cancelReset"), confirmReset: $("#confirmReset"), toast: $("#toast"),
      certificateModal: $("#certificateModal"), closeCertificate: $("#closeCertificate"), reward: $("#rewardOverlay"), rewardTitle: $("#rewardTitle"), rewardMessage: $("#rewardMessage"), closeReward: $("#closeReward")
    });
  }

  async function loadCatalog() {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Roadmap catalog failed to load (${response.status})`);
    const data = await response.json();
    state.catalog = data.roadmaps.map(addZeroStartingPoint);
    elements.catalogCount.textContent = state.catalog.length;
    populateCategories();
    renderChips();
    renderCatalog();
  }

  function populateCategories() {
    const categories = unique(state.catalog.map(item => item.category)).sort();
    elements.category.innerHTML = `<option value="All">All categories</option>${categories.map(item => `<option>${escapeHtml(item)}</option>`).join("")}`;
  }

  function matchesRoadmap(item, query) {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return true;
    return [item.label, item.role, item.category, ...item.aliases].some(value => value.toLowerCase().includes(normalized));
  }

  function findRoadmap(query) {
    const normalized = query.toLowerCase().trim().replace(/[\/_-]+/g, " ").replace(/\s+/g, " ");
    const candidates = item => [item.label, item.role, item.id, ...item.aliases].map(value => value.toLowerCase().replace(/[\/_-]+/g, " "));
    const exact = state.catalog.find(item => candidates(item).includes(normalized));
    if (exact) return exact;
    if (normalized.length < 3) return null;
    return state.catalog.find(item => candidates(item).some(candidate => candidate.length >= 3 && (normalized.includes(candidate) || candidate.includes(normalized))));
  }

  function renderChips() {
    const featured = ["frontend", "backend", "java", "python", "data-science", "machine-learning", "artificial-intelligence", "cyber-security", "uiux", "saas-development", "cloud-computing", "devops", "android", "blockchain", "product-management"];
    elements.chips.innerHTML = featured.map(id => roadmapById(id)).filter(Boolean).map(item => `<button type="button" data-select-roadmap="${item.id}" class="${state.pendingId === item.id ? "active" : ""}">${escapeHtml(item.label)}</button>`).join("");
  }

  function renderSuggestions(query) {
    const matches = state.catalog.filter(item => matchesRoadmap(item, query)).slice(0, 7);
    if (!query.trim() || !matches.length) { elements.suggestions.hidden = true; elements.input.setAttribute("aria-expanded", "false"); return; }
    elements.suggestions.innerHTML = matches.map(item => `<button type="button" role="option" data-select-roadmap="${item.id}"><i class="ph ${item.icon}"></i><span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.role)} · ${escapeHtml(item.category)}</small></span><em>${item.rating} ★</em></button>`).join("");
    elements.suggestions.hidden = false;
    elements.input.setAttribute("aria-expanded", "true");
  }

  function numericSalary(value) {
    const match = String(value).match(/₹(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function renderCatalog() {
    const category = elements.category.value;
    const sort = elements.sort.value;
    let items = state.catalog.filter(item => category === "All" || item.category === category);
    const sorters = {
      popular: (a, b) => b.popularity - a.popularity,
      trending: (a, b) => b.growth - a.growth,
      salary: (a, b) => numericSalary(b.salaryIndia) - numericSalary(a.salaryIndia),
      beginner: (a, b) => a.nodes[0].time - b.nodes[0].time,
      duration: (a, b) => a.nodes.reduce((sum, node) => sum + node.time, 0) - b.nodes.reduce((sum, node) => sum + node.time, 0),
      rating: (a, b) => b.rating - a.rating
    };
    items.sort(sorters[sort]);
    elements.catalog.innerHTML = items.map((item, index) => {
      const hours = item.nodes.reduce((sum, node) => sum + node.time, 0);
      const trend = item.growth >= 90 ? "Trending" : item.demand;
      return `<article class="catalog-card" style="--delay:${Math.min(index, 10) * 35}ms"><div class="catalog-card-top"><span class="catalog-icon"><i class="ph ${item.icon}"></i></span><span class="trend-pill">${escapeHtml(trend)}</span></div><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.description)}</p><div class="catalog-meta"><span><i class="ph ph-briefcase"></i>${escapeHtml(item.role)}</span><span><i class="ph ph-clock"></i>${hours} hours</span><span><i class="ph-fill ph-star"></i>${item.rating}</span></div><div class="skill-preview">${item.nodes.slice(0, 3).map(node => `<span>${escapeHtml(node.title)}</span>`).join("")}</div><button type="button" data-select-roadmap="${item.id}">Build this roadmap <i class="ph ph-arrow-right"></i></button></article>`;
    }).join("");
  }

  function personalizeRoadmap(source) {
    const startRank = LEVEL_RANK[state.preferences.level];
    let nodes = source.nodes.filter(node => LEVEL_RANK[node.difficulty] >= Math.max(0, startRank - 1));
    if (nodes.length < 4) nodes = source.nodes.slice(-4);
    return { ...source, nodes: nodes.map(node => ({ ...node, topics: [...node.topics] })) };
  }

  function selectRoadmap(id) {
    const roadmap = roadmapById(id);
    if (!roadmap) return;
    state.pendingId = id;
    elements.input.value = roadmap.label;
    renderChips();
    renderSuggestions("");
    elements.input.focus();
  }

  function generateRoadmap(id, options = {}) {
    const source = roadmapById(id);
    if (!source) return;
    state.preferences = { level: elements.level.value, duration: Number(elements.duration.value), hours: Number(elements.hours.value) };
    state.roadmap = personalizeRoadmap(source);
    state.key = `${source.id}:${state.preferences.level.toLowerCase()}`;
    state.pendingId = source.id;
    state.selectedNode = null;
    elements.workspace.hidden = false;
    elements.discovery.hidden = true;
    elements.role.textContent = `${source.role} · ${state.preferences.level} path`;
    elements.title.textContent = `${source.label} Roadmap`;
    elements.description.textContent = source.description;
    elements.tags.innerHTML = `<span><i class="ph ph-calendar"></i>${state.preferences.duration} days</span><span><i class="ph ph-clock"></i>${state.preferences.hours}h/week</span><span><i class="ph ph-trend-up"></i>${escapeHtml(source.demand)} demand</span>`;
    elements.input.value = source.label;
    renderChips();
    try {
      renderFlow();
      updateProgress();
      renderPlayer();
      renderAllViews();
      delete elements.workspace.dataset.runtimeError;
    } catch (error) {
      elements.workspace.dataset.runtimeError = error.message;
      console.error("Career Compass workspace render failed", error);
      showToast("The learning workspace could not finish rendering.");
      return;
    }
    localStorage.setItem("careerCompassLastRoadmapV2", JSON.stringify({ id: source.id, ...state.preferences }));
    if (!options.noScroll) elements.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nodeStatus(index) {
    if (isCompleted(index)) return { label: "Completed", icon: "ph-check-circle", className: "completed" };
    if (isUnlocked(index)) return { label: currentSaved().completed.length ? "Next up" : "Start here", icon: "ph-play-circle", className: "current" };
    return { label: "Locked", icon: "ph-lock-key", className: "locked" };
  }

  function connectorSvg(index) {
    if (index === state.roadmap.nodes.length - 1) return "";
    const offsets = state.flow === "tree" ? [0, -190, 190, -95, 95] : [0, -190, 0, 190];
    const start = 450 + offsets[index % offsets.length];
    const end = 450 + offsets[(index + 1) % offsets.length];
    return `<svg class="flow-connector-svg" viewBox="0 0 900 165" preserveAspectRatio="none" aria-hidden="true"><path d="M ${start} 116 C ${start} 145, ${end} 135, ${end} 164"></path><path class="arrow" d="M ${end - 5} 156 L ${end} 164 L ${end + 5} 156"></path></svg><span class="mobile-flow-line" aria-hidden="true"></span>`;
  }

  function renderFlow() {
    const aligns = state.flow === "tree" ? ["align-center", "align-left", "align-right", "align-left", "align-right"] : ["align-center", "align-left", "align-center", "align-right"];
    elements.preview.className = `roadmap-preview flow-${state.flow}`;
    elements.flow.innerHTML = state.roadmap.nodes.map((node, index) => {
      const status = nodeStatus(index);
      const score = currentSaved().quizzes[index] ?? 0;
      const progress = isCompleted(index) ? 100 : score * 7;
      return `<div class="flow-item ${aligns[index % aligns.length]} ${node.branch ? "branch-item" : ""}" style="--index:${index}"><button type="button" class="flow-node ${status.className}" data-node="${index}" aria-label="Open ${escapeHtml(node.title)} details, ${status.label}"><span class="node-top"><span class="node-number">${String(index + 1).padStart(2, "0")}</span><span class="node-status"><i class="ph-fill ${status.icon}"></i>${status.label}</span></span><h3>${escapeHtml(node.title)}</h3>${node.branch ? `<span class="branch-label"><i class="ph ph-git-branch"></i>${escapeHtml(node.branch)}</span>` : ""}<div class="node-progress"><i style="width:${progress}%"></i></div><span class="node-bottom"><span class="difficulty ${node.difficulty.toLowerCase()}">${escapeHtml(node.difficulty)}</span><span><i class="ph ph-clock"></i>${node.time} hours</span><span><i class="ph ph-list-checks"></i>${node.topics.length}</span></span></button>${connectorSvg(index)}</div>`;
    }).join("") + `<div class="flow-end"><i class="ph-fill ph-flag-checkered"></i> Job-ready capstone reached</div>`;
  }

  function updateProgress() {
    const saved = currentSaved();
    const total = state.roadmap.nodes.length;
    const completed = saved.completed.filter(index => index < total).length;
    const percent = Math.round(completed / total * 100);
    const remainingHours = state.roadmap.nodes.reduce((sum, node, index) => sum + (isCompleted(index) ? 0 : node.time), 0);
    elements.percent.textContent = `${percent}%`;
    elements.ring.style.setProperty("--progress", percent);
    elements.bar.style.width = `${percent}%`;
    elements.bar.parentElement.setAttribute("aria-valuenow", percent);
    elements.message.textContent = percent === 100 ? "Roadmap complete — your certificate is ready" : completed ? "Keep the momentum going" : "Start your first milestone";
    elements.count.textContent = `${completed} of ${total} milestones completed`;
    elements.completed.textContent = completed;
    elements.locked.textContent = Math.max(total - completed - (completed < total ? 1 : 0), 0);
    elements.time.textContent = formatHours(remainingHours);
    elements.mission.textContent = `${completed ? 1 : 0}/1`;
    elements.certificateButton.classList.toggle("ready", percent === 100);
  }

  function renderPlayer() {
    const level = Math.floor(state.store.xp / 500) + 1;
    const names = ["Explorer", "Builder", "Practitioner", "Specialist", "Expert", "Pathfinder"];
    elements.xp.textContent = state.store.xp;
    elements.coins.textContent = state.store.coins;
    elements.streak.textContent = state.store.streak;
    elements.learnerLevel.textContent = `Level ${level} · ${names[Math.min(level - 1, names.length - 1)]}`;
    elements.xpBar.style.width = `${state.store.xp % 500 / 5}%`;
  }

  function nodeContext(index = state.selectedNode) {
    const node = state.roadmap.nodes[index];
    const previous = state.roadmap.nodes[index - 1];
    const next = state.roadmap.nodes[index + 1];
    return { node, previous, next, index };
  }

  function codingLanguages(node) {
    return window.CareerCompassLanguageGuide?.get(state.roadmap, node) || ["Python", "JavaScript", "SQL"];
  }

  function outcomeList(node) {
    return node.topics.slice(0, 5).map(topic => `Use ${topic} confidently in a realistic ${state.roadmap.label} task`);
  }

  function learnContent() {
    const { node, previous, next, index } = nodeContext();
    const opportunities = unique([state.roadmap.role, `${node.title} Specialist`, "Software Engineer", "Technical Consultant"]);
    const languages = codingLanguages(node);
    return `<div class="detail-hero"><div class="detail-meta"><span><i class="ph ph-gauge"></i>${escapeHtml(node.difficulty)}</span><span><i class="ph ph-clock"></i>${node.time} hours</span><span><i class="ph ph-trend-up"></i>${escapeHtml(state.roadmap.demand)}</span></div><p>${escapeHtml(node.title)} is the ${index ? "next" : "starting"} capability in your ${state.roadmap.role} path. It combines ${escapeHtml(node.topics.slice(0, 3).join(", "))} into practical, transferable skill.</p></div>
      ${!isUnlocked(index) ? `<div class="locked-notice"><i class="ph ph-lock-key"></i><span><b>Preview mode</b>Complete ${escapeHtml(previous.title)} to unlock completion and rewards.</span></div>` : ""}
      <section class="detail-section"><h3><i class="ph ph-lightbulb"></i>Why learn this</h3><p>This milestone removes the gap between understanding terminology and making sound implementation decisions. It prepares you for ${escapeHtml(next?.title || "portfolio-quality delivery")} and appears frequently in real project reviews and interviews.</p></section>
      <section class="detail-section"><h3><i class="ph ph-buildings"></i>Where it is used</h3><p>${escapeHtml(state.roadmap.companies.slice(0, 3).join(", "))} and teams across ${escapeHtml(state.roadmap.category)} use these capabilities to build, operate, or improve customer-facing products.</p><div class="concept-grid">${opportunities.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
      <section class="detail-section"><h3><i class="ph ph-target"></i>Learning outcomes</h3><ul class="check-list">${outcomeList(node).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <section class="detail-section"><h3><i class="ph ph-stairs"></i>Prerequisites</h3><p>${previous ? `Complete <strong>${escapeHtml(previous.title)}</strong> and be able to explain its core decisions without notes.` : "No prior professional experience is required. Basic computer literacy, curiosity, and a consistent practice routine are enough."}</p></section>
      <section class="detail-section"><h3><i class="ph ph-list-bullets"></i>Topics covered</h3><div class="concept-grid">${node.topics.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
      <section class="detail-section language-suggestion"><div class="language-heading"><div><span class="view-eyebrow">Recommended for this section</span><h3><i class="ph ph-code"></i>Coding languages to learn</h3></div><span>${index === 0 ? "Start with the first language" : "Use these in practice and projects"}</span></div><div class="language-grid">${languages.map((language, languageIndex) => `<article><i class="ph ph-code-block"></i><div><b>${escapeHtml(language)}</b><span>${languageIndex === 0 ? "Primary language" : "Supporting language"} for ${escapeHtml(node.title)}</span></div></article>`).join("")}</div></section>
      <section class="detail-section two-column-detail"><div><h3><i class="ph ph-warning"></i>Common mistakes</h3><ul><li>Learning syntax without building a small output</li><li>Copying solutions before defining the problem</li><li>Skipping testing, edge cases, and documentation</li><li>Optimizing before measuring the real bottleneck</li></ul></div><div><h3><i class="ph ph-checks"></i>Best practices</h3><ul><li>Work in small testable increments</li><li>Explain each decision in plain language</li><li>Use official documentation as your source of truth</li><li>Keep a decision log and weekly retrospective</li></ul></div></section>
      <section class="detail-section"><h3><i class="ph ph-currency-dollar"></i>Career and salary impact</h3><p>Demonstrating ${escapeHtml(node.title)} strengthens your evidence for ${escapeHtml(state.roadmap.role)} roles. The full path currently shows indicative ranges of <strong>${escapeHtml(state.roadmap.salaryIndia)}</strong> in India, <strong>${escapeHtml(state.roadmap.salaryUsa)}</strong> in the USA, and <strong>${escapeHtml(state.roadmap.salaryRemote)}</strong> for remote roles; actual offers vary by experience and location.</p></section>`;
  }

  function resourceLink(icon, title, copy, url, className = "") {
    return `<a class="resource-card expanded ${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener"><i class="ph ${icon}"></i><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(copy)}</span></span><i class="ph ph-arrow-up-right"></i></a>`;
  }

  function resourcesContent() {
    const { node } = nodeContext();
    const query = encodeURIComponent(`${node.title} ${state.roadmap.label}`);
    return `<div class="panel-intro"><span class="view-eyebrow">Curated learning stack</span><h3>Learn from primary sources, then practise.</h3><p>Use the official reference first, one structured course second, and active recall or a project third.</p></div><div class="resource-list">
      ${resourceLink("ph-path", `${state.roadmap.label} course roadmap`, "Follow the complete beginner-to-job-ready course sequence", `courses.html?career=${encodeURIComponent(state.roadmap.id)}`, "course-roadmap")}
      ${resourceLink("ph-file-text", "Official documentation", "Primary technical reference", state.roadmap.docs)}
      ${resourceLink("ph-youtube-logo", "YouTube playlists", "Focused video explanations and walkthroughs", `https://www.youtube.com/results?search_query=${query}+playlist`, "youtube")}
      ${resourceLink("ph-graduation-cap", "Best free courses", "Search freeCodeCamp's long-form curriculum", `https://www.youtube.com/@freecodecamp/search?query=${query}`)}
      ${resourceLink("ph-certificate", "Structured paid courses", "Compare highly rated guided programs", `https://www.coursera.org/search?query=${query}`)}
      ${resourceLink("ph-books", "Books", "Find respected books and previews", `https://books.google.com/books?q=${query}`)}
      ${resourceLink("ph-notebook", "Cheat sheets", "Quick syntax and concept references", `https://cheatography.com/search/?q=${query}`)}
      ${resourceLink("ph-github-logo", "GitHub repositories", "Study maintained examples and starter kits", `https://github.com/search?q=${query}&type=repositories`)}
      ${resourceLink("ph-article", "Technical articles", "Deep dives and engineering case studies", `https://dev.to/search?q=${query}`)}
      ${resourceLink("ph-code", "Practice websites", "Solve progressively harder exercises", `https://www.google.com/search?q=${query}+practice+problems`)}
      <button class="resource-card expanded" type="button" data-open-playground><i class="ph ph-terminal-window"></i><span><strong>Coding playground</strong><span>Open the integrated practice lab</span></span><i class="ph ph-arrow-right"></i></button>
      <button class="resource-card expanded" type="button" data-download-notes><i class="ph ph-download-simple"></i><span><strong>Downloadable notes</strong><span>Export your milestone revision sheet</span></span><i class="ph ph-download"></i></button>
    </div>`;
  }

  function practiceContent() {
    const { node, index } = nodeContext();
    const saved = currentSaved();
    const cards = node.topics.slice(0, 5);
    return `<div class="panel-intro"><span class="view-eyebrow">Active practice</span><h3>Retrieval beats rereading.</h3><p>Attempt each task before looking anything up. Record the gap, repair it, then try again from memory.</p></div>
      <section class="detail-section"><h3><i class="ph ph-cards"></i>Flash cards</h3><div class="flashcard-grid">${cards.map((topic, cardIndex) => `<button class="flashcard" type="button"><span>${escapeHtml(topic)}</span><b>Explain it, name one use case, and identify one common failure.</b><em>Tap to reveal</em></button>`).join("")}</div></section>
      <section class="detail-section"><h3><i class="ph ph-code"></i>Coding exercises</h3><ol><li>Create the smallest working example that demonstrates ${escapeHtml(node.topics[0])}.</li><li>Combine ${escapeHtml(node.topics[0])} and ${escapeHtml(node.topics[1] || node.topics[0])}, then handle one invalid input.</li><li>Refactor your solution for clarity, add tests, and compare performance before and after.</li></ol><button class="primary-small" type="button" data-open-playground>Open practice lab</button></section>
      <section class="detail-section"><h3><i class="ph ph-clipboard-text"></i>Assignment</h3><div class="assignment-card"><b>Build → explain → review</b><p>Produce a working artifact using at least three topics from this milestone. Add setup instructions, assumptions, test evidence, and a 200-word reflection.</p><label><input type="checkbox" data-practice-complete="${index}" ${saved.practice[index] ? "checked" : ""}> Mark assignment complete (+40 XP)</label></div></section>
      <section class="detail-section"><h3><i class="ph ph-question"></i>Revision and interview questions</h3><ol><li>Explain ${escapeHtml(node.topics[0])} to a ten-year-old using a real-world analogy.</li><li>When would you avoid ${escapeHtml(node.topics[1] || node.topics[0])}?</li><li>Describe a production failure this milestone could prevent.</li><li>How would you test the most important behavior here?</li><li>What tradeoff would you discuss with a senior engineer?</li></ol></section>
      <section class="detail-section"><h3><i class="ph ph-notebook"></i>Revision notes</h3><textarea class="notes-area" id="nodeNotes" placeholder="Definitions, commands, diagrams, mistakes, and reminders…">${escapeHtml(saved.notes[index] || "")}</textarea><span class="notes-hint">Saved automatically on this device.</span></section>`;
  }

  function projectIdeas(node) {
    const noun = state.roadmap.label;
    return [
      ["Mini project", `Create a focused ${node.title} demonstration with a clear README and one test.`],
      ["Intermediate project", `Build a usable ${noun} feature combining ${node.topics.slice(0, 3).join(", ")}.`],
      ["Advanced project", `Design a production-minded solution with testing, security, performance evidence, and observability.`],
      ["Portfolio project", `Solve a real user problem, deploy it, measure an outcome, and publish a decision-rich case study.`],
      ["Startup-level project", `Validate a narrow customer problem, ship an MVP, add analytics, and iterate from five user interviews.`],
      ["Open-source contribution", `Find a maintained ${noun} repository, reproduce an issue, propose a scoped fix, and submit a documented pull request.`]
    ];
  }

  function projectsContent() {
    const { node, index } = nodeContext();
    const saved = currentSaved();
    return `<div class="panel-intro"><span class="view-eyebrow">Proof of skill</span><h3>Projects that compound into a portfolio.</h3><p>Each tier raises the ambiguity, quality bar, and communication expected from you.</p></div><div class="project-stack">${projectIdeas(node).map(([title, copy], projectIndex) => { const key = `${index}-${projectIndex}`; return `<article class="project-tier"><div><span>0${projectIndex + 1}</span><h4>${escapeHtml(title)}</h4></div><p>${escapeHtml(copy)}</p><label><input type="checkbox" data-project="${key}" ${saved.projects[key] ? "checked" : ""}> Completed</label></article>`; }).join("")}</div>
      <section class="detail-section"><h3><i class="ph ph-git-branch"></i>Recommended repository structure</h3><pre class="code-block"><code>${slug(node.title)}/\n├── README.md\n├── docs/\n│   ├── architecture.md\n│   └── decisions.md\n├── src/\n├── tests/\n├── assets/\n└── .github/workflows/quality.yml</code></pre></section>`;
  }

  function quizQuestions(node) {
    const topics = node.topics;
    const first = topics[0], second = topics[1] || first, third = topics[2] || first;
    return [
      { q: `Which practice best demonstrates understanding of ${first}?`, options: ["Copying a finished solution", "Building and explaining a small example", "Memorizing a definition only", "Skipping edge cases"], answer: 1 },
      { q: `True or false: ${first} should be used without considering tradeoffs.`, options: ["True", "False"], answer: 1 },
      { q: `What should happen before optimizing ${second}?`, options: ["Measure the current behavior", "Rewrite everything", "Remove tests", "Add more dependencies"], answer: 0 },
      { q: `Which is the strongest evidence of skill in ${third}?`, options: ["A watched playlist", "A copied certificate", "A tested project with decisions documented", "A list of bookmarks"], answer: 2 },
      { q: `A production result differs from local testing. What is the best first step?`, options: ["Guess and deploy again", "Compare logs, inputs, configuration, and environment", "Delete the tests", "Ignore it"], answer: 1 },
      { q: `Fill the blank: Reliable work makes assumptions _____.`, options: ["invisible", "explicit", "permanent", "unimportant"], answer: 1 },
      { q: `Which review question is most useful?`, options: ["Does it look clever?", "What fails, how will we know, and how do we recover?", "Can we avoid documentation?", "Can we skip users?"], answer: 1 },
      { q: `When combining ${first} with ${second}, what protects quality?`, options: ["Small testable increments", "One very large change", "No version control", "Avoiding feedback"], answer: 0 },
      { q: `Which learning loop is strongest?`, options: ["Watch → watch → watch", "Build → test → explain → improve", "Copy → submit", "Read → forget"], answer: 1 },
      { q: `What should a portfolio explanation emphasize?`, options: ["Only the tool names", "The problem, constraints, decisions, evidence, and outcome", "Only screenshots", "Only course duration"], answer: 1 }
    ];
  }

  function quizContent() {
    const { node, index } = nodeContext();
    const savedScore = currentSaved().quizzes[index];
    const questions = quizQuestions(node);
    return `<div class="panel-intro"><span class="view-eyebrow">Knowledge check</span><h3>10 questions · 70% to pass</h3><p>Answers and explanations appear after submission. Your best score is saved.</p></div><form id="nodeQuiz">${questions.map((question, qIndex) => `<fieldset class="quiz-question"><legend>${qIndex + 1}. ${escapeHtml(question.q)}</legend>${question.options.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="q${qIndex}" value="${optionIndex}" required><span>${escapeHtml(option)}</span></label>`).join("")}<input type="hidden" name="a${qIndex}" value="${question.answer}"></fieldset>`).join("")}<button class="quiz-submit" type="submit">Submit knowledge check</button><span class="quiz-result" id="quizResult">${savedScore !== undefined ? `Best: ${savedScore}/10` : ""}</span><div class="answer-review" id="answerReview"></div></form>`;
  }

  function renderPanel(index = state.selectedNode, tab = state.panelTab) {
    if (index === null || !state.roadmap.nodes[index]) return;
    state.selectedNode = index;
    state.panelTab = tab;
    const node = state.roadmap.nodes[index];
    elements.panelStep.textContent = `Milestone ${index + 1} of ${state.roadmap.nodes.length} · ${node.difficulty}`;
    elements.detailTitle.textContent = node.title;
    $$("[data-panel-tab]", elements.panelTabs).forEach(button => button.classList.toggle("active", button.dataset.panelTab === tab));
    const renderers = { learn: learnContent, resources: resourcesContent, practice: practiceContent, projects: projectsContent, quiz: quizContent };
    elements.panelBody.innerHTML = renderers[tab]();
    const completed = isCompleted(index), unlocked = isUnlocked(index);
    elements.panelFooter.innerHTML = completed ? `<button class="complete-button completed" disabled><i class="ph-fill ph-check-circle"></i> Milestone completed · rewards earned</button>` : `<button class="complete-button" id="completeNode" ${unlocked ? "" : "disabled"}><i class="ph-bold ${unlocked ? "ph-check" : "ph-lock-key"}"></i>${unlocked ? "Mark milestone complete" : "Complete the previous milestone first"}</button>`;
    openPanel();
  }

  function openPanel() { elements.panel.classList.add("open"); elements.backdrop.classList.add("open"); elements.panel.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closePanel() { elements.panel.classList.remove("open"); elements.backdrop.classList.remove("open"); elements.panel.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }

  function renderAllViews() {
    renderStudyPlan();
    renderProgressView();
    renderCareerView();
    renderPortfolioView();
    renderPlaygroundView();
    renderCommunityView();
  }

  function studyWeeks() {
    return Math.max(4, Math.ceil(state.preferences.duration / 7));
  }

  function renderStudyPlan() {
    const container = $("#studyView");
    const weeks = studyWeeks();
    const totalHours = state.roadmap.nodes.reduce((sum, node) => sum + node.time, 0);
    const weeklyTarget = Math.ceil(totalHours / weeks);
    const cards = Array.from({ length: weeks }, (_, index) => {
      const node = state.roadmap.nodes[Math.min(Math.floor(index / weeks * state.roadmap.nodes.length), state.roadmap.nodes.length - 1)];
      const next = state.roadmap.nodes[Math.min(Math.floor((index + 1) / weeks * state.roadmap.nodes.length), state.roadmap.nodes.length - 1)];
      const topicA = node.topics[index % node.topics.length];
      const topicB = node.topics[(index + 1) % node.topics.length];
      return `<article class="week-card ${index === 0 ? "current" : ""}"><div class="week-head"><span>Week ${index + 1}</span><b>${Math.min(state.preferences.hours, weeklyTarget)}h target</b></div><h4>${escapeHtml(node.title)}</h4><ul><li><b>Mon</b> Learn ${escapeHtml(topicA)}</li><li><b>Tue</b> Guided practice and notes</li><li><b>Wed</b> Learn ${escapeHtml(topicB)}</li><li><b>Thu</b> Coding exercises and flashcards</li><li><b>Fri</b> ${escapeHtml(next.title)} preview</li><li><b>Sat</b> Project sprint + quiz</li><li class="rest"><b>Sun</b> Revision and rest</li></ul></article>`;
    }).join("");
    container.innerHTML = `<div class="view-heading"><div><span class="view-eyebrow">Adaptive schedule</span><h3>Your ${state.preferences.duration}-day study plan</h3><p>Balanced lessons, active recall, practice, projects, quizzes, and recovery.</p></div><button class="secondary-button" data-regenerate-plan><i class="ph ph-arrows-clockwise"></i> Regenerate</button></div><div class="study-summary"><span><i class="ph ph-calendar"></i><b>${weeks}</b> weeks</span><span><i class="ph ph-clock"></i><b>${state.preferences.hours}</b> hours/week</span><span><i class="ph ph-books"></i><b>${state.roadmap.nodes.length}</b> milestones</span><span><i class="ph ph-hammer"></i><b>${state.roadmap.nodes.length * 2}</b> project sprints</span></div><div class="week-grid">${cards}</div>`;
  }

  function activityValues(range) {
    const counts = { week: 7, month: 12, year: 12 };
    const count = counts[range] || 7;
    const seed = state.store.xp + currentSaved().completed.length * 17;
    return Array.from({ length: count }, (_, index) => 18 + ((seed + index * 29) % 74));
  }

  function renderProgressView(range = "week") {
    const saved = currentSaved();
    const completed = saved.completed.length;
    const quizValues = Object.values(saved.quizzes);
    const quizAverage = quizValues.length ? Math.round(quizValues.reduce((sum, value) => sum + value, 0) / quizValues.length * 10) : 0;
    const projects = Object.values(saved.projects).filter(Boolean).length;
    const hours = saved.hours + completed * 2;
    const labels = range === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : range === "month" ? ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const values = activityValues(range);
    const skills = state.roadmap.nodes.slice(0, 5).map((node, index) => ({ label: node.title, score: isCompleted(index) ? 100 : (saved.quizzes[index] || 0) * 10 }));
    $("#progressView").innerHTML = `<div class="view-heading"><div><span class="view-eyebrow">Learning analytics</span><h3>Your momentum, made visible.</h3><p>Everything updates as you finish lessons, quizzes, practice, and projects.</p></div><select class="panel-select" id="chartRange"><option value="week" ${range === "week" ? "selected" : ""}>This week</option><option value="month" ${range === "month" ? "selected" : ""}>This month</option><option value="year" ${range === "year" ? "selected" : ""}>This year</option></select></div><div class="metric-grid"><article><i class="ph-fill ph-check-circle"></i><span>Roadmap progress</span><b>${Math.round(completed / state.roadmap.nodes.length * 100)}%</b></article><article><i class="ph-fill ph-hammer"></i><span>Projects completed</span><b>${projects}</b></article><article><i class="ph-fill ph-exam"></i><span>Average quiz score</span><b>${quizAverage}%</b></article><article><i class="ph-fill ph-clock"></i><span>Learning hours</span><b>${hours}h</b></article><article><i class="ph-fill ph-fire"></i><span>Current streak</span><b>${state.store.streak}d</b></article></div><div class="analytics-grid"><article class="analytics-card"><div class="card-heading"><h4>Learning activity</h4><span>${range === "week" ? "Last 7 days" : range === "month" ? "Last 12 weeks" : "Last 12 months"}</span></div><div class="activity-chart">${values.map((value, index) => `<span><i style="height:${value}%"></i><b>${labels[index]}</b></span>`).join("")}</div></article><article class="analytics-card"><div class="card-heading"><h4>Skill confidence</h4><span>Quiz + completion signals</span></div><div class="skill-bars">${skills.map(skill => `<div><span>${escapeHtml(skill.label)}<b>${skill.score}%</b></span><i><em style="width:${skill.score}%"></em></i></div>`).join("")}</div></article></div>${renderBadges()}`;
  }

  function renderBadges() {
    const completed = currentSaved().completed.length;
    const projects = Object.values(currentSaved().projects).filter(Boolean).length;
    const badges = [
      ["ph-flag", "First Step", completed >= 1, "Complete one milestone"],
      ["ph-fire", "On a Roll", state.store.streak >= 3, "Reach a 3-day streak"],
      ["ph-hammer", "Project Ship", projects >= 1, "Complete a project"],
      ["ph-exam", "Quiz Ace", Object.values(currentSaved().quizzes).some(score => score >= 9), "Score 9/10 or higher"],
      ["ph-trophy", "Pathfinder", completed === state.roadmap.nodes.length, "Complete the roadmap"]
    ];
    return `<div class="badge-grid">${badges.map(([icon, title, unlocked, copy]) => `<article class="badge-card ${unlocked ? "unlocked" : ""}"><i class="ph-fill ${icon}"></i><div><b>${title}</b><span>${copy}</span></div>${unlocked ? `<em>Unlocked</em>` : `<i class="ph ph-lock-key"></i>`}</article>`).join("")}</div>`;
  }

  function roadmapSkills() { return unique(state.roadmap.nodes.flatMap(node => node.topics)).slice(0, 15); }

  function renderCareerView() {
    const progress = Math.round(currentSaved().completed.length / state.roadmap.nodes.length * 100);
    const skills = roadmapSkills();
    $("#careerView").innerHTML = `<div class="job-hero"><div><span class="view-eyebrow">Career intelligence</span><h3>${escapeHtml(state.roadmap.role)} outlook</h3><p>Indicative ranges vary by company, location, portfolio quality, and experience.</p></div><div class="readiness-ring" style="--score:${progress}"><b>${progress}%</b><span>job ready</span></div></div><div class="salary-grid"><article><span>India</span><b>${escapeHtml(state.roadmap.salaryIndia)}</b><small>indicative annual range</small></article><article><span>United States</span><b>${escapeHtml(state.roadmap.salaryUsa)}</b><small>indicative annual range</small></article><article><span>Remote</span><b>${escapeHtml(state.roadmap.salaryRemote)}</b><small>indicative annual range</small></article><article><span>Current demand</span><b>${escapeHtml(state.roadmap.demand)}</b><small>${state.roadmap.growth}% growth signal</small></article></div><div class="career-grid"><article class="career-card"><h4><i class="ph ph-buildings"></i>Companies hiring this skill</h4><div class="company-list">${state.roadmap.companies.map(company => `<span>${escapeHtml(company)}</span>`).join("")}</div><h4><i class="ph ph-trend-up"></i>Job readiness formula</h4><p>Complete the roadmap, score at least 70% on quizzes, ship three documented projects, and practise project walkthroughs before applying.</p></article><article class="career-card"><h4><i class="ph ph-scan"></i>Skill gap analysis</h4><p>Select skills you already know. Career Compass will prioritize the rest.</p><div class="skill-selector">${skills.map((skill, index) => `<label><input type="checkbox" value="${escapeHtml(skill)}" ${index < currentSaved().completed.length ? "checked" : ""}><span>${escapeHtml(skill)}</span></label>`).join("")}</div><button class="primary-small" id="analyzeSkills">Analyze my gap</button><div class="gap-result" id="gapResult"></div></article></div><div class="interview-card"><div><span class="view-eyebrow">Interview readiness</span><h4>Role-specific preparation kit</h4><p>Fundamentals, project walkthroughs, practical scenarios, behavioral stories, and company-style questions.</p></div><button class="secondary-button" id="generateInterview"><i class="ph ph-microphone-stage"></i>Generate interview set</button><div class="interview-list" id="interviewList"></div></div>`;
  }

  function renderPortfolioView() {
    $("#portfolioView").innerHTML = `<div class="builder-grid"><article class="builder-card"><div class="builder-icon purple"><i class="ph ph-folder-notch-open"></i></div><h3>Portfolio builder</h3><p>Turn completed projects, skills, certificates, and GitHub work into a focused proof-of-skill page.</p><label>Display name<input id="portfolioName" value="Career Compass Learner"></label><label>GitHub profile<input id="githubProfile" placeholder="github.com/your-name"></label><button class="primary-small" id="buildPortfolio">Generate portfolio</button></article><article class="builder-card"><div class="builder-icon blue"><i class="ph ph-file-text"></i></div><h3>ATS resume builder</h3><p>Generate concise bullets using your completed milestones, projects, and measurable achievements.</p><label>Target job<input id="resumeTarget" value="${escapeHtml(state.roadmap.role)}"></label><label>Experience level<select id="resumeExperience"><option>Entry level</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option></select></label><button class="primary-small" id="buildResume">Generate resume</button></article></div><div class="document-preview" id="documentPreview"><div class="empty-document"><i class="ph ph-sparkle"></i><h3>Your generated career document appears here.</h3><p>Career Compass uses your real roadmap progress—never generic filler.</p></div></div>`;
  }

  const CODE_TEMPLATES = {
    html: `<!doctype html>\n<html>\n  <style>body{font-family:system-ui;padding:2rem;background:#111827;color:white}button{padding:.7rem 1rem}</style>\n  <body>\n    <h1>Career Compass Lab</h1>\n    <button onclick="this.textContent='Great work!'">Run interaction</button>\n  </body>\n</html>`,
    javascript: `const skills = ["learn", "build", "explain"];\nconst result = skills.map((skill, index) => \`${"${index + 1}"}. ${"${skill}"}\`);\nconsole.log(result.join("\\n"));`,
    python: `skills = ["learn", "build", "explain"]\nfor index, skill in enumerate(skills, 1):\n    print(f"{index}. {skill}")`,
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Learn. Build. Explain.");\n  }\n}`,
    c: `#include <stdio.h>\nint main(void) {\n  printf("Learn. Build. Explain.\\n");\n  return 0;\n}`,
    cpp: `#include <iostream>\nint main() {\n  std::cout << "Learn. Build. Explain." << std::endl;\n  return 0;\n}`,
    node: `const roadmap = { goal: "job-ready", next: "build a project" };\nconsole.log(JSON.stringify(roadmap, null, 2));`
  };

  function renderPlaygroundView() {
    $("#playgroundView").innerHTML = `<div class="playground-shell"><div class="playground-toolbar"><div><span class="view-eyebrow">Practice lab</span><h3>Multi-language coding playground</h3></div><div><select id="languageSelect"><option value="html">HTML/CSS/JavaScript</option><option value="javascript">JavaScript</option><option value="python">Python</option><option value="java">Java</option><option value="c">C</option><option value="cpp">C++</option><option value="node">Node.js</option></select><button class="run-button" id="runCode"><i class="ph-fill ph-play"></i>Run</button></div></div><div class="editor-grid"><div class="editor-pane"><div class="pane-label"><span>main.<b id="fileExtension">html</b></span><button id="resetCode"><i class="ph ph-arrow-counter-clockwise"></i></button></div><textarea id="codeEditor" spellcheck="false">${escapeHtml(CODE_TEMPLATES.html)}</textarea></div><div class="output-pane"><div class="pane-label"><span>Output</span><span id="runStatus">Ready</span></div><iframe id="playgroundFrame" title="Code output" sandbox="allow-scripts"></iframe><pre id="consoleOutput" hidden></pre></div></div><p class="runner-note"><i class="ph ph-info"></i>HTML and JavaScript run locally in the browser. Python, Java, C, C++, and Node use a configurable secure runner adapter in production.</p></div>`;
  }

  function defaultPosts() {
    return [
      { name: "Maya S.", text: `Finished my first ${state.roadmap.label} mini project today. Writing the README exposed two assumptions I had missed.`, time: "18 min", likes: 24 },
      { name: "Arjun K.", text: `Study group for ${state.roadmap.role} interview practice this Saturday—project walkthroughs and peer feedback.`, time: "1 hr", likes: 17 }
    ];
  }

  function renderCommunityView() {
    const posts = [...state.store.posts.slice(-5).reverse(), ...defaultPosts()];
    $("#communityView").innerHTML = `<div class="community-layout"><div><div class="view-heading"><div><span class="view-eyebrow">Learn in public</span><h3>Your learning community</h3><p>Share progress, ask focused questions, review projects, and find accountability.</p></div></div><form class="post-composer" id="postForm"><span class="avatar-ring"><i class="ph-fill ph-user"></i></span><input id="postInput" required maxlength="280" placeholder="Share a win or ask a focused question…"><button type="submit">Post</button></form><div class="community-feed">${posts.map(post => `<article><div class="post-head"><span class="avatar-ring">${escapeHtml(post.name[0])}</span><div><b>${escapeHtml(post.name)}</b><small>${escapeHtml(post.time)} ago</small></div></div><p>${escapeHtml(post.text)}</p><div><button><i class="ph ph-heart"></i>${post.likes}</button><button><i class="ph ph-chat-circle"></i>Reply</button><button><i class="ph ph-bookmark-simple"></i>Save</button></div></article>`).join("")}</div></div><aside><article class="community-card"><h4>Study groups</h4>${["Daily 60-minute focus", `${state.roadmap.label} project lab`, "Interview accountability"].map((group, index) => `<div class="group-row"><span><b>${escapeHtml(group)}</b><small>${18 + index * 11} learners online</small></span><button>Join</button></div>`).join("")}</article><article class="community-card"><h4>Weekly leaderboard</h4>${["Aanya", "Rohan", "Sofia", "You"].map((name, index) => `<div class="leader-row"><b>${index + 1}</b><span>${name}</span><em>${1240 - index * 180} XP</em></div>`).join("")}</article></aside></div>`;
  }

  function switchView(view) {
    state.view = view;
    $$("[data-view]", elements.tabs).forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $$("[data-view-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  }

  function addReward(xp, coins, title = "Progress earned", message = "Your consistent work is compounding.") {
    state.store.xp += xp;
    state.store.coins += coins;
    saveStore();
    renderPlayer();
    elements.rewardTitle.textContent = title;
    elements.rewardMessage.textContent = `${message} +${xp} XP · +${coins} coins`;
    elements.reward.classList.add("open");
    elements.reward.setAttribute("aria-hidden", "false");
  }

  function completeSelectedNode() {
    const index = state.selectedNode;
    if (index === null || !isUnlocked(index) || isCompleted(index)) return;
    const saved = currentSaved();
    saved.completed.push(index);
    saved.completed = unique(saved.completed).sort((a, b) => a - b);
    saved.hours += Math.max(1, Math.round(state.roadmap.nodes[index].time * .15));
    saveStore();
    renderFlow();
    updateProgress();
    renderAllViews();
    renderPanel(index);
    const finished = saved.completed.length === state.roadmap.nodes.length;
    addReward(finished ? 500 : 100, finished ? 150 : 25, finished ? "Roadmap mastered" : index === 0 ? "First milestone" : "Milestone complete", finished ? "Your certificate, completion badge, and Pathfinder achievement are now unlocked." : "The next milestone is now unlocked.");
  }

  function showToast(message, type = "") {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { elements.toast.className = "toast"; }, 3200);
  }

  function continueLearning() {
    const next = state.roadmap.nodes.findIndex((_, index) => !isCompleted(index));
    switchView("roadmap");
    renderPanel(next === -1 ? state.roadmap.nodes.length - 1 : next);
  }

  function resetProgress() {
    delete state.store.roadmaps[state.key];
    saveStore();
    elements.resetDialog.classList.remove("open");
    closePanel();
    renderFlow(); updateProgress(); renderAllViews();
    showToast("Roadmap progress reset. Your global XP and streak remain intact.");
  }

  function handleGenerate(event) {
    event.preventDefault();
    const match = findRoadmap(elements.input.value);
    if (!match) { showToast("Choose a suggested career or technology from the catalog."); elements.input.focus(); return; }
    generateRoadmap(match.id);
  }

  function downloadNotes() {
    const { node, index } = nodeContext();
    const content = `${state.roadmap.label} — ${node.title}\n\nTopics\n${node.topics.map(item => `- ${item}`).join("\n")}\n\nLearning outcomes\n${outcomeList(node).map(item => `- ${item}`).join("\n")}\n\nMy notes\n${currentSaved().notes[index] || "No personal notes yet."}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slug(state.roadmap.label)}-${slug(node.title)}-notes.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function submitQuiz(form) {
    const data = new FormData(form);
    const questions = quizQuestions(nodeContext().node);
    let score = 0;
    const explanations = questions.map((question, index) => {
      const correct = Number(data.get(`q${index}`)) === question.answer;
      if (correct) score++;
      return `<li class="${correct ? "correct" : "incorrect"}"><i class="ph-fill ${correct ? "ph-check-circle" : "ph-x-circle"}"></i><span><b>Question ${index + 1}</b>${correct ? "Correct" : `Correct answer: ${escapeHtml(question.options[question.answer])}`}</span></li>`;
    });
    const saved = currentSaved();
    const oldScore = saved.quizzes[state.selectedNode] || 0;
    saved.quizzes[state.selectedNode] = Math.max(oldScore, score);
    saveStore();
    $("#quizResult").textContent = `${score}/10 · ${score >= 7 ? "Passed" : "Review and retry"}`;
    $("#answerReview").innerHTML = `<h4>Answer review</h4><ul>${explanations.join("")}</ul>`;
    if (score > oldScore) addReward(score * 10, score >= 7 ? 20 : 5, score >= 9 ? "Quiz ace" : "Knowledge checked", score >= 7 ? "You passed the milestone knowledge check." : "You found the exact gaps to revise next.");
    renderFlow();
  }

  function analyzeSkillGap() {
    const selected = $$("#careerView .skill-selector input:checked").map(input => input.value);
    const skills = roadmapSkills();
    const missing = skills.filter(skill => !selected.includes(skill));
    const hours = state.roadmap.nodes.filter(node => node.topics.some(topic => missing.includes(topic))).reduce((sum, node) => sum + node.time, 0);
    $("#gapResult").innerHTML = missing.length ? `<h5>${missing.length} priority gaps · about ${hours} focused hours</h5><ol>${missing.slice(0, 8).map((skill, index) => `<li><b>P${index + 1}</b>${escapeHtml(skill)}</li>`).join("")}</ol><p>Start with the earliest unlocked milestone containing these skills; later skills depend on it.</p>` : `<div class="gap-complete"><i class="ph-fill ph-seal-check"></i><b>No selected skill gaps</b><span>Validate your confidence with the quizzes and portfolio projects.</span></div>`;
  }

  function generateInterviewSet() {
    const nodes = state.roadmap.nodes;
    const companies = state.roadmap.companies;
    $("#interviewList").innerHTML = `<article><span>Fundamentals</span><p>Explain ${escapeHtml(nodes[0].topics[0])}, its tradeoffs, and one failure mode.</p></article><article><span>Project walkthrough</span><p>Describe a ${escapeHtml(state.roadmap.label)} project using problem → constraints → decisions → evidence → outcome.</p></article><article><span>Scenario</span><p>A production issue appears after a release. Show how you would isolate, communicate, fix, and prevent it.</p></article><article><span>System thinking</span><p>Design a small but reliable feature using ${escapeHtml(nodes[Math.floor(nodes.length / 2)].topics.slice(0, 2).join(" and "))}.</p></article><article><span>${escapeHtml(companies[0])}-style behavioral</span><p>Tell me about a time you changed your approach after evidence contradicted your assumption.</p></article>`;
  }

  function buildPortfolio() {
    const name = $("#portfolioName").value.trim() || "Career Compass Learner";
    const github = $("#githubProfile").value.trim();
    const completedNodes = currentSaved().completed.map(index => state.roadmap.nodes[index]);
    const projects = Object.values(currentSaved().projects).filter(Boolean).length;
    $("#documentPreview").innerHTML = `<article class="portfolio-document"><header><div><span>${escapeHtml(name)}</span><h2>${escapeHtml(state.roadmap.role)}</h2><p>I build thoughtful ${escapeHtml(state.roadmap.label)} solutions and communicate the decisions behind them.</p></div><i class="ph ph-compass"></i></header><section><h3>Demonstrated skills</h3><div class="concept-grid">${unique(completedNodes.flatMap(node => node.topics)).map(skill => `<span>${escapeHtml(skill)}</span>`).join("") || "Complete a milestone to add verified skills."}</div></section><section><h3>Selected work</h3>${completedNodes.slice(-3).map(node => `<div class="portfolio-project"><b>${escapeHtml(node.title)} capstone</b><p>Applied ${escapeHtml(node.topics.slice(0, 3).join(", "))}; documented constraints, tests, and improvements.</p></div>`).join("") || `<p>Complete a roadmap milestone and its project track to populate this section.</p>`}</section><footer><span>${projects} project tiers completed</span><span>${escapeHtml(github || "Add GitHub to show your repositories")}</span></footer></article>`;
  }

  function buildResume() {
    const target = $("#resumeTarget").value.trim() || state.roadmap.role;
    const experience = $("#resumeExperience").value;
    const completedNodes = currentSaved().completed.map(index => state.roadmap.nodes[index]);
    const skills = unique(completedNodes.flatMap(node => node.topics));
    $("#documentPreview").innerHTML = `<article class="resume-document"><header><h2>Career Compass Learner</h2><b>${escapeHtml(target)} · ${escapeHtml(experience)}</b></header><section><h3>Professional summary</h3><p>${escapeHtml(target)} candidate with hands-on evidence across ${escapeHtml(skills.slice(0, 5).join(", ") || state.roadmap.nodes[0].topics.slice(0, 3).join(", "))}. Builds testable solutions, documents technical decisions, and improves work from feedback.</p></section><section><h3>Core skills</h3><p>${escapeHtml(skills.join(" · ") || "Complete milestones to populate verified skills")}</p></section><section><h3>Project experience</h3>${completedNodes.slice(-3).map(node => `<div><b>${escapeHtml(node.title)} Project</b><ul><li>Designed and implemented a focused solution using ${escapeHtml(node.topics.slice(0, 3).join(", "))}.</li><li>Added test evidence, documentation, edge-case handling, and a measurable improvement loop.</li></ul></div>`).join("") || `<p>Complete project milestones to generate evidence-based bullets.</p>`}</section><section><h3>Learning & credentials</h3><p>Career Compass ${escapeHtml(state.roadmap.label)} pathway · ${currentSaved().completed.length}/${state.roadmap.nodes.length} milestones · ${state.store.xp} XP</p></section></article>`;
  }

  async function runPlayground() {
    const language = $("#languageSelect").value;
    const code = $("#codeEditor").value;
    const frame = $("#playgroundFrame");
    const output = $("#consoleOutput");
    $("#runStatus").textContent = "Running…";
    if (language === "html") {
      output.hidden = true; frame.hidden = false; frame.srcdoc = code;
      $("#runStatus").textContent = "Rendered";
    } else if (language === "javascript" || language === "node") {
      frame.hidden = true; output.hidden = false;
      const logs = [];
      try {
        const localConsole = { log: (...args) => logs.push(args.map(String).join(" ")), error: (...args) => logs.push(`Error: ${args.join(" ")}`) };
        Function("console", `"use strict";\n${code}`)(localConsole);
        output.textContent = logs.join("\n") || "Program completed with no console output.";
        $("#runStatus").textContent = "Completed";
      } catch (error) { output.textContent = `${error.name}: ${error.message}`; $("#runStatus").textContent = "Error"; }
    } else if (window.CAREER_COMPASS_RUNNER_URL) {
      frame.hidden = true; output.hidden = false;
      try {
        const response = await fetch(window.CAREER_COMPASS_RUNNER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language, source: code }) });
        if (!response.ok) throw new Error(`Runner responded with ${response.status}`);
        const result = await response.json();
        output.textContent = result.output || result.stdout || result.stderr || "Program completed with no output.";
        $("#runStatus").textContent = result.exitCode ? `Exited ${result.exitCode}` : "Completed";
      } catch (error) { output.textContent = `Runner error: ${error.message}`; $("#runStatus").textContent = "Error"; }
    } else {
      frame.hidden = true; output.hidden = false;
      output.textContent = `Secure ${language.toUpperCase()} runner adapter\n\nCode accepted (${code.split("\n").length} lines). Configure window.CAREER_COMPASS_RUNNER_URL to connect your isolated compiler service. The browser never executes native code directly.`;
      $("#runStatus").textContent = "Runner hook ready";
    }
  }

  function openCertificate() {
    if (currentSaved().completed.length !== state.roadmap.nodes.length) { showToast("Complete every milestone to unlock your verified certificate."); return; }
    $("#certificateName").textContent = $("#portfolioName")?.value || "Career Compass Learner";
    $("#certificateRoadmap").textContent = `${state.roadmap.label} Professional Roadmap`;
    $("#certificateDate").textContent = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date());
    $("#certificateId").textContent = `Credential CC-${state.roadmap.id.toUpperCase().slice(0, 8)}-${String(state.store.xp).padStart(5, "0")}`;
    elements.certificateModal.classList.add("open");
    elements.certificateModal.setAttribute("aria-hidden", "false");
  }

  function initSidebar() {
    const sidebar = $("#sidebar"), toggle = $("#sidebarToggle"), overlay = $("#sidebarOverlay");
    const setOpen = open => { sidebar?.classList.toggle("open", open); overlay?.classList.toggle("visible", open); toggle?.setAttribute("aria-expanded", String(open)); };
    toggle?.addEventListener("click", () => setOpen(!sidebar.classList.contains("open")));
    overlay?.addEventListener("click", () => setOpen(false));
    return setOpen;
  }

  function bindEvents(setSidebarOpen) {
    elements.form.addEventListener("submit", handleGenerate);
    elements.input.addEventListener("input", event => { state.pendingId = null; renderSuggestions(event.target.value); });
    document.addEventListener("click", event => {
      const select = event.target.closest("[data-select-roadmap]");
      if (select) { selectRoadmap(select.dataset.selectRoadmap); if (select.closest(".catalog-card")) generateRoadmap(select.dataset.selectRoadmap); return; }
      if (!event.target.closest(".roadmap-search")) renderSuggestions("");
    });
    elements.category.addEventListener("change", renderCatalog);
    elements.sort.addEventListener("change", renderCatalog);
    elements.tabs.addEventListener("click", event => { const button = event.target.closest("[data-view]"); if (button) switchView(button.dataset.view); });
    elements.flow.addEventListener("click", event => { const node = event.target.closest("[data-node]"); if (node) renderPanel(Number(node.dataset.node), "learn"); });
    $(".flow-controls").addEventListener("click", event => { const button = event.target.closest("[data-flow]"); if (!button) return; state.flow = button.dataset.flow; $$("[data-flow]").forEach(item => item.classList.toggle("active", item === button)); renderFlow(); });
    elements.panelTabs.addEventListener("click", event => { const button = event.target.closest("[data-panel-tab]"); if (button) renderPanel(state.selectedNode, button.dataset.panelTab); });
    elements.closePanel.addEventListener("click", closePanel);
    elements.backdrop.addEventListener("click", closePanel);
    elements.continueButton.addEventListener("click", continueLearning);
    elements.resetButton.addEventListener("click", () => elements.resetDialog.classList.add("open"));
    elements.cancelReset.addEventListener("click", () => elements.resetDialog.classList.remove("open"));
    elements.confirmReset.addEventListener("click", resetProgress);
    elements.certificateButton.addEventListener("click", openCertificate);
    elements.closeCertificate.addEventListener("click", () => elements.certificateModal.classList.remove("open"));
    $("#printCertificate").addEventListener("click", () => window.print());
    $("#shareCertificate").addEventListener("click", async () => { const text = `I completed the ${state.roadmap.label} roadmap on Career Compass Pro.`; if (navigator.share) await navigator.share({ title: "Career Compass Certificate", text }); else { await navigator.clipboard.writeText(text); showToast("Credential message copied.", "success"); } });
    elements.closeReward.addEventListener("click", () => elements.reward.classList.remove("open"));

    elements.panelBody.addEventListener("click", event => {
      const flashcard = event.target.closest(".flashcard"); if (flashcard) flashcard.classList.toggle("revealed");
      if (event.target.closest("[data-download-notes]")) downloadNotes();
      if (event.target.closest("[data-open-playground]")) { closePanel(); switchView("playground"); elements.workspace.scrollIntoView({ behavior: "smooth" }); }
    });
    elements.panelBody.addEventListener("input", event => { if (event.target.id === "nodeNotes") { currentSaved().notes[state.selectedNode] = event.target.value; saveStore(); } });
    elements.panelBody.addEventListener("change", event => {
      if (event.target.matches("[data-project]")) { const was = currentSaved().projects[event.target.dataset.project]; currentSaved().projects[event.target.dataset.project] = event.target.checked; saveStore(); if (event.target.checked && !was) addReward(75, 20, "Project shipped", "Proof of skill added to your portfolio."); }
      if (event.target.matches("[data-practice-complete]")) { const key = event.target.dataset.practiceComplete; const was = currentSaved().practice[key]; currentSaved().practice[key] = event.target.checked; saveStore(); if (event.target.checked && !was) addReward(40, 10, "Practice complete", "Active recall strengthens this milestone."); }
    });
    elements.panelBody.addEventListener("submit", event => { if (event.target.id === "nodeQuiz") { event.preventDefault(); submitQuiz(event.target); } });
    elements.panelFooter.addEventListener("click", event => { if (event.target.closest("#completeNode")) completeSelectedNode(); });

    elements.workspace.addEventListener("click", event => {
      if (event.target.closest("[data-regenerate-plan]")) { renderStudyPlan(); showToast("Study plan regenerated around your current preferences.", "success"); }
      if (event.target.closest("#analyzeSkills")) analyzeSkillGap();
      if (event.target.closest("#generateInterview")) generateInterviewSet();
      if (event.target.closest("#buildPortfolio")) buildPortfolio();
      if (event.target.closest("#buildResume")) buildResume();
      if (event.target.closest("#runCode")) runPlayground();
      if (event.target.closest("#resetCode")) { const language = $("#languageSelect").value; $("#codeEditor").value = CODE_TEMPLATES[language]; }
      const join = event.target.closest(".group-row button"); if (join) { join.textContent = join.textContent === "Joined" ? "Join" : "Joined"; join.classList.toggle("joined"); }
    });
    elements.workspace.addEventListener("change", event => {
      if (event.target.id === "chartRange") renderProgressView(event.target.value);
      if (event.target.id === "languageSelect") { $("#codeEditor").value = CODE_TEMPLATES[event.target.value]; $("#fileExtension").textContent = event.target.value === "javascript" ? "js" : event.target.value === "node" ? "js" : event.target.value; }
    });
    elements.workspace.addEventListener("submit", event => { if (event.target.id === "postForm") { event.preventDefault(); const input = $("#postInput"); state.store.posts.push({ name: "You", text: input.value.trim(), time: "Just now", likes: 0 }); saveStore(); renderCommunityView(); } });
    document.addEventListener("keydown", event => { if (event.key !== "Escape") return; if (elements.certificateModal.classList.contains("open")) elements.certificateModal.classList.remove("open"); else if (elements.reward.classList.contains("open")) elements.reward.classList.remove("open"); else if (elements.resetDialog.classList.contains("open")) elements.resetDialog.classList.remove("open"); else if (elements.panel.classList.contains("open")) closePanel(); else setSidebarOpen(false); });
  }

  function showLoadError(error) {
    elements.catalog.innerHTML = `<div class="load-error"><i class="ph ph-warning-circle"></i><h3>The roadmap catalog could not load.</h3><p>${escapeHtml(error.message)}. Run Career Compass through its local server with <code>npm start</code>; browsers block modular JSON when HTML is opened directly from disk.</p><button class="primary-small" onclick="location.reload()">Try again</button></div>`;
    elements.chips.innerHTML = "";
  }

  async function init() {
    cacheElements();
    updateStreak();
    const setSidebarOpen = initSidebar();
    bindEvents(setSidebarOpen);
    try {
      await loadCatalog();
      const params = new URLSearchParams(location.search);
      const topic = params.get("topic");
      if (topic) {
        const match = findRoadmap(topic);
        if (match) {
          selectRoadmap(match.id);
          generateRoadmap(match.id, { noScroll: true });
          const requestedNode = Number(params.get("node"));
          const requestedTab = ["learn", "resources", "practice", "projects", "quiz"].includes(params.get("tab")) ? params.get("tab") : "learn";
          if (params.has("node") && Number.isInteger(requestedNode) && requestedNode >= 0 && requestedNode < state.roadmap.nodes.length) renderPanel(requestedNode, requestedTab);
        }
      }
    } catch (error) { showLoadError(error); }
    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
