const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "frontend", "nonTechRoadmapData.js");
const outputDir = path.join(root, "frontend", "data");
const outputPath = path.join(outputDir, "nonTechCourses.generated.js");

const source = fs.readFileSync(sourcePath, "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });

const legacyCourses = context.window.NON_TECH_ROADMAPS || [];

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : value ? [String(value)] : [];
}

function nestedLessons(title, items, tools) {
  const sourceItems = unique(items).slice(0, 4);
  const fallback = ["Core vocabulary", "Professional workflow", "Quality checks", "Portfolio evidence"];
  return (sourceItems.length ? sourceItems : fallback).map((item, index) => ({
    lesson: item,
    subLessons: unique([
      `How ${item} applies in ${title}`,
      `Beginner example for ${item}`,
      `Practice using ${tools[index % tools.length] || "a simple worksheet"}`,
      `Evidence to add to your ${title} portfolio`
    ])
  }));
}

function notesPrompts(title, stageTitle, sectionType) {
  return {
    summaryPrompt: `Summarize the most important ${title} idea from ${stageTitle}.`,
    doubtPrompt: `Write one doubt you still have about this ${sectionType} section.`,
    reflectionPrompt: `Note how this section can improve your ${title} portfolio or interview answer.`
  };
}

function section(course, stage, sectionType, config) {
  const tools = unique([...(config.tools || []), ...course.tools]).slice(0, 6);
  const concepts = unique([...(config.concepts || []), ...course.keyTopics]).slice(0, 6);
  const sectionTitle = {
    learn: `Learn: ${stage.title}`,
    practice: `Practice: ${stage.title}`,
    quiz: `Quiz: ${stage.title}`,
    project: `Project: ${stage.title}`
  }[sectionType];

  return {
    title: sectionTitle,
    whyThisTopicMatters: config.why || `${stage.title} matters because it builds practical ${course.title} judgement instead of only theory. It helps learners understand how professionals create useful work in ${course.industries?.[0] || course.category}.`,
    whatToStudyFirst: unique(config.studyFirst || [
      course.keyTopics[0],
      concepts[0],
      `${course.title} terminology`,
      `Examples from ${course.industries?.[0] || "the industry"}`
    ]),
    stepByStepLearningOrder: unique(config.steps || [
      `Read the ${stage.title} objective`,
      `Study ${concepts[0] || course.keyTopics[0]}`,
      `Practise with ${tools[0] || "a worksheet"}`,
      "Review mistakes and improve the output",
      "Add the final result to your notes or portfolio"
    ]),
    keyConceptsAndNestedLessons: nestedLessons(course.title, concepts, tools),
    toolsRequired: tools,
    realWorldExample: config.example || `A ${course.roles?.[0] || course.title + " learner"} applies ${stage.title} to a realistic brief, uses ${tools[0] || "a professional tool"}, reviews the result, and explains the decision clearly.`,
    commonMistakes: unique(config.mistakes || [
      "Starting without a clear brief or goal",
      "Copying a template without adapting it",
      "Skipping review, feedback, or quality checks",
      "Not saving proof of the work for a portfolio"
    ]),
    bestPracticesAndCheatSheet: unique(config.best || [
      "Clarify the audience and expected output first",
      "Use a checklist before submitting work",
      "Keep evidence, examples, and assumptions visible",
      "Write a short reflection after every practice task"
    ]),
    resources: unique(config.resources || [
      `Official help or documentation for ${tools[0] || course.title}`,
      `${course.title} beginner case studies`,
      `Recent job descriptions for ${course.roles?.[0] || course.title}`,
      `Portfolio examples from ${course.industries?.[0] || course.category}`
    ]),
    yourNotes: notesPrompts(course.title, stage.title, sectionType)
  };
}

