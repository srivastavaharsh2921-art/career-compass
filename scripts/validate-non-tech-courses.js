const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dataFile = path.join(__dirname, "..", "frontend", "nonTechRoadmapData.js");
const code = fs.readFileSync(dataFile, "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(code, context, { filename: dataFile });

const courses = context.window.NON_TECH_ROADMAPS || [];
const warnings = [];

const requiredFields = [
  "id", "title", "category", "icon", "shortDescription", "detailedDescription",
  "suitableFor", "eligibility", "duration", "difficulty", "estimatedLearningTime",
  "requiredSkills", "skillsToLearn", "tools", "roadmap", "beginnerProjects",
  "intermediateProjects", "advancedProjects", "certifications", "jobRoles",
  "industries", "higherStudyOptions", "freelanceOpportunities",
  "businessOpportunities", "interviewPreparation", "portfolioRequirements",
  "recommendedResources", "careerGrowthPath", "pros", "challenges",
  "futureScope", "finalOutcome", "modules"
];

const arrayFields = [
  "requiredSkills", "skillsToLearn", "tools", "beginnerProjects",
  "intermediateProjects", "advancedProjects", "certifications", "industries",
  "higherStudyOptions", "freelanceOpportunities", "businessOpportunities",
  "interviewPreparation", "portfolioRequirements", "recommendedResources",
  "careerGrowthPath", "pros", "challenges"
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function signature(value) {
  return JSON.stringify((value || []).map(normalize));
}

function shingles(value, size = 4) {
  const words = normalize(value).split(" ").filter(Boolean);
  if (words.length <= size) return new Set([words.join(" ")]);
  const result = new Set();
  for (let i = 0; i <= words.length - size; i += 1) result.add(words.slice(i, i + size).join(" "));
  return result;
}

function similarity(a, b) {
  const left = shingles(a);
  const right = shingles(b);
  const intersection = [...left].filter(item => right.has(item)).length;
  const union = new Set([...left, ...right]).size || 1;
  return intersection / union;
}

function pairwise(items, label, getText, threshold) {
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const score = similarity(getText(items[i]), getText(items[j]));
      if (score >= threshold) {
        warnings.push(`${label}:\n${items[i].title} and ${items[j].title} (${Math.round(score * 100)}% similar)`);
      }
    }
  }
}

function checkDuplicates(field, label) {
  const seen = new Map();
  courses.forEach(course => {
    const value = normalize(course[field]);
    if (!value) return;
    if (seen.has(value)) warnings.push(`${label}:\n${seen.get(value)} and ${course.title}`);
    else seen.set(value, course.title);
  });
}

function checkArrayDuplicates(field, label) {
  const seen = new Map();
  courses.forEach(course => {
    const items = course[field];
    if (!Array.isArray(items) || items.length === 0) return;
    const value = signature(items);
    if (seen.has(value)) warnings.push(`${label}:\n${seen.get(value)} and ${course.title}`);
    else seen.set(value, course.title);
  });
}

function checkMissing() {
  courses.forEach(course => {
    requiredFields.forEach(field => {
      const value = course[field];
      const missing = Array.isArray(value) ? value.length === 0 : value === undefined || value === null || value === "";
      if (missing) warnings.push(`Missing ${field}:\n${course.title || course.id || "Unknown course"}`);
    });
    if (!Array.isArray(course.roadmap) || course.roadmap.length === 0) warnings.push(`Missing roadmap:\n${course.title}`);
    if (!Array.isArray(course.modules) || course.modules.length === 0) warnings.push(`Missing modules:\n${course.title}`);
    (course.roadmap || []).forEach(phase => {
      ["phase", "title", "duration", "description", "topics", "practicalTasks", "milestone"].forEach(field => {
        const value = phase[field];
        const missing = Array.isArray(value) ? value.length === 0 : value === undefined || value === null || value === "";
        if (missing) warnings.push(`Missing roadmap ${field}:\n${course.title}`);
      });
    });
    (course.jobRoles || []).forEach(job => {
      ["role", "description", "requiredSkills", "fresherSalary", "experiencedSalary"].forEach(field => {
        const value = job[field];
        const missing = Array.isArray(value) ? value.length === 0 : value === undefined || value === null || value === "";
        if (missing) warnings.push(`Missing job role ${field}:\n${course.title}`);
      });
    });
  });
}

function roadmapText(course) {
  return (course.roadmap || [])
    .map(phase => [phase.title, phase.description, ...(phase.topics || []), ...(phase.practicalTasks || []), phase.milestone].join(" "))
    .join(" ");
}

function projectsText(course) {
  return [
    ...(course.beginnerProjects || []),
    ...(course.intermediateProjects || []),
    ...(course.advancedProjects || [])
  ].join(" ");
}

checkMissing();
checkDuplicates("id", "Duplicate course ID found");
checkDuplicates("title", "Duplicate title found");
checkDuplicates("shortDescription", "Duplicate description found");
checkDuplicates("detailedDescription", "Duplicate detailed description found");

arrayFields.forEach(field => checkArrayDuplicates(field, `Identical ${field} array found`));
checkArrayDuplicates("roles", "Duplicate job roles found");

pairwise(courses, "Highly similar description found", course => `${course.shortDescription} ${course.detailedDescription}`, 0.88);
pairwise(courses, "Highly similar roadmap found", roadmapText, 0.9);
pairwise(courses, "Highly similar project lists found", projectsText, 0.9);

if (warnings.length) {
  console.warn(warnings.join("\n\n"));
  process.exitCode = 1;
} else {
  console.log(`Non-tech course validation passed for ${courses.length} courses.`);
}
