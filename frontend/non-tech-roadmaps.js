(function () {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const LEGACY_STORE_KEY = "careerCompassNonTechProgressV1";
  const META_STORE_KEY = "careerCompassNonTechMetaV2";
  const careers = window.NON_TECH_ROADMAPS || [];
  const state = { career: null, module: 0, topic: 0, detailTab: "learn", flow: "vertical", filter: "All", store: loadStore() };
  const els = {};

  function loadStore() {
    let legacy = {};
    let meta = {};
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_STORE_KEY) || "{}"); } catch { legacy = {}; }
    try { meta = JSON.parse(localStorage.getItem(META_STORE_KEY) || "{}"); } catch { meta = {}; }
    return { streak: meta.streak || legacy.streak || 1, lastActive: meta.lastActive || legacy.lastActive || "", careers: legacy.careers || {} };
  }
  function careerStoreKey(id) { return `careerCompass_nonTech_${id}`; }
  function defaultProgress() { return { topics: [], quizzes: [], hours: 0, projects: [], notes: {}, started: new Date().toISOString() }; }
  function loadCareerProgress(id) {
    try { return { ...defaultProgress(), ...JSON.parse(localStorage.getItem(careerStoreKey(id)) || "{}") }; }
    catch { return { ...defaultProgress(), ...(state.store.careers[id] || {}) }; }
  }
  function save() {
    localStorage.setItem(META_STORE_KEY, JSON.stringify({ streak: state.store.streak, lastActive: state.store.lastActive }));
    if (state.career) localStorage.setItem(careerStoreKey(state.career.id), JSON.stringify(progress()));
  }
  function progress() {
    if (!state.store.careers[state.career.id]) state.store.careers[state.career.id] = loadCareerProgress(state.career.id);
    const current = state.store.careers[state.career.id];
    current.notes ||= {};
    current.projects ||= [];
    current.quizzes ||= [];
    current.topics ||= [];
    return current;
  }
  function key(mi, ti) { return `${mi}:${ti}`; }
  function topicDone(mi, ti) { return progress().topics.includes(key(mi, ti)); }
  function moduleDone(mi) { return state.career.modules[mi].topics.every((_, ti) => topicDone(mi, ti)); }
  function moduleUnlocked(mi) { return mi === 0 || moduleDone(mi - 1); }
  function modulePercent(mi) { const topics = state.career.modules[mi].topics; return Math.round(topics.filter((_, ti) => topicDone(mi, ti)).length / topics.length * 100); }
  function overallPercent() { const total = state.career.modules.reduce((sum, m) => sum + m.topics.length, 0); return Math.round(progress().topics.length / total * 100); }
  function totalHours() { return state.career.modules.reduce((sum, m) => sum + m.time, 0); }
  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10); if (state.store.lastActive === today) return;
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    state.store.streak = state.store.lastActive === yesterday ? (state.store.streak || 0) + 1 : 1; state.store.lastActive = today; save();
  }
  function cache() {
    ["fieldGate", "chooseNonTech", "catalogSection", "careerCount", "careerSearch", "categoryFilter", "difficultyFilter", "durationFilter", "salaryFilter", "sortFilter", "categoryChips", "careerGrid", "workspace", "backToCatalog", "careerIcon", "careerCategory", "careerTitle", "careerDescription", "careerTags", "scoreRing", "roadmapPercent", "readinessScore", "workspaceTabs", "flowchart", "guideView", "dashboardView", "projectsView", "quizView", "mentorView", "compareView", "certificateView", "topicDrawer", "drawerBackdrop", "closeDrawer", "drawerStage", "drawerTitle", "drawerMeta", "drawerTabs", "drawerBody", "drawerFooter", "toast", "mobileMenu"].forEach(id => els[id] = document.getElementById(id));
  }
  function showToast(message) { els.toast.textContent = message; els.toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2400); }
  function showCatalog(scroll = true) { els.fieldGate.hidden = true; els.workspace.hidden = true; els.catalogSection.hidden = false; renderCatalog(); if (scroll) els.catalogSection.scrollIntoView({ behavior: "smooth" }); }

  function populateFilters() {
    els.careerCount.textContent = careers.length;
    els.categoryFilter.innerHTML = `<option value="All">All categories</option>${window.NON_TECH_CATEGORIES.map(c => `<option>${escapeHtml(c)}</option>`).join("")}`;
    els.categoryChips.innerHTML = ["All", ...window.NON_TECH_CATEGORIES].map(c => `<button class="${c === "All" ? "active" : ""}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("");
  }
  function renderCatalog() {
    const query = els.careerSearch.value.trim().toLowerCase();
    let items = careers.filter(c => {
      const text = [
        c.name, c.title, c.category, c.description, c.detailedDescription,
        ...(c.roles || []), ...(c.tools || []), ...(c.skillsToLearn || []), ...(c.industries || []),
        ...c.modules.flatMap(m => m.topics.map(t => t.title))
      ].join(" ").toLowerCase();
      const durationMatch = String(c.duration).match(/(\d+)(?:\s*-\s*(\d+))?/);
      const durationMonths = durationMatch ? Number(durationMatch[2] || durationMatch[1]) : 6;
      return (state.filter === "All" || c.category === state.filter) && (!query || text.includes(query)) && (els.difficultyFilter.value === "All" || c.difficulty === els.difficultyFilter.value) && (els.durationFilter.value === "All" || (els.durationFilter.value === "short" ? durationMonths < 9 : durationMonths >= 9)) && (els.salaryFilter.value === "All" || /12|growing|high/i.test(`${c.salary} ${c.demand}`));
    });
    if (els.sortFilter.value === "popular") items.sort((a, b) => b.popularity - a.popularity); else if (els.sortFilter.value === "az") items.sort((a, b) => a.name.localeCompare(b.name)); else items.sort((a, b) => a.duration.localeCompare(b.duration));
    els.careerGrid.innerHTML = items.length ? items.map(c => {
      const skills = c.modules.slice(1, 4).map(m => m.title);
      return `<article class="career-card"><div class="card-top"><span class="card-icon"><i class="ph ${escapeHtml(c.icon)}"></i></span>${c.popularity >= 94 ? `<span class="popular-badge"><i class="ph-fill ph-fire"></i> Popular</span>` : ""}</div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description)}</p><div class="card-meta"><span><i class="ph ph-clock"></i>${escapeHtml(c.duration)}</span><span><i class="ph ph-path"></i>${c.modules.length} modules</span><span><i class="ph ph-student"></i>${escapeHtml(c.difficulty)}</span></div><div class="card-skills">${skills.map(s => `<span>${escapeHtml(s)}</span>`).join("")}</div><button data-career="${c.id}">View complete roadmap <i class="ph ph-arrow-right"></i></button></article>`;
    }).join("") : `<div class="empty-state"><i class="ph ph-magnifying-glass" style="font-size:38px"></i><h3>No careers match these filters</h3><p>Try another category or clear your search.</p></div>`;
  }

  function selectCareer(id) {
    state.career = careers.find(c => c.id === id); if (!state.career) return;
    state.store.careers[id] = loadCareerProgress(id);
    updateStreak(); localStorage.setItem("careerCompassLastNonTechCareer", id);
    els.catalogSection.hidden = true; els.fieldGate.hidden = true; els.workspace.hidden = false;
    els.careerIcon.innerHTML = `<i class="ph ${escapeHtml(state.career.icon)}"></i>`; els.careerCategory.textContent = state.career.category; els.careerTitle.textContent = `${state.career.name} Career Roadmap`; els.careerDescription.textContent = state.career.description;
    const firstRole = state.career.jobRoles?.[0];
    const salarySummary = firstRole ? `${firstRole.role}: ${firstRole.fresherSalary}` : state.career.salary;
    els.careerTags.innerHTML = `<span><i class="ph ph-clock"></i> ${escapeHtml(state.career.duration)}</span><span><i class="ph ph-books"></i> ${state.career.modules.length} modules</span><span><i class="ph ph-timer"></i> ${totalHours()} guided hours</span><span><i class="ph ph-currency-inr"></i> ${escapeHtml(salarySummary)}</span>`;
    switchView("roadmap"); renderAll(); els.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function status(mi) { return moduleDone(mi) ? ["completed", "Completed", "ph-check-circle"] : moduleUnlocked(mi) ? ["current", mi ? "Unlocked" : "Start here", "ph-play-circle"] : ["locked", "Locked", "ph-lock-key"]; }
  function renderFlow() {
    els.flowchart.className = `flowchart ${state.flow === "branch" ? "branch" : ""}`;
    els.flowchart.innerHTML = state.career.modules.map((m, mi) => {
      const [className, label, icon] = status(mi), percent = modulePercent(mi), previous = mi ? state.career.modules[mi - 1].title : "No prerequisite";
      return `<div class="flow-item">${mi ? `<div class="flow-connector"></div>` : ""}<article class="flow-module ${className}" data-module-card="${mi}"><button class="module-button" data-expand="${mi}" ${className === "locked" ? "disabled" : ""}><div class="module-top"><span class="stage-number">${m.stage ? `STAGE ${m.stage}` : `DOMAIN MODULE ${String(mi - 1).padStart(2, "0")}`} · ${escapeHtml(m.branch)}</span><span class="status-pill"><i class="ph-fill ${icon}"></i> ${label}</span></div><h3>${escapeHtml(m.title)}</h3><span class="module-summary">${m.topics.length} topics · ${m.time} hours · ${escapeHtml(m.difficulty)}</span><div class="module-progress"><i style="width:${percent}%"></i></div><div class="module-bottom"><div><span class="badge"><i class="ph ph-lock-open"></i> Prerequisite: ${escapeHtml(previous)}</span>${m.project ? `<span class="badge project"><i class="ph ph-folder"></i> Project</span>` : ""}</div><b>${percent}%</b></div></button><div class="topic-tree">${m.topics.map((t, ti) => `<div class="topic-row"><button class="topic-open ${topicDone(mi, ti) ? "done" : ""}" data-topic="${mi}:${ti}"><span><i class="ph-fill ${topicDone(mi, ti) ? "ph-check-circle" : "ph-circle"}"></i> ${escapeHtml(t.title)}</span><small>${t.subtopics.length ? `${t.subtopics.length} nested lessons` : "Theory · practice · quiz"} <i class="ph ph-caret-right"></i></small></button>${t.subtopics.length ? `<div class="subtopic-list">${t.subtopics.map((sub, si) => `<button data-topic="${mi}:${ti}" data-subtopic="${si}">${escapeHtml(sub)}</button>`).join("")}</div>` : ""}</div>`).join("")}</div></article></div>`;
    }).join("") + `<div class="flow-connector"></div><div class="status-pill"><i class="ph-fill ph-flag-checkered"></i> Job-ready finish line</div>`;
  }
  function updateHeader() { const p = overallPercent(); els.roadmapPercent.textContent = `${p}%`; els.scoreRing.style.setProperty("--value", p); els.readinessScore.textContent = Math.min(100, 12 + Math.round(p * .88)); }
  function renderAll() { renderFlow(); updateHeader(); renderGuide(); renderDashboard(); renderProjects(); renderQuiz(); renderMentor(); renderCompare(); renderCertificate(); }

  function hasItems(items) { return Array.isArray(items) && items.length > 0; }
  function chipList(items) { return hasItems(items) ? `<div class="concepts">${items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""; }
  function bulletList(items) { return hasItems(items) ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""; }
  function guideCard(title, body, icon = "ph-info") {
    return body ? `<article class="guide-card"><h3><i class="ph ${icon}"></i>${escapeHtml(title)}</h3>${body}</article>` : "";
  }
  function renderGuide() {
    const c = state.career;
    const projectGroups = [
      ["Beginner projects", c.beginnerProjects],
      ["Intermediate projects", c.intermediateProjects],
      ["Advanced projects", c.advancedProjects]
    ].filter(([, items]) => hasItems(items));
    const sections = [
      guideCard("Course overview", `<p>${escapeHtml(c.detailedDescription || c.description)}</p><p class="salary-note">${escapeHtml(c.salary || "")}</p>`, "ph-compass"),
      guideCard("Who should choose this career", bulletList(c.suitableFor), "ph-user-focus"),
      guideCard("Eligibility", bulletList(c.eligibility), "ph-check-square"),
      guideCard("Required skills", chipList(c.requiredSkills), "ph-sparkle"),
      guideCard("Skills to learn", chipList(c.skillsToLearn), "ph-student"),
      guideCard("Tools to practise", chipList(c.tools), "ph-toolbox"),
      hasItems(c.roadmap) ? `<article class="guide-card guide-wide"><h3><i class="ph ph-path"></i>Step-by-step roadmap</h3><div class="phase-list">${c.roadmap.map(phase => `<section><b>Phase ${escapeHtml(phase.phase)}: ${escapeHtml(phase.title)}</b><small>${escapeHtml(phase.duration)}</small><p>${escapeHtml(phase.description)}</p>${chipList(phase.topics)}${bulletList(phase.practicalTasks)}<em>${escapeHtml(phase.milestone)}</em></section>`).join("")}</div></article>` : "",
      projectGroups.length ? `<article class="guide-card guide-wide"><h3><i class="ph ph-folder-open"></i>Projects</h3><div class="guide-columns">${projectGroups.map(([title, items]) => `<section><h4>${escapeHtml(title)}</h4>${bulletList(items)}</section>`).join("")}</div></article>` : "",
      guideCard("Certifications", bulletList(c.certifications), "ph-certificate"),
      hasItems(c.jobRoles) ? `<article class="guide-card guide-wide"><h3><i class="ph ph-briefcase"></i>Job roles and salary ranges</h3><div class="job-role-grid">${c.jobRoles.map(item => `<section><h4>${escapeHtml(item.role)}</h4><p>${escapeHtml(item.description)}</p>${chipList(item.requiredSkills)}<p><b>Fresher:</b> ${escapeHtml(item.fresherSalary)}<br><b>Experienced:</b> ${escapeHtml(item.experiencedSalary)}</p></section>`).join("")}</div><p class="salary-note">Salary may vary by city, company, experience and skill level.</p></article>` : "",
      guideCard("Industries", chipList(c.industries), "ph-buildings"),
      guideCard("Higher study options", bulletList(c.higherStudyOptions), "ph-graduation-cap"),
      guideCard("Freelance opportunities", bulletList(c.freelanceOpportunities), "ph-laptop"),
      guideCard("Business opportunities", bulletList(c.businessOpportunities), "ph-storefront"),
      guideCard("Portfolio guidance", bulletList(c.portfolioRequirements), "ph-folders"),
      guideCard("Interview preparation", bulletList(c.interviewPreparation), "ph-chats"),
      guideCard("Career progression", bulletList(c.careerGrowthPath), "ph-trend-up"),
      guideCard("Advantages", bulletList(c.pros), "ph-thumbs-up"),
      guideCard("Challenges", bulletList(c.challenges), "ph-warning"),
      guideCard("Future scope", c.futureScope ? `<p>${escapeHtml(c.futureScope)}</p>` : "", "ph-binoculars"),
      guideCard("Recommended resources", bulletList(c.recommendedResources), "ph-books"),
      guideCard("Final outcome", c.finalOutcome ? `<p>${escapeHtml(c.finalOutcome)}</p>` : "", "ph-flag-checkered")
    ].filter(Boolean);
    els.guideView.innerHTML = sections.length ? `<div class="guide-grid">${sections.join("")}</div>` : `<div class="empty-state"><h3>No career guide is available yet</h3><p>The roadmap is still available for this course.</p></div>`;
  }

  function renderDashboard() {
    const modulesDone = state.career.modules.filter((_, i) => moduleDone(i)).length, totalTopics = state.career.modules.reduce((n, m) => n + m.topics.length, 0), projectsDone = progress().projects.length, quizzes = progress().quizzes.length;
    els.dashboardView.innerHTML = `<div class="stats-grid">${[["ph-chart-line-up", `${overallPercent()}%`, "Overall progress"], ["ph-check-circle", progress().topics.length, "Completed skills"], ["ph-hourglass", totalTopics - progress().topics.length, "Pending skills"], ["ph-folder", projectsDone, "Projects completed"], ["ph-exam", quizzes, "Quizzes completed"], ["ph-certificate", overallPercent() === 100 ? 1 : 0, "Certificates earned"], ["ph-target", Math.min(100, 12 + Math.round(overallPercent() * .88)), "Job readiness score"], ["ph-fire", `${state.store.streak} days`, "Learning streak"]].map(x => `<article class="stat-card"><i class="ph ${x[0]}"></i><b>${x[1]}</b><span>${x[2]}</span></article>`).join("")}</div><div class="dashboard-grid"><article class="content-card"><h3>Current roadmap · ${escapeHtml(state.career.name)}</h3><div class="progress-list">${state.career.modules.map((m, i) => `<div><span>${escapeHtml(m.title)}</span><i style="--p:${modulePercent(i)}%"></i><b>${modulePercent(i)}%</b></div>`).join("")}</div></article><div><article class="content-card"><h3>Daily mission</h3><div class="mission"><b>${progress().topics.length ? "Keep the streak alive" : "Complete your first lesson"}</b><span>Finish one unlocked topic and write one takeaway.</span></div></article><article class="content-card" style="margin-top:15px"><h3>Weekly goal</h3><p style="color:var(--muted)">${modulesDone} modules complete · ${Math.max(0, 5 - progress().topics.length % 5)} topics to the next weekly checkpoint.</p><p><b>${progress().hours || 0}h</b> logged learning time</p></article></div></div>`;
  }
  function renderProjects() {
    const projectModule = state.career.modules.find(m => m.project), mi = state.career.modules.indexOf(projectModule);
    els.projectsView.innerHTML = `<div class="section-title"><div><span class="eyebrow">Proof over promises</span><h2>Build your ${escapeHtml(state.career.name)} portfolio</h2></div></div><div class="project-grid">${projectModule.topics.map((t, ti) => `<article class="project-card"><span>PROJECT ${ti + 1} · ${ti < 2 ? "GUIDED" : "PORTFOLIO"}</span><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.subtopics.join(". "))}. Package the result with context, process, decisions, and measurable outcomes.</p><button data-topic="${mi}:${ti}">${progress().projects.includes(key(mi, ti)) ? "Review completed project" : "Open project brief"}</button></article>`).join("")}</div>`;
  }
  function quizQuestions() {
    const modules = state.career.modules.slice(1, 5); return modules.map((m, i) => ({ q: `Which activity best demonstrates practical understanding of ${m.title}?`, options: [`Memorize every definition without applying it`, `Complete a realistic ${m.topics[i % m.topics.length].title} task and explain the decisions`, "Skip feedback and move directly to advanced work", "Use a template without checking the context"], answer: 1 }));
  }
  function renderQuiz(result = "") {
    els.quizView.innerHTML = `<div class="quiz-shell"><div class="section-title"><div><span class="eyebrow">Knowledge check</span><h2>${escapeHtml(state.career.name)} readiness quiz</h2><p>Test applied understanding. Your latest score is saved to the dashboard.</p></div></div>${result}<form id="careerQuiz">${quizQuestions().map((q, qi) => `<div class="quiz-question"><b>${qi + 1}. ${escapeHtml(q.q)}</b>${q.options.map((o, oi) => `<label><input type="radio" name="q${qi}" value="${oi}" required> ${escapeHtml(o)}</label>`).join("")}</div>`).join("")}<button class="primary-button">Submit quiz</button></form></div>`;
  }
  const mentorPrompts = ["Explain this like I am a beginner", "Give me notes", "Give me examples", "Give me practice tasks", "Generate quiz", "Generate interview questions", "Give me project ideas", "Explain common mistakes", "Create a 7-day study plan", "Tell me how this helps in career"];
  function renderMentor() { els.mentorView.innerHTML = `<div class="mentor-shell"><div class="section-title"><div><span class="eyebrow">AI learning companion</span><h2>Ask your ${escapeHtml(state.career.name)} mentor</h2><p>These hooks are ready for an AI API. For now, they create structured local guidance.</p></div></div><div class="mentor-prompts">${mentorPrompts.map(p => `<button data-ai="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join("")}</div><div class="ai-response" id="mainAiResponse"><span class="typing">Choose a prompt to begin...</span></div></div>`; }
  function renderCompare() {
    const other = careers.find(c => c.id !== state.career.id && c.category === state.career.category) || careers[0];
    els.compareView.innerHTML = `<div class="compare-shell"><div class="section-title"><div><span class="eyebrow">Career comparison</span><h2>Compare paths side by side</h2></div></div><div class="compare-controls"><select id="compareA"><option value="${state.career.id}">${escapeHtml(state.career.name)}</option></select><i class="ph ph-arrows-left-right"></i><select id="compareB">${careers.filter(c => c.id !== state.career.id).map(c => `<option value="${c.id}" ${c.id === other.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}</select></div><div id="comparisonTable"></div></div>`; renderComparison(other.id);
  }
  function renderComparison(otherId) { const other = careers.find(c => c.id === otherId); if (!other || !$("#comparisonTable")) return; $("#comparisonTable").innerHTML = `<table class="compare-table"><tr><th>Factor</th><th>${escapeHtml(state.career.name)}</th><th>${escapeHtml(other.name)}</th></tr>${[["Category", state.career.category, other.category], ["Duration", state.career.duration, other.duration], ["Guided hours", totalHours(), other.modules.reduce((s, m) => s + m.time, 0)], ["Core tools", state.career.tools.join(", "), other.tools.join(", ")], ["Entry roles", state.career.roles.join(", "), other.roles.join(", ")], ["Demand", state.career.demand, other.demand]].map(r => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td></tr>`).join("")}</table>`; }
  function learnerName() { try { const raw = JSON.parse(localStorage.getItem("careerCompassUser") || localStorage.getItem("user") || "{}"); return raw.name || raw.fullName || "Career Compass Learner"; } catch { return "Career Compass Learner"; } }
  function renderCertificate() { const complete = overallPercent() === 100, date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), certId = `CC-${state.career.id.slice(0, 4).toUpperCase()}-${String(Math.abs(hash(state.career.id + learnerName()))).slice(0, 7)}`; els.certificateView.innerHTML = `<div class="certificate ${complete ? "" : "locked"}"><i class="ph-fill ph-seal-check seal"></i><span class="eyebrow">Career Compass Pro</span><h2>Certificate of Career Readiness</h2><p>This certifies that</p><div class="certificate-name">${escapeHtml(learnerName())}</div><p>has completed the professional curriculum in</p><h3>${escapeHtml(state.career.name)}</h3><p class="certificate-skills">Skills: ${escapeHtml(state.career.modules.slice(1, 6).map(m => m.title).join(" · "))}</p><p>${date} &nbsp; · &nbsp; ${certId}</p>${complete ? `<button class="primary-button" id="downloadCertificate"><i class="ph ph-download-simple"></i> Download / print certificate</button>` : `<p class="certificate-note"><i class="ph ph-lock-key"></i> Complete all roadmap topics to unlock this certificate.</p>`}</div>`; }
  function hash(s) { return [...s].reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0) | 0, 0); }

  function openTopic(mi, ti, subtopic = null) { if (!moduleUnlocked(mi)) return showToast(`Complete ${state.career.modules[mi - 1].title} first`); state.module = mi; state.topic = ti; state.subtopic = subtopic; state.detailTab = "learn"; renderDrawer(); els.topicDrawer.classList.add("open"); els.drawerBackdrop.classList.add("open"); els.topicDrawer.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeDrawer() { els.topicDrawer.classList.remove("open"); els.drawerBackdrop.classList.remove("open"); els.topicDrawer.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  function drawerContext() { const m = state.career.modules[state.module], t = m.topics[state.topic], focus = state.subtopic !== null ? t.subtopics[state.subtopic] : t.title; return { m, t, focus }; }
  function renderDrawer() {
    const { m, t, focus } = drawerContext(), done = topicDone(state.module, state.topic), previous = state.topic ? m.topics[state.topic - 1].title : state.module ? state.career.modules[state.module - 1].title : "No prior knowledge required";
    els.drawerStage.textContent = `${m.title} · ${state.subtopic !== null ? "Nested lesson" : `Topic ${state.topic + 1}`}`; els.drawerTitle.textContent = focus; els.drawerMeta.innerHTML = `<span><i class="ph ph-gauge"></i> ${m.difficulty}</span><span><i class="ph ph-clock"></i> ${Math.max(1, Math.round(m.time / m.topics.length))} hours</span><span><i class="ph ph-link"></i> Prerequisite: ${escapeHtml(previous)}</span>`;
    $$("button", els.drawerTabs).forEach(b => b.classList.toggle("active", b.dataset.detail === state.detailTab));
    const contents = { learn: learnDetail(m, t, focus, previous), practice: practiceDetail(focus), project: projectDetail(focus), quiz: topicQuiz(focus, t), mentor: mentorDetail(focus) };
    els.drawerBody.innerHTML = contents[state.detailTab];
    els.drawerFooter.innerHTML = `<button class="complete-topic" id="completeTopic" ${done ? "disabled" : ""}><i class="ph-fill ${done ? "ph-check-circle" : "ph-circle"}"></i> ${done ? "Topic completed" : "Mark topic as completed"}</button>`;
  }
  function learnDetail(m, t, focus, previous) { const concepts = t.subtopics.length ? t.subtopics : ["Core terminology", "Process", "Quality criteria", "Professional application"]; return `<section class="detail-block callout"><h3>Overview</h3><p>${escapeHtml(focus)} is a practical part of ${escapeHtml(m.title)} in the ${escapeHtml(state.career.name)} pathway. You will move from a clear mental model to a small work sample you can explain.</p></section><section class="detail-block"><h3>Why this topic matters</h3><p>Professionals use this skill to make better decisions, reduce avoidable errors, and communicate credible work to clients or stakeholders.</p></section><section class="detail-block"><h3>What to study first</h3><p>${escapeHtml(previous)}. Refresh the vocabulary and explain one example in your own words before continuing.</p></section><section class="detail-block"><h3>Step-by-step learning order</h3><ol><li>Learn the purpose and essential vocabulary.</li><li>Study one strong real-world example.</li><li>Recreate the method with guided inputs.</li><li>Apply it to an unfamiliar scenario.</li><li>Review against a rubric and improve.</li></ol></section><section class="detail-block"><h3>Key concepts & nested lessons</h3><div class="concepts">${concepts.map(c => `<span>${escapeHtml(c)}</span>`).join("")}</div></section><section class="detail-block"><h3>Tools required</h3><div class="concepts">${state.career.tools.map(tool => `<span>${escapeHtml(tool)}</span>`).join("")}</div></section><section class="detail-block"><h3>Real-world example</h3><p>A ${escapeHtml(state.career.roles[0])} receives an incomplete brief, identifies the decision that ${escapeHtml(focus)} must support, produces a first version, collects feedback, and records the measurable improvement.</p></section><section class="detail-block"><h3>Common mistakes</h3><ul><li>Memorizing terminology without producing an output.</li><li>Using a tool before clarifying the problem and audience.</li><li>Skipping evidence, feedback, or quality checks.</li><li>Copying a template without adapting it to context.</li></ul></section><section class="detail-block"><h3>Best practices & cheat sheet</h3><ul><li><b>Context:</b> Who needs this and why?</li><li><b>Method:</b> What repeatable steps will you follow?</li><li><b>Evidence:</b> What supports your decision?</li><li><b>Quality:</b> How will you test the result?</li></ul></section><section class="detail-block"><h3>Resources</h3><p>Use official professional-body guidance, the documentation for ${escapeHtml(state.career.tools[0])}, reputable textbooks, and recent case studies.</p></section><section class="detail-block"><h3>Your notes</h3><textarea class="topic-notes" id="topicNotes" placeholder="Capture definitions, examples, questions, and takeaways...">${escapeHtml(progress().notes[key(state.module, state.topic)] || "")}</textarea></section>`; }
  function practiceDetail(focus) { return `<section class="detail-block"><h3>Practice tasks</h3><ol><li>Explain ${escapeHtml(focus)} in 100 words without jargon.</li><li>Find and annotate one strong and one weak real-world example.</li><li>Complete a 25-minute timed application drill.</li></ol></section><section class="detail-block"><h3>Assignment</h3><p>Create a one-page ${escapeHtml(focus)} deliverable for a fictional client. Include purpose, assumptions, process, output, and self-review.</p></section><section class="detail-block"><h3>7-day practice rhythm</h3><p>Days 1–2: concepts and examples · Days 3–4: guided practice · Day 5: independent task · Day 6: feedback · Day 7: revision and recall quiz.</p></section>`; }
  function projectDetail(focus) { return `<section class="detail-block callout"><h3>Mini project</h3><p>Build a compact ${escapeHtml(focus)} work sample using ${escapeHtml(state.career.tools[0])}. Time-box it to two hours and document three decisions.</p></section><section class="detail-block"><h3>Challenge project</h3><p>Solve the same brief for two different audiences. Compare the outcomes, constraints, risks, and the evidence behind your recommendation.</p></section><section class="detail-block"><h3>Submission checklist</h3><ul><li>Clear problem and audience</li><li>Visible process and alternatives considered</li><li>Professional final deliverable</li><li>Outcome metric and reflection</li></ul></section><button class="primary-button" data-project-complete="${state.module}:${state.topic}">${progress().projects.includes(key(state.module, state.topic)) ? "Project recorded" : "Record project completion"}</button>`; }
  function topicQuiz(focus, t) { return `<section class="detail-block"><h3>Quick knowledge check</h3><p><b>1.</b> How would you explain ${escapeHtml(focus)} to a beginner?</p><p><b>2.</b> What evidence would show that the result is effective?</p><p><b>3.</b> Which common mistake creates the greatest risk in this context?</p><p><b>4.</b> Describe a professional use case involving ${escapeHtml(t.title)}.</p></section><section class="detail-block"><h3>Interview questions</h3><ul><li>Walk me through your approach to ${escapeHtml(focus)}.</li><li>Tell me about feedback that changed your work.</li><li>How do you balance speed, quality, and stakeholder needs?</li></ul></section>`; }
  function mentorDetail(focus) { return `<section class="detail-block"><h3>AI Mentor prompts</h3><div class="mentor-grid">${mentorPrompts.map(p => `<button data-drawer-ai="${escapeHtml(p)}">${escapeHtml(p)}</button>`).join("")}</div></section><div class="ai-response" id="drawerAiResponse"><span class="typing">Choose a prompt about ${escapeHtml(focus)}...</span></div>`; }
  function aiAnswer(prompt, focus) { const openers = { "Explain this like I am a beginner": `${focus} is a repeatable way to turn a goal into a useful professional result. Start by understanding who needs the result, then follow the core steps and check the outcome.`, "Give me notes": `Key notes for ${focus}: purpose, vocabulary, process, evidence, quality check, and reflection. Keep one real example beside each concept.`, "Give me examples": `Example: a ${state.career.roles[0]} uses ${focus} to improve a client outcome, documents the choice, and compares the result with the original goal.`, "Give me practice tasks": `Practice ladder: explain it in 100 words; annotate an example; reproduce a guided version; solve a new scenario; request feedback.`, "Generate quiz": `Quiz: Define ${focus}. Name two use cases. What is one common mistake? Which metric shows success? How would you improve a weak result?`, "Generate interview questions": `Interview prompts: Walk me through your ${focus} process. How did you handle constraints? What feedback changed your work? How did you measure success?`, "Give me project ideas": `Project idea: create a client-ready ${focus} deliverable for a local organization, with a brief, research, two options, final output, and outcome measure.`, "Explain common mistakes": `Common mistakes: starting without a clear goal, copying templates blindly, ignoring stakeholders, skipping quality checks, and presenting claims without evidence.`, "Create a 7-day study plan": `Day 1 concepts; Day 2 examples; Day 3 guided exercise; Day 4 tool practice; Day 5 independent task; Day 6 feedback; Day 7 revision and quiz.`, "Tell me how this helps in career": `${focus} gives you evidence of applied judgment—a stronger hiring signal than passive course completion. Add the result and your decisions to your portfolio.` }; return openers[prompt] || `Here is a focused learning response for ${focus}.`; }
  function switchView(view) { $$("[data-view]", els.workspaceTabs).forEach(b => b.classList.toggle("active", b.dataset.view === view)); $$("[data-view-panel]").forEach(p => p.classList.toggle("active", p.dataset.viewPanel === view)); }

  function bind() {
    els.chooseNonTech.addEventListener("click", () => showCatalog()); els.backToCatalog.addEventListener("click", () => showCatalog(false)); els.mobileMenu.addEventListener("click", () => $(".topbar nav").classList.toggle("open"));
    [els.careerSearch, els.difficultyFilter, els.durationFilter, els.salaryFilter, els.sortFilter].forEach(el => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", renderCatalog));
    els.categoryFilter.addEventListener("change", () => { state.filter = els.categoryFilter.value; $$("button", els.categoryChips).forEach(b => b.classList.toggle("active", b.dataset.category === state.filter)); renderCatalog(); });
    els.categoryChips.addEventListener("click", e => { const b = e.target.closest("[data-category]"); if (!b) return; state.filter = b.dataset.category; els.categoryFilter.value = state.filter; $$("button", els.categoryChips).forEach(x => x.classList.toggle("active", x === b)); renderCatalog(); });
    els.careerGrid.addEventListener("click", e => { const b = e.target.closest("[data-career]"); if (b) selectCareer(b.dataset.career); });
    els.workspaceTabs.addEventListener("click", e => { const b = e.target.closest("[data-view]"); if (b) switchView(b.dataset.view); });
    $(".flow-switch").addEventListener("click", e => { const b = e.target.closest("[data-flow]"); if (!b) return; state.flow = b.dataset.flow; $$("button", $(".flow-switch")).forEach(x => x.classList.toggle("active", x === b)); renderFlow(); });
    els.flowchart.addEventListener("click", e => { const topic = e.target.closest("[data-topic]"); if (topic) { const [mi, ti] = topic.dataset.topic.split(":").map(Number); openTopic(mi, ti, topic.dataset.subtopic !== undefined ? Number(topic.dataset.subtopic) : null); return; } const expand = e.target.closest("[data-expand]"); if (expand) expand.closest(".flow-module").classList.toggle("expanded"); });
    els.closeDrawer.addEventListener("click", closeDrawer); els.drawerBackdrop.addEventListener("click", closeDrawer);
    els.drawerTabs.addEventListener("click", e => { const b = e.target.closest("[data-detail]"); if (!b) return; state.detailTab = b.dataset.detail; renderDrawer(); });
    els.drawerFooter.addEventListener("click", e => { if (!e.target.closest("#completeTopic")) return; const p = progress(), k = key(state.module, state.topic); if (!p.topics.includes(k)) { p.topics.push(k); p.hours = +(p.hours + state.career.modules[state.module].time / state.career.modules[state.module].topics.length).toFixed(1); save(); renderDrawer(); renderAll(); showToast(moduleDone(state.module) ? "Module completed — the next stage is unlocked!" : "Topic completed — progress saved"); } });
    els.drawerBody.addEventListener("click", e => { const project = e.target.closest("[data-project-complete]"); if (project) { if (!progress().projects.includes(project.dataset.projectComplete)) progress().projects.push(project.dataset.projectComplete); save(); renderDrawer(); renderProjects(); showToast("Project added to your progress dashboard"); } const ai = e.target.closest("[data-drawer-ai]"); if (ai) { const target = $("#drawerAiResponse"); target.innerHTML = `<span class="typing">Mentor is thinking...</span>`; setTimeout(() => target.innerHTML = `<b>${escapeHtml(ai.dataset.drawerAi)}</b><p>${escapeHtml(aiAnswer(ai.dataset.drawerAi, drawerContext().focus))}</p>`, 350); } });
    els.drawerBody.addEventListener("input", e => { if (e.target.id === "topicNotes") { progress().notes[key(state.module, state.topic)] = e.target.value; save(); } });
    document.addEventListener("click", e => { const topic = e.target.closest("[data-view-panel] [data-topic]"); if (topic && !els.flowchart.contains(topic)) { const [mi, ti] = topic.dataset.topic.split(":").map(Number); openTopic(mi, ti); } const ai = e.target.closest("#mentorView [data-ai]"); if (ai) { const target = $("#mainAiResponse"); target.innerHTML = `<span class="typing">Building a tailored response...</span>`; setTimeout(() => target.innerHTML = `<b>${escapeHtml(ai.dataset.ai)}</b><p>${escapeHtml(aiAnswer(ai.dataset.ai, state.career.name))}</p>`, 350); } if (e.target.closest("#downloadCertificate")) window.print(); });
    document.addEventListener("change", e => { if (e.target.id === "compareB") renderComparison(e.target.value); });
    document.addEventListener("submit", e => { if (e.target.id !== "careerQuiz") return; e.preventDefault(); const form = new FormData(e.target), questions = quizQuestions(); let score = 0; questions.forEach((q, i) => { if (Number(form.get(`q${i}`)) === q.answer) score++; }); const percent = Math.round(score / questions.length * 100); progress().quizzes.push({ score: percent, date: new Date().toISOString() }); save(); renderQuiz(`<div class="mission"><b>Your score: ${percent}%</b><span>${percent >= 75 ? "Strong applied understanding. Review explanations, then continue." : "Review the core modules and try again after more practice."}</span></div>`); renderDashboard(); showToast(`Quiz saved: ${percent}%`); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
  }
  function init() { cache(); populateFilters(); renderCatalog(); bind(); const params = new URLSearchParams(location.search), id = params.get("career"); if (id && careers.some(c => c.id === id)) selectCareer(id); else if (params.get("browse") === "1") showCatalog(false); }
  document.addEventListener("DOMContentLoaded", init);
})();