function makeStage(course, stageNumber, title, objective, estimatedDuration, completionCriteria, seed) {
  const concepts = unique(seed.concepts || course.keyTopics).slice(0, 6);
  const tools = unique(seed.tools || course.tools).slice(0, 6);
  const projectName = seed.project || `${course.title} ${title} work sample`;
  const base = { stage: stageNumber, title, objective, estimatedDuration, completionCriteria };

  return {
    ...base,
    sections: {
      learn: section(course, base, "learn", {
        concepts,
        tools,
        why: `This learning section explains the concepts behind ${title} so you know what to do, why it matters, and how it appears in real ${course.title} work.`,
        studyFirst: [course.overview, ...concepts.slice(0, 3)],
        steps: [`Understand the goal of ${title}`, ...concepts.slice(0, 3).map(item => `Study ${item}`), "Write a short summary in your own words"],
        example: `A beginner ${course.title} learner studies ${concepts[0] || title}, checks examples from ${course.industries?.[0] || course.category}, and explains the workflow before trying a task.`
      }),
      practice: section(course, base, "practice", {
        concepts,
        tools,
        why: `Practice converts ${title} from theory into repeatable skill. This is where learners build confidence with ${tools[0] || "the main tool"} and get used to professional constraints.`,
        studyFirst: [`The learn section for ${title}`, ...tools.slice(0, 2), "The completion criteria for this stage"],
        steps: [`Set a 45-minute practice block`, `Use ${tools[0] || "a worksheet"} for a guided task`, `Apply ${concepts[0] || title}`, "Compare your output with a professional example", "Record what you will improve next"],
        example: `A ${course.roles?.[0] || course.title + " professional"} practises ${concepts[0] || title} on a small brief, asks for feedback, and revises the work before saving it.`,
        mistakes: ["Practising without a time limit", "Ignoring feedback", "Using tools before understanding the brief", "Doing only theory notes without an output"]
      }),
      quiz: section(course, base, "quiz", {
        concepts,
        tools,
        why: `The quiz section checks whether you can explain ${title}, choose the right tool, and avoid common mistakes in ${course.title} scenarios.`,
        studyFirst: [...concepts.slice(0, 4), `Common mistakes in ${title}`],
        steps: [`Define ${concepts[0] || title}`, `List two tools used in ${title}`, "Answer one scenario question", "Explain one mistake and its fix", "Revise weak answers"],
        example: `In an interview, a recruiter asks how you would handle ${title}. A strong answer names the goal, tool, process, risk, and final evidence.`,
        best: ["Answer in short structured points", "Use one real example", "Mention tools only when relevant", "Connect the answer to portfolio proof"]
      }),
      project: section(course, base, "project", {
        concepts,
        tools,
        why: `The project section creates proof that you can apply ${title} in a real ${course.title} context. It should become part of your portfolio.`,
        studyFirst: [`Project brief for ${projectName}`, ...concepts.slice(0, 2), ...tools.slice(0, 2)],
        steps: [`Write a one-paragraph brief for ${projectName}`, `Collect examples and references`, `Build the first version using ${tools[0] || "the main tool"}`, "Review against the completion criteria", "Publish or save the final case study"],
        example: `A learner builds "${projectName}", documents the decisions, includes screenshots or outputs, and explains what improved after feedback.`,
        mistakes: ["Submitting only the final file without context", "Forgetting assumptions and constraints", "Not naming the target audience", "Leaving the project out of the portfolio"],
        best: ["Show brief, process, final output, and reflection", "Use clear labels and screenshots", "Mention tools used", "End with one measurable learning outcome"]
      })
    }
  };
}

