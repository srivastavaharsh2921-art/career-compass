/* Role-aware coding-language suggestions shared by roadmaps and courses. */
(() => {
  "use strict";

  const BY_CAREER = {
    frontend: ["HTML", "CSS", "JavaScript", "TypeScript"],
    backend: ["JavaScript", "TypeScript", "SQL", "Bash"],
    fullstack: ["HTML", "CSS", "JavaScript", "TypeScript", "SQL"],
    python: ["Python", "SQL", "Bash"],
    java: ["Java", "SQL", "Bash"],
    c: ["C", "Bash", "Assembly"],
    cpp: ["C++", "C", "Bash"],
    javascript: ["JavaScript", "TypeScript", "HTML", "CSS"],
    react: ["JavaScript", "TypeScript", "JSX", "HTML", "CSS"],
    nextjs: ["TypeScript", "JavaScript", "SQL", "HTML", "CSS"],
    nodejs: ["JavaScript", "TypeScript", "SQL", "Bash"],
    express: ["JavaScript", "TypeScript", "SQL", "Bash"],
    mongodb: ["JavaScript", "MongoDB Query Language", "JSON", "Python"],
    sql: ["SQL", "Python", "Bash"],
    "data-analytics": ["SQL", "Python", "R"],
    "data-science": ["Python", "SQL", "R"],
    "machine-learning": ["Python", "SQL", "C++"],
    "artificial-intelligence": ["Python", "SQL", "TypeScript"],
    "deep-learning": ["Python", "C++", "CUDA"],
    "cyber-security": ["Python", "Bash", "PowerShell", "JavaScript", "SQL"],
    "cloud-computing": ["Python", "Bash", "PowerShell", "YAML"],
    aws: ["Python", "JavaScript", "Bash", "YAML"],
    azure: ["C#", "PowerShell", "Python", "SQL"],
    devops: ["Python", "Bash", "PowerShell", "YAML"],
    docker: ["Bash", "Python", "YAML"],
    kubernetes: ["YAML", "Go", "Bash", "Python"],
    uiux: ["HTML", "CSS", "JavaScript"],
    figma: ["HTML", "CSS", "JavaScript"],
    android: ["Kotlin", "Java", "SQL"],
    flutter: ["Dart", "SQL", "Kotlin", "Swift"],
    "react-native": ["TypeScript", "JavaScript", "Kotlin", "Swift"],
    "game-development": ["C#", "C++", "Python"],
    blockchain: ["Solidity", "TypeScript", "JavaScript", "Rust"],
    "saas-development": ["TypeScript", "JavaScript", "SQL", "HTML", "CSS"],
    "product-management": ["SQL", "Python", "JavaScript"],
    "digital-marketing": ["SQL", "Python", "JavaScript", "HTML", "CSS"],
    "system-design": ["Java", "Python", "Go", "SQL"],
    dsa: ["C++", "Java", "Python", "JavaScript"],
    "competitive-programming": ["C++", "Python", "Java"],
    ios: ["Swift", "Objective-C", "SQL"],
    "ar-vr": ["C#", "C++", "HLSL"],
    "embedded-systems": ["C", "C++", "Python", "Assembly"],
    "qa-engineering": ["Java", "JavaScript", "Python", "SQL"]
  };

  const BY_CATEGORY = {
    "Web Development": ["HTML", "CSS", "JavaScript", "TypeScript"],
    "Programming Languages": ["Python", "JavaScript", "SQL"],
    "Backend & Data": ["SQL", "Python", "JavaScript", "Bash"],
    "Data & AI": ["Python", "SQL", "R"],
    "Security & Cloud": ["Python", "Bash", "PowerShell", "YAML"],
    "Design & Product": ["HTML", "CSS", "JavaScript", "SQL"],
    "Mobile & Emerging": ["Kotlin", "Swift", "C#", "JavaScript"],
    "Business & Growth": ["SQL", "Python", "JavaScript"],
    "Computer Science": ["C++", "Java", "Python", "JavaScript"]
  };

  const SIGNALS = [
    [/\b(html|semantic|accessibility|browser|dom)\b/i, ["HTML", "CSS", "JavaScript"]],
    [/\b(css|responsive|layout|tailwind|animation)\b/i, ["CSS", "HTML", "JavaScript"]],
    [/\b(react|next\.?js|node\.?js|express|frontend|web)\b/i, ["JavaScript", "TypeScript"]],
    [/\b(database|sql|query|relational|postgres|mysql|analytics)\b/i, ["SQL", "Python"]],
    [/\b(data|machine learning|deep learning|ai|pandas|numpy|statistics)\b/i, ["Python", "SQL"]],
    [/\b(linux|terminal|shell|docker|ci\/cd|deployment)\b/i, ["Bash", "Python"]],
    [/\b(kubernetes|infrastructure|cloud|pipeline)\b/i, ["YAML", "Bash", "Python"]],
    [/\b(android|kotlin)\b/i, ["Kotlin", "Java"]],
    [/\b(ios|swift)\b/i, ["Swift", "Objective-C"]],
    [/\b(flutter|dart)\b/i, ["Dart"]],
    [/\b(blockchain|smart contract|solidity)\b/i, ["Solidity", "TypeScript"]],
    [/\b(embedded|firmware|microcontroller|memory|pointer)\b/i, ["C", "C++", "Assembly"]],
    [/\b(game|unity)\b/i, ["C#", "C++"]],
    [/\b(test|qa|automation|selenium)\b/i, ["Java", "JavaScript", "Python"]],
    [/\b(marketing|business|product|experiment)\b/i, ["SQL", "Python", "JavaScript"]]
  ];

  const unique = values => [...new Set(values.filter(Boolean))];

  function fromText(text, fallback = []) {
    const matched = SIGNALS.filter(([pattern]) => pattern.test(String(text))).flatMap(([, languages]) => languages);
    return unique([...matched, ...fallback]).slice(0, 5);
  }

  function get(career, node = {}) {
    const base = BY_CAREER[career?.id] || BY_CATEGORY[career?.category] || ["Python", "JavaScript", "SQL"];
    const text = [career?.label, career?.role, node.title, ...(node.topics || [])].join(" ");
    const sectionMatches = fromText(text);
    return unique([base[0], ...sectionMatches, ...base.slice(1)]).slice(0, 4);
  }

  window.CareerCompassLanguageGuide = { get, fromText, byCareer: BY_CAREER, byCategory: BY_CATEGORY };
})();
