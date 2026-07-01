/*
 * Career Compass non-tech curriculum catalog.
 * Add a career with career({...}); the builder supplies the shared professional
 * stages while `modules` contains the career-specific curriculum and nesting.
 */
(function (global) {
  "use strict";

  const categories = [
    "Business & Management", "Finance & Commerce", "Marketing & Sales",
    "Creative & Design", "Media & Content", "Government & Competitive Exams",
    "Law & Legal", "Hospitality & Tourism", "Healthcare & Wellness",
    "Education & Teaching", "Aviation & Travel", "Fashion & Lifestyle",
    "Communication & Soft Skills"
  ];

  const catalog = [];
  const slug = value => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const topic = (title, subtopics = []) => ({ id: slug(title), title, subtopics });
  const module = (title, difficulty, time, topics, options = {}) => ({
    id: slug(title), title, difficulty, time, topics: topics.map(item => Array.isArray(item) ? topic(item[0], item.slice(1)) : topic(item)), ...options
  });

  function career(config) {
    const careerId = slug(config.name);
    const specific = config.modules.map((item, index) => module(item[0], index < 2 ? "Beginner" : index < 4 ? "Intermediate" : "Advanced", item[2] || 12, item[1], { branch: item[3] || "Core curriculum" }));
    const stages = [
      module("Career Introduction", "Beginner", 4, [
        ["What this career is", `How ${config.name} creates value`, "Industry landscape"],
        ["Who should choose it", "Interest and aptitude check", "Required mindset"],
        ["Scope and future demand", config.demand, "Growth sectors"],
        ["Roles and salary", ...config.roles, config.salary]
      ], { stage: 1, branch: "Orientation" }),
      module("Foundation", "Beginner", 10, [
        ["Industry fundamentals", "Core concepts", "Industry terminology", "Ethics"],
        ["Beginner toolkit", ...config.tools.slice(0, 3)],
        ["Research and communication", "Clear writing", "Presentation basics", "Source checking"],
        ["First guided exercise", `Observe a real ${config.name} workflow`, "Write a learning reflection"]
      ], { stage: 2, branch: "Foundation" }),
      ...specific,
      module("Advanced Skills", "Advanced", 18, [
        ["Specialization strategy", ...config.specializations],
        ["Analysis and decision making", "Define the problem", "Compare evidence", "Recommend action"],
        ["Management and stakeholder skills", "Planning", "Quality control", "Stakeholder updates"],
        ["Automation and AI", ...config.ai]
      ], { stage: 4, branch: "Specialize" }),
      module("Projects & Portfolio", "Intermediate", 28, [
        ["Beginner project", `Create a guided ${config.name} deliverable`, "Document your process"],
        ["Intermediate project", `Solve a realistic ${config.name} case`, "Measure the outcome"],
        ["Advanced project", `Build an end-to-end ${config.name} solution`, "Defend key decisions"],
        ["Portfolio project", "Write a case study", "Before-and-after evidence", "Reflection"],
        ["Client-style project", "Read a brief", "Set milestones", "Present and revise"]
      ], { stage: 5, branch: "Projects", project: true }),
      module("Deliberate Practice", "Intermediate", 16, [
        ["Daily practice", "20-minute skill drill", "Recall without notes", "Progress journal"],
        ["Weekly assignment", "Timed deliverable", "Self-review rubric", "Peer feedback"],
        ["Case studies", "Identify context", "Analyze options", "Recommend and justify"],
        ["Worksheets and mock tests", "Concept checks", "Scenario questions", "Error log"]
      ], { stage: 6, branch: "Practice" }),
      module("Career Preparation", "Advanced", 14, [
        ["Resume and proof of skill", "Impact statements", "Keyword alignment", "Project links"],
        ["Portfolio requirements", "Select strongest work", "Explain decisions", "Show outcomes"],
        ["Interview preparation", "Concept questions", "Situational questions", "Mock interview"],
        ["Experience pathways", "Internships", "Freelancing", "Entry-level roles"],
        ["Certifications and networking", ...config.certifications, "Professional communities"]
      ], { stage: 7, branch: "Launch" }),
      module("Job Readiness", "Advanced", 10, [
        ["Skill-gap checklist", "Score each core skill", "Collect evidence", "Prioritize missing skills"],
        ["Final revision sprint", "Concept map", "Project walkthrough", "Interview flashcards"],
        ["Application system", "Target company list", "Tailored applications", "Follow-up tracker"],
        ["90-day success plan", "First-week goals", "Feedback routine", "Career growth plan"]
      ], { stage: 8, branch: "Job ready" })
    ];
    catalog.push({ id: careerId, category: config.category, name: config.name, icon: config.icon || "ph-briefcase", description: config.description, salary: config.salary, demand: config.demand, duration: config.duration || "4–8 months", difficulty: config.difficulty || "Beginner friendly", popularity: config.popularity || 80, roles: config.roles, tools: config.tools, modules: stages });
  }

  const C = (name, category, description, roles, tools, modules, extra = {}) => career({
    name, category, description, roles, tools, modules,
    salary: extra.salary || "₹3–12 LPA; varies by location and experience",
    demand: extra.demand || "Growing demand across digital-first organizations",
    specializations: extra.specializations || modules.slice(-2).map(m => m[0]),
    ai: extra.ai || ["AI-assisted research", "Prompting and verification", "Workflow automation"],
    certifications: extra.certifications || ["Recognized foundation certificate", "Role-specific credential"],
    ...extra
  });

  C("Digital Marketing", "Marketing & Sales", "Plan, run, and measure digital campaigns that grow brands and revenue.", ["SEO Executive", "Performance Marketer", "Social Media Manager"], ["Google Analytics", "Search Console", "Canva", "Meta Ads"], [
    ["Marketing Fundamentals", [["Customer Journey", "Awareness", "Consideration", "Conversion", "Retention"], ["Marketing Funnel", "TOFU", "MOFU", "BOFU"], "Branding", "Consumer Psychology", "STP Model", "4Ps of Marketing"]],
    ["SEO", ["Search Engine Basics", ["Keyword Research", "Search intent", "Long-tail keywords", "Volume and difficulty", "Competitor analysis"], ["On-page SEO", "Titles", "Meta descriptions", "Headers", "Internal links"], "Off-page SEO", "Technical SEO", "Local SEO"]],
    ["Content & Social Media", ["Content Strategy", "Blog Writing", "Copywriting", "Storytelling", "Content Calendar", "Instagram", "LinkedIn", "YouTube"]],
    ["Paid Advertising", ["Google Ads", "Meta Ads", "Campaign Objectives", "Audience Targeting", "Budgeting", "A/B Testing", "Conversion Tracking"]],
    ["Analytics & Automation", ["Google Analytics", "Search Console", "UTM Tracking", "KPIs", "Reporting", "Email Automation", "CRM Basics"]]
  ], { popularity: 99, icon: "ph-megaphone" });

  C("Graphic Design", "Creative & Design", "Communicate ideas through typography, color, composition, and visual systems.", ["Graphic Designer", "Brand Designer", "Visual Designer"], ["Canva", "Photoshop", "Illustrator", "Figma"], [
    ["Design Fundamentals", ["Line and Shape", "Space", "Balance", "Contrast", "Alignment", "Hierarchy", "Gestalt Principles"]],
    ["Color & Typography", [["Color Theory", "Color wheel", "Psychology", "Harmony", "Accessibility"], ["Typography", "Type anatomy", "Font pairing", "Readability", "Hierarchy"]]],
    ["Design Tools", ["Canva Workflow", "Photoshop", "Illustrator", "Figma", "File Formats and Export"]],
    ["Applied Design", ["Logo Design", "Social Media Design", "Poster Design", "Print Design", "Packaging"]],
    ["Brand Systems", ["Brand Strategy", "Identity System", "Style Guide", "Design Presentation", "Production Handoff"]]
  ], { popularity: 97, icon: "ph-palette" });

  C("Video Editing", "Media & Content", "Shape raw footage into clear, engaging stories for film, brands, and social media.", ["Video Editor", "Post-production Artist", "YouTube Editor"], ["DaVinci Resolve", "Premiere Pro", "After Effects", "Audition"], [
    ["Editing Foundations", ["Story and Intent", "Shot Types", "Continuity", "Frame Rates", "Codecs", "File Organization"]],
    ["Timeline Craft", ["Cuts and Trims", "Pacing", "J-cuts and L-cuts", "B-roll", "Transitions", "Multicam"]],
    ["Audio & Color", ["Dialogue Cleanup", "Music and SFX", "Audio Mixing", "Color Correction", "Color Grading"]],
    ["Motion & Graphics", ["Titles", "Keyframes", "Masks", "Motion Tracking", "Green Screen", "Captions"]],
    ["Delivery Workflows", ["Platform Specifications", "Export Settings", "Proxy Workflow", "Feedback Revisions", "Archiving"]]
  ], { icon: "ph-film-strip" });

  C("Finance", "Finance & Commerce", "Understand money, statements, investments, and financial decisions.", ["Financial Analyst", "Finance Associate", "Credit Analyst"], ["Excel", "Tally", "Power BI", "Financial Calculators"], [
    ["Financial Basics", ["Money", "Income and Expenses", "Assets and Liabilities", "Net Worth", "Time Value of Money"]],
    ["Accounting Basics", ["Debit and Credit", "Journal Entries", "Ledger", "Balance Sheet", "Profit and Loss", "Cash Flow"]],
    ["Planning & Banking", ["Budgeting", "Saving", "Banking Products", "Credit", "Taxation Basics"]],
    ["Investment Foundations", ["Risk and Return", "Mutual Funds", "Bonds", "Stock Market Basics", "Diversification"]],
    ["Financial Analysis", ["Ratio Analysis", "Forecasting", "Valuation Basics", "Excel Modeling", "Management Reporting"]]
  ], { popularity: 95, icon: "ph-chart-line-up" });

  C("Stock Market", "Finance & Commerce", "Analyze securities, manage risk, and make disciplined market decisions.", ["Equity Research Analyst", "Dealer", "Investment Advisor"], ["TradingView", "Screener", "Excel", "Broker Platform"], [
    ["Market Foundations", ["Exchanges and Indices", "Market Participants", "Orders", "Settlement", "Corporate Actions"]],
    ["Fundamental Analysis", ["Financial Statements", "Industry Analysis", "Ratios", "Valuation", "Management Quality"]],
    ["Technical Analysis", ["Price and Volume", "Trends", "Support and Resistance", "Indicators", "Chart Patterns"]],
    ["Portfolio & Risk", ["Asset Allocation", "Position Sizing", "Stop Loss", "Diversification", "Behavioral Biases"]],
    ["Trading Process", ["Strategy Rules", "Backtesting", "Trading Journal", "Performance Metrics", "Compliance"]]
  ], { icon: "ph-trend-up", demand: "Steady demand in brokerage, research, and wealth management" });

  C("Entrepreneurship", "Business & Management", "Find a valuable problem, validate a solution, and build a sustainable venture.", ["Founder", "Business Owner", "Startup Operator"], ["Business Model Canvas", "Notion", "Canva", "CRM"], [
    ["Opportunity Discovery", ["Problem Finding", "Customer Interviews", "Market Sizing", "Competitor Research", "Founder-Market Fit"]],
    ["Business Model", ["Value Proposition", "Customer Segments", "Channels", "Revenue Model", "Cost Structure"]],
    ["Validation & MVP", ["Assumption Mapping", "Prototype", "Landing Page Test", "Pre-sales", "Learning Metrics"]],
    ["Go-to-Market", ["Positioning", "Pricing", "Sales Funnel", "Partnerships", "Launch Plan"]],
    ["Operations & Growth", ["Finance Basics", "Hiring", "Legal Basics", "Unit Economics", "Fundraising"]]
  ], { popularity: 94, icon: "ph-rocket-launch" });

  C("Sales", "Marketing & Sales", "Build trust, diagnose customer needs, and close mutually valuable deals.", ["Sales Executive", "Account Executive", "Business Development Manager"], ["CRM", "LinkedIn Sales Navigator", "Spreadsheets", "Presentation Tools"], [
    ["Sales Foundations", ["Buyer Psychology", "Value Proposition", "Sales Process", "Ethics", "Product Knowledge"]],
    ["Prospecting", ["Ideal Customer Profile", "Lead Research", "Cold Email", "Cold Calling", "Social Selling"]],
    ["Discovery & Demo", ["Questioning", "Active Listening", "Qualification", "Demo Structure", "Storytelling"]],
    ["Objections & Negotiation", ["Objection Mapping", "Price Conversations", "Negotiation", "Closing", "Follow-up"]],
    ["Pipeline Management", ["CRM Hygiene", "Forecasting", "Metrics", "Account Planning", "Retention and Upsell"]]
  ], { icon: "ph-handshake" });

  C("Human Resources", "Business & Management", "Attract, develop, support, and retain people through fair systems.", ["HR Executive", "Recruiter", "People Operations Specialist"], ["HRIS", "ATS", "Excel", "Survey Tools"], [
    ["HR Foundations", ["Employee Lifecycle", "Organization Structure", "HR Policies", "Labor Law Basics", "HR Ethics"]],
    ["Talent Acquisition", ["Job Analysis", "Sourcing", "Screening", "Structured Interviews", "Offer Management"]],
    ["Employee Experience", ["Onboarding", "Engagement", "Learning and Development", "Grievances", "Wellbeing"]],
    ["Performance & Rewards", ["Goal Setting", "Appraisals", "Feedback", "Compensation Basics", "Benefits"]],
    ["People Analytics", ["HR Metrics", "Dashboards", "Attrition Analysis", "Workforce Planning", "DEI Measurement"]]
  ], { icon: "ph-users-three" });

  C("Business Analytics", "Business & Management", "Turn business data into decisions, recommendations, and measurable impact.", ["Business Analyst", "Operations Analyst", "BI Analyst"], ["Excel", "SQL", "Power BI", "Tableau"], [
    ["Business Problem Solving", ["Problem Statements", "KPIs", "Process Mapping", "Requirements", "Stakeholder Analysis"]],
    ["Data Foundations", ["Data Types", "Data Cleaning", "Descriptive Statistics", "Sampling", "Data Quality"]],
    ["Analysis Tools", ["Excel Analysis", "SQL Queries", "Power BI", "Tableau", "Dashboard Design"]],
    ["Decision Analysis", ["Root Cause Analysis", "Segmentation", "Forecasting", "Experiment Basics", "Business Cases"]],
    ["Communication", ["Insight Writing", "Data Storytelling", "Executive Presentations", "Recommendations", "Impact Tracking"]]
  ], { popularity: 96, icon: "ph-chart-bar" });

  C("Product Management", "Business & Management", "Discover customer problems and guide teams toward valuable products.", ["Associate Product Manager", "Product Manager", "Product Operations Analyst"], ["Jira", "Figma", "Analytics", "Notion"], [
    ["Product Foundations", ["Product Lifecycle", "Product Thinking", "Business Models", "Market Research", "Product Ethics"]],
    ["Discovery", ["User Interviews", "Personas", "Jobs to Be Done", "Problem Prioritization", "Opportunity Mapping"]],
    ["Strategy & Roadmaps", ["Vision", "Positioning", "Goals and Metrics", "Prioritization", "Roadmapping"]],
    ["Delivery", ["Requirements", "User Stories", "Agile Basics", "Design Collaboration", "Launch Management"]],
    ["Growth & Analytics", ["Funnels", "Retention", "Experiments", "Product Analytics", "Iteration"]]
  ], { popularity: 98, icon: "ph-cube" });

  C("Content Creation", "Media & Content", "Build an audience by consistently creating useful, distinctive media.", ["Content Creator", "Social Media Creator", "Creator Strategist"], ["Canva", "CapCut", "YouTube Studio", "Analytics"], [
    ["Creator Foundations", ["Niche Selection", "Audience Persona", "Content Pillars", "Personal Brand", "Platform Choice"]],
    ["Content Craft", ["Idea Research", "Hooks", "Scripting", "Storytelling", "Calls to Action"]],
    ["Production", ["Mobile Filming", "Lighting", "Audio", "Editing", "Thumbnails"]],
    ["Publishing & Growth", ["Content Calendar", "SEO", "Distribution", "Community", "Analytics"]],
    ["Monetization", ["Brand Deals", "Affiliate Marketing", "Digital Products", "Memberships", "Media Kit"]]
  ], { icon: "ph-play-circle" });

  C("Public Speaking", "Communication & Soft Skills", "Speak with clarity, confidence, structure, and audience awareness.", ["Speaker", "Trainer", "Corporate Presenter"], ["Presentation Software", "Teleprompter", "Recording Tools", "Timer"], [
    ["Speaking Foundations", ["Audience Analysis", "Purpose", "Speech Structure", "Clarity", "Speaking Ethics"]],
    ["Voice & Body", ["Breathing", "Vocal Variety", "Pace and Pauses", "Eye Contact", "Gestures"]],
    ["Speech Design", ["Openings", "Storytelling", "Evidence", "Transitions", "Memorable Closings"]],
    ["Delivery Practice", ["Managing Nerves", "Impromptu Speaking", "Visual Aids", "Q&A", "Virtual Presentations"]],
    ["Professional Speaking", ["Keynotes", "Facilitation", "Training", "Panel Discussions", "Speaker Profile"]]
  ], { icon: "ph-microphone-stage" });

  C("Photography", "Creative & Design", "Create intentional images through light, composition, camera craft, and editing.", ["Photographer", "Photo Editor", "Studio Assistant"], ["Camera", "Lightroom", "Photoshop", "Lighting Kit"], [
    ["Camera Foundations", ["Exposure Triangle", "Focus", "Lenses", "White Balance", "File Formats"]],
    ["Visual Language", ["Composition", "Perspective", "Color", "Light Quality", "Storytelling"]],
    ["Lighting", ["Natural Light", "Studio Light", "Modifiers", "Portrait Lighting", "Product Lighting"]],
    ["Genres", ["Portrait", "Product", "Event", "Street", "Landscape"]],
    ["Post-production & Business", ["Culling", "Color Correction", "Retouching", "Delivery", "Pricing and Contracts"]]
  ], { icon: "ph-camera" });

  C("Event Management", "Business & Management", "Design and deliver memorable events within scope, budget, and safety needs.", ["Event Coordinator", "Wedding Planner", "Event Producer"], ["Event Planning Software", "Excel", "Canva", "CRM"], [
    ["Event Foundations", ["Event Types", "Briefing", "Objectives", "Audience", "Experience Design"]],
    ["Planning", ["Timeline", "Budget", "Venue", "Vendors", "Permissions"]],
    ["Production", ["Run of Show", "Stage and AV", "Guest Management", "Hospitality", "Branding"]],
    ["Risk & Operations", ["Safety", "Contingency Plans", "Crowd Management", "Team Briefing", "Quality Control"]],
    ["Post-event", ["Feedback", "Vendor Closure", "Reporting", "ROI", "Client Retention"]]
  ], { icon: "ph-confetti" });

  C("Hotel Management", "Hospitality & Tourism", "Run guest-centered hotel operations across rooms, food, and service.", ["Front Office Associate", "Hotel Operations Executive", "Guest Relations Manager"], ["Property Management System", "POS", "Excel", "Reservation Systems"], [
    ["Hospitality Foundations", ["Hotel Departments", "Guest Cycle", "Service Standards", "Etiquette", "Hospitality Law"]],
    ["Front Office", ["Reservations", "Check-in", "Room Allocation", "Guest Relations", "Night Audit"]],
    ["Rooms Division", ["Housekeeping", "Laundry", "Inventory", "Room Inspection", "Safety"]],
    ["Food & Beverage", ["Service Styles", "Menu Knowledge", "POS", "Banquets", "Hygiene"]],
    ["Hotel Business", ["Revenue Management", "Sales", "Quality Audits", "Team Leadership", "Guest Recovery"]]
  ], { icon: "ph-buildings" });

  C("Fashion Design", "Fashion & Lifestyle", "Develop apparel concepts from research and illustration through construction and collection.", ["Fashion Designer", "Apparel Designer", "Fashion Illustrator"], ["Sketchbook", "Illustrator", "CLO 3D", "Sewing Machine"], [
    ["Fashion Foundations", ["Fashion History", "Elements of Design", "Trend Research", "Color", "Textiles"]],
    ["Illustration & Concept", ["Fashion Figures", "Garment Rendering", "Mood Boards", "Collection Theme", "Flats"]],
    ["Pattern & Construction", ["Measurements", "Pattern Making", "Draping", "Sewing", "Fit"]],
    ["Collection Development", ["Range Planning", "Fabric Sourcing", "Sampling", "Costing", "Quality"]],
    ["Fashion Business", ["Brand Identity", "Merchandising", "Portfolio", "Production", "Sustainability"]]
  ], { icon: "ph-dress" });

  C("Interior Design", "Creative & Design", "Plan functional, safe, and expressive spaces from concept to execution.", ["Interior Designer", "Space Planner", "Design Consultant"], ["AutoCAD", "SketchUp", "Revit", "Photoshop"], [
    ["Design Foundations", ["Elements and Principles", "Design History", "Human Scale", "Color", "Materials"]],
    ["Space Planning", ["Client Brief", "Site Measure", "Zoning", "Circulation", "Ergonomics"]],
    ["Technical Drawing", ["Plans", "Elevations", "Sections", "Details", "CAD Standards"]],
    ["Systems & Materials", ["Lighting", "Furniture", "Finishes", "Services", "Sustainability"]],
    ["Project Delivery", ["3D Visualization", "BOQ", "Vendor Coordination", "Site Supervision", "Handover"]]
  ], { icon: "ph-armchair" });

  C("Law", "Law & Legal", "Develop legal reasoning, research, drafting, and advocacy grounded in professional ethics.", ["Legal Associate", "Advocate", "Compliance Analyst"], ["Legal Databases", "Word", "Case Management", "Citation Tools"], [
    ["Legal Foundations", ["Legal Systems", "Sources of Law", "Court Structure", "Legal Rights", "Professional Ethics"]],
    ["Core Law", ["Constitutional Law", "Contract Law", "Tort Law", "Criminal Law", "Property Law"]],
    ["Legal Research", ["Issues and Facts", "Case Search", "Statutes", "Precedent", "Legal Citation"]],
    ["Drafting & Advocacy", ["Case Briefs", "Legal Notices", "Contracts", "Written Submissions", "Oral Arguments"]],
    ["Practice Areas", ["Corporate Law", "Litigation", "IP Law", "Cyber Law", "Alternative Dispute Resolution"]]
  ], { icon: "ph-scales", certifications: ["Recognized law degree", "Bar enrollment where required"] });

  const exam = (name, modules, extra = {}) => C(name, "Government & Competitive Exams", `Prepare systematically for ${name} through concepts, revision, practice, and mock analysis.`, ["Government Officer", "Public Service Professional", "Administrative Role"], ["Official Syllabus", "Previous Papers", "Mock-test Platform", "Current Affairs Notes"], modules, { icon: "ph-bank", duration: "6–18 months", certifications: ["Official eligibility requirements", "Exam-specific documentation"], ...extra });
  exam("UPSC Preparation", [["Exam Strategy", ["Syllabus Mapping", "Previous Year Analysis", "Resource Selection", "Study Timetable", "Answer Writing Basics"]], ["General Studies I", ["History", "Culture", "Geography", "Society"]], ["General Studies II", ["Polity", "Governance", "Social Justice", "International Relations"]], ["General Studies III & IV", ["Economy", "Environment", "Science and Technology", "Security", "Ethics"]], ["Prelims, Mains & Interview", ["CSAT", "Optional Subject", "Essay", "Mock Tests", "Personality Test"]]], { popularity: 99 });
  exam("Banking Exams", [["Exam Orientation", ["IBPS and SBI Pattern", "Eligibility", "Cutoffs", "Time Strategy"]], ["Quantitative Aptitude", ["Arithmetic", "Data Interpretation", "Number Series", "Simplification"]], ["Reasoning", ["Puzzles", "Seating", "Syllogism", "Inequalities"]], ["English & Awareness", ["Grammar", "Reading", "Banking Awareness", "Current Affairs"]], ["Mocks & Interview", ["Sectional Tests", "Full Mocks", "Error Log", "Banking Interview"]]]);
  exam("SSC Exams", [["Exam Orientation", ["CGL and CHSL Pattern", "Syllabus", "Cutoffs", "Study Plan"]], ["Quantitative Aptitude", ["Arithmetic", "Algebra", "Geometry", "Trigonometry"]], ["Reasoning", ["Analogy", "Series", "Coding", "Non-verbal Reasoning"]], ["English & General Awareness", ["Vocabulary", "Grammar", "History and Polity", "Science"]], ["Tier Strategy", ["Speed Drills", "Previous Papers", "Full Mocks", "Document Verification"]]]);
  exam("Railway Exams", [["Exam Orientation", ["RRB Exams", "Eligibility", "Syllabus", "Cutoffs"]], ["Mathematics", ["Arithmetic", "Algebra", "Geometry", "Data Interpretation"]], ["Reasoning", ["Series", "Coding", "Puzzles", "Statements"]], ["General Science & Awareness", ["Physics", "Chemistry", "Biology", "Railway Awareness"]], ["CBT Preparation", ["Speed", "Accuracy", "Previous Papers", "Mock Analysis"]]]);
  exam("Defence Exams", [["Entry Pathways", ["NDA", "CDS", "AFCAT", "Eligibility and Medical Standards"]], ["Academic Preparation", ["Mathematics", "English", "General Knowledge", "Current Affairs"]], ["Physical Readiness", ["Strength", "Endurance", "Mobility", "Recovery"]], ["SSB Foundations", ["OIR", "PPDT", "Psychology Tests", "GTO Tasks"]], ["Interview & Discipline", ["Personal Interview", "Communication", "Officer-like Qualities", "Mock SSB"]]], { certifications: ["Official age and education eligibility", "Medical and physical standards"] });

  C("English Communication", "Communication & Soft Skills", "Communicate naturally and accurately in everyday and professional English.", ["Communication Trainer", "Customer Success Associate", "Corporate Professional"], ["Dictionary", "Voice Recorder", "Grammar Checker", "Language Apps"], [
    ["Language Foundations", ["Sentence Structure", "Parts of Speech", "Tenses", "Articles", "Prepositions"]],
    ["Vocabulary & Pronunciation", ["Word Families", "Collocations", "Sounds", "Stress", "Intonation"]],
    ["Listening & Speaking", ["Active Listening", "Everyday Conversations", "Fluency Drills", "Questioning", "Story Retelling"]],
    ["Reading & Writing", ["Comprehension", "Summaries", "Emails", "Reports", "Editing"]],
    ["Professional English", ["Meetings", "Presentations", "Interviews", "Negotiation", "Cross-cultural Communication"]]
  ], { icon: "ph-chats-circle" });

  const commerce = (name, modules, roles, extra = {}) => C(name, "Finance & Commerce", `Master the staged professional curriculum for ${name}, from concepts through examination and practice.`, roles, ["Excel", "Accounting Software", "Financial Calculator", "Official Study Material"], modules, { icon: "ph-calculator", duration: "12–36 months", ...extra });
  commerce("Chartered Accountant", [["Accounting", ["Journal and Ledger", "Financial Statements", "Accounting Standards", "Company Accounts"]], ["Business Law & Tax", ["Contract Law", "Company Law", "Income Tax", "GST"]], ["Costing & Finance", ["Cost Accounting", "Financial Management", "Economics", "Strategic Management"]], ["Audit & Assurance", ["Audit Planning", "Internal Controls", "Evidence", "Reporting", "Ethics"]], ["CA Exam & Articleship", ["Foundation", "Intermediate", "Articleship", "Final", "Case-based Revision"]]], ["Chartered Accountant", "Audit Associate", "Tax Consultant"], { certifications: ["ICAI examinations", "Mandatory practical training"] });
  commerce("Company Secretary", [["Business Environment", ["Economics", "Business Communication", "Legal Aptitude", "Current Affairs"]], ["Company Law", ["Incorporation", "Share Capital", "Meetings", "Directors"]], ["Governance & Compliance", ["Corporate Governance", "Securities Law", "Secretarial Standards", "Due Diligence"]], ["Drafting & Representation", ["Board Papers", "Resolutions", "Petitions", "Appearances"]], ["CS Exam & Training", ["CSEET", "Executive", "Professional", "Practical Training", "Revision"]]], ["Company Secretary", "Compliance Officer", "Governance Associate"], { certifications: ["ICSI examinations", "Mandatory training requirements"] });
  commerce("CMA", [["Accounting Foundation", ["Financial Accounting", "Cost Concepts", "Business Mathematics", "Economics"]], ["Cost Management", ["Cost Sheets", "Budgeting", "Standard Costing", "Marginal Costing"]], ["Finance & Tax", ["Financial Management", "Direct Tax", "Indirect Tax", "Corporate Accounting"]], ["Strategic Performance", ["Decision Analysis", "Risk", "Performance Management", "Cost Audit"]], ["CMA Exam & Training", ["Foundation", "Intermediate", "Practical Training", "Final", "Revision"]]], ["Cost Accountant", "Management Accountant", "FP&A Analyst"], { certifications: ["ICMAI examinations", "Mandatory practical training"] });
  commerce("MBA Preparation", [["Exam Orientation", ["CAT and Other Exams", "Eligibility", "College Research", "Study Plan"]], ["Quantitative Ability", ["Arithmetic", "Algebra", "Geometry", "Number Systems"]], ["Verbal Ability", ["Reading Comprehension", "Para Jumbles", "Critical Reasoning", "Vocabulary"]], ["Data Interpretation & Logic", ["Charts", "Tables", "Sets", "Logical Puzzles"]], ["Admissions", ["Mock Tests", "Application Essays", "Group Discussion", "Personal Interview"]]], ["MBA Candidate", "Management Trainee", "Business Professional"], { duration: "6–12 months", certifications: ["Entrance examination score", "Degree eligibility documentation"] });

  C("Teaching", "Education & Teaching", "Design inclusive learning and help students build knowledge, confidence, and agency.", ["Teacher", "Tutor", "Instructional Coordinator"], ["LMS", "Presentation Tools", "Assessment Tools", "Digital Whiteboard"], [
    ["Learning Foundations", ["Learning Theories", "Child Development", "Motivation", "Inclusive Education", "Teacher Ethics"]],
    ["Curriculum & Planning", ["Learning Outcomes", "Lesson Plans", "Curriculum Mapping", "Differentiation", "Resources"]],
    ["Teaching Practice", ["Explanation", "Questioning", "Discussion", "Active Learning", "Classroom Management"]],
    ["Assessment", ["Formative Assessment", "Rubrics", "Feedback", "Remediation", "Progress Reporting"]],
    ["Digital & Reflective Teaching", ["EdTech", "Online Teaching", "Action Research", "Parent Communication", "Professional Development"]]
  ], { icon: "ph-chalkboard-teacher", certifications: ["Relevant degree", "Teaching eligibility requirements where applicable"] });

  C("Journalism & Mass Communication", "Media & Content", "Research, verify, produce, and publish public-interest stories across media.", ["Reporter", "News Producer", "Communications Executive"], ["CMS", "Audio Recorder", "Editing Suite", "Verification Tools"], [
    ["Media Foundations", ["Media History", "News Values", "Media Law", "Ethics", "Public Interest"]],
    ["Reporting", ["Story Ideas", "Sources", "Interviewing", "Field Notes", "Fact Checking"]],
    ["Writing & Editing", ["News Structure", "Headlines", "Features", "Copy Editing", "Style Guides"]],
    ["Broadcast & Digital", ["Audio", "Video", "Mobile Journalism", "Social Publishing", "Data Journalism"]],
    ["Newsroom Practice", ["Editorial Pitch", "Deadlines", "Verification", "Corrections", "Portfolio"]]
  ], { icon: "ph-newspaper" });

  C("Animation & VFX", "Creative & Design", "Create believable motion and visual effects through design, timing, and production craft.", ["2D Animator", "3D Animator", "VFX Artist"], ["Blender", "After Effects", "Maya", "Nuke"], [
    ["Art & Motion Foundations", ["Drawing", "Perspective", "Color", "Timing and Spacing", "Animation Principles"]],
    ["2D Animation", ["Storyboards", "Key Poses", "In-betweens", "Cycles", "Compositing"]],
    ["3D Foundations", ["Modeling", "Topology", "Texturing", "Lighting", "Rendering"]],
    ["Character Animation", ["Rigging", "Body Mechanics", "Acting", "Lip Sync", "Polish"]],
    ["VFX Pipeline", ["Rotoscoping", "Tracking", "Keying", "Particles", "Compositing"]]
  ], { icon: "ph-magic-wand" });

  C("Culinary Arts", "Hospitality & Tourism", "Build professional kitchen technique, consistency, food safety, and menu creativity.", ["Commis Chef", "Chef de Partie", "Culinary Entrepreneur"], ["Chef Knife", "Kitchen Equipment", "Recipe Costing Sheet", "Food Thermometer"], [
    ["Kitchen Foundations", ["Mise en Place", "Knife Skills", "Equipment", "Kitchen Brigade", "Food Safety"]],
    ["Cooking Methods", ["Boiling and Steaming", "Roasting", "Sautéing", "Grilling", "Braising"]],
    ["Core Preparations", ["Stocks", "Sauces", "Soups", "Vegetables", "Grains and Pulses"]],
    ["Bakery & World Cuisine", ["Bread", "Pastry", "Indian Regional", "Continental", "Menu Balance"]],
    ["Kitchen Business", ["Menu Planning", "Food Cost", "Inventory", "Quality Control", "Plating"]]
  ], { icon: "ph-cooking-pot" });

  C("Aviation", "Aviation & Travel", "Understand airline operations, passenger service, safety, and aviation professionalism.", ["Cabin Crew", "Ground Staff", "Airline Operations Executive"], ["Departure Control System", "Reservation System", "Safety Equipment", "Office Suite"], [
    ["Aviation Foundations", ["Industry Structure", "Aircraft Types", "Airport Codes", "Time Zones", "Regulations"]],
    ["Passenger Services", ["Reservations", "Check-in", "Boarding", "Baggage", "Special Assistance"]],
    ["Safety & Security", ["Emergency Procedures", "Dangerous Goods", "Security Awareness", "First Aid", "CRM"]],
    ["Cabin & Ground Operations", ["Pre-flight", "Service", "Turnaround", "Load Basics", "Disruption Handling"]],
    ["Aviation Careers", ["Grooming", "Announcements", "Interview", "Medical Requirements", "Airline Applications"]]
  ], { icon: "ph-airplane-tilt", certifications: ["Role-specific aviation training", "Medical and security clearance where required"] });

  C("Travel & Tourism", "Aviation & Travel", "Design, sell, and operate safe and memorable travel experiences.", ["Travel Consultant", "Tour Executive", "Destination Specialist"], ["GDS", "Booking Portals", "CRM", "Itinerary Tools"], [
    ["Tourism Foundations", ["Tourism System", "Traveler Types", "Geography", "Seasonality", "Responsible Tourism"]],
    ["Travel Products", ["Air", "Rail", "Hotels", "Cruises", "Insurance"]],
    ["Itinerary Design", ["Client Brief", "Routing", "Timing", "Costing", "Presentation"]],
    ["Reservations & Operations", ["GDS Basics", "Documentation", "Visa Basics", "Vouchers", "Crisis Handling"]],
    ["Sales & Destination Skills", ["Destination Research", "Consultative Selling", "Packages", "Supplier Relations", "Feedback"]]
  ], { icon: "ph-globe-hemisphere-east" });

  C("Supply Chain & Logistics", "Business & Management", "Coordinate materials, information, inventory, and delivery across a network.", ["Supply Chain Analyst", "Logistics Coordinator", "Procurement Executive"], ["Excel", "ERP", "Warehouse Management System", "Power BI"], [
    ["Supply Chain Foundations", ["Plan-Source-Make-Deliver", "Network Design", "Flows", "Service Levels", "KPIs"]],
    ["Procurement", ["Sourcing", "Supplier Evaluation", "RFQ", "Negotiation", "Contracts"]],
    ["Inventory & Warehousing", ["Demand Basics", "Safety Stock", "ABC Analysis", "Warehouse Layout", "Cycle Counts"]],
    ["Transportation", ["Modes", "Routing", "Freight Cost", "Last Mile", "Documentation"]],
    ["Planning & Improvement", ["Forecasting", "S&OP", "Lean", "Risk Management", "Analytics"]]
  ], { icon: "ph-truck" });

  C("Real Estate", "Business & Management", "Evaluate, market, transact, and manage property responsibly.", ["Real Estate Consultant", "Property Manager", "Leasing Executive"], ["CRM", "Property Portals", "Excel", "Mapping Tools"], [
    ["Real Estate Foundations", ["Property Types", "Market Cycles", "Stakeholders", "Terminology", "Ethics"]],
    ["Property Evaluation", ["Location Analysis", "Site Inspection", "Comparable Sales", "Yield", "Valuation Basics"]],
    ["Legal & Finance", ["Titles and Documents", "RERA Basics", "Home Loans", "Tax Basics", "Due Diligence"]],
    ["Sales & Leasing", ["Lead Generation", "Property Presentation", "Site Visits", "Negotiation", "Closure"]],
    ["Investment & Management", ["Cash Flow", "Portfolio", "Tenant Management", "Maintenance", "Market Reporting"]]
  ], { icon: "ph-house-line" });

  C("Insurance", "Finance & Commerce", "Assess risk and match people or businesses with suitable protection.", ["Insurance Advisor", "Underwriting Assistant", "Claims Executive"], ["CRM", "Policy Administration System", "Excel", "Risk Calculators"], [
    ["Insurance Foundations", ["Risk", "Pooling", "Insurable Interest", "Indemnity", "Regulation"]],
    ["Products", ["Life", "Health", "Motor", "Property", "Liability"]],
    ["Underwriting", ["Proposal Review", "Risk Factors", "Pricing Basics", "Exclusions", "Documentation"]],
    ["Claims", ["Notification", "Verification", "Assessment", "Fraud Awareness", "Settlement"]],
    ["Advisory & Operations", ["Needs Analysis", "Suitability", "Policy Service", "Renewals", "Ethical Selling"]]
  ], { icon: "ph-shield-check" });

  C("Retail Management", "Business & Management", "Run customer-focused retail operations, merchandising, teams, and performance.", ["Store Executive", "Retail Manager", "Merchandising Analyst"], ["POS", "ERP", "Excel", "Inventory System"], [
    ["Retail Foundations", ["Retail Formats", "Customer Journey", "Store Economics", "Omnichannel", "Retail Ethics"]],
    ["Store Operations", ["Opening and Closing", "Cash", "Inventory", "Loss Prevention", "Safety"]],
    ["Merchandising", ["Assortment", "Planograms", "Pricing", "Promotions", "Visual Merchandising"]],
    ["Customer & Team", ["Service", "Complaints", "Selling", "Scheduling", "Coaching"]],
    ["Retail Analytics", ["Sales KPIs", "Conversion", "Basket Size", "Stock Turn", "Store Action Plan"]]
  ], { icon: "ph-storefront" });

  C("E-commerce Management", "Business & Management", "Operate online storefronts from catalog and acquisition through fulfillment and retention.", ["E-commerce Executive", "Marketplace Manager", "D2C Operations Associate"], ["Shopify", "Marketplace Seller Tools", "Analytics", "CRM"], [
    ["E-commerce Foundations", ["Business Models", "Customer Journey", "Unit Economics", "Platforms", "Policies"]],
    ["Catalog & Store", ["Product Information", "Images", "SEO", "Pricing", "Conversion Design"]],
    ["Marketplace Operations", ["Listings", "Inventory", "Orders", "Returns", "Seller Metrics"]],
    ["Growth", ["Paid Acquisition", "Content", "Email and CRM", "Promotions", "Retention"]],
    ["Fulfillment & Analytics", ["Warehousing", "Shipping", "Customer Support", "Dashboards", "Profitability"]]
  ], { icon: "ph-shopping-cart" });

  C("Import Export Business", "Business & Management", "Plan and execute compliant cross-border trade from sourcing to payment.", ["Export Executive", "Import Coordinator", "International Trade Entrepreneur"], ["DGFT Portal", "ICEGATE", "Excel", "Trade Databases"], [
    ["Trade Foundations", ["Global Trade", "HS Codes", "Incoterms", "Trade Policy", "Market Selection"]],
    ["Product & Buyer Research", ["Product Selection", "Demand Research", "Buyer Discovery", "Supplier Verification", "Pricing"]],
    ["Documentation", ["IEC", "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin"]],
    ["Logistics & Customs", ["Freight", "Customs", "Insurance", "Warehousing", "Compliance"]],
    ["Payments & Growth", ["Letters of Credit", "Forex", "Export Finance", "Risk", "Trade Fairs"]]
  ], { icon: "ph-package" });

  C("Foreign Languages", "Communication & Soft Skills", "Build practical multilingual ability and intercultural communication for work and life.", ["Translator", "Language Trainer", "Localization Associate"], ["Dictionary", "Flashcards", "Audio Recorder", "Language Exchange"], [
    ["Language Setup", ["Choose a Target Language", "CEFR Levels", "Sound System", "Study Routine", "Keyboard Setup"]],
    ["Core Grammar & Vocabulary", ["Sentence Patterns", "High-frequency Words", "Tenses", "Questions", "Connectors"]],
    ["Listening & Speaking", ["Comprehensible Input", "Shadowing", "Pronunciation", "Conversation", "Fluency"]],
    ["Reading & Writing", ["Graded Texts", "Reading Strategies", "Messages", "Formal Writing", "Editing"]],
    ["Professional Language", ["Business Vocabulary", "Meetings", "Translation Basics", "Intercultural Skills", "Proficiency Exams"]]
  ], { icon: "ph-translate" });

  C("Psychology", "Healthcare & Wellness", "Study behavior and mental processes using scientific, ethical thinking.", ["Psychology Assistant", "Research Assistant", "Behavioral Program Associate"], ["Survey Tools", "Statistics Software", "Research Databases", "Case Notes"], [
    ["Psychology Foundations", ["History and Schools", "Biological Bases", "Sensation", "Learning", "Memory"]],
    ["Development & Social", ["Lifespan Development", "Personality", "Social Influence", "Groups", "Culture"]],
    ["Research Methods", ["Questions", "Study Designs", "Measurement", "Statistics", "Research Ethics"]],
    ["Applied Psychology", ["Clinical", "Counselling", "Organizational", "Educational", "Health"]],
    ["Assessment & Practice", ["Observation", "Interviewing", "Psychometrics Basics", "Case Formulation", "Referral Boundaries"]]
  ], { icon: "ph-brain", certifications: ["Relevant accredited degree", "Licensure for regulated practice where required"] });

  C("Counselling", "Healthcare & Wellness", "Support people through ethical helping relationships, listening, and evidence-informed practice.", ["Counselling Assistant", "Student Counsellor", "Wellbeing Facilitator"], ["Secure Case Notes", "Assessment Forms", "Telehealth Tools", "Referral Directory"], [
    ["Counselling Foundations", ["Helping Relationship", "Ethics", "Confidentiality", "Boundaries", "Cultural Humility"]],
    ["Core Skills", ["Attending", "Active Listening", "Empathy", "Questions", "Summarizing"]],
    ["Counselling Approaches", ["Person-centered", "CBT Basics", "Solution-focused", "Motivational Interviewing", "Trauma-informed Care"]],
    ["Assessment & Planning", ["Presenting Concern", "Risk Screening", "Goals", "Session Planning", "Referrals"]],
    ["Supervised Practice", ["Case Notes", "Role Plays", "Supervision", "Self-care", "Professional Development"]]
  ], { icon: "ph-heart", certifications: ["Accredited counselling qualification", "Supervised practice and local registration where required"] });

  C("Social Work", "Healthcare & Wellness", "Partner with people and communities to improve wellbeing, access, and social justice.", ["Social Worker", "Program Coordinator", "Community Outreach Officer"], ["Case Management System", "Survey Tools", "Office Suite", "Community Maps"], [
    ["Social Work Foundations", ["Values and Ethics", "Human Rights", "Social Systems", "Diversity", "Reflective Practice"]],
    ["Case Work", ["Engagement", "Assessment", "Care Plan", "Advocacy", "Closure"]],
    ["Group & Community Work", ["Group Facilitation", "Needs Assessment", "Mobilization", "Partnerships", "Community Action"]],
    ["Policy & Programs", ["Social Policy", "Program Design", "Safeguarding", "Monitoring", "Evaluation"]],
    ["Field Practice", ["Documentation", "Home Visits", "Crisis Response", "Referrals", "Supervision"]]
  ], { icon: "ph-hands-clapping", certifications: ["Relevant social work degree", "Fieldwork requirements"] });

  C("Agriculture & Agribusiness", "Business & Management", "Combine farm science, markets, operations, and enterprise for sustainable value chains.", ["Agribusiness Executive", "Farm Manager", "Agri-market Analyst"], ["Farm Records", "Soil Test Kit", "GIS Apps", "Excel"], [
    ["Agriculture Foundations", ["Agro-ecosystems", "Soil", "Climate", "Crop Cycles", "Sustainability"]],
    ["Crop & Farm Management", ["Seeds", "Nutrition", "Irrigation", "Pest Management", "Harvest"]],
    ["Farm Economics", ["Cost of Cultivation", "Budgets", "Records", "Risk", "Credit and Insurance"]],
    ["Markets & Value Chains", ["Market Research", "Post-harvest", "Grading", "Logistics", "Commodity Pricing"]],
    ["Agribusiness", ["Business Models", "FPOs", "Processing", "Agri-tech", "Go-to-Market"]]
  ], { icon: "ph-plant" });

  const health = (name, roles, tools, modules, extra = {}) => C(name, "Healthcare & Wellness", `Build safe, ethical, evidence-informed capability for a career in ${name}.`, roles, tools, modules, { icon: "ph-first-aid-kit", certifications: ["Accredited professional qualification", "Registration or license where legally required"], ...extra });
  health("Pharmacy", ["Pharmacist", "Pharmacy Assistant", "Quality Assurance Associate"], ["Drug Database", "Dispensing System", "Lab Equipment", "Inventory System"], [["Biomedical Foundations", ["Anatomy", "Physiology", "Biochemistry", "Microbiology"]], ["Pharmaceutics", ["Dosage Forms", "Formulation", "Biopharmaceutics", "Manufacturing"]], ["Pharmacology", ["Drug Action", "Therapeutic Classes", "Adverse Effects", "Interactions"]], ["Pharmacy Practice", ["Prescriptions", "Dispensing", "Patient Counselling", "Pharmacovigilance"]], ["Quality & Regulation", ["GMP", "Quality Control", "Validation", "Drug Regulation"]]]);
  health("Nursing", ["Staff Nurse", "Community Health Nurse", "Clinical Coordinator"], ["Clinical Records", "Vital-sign Equipment", "Medication System", "Care Plan Templates"], [["Nursing Foundations", ["Nursing Process", "Patient Safety", "Infection Control", "Ethics"]], ["Health Assessment", ["History", "Vital Signs", "Physical Assessment", "Documentation"]], ["Clinical Nursing", ["Medical-Surgical", "Maternal", "Child Health", "Mental Health"]], ["Medication & Procedures", ["Drug Safety", "Administration", "Wound Care", "Emergency Response"]], ["Community & Leadership", ["Public Health", "Health Education", "Teamwork", "Quality Improvement"]]]);
  health("Physiotherapy", ["Physiotherapist", "Rehabilitation Assistant", "Sports Therapy Associate"], ["Goniometer", "Exercise Equipment", "Clinical Notes", "Outcome Measures"], [["Movement Foundations", ["Anatomy", "Physiology", "Biomechanics", "Kinesiology"]], ["Assessment", ["History", "Observation", "Range of Motion", "Strength", "Functional Tests"]], ["Therapeutic Exercise", ["Mobility", "Strength", "Balance", "Motor Control"]], ["Clinical Areas", ["Musculoskeletal", "Neurological", "Cardiorespiratory", "Sports"]], ["Rehabilitation Practice", ["Treatment Planning", "Pain Science", "Patient Education", "Outcome Tracking"]]]);
  health("Nutrition & Dietetics", ["Dietitian", "Nutritionist", "Wellness Educator"], ["Diet Analysis Software", "Food Database", "Body-measure Tools", "Meal Planner"], [["Nutrition Science", ["Macronutrients", "Micronutrients", "Digestion", "Energy Balance"]], ["Food Science", ["Food Groups", "Cooking Effects", "Food Safety", "Label Reading"]], ["Assessment", ["Diet History", "Anthropometry", "Clinical Data", "Nutrition Diagnosis"]], ["Diet Planning", ["Balanced Diet", "Life Stages", "Therapeutic Diets", "Behavior Change"]], ["Professional Practice", ["Counselling", "Meal Plans", "Monitoring", "Evidence Review"]]]);

  C("Sports Management", "Business & Management", "Manage sport programs, events, brands, facilities, and athlete-centered operations.", ["Sports Coordinator", "Event Operations Executive", "Sports Marketing Associate"], ["Event Software", "CRM", "Analytics", "Scheduling Tools"], [
    ["Sports Industry", ["Ecosystem", "Governance", "Leagues", "Athlete Pathways", "Sports Ethics"]],
    ["Sports Business", ["Revenue Models", "Sponsorship", "Ticketing", "Media Rights", "Merchandising"]],
    ["Events & Facilities", ["Event Planning", "Venue Operations", "Safety", "Volunteers", "Fan Experience"]],
    ["Marketing & Community", ["Branding", "Digital Content", "Fan Engagement", "Partnerships", "Grassroots Programs"]],
    ["Performance Operations", ["Team Logistics", "Athlete Services", "Data Basics", "Compliance", "Career Networking"]]
  ], { icon: "ph-trophy" });

  health("Fitness Training", ["Personal Trainer", "Fitness Coach", "Gym Instructor"], ["Assessment Kit", "Training App", "Heart-rate Monitor", "Exercise Equipment"], [["Exercise Foundations", ["Anatomy", "Physiology", "Biomechanics", "Energy Systems"]], ["Assessment", ["Health Screening", "Posture", "Movement", "Fitness Tests"]], ["Program Design", ["Goals", "Strength", "Cardio", "Mobility", "Progression"]], ["Coaching", ["Exercise Instruction", "Cueing", "Motivation", "Habit Change", "Client Communication"]], ["Safety & Business", ["Injury Prevention", "Emergency Basics", "Scope of Practice", "Packages", "Client Retention"]]], { icon: "ph-barbell", certifications: ["Recognized personal-training certification", "CPR and first-aid certification"] });
  health("Yoga Instructor", ["Yoga Instructor", "Wellness Facilitator", "Studio Teacher"], ["Yoga Mat", "Props", "Anatomy Resources", "Class-planning Tools"], [["Yoga Foundations", ["History", "Philosophy", "Ethics", "Styles"]], ["Asana", ["Standing", "Seated", "Balances", "Backbends", "Restorative"]], ["Breath & Meditation", ["Breath Awareness", "Pranayama", "Concentration", "Meditation"]], ["Anatomy & Safety", ["Movement Basics", "Contraindications", "Modifications", "Injury Prevention"]], ["Teaching Practice", ["Sequencing", "Cueing", "Demonstration", "Inclusive Classes", "Class Management"]]], { icon: "ph-person-simple", certifications: ["Recognized yoga teacher training", "CPR and first-aid recommended"] });

  C("Fashion & Lifestyle", "Fashion & Lifestyle", "Build editorial taste and commercial understanding across modern lifestyle brands.", ["Lifestyle Brand Associate", "Fashion Content Executive", "Trend Researcher"], ["Canva", "Trend Platforms", "Analytics", "Mood-board Tools"], [["Lifestyle Research", ["Culture", "Trends", "Consumer Segments", "Forecasting"]], ["Brand Aesthetics", ["Visual Language", "Tone", "Photography Direction", "Editorial Layout"]], ["Content & Community", ["Editorial Calendar", "Social Content", "Influencers", "Community"]], ["Products & Merchandising", ["Assortment", "Pricing", "Storytelling", "Launches"]], ["Lifestyle Business", ["Partnerships", "Events", "E-commerce", "Analytics"]]], { icon: "ph-sparkle" });

  global.NON_TECH_CATEGORIES = categories;
  global.NON_TECH_ROADMAPS = catalog;
})(window);
