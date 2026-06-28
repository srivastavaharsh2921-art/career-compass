/* Career Compass Pro Roadmap Generator
   Data-driven roadmaps, sequential unlocks, quizzes, notes, and local progress. */
(() => {
  "use strict";

  const STORAGE_KEY = "careerCompassProRoadmaps_v1";
  const LAST_ROADMAP_KEY = "careerCompassLastRoadmap";

  const stage = (title, items, time, difficulty = "Beginner", extras = {}) => ({
    title, items, time, difficulty, ...extras
  });

  const ROADMAPS = {
    frontend: {
      label: "Frontend",
      title: "Frontend Developer Roadmap",
      description: "Build accessible, responsive interfaces and ship production-ready web applications.",
      icon: "ph-browser",
      aliases: ["frontend", "front end", "frontend development", "web development"],
      docs: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
      nodes: [
        stage("Computer & Web Basics", ["Internet", "Browser", "HTTP", "HTTPS", "DNS", "Hosting Basics"], 8),
        stage("HTML Foundations", ["HTML Structure", "Head & Body", "Text Formatting", "Lists", "Links", "Images", "Tables", "Forms", "Semantic HTML", "Accessibility"], 18),
        stage("CSS & Responsive Design", ["Selectors", "Colors", "Typography", "Margin", "Padding", "Border", "Flexbox", "Grid", "Position", "Animations", "Responsive Design", "Media Queries"], 28),
        stage("JavaScript Essentials", ["Variables", "Data Types", "Operators", "Loops", "Functions", "Arrays", "Objects", "DOM", "Events", "Async JavaScript", "Fetch API", "Promises", "ES6"], 45, "Intermediate"),
        stage("Developer Workflow", ["Git & GitHub", "npm", "Vite"], 12, "Intermediate"),
        stage("React", ["JSX", "Components", "Props", "State", "Hooks", "Routing", "Context API", "API Integration"], 40, "Intermediate"),
        stage("Modern Frontend Stack", ["Next.js", "Tailwind CSS", "Authentication"], 32, "Advanced"),
        stage("Deployment", ["Vercel", "Netlify", "Cloudflare"], 8, "Intermediate"),
        stage("Portfolio Projects", ["Portfolio", "Todo App", "Weather App", "E-commerce", "Dashboard"], 60, "Advanced")
      ]
    },
    backend: {
      label: "Backend",
      title: "Backend Developer Roadmap",
      description: "Learn server-side JavaScript, databases, secure APIs, and reliable deployment.",
      icon: "ph-database",
      aliases: ["backend", "back end", "backend development", "node backend"],
      docs: "https://nodejs.org/docs/latest/api/",
      nodes: [
        stage("JavaScript for Backend", ["Programming Language: JavaScript", "Variables", "Functions", "Objects", "Async JavaScript"], 24),
        stage("Node.js & Express.js", ["Node.js", "Express.js", "Environment Variables"], 28),
        stage("API Foundations", ["REST API", "HTTP Methods", "CRUD", "JSON"], 24, "Intermediate"),
        stage("Databases", ["MongoDB", "MySQL", "PostgreSQL"], 38, "Intermediate"),
        stage("Authentication", ["JWT", "Cookies", "Sessions", "Password Hashing: bcrypt"], 26, "Intermediate"),
        stage("Application Services", ["File Upload", "Email Service"], 18, "Intermediate"),
        stage("Backend Security", ["Helmet", "CORS", "Rate Limiting", "Validation"], 20, "Advanced"),
        stage("Deployment", ["Cloud Hosting", "Logging", "Production Configuration", "Monitoring"], 16, "Advanced"),
        stage("Backend Projects", ["Task API", "Authentication Service", "E-commerce API", "Real-time Chat Backend"], 54, "Advanced")
      ]
    },
    java: {
      label: "Java",
      title: "Java Developer Roadmap",
      description: "Move from Java fundamentals and object-oriented thinking to Spring Boot applications.",
      icon: "ph-coffee",
      aliases: ["java", "java programming", "spring boot"],
      docs: "https://dev.java/learn/",
      nodes: [
        stage("Java Platform", ["JVM", "JDK", "JRE"], 8),
        stage("Language Fundamentals", ["Variables", "Data Types", "Operators", "Loops", "Functions"], 24),
        stage("Arrays & Strings", ["Arrays", "Strings"], 14),
        stage("Object-Oriented Programming", ["Class", "Object", "Inheritance", "Polymorphism", "Abstraction", "Encapsulation"], 34, "Intermediate"),
        stage("Robust Java", ["Exception Handling", "Collections"], 26, "Intermediate"),
        stage("Concurrency", ["Threads", "Multithreading", "Synchronization", "Executors"], 22, "Advanced"),
        stage("Database Connectivity", ["JDBC", "SQL Integration", "Connection Pooling"], 18, "Intermediate"),
        stage("Spring Boot", ["Spring Boot", "REST Controllers", "Dependency Injection", "Spring Data JPA"], 42, "Advanced"),
        stage("Java Projects", ["Console App", "Library Manager", "REST API", "Spring Boot Web App"], 55, "Advanced")
      ]
    },
    python: {
      label: "Python",
      title: "Python Developer Roadmap",
      description: "Master Python syntax, problem solving, data libraries, and web application frameworks.",
      icon: "ph-file-py",
      aliases: ["python", "python programming", "django", "flask"],
      docs: "https://docs.python.org/3/tutorial/",
      nodes: [
        stage("Setup & First Program", ["Installation", "Input Output"], 5),
        stage("Python Fundamentals", ["Variables", "Data Types", "Operators", "If Else", "Loops"], 22),
        stage("Functions & Collections", ["Functions", "Lists", "Tuples", "Sets", "Dictionaries"], 28),
        stage("Files & Errors", ["File Handling", "Exception Handling"], 16, "Intermediate"),
        stage("Object-Oriented Python", ["OOP", "Classes", "Objects", "Inheritance"], 22, "Intermediate"),
        stage("Python Tooling", ["Modules", "Virtual Environment", "Pip"], 12, "Intermediate"),
        stage("Data Libraries", ["NumPy", "Pandas", "Matplotlib"], 35, "Intermediate"),
        stage("Web Frameworks", ["Flask", "Django"], 42, "Advanced"),
        stage("Python Projects", ["CLI Utility", "Data Dashboard", "Flask API", "Django Application"], 55, "Advanced")
      ]
    },
    saas: {
      label: "SaaS Programming",
      title: "SaaS Programming Roadmap",
      description: "Go from web fundamentals to building, charging for, deploying, and launching a SaaS product.",
      icon: "ph-rocket-launch",
      aliases: ["saas", "saas programming", "software as a service", "startup"],
      docs: "https://nextjs.org/docs",
      nodes: [
        stage("Web Foundations", ["HTML", "CSS", "JavaScript"], 48),
        stage("Product Frontend", ["React", "Next.js"], 48, "Intermediate"),
        stage("Backend & Data", ["Backend", "Database", "API Design"], 42, "Intermediate"),
        stage("Users & Access", ["Authentication", "Authorization", "User Accounts"], 24, "Intermediate"),
        stage("Payments", ["Stripe", "Razorpay", "Subscriptions", "Webhooks"], 28, "Advanced"),
        stage("Product Services", ["Email", "Notifications", "File Storage", "Cloudinary"], 28, "Intermediate"),
        stage("Infrastructure", ["AWS Basics", "Docker", "CI/CD"], 36, "Advanced"),
        stage("Growth & Measurement", ["Analytics", "SEO"], 18, "Intermediate"),
        stage("Ship Your SaaS", ["Deployment", "Launch Product", "Feedback Loop", "Iteration"], 45, "Advanced")
      ]
    },
    uiux: {
      label: "UI/UX",
      title: "UI/UX Designer Roadmap",
      description: "Learn human-centered design from research and structure through polished prototypes and portfolios.",
      icon: "ph-bezier-curve",
      aliases: ["ui ux", "ui/ux", "ui/ux design", "ux design", "product design"],
      docs: "https://m3.material.io/foundations",
      nodes: [
        stage("Visual Design Foundations", ["Design Principles", "Color Theory", "Typography", "Layout"], 25),
        stage("User Research", ["User Research", "User Persona", "Journey Map"], 24),
        stage("Structure & Wireframes", ["Information Architecture", "Wireframing", "User Flows"], 22, "Intermediate"),
        stage("Figma Essentials", ["Figma", "Auto Layout", "Components"], 30, "Intermediate"),
        stage("Design Systems", ["Design Systems", "Tokens", "Patterns", "Documentation"], 26, "Intermediate"),
        stage("Prototyping", ["Prototyping", "Interactions", "Usability Testing"], 25, "Intermediate"),
        stage("Inclusive Interfaces", ["Responsive Design", "Accessibility"], 20, "Advanced"),
        stage("Portfolio Projects", ["Mobile App Case Study", "Website Redesign", "SaaS Dashboard", "Portfolio Projects"], 55, "Advanced")
      ]
    },
    dataScience: {
      label: "Data Scientist",
      title: "Data Scientist Roadmap",
      description: "Learn to investigate data, build predictive models, communicate findings, and deliver end-to-end data products.",
      icon: "ph-chart-scatter",
      aliases: ["data scientist", "data science", "data scientist course"],
      docs: "https://pandas.pydata.org/docs/user_guide/",
      nodes: [
        stage("Python & Jupyter Foundations", ["Python", "Jupyter Notebook", "Functions", "Data Structures", "Virtual Environments"], 32),
        stage("Statistics & Probability", ["Descriptive Statistics", "Probability", "Distributions", "Sampling", "Hypothesis Testing"], 45),
        stage("Data Collection & SQL", ["SQL", "Joins", "Aggregations", "APIs", "Web Data", "Data Ethics"], 38, "Intermediate"),
        stage("Data Wrangling", ["NumPy", "Pandas", "Missing Values", "Outliers", "Feature Types"], 42, "Intermediate"),
        stage("Exploratory Data Analysis", ["Matplotlib", "Seaborn", "Correlation", "Segmentation", "Data Storytelling"], 36, "Intermediate"),
        stage("Machine Learning", ["Regression", "Classification", "Clustering", "Model Selection", "Cross-validation"], 58, "Intermediate"),
        stage("Advanced Modeling", ["Feature Engineering", "Ensembles", "Time Series", "Natural Language Processing", "Explainability"], 55, "Advanced"),
        stage("Data Products & MLOps", ["Streamlit", "FastAPI", "Model Tracking", "Docker", "Monitoring"], 42, "Advanced"),
        stage("Data Science Portfolio", ["Business EDA", "Prediction Project", "Experiment Analysis", "Deployed Data App"], 70, "Advanced")
      ]
    },
    machineLearning: {
      label: "Machine Learning",
      title: "Machine Learning Engineer Roadmap",
      description: "Master model development from mathematical foundations and clean training data to deployment and monitoring.",
      icon: "ph-function",
      aliases: ["machine learning", "ml", "machine learning engineer", "ml engineer"],
      docs: "https://scikit-learn.org/stable/user_guide.html",
      nodes: [
        stage("Python for Machine Learning", ["Python", "NumPy", "Pandas", "Jupyter", "Git"], 36),
        stage("Mathematical Foundations", ["Linear Algebra", "Calculus", "Probability", "Statistics", "Optimization"], 55),
        stage("Data Preparation", ["Data Cleaning", "Encoding", "Scaling", "Feature Engineering", "Train Test Split"], 36, "Intermediate"),
        stage("Supervised Learning", ["Linear Regression", "Logistic Regression", "Decision Trees", "Random Forests", "Support Vector Machines"], 52, "Intermediate"),
        stage("Unsupervised Learning", ["Clustering", "Dimensionality Reduction", "Anomaly Detection", "Recommendation Basics"], 38, "Intermediate"),
        stage("Model Evaluation", ["Metrics", "Cross-validation", "Hyperparameter Tuning", "Data Leakage", "Bias & Variance"], 36, "Intermediate"),
        stage("Deep Learning", ["Neural Networks", "Backpropagation", "PyTorch", "CNNs", "Transformers"], 65, "Advanced"),
        stage("Production ML", ["Model APIs", "Docker", "Experiment Tracking", "CI/CD", "Drift Monitoring"], 48, "Advanced"),
        stage("ML Engineering Projects", ["Churn Predictor", "Recommendation Engine", "Image Classifier", "Production Model Service"], 72, "Advanced")
      ]
    },
    artificialIntelligence: {
      label: "Artificial Intelligence",
      title: "Artificial Intelligence Engineer Roadmap",
      description: "Build intelligent applications using classical AI, deep learning, language models, retrieval, and responsible AI practices.",
      icon: "ph-brain",
      aliases: ["artificial intelligence", "ai", "ai engineer", "generative ai"],
      docs: "https://pytorch.org/docs/stable/index.html",
      nodes: [
        stage("AI Foundations", ["AI vs ML", "Python", "Algorithms", "Data Structures", "Problem Formulation"], 34),
        stage("Math for Intelligent Systems", ["Linear Algebra", "Probability", "Calculus", "Optimization"], 50),
        stage("Classical AI", ["Search", "Heuristics", "Knowledge Representation", "Constraint Satisfaction", "Planning"], 42, "Intermediate"),
        stage("Machine Learning Core", ["Regression", "Classification", "Clustering", "Feature Engineering", "Evaluation"], 52, "Intermediate"),
        stage("Deep Learning", ["Neural Networks", "PyTorch", "CNNs", "Sequence Models", "Transformers"], 65, "Advanced"),
        stage("Language & Vision", ["Natural Language Processing", "Computer Vision", "Embeddings", "Multimodal Models"], 52, "Advanced"),
        stage("Generative AI Systems", ["Large Language Models", "Prompt Engineering", "RAG", "Vector Databases", "AI Agents"], 58, "Advanced"),
        stage("Responsible & Production AI", ["AI Safety", "Bias", "Evaluation", "Guardrails", "Deployment", "Monitoring"], 42, "Advanced"),
        stage("AI Portfolio Projects", ["Vision App", "RAG Assistant", "Tool-using Agent", "Evaluated AI Product"], 75, "Advanced")
      ]
    },
    dataAnalysis: {
      label: "Data Analysis",
      title: "Data Analyst Roadmap",
      description: "Turn raw business data into trustworthy reports, clear dashboards, and decisions stakeholders can act on.",
      icon: "ph-chart-bar",
      aliases: ["data analysis", "data analytics", "data analyst", "business intelligence analyst"],
      docs: "https://pandas.pydata.org/docs/user_guide/",
      nodes: [
        stage("Analytics Foundations", ["Business Questions", "Metrics", "Data Types", "Analytical Thinking", "Data Ethics"], 20),
        stage("Spreadsheets", ["Excel", "Google Sheets", "Formulas", "Pivot Tables", "Lookups", "Data Validation"], 36),
        stage("SQL for Analysis", ["SELECT", "Filtering", "Joins", "Aggregations", "CTEs", "Window Functions"], 45, "Intermediate"),
        stage("Cleaning Data", ["Missing Values", "Duplicates", "Outliers", "Text Cleaning", "Quality Checks"], 30, "Intermediate"),
        stage("Python Analytics", ["Python", "NumPy", "Pandas", "Jupyter", "Automation"], 42, "Intermediate"),
        stage("Statistics for Decisions", ["Descriptive Statistics", "Sampling", "Confidence Intervals", "Hypothesis Testing", "A/B Testing"], 40, "Intermediate"),
        stage("Visualization & Dashboards", ["Matplotlib", "Seaborn", "Power BI", "Tableau", "Dashboard Design"], 46, "Intermediate"),
        stage("Business Intelligence", ["KPI Design", "Data Modeling", "DAX", "Storytelling", "Stakeholder Communication"], 38, "Advanced"),
        stage("Data Analyst Portfolio", ["Sales Dashboard", "Customer Analysis", "A/B Test Report", "Executive Presentation"], 60, "Advanced")
      ]
    },
    cybersecurity: {
      label: "Cyber Security",
      title: "Cyber Security Roadmap",
      description: "Build defensive security foundations and learn ethical, lab-based security testing workflows.",
      icon: "ph-shield-check",
      aliases: ["cyber security", "cybersecurity", "ethical hacking", "security"],
      docs: "https://owasp.org/www-project-web-security-testing-guide/",
      nodes: [
        stage("Systems Foundations", ["Computer Networks", "Operating System Basics", "Linux", "Command Line"], 38),
        stage("Programming Basics", ["Programming", "Python", "Shell Scripting"], 28),
        stage("Network Protocols", ["TCP/IP", "HTTP", "DNS"], 28, "Intermediate"),
        stage("Cryptography", ["Cryptography", "Hashing", "Encryption", "Certificates"], 24, "Intermediate"),
        stage("Web Security", ["OWASP Top 10", "Web Security", "Ethical Hacking"], 38, "Intermediate"),
        stage("Traffic & Web Tools", ["Burp Suite", "Wireshark"], 26, "Advanced"),
        stage("Security Testing Tools", ["Metasploit", "Nmap"], 26, "Advanced"),
        stage("CTF Practice", ["CTF Practice", "Reconnaissance", "Web Challenges", "Forensics"], 45, "Advanced"),
        stage("Security Projects", ["Home Lab", "Vulnerability Report", "Network Audit", "Secure Web App"], 55, "Advanced")
      ]
    }
  };

  const state = {
    key: "frontend",
    roadmap: ROADMAPS.frontend,
    pendingKey: null,
    selectedNode: null,
    store: loadStore()
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const elements = {};

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function slug(value) {
    return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "custom";
  }

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.store));
  }

  function getSaved() {
    if (!state.store[state.key]) state.store[state.key] = { completed: [], notes: {}, quizzes: {} };
    return state.store[state.key];
  }

  function isCompleted(index) { return getSaved().completed.includes(index); }
  function isUnlocked(index) { return index === 0 || isCompleted(index - 1); }

  function findRoadmap(query) {
    const normalized = query.toLowerCase().trim().replace(/[\/_-]+/g, " ").replace(/\s+/g, " ");
    const padded = ` ${normalized} `;
    return Object.entries(ROADMAPS).find(([, roadmap]) => roadmap.aliases.some(alias => normalized === alias || padded.includes(` ${alias} `))) || null;
  }

  function createCustomRoadmap(topic) {
    const cleanTopic = topic.trim().replace(/\s+/g, " ").slice(0, 70);
    return {
      label: cleanTopic,
      title: `${cleanTopic} Roadmap`,
      description: `A practical beginner-to-advanced learning path for ${cleanTopic}, generated by Career Compass Pro.`,
      icon: "ph-path",
      aliases: [cleanTopic.toLowerCase()],
      docs: `https://www.google.com/search?q=${encodeURIComponent(`${cleanTopic} official documentation`)}`,
      custom: true,
      nodes: [
        stage(`${cleanTopic} Orientation`, ["What it is", "Where it is used", "Career opportunities", "Learning setup"], 5),
        stage("Core Foundations", ["Essential vocabulary", "Fundamental principles", "Basic workflow", "Common tools"], 15),
        stage("Beginner Skills", ["Guided exercises", "Small examples", "Debugging basics", "Good habits"], 22),
        stage("Build Your First Project", ["Project planning", "Core implementation", "Testing", "Reflection"], 24, "Intermediate"),
        stage("Intermediate Concepts", ["Patterns", "Reusable techniques", "Performance", "Collaboration"], 28, "Intermediate"),
        stage("Professional Toolkit", ["Industry tools", "Version control", "Documentation", "Quality checks"], 20, "Intermediate"),
        stage("Advanced Practice", ["Architecture", "Optimization", "Security", "Scalability"], 35, "Advanced"),
        stage("Portfolio Challenge", ["Real-world brief", "Independent build", "Case study", "Peer feedback"], 42, "Advanced"),
        stage("Career Launch", ["Portfolio polish", "Interview practice", "Community contribution", "Continuous learning"], 18, "Advanced")
      ]
    };
  }

  function renderChips(filter = "") {
    const query = filter.toLowerCase().trim();
    const matches = Object.entries(ROADMAPS).filter(([, item]) => !query || item.label.toLowerCase().includes(query) || item.aliases.some(alias => alias.includes(query)));
    elements.chips.innerHTML = matches.length
      ? matches.map(([key, item]) => `<button type="button" data-roadmap="${key}" class="${key === state.pendingKey ? "active" : ""}">${escapeHtml(item.label)}</button>`).join("")
      : `<span class="no-match">Press Generate Roadmap to build a custom path</span>`;
  }

  function setRoadmap(key, roadmap, { scroll = true } = {}) {
    state.key = key;
    state.roadmap = roadmap;
    state.pendingKey = key;
    state.selectedNode = null;
    localStorage.setItem(LAST_ROADMAP_KEY, JSON.stringify({ key, topic: roadmap.custom ? roadmap.label : "" }));
    elements.input.value = roadmap.custom ? roadmap.label : "";
    elements.title.textContent = roadmap.title;
    elements.description.textContent = roadmap.description;
    elements.workspace.hidden = false;
    renderChips();
    renderFlow();
    updateProgress();
    closePanel();
    if (scroll) elements.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nodeStatus(index) {
    if (isCompleted(index)) return { label: "Completed", icon: "ph-check-circle", className: "completed" };
    if (isUnlocked(index)) return { label: index === 0 || !getSaved().completed.length ? "Unlocked" : "Next up", icon: "ph-play-circle", className: "current" };
    return { label: "Locked", icon: "ph-lock-key", className: "locked" };
  }

  function connectorSvg(index) {
    if (index === state.roadmap.nodes.length - 1) return "";
    const offsets = [0, -190, 0, 190];
    const start = 450 + offsets[index % offsets.length];
    const end = 450 + offsets[(index + 1) % offsets.length];
    return `<svg class="flow-connector-svg" viewBox="0 0 900 165" preserveAspectRatio="none" aria-hidden="true"><path d="M ${start} 116 C ${start} 145, ${end} 135, ${end} 164"></path><path class="arrow" d="M ${end - 5} 156 L ${end} 164 L ${end + 5} 156"></path></svg><span class="mobile-flow-line" aria-hidden="true"></span>`;
  }

  function renderFlow() {
    const aligns = ["align-center", "align-left", "align-center", "align-right"];
    elements.flow.innerHTML = state.roadmap.nodes.map((node, index) => {
      const status = nodeStatus(index);
      return `<div class="flow-item ${aligns[index % aligns.length]}" style="--index:${index}">
        <button type="button" class="flow-node ${status.className}" data-node="${index}" aria-label="Open ${escapeHtml(node.title)} details, ${status.label}">
          <span class="node-top"><span class="node-number">${String(index + 1).padStart(2, "0")}</span><span class="node-status"><i class="ph-fill ${status.icon}"></i>${status.label}</span></span>
          <h3>${escapeHtml(node.title)}</h3>
          <span class="node-bottom"><span class="difficulty ${node.difficulty.toLowerCase()}">${escapeHtml(node.difficulty)}</span><span><i class="ph ph-clock"></i>${node.time} hours</span></span>
        </button>${connectorSvg(index)}
      </div>`;
    }).join("") + `<div class="flow-end"><i class="ph-fill ph-flag-checkered"></i> Roadmap complete</div>`;
  }

  function updateProgress() {
    const saved = getSaved();
    const total = state.roadmap.nodes.length;
    const completed = saved.completed.filter(index => index < total).length;
    const percent = Math.round((completed / total) * 100);
    const locked = Math.max(total - completed - (completed < total ? 1 : 0), 0);
    const remainingHours = state.roadmap.nodes.reduce((sum, node, index) => sum + (isCompleted(index) ? 0 : node.time), 0);
    elements.percent.textContent = `${percent}%`;
    elements.ring.style.setProperty("--progress", percent);
    elements.bar.style.width = `${percent}%`;
    elements.bar.parentElement.setAttribute("aria-valuenow", percent);
    elements.count.textContent = `${completed} of ${total} completed`;
    elements.message.textContent = percent === 100 ? "Roadmap completed — brilliant work!" : completed ? "Keep the momentum going" : "Start your first milestone";
    elements.completed.textContent = completed;
    elements.locked.textContent = locked;
    elements.time.textContent = `${remainingHours}h`;
    elements.continueButton.innerHTML = percent === 100 ? `<i class="ph-bold ph-trophy"></i> Review roadmap` : `<i class="ph-bold ph-play"></i> Continue learning`;
  }

  function allConcepts() {
    return state.roadmap.nodes.flatMap(node => node.items);
  }

  function topicDescription(node) {
    return `${node.title} brings together ${node.items.slice(0, 3).join(", ")}${node.items.length > 3 ? ", and related skills" : ""}. You will learn the vocabulary, workflow, and hands-on habits needed to use these ideas with confidence.`;
  }

  function topicImportance(node, index) {
    const next = state.roadmap.nodes[index + 1];
    return next
      ? `This milestone gives you the working foundation for ${next.title}. Learning it now prevents gaps later and makes each advanced topic easier to understand.`
      : `This final milestone turns your learning into evidence. It helps you consolidate your skills, explain your decisions, and demonstrate job-ready ability.`;
  }

  function codeExample(node) {
    const title = node.title.toLowerCase();
    if (["python", "dataScience", "machineLearning", "artificialIntelligence", "dataAnalysis"].includes(state.key)) return `# Practice: ${node.title}\ndef learn(concept):\n    return f"Practising {concept}"\n\nfor topic in ${JSON.stringify(node.items.slice(0, 3))}:\n    print(learn(topic))`;
    if (state.key === "java") return `// Practice: ${node.title}\npublic class LearningPath {\n  public static void main(String[] args) {\n    System.out.println("Build, test, improve");\n  }\n}`;
    if (state.key === "uiux") return `DESIGN CHECKLIST\n• Define the user's goal\n• Create a clear visual hierarchy\n• Test one realistic task\n• Record evidence and iterate`;
    if (state.key === "cybersecurity") return `# Run only inside your own practice lab\nnmap -sV 192.168.56.101\n# Record exposed services, assess risk, then recommend fixes.`;
    if (title.includes("html") || title.includes("css") || state.key === "frontend") return `<section class="learning-card">\n  <h2>${node.title}</h2>\n  <button id="practice">Start practice</button>\n</section>`;
    if (state.key === "backend" || state.key === "saas") return `// Small API practice\napp.get('/api/progress', (req, res) => {\n  res.json({ topic: '${node.title}', complete: false });\n});`;
    return `PRACTICE LOOP\n1. Recreate one guided example\n2. Change one requirement\n3. Explain what changed and why\n4. Save the result in your portfolio`;
  }

  function buildQuiz(node, nodeIndex) {
    const concepts = allConcepts();
    const local = node.items.length ? node.items : [node.title];
    const questions = Array.from({ length: 10 }, (_, index) => {
      const correct = local[index % local.length];
      const pool = concepts.filter(item => item !== correct);
      const wrongA = pool[(nodeIndex * 3 + index + 2) % pool.length] || "Unrelated shortcut";
      const wrongB = pool[(nodeIndex * 5 + index + 7) % pool.length] || "Skip the foundations";
      const options = [correct, wrongA, wrongB];
      const shift = index % 3;
      return { prompt: `Which concept is part of ${node.title}?`, answer: correct, options: [...options.slice(shift), ...options.slice(0, shift)] };
    });
    return questions.map((question, index) => `<div class="quiz-question"><p>${index + 1}. ${escapeHtml(question.prompt)}</p>${question.options.map(option => `<label class="quiz-option"><input type="radio" name="q${index}" value="${escapeHtml(option)}"><span>${escapeHtml(option)}</span></label>`).join("")}<input type="hidden" name="a${index}" value="${escapeHtml(question.answer)}"></div>`).join("");
  }

  function renderPanel(index) {
    const node = state.roadmap.nodes[index];
    const unlocked = isUnlocked(index);
    const completed = isCompleted(index);
    const previous = state.roadmap.nodes[index - 1];
    const notes = getSaved().notes[index] || "";
    state.selectedNode = index;
    elements.panelStep.textContent = `Milestone ${index + 1} of ${state.roadmap.nodes.length}`;
    elements.detailTitle.textContent = node.title;
    elements.panelBody.innerHTML = `
      <div class="detail-meta"><span><i class="ph ph-gauge"></i>${escapeHtml(node.difficulty)}</span><span><i class="ph ph-clock"></i>${node.time} hours</span><span><i class="ph ph-list-checks"></i>${node.items.length} key concepts</span></div>
      ${!unlocked ? `<section class="detail-section"><h3><i class="ph ph-lock-key"></i>This milestone is locked</h3><p>Complete <strong>${escapeHtml(previous.title)}</strong> first. You can still preview this guide and plan ahead.</p></section>` : ""}
      <section class="detail-section"><h3><i class="ph ph-info"></i>What this topic is</h3><p>${escapeHtml(topicDescription(node))}</p></section>
      <section class="detail-section"><h3><i class="ph ph-lightbulb"></i>Why it is important</h3><p>${escapeHtml(topicImportance(node, index))}</p></section>
      <section class="detail-section"><h3><i class="ph ph-stairs"></i>Prerequisites</h3><p>${index === 0 ? "No prior experience required. Curiosity, regular practice, and a place to save your work are enough." : `Complete ${escapeHtml(previous.title)} and be comfortable explaining its main ideas in your own words.`}</p></section>
      <section class="detail-section"><h3><i class="ph ph-list-bullets"></i>Key concepts to learn</h3><div class="concept-grid">${node.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
      <section class="detail-section"><h3><i class="ph ph-timer"></i>Estimated learning time</h3><p>Plan for about <strong>${node.time} focused hours</strong>. Try 45–60 minute sessions and finish each session with a tiny output you can revisit.</p></section>
      <section class="detail-section"><h3><i class="ph ph-books"></i>Learning resources</h3><div class="resource-grid"><a class="resource-card youtube" href="https://www.youtube.com/results?search_query=${encodeURIComponent(`${node.title} beginner tutorial`)}" target="_blank" rel="noopener"><i class="ph-fill ph-youtube-logo"></i><span><strong>YouTube tutorials</strong><span>Beginner video lessons</span></span></a><a class="resource-card" href="${escapeHtml(state.roadmap.docs)}" target="_blank" rel="noopener"><i class="ph ph-file-text"></i><span><strong>Official documentation</strong><span>Primary reference guide</span></span></a></div></section>
      <section class="detail-section"><h3><i class="ph ph-code"></i>Coding example / practical task</h3><p>Recreate the example, then change one requirement without copying a solution.</p><pre class="code-block"><code>${escapeHtml(codeExample(node))}</code></pre></section>
      <section class="detail-section"><h3><i class="ph ph-question"></i>Practice questions</h3><ol><li>How would you explain ${escapeHtml(node.items[0])} to a complete beginner?</li><li>When would you choose ${escapeHtml(node.items[Math.min(1, node.items.length - 1)])} in a real project?</li><li>What common mistake could you make in this milestone, and how would you test for it?</li></ol></section>
      <section class="detail-section"><h3><i class="ph ph-hammer"></i>Projects</h3><div class="project-card"><strong>Mini project</strong><p>Create a small, focused demonstration that uses at least two concepts from this milestone. Add a short README explaining your choices.</p></div><div class="project-card"><strong>Challenge project</strong><p>Build a realistic solution using every key concept above, test it with another person, and improve it from their feedback.</p></div></section>
      <section class="detail-section"><h3><i class="ph ph-notebook"></i>Notes / cheat sheet</h3><textarea class="notes-area" id="nodeNotes" placeholder="Write definitions, commands, links, or reminders…">${escapeHtml(notes)}</textarea><span class="notes-hint">Saved automatically on this device.</span></section>
      <section class="detail-section"><h3><i class="ph ph-exam"></i>Knowledge check · 10 questions</h3><form id="nodeQuiz">${buildQuiz(node, index)}<button class="quiz-submit" type="submit">Check answers</button><span class="quiz-result" id="quizResult"></span></form></section>`;
    elements.panelFooter.innerHTML = completed
      ? `<button class="complete-button completed" type="button" disabled><i class="ph-fill ph-check-circle"></i> Milestone completed</button>`
      : `<button class="complete-button" id="completeNode" type="button" ${unlocked ? "" : "disabled"}><i class="ph-bold ${unlocked ? "ph-check" : "ph-lock-key"}"></i> ${unlocked ? "Mark as completed" : "Complete previous milestone first"}</button>`;
    openPanel();
  }

  function openPanel() {
    elements.panel.classList.add("open");
    elements.backdrop.classList.add("open");
    elements.panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => elements.closePanel.focus(), 80);
  }

  function closePanel() {
    if (!elements.panel) return;
    elements.panel.classList.remove("open");
    elements.backdrop.classList.remove("open");
    elements.panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function completeSelectedNode() {
    const index = state.selectedNode;
    if (index === null || !isUnlocked(index) || isCompleted(index)) return;
    const saved = getSaved();
    saved.completed.push(index);
    saved.completed = [...new Set(saved.completed)].sort((a, b) => a - b);
    saveStore();
    renderFlow();
    updateProgress();
    renderPanel(index);
    showToast(index === state.roadmap.nodes.length - 1 ? "Roadmap complete! You made it to the finish line." : "Milestone completed. The next node is now unlocked!", "success");
  }

  function continueLearning() {
    const next = state.roadmap.nodes.findIndex((_, index) => !isCompleted(index));
    renderPanel(next === -1 ? state.roadmap.nodes.length - 1 : next);
  }

  function showToast(message, type = "") {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { elements.toast.className = "toast"; }, 3200);
  }

  function showResetDialog(show) {
    elements.resetDialog.classList.toggle("open", show);
    elements.resetDialog.setAttribute("aria-hidden", String(!show));
    if (show) elements.cancelReset.focus();
  }

  function resetProgress() {
    delete state.store[state.key];
    saveStore();
    showResetDialog(false);
    closePanel();
    renderFlow();
    updateProgress();
    showToast("Roadmap progress has been reset.");
  }

  function handleGenerate(event) {
    event.preventDefault();
    const topic = elements.input.value.trim();
    if (!topic) {
      showToast("Enter a topic or choose a category first.");
      elements.input.focus();
      return;
    }
    const found = findRoadmap(topic);
    if (found) setRoadmap(found[0], found[1]);
    else setRoadmap(`custom-${slug(topic)}`, createCustomRoadmap(topic));
  }

  function initSidebar() {
    const sidebar = $("#sidebar");
    const toggle = $("#sidebarToggle");
    const overlay = $("#sidebarOverlay");
    const setOpen = open => {
      sidebar?.classList.toggle("open", open);
      overlay?.classList.toggle("visible", open);
      toggle?.setAttribute("aria-expanded", String(open));
      toggle?.setAttribute("aria-label", open ? "Close sidebar" : "Open sidebar");
    };
    toggle?.addEventListener("click", () => setOpen(!sidebar.classList.contains("open")));
    overlay?.addEventListener("click", () => setOpen(false));
    sidebar?.addEventListener("scroll", () => sidebar.classList.toggle("scrolled", sidebar.scrollTop > 0));
    return setOpen;
  }

  function restoreRoadmap() {
    const params = new URLSearchParams(location.search);
    const queryTopic = params.get("topic");
    if (queryTopic) {
      const found = findRoadmap(queryTopic);
      setRoadmap(found?.[0] || `custom-${slug(queryTopic)}`, found?.[1] || createCustomRoadmap(queryTopic), { scroll: false });
      return;
    }
    elements.workspace.hidden = true;
    elements.input.value = "";
    state.pendingKey = null;
    renderChips();
  }

  function cacheElements() {
    Object.assign(elements, {
      form: $("#roadmapForm"), input: $("#roadmapInput"), chips: $("#topicChips"), workspace: $("#roadmapWorkspace"),
      title: $("#roadmapTitle"), description: $("#roadmapDescription"), flow: $("#roadmapFlow"),
      ring: $("#progressRing"), percent: $("#progressPercent"), bar: $("#progressBar"), message: $("#progressMessage"), count: $("#progressCount"),
      completed: $("#completedStat"), locked: $("#lockedStat"), time: $("#timeStat"), continueButton: $("#continueButton"),
      panel: $("#detailPanel"), backdrop: $("#panelBackdrop"), closePanel: $("#panelClose"), panelStep: $("#panelStep"), detailTitle: $("#detailTitle"), panelBody: $("#panelBody"), panelFooter: $("#panelFooter"),
      resetButton: $("#resetButton"), resetDialog: $("#resetDialog"), cancelReset: $("#cancelReset"), confirmReset: $("#confirmReset"), toast: $("#toast")
    });
  }

  function bindEvents(setSidebarOpen) {
    elements.form.addEventListener("submit", handleGenerate);
    elements.input.addEventListener("input", event => {
      state.pendingKey = null;
      renderChips(event.target.value);
    });
    elements.chips.addEventListener("click", event => {
      const button = event.target.closest("[data-roadmap]");
      if (!button) return;
      state.pendingKey = button.dataset.roadmap;
      elements.input.value = ROADMAPS[state.pendingKey].label;
      renderChips();
      elements.input.focus();
    });
    elements.flow.addEventListener("click", event => {
      const node = event.target.closest("[data-node]");
      if (node) renderPanel(Number(node.dataset.node));
    });
    elements.closePanel.addEventListener("click", closePanel);
    elements.backdrop.addEventListener("click", closePanel);
    elements.continueButton.addEventListener("click", continueLearning);
    elements.resetButton.addEventListener("click", () => showResetDialog(true));
    elements.cancelReset.addEventListener("click", () => showResetDialog(false));
    elements.confirmReset.addEventListener("click", resetProgress);
    elements.resetDialog.addEventListener("click", event => { if (event.target === elements.resetDialog) showResetDialog(false); });
    elements.panelFooter.addEventListener("click", event => { if (event.target.closest("#completeNode")) completeSelectedNode(); });
    elements.panelBody.addEventListener("input", event => {
      if (event.target.id !== "nodeNotes" || state.selectedNode === null) return;
      getSaved().notes[state.selectedNode] = event.target.value;
      saveStore();
    });
    elements.panelBody.addEventListener("submit", event => {
      if (event.target.id !== "nodeQuiz") return;
      event.preventDefault();
      const data = new FormData(event.target);
      let score = 0;
      for (let index = 0; index < 10; index++) if (data.get(`q${index}`) === data.get(`a${index}`)) score++;
      getSaved().quizzes[state.selectedNode] = score;
      saveStore();
      $("#quizResult").textContent = `${score}/10 correct`;
      showToast(score >= 7 ? "Nice work — your fundamentals are taking shape." : "Review the concepts and try once more.", score >= 7 ? "success" : "");
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (elements.resetDialog.classList.contains("open")) showResetDialog(false);
      else if (elements.panel.classList.contains("open")) closePanel();
      else setSidebarOpen(false);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    const setSidebarOpen = initSidebar();
    bindEvents(setSidebarOpen);
    restoreRoadmap();
    const pageParams = new URLSearchParams(location.search);
    const requestedNode = Number(pageParams.get("node"));
    if (pageParams.has("node") && Number.isInteger(requestedNode) && requestedNode >= 0 && requestedNode < state.roadmap.nodes.length) renderPanel(requestedNode);
    if (window.lucide) window.lucide.createIcons();
  });
})();
