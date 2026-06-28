/* Connected course roadmaps generated from the canonical career roadmap catalog. */
(() => {
    "use strict";

    const planner = document.getElementById("careerCoursePlanner");
    const select = document.getElementById("careerCourseSelect");
    const path = document.getElementById("careerCoursePath");
    if (!planner || !select || !path || typeof COURSES_DATABASE === "undefined") return;

    const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
    const broadCategory = category => ({
        "Web Development": "Programming",
        "Programming Languages": "Programming",
        "Backend & Data": "Programming",
        "Data & AI": "Data & AI",
        "Security & Cloud": "Programming",
        "Design & Product": "Design",
        "Mobile & Emerging": "Programming",
        "Business & Growth": "Marketing",
        "Computer Science": "Programming"
    }[category] || "Programming");

    const starterTopics = {
        "Web Development": ["Computer basics", "Files & folders", "Browser basics", "Code editor"],
        "Programming Languages": ["Computer basics", "Logical thinking", "Terminal basics", "Code editor"],
        "Backend & Data": ["Computer basics", "Internet basics", "Terminal basics", "Data basics"],
        "Data & AI": ["Computer basics", "Spreadsheets", "Basic algebra", "Data questions"],
        "Security & Cloud": ["Computer basics", "Operating systems", "Networks", "Digital safety"],
        "Design & Product": ["Computer basics", "Visual principles", "Product thinking", "Design tools"],
        "Mobile & Emerging": ["Computer basics", "Logical thinking", "Editor & SDK", "Debugging"],
        "Business & Growth": ["Computer basics", "Spreadsheets", "Communication", "Customer basics"],
        "Computer Science": ["Computer basics", "Logic", "Basic mathematics", "How programs run"]
    };

    let careers = [];

    function splitIntoCourses(career) {
        const nodes = [{ title: "Absolute Beginner Setup", time: 12, topics: starterTopics[career.category] || starterTopics["Computer Science"] }, ...career.nodes];
        const groups = [
            { name: "Foundation Course", level: "Beginner", nodes: nodes.slice(0, 3) },
            { name: "Core Skills Course", level: "Intermediate", nodes: nodes.slice(3, 6) },
            { name: "Job-Ready Course", level: "Advanced", nodes: nodes.slice(6) }
        ];
        return groups.map((group, index) => ({
            id: 10000 + careers.indexOf(career) * 10 + index,
            title: `${career.label}: ${group.name}`,
            category: broadCategory(career.category),
            platform: "Career Compass",
            instructor: `${career.role} guided path`,
            rating: career.rating,
            reviews: "guided path",
            enrolled: career.popularity,
            duration: `${group.nodes.reduce((sum, node) => sum + node.time, 0)} hours`,
            level: group.level,
            price: "Free",
            isFree: true,
            skills: [...new Set(group.nodes.flatMap(node => node.topics))].slice(0, 7),
            image: `https://images.unsplash.com/photo-${index === 0 ? "1516321318423-f06f85e504b3" : index === 1 ? "1517694712202-14dd9538aa97" : "1552664730-d307ca884978"}?auto=format&fit=crop&w=600&q=80`,
            careerId: career.id,
            roadmapNode: index === 0 ? 0 : index === 1 ? 3 : 6,
            sequence: index + 1,
            phaseNodes: group.nodes
        }));
    }

    function renderPath(careerId) {
        const career = careers.find(item => item.id === careerId) || careers[0];
        if (!career) return;
        select.value = career.id;
        const modules = COURSES_DATABASE.filter(course => course.careerId === career.id);
        path.innerHTML = modules.map((course, index) => `
            <article class="path-step">
                <span class="path-number">${String(index + 1).padStart(2, "0")}</span>
                <div class="path-step-copy">
                    <span>${escapeHtml(course.level)} · ${escapeHtml(course.duration)}</span>
                    <h3>${escapeHtml(course.title.replace(`${career.label}: `, ""))}</h3>
                    <p>${course.phaseNodes.map(node => escapeHtml(node.title)).join(" → ")}</p>
                    <div>${course.skills.slice(0, 4).map(skill => `<em>${escapeHtml(skill)}</em>`).join("")}</div>
                </div>
                <button type="button" data-open-course="${course.id}">${index ? "Continue phase" : "Start from zero"}<i class="fa-solid fa-arrow-right"></i></button>
            </article>
        `).join("") + `<a class="open-full-roadmap" href="roadmap.html?topic=${encodeURIComponent(career.id)}"><i class="fa-solid fa-route"></i> Open full ${escapeHtml(career.label)} roadmap</a>`;
    }

    async function init() {
        try {
            const response = await fetch("data/roadmaps.json", { cache: "no-cache" });
            if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
            careers = (await response.json()).roadmaps;
            const generated = careers.flatMap(splitIntoCourses);
            COURSES_DATABASE.push(...generated);
            select.innerHTML = careers.map(career => `<option value="${escapeHtml(career.id)}">${escapeHtml(career.role)}</option>`).join("");
            const requested = new URLSearchParams(location.search).get("career");
            renderPath(careers.some(item => item.id === requested) ? requested : careers[0].id);
            renderCourses();
        } catch (error) {
            path.innerHTML = `<div class="planner-error"><i class="fa-solid fa-circle-exclamation"></i><span>Course roadmaps could not load. ${escapeHtml(error.message)}</span></div>`;
        }
    }

    select.addEventListener("change", () => renderPath(select.value));
    path.addEventListener("click", event => {
        const button = event.target.closest("[data-open-course]");
        if (button) window.enrollMock(Number(button.dataset.openCourse));
    });

    init();
})();
