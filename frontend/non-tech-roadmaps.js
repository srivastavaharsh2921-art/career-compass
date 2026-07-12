import {
  nonTechCourses,
  validateNonTechCourses
} from "./data/nonTechCourses.generated.js";

(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const sectionLabels = { learn: "Learn", practice: "Practice", quiz: "Quiz", project: "Project" };
  const courses = nonTechCourses;
  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))].sort();
  const state = { course: null, filter: "All", view: "roadmap" };
  const els = {};

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function hasItems(items) {
    return Array.isArray(items) && items.length > 0;
  }

  function renderList(items = [], ordered = false) {
    if (!hasItems(items)) return "";
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
  }

  function renderTextBlock(title, value) {
    if (!value) return "";
    return `<div class="course-info-block"><h4>${escapeHtml(title)}</h4><p>${escapeHtml(value)}</p></div>`;
  }

  function renderArrayBlock(title, items, ordered = false) {
    if (!hasItems(items)) return "";
    return `<div class="course-info-block"><h4>${escapeHtml(title)}</h4>${renderList(items, ordered)}</div>`;
  }

  function renderChips(items = []) {
    if (!hasItems(items)) return "";
    return `<div class="concepts">${items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function renderNestedLessons(lessons = []) {
    if (!hasItems(lessons)) return "";
    return `
      <div class="course-info-block nested-lessons">
        <h4>Key concepts & nested lessons</h4>
        ${lessons.map(lesson => `
          <details class="nested-lesson">
            <summary>${escapeHtml(lesson.lesson)}</summary>
            ${renderList(lesson.subLessons)}
          </details>
        `).join("")}
      </div>
    `;
  }

  function getCourseStorageKey(courseId) {
    return `careerCompass_nonTech_${courseId}`;
  }

  function emptyProgress() {
    return { completedStages: [], completedSections: {}, notes: {} };
  }

  function getCourseProgress(courseId) {
    try {
      const storedValue = localStorage.getItem(getCourseStorageKey(courseId));
      return storedValue ? { ...emptyProgress(), ...JSON.parse(storedValue) } : emptyProgress();
    } catch (error) {
      console.error("Unable to load course progress:", error);
      return emptyProgress();
    }
  }

  function saveCourseProgress(courseId, data) {
    try {
      localStorage.setItem(getCourseStorageKey(courseId), JSON.stringify({ ...emptyProgress(), ...data }));
    } catch (error) {
      console.error("Unable to save course progress:", error);
    }
  }

  function completedSectionCount(course) {
    const progress = getCourseProgress(course.id);
    return Object.values(progress.completedSections || {}).filter(Boolean).length;
  }

  function overallPercent(course = state.course) {
    if (!course) return 0;
    return Math.round(completedSectionCount(course) / (course.stages.length * Object.keys(sectionLabels).length) * 100);
  }

  function cache() {
    [
      "fieldGate", "chooseNonTech", "catalogSection", "careerCount", "careerSearch",
      "categoryFilter", "difficultyFilter", "durationFilter", "salaryFilter", "sortFilter",
      "categoryChips", "careerGrid", "workspace", "backToCatalog", "careerIcon",
      "careerCategory", "careerTitle", "careerDescription", "careerTags", "scoreRing",
      "roadmapPercent", "readinessScore", "workspaceTabs", "flowchart", "guideView",
      "dashboardView", "projectsView", "quizView", "mentorView", "compareView",
      "certificateView", "toast", "mobileMenu"
    ].forEach(id => { els[id] = document.getElementById(id); });
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 1800);
  }

  function renderCourseNotFound() {
    document.title = "Course not found | Career Compass";
    els.fieldGate.hidden = true;
    els.catalogSection.hidden = true;
    els.workspace.hidden = true;
    const existing = $(".course-not-found");
    if (existing) existing.remove();
    $("main").insertAdjacentHTML("beforeend", `
      <section class="course-not-found">
        <h2>Course not found</h2>
        <p>The selected non-tech course could not be loaded.</p>
        <a class="primary-button" href="non-tech-roadmaps.html?browse=1">Browse non-tech courses</a>
      </section>
    `);
  }

  function showCatalog(scroll = true) {
    $(".course-not-found")?.remove();
    els.fieldGate.hidden = true;
    els.workspace.hidden = true;
    els.catalogSection.hidden = false;
    renderCatalog();
    if (scroll) els.catalogSection.scrollIntoView({ behavior: "smooth" });
  }

  function populateFilters() {
    els.careerCount.textContent = courses.length;
    els.categoryFilter.innerHTML = `<option value="All">All categories</option>${categories.map(category => `<option>${escapeHtml(category)}</option>`).join("")}`;
    els.categoryChips.innerHTML = ["All", ...categories].map(category => `<button class="${category === "All" ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
  }

  function durationMonths(course) {
    const match = String(course.duration || "").match(/(\d+)(?:\s*-\s*(\d+))?/);
    return match ? Number(match[2] || match[1]) : 6;
  }

  function courseSearchText(course) {
    return [
      course.id, course.slug, course.title, course.type, course.overview, course.category,
      ...(course.tools || []), ...(course.keyTopics || []), ...(course.roles || []),
      ...course.stages.flatMap(stage => [
        stage.title,
        stage.objective,
        ...Object.values(stage.sections).flatMap(section => [
          section.title,
          section.whyThisTopicMatters,
          ...(section.toolsRequired || []),
          ...(section.stepByStepLearningOrder || []),
          ...(section.keyConceptsAndNestedLessons || []).map(lesson => lesson.lesson)
        ])
      ])
    ].join(" ").toLowerCase();
  }

  function createCourseCard(course) {
    const courseUrl = `non-tech-course.html?course=${encodeURIComponent(course.slug)}`;
    return `
      <article class="career-card">
        <div class="card-top">
          <span class="card-icon"><i class="ph ${escapeHtml(course.icon || "ph-briefcase")}"></i></span>
          <span class="popular-badge"><i class="ph-fill ph-path"></i> 8 stages</span>
        </div>
        <h3>${escapeHtml(course.title)}</h3>
        <p>${escapeHtml(course.overview)}</p>
        <div class="card-meta">
          <span><i class="ph ph-clock"></i>${escapeHtml(course.duration || "Flexible")}</span>
          <span><i class="ph ph-path"></i>${course.stages.length} stages</span>
          <span><i class="ph ph-student"></i>${escapeHtml(course.difficulty || "Beginner friendly")}</span>
        </div>
        <div class="card-skills">${(course.keyTopics || []).slice(0, 4).map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
        <a class="course-link" href="${courseUrl}">View Roadmap <i class="ph ph-arrow-right"></i></a>
      </article>
    `;
  }

  function renderCatalog() {
    const query = els.careerSearch.value.trim().toLowerCase();
    let items = courses.filter(course => {
      const matchesCategory = state.filter === "All" || course.category === state.filter;
      const matchesQuery = !query || courseSearchText(course).includes(query);
      const matchesDifficulty = els.difficultyFilter.value === "All" || (course.difficulty || "Beginner friendly") === els.difficultyFilter.value;
      const matchesDuration = els.durationFilter.value === "All" || (els.durationFilter.value === "short" ? durationMonths(course) < 9 : durationMonths(course) >= 9);
      const matchesSalary = els.salaryFilter.value === "All" || /finance|management|marketing|analytics|law|aviation|product/i.test(`${course.title} ${course.category} ${course.overview}`);
      return matchesCategory && matchesQuery && matchesDifficulty && matchesDuration && matchesSalary;
    });

    if (els.sortFilter.value === "az") items.sort((a, b) => a.title.localeCompare(b.title));
    else if (els.sortFilter.value === "duration") items.sort((a, b) => durationMonths(a) - durationMonths(b));
    else items.sort((a, b) => a.title.localeCompare(b.title));

    els.careerGrid.innerHTML = items.length
      ? items.map(createCourseCard).join("")
      : `<div class="empty-state"><i class="ph ph-magnifying-glass" style="font-size:38px"></i><h3>No careers match these filters</h3><p>Try another category or clear your search.</p></div>`;
  }

  function selectCourseBySlug(courseSlug) {
    return courses.find(course => course.slug === courseSlug || course.id === courseSlug);
  }

  function renderCourse(course) {
    state.course = course;
    $(".course-not-found")?.remove();
    document.title = `${course.title} Roadmap | Career Compass`;
    els.fieldGate.hidden = true;
    els.catalogSection.hidden = true;
    els.workspace.hidden = false;
    els.careerIcon.innerHTML = `<i class="ph ${escapeHtml(course.icon || "ph-briefcase")}"></i>`;
    els.careerCategory.textContent = course.category || course.type;
    els.careerTitle.textContent = `${course.title} Career Roadmap`;
    els.careerDescription.textContent = course.overview;
    els.careerTags.innerHTML = `
      <span><i class="ph ph-clock"></i> ${escapeHtml(course.duration || "Flexible")}</span>
      <span><i class="ph ph-books"></i> ${course.stages.length} stages</span>
      <span><i class="ph ph-toolbox"></i> ${(course.tools || []).slice(0, 3).map(escapeHtml).join(", ")}</span>
    `;
    switchView("roadmap");
    renderAll();
    els.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderSectionTabs(course, stage) {
    return `
      <div class="section-tabs" role="tablist">
        ${Object.keys(sectionLabels).map((sectionType, index) => `
          <button
            type="button"
            class="section-tab ${index === 0 ? "active" : ""}"
            data-course-id="${escapeHtml(course.id)}"
            data-stage="${stage.stage}"
            data-section="${sectionType}"
          >${sectionLabels[sectionType]}</button>
        `).join("")}
      </div>
    `;
  }

  function renderNotesArea(course, stage, sectionType, notePrompts = {}) {
    const savedData = getCourseProgress(course.id);
    const noteKey = `stage_${stage.stage}_${sectionType}`;
    const savedNote = savedData.notes?.[noteKey] || "";
    return `
      <div class="course-info-block notes-block">
        <h4>Your notes</h4>
        <div class="note-prompts">
          ${notePrompts.summaryPrompt ? `<p>${escapeHtml(notePrompts.summaryPrompt)}</p>` : ""}
          ${notePrompts.doubtPrompt ? `<p>${escapeHtml(notePrompts.doubtPrompt)}</p>` : ""}
          ${notePrompts.reflectionPrompt ? `<p>${escapeHtml(notePrompts.reflectionPrompt)}</p>` : ""}
        </div>
        <textarea
          class="course-notes"
          data-course-id="${escapeHtml(course.id)}"
          data-stage="${stage.stage}"
          data-section="${sectionType}"
          placeholder="Write your notes here..."
        >${escapeHtml(savedNote)}</textarea>
        <div class="section-actions">
          <button
            type="button"
            class="save-note-button"
            data-course-id="${escapeHtml(course.id)}"
            data-stage="${stage.stage}"
            data-section="${sectionType}"
          >Save Notes</button>
          <button
            type="button"
            class="complete-section-button"
            data-course-id="${escapeHtml(course.id)}"
            data-stage="${stage.stage}"
            data-section="${sectionType}"
          >Mark section complete</button>
        </div>
      </div>
    `;
  }

  function renderSectionContent(course, stage, sectionType, section) {
    if (!section) return "";
    return `
      <div class="section-heading"><h3>${escapeHtml(section.title)}</h3></div>
      ${renderTextBlock("Why this topic matters", section.whyThisTopicMatters)}
      ${renderArrayBlock("What to study first", section.whatToStudyFirst, true)}
      ${renderArrayBlock("Step-by-step learning order", section.stepByStepLearningOrder, true)}
      ${renderNestedLessons(section.keyConceptsAndNestedLessons)}
      ${renderArrayBlock("Tools required", section.toolsRequired)}
      ${renderTextBlock("Real-world example", section.realWorldExample)}
      ${renderArrayBlock("Common mistakes", section.commonMistakes)}
      ${renderArrayBlock("Best practices & cheat sheet", section.bestPracticesAndCheatSheet)}
      ${renderArrayBlock("Resources", section.resources)}
      ${renderNotesArea(course, stage, sectionType, section.yourNotes)}
    `;
  }

  function renderStageSections(course, stage) {
    return Object.entries(stage.sections).map(([sectionType, section], index) => `
      <section
        class="stage-section ${index === 0 ? "active" : ""}"
        data-course-id="${escapeHtml(course.id)}"
        data-stage="${stage.stage}"
        data-section-panel="${sectionType}"
      >
        ${renderSectionContent(course, stage, sectionType, section)}
      </section>
    `).join("");
  }

  function sectionKey(stage, sectionType) {
    return `stage_${stage.stage}_${sectionType}`;
  }

  function isStageComplete(course, stage) {
    const progress = getCourseProgress(course.id);
    return Object.keys(sectionLabels).every(sectionType => progress.completedSections?.[sectionKey(stage, sectionType)]);
  }

  function renderStage(course, stage) {
    const completed = isStageComplete(course, stage);
    return `
      <article
        class="roadmap-stage ${completed ? "completed" : ""}"
        id="${escapeHtml(`${course.id}-stage-${stage.stage}`)}"
        data-stage="${stage.stage}"
      >
        <div class="stage-header">
          <span class="stage-number">Stage ${stage.stage}</span>
          <h2>${escapeHtml(stage.title)}</h2>
          <p>${escapeHtml(stage.objective)}</p>
          <span class="stage-duration">${escapeHtml(stage.estimatedDuration)}</span>
        </div>
        <div class="completion-criteria">
          <h3>Completion Criteria</h3>
          ${renderList(stage.completionCriteria)}
        </div>
        <div
          class="stage-sections"
          data-course-id="${escapeHtml(course.id)}"
          data-stage="${stage.stage}"
        >
          ${renderSectionTabs(course, stage)}
          ${renderStageSections(course, stage)}
        </div>
      </article>
    `;
  }

  function renderFlow() {
    els.flowchart.className = `flowchart stage-roadmap ${state.flow === "branch" ? "branch" : ""}`;
    els.flowchart.innerHTML = state.course.stages.map(stage => renderStage(state.course, stage)).join("");
  }

  function updateHeader() {
    const percent = overallPercent();
    els.roadmapPercent.textContent = `${percent}%`;
    els.scoreRing.style.setProperty("--value", percent);
    els.readinessScore.textContent = Math.min(100, 12 + Math.round(percent * 0.88));
  }

  function renderGuide() {
    const course = state.course;
    els.guideView.innerHTML = `
      <div class="guide-grid">
        <article class="guide-card guide-wide">
          <h3><i class="ph ph-compass"></i>Course overview</h3>
          <p>${escapeHtml(course.overview)}</p>
        </article>
        <article class="guide-card">
          <h3><i class="ph ph-toolbox"></i>Tools</h3>
          ${renderChips(course.tools)}
        </article>
        <article class="guide-card">
          <h3><i class="ph ph-student"></i>Key Topics</h3>
          ${renderChips(course.keyTopics)}
        </article>
        <article class="guide-card">
          <h3><i class="ph ph-briefcase"></i>Career Roles</h3>
          ${renderList(course.roles)}
        </article>
        <article class="guide-card">
          <h3><i class="ph ph-buildings"></i>Industries</h3>
          ${renderChips(course.industries)}
        </article>
      </div>
    `;
  }

  function renderDashboard() {
    const course = state.course;
    const progress = getCourseProgress(course.id);
    const totalSections = course.stages.length * Object.keys(sectionLabels).length;
    const completeSections = completedSectionCount(course);
    els.dashboardView.innerHTML = `
      <div class="stats-grid">
        ${[
          ["ph-chart-line-up", `${overallPercent()}%`, "Overall progress"],
          ["ph-check-circle", completeSections, "Completed sections"],
          ["ph-hourglass", totalSections - completeSections, "Pending sections"],
          ["ph-folder", course.stages.length, "Portfolio stages"],
          ["ph-note-pencil", Object.keys(progress.notes || {}).length, "Saved notes"],
          ["ph-target", Math.min(100, 12 + Math.round(overallPercent() * .88)), "Job readiness score"]
        ].map(item => `<article class="stat-card"><i class="ph ${item[0]}"></i><b>${item[1]}</b><span>${item[2]}</span></article>`).join("")}
      </div>
      <div class="dashboard-grid">
        <article class="content-card">
          <h3>Current roadmap - ${escapeHtml(course.title)}</h3>
          <div class="progress-list">
            ${course.stages.map(stage => {
              const done = Object.keys(sectionLabels).filter(type => progress.completedSections?.[sectionKey(stage, type)]).length;
              const percent = Math.round(done / Object.keys(sectionLabels).length * 100);
              return `<div><span>${escapeHtml(stage.title)}</span><i style="--p:${percent}%"></i><b>${percent}%</b></div>`;
            }).join("")}
          </div>
        </article>
        <article class="content-card">
          <h3>Daily mission</h3>
          <div class="mission">
            <b>${completeSections ? "Keep building proof" : "Complete your first section"}</b>
            <span>Open one stage, read one section, save notes, and mark the section complete.</span>
          </div>
        </article>
      </div>
    `;
  }

  function renderProjects() {
    els.projectsView.innerHTML = `
      <div class="section-title"><div><span class="eyebrow">Proof over promises</span><h2>Build your ${escapeHtml(state.course.title)} portfolio</h2></div></div>
      <div class="project-grid">
        ${state.course.stages.map(stage => {
          const project = stage.sections.project;
          return `<article class="project-card"><span>STAGE ${stage.stage} PROJECT</span><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.realWorldExample)}</p>${renderList(project.stepByStepLearningOrder, true)}</article>`;
        }).join("")}
      </div>
    `;
  }

  function renderQuiz() {
    els.quizView.innerHTML = `
      <div class="quiz-shell">
        <div class="section-title"><div><span class="eyebrow">Knowledge check</span><h2>${escapeHtml(state.course.title)} readiness quiz</h2><p>Use these prompts to check applied understanding for every stage.</p></div></div>
        ${state.course.stages.map(stage => `<article class="quiz-question"><b>Stage ${stage.stage}: ${escapeHtml(stage.title)}</b>${renderList(stage.sections.quiz.stepByStepLearningOrder, true)}</article>`).join("")}
      </div>
    `;
  }

  function renderMentor() {
    els.mentorView.innerHTML = `
      <div class="mentor-shell">
        <div class="section-title"><div><span class="eyebrow">AI learning companion</span><h2>Ask your ${escapeHtml(state.course.title)} mentor</h2><p>Use the stage content as context for mentor prompts.</p></div></div>
        <div class="ai-response"><b>Suggested prompt</b><p>Explain ${escapeHtml(state.course.stages[0].title)} for a beginner and give me one practice task using ${escapeHtml(state.course.tools[0] || "the main tool")}.</p></div>
      </div>
    `;
  }

  function renderCompare() {
    const other = courses.find(course => course.id !== state.course.id && course.category === state.course.category) || courses.find(course => course.id !== state.course.id);
    if (!other) {
      els.compareView.innerHTML = "";
      return;
    }
    els.compareView.innerHTML = `
      <div class="compare-shell">
        <div class="section-title"><div><span class="eyebrow">Career comparison</span><h2>Compare paths side by side</h2></div></div>
        <table class="compare-table">
          <tr><th>Factor</th><th>${escapeHtml(state.course.title)}</th><th>${escapeHtml(other.title)}</th></tr>
          ${[
            ["Category", state.course.category, other.category],
            ["Duration", state.course.duration, other.duration],
            ["Stages", state.course.stages.length, other.stages.length],
            ["Core tools", state.course.tools.join(", "), other.tools.join(", ")],
            ["Key topics", state.course.keyTopics.slice(0, 5).join(", "), other.keyTopics.slice(0, 5).join(", ")]
          ].map(row => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`).join("")}
        </table>
      </div>
    `;
  }

  function learnerName() {
    try {
      const raw = JSON.parse(localStorage.getItem("careerCompassUser") || localStorage.getItem("user") || "{}");
      return raw.name || raw.fullName || "Career Compass Learner";
    } catch {
      return "Career Compass Learner";
    }
  }

  function renderCertificate() {
    const complete = overallPercent() === 100;
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const certId = `CC-${state.course.id.slice(0, 4).toUpperCase()}-${Math.abs(hash(state.course.id + learnerName())).toString().slice(0, 7)}`;
    els.certificateView.innerHTML = `
      <div class="certificate ${complete ? "" : "locked"}">
        <i class="ph-fill ph-seal-check seal"></i>
        <span class="eyebrow">Career Compass Pro</span>
        <h2>Certificate of Career Readiness</h2>
        <p>This certifies that</p>
        <div class="certificate-name">${escapeHtml(learnerName())}</div>
        <p>has completed the professional curriculum in</p>
        <h3>${escapeHtml(state.course.title)}</h3>
        <p class="certificate-skills">Skills: ${escapeHtml(state.course.keyTopics.slice(0, 8).join(" - "))}</p>
        <p>${date} - ${certId}</p>
        ${complete ? `<button class="primary-button" id="downloadCertificate"><i class="ph ph-download-simple"></i> Download / print certificate</button>` : `<p class="certificate-note"><i class="ph ph-lock-key"></i> Complete all stage sections to unlock this certificate.</p>`}
      </div>
    `;
  }

  function hash(value) {
    return [...String(value)].reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0) | 0, 0);
  }

  function renderAll() {
    renderFlow();
    updateHeader();
    renderGuide();
    renderDashboard();
    renderProjects();
    renderQuiz();
    renderMentor();
    renderCompare();
    renderCertificate();
  }

  function switchView(view) {
    state.view = view;
    $$("[data-view]", els.workspaceTabs).forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $$("[data-view-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  }

  function activateSectionTab(tab) {
    const stage = tab.dataset.stage;
    const courseId = tab.dataset.courseId;
    const sectionType = tab.dataset.section;
    const parent = tab.closest(".stage-sections");
    parent.querySelectorAll(".section-tab").forEach(button => button.classList.toggle("active", button === tab));
    parent.querySelectorAll(".stage-section").forEach(panel => {
      panel.classList.toggle(
        "active",
        panel.dataset.sectionPanel === sectionType && panel.dataset.stage === stage && panel.dataset.courseId === courseId
      );
    });
  }

  function saveSectionNote(course, button) {
    const stage = button.dataset.stage;
    const sectionType = button.dataset.section;
    const textarea = $(`.course-notes[data-course-id="${CSS.escape(course.id)}"][data-stage="${CSS.escape(stage)}"][data-section="${CSS.escape(sectionType)}"]`);
    if (!textarea) return;
    const progress = getCourseProgress(course.id);
    progress.notes ||= {};
    progress.notes[`stage_${stage}_${sectionType}`] = textarea.value.trim();
    saveCourseProgress(course.id, progress);
    button.textContent = "Saved";
    window.setTimeout(() => { button.textContent = "Save Notes"; }, 1200);
  }

  function completeSection(course, button) {
    const stage = button.dataset.stage;
    const sectionType = button.dataset.section;
    const progress = getCourseProgress(course.id);
    progress.completedSections ||= {};
    progress.completedSections[`stage_${stage}_${sectionType}`] = true;
    const stageComplete = Object.keys(sectionLabels).every(type => progress.completedSections[`stage_${stage}_${type}`]);
    if (stageComplete && !progress.completedStages.includes(Number(stage))) progress.completedStages.push(Number(stage));
    saveCourseProgress(course.id, progress);
    button.textContent = "Completed";
    updateHeader();
    renderDashboard();
    renderCertificate();
    showToast("Progress saved for this course");
  }

  function bind() {
    els.chooseNonTech.addEventListener("click", () => showCatalog());
    els.backToCatalog.addEventListener("click", () => { location.href = "non-tech-roadmaps.html?browse=1"; });
    els.mobileMenu.addEventListener("click", () => $(".topbar nav").classList.toggle("open"));
    [els.careerSearch, els.difficultyFilter, els.durationFilter, els.salaryFilter, els.sortFilter].forEach(element => {
      element.addEventListener(element.tagName === "INPUT" ? "input" : "change", renderCatalog);
    });
    els.categoryFilter.addEventListener("change", () => {
      state.filter = els.categoryFilter.value;
      $$("button", els.categoryChips).forEach(button => button.classList.toggle("active", button.dataset.category === state.filter));
      renderCatalog();
    });
    els.categoryChips.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.filter = button.dataset.category;
      els.categoryFilter.value = state.filter;
      $$("button", els.categoryChips).forEach(item => item.classList.toggle("active", item === button));
      renderCatalog();
    });
    els.workspaceTabs.addEventListener("click", event => {
      const button = event.target.closest("[data-view]");
      if (button) switchView(button.dataset.view);
    });
    $(".flow-switch").addEventListener("click", event => {
      const button = event.target.closest("[data-flow]");
      if (!button) return;
      state.flow = button.dataset.flow;
      $$("button", $(".flow-switch")).forEach(item => item.classList.toggle("active", item === button));
      renderFlow();
    });
    els.flowchart.addEventListener("click", event => {
      const tab = event.target.closest(".section-tab");
      if (tab) {
        activateSectionTab(tab);
        return;
      }
      const saveButton = event.target.closest(".save-note-button");
      if (saveButton) {
        saveSectionNote(state.course, saveButton);
        return;
      }
      const completeButton = event.target.closest(".complete-section-button");
      if (completeButton) completeSection(state.course, completeButton);
    });
    document.addEventListener("click", event => {
      if (event.target.closest("#downloadCertificate")) window.print();
    });
  }

  function initializeNonTechCoursePage() {
    cache();
    const validationResult = validateNonTechCourses(nonTechCourses);
    if (!validationResult.valid) console.error("Non-tech course validation failed:", validationResult.errors);
    populateFilters();
    renderCatalog();
    bind();

    const params = new URLSearchParams(window.location.search);
    const courseSlug = params.get("course") || params.get("career");
    if (courseSlug) {
      const course = selectCourseBySlug(courseSlug);
      if (!course) {
        renderCourseNotFound();
        return;
      }
      renderCourse(course);
      return;
    }
    if (params.get("browse") === "1") showCatalog(false);
  }

  document.addEventListener("DOMContentLoaded", initializeNonTechCoursePage);
})();