function convertCourse(legacy) {
  const id = legacy.id || slug(legacy.title || legacy.name);
  const title = legacy.title || legacy.name;
  const keyTopics = unique([
    ...(legacy.skillsToLearn || []),
    ...(legacy.requiredSkills || []),
    ...((legacy.roadmap || []).flatMap(phase => phase.topics || []))
  ]).slice(0, 14);
  const course = {
    id,
    slug: legacy.slug || id,
    title,
    type: "Non-Tech Career",
    overview: legacy.shortDescription || legacy.description || legacy.detailedDescription || `${title} career roadmap.`,
    category: legacy.category,
    icon: legacy.icon || "ph-briefcase",
    duration: legacy.duration || "4-8 months",
    difficulty: legacy.difficulty || "Beginner friendly",
    tools: unique(legacy.tools || []),
    keyTopics,
    roles: unique([...(legacy.roles || []), ...((legacy.jobRoles || []).map(item => item.role))]),
    industries: unique(legacy.industries || []),
    stages: []
  };

  const roadmap = legacy.roadmap || [];
  const beginnerProjects = legacy.beginnerProjects || [];
  const intermediateProjects = legacy.intermediateProjects || [];
  const advancedProjects = legacy.advancedProjects || [];

  const stageSeeds = [
    {
      title: `${title} Orientation`,
      objective: `Understand the ${title} career path, industry use cases, entry roles, and portfolio expectations.`,
      duration: "1-2 weeks",
      criteria: [`Explain what ${title} professionals do`, "Identify suitable entry roles", "Create a personal learning goal"],
      concepts: roadmap[0]?.topics || keyTopics.slice(0, 5),
      project: `${title} career map`
    },
    {
      title: `${title} Foundations`,
      objective: `Build the beginner concepts and vocabulary needed for practical ${title} work.`,
      duration: "2-3 weeks",
      criteria: [`Define core ${title} terms`, "Complete a foundation worksheet", "Explain one beginner workflow"],
      concepts: roadmap[1]?.topics || keyTopics.slice(0, 6),
      project: `${title} foundation worksheet`
    },
    {
      title: `${title} Tools and Workflows`,
      objective: `Practise the tools, documents, dashboards, or systems used in daily ${title} work.`,
      duration: "2-4 weeks",
      criteria: ["Use at least two relevant tools", "Document a repeatable workflow", "Identify quality checks"],
      concepts: roadmap[2]?.topics || keyTopics.slice(2, 8),
      tools: course.tools,
      project: `${title} tool-practice file`
    },
    {
      title: `${title} Applied Skills`,
      objective: `Apply core skills to realistic scenarios and start building field-specific judgement.`,
      duration: "3-4 weeks",
      criteria: ["Complete two applied tasks", "Request or simulate feedback", "Revise one output"],
      concepts: keyTopics.slice(4, 10),
      project: beginnerProjects[0] || `${title} starter project`
    },
    {
      title: `${title} Portfolio Project`,
      objective: `Create a beginner-to-intermediate portfolio project that proves practical ${title} capability.`,
      duration: "3-5 weeks",
      criteria: ["Create a brief", "Build the project", "Write a short case study"],
      concepts: roadmap[3]?.topics || keyTopics.slice(6, 12),
      project: intermediateProjects[0] || `${title} portfolio case study`
    },
    {
      title: `${title} Internship and Job Preparation`,
      objective: `Prepare resume proof, interview examples, and assignment practice for ${title} opportunities.`,
      duration: "2-3 weeks",
      criteria: ["Create a targeted resume section", "Prepare project walkthrough answers", "Practise role-specific interview questions"],
      concepts: roadmap[4]?.topics || keyTopics.slice(1, 8),
      project: `${title} job application kit`
    },
    {
      title: `${title} Advanced Practice`,
      objective: `Move toward higher-quality work by handling ambiguity, stakeholders, and measurable outcomes.`,
      duration: "4-6 weeks",
      criteria: ["Complete one advanced scenario", "Explain tradeoffs", "Use metrics or evidence"],
      concepts: roadmap[5]?.topics || keyTopics.slice(-6),
      project: advancedProjects[0] || `${title} advanced project`
    },
    {
      title: `${title} Career Launch`,
      objective: `Package your best work, plan applications or freelance outreach, and define next growth steps.`,
      duration: "2-4 weeks",
      criteria: ["Finalize portfolio", "Prepare interview stories", "Create a 30-day application or outreach plan"],
      concepts: unique([...(legacy.portfolioRequirements || []), ...(legacy.interviewPreparation || []), ...(legacy.careerGrowthPath || [])]).slice(0, 6),
      project: advancedProjects[1] || `${title} final portfolio presentation`
    }
  ];

  course.stages = stageSeeds.map((seed, index) => makeStage(
    course,
    index + 1,
    seed.title,
    seed.objective,
    seed.duration,
    seed.criteria,
    seed
  ));

  return course;
}

const nonTechCourses = legacyCourses.map(convertCourse);

const validationSource = `export function validateNonTechCourses(courses = nonTechCourses) {
  const errors = [];
  const sectionTypes = ["learn", "practice", "quiz", "project"];
  const requiredSectionFields = [
    "title",
    "whyThisTopicMatters",
    "whatToStudyFirst",
    "stepByStepLearningOrder",
    "keyConceptsAndNestedLessons",
    "toolsRequired",
    "realWorldExample",
    "commonMistakes",
    "bestPracticesAndCheatSheet",
    "resources",
    "yourNotes"
  ];
  const seenIds = new Set();
  const seenSlugs = new Set();

  if (!Array.isArray(courses) || courses.length === 0) {
    errors.push("nonTechCourses must be a non-empty array.");
  }

  (courses || []).forEach((course) => {
    if (!course.id) errors.push("A course is missing id.");
    if (!course.slug) errors.push(\`\${course.title || course.id || "Unknown course"} is missing slug.\`);
    if (!course.title) errors.push(\`\${course.id || course.slug || "Unknown course"} is missing title.\`);
    if (seenIds.has(course.id)) errors.push(\`Duplicate course id: \${course.id}\`);
    if (seenSlugs.has(course.slug)) errors.push(\`Duplicate course slug: \${course.slug}\`);
    seenIds.add(course.id);
    seenSlugs.add(course.slug);

    ["tools", "keyTopics", "stages"].forEach((field) => {
      if (!Array.isArray(course[field]) || course[field].length === 0) {
        errors.push(\`\${course.title || course.id} has empty or missing \${field}.\`);
      }
    });

    if (!Array.isArray(course.stages) || course.stages.length !== 8) {
      errors.push(\`\${course.title || course.id} must have exactly 8 stages.\`);
      return;
    }

    course.stages.forEach((stage) => {
      if (!stage.stage) errors.push(\`\${course.title} has a stage without stage number.\`);
      ["title", "objective", "estimatedDuration", "completionCriteria", "sections"].forEach((field) => {
        const value = stage[field];
        const empty = Array.isArray(value) ? value.length === 0 : !value;
        if (empty) errors.push(\`\${course.title} stage \${stage.stage} missing \${field}.\`);
      });

      sectionTypes.forEach((sectionType) => {
        const section = stage.sections?.[sectionType];
        if (!section) {
          errors.push(\`\${course.title} stage \${stage.stage} missing \${sectionType} section.\`);
          return;
        }
        requiredSectionFields.forEach((field) => {
          const value = section[field];
          const emptyArray = Array.isArray(value) && value.length === 0;
          const emptyObject = value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0;
          if (value === undefined || value === null || value === "" || emptyArray || emptyObject) {
            errors.push(\`\${course.title} stage \${stage.stage} \${sectionType} missing \${field}.\`);
          }
        });
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    courseCount: Array.isArray(courses) ? courses.length : 0
  };
}`;

fs.mkdirSync(outputDir, { recursive: true });
const output = `// Generated non-tech course dataset for Career Compass. Do not edit by hand.
// Source normalized from frontend/nonTechRoadmapData.js into the 8-stage section schema.

export const nonTechCourses = ${JSON.stringify(nonTechCourses, null, 2)};

${validationSource}

if (typeof window !== "undefined") {
  window.nonTechCourses = nonTechCourses;
  window.validateNonTechCourses = validateNonTechCourses;
}
`;

fs.writeFileSync(outputPath, output);
console.log(`Generated ${nonTechCourses.length} non-tech courses at ${path.relative(root, outputPath)}`);
