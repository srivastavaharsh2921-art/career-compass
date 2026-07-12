/*
 * Career Compass non-tech curriculum catalog.
 *
 * The UI still consumes the legacy fields (`name`, `roles`, `modules`, etc.),
 * but every course below also exposes a richer career-guide schema so detail
 * pages can show field-specific skills, tools, projects, salaries, portfolio
 * guidance, interview prep, and career progression without fallback content.
 */
(function (global) {
  "use strict";

  const salaryNote = "Salary may vary by city, company, experience and skill level.";
  const categories = [
    "Business & Management",
    "Finance & Commerce",
    "Marketing & Sales",
    "Creative & Design",
    "Media & Content",
    "Government & Competitive Exams",
    "Law & Legal",
    "Hospitality & Tourism",
    "Healthcare & Wellness",
    "Education & Teaching",
    "Aviation & Travel",
    "Fashion & Lifestyle",
    "Communication & Soft Skills"
  ];

  const slug = value => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const unique = items => [...new Set((items || []).filter(Boolean))];
  const topic = (title, subtopics = []) => ({ id: slug(title), title, subtopics: unique(subtopics) });
  const module = (title, difficulty, time, topics, options = {}) => ({
    id: slug(title),
    title,
    difficulty,
    time,
    topics: topics.map(item => Array.isArray(item) ? topic(item[0], item.slice(1)) : topic(item)),
    ...options
  });
  const role = (roleName, description, skills, fresherSalary, experiencedSalary) => ({
    role: roleName,
    description,
    requiredSkills: skills,
    fresherSalary,
    experiencedSalary
  });

  const courses = [
    {
      title: "Digital Marketing", category: "Marketing & Sales", icon: "ph-megaphone", duration: "4-7 months", popularity: 99,
      shortDescription: "Plan, run, and measure digital campaigns across search, social, content, email, and analytics.",
      suitableFor: ["Students who enjoy brands, social media, numbers, and communication", "Small-business owners who want measurable online growth", "Creative learners who also like performance tracking"],
      eligibility: ["Class 12 or graduation in any stream", "Basic English writing and internet research skills", "Comfort with spreadsheets and campaign dashboards"],
      requiredSkills: ["Audience research", "Basic copywriting", "Spreadsheet reporting"],
      skillsToLearn: ["SEO", "Performance marketing", "Content strategy", "Social media planning", "Email marketing", "Conversion tracking", "Marketing analytics"],
      tools: ["Google Analytics 4", "Google Ads", "Meta Ads Manager", "Google Search Console", "Canva", "Mailchimp", "HubSpot CRM"],
      roles: [
        role("SEO Executive", "Improves organic visibility through keyword research, on-page fixes, technical checks, and content briefs.", ["SEO", "Search Console", "Content briefs"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Performance Marketing Associate", "Runs paid campaigns, manages budgets, tests creatives, and reports cost per lead or sale.", ["Google Ads", "Meta Ads", "A/B testing"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Digital Marketing Manager", "Coordinates channel strategy, calendars, agencies, analytics, and campaign outcomes.", ["Channel strategy", "Analytics", "Stakeholder management"], "INR 5-9 LPA", "INR 12-28 LPA")
      ],
      industries: ["D2C brands", "Edtech", "SaaS", "E-commerce", "Agencies", "Healthcare marketing"],
      certifications: ["Google Analytics Certification", "Google Ads Search Certification", "Meta Certified Digital Marketing Associate", "HubSpot Content Marketing"],
      higherStudyOptions: ["MBA in Marketing", "PG Diploma in Digital Marketing", "Brand Management program"],
      freelanceOpportunities: ["SEO audits", "Social media calendars", "Lead-generation campaigns", "Email newsletter setup"],
      businessOpportunities: ["Performance marketing agency", "Niche SEO consultancy", "Local business growth studio"],
      pros: ["Fast feedback from campaign data", "Many remote and freelance options", "Useful for entrepreneurship"],
      challenges: ["Platform rules change often", "Budgets can be pressure-heavy", "Attribution is not always perfect"],
      futureScope: "AI-assisted creative testing, first-party data, marketing automation, and commerce media are expanding demand for analytical marketers.",
      finalOutcome: "You can build and present a complete campaign plan with creatives, landing-page recommendations, tracking, and performance report."
    },
    {
      title: "Graphic Design", category: "Creative & Design", icon: "ph-palette", duration: "5-8 months", popularity: 97,
      shortDescription: "Create visual communication systems using typography, color, layout, identity, and production-ready files.",
      suitableFor: ["Visual thinkers who notice layouts, posters, packaging, and brands", "Learners who enjoy making polished assets", "Students interested in agency, media, or brand teams"],
      eligibility: ["Class 12 or equivalent", "Portfolio interest is more important than stream", "Basic computer comfort"],
      requiredSkills: ["Visual observation", "Patience for revisions", "Basic digital file handling"],
      skillsToLearn: ["Typography", "Color theory", "Composition", "Brand identity", "Print design", "Social media design", "Design critique"],
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Canva", "Adobe InDesign", "Behance"],
      roles: [
        role("Junior Graphic Designer", "Creates social posts, posters, brochures, and campaign assets from briefs.", ["Layout", "Photoshop", "Illustrator"], "INR 2.2-4.5 LPA", "INR 5-10 LPA"),
        role("Brand Designer", "Builds logos, identity systems, and brand guidelines for products or organizations.", ["Identity design", "Typography", "Presentation"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Visual Designer", "Designs polished digital visuals for websites, apps, campaigns, and product launches.", ["Figma", "Visual systems", "Asset export"], "INR 4-7 LPA", "INR 10-22 LPA")
      ],
      industries: ["Advertising", "Media", "Startups", "Publishing", "Retail", "Product companies"],
      certifications: ["Adobe Certified Professional", "CalArts Graphic Design Specialization", "Arena/MAAC design certification"],
      higherStudyOptions: ["B.Des", "M.Des", "PG Diploma in Visual Communication"],
      freelanceOpportunities: ["Logo kits", "Social media templates", "Pitch decks", "Packaging mockups"],
      businessOpportunities: ["Design studio", "Brand identity consultancy", "Template marketplace"],
      pros: ["Portfolio can demonstrate skill without a degree", "Strong freelance market", "Useful across many industries"],
      challenges: ["Subjective feedback can be difficult", "Trends change quickly", "Production details matter"],
      futureScope: "Brand systems, motion-ready assets, and AI-assisted concept exploration are increasing demand for designers with strong fundamentals.",
      finalOutcome: "You can create a portfolio with brand identity, campaign graphics, print layouts, and professional design presentations."
    },
    {
      title: "Video Editing", category: "Media & Content", icon: "ph-film-strip", duration: "4-8 months",
      shortDescription: "Turn raw footage into clear stories with pacing, sound, color, captions, and platform-ready exports.",
      suitableFor: ["Story-focused learners who enjoy video platforms", "Creators who want stronger production quality", "Students interested in film, YouTube, ads, or social media"],
      eligibility: ["Class 12 or equivalent", "A laptop capable of editing is helpful", "Basic visual storytelling interest"],
      requiredSkills: ["File organization", "Listening carefully to feedback", "Basic visual judgement"],
      skillsToLearn: ["Timeline editing", "Pacing", "Audio cleanup", "Color correction", "Motion graphics", "Captions", "Export workflows"],
      tools: ["DaVinci Resolve", "Adobe Premiere Pro", "After Effects", "Audition", "CapCut", "Frame.io"],
      roles: [
        role("Video Editor", "Cuts interviews, reels, ads, and explainers while maintaining story flow and brand tone.", ["Premiere Pro", "Pacing", "Audio sync"], "INR 2.4-5 LPA", "INR 6-14 LPA"),
        role("Post-production Artist", "Handles color, sound polish, graphics, and final delivery standards.", ["Color", "Sound", "Delivery"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("YouTube Editor", "Builds retention-focused videos with hooks, B-roll, graphics, and thumbnail coordination.", ["Retention editing", "Captions", "Platform formats"], "INR 2.5-6 LPA", "INR 7-16 LPA")
      ],
      industries: ["Film production", "Creator economy", "Advertising", "Education media", "Corporate communications"],
      certifications: ["Adobe Certified Professional in Premiere Pro", "Blackmagic Design DaVinci Resolve Training", "LinkedIn Learning video editing certificate"],
      higherStudyOptions: ["Film editing diploma", "Mass communication degree", "Post-production specialization"],
      freelanceOpportunities: ["Reels packages", "YouTube editing retainers", "Wedding films", "Course video editing"],
      businessOpportunities: ["Post-production studio", "Creator editing agency", "Short-form content service"],
      pros: ["High visible impact", "Remote client work is common", "Portfolio clips show ability quickly"],
      challenges: ["Revision cycles can be intense", "Storage and hardware needs grow", "Deadlines are often tight"],
      futureScope: "Short-form video, branded content, podcasts, online courses, and AI-assisted editing keep expanding the field.",
      finalOutcome: "You can deliver edited videos with organized project files, color and audio polish, captions, and a showreel."
    },
    {
      title: "Finance", category: "Finance & Commerce", icon: "ph-chart-line-up", duration: "5-9 months", popularity: 95,
      shortDescription: "Analyze money, statements, budgets, investments, and business decisions using finance fundamentals.",
      suitableFor: ["Students who like numbers, markets, and business decisions", "Commerce graduates building job-ready finance skills", "Professionals who want stronger financial literacy"],
      eligibility: ["Class 12 commerce or graduation preferred but not mandatory for basics", "Comfort with arithmetic and Excel", "Interest in business news"],
      requiredSkills: ["Numerical reasoning", "Excel basics", "Attention to detail"],
      skillsToLearn: ["Financial statements", "Ratio analysis", "Budgeting", "Financial modelling", "Valuation basics", "Credit analysis", "Management reporting"],
      tools: ["Microsoft Excel", "Power BI", "TallyPrime", "QuickBooks", "Screener.in", "Financial calculators"],
      roles: [
        role("Finance Associate", "Supports budgeting, reconciliations, reports, and financial operations.", ["Excel", "Accounting basics", "Reporting"], "INR 3-5.5 LPA", "INR 7-14 LPA"),
        role("Financial Analyst", "Builds models, analyzes performance, and prepares decision reports for managers.", ["Financial modelling", "Power BI", "Ratios"], "INR 4-8 LPA", "INR 10-24 LPA"),
        role("Credit Analyst", "Assesses borrower risk using statements, cash flows, collateral, and sector context.", ["Credit analysis", "Risk assessment", "Documentation"], "INR 3.5-7 LPA", "INR 9-20 LPA")
      ],
      industries: ["Banks", "NBFCs", "Consulting", "Startups", "Manufacturing", "Fintech"],
      certifications: ["NISM certifications", "Financial Modeling and Valuation Analyst", "NSE Academy finance courses"],
      higherStudyOptions: ["MBA Finance", "CFA Program", "M.Com", "PG Diploma in Finance"],
      freelanceOpportunities: ["Budget templates", "Financial dashboards", "Bookkeeping support", "Startup model reviews"],
      businessOpportunities: ["Financial planning practice", "Bookkeeping service", "SME finance advisory"],
      pros: ["Applies across industries", "Clear analytical career ladder", "Strong fit with commerce education"],
      challenges: ["Accuracy expectations are high", "Regulations and tax rules change", "Work can be deadline-heavy"],
      futureScope: "Finance roles increasingly combine Excel, BI dashboards, automation, risk analytics, and business partnering.",
      finalOutcome: "You can read financial statements, create a basic model, assess performance, and present recommendations."
    },
    {
      title: "Stock Market", category: "Finance & Commerce", icon: "ph-trend-up", duration: "4-8 months",
      shortDescription: "Study equity markets, securities, risk controls, research methods, and disciplined trading or investing processes.",
      suitableFor: ["Learners interested in markets and business performance", "Commerce or finance students exploring research", "People who can follow rules and manage risk"],
      eligibility: ["Class 12 or graduation in any stream", "Basic finance and spreadsheet knowledge", "Willingness to learn market regulations"],
      requiredSkills: ["Numerical reasoning", "Patience", "Risk awareness"],
      skillsToLearn: ["Fundamental analysis", "Technical analysis", "Portfolio construction", "Risk management", "Trading journals", "Market regulations"],
      tools: ["TradingView", "Screener.in", "NSE India", "Moneycontrol", "Excel", "Broker platforms"],
      roles: [
        role("Equity Research Trainee", "Researches companies, sectors, financial statements, and valuation assumptions.", ["Financial statements", "Valuation", "Report writing"], "INR 3-6 LPA", "INR 8-20 LPA"),
        role("Dealer", "Executes trades, monitors orders, and follows compliance rules for clients or firms.", ["Order types", "Risk limits", "Market operations"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Investment Advisor Assistant", "Supports client profiling, product suitability, and portfolio reviews.", ["Suitability", "Portfolio basics", "Compliance"], "INR 3-5.5 LPA", "INR 7-15 LPA")
      ],
      industries: ["Brokerages", "Wealth management", "Research firms", "Fintech", "Asset management"],
      certifications: ["NISM Series VIII Equity Derivatives", "NISM Research Analyst", "NISM Investment Adviser exams"],
      higherStudyOptions: ["CFA Program", "MBA Finance", "M.Sc. Finance"],
      freelanceOpportunities: ["Research summaries", "Portfolio trackers", "Market education content"],
      businessOpportunities: ["Registered advisory practice after compliance", "Investor education platform", "Research newsletter"],
      pros: ["Builds strong business awareness", "Data and reasoning are visible", "Multiple finance-adjacent roles"],
      challenges: ["Markets are uncertain", "Loss control is essential", "Regulatory boundaries must be respected"],
      futureScope: "Demand remains steady for research, risk analytics, compliance-aware advisory, and long-term wealth management.",
      finalOutcome: "You can prepare a researched stock note, maintain a risk journal, and explain investment decisions responsibly."
    },
    {
      title: "Entrepreneurship", category: "Business & Management", icon: "ph-rocket-launch", duration: "4-9 months", popularity: 94,
      shortDescription: "Validate problems, design business models, test offers, manage operations, and build sustainable ventures.",
      suitableFor: ["Students with startup ideas", "Family-business successors", "Professionals who want to launch side businesses"],
      eligibility: ["No fixed academic requirement", "Problem-solving mindset", "Comfort speaking to customers"],
      requiredSkills: ["Customer curiosity", "Basic budgeting", "Persistence"],
      skillsToLearn: ["Customer discovery", "Business model design", "MVP testing", "Pricing", "Sales funnels", "Unit economics", "Operations planning"],
      tools: ["Business Model Canvas", "Notion", "Canva", "Google Forms", "Razorpay", "Zoho CRM"],
      roles: [
        role("Founder", "Owns problem validation, product direction, hiring, sales, finance, and customer outcomes.", ["Validation", "Sales", "Operations"], "Variable income", "Variable income"),
        role("Startup Operations Associate", "Coordinates founder priorities, metrics, customer support, and process improvements.", ["Operations", "Dashboards", "Communication"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Business Owner", "Runs revenue, costs, suppliers, customer experience, and compliance for a small enterprise.", ["Finance basics", "Vendor management", "Customer service"], "Variable income", "Variable income")
      ],
      industries: ["Startups", "D2C", "Local services", "Edtech", "Food businesses", "Creator businesses"],
      certifications: ["IIM entrepreneurship programs", "Startup India Learning Program", "NPTEL Entrepreneurship"],
      higherStudyOptions: ["MBA Entrepreneurship", "Family Business Management", "Incubator programs"],
      freelanceOpportunities: ["Pitch deck support", "Market research", "Operations setup for small businesses"],
      businessOpportunities: ["D2C brand", "Local service company", "Digital product business", "Consulting micro-agency"],
      pros: ["High ownership", "Learning is practical", "Can create jobs and income streams"],
      challenges: ["Income uncertainty", "Customer acquisition is hard", "Operations can become complex quickly"],
      futureScope: "India's digital payments, logistics, creator commerce, and government startup ecosystem support new venture creation.",
      finalOutcome: "You can validate a business idea, build an MVP plan, create a financial model, and pitch a launch roadmap."
    },
    {
      title: "Sales", category: "Marketing & Sales", icon: "ph-handshake", duration: "3-6 months",
      shortDescription: "Build trust, discover customer needs, handle objections, manage pipelines, and close ethical deals.",
      suitableFor: ["Confident communicators", "People who enjoy targets and customer conversations", "Students interested in business development"],
      eligibility: ["Class 12 or graduation in any stream", "Clear communication in target market language", "Willingness to learn product details"],
      requiredSkills: ["Listening", "Resilience", "Basic presentation"],
      skillsToLearn: ["Prospecting", "Discovery calls", "CRM hygiene", "Demo structure", "Objection handling", "Negotiation", "Account planning"],
      tools: ["Zoho CRM", "Salesforce", "HubSpot CRM", "LinkedIn Sales Navigator", "Google Sheets", "Pitch decks"],
      roles: [
        role("Sales Executive", "Finds leads, explains offerings, follows up, and closes entry-level customer deals.", ["Prospecting", "Follow-up", "Product knowledge"], "INR 2.4-5 LPA + incentives", "INR 6-14 LPA + incentives"),
        role("Business Development Executive", "Builds partnerships, outbound lists, proposals, and meeting pipelines.", ["Lead research", "Cold outreach", "Proposals"], "INR 3-6 LPA + incentives", "INR 8-18 LPA + incentives"),
        role("Account Executive", "Qualifies opportunities, runs demos, negotiates terms, and manages deal closure.", ["Discovery", "Demos", "Negotiation"], "INR 5-9 LPA + incentives", "INR 12-30 LPA + incentives")
      ],
      industries: ["SaaS", "Real estate", "Banking", "Edtech", "Insurance", "B2B services"],
      certifications: ["HubSpot Sales Software", "LinkedIn Sales Strategy", "Salesforce Trailhead Sales modules"],
      higherStudyOptions: ["MBA Marketing", "PG Diploma in Sales Management"],
      freelanceOpportunities: ["Lead generation", "Sales script writing", "CRM cleanup", "Appointment setting"],
      businessOpportunities: ["Sales outsourcing agency", "Lead-generation service", "Channel partner network"],
      pros: ["Clear performance metrics", "Fast career growth for strong performers", "Communication skills compound"],
      challenges: ["Rejection is frequent", "Targets can be stressful", "Ethical selling discipline is essential"],
      futureScope: "Consultative selling, inside sales, CRM automation, and AI-assisted prospecting continue to create demand.",
      finalOutcome: "You can build a lead list, run discovery, maintain a CRM pipeline, and present a deal-closing plan."
    },
    {
      title: "Human Resources", category: "Business & Management", icon: "ph-users-three", duration: "4-7 months",
      shortDescription: "Manage hiring, onboarding, employee experience, payroll coordination, performance, policies, and people analytics.",
      suitableFor: ["People-oriented learners who value fairness and structure", "Graduates interested in recruitment or people operations", "Managers who want better team systems"],
      eligibility: ["Graduation preferred for HR roles", "Good communication and confidentiality", "Basic Excel knowledge"],
      requiredSkills: ["Empathy", "Confidentiality", "Documentation"],
      skillsToLearn: ["Recruitment", "Structured interviews", "Onboarding", "HR policies", "Payroll coordination", "Performance management", "People analytics"],
      tools: ["Darwinbox", "Keka HR", "Zoho People", "Naukri Recruiter", "LinkedIn Recruiter", "Excel", "SurveyMonkey"],
      roles: [
        role("HR Executive", "Supports hiring, employee records, joining formalities, attendance, and HR documentation.", ["HR operations", "Documentation", "Excel"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Recruiter", "Sources candidates, screens profiles, schedules interviews, and manages offer follow-ups.", ["Sourcing", "Screening", "ATS"], "INR 2.4-5.5 LPA", "INR 7-15 LPA"),
        role("People Operations Specialist", "Improves onboarding, engagement, policies, employee support, and HR metrics.", ["Employee experience", "HRMS", "Analytics"], "INR 4-7 LPA", "INR 10-20 LPA")
      ],
      industries: ["IT services", "Manufacturing", "Startups", "Retail", "Healthcare", "Consulting"],
      certifications: ["SHRM Essentials", "HRCI Associate Professional in HR", "NIPM HR programs", "Keka HR certification"],
      higherStudyOptions: ["MBA HR", "PG Diploma in Human Resource Management", "Labour law certificate"],
      freelanceOpportunities: ["Recruitment support", "HR policy drafting", "Onboarding documents", "Employee survey setup"],
      businessOpportunities: ["Recruitment agency", "HR compliance consultancy", "Training and onboarding studio"],
      pros: ["Direct people impact", "Every growing company needs HR systems", "Multiple specialization paths"],
      challenges: ["Sensitive conversations require maturity", "Compliance details matter", "Balancing employee and business needs can be hard"],
      futureScope: "HR tech, people analytics, employee experience, and hybrid-work policies are expanding modern HR roles.",
      finalOutcome: "You can design a hiring workflow, onboarding plan, HR policy checklist, and people dashboard."
    },
    {
      title: "Business Analytics", category: "Business & Management", icon: "ph-chart-bar", duration: "5-9 months", popularity: 96,
      shortDescription: "Translate business questions into clean data, dashboards, insights, and action recommendations.",
      suitableFor: ["Analytical learners who like business problems", "Excel users moving toward dashboards", "Graduates targeting analyst roles without heavy coding"],
      eligibility: ["Graduation preferred", "Basic math and Excel comfort", "Curiosity about operations, customers, or finance"],
      requiredSkills: ["Structured thinking", "Excel basics", "Business curiosity"],
      skillsToLearn: ["Data cleaning", "SQL basics", "Dashboard design", "KPI selection", "Segmentation", "Forecasting basics", "Insight writing"],
      tools: ["Microsoft Excel", "Power BI", "Tableau", "SQL", "Google Looker Studio", "PowerPoint"],
      roles: [
        role("Business Analyst", "Defines problems, gathers requirements, analyzes data, and recommends process improvements.", ["Requirements", "Excel", "Presentation"], "INR 4-7 LPA", "INR 10-22 LPA"),
        role("Operations Analyst", "Tracks operational KPIs, identifies bottlenecks, and builds improvement dashboards.", ["Process mapping", "Power BI", "Root cause analysis"], "INR 3.5-7 LPA", "INR 9-20 LPA"),
        role("BI Analyst", "Creates dashboards, metrics layers, and recurring reports for decision teams.", ["SQL", "Dashboard design", "Data quality"], "INR 4.5-8 LPA", "INR 12-28 LPA")
      ],
      industries: ["E-commerce", "Banking", "Logistics", "SaaS", "Retail", "Healthcare operations"],
      certifications: ["Microsoft PL-300 Power BI", "Tableau Desktop Specialist", "Google Data Analytics Certificate"],
      higherStudyOptions: ["MBA Business Analytics", "PG Diploma in Analytics", "M.Sc. Business Analytics"],
      freelanceOpportunities: ["Dashboard builds", "Excel automation", "KPI reporting templates", "Data cleanup projects"],
      businessOpportunities: ["Analytics consulting studio", "Dashboard template products", "SME reporting service"],
      pros: ["High cross-industry demand", "Portfolio projects are measurable", "Combines business and data"],
      challenges: ["Messy data is common", "Stakeholders may ask unclear questions", "Insights must lead to action"],
      futureScope: "Self-service BI, AI copilots, data storytelling, and operations analytics are growing across companies.",
      finalOutcome: "You can build a dashboard, explain KPIs, find root causes, and present data-backed recommendations."
    },
    {
      title: "Product Management", category: "Business & Management", icon: "ph-cube", duration: "6-10 months", popularity: 98,
      shortDescription: "Discover customer problems, prioritize opportunities, write requirements, launch features, and measure outcomes.",
      suitableFor: ["Problem solvers who like customers, design, business, and technology", "Engineers or analysts moving toward product roles", "Students interested in startups"],
      eligibility: ["Graduation preferred", "Basic understanding of digital products", "Strong communication and structured thinking"],
      requiredSkills: ["Problem framing", "Communication", "Basic data awareness"],
      skillsToLearn: ["User research", "Prioritization", "Roadmapping", "PRDs", "User stories", "Product analytics", "Launch planning"],
      tools: ["Jira", "Figma", "Notion", "Mixpanel", "Google Analytics", "Miro", "Amplitude"],
      roles: [
        role("Associate Product Manager", "Supports discovery, requirements, backlog grooming, feature QA, and launch coordination.", ["PRDs", "User stories", "Analytics"], "INR 6-12 LPA", "INR 15-30 LPA"),
        role("Product Operations Analyst", "Improves product processes, experiment tracking, documentation, and metric reviews.", ["Process", "Dashboards", "Documentation"], "INR 5-9 LPA", "INR 12-24 LPA"),
        role("Product Manager", "Owns product strategy, outcomes, prioritization, stakeholder alignment, and growth loops.", ["Strategy", "Prioritization", "Leadership"], "INR 10-18 LPA", "INR 25-55 LPA")
      ],
      industries: ["SaaS", "Fintech", "Consumer apps", "Edtech", "E-commerce", "Healthtech"],
      certifications: ["Product School certificates", "Pragmatic Institute foundations", "Reforge programs", "Scrum Product Owner"],
      higherStudyOptions: ["MBA", "PG Product Management program", "Design thinking certification"],
      freelanceOpportunities: ["Product research reports", "PRD drafting", "UX audit briefs", "MVP planning"],
      businessOpportunities: ["Product consulting", "MVP studio", "No-code product experiments"],
      pros: ["High business impact", "Works with many teams", "Strong growth path"],
      challenges: ["Authority is often indirect", "Prioritization involves tradeoffs", "Ambiguity is constant"],
      futureScope: "AI product workflows, data-led experimentation, platform products, and product operations are expanding PM demand.",
      finalOutcome: "You can write a PRD, prioritize a roadmap, design an experiment, and present a product case study."
    },
    {
      title: "Content Creation", category: "Media & Content", icon: "ph-play-circle", duration: "3-7 months",
      shortDescription: "Build audience-focused videos, posts, newsletters, scripts, and creator systems with measurable engagement.",
      suitableFor: ["Creators who want consistency", "Students interested in personal branding", "Businesses needing owned media"],
      eligibility: ["No formal requirement", "Basic smartphone or laptop access", "Willingness to publish and learn from feedback"],
      requiredSkills: ["Idea observation", "Consistency", "Basic writing"],
      skillsToLearn: ["Niche selection", "Content pillars", "Hooks", "Scripting", "Filming basics", "Community management", "Analytics"],
      tools: ["Canva", "CapCut", "YouTube Studio", "Instagram Insights", "Notion", "Buffer"],
      roles: [
        role("Content Creator", "Produces platform-native content, tracks engagement, and builds a recognizable audience voice.", ["Scripting", "Editing", "Analytics"], "Variable income", "Variable income"),
        role("Social Media Creator", "Creates reels, posts, stories, and community interactions for brands or personal channels.", ["Short-form content", "Canva", "Community"], "INR 2.4-5 LPA", "INR 6-14 LPA"),
        role("Creator Strategist", "Plans content themes, calendars, distribution, and monetization experiments.", ["Strategy", "Content calendar", "Metrics"], "INR 4-8 LPA", "INR 10-22 LPA")
      ],
      industries: ["Creator economy", "D2C", "Education", "Fitness", "Lifestyle", "Media startups"],
      certifications: ["YouTube Creator Academy", "Meta Blueprint", "HubSpot Social Media Marketing"],
      higherStudyOptions: ["Mass communication", "Digital marketing", "Media production"],
      freelanceOpportunities: ["Content calendars", "Short-form scripts", "Thumbnail packages", "Creator analytics reports"],
      businessOpportunities: ["Niche creator brand", "Content studio", "Digital products or paid community"],
      pros: ["Low barrier to start", "Builds public proof of skill", "Can support many business models"],
      challenges: ["Consistency is difficult", "Algorithms change", "Income can be uneven"],
      futureScope: "Educational creators, niche communities, live commerce, and AI-assisted production continue to grow.",
      finalOutcome: "You can create a content calendar, publish a multi-format series, read analytics, and build a media kit."
    },
    {
      title: "Public Speaking", category: "Communication & Soft Skills", icon: "ph-microphone-stage", duration: "2-5 months",
      shortDescription: "Speak clearly in presentations, meetings, interviews, webinars, facilitation sessions, and public events.",
      suitableFor: ["Students preparing for interviews or leadership roles", "Professionals who present ideas", "Teachers, trainers, and entrepreneurs"],
      eligibility: ["No formal requirement", "Willingness to practise on camera", "Basic language comfort in chosen speaking language"],
      requiredSkills: ["Listening", "Practice discipline", "Basic vocabulary"],
      skillsToLearn: ["Speech structure", "Voice modulation", "Body language", "Storytelling", "Audience analysis", "Q&A handling", "Presentation design"],
      tools: ["PowerPoint", "Google Slides", "Teleprompter apps", "Voice recorder", "Canva", "Timer"],
      roles: [
        role("Corporate Presenter", "Presents business updates, proposals, training content, and stakeholder communication.", ["Presentation", "Clarity", "Q&A"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Trainer", "Facilitates learning sessions, workshops, practice activities, and participant feedback.", ["Facilitation", "Instruction", "Feedback"], "INR 3-7 LPA", "INR 8-20 LPA"),
        role("Professional Speaker", "Delivers talks, panels, keynotes, and webinars for specific audiences.", ["Storytelling", "Stage presence", "Audience engagement"], "Variable income", "Variable income")
      ],
      industries: ["Education", "Corporate training", "Consulting", "Sales", "Events", "Leadership development"],
      certifications: ["Toastmasters pathways", "Dale Carnegie presentation programs", "Coursera public speaking courses"],
      higherStudyOptions: ["Communication studies", "Training and development", "Theatre or performance workshops"],
      freelanceOpportunities: ["Presentation coaching", "Webinar hosting", "Voice-over practice support", "Pitch rehearsal"],
      businessOpportunities: ["Speaking academy", "Corporate training practice", "Executive communication coaching"],
      pros: ["Improves many careers", "Practice progress is visible", "Useful for interviews and leadership"],
      challenges: ["Stage fear takes repetition to reduce", "Feedback can feel personal", "Delivery must fit each audience"],
      futureScope: "Hybrid events, online teaching, leadership communication, and creator-led education increase demand for confident speakers.",
      finalOutcome: "You can design and deliver structured speeches, handle questions, and record a professional speaking sample."
    },
    {
      title: "Photography", category: "Creative & Design", icon: "ph-camera", duration: "4-8 months",
      shortDescription: "Create purposeful images through camera control, lighting, composition, editing, and client delivery.",
      suitableFor: ["Visual learners who enjoy light and composition", "Creators building portfolios", "Students interested in events, products, portraits, or media"],
      eligibility: ["No fixed academic requirement", "Camera or capable smartphone access", "Patience for practice and editing"],
      requiredSkills: ["Observation", "Patience", "Basic file handling"],
      skillsToLearn: ["Exposure", "Composition", "Lighting", "Portrait direction", "Product photography", "Editing", "Client delivery"],
      tools: ["DSLR or mirrorless camera", "Adobe Lightroom", "Photoshop", "Tripod", "Lighting kit", "Google Drive"],
      roles: [
        role("Photographer", "Shoots portraits, products, events, or editorial assignments according to briefs.", ["Camera settings", "Lighting", "Client handling"], "INR 2.4-5 LPA", "INR 6-15 LPA"),
        role("Photo Editor", "Selects, color-corrects, retouches, and exports image sets for publication or clients.", ["Lightroom", "Retouching", "Color"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Studio Assistant", "Supports lighting setup, equipment care, file backups, and shoot coordination.", ["Equipment", "Lighting setup", "Organization"], "INR 1.8-3.5 LPA", "INR 4-8 LPA")
      ],
      industries: ["Weddings", "E-commerce", "Media", "Fashion", "Real estate", "Food brands"],
      certifications: ["Nikon/Canon workshops", "Adobe Lightroom courses", "Photography institute diploma"],
      higherStudyOptions: ["BFA Photography", "Diploma in Professional Photography", "Visual communication"],
      freelanceOpportunities: ["Portrait sessions", "Product shoots", "Event coverage", "Real estate photography"],
      businessOpportunities: ["Photography studio", "Wedding photography brand", "Product content agency"],
      pros: ["Portfolio shows skill directly", "Many niche options", "Can start with small paid projects"],
      challenges: ["Gear costs can rise", "Client expectations vary", "Lighting conditions are unpredictable"],
      futureScope: "E-commerce, creator branding, real estate, food delivery, and social commerce keep visual content demand high.",
      finalOutcome: "You can plan shoots, control exposure and light, edit a cohesive set, and deliver a client-ready gallery."
    },
    {
      title: "Event Management", category: "Business & Management", icon: "ph-confetti", duration: "4-8 months",
      shortDescription: "Plan and execute events through budgeting, vendor coordination, venue design, logistics, sponsorship, and risk control.",
      suitableFor: ["Organized people who enjoy coordination and live experiences", "Students interested in weddings, conferences, festivals, or brand events", "Learners comfortable with fast problem-solving"],
      eligibility: ["Class 12 or graduation in any stream", "Strong communication and coordination", "Ability to work flexible hours during events"],
      requiredSkills: ["Organization", "Vendor communication", "Budget awareness"],
      skillsToLearn: ["Event briefs", "Budgeting", "Vendor management", "Venue planning", "Run sheets", "Guest logistics", "Sponsorship decks"],
      tools: ["Excel", "Canva", "Trello", "Eventbrite", "Google Forms", "WhatsApp Business"],
      roles: [
        role("Event Coordinator", "Tracks tasks, vendors, guest lists, budgets, and event-day execution details.", ["Coordination", "Checklists", "Vendor follow-up"], "INR 2.4-5 LPA", "INR 6-12 LPA"),
        role("Wedding Planner", "Plans ceremonies, decor, hospitality, timelines, vendor teams, and family communication.", ["Hospitality", "Decor planning", "Budgeting"], "INR 3-6 LPA", "INR 8-20 LPA"),
        role("Event Producer", "Owns event concept, production vendors, stage flow, sponsors, and final delivery quality.", ["Production", "Sponsorship", "Risk management"], "INR 5-9 LPA", "INR 12-30 LPA")
      ],
      industries: ["Weddings", "Corporate events", "Sports events", "Festivals", "Brand activations", "Exhibitions"],
      certifications: ["Event Management diploma", "Certified Meeting Professional prep", "Wedding planning certification"],
      higherStudyOptions: ["MBA Event Management", "PG Diploma in Event Management", "Hospitality management"],
      freelanceOpportunities: ["Event proposals", "Vendor coordination", "Guest-list management", "Decor mood boards"],
      businessOpportunities: ["Wedding planning company", "Corporate events agency", "Venue management service"],
      pros: ["Work is energetic and people-facing", "Strong referral-based growth", "Combines creativity and operations"],
      challenges: ["Event-day pressure is high", "Budgets and vendors need constant control", "Work hours can be irregular"],
      futureScope: "Hybrid events, branded experiences, destination weddings, and sports leagues are creating specialized event roles.",
      finalOutcome: "You can prepare an event proposal, budget, vendor plan, run sheet, risk plan, and post-event report."
    },
    {
      title: "Hotel Management", category: "Hospitality & Tourism", icon: "ph-buildings", duration: "6-12 months",
      shortDescription: "Operate guest-centered hotel services across front office, housekeeping, food and beverage, reservations, and guest relations.",
      suitableFor: ["People who enjoy service, etiquette, and operations", "Students interested in hotels, resorts, cruises, or restaurants", "Learners comfortable with shifts and guest interaction"],
      eligibility: ["Class 12 for diploma or degree entry", "Good grooming and communication", "Hospitality mindset"],
      requiredSkills: ["Service attitude", "Professional etiquette", "Teamwork"],
      skillsToLearn: ["Front-office operations", "Reservations", "Housekeeping standards", "F&B service", "Guest relations", "Revenue basics", "Complaint recovery"],
      tools: ["Opera PMS", "IDS Next", "POS systems", "Channel manager", "Excel", "Reservation portals"],
      roles: [
        role("Front Office Associate", "Handles reservations, check-in, guest queries, billing coordination, and room allocation.", ["PMS", "Guest communication", "Night audit basics"], "INR 2-4 LPA", "INR 5-10 LPA"),
        role("Guest Relations Executive", "Manages VIP support, complaints, service recovery, and personalized guest experiences.", ["Service recovery", "Communication", "Coordination"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Hotel Operations Executive", "Coordinates rooms, F&B, staffing, quality checks, and daily operating metrics.", ["Operations", "Quality audit", "Team coordination"], "INR 3.5-7 LPA", "INR 8-18 LPA")
      ],
      industries: ["Hotels", "Resorts", "Cruise lines", "Restaurants", "Facility management", "Luxury hospitality"],
      certifications: ["Diploma in Hotel Management", "AHLEI hospitality certifications", "Food safety and hygiene training"],
      higherStudyOptions: ["BHM", "MBA Hospitality", "PG Diploma in Hotel Operations"],
      freelanceOpportunities: ["Guest service training", "Menu coordination", "Hotel SOP documentation", "Reservation support"],
      businessOpportunities: ["Boutique homestay", "Catering service", "Hospitality training center"],
      pros: ["Global industry exposure", "Clear operational departments", "Strong service skills transfer"],
      challenges: ["Shift work is common", "Guest complaints require patience", "Standards must be consistent"],
      futureScope: "Luxury travel, branded stays, food experiences, and tech-enabled hotel operations continue to expand opportunities.",
      finalOutcome: "You can explain the guest cycle, operate basic hotel workflows, and prepare service-quality checklists."
    },
    {
      title: "Fashion Design", category: "Fashion & Lifestyle", icon: "ph-t-shirt", duration: "8-18 months",
      shortDescription: "Develop apparel from trend research and illustration to pattern making, construction, collection planning, and presentation.",
      suitableFor: ["Creative learners interested in clothing, textiles, and style", "Students who enjoy sketching and hands-on making", "Aspiring designers or boutique founders"],
      eligibility: ["Class 12 for most design diplomas or degrees", "Portfolio or drawing practice helpful", "Interest in fabrics and garment construction"],
      requiredSkills: ["Sketching interest", "Color sense", "Patience for fittings"],
      skillsToLearn: ["Fashion illustration", "Textiles", "Pattern making", "Draping", "Sewing", "Range planning", "Fashion merchandising"],
      tools: ["Sketchbook", "Adobe Illustrator", "CLO 3D", "Sewing machine", "Measuring tools", "Mood-board apps"],
      roles: [
        role("Fashion Designer", "Creates garment concepts, sketches, samples, fabric choices, and collection stories.", ["Illustration", "Textiles", "Construction"], "INR 3-6 LPA", "INR 8-20 LPA"),
        role("Apparel Designer", "Designs commercially viable garments according to brand, season, cost, and production needs.", ["Range planning", "Tech packs", "Fit"], "INR 3.5-7 LPA", "INR 9-22 LPA"),
        role("Fashion Illustrator", "Produces hand or digital garment renderings, flats, and presentation visuals.", ["Rendering", "Flats", "Adobe Illustrator"], "INR 2.5-5 LPA", "INR 6-14 LPA")
      ],
      industries: ["Apparel brands", "Boutiques", "Export houses", "Costume design", "Fashion e-commerce", "Textiles"],
      certifications: ["NIFT continuing education", "Diploma in Fashion Design", "CLO 3D training"],
      higherStudyOptions: ["B.Des Fashion Design", "M.Des Fashion", "Fashion merchandising"],
      freelanceOpportunities: ["Custom garment sketches", "Tech packs", "Boutique collection support", "Styling boards"],
      businessOpportunities: ["Boutique label", "Custom tailoring studio", "Sustainable apparel brand"],
      pros: ["Creative expression is central", "Portfolio work is tangible", "Can combine design and entrepreneurship"],
      challenges: ["Sampling takes time", "Fit and fabric details are exacting", "Trends and costs change quickly"],
      futureScope: "Sustainable fashion, digital sampling, Indian occasion wear, and D2C labels support specialized designers.",
      finalOutcome: "You can build a mini collection with mood boards, illustrations, patterns, sample plan, costing, and portfolio presentation."
    },
    {
      title: "Interior Design", category: "Creative & Design", icon: "ph-armchair", duration: "6-12 months",
      shortDescription: "Design functional spaces using layouts, materials, lighting, furniture, mood boards, budgets, and client presentations.",
      suitableFor: ["Learners who enjoy rooms, decor, materials, and space planning", "Creative students with practical problem-solving skills", "People interested in residential or retail design"],
      eligibility: ["Class 12 for diploma or degree programs", "Basic drawing and measurement comfort", "Interest in architecture, furniture, and lifestyle"],
      requiredSkills: ["Spatial awareness", "Measurement accuracy", "Client listening"],
      skillsToLearn: ["Space planning", "Furniture layout", "Material selection", "Lighting basics", "Mood boards", "2D drafting", "Client presentation"],
      tools: ["AutoCAD", "SketchUp", "Canva", "Pinterest", "Excel", "Enscape"],
      roles: [
        role("Junior Interior Designer", "Creates layouts, mood boards, material options, and client presentation support.", ["Space planning", "AutoCAD", "Mood boards"], "INR 2.5-5 LPA", "INR 6-14 LPA"),
        role("Interior Stylist", "Selects furniture, decor, colors, and accessories to create cohesive finished spaces.", ["Styling", "Sourcing", "Color"], "INR 2.4-5 LPA", "INR 6-12 LPA"),
        role("Design Consultant", "Meets clients, prepares concepts, budgets, vendor coordination, and design proposals.", ["Client briefs", "Budgeting", "Presentation"], "INR 4-8 LPA", "INR 10-24 LPA")
      ],
      industries: ["Residential interiors", "Retail design", "Hospitality", "Furniture brands", "Real estate staging"],
      certifications: ["Diploma in Interior Design", "AutoCAD certification", "SketchUp training"],
      higherStudyOptions: ["B.Des Interior Design", "B.Sc Interior Design", "M.Des"],
      freelanceOpportunities: ["Room layouts", "Mood boards", "Decor sourcing", "3D visualization coordination"],
      businessOpportunities: ["Interior design studio", "Home styling service", "Modular furniture consultancy"],
      pros: ["Combines creativity with practical spaces", "Strong local client market", "Portfolio visuals are persuasive"],
      challenges: ["Budgets and site constraints change", "Vendors need coordination", "Measurements must be precise"],
      futureScope: "Urban housing, renovation, home offices, retail experiences, and sustainable materials are growing design demand.",
      finalOutcome: "You can create room layouts, mood boards, material boards, budget estimates, and client-ready presentations."
    },
    {
      title: "Law", category: "Law & Legal", icon: "ph-scales", duration: "6-12 months",
      shortDescription: "Understand legal systems, research, drafting, contracts, court procedures, compliance, and ethical legal practice.",
      suitableFor: ["Students considering legal studies", "Graduates interested in compliance or legal operations", "Professionals handling contracts or policy documents"],
      eligibility: ["Class 12 for integrated law entrance", "Graduation for 3-year LLB entry", "Strong reading and reasoning skills"],
      requiredSkills: ["Reading comprehension", "Logical reasoning", "Ethical judgement"],
      skillsToLearn: ["Legal research", "Case reading", "Contract basics", "Drafting", "Compliance", "Client interviewing", "Court procedure basics"],
      tools: ["SCC Online", "Manupatra", "India Code", "MS Word", "Google Scholar", "Document management systems"],
      roles: [
        role("Legal Associate", "Researches law, drafts documents, supports case preparation, and coordinates filings.", ["Research", "Drafting", "Case law"], "INR 3-7 LPA", "INR 8-22 LPA"),
        role("Compliance Executive", "Tracks legal obligations, internal controls, policies, and regulatory documentation.", ["Compliance", "Documentation", "Risk"], "INR 3.5-7 LPA", "INR 9-20 LPA"),
        role("Contract Analyst", "Reviews clauses, obligations, risk points, and contract summaries for business teams.", ["Contracts", "Clause review", "MS Word"], "INR 4-8 LPA", "INR 10-24 LPA")
      ],
      industries: ["Law firms", "Corporate legal teams", "Compliance", "Fintech", "Real estate", "Public policy"],
      certifications: ["CLAT/AILET preparation where relevant", "Contract drafting courses", "Compliance certification"],
      higherStudyOptions: ["BA LLB", "LLB", "LLM", "Company Secretary"],
      freelanceOpportunities: ["Contract templates under qualified supervision", "Legal research summaries", "Compliance checklists"],
      businessOpportunities: ["Legal tech support service", "Compliance documentation practice", "Legal content platform"],
      pros: ["Builds strong reasoning and writing", "Many specialization paths", "Important in every regulated business"],
      challenges: ["Formal practice requires qualifications", "Reading load is heavy", "Deadlines and accuracy are critical"],
      futureScope: "Compliance, data privacy, contract lifecycle management, legal operations, and legal tech are creating new roles.",
      finalOutcome: "You can read cases, summarize legal issues, draft basic documents, and understand the qualification path for practice."
    },
    {
      title: "UPSC Preparation", category: "Government & Competitive Exams", icon: "ph-bank", duration: "12-24 months",
      shortDescription: "Prepare for civil services through syllabus mapping, current affairs, answer writing, optional strategy, and mock tests.",
      suitableFor: ["Graduates aiming for civil services", "Learners interested in governance and public policy", "Students with long-term study discipline"],
      eligibility: ["Graduation for UPSC CSE", "Age and attempt limits as per official UPSC notification", "Indian citizenship rules depend on service"],
      requiredSkills: ["Reading discipline", "Current affairs tracking", "Writing clarity"],
      skillsToLearn: ["Syllabus analysis", "Polity", "Economy", "History", "Geography", "Ethics", "Essay and answer writing"],
      tools: ["UPSC syllabus PDF", "NCERT books", "The Hindu/Indian Express", "PIB", "PRS India", "Mock test platforms"],
      roles: [
        role("Civil Services Aspirant", "Follows prelims, mains, optional, interview, revision, and test-series strategy.", ["Syllabus planning", "Answer writing", "Revision"], "Not applicable during preparation", "Role salary depends on service and pay level"),
        role("Policy Research Assistant", "Uses governance knowledge to support policy notes, data summaries, and public-interest research.", ["Policy research", "Writing", "Data interpretation"], "INR 3-6 LPA", "INR 7-15 LPA"),
        role("Public Administration Associate", "Supports administrative projects, documentation, outreach, and program monitoring.", ["Governance", "Documentation", "Monitoring"], "INR 3-5.5 LPA", "INR 7-14 LPA")
      ],
      industries: ["Government", "Think tanks", "Policy consulting", "NGOs", "Public administration training"],
      certifications: ["Official UPSC examination qualification", "Public policy certificates", "Data interpretation workshops"],
      higherStudyOptions: ["MA Public Administration", "Public Policy", "Development Studies"],
      freelanceOpportunities: ["Current affairs notes", "Answer evaluation support", "Study planning assistance"],
      businessOpportunities: ["Exam mentoring program", "Current affairs newsletter", "Answer-writing practice platform"],
      pros: ["Deep understanding of society and governance", "Strong writing and analysis skills", "Multiple public-interest pathways"],
      challenges: ["Long preparation cycle", "High competition", "Requires emotional resilience"],
      futureScope: "Governance knowledge also supports policy, social impact, research, teaching, and public-sector consulting careers.",
      finalOutcome: "You can build a disciplined UPSC plan with syllabus coverage, answer practice, mock tracking, and revision cycles."
    },
    {
      title: "Banking Exams", category: "Government & Competitive Exams", icon: "ph-piggy-bank", duration: "6-12 months",
      shortDescription: "Prepare for bank PO, clerk, and specialist exams through quant, reasoning, English, banking awareness, and mocks.",
      suitableFor: ["Graduates seeking public-sector or banking roles", "Learners comfortable with timed objective tests", "Students who enjoy finance awareness and aptitude"],
      eligibility: ["Graduation for most bank exams", "Age limits as per exam notification", "Basic computer literacy for many roles"],
      requiredSkills: ["Arithmetic", "Reading speed", "Timed practice"],
      skillsToLearn: ["Quantitative aptitude", "Reasoning", "English", "Banking awareness", "Computer basics", "Mock analysis", "Interview preparation"],
      tools: ["IBPS/SBI notifications", "Mock test apps", "Excel for score tracking", "RBI website", "Newspaper banking pages"],
      roles: [
        role("Bank Probationary Officer", "Handles branch operations, customer service, credit, compliance, and team coordination after selection.", ["Banking awareness", "Customer service", "Operations"], "As per bank pay scale", "As per bank pay scale"),
        role("Bank Clerk", "Manages teller support, account services, documentation, and front-office banking transactions.", ["Accuracy", "Computer basics", "Service"], "As per bank pay scale", "As per bank pay scale"),
        role("Banking Operations Associate", "Supports private banking back-office operations, documentation, and reconciliations.", ["Banking process", "Excel", "Documentation"], "INR 2.5-5 LPA", "INR 6-12 LPA")
      ],
      industries: ["Public sector banks", "Private banks", "NBFCs", "Fintech operations", "Cooperative banks"],
      certifications: ["IBPS/SBI exam qualification", "NISM banking-related modules", "IIBF JAIIB after joining"],
      higherStudyOptions: ["MBA Banking and Finance", "M.Com", "IIBF certifications"],
      freelanceOpportunities: ["Aptitude tutoring", "Mock-test analysis", "Banking awareness notes"],
      businessOpportunities: ["Exam coaching center", "Question bank products", "Study planner app"],
      pros: ["Structured syllabus", "Large number of aspirants and resources", "Banking skills transfer to finance operations"],
      challenges: ["Speed and accuracy pressure", "Cutoffs vary", "Regular mock review is mandatory"],
      futureScope: "Digital banking, credit operations, compliance, and customer service keep banking skills relevant.",
      finalOutcome: "You can follow a bank-exam study plan, analyze mocks, revise banking awareness, and prepare for interviews."
    },
    {
      title: "SSC Exams", category: "Government & Competitive Exams", icon: "ph-clipboard-text", duration: "6-12 months",
      shortDescription: "Prepare for SSC roles with general intelligence, quantitative aptitude, English, general awareness, typing, and document verification readiness.",
      suitableFor: ["Aspirants targeting central government non-gazetted roles", "Learners who can practise objective tests consistently", "Students seeking a structured competitive exam path"],
      eligibility: ["Class 12 or graduation depending on SSC exam", "Age limits and physical standards vary by post", "Typing skill required for some posts"],
      requiredSkills: ["Basic math", "Reasoning practice", "Vocabulary building"],
      skillsToLearn: ["Quant", "Reasoning", "English grammar", "General awareness", "Current affairs", "Typing practice", "Mock strategy"],
      tools: ["SSC official website", "Mock test portals", "Typing software", "Lucent GK", "Score tracker sheets"],
      roles: [
        role("SSC CGL Aspirant", "Prepares for graduate-level posts across ministries and departments.", ["Quant", "Reasoning", "GK"], "As per government pay level", "As per government pay level"),
        role("SSC CHSL Aspirant", "Prepares for 10+2 level clerical, assistant, and data-entry roles.", ["Typing", "English", "Accuracy"], "As per government pay level", "As per government pay level"),
        role("Exam Tutor", "Uses SSC preparation expertise to teach aptitude, grammar, GK, or mock analysis.", ["Teaching", "Aptitude", "Test analysis"], "INR 2.5-5 LPA", "INR 6-12 LPA")
      ],
      industries: ["Government departments", "Exam coaching", "Education content", "Public administration support"],
      certifications: ["SSC exam qualification", "Typing speed certificate where required", "Computer proficiency certificate"],
      higherStudyOptions: ["BA Public Administration", "MA Political Science", "Competitive exam coaching specialization"],
      freelanceOpportunities: ["Aptitude tutoring", "GK notes", "Typing practice coaching", "Mock analysis"],
      businessOpportunities: ["SSC coaching batches", "Question bank platform", "Short-notes publishing"],
      pros: ["Well-defined syllabus", "Many role categories", "Preparation improves aptitude"],
      challenges: ["Competition is high", "Exam calendars can shift", "Accuracy under time matters"],
      futureScope: "SSC preparation can also support teaching, content creation, and administrative support careers.",
      finalOutcome: "You can create a tier-wise study plan, practise mocks, track weak topics, and prepare documents for selection stages."
    },
    {
      title: "Railway Exams", category: "Government & Competitive Exams", icon: "ph-train", duration: "6-12 months",
      shortDescription: "Prepare for railway recruitment through aptitude, general science, technical basics where required, CBT practice, and document readiness.",
      suitableFor: ["Aspirants targeting railway clerical, technical, or assistant roles", "Learners comfortable with objective tests", "Students interested in transport operations"],
      eligibility: ["Class 10, ITI, diploma, Class 12, or graduation depending on post", "Age and medical standards as per notification", "Technical qualification for technical posts"],
      requiredSkills: ["General science basics", "Arithmetic", "Exam discipline"],
      skillsToLearn: ["Mathematics", "Reasoning", "General science", "Current affairs", "Railway awareness", "CBT mock analysis", "Document verification"],
      tools: ["RRB websites", "Mock test portals", "NCERT Science", "Score tracker", "Typing tools for relevant posts"],
      roles: [
        role("RRB NTPC Aspirant", "Prepares for non-technical railway roles requiring aptitude, GK, and stage-wise CBT practice.", ["Aptitude", "GK", "Mock review"], "As per railway pay level", "As per railway pay level"),
        role("Railway Technician Aspirant", "Prepares technical trade topics, general science, and CBT patterns for technician posts.", ["Trade basics", "Science", "Accuracy"], "As per railway pay level", "As per railway pay level"),
        role("Transport Operations Assistant", "Supports logistics, scheduling, documentation, and transport operations outside government roles.", ["Scheduling", "Documentation", "Excel"], "INR 2.4-5 LPA", "INR 6-12 LPA")
      ],
      industries: ["Indian Railways", "Metro rail", "Logistics", "Transport operations", "Exam coaching"],
      certifications: ["RRB exam qualification", "ITI/diploma for technical posts", "Computer certificate where relevant"],
      higherStudyOptions: ["Diploma engineering", "Transport management", "Operations management"],
      freelanceOpportunities: ["Railway exam tutoring", "Science notes", "Mock-test review"],
      businessOpportunities: ["Railway exam coaching", "Technical trade study content", "Mock portal"],
      pros: ["Multiple qualification levels", "Structured exam pattern", "Transport knowledge has private-sector relevance"],
      challenges: ["Notifications vary by zone and post", "Medical standards matter", "Competition is high"],
      futureScope: "Rail, metro, logistics, and public transport modernization create adjacent operations opportunities.",
      finalOutcome: "You can prepare a post-specific exam plan, practise CBT mocks, revise science, and track eligibility requirements."
    },
    {
      title: "Defence Exams", category: "Government & Competitive Exams", icon: "ph-shield-star", duration: "6-18 months",
      shortDescription: "Prepare for defence entry through aptitude, general knowledge, SSB personality assessment, physical fitness, and service awareness.",
      suitableFor: ["Students motivated by uniformed services", "Learners with discipline and fitness commitment", "Aspirants for NDA, CDS, AFCAT, or related entries"],
      eligibility: ["Class 12 or graduation depending on entry", "Age, nationality, medical, and physical standards as per notification", "Subject requirements for specific branches"],
      requiredSkills: ["Discipline", "Fitness routine", "General awareness"],
      skillsToLearn: ["Defence aptitude", "SSB psychology", "Group tasks", "Current affairs", "Officer-like qualities", "Interview communication", "Fitness basics"],
      tools: ["Official recruitment websites", "Mock test platforms", "Newspaper editorials", "Fitness tracker", "SSB practice resources"],
      roles: [
        role("Defence Services Aspirant", "Prepares written exam, SSB, medical standards, and service-specific awareness.", ["Aptitude", "SSB readiness", "Fitness"], "As per defence pay scale after selection", "As per defence pay scale after selection"),
        role("Security Operations Associate", "Uses discipline and risk awareness for private-sector safety, administration, or operations roles.", ["Security basics", "Documentation", "Coordination"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Defence Exam Mentor", "Trains aspirants in aptitude, SSB communication, current affairs, and interview practice.", ["Teaching", "Interview coaching", "Current affairs"], "INR 3-6 LPA", "INR 8-16 LPA")
      ],
      industries: ["Armed forces", "Security services", "Aviation support", "Public safety training", "Exam coaching"],
      certifications: ["NDA/CDS/AFCAT qualification", "NCC certificates where applicable", "Fitness and first-aid certificates"],
      higherStudyOptions: ["Defence studies", "Strategic studies", "Public administration"],
      freelanceOpportunities: ["Aptitude tutoring", "SSB mock interview practice", "Fitness planning"],
      businessOpportunities: ["Defence exam academy", "SSB preparation studio", "Fitness bootcamp for aspirants"],
      pros: ["Builds discipline and leadership", "Clear service motivation", "Strong personal development"],
      challenges: ["Medical and physical standards are strict", "Selection is competitive", "Preparation includes personality assessment"],
      futureScope: "Defence preparation skills support leadership, security, aviation, operations, and public-service careers.",
      finalOutcome: "You can build an exam, SSB, current-affairs, and fitness preparation plan aligned to the target entry."
    },
    {
      title: "English Communication", category: "Communication & Soft Skills", icon: "ph-chats-circle", duration: "3-6 months",
      shortDescription: "Improve spoken and written English for interviews, workplace conversations, presentations, email, and professional confidence.",
      suitableFor: ["Students preparing for jobs or higher studies", "Professionals who need better workplace communication", "Learners who understand English but hesitate while speaking"],
      eligibility: ["No formal requirement", "Basic reading ability helpful", "Daily speaking practice commitment"],
      requiredSkills: ["Listening practice", "Vocabulary notebook", "Confidence to make mistakes"],
      skillsToLearn: ["Pronunciation", "Grammar in use", "Email writing", "Interview answers", "Group discussion", "Presentation English", "Workplace vocabulary"],
      tools: ["Grammarly", "Google Docs", "Voice recorder", "YouGlish", "Anki", "BBC Learning English"],
      roles: [
        role("Customer Support Associate", "Uses clear written and spoken English to resolve customer issues and document cases.", ["Email writing", "Listening", "Service tone"], "INR 2.2-4.5 LPA", "INR 5-10 LPA"),
        role("Business Communication Executive", "Drafts emails, presentations, meeting notes, and client communication.", ["Writing", "Presentation", "Minutes"], "INR 3-6 LPA", "INR 7-14 LPA"),
        role("Language Trainer", "Helps learners improve fluency, grammar, interviews, and workplace communication.", ["Teaching", "Feedback", "Fluency drills"], "INR 2.5-5 LPA", "INR 6-14 LPA")
      ],
      industries: ["BPO", "Education", "Sales", "Corporate services", "Hospitality", "Remote support"],
      certifications: ["IELTS/TOEFL where required", "Cambridge English qualifications", "Business English certificates"],
      higherStudyOptions: ["BA English", "Communication studies", "TESOL/TEFL"],
      freelanceOpportunities: ["Spoken English coaching", "Resume and email editing", "Interview practice sessions"],
      businessOpportunities: ["Communication training classes", "Online fluency program", "Interview preparation service"],
      pros: ["Improves many career paths", "Daily practice gives visible progress", "Low-cost learning tools"],
      challenges: ["Fluency needs repetition", "Fear of mistakes slows progress", "Accent clarity takes time"],
      futureScope: "Global remote work, customer success, sales, and education continue to reward clear English communication.",
      finalOutcome: "You can speak in interviews, write professional emails, present short talks, and handle workplace conversations."
    },
    {
      title: "Chartered Accountant", category: "Finance & Commerce", icon: "ph-calculator", duration: "36-60 months",
      shortDescription: "Prepare for CA through accounting, audit, taxation, law, financial management, articleship, and professional ethics.",
      suitableFor: ["Commerce students aiming for accounting and audit careers", "Learners with strong discipline for a long qualification path", "Students interested in tax, compliance, and finance leadership"],
      eligibility: ["Class 12 route through CA Foundation", "Direct entry for eligible graduates as per ICAI rules", "Articleship requirements apply"],
      requiredSkills: ["Accounting basics", "Numerical accuracy", "Long-term study discipline"],
      skillsToLearn: ["Accounting standards", "Audit", "Direct tax", "GST", "Corporate law", "Costing", "Financial management"],
      tools: ["TallyPrime", "Excel", "ICAI BOS portal", "Tax filing utilities", "Audit documentation tools", "Accounting standards"],
      roles: [
        role("Article Assistant", "Supports audit, tax filings, bookkeeping, reconciliations, and client documentation during training.", ["Accounting", "Audit support", "Tax basics"], "Stipend as per firm and city", "Not applicable"),
        role("Chartered Accountant", "Handles audits, tax advisory, financial reporting, compliance, and business finance decisions.", ["Audit", "Tax", "Financial reporting"], "INR 7-12 LPA", "INR 15-40 LPA"),
        role("Finance Controller", "Owns reporting, controls, budgets, audits, compliance, and finance team leadership.", ["Controls", "Reporting", "Leadership"], "INR 12-22 LPA", "INR 25-70 LPA")
      ],
      industries: ["Audit firms", "Corporates", "Tax consulting", "Banking", "Startups", "Public practice"],
      certifications: ["ICAI CA qualification", "Certificate courses in GST, forensic accounting, or IND AS"],
      higherStudyOptions: ["CPA", "CFA", "MBA Finance", "LLB for tax/legal specialization"],
      freelanceOpportunities: ["Bookkeeping", "GST returns under qualification boundaries", "Tax support", "Financial statement preparation"],
      businessOpportunities: ["CA practice", "Tax advisory firm", "Virtual CFO service"],
      pros: ["Highly respected qualification", "Strong finance leadership path", "Practice and job options"],
      challenges: ["Long and demanding exam cycle", "Articleship workload can be intense", "Rules change often"],
      futureScope: "GST, audit analytics, international accounting, virtual CFO services, and compliance automation keep CA skills valuable.",
      finalOutcome: "You can map the CA pathway, master core subjects, complete articleship milestones, and build audit/tax readiness."
    },
    {
      title: "Company Secretary", category: "Finance & Commerce", icon: "ph-file-lock", duration: "24-42 months",
      shortDescription: "Specialize in company law, governance, board processes, compliance, securities law, and corporate secretarial practice.",
      suitableFor: ["Students interested in corporate law and governance", "Commerce or law learners who enjoy documentation", "Professionals targeting compliance roles"],
      eligibility: ["Class 12 route through CSEET", "Graduate entry rules as per ICSI", "Training requirements apply"],
      requiredSkills: ["Legal reading", "Documentation", "Attention to deadlines"],
      skillsToLearn: ["Company law", "Board meetings", "SEBI regulations", "Corporate governance", "Secretarial audit", "FEMA basics", "Compliance calendars"],
      tools: ["MCA portal", "ICSI resources", "Compliance management software", "MS Word", "Excel", "Digital signature tools"],
      roles: [
        role("CS Trainee", "Supports filings, meeting documents, registers, resolutions, and compliance trackers.", ["MCA filing", "Registers", "Drafting"], "Stipend as per organization", "Not applicable"),
        role("Company Secretary", "Advises boards, manages statutory compliance, governance processes, and regulatory filings.", ["Company law", "Governance", "Compliance"], "INR 5-10 LPA", "INR 12-35 LPA"),
        role("Compliance Officer", "Builds regulatory calendars, monitors obligations, and reports compliance risks.", ["Regulations", "Risk", "Documentation"], "INR 5-9 LPA", "INR 12-28 LPA")
      ],
      industries: ["Listed companies", "Corporate law firms", "Compliance teams", "Financial services", "Startups"],
      certifications: ["ICSI CS qualification", "SEBI compliance courses", "Corporate governance programs"],
      higherStudyOptions: ["LLB", "LLM Corporate Law", "MBA Finance", "Governance certifications"],
      freelanceOpportunities: ["Compliance calendar setup", "Meeting documentation", "Company filing support within legal boundaries"],
      businessOpportunities: ["CS practice", "Compliance advisory", "Corporate governance consulting"],
      pros: ["Strong corporate governance niche", "Legal and business overlap", "Demand in regulated companies"],
      challenges: ["Deadlines are strict", "Regulatory updates must be tracked", "Documentation accuracy is critical"],
      futureScope: "Board governance, ESG reporting, startup compliance, and listed-company regulations support demand.",
      finalOutcome: "You can build compliance calendars, draft resolutions, understand filings, and prepare for CS qualification stages."
    },
    {
      title: "CMA", category: "Finance & Commerce", icon: "ph-coins", duration: "24-42 months",
      shortDescription: "Build expertise in cost accounting, management accounting, budgeting, internal controls, taxation, and strategic finance.",
      suitableFor: ["Commerce students interested in costing and manufacturing finance", "Finance learners who enjoy internal decision support", "Professionals targeting cost control roles"],
      eligibility: ["Class 12 route through CMA Foundation", "Graduation route as per ICMAI rules", "Practical training requirements apply"],
      requiredSkills: ["Costing basics", "Numerical accuracy", "Excel discipline"],
      skillsToLearn: ["Cost accounting", "Budgetary control", "Variance analysis", "Management accounting", "Taxation", "Internal audit", "Strategic cost management"],
      tools: ["Excel", "TallyPrime", "SAP basics", "Power BI", "ICMAI study resources", "ERP reports"],
      roles: [
        role("Cost Accountant Trainee", "Supports cost sheets, inventory valuation, variance reports, and budget tracking.", ["Cost sheets", "Excel", "Inventory"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Cost Accountant", "Analyzes product costs, margins, budgets, controls, and profitability improvement.", ["Costing", "Variance analysis", "ERP"], "INR 5-9 LPA", "INR 12-28 LPA"),
        role("Management Accountant", "Prepares internal reports, forecasts, decision models, and performance analysis.", ["Forecasting", "Power BI", "Business partnering"], "INR 6-11 LPA", "INR 15-35 LPA")
      ],
      industries: ["Manufacturing", "FMCG", "Automotive", "Pharma", "Energy", "Consulting"],
      certifications: ["ICMAI CMA qualification", "SAP finance basics", "Power BI certification"],
      higherStudyOptions: ["MBA Finance", "CIMA", "CFA", "M.Com"],
      freelanceOpportunities: ["Cost sheet templates", "Budget dashboards", "Inventory analysis", "SME costing support"],
      businessOpportunities: ["Cost consulting practice", "Manufacturing finance advisory", "Virtual management accounting service"],
      pros: ["Strong fit for manufacturing and operations", "Decision-focused finance role", "Useful with ERP systems"],
      challenges: ["Cost data can be messy", "Factory operations need context", "Qualification requires persistence"],
      futureScope: "Margin pressure, automation, and supply-chain complexity increase demand for cost and performance specialists.",
      finalOutcome: "You can prepare cost sheets, analyze variances, create budgets, and understand the CMA qualification path."
    },
    {
      title: "MBA Preparation", category: "Finance & Commerce", icon: "ph-graduation-cap", duration: "6-12 months",
      shortDescription: "Prepare for management entrance exams, interviews, group discussions, profile building, and business school selection.",
      suitableFor: ["Graduates targeting business schools", "Working professionals planning career acceleration", "Students interested in management, consulting, finance, marketing, or operations"],
      eligibility: ["Graduation or final-year eligibility as per exam rules", "Exam-specific marks, age, or work-experience criteria may apply", "Strong aptitude practice commitment"],
      requiredSkills: ["Quant basics", "Reading habit", "Time management"],
      skillsToLearn: ["Quantitative aptitude", "DILR", "Verbal ability", "Mock analysis", "GD preparation", "Personal interview", "Profile building"],
      tools: ["CAT/XAT/CMAT official sites", "Mock test platforms", "Excel score tracker", "Newspapers", "MBA college reports", "LinkedIn"],
      roles: [
        role("MBA Aspirant", "Prepares entrance tests, applications, interviews, and specialization decisions.", ["Aptitude", "Mock analysis", "Interview prep"], "Not applicable during preparation", "Depends on post-MBA role"),
        role("Management Trainee", "Rotates across business functions after MBA or management-entry selection.", ["Business basics", "Communication", "Analysis"], "INR 5-10 LPA", "INR 12-25 LPA"),
        role("Business Analyst Associate", "Uses MBA preparation and business thinking to support analysis and recommendations.", ["Problem solving", "Excel", "Presentation"], "INR 4-8 LPA", "INR 10-22 LPA")
      ],
      industries: ["Business schools", "Consulting", "Finance", "Marketing", "Operations", "Startups"],
      certifications: ["CAT/XAT/GMAT score", "Business analytics or Excel certificates", "Communication workshops"],
      higherStudyOptions: ["MBA", "PGDM", "Executive MBA", "Master in Management"],
      freelanceOpportunities: ["Aptitude tutoring", "SOP editing", "Mock interview support", "Profile review"],
      businessOpportunities: ["MBA mentoring service", "Mock-test analytics product", "GD-PI coaching"],
      pros: ["Structured exam milestones", "Can change career direction", "Builds management language"],
      challenges: ["Mock scores fluctuate", "Competition is high", "Applications need authentic profile work"],
      futureScope: "Management education remains valuable when paired with clear specialization, internships, and practical projects.",
      finalOutcome: "You can create an exam calendar, analyze mocks, build a B-school shortlist, and prepare for GD-PI rounds."
    },
    {
      title: "Teaching", category: "Education & Teaching", icon: "ph-chalkboard-teacher", duration: "6-12 months",
      shortDescription: "Learn pedagogy, lesson planning, classroom management, assessment, inclusive education, and digital teaching methods.",
      suitableFor: ["Students who enjoy explaining concepts", "Graduates considering school or coaching careers", "Subject experts moving into teaching"],
      eligibility: ["Class 12 or graduation depending on teaching level", "B.Ed, D.El.Ed, CTET/TET may be required for formal school roles", "Subject knowledge for higher classes"],
      requiredSkills: ["Patience", "Subject clarity", "Communication"],
      skillsToLearn: ["Lesson planning", "Pedagogy", "Assessment design", "Classroom management", "Inclusive education", "EdTech tools", "Parent communication"],
      tools: ["Google Classroom", "PowerPoint", "Kahoot", "Canva", "Learning management systems", "Worksheets"],
      roles: [
        role("School Teacher", "Plans lessons, teaches curriculum, assesses learning, and supports student development.", ["Pedagogy", "Assessment", "Classroom management"], "INR 2.4-5 LPA", "INR 6-14 LPA"),
        role("Online Tutor", "Delivers subject lessons, doubt solving, assignments, and progress feedback through digital platforms.", ["Online teaching", "Subject expertise", "Feedback"], "INR 2-6 LPA", "INR 7-18 LPA"),
        role("Curriculum Developer", "Creates lesson plans, worksheets, assessments, and learning content for institutions or edtech.", ["Curriculum", "Writing", "Assessment"], "INR 3.5-7 LPA", "INR 8-18 LPA")
      ],
      industries: ["Schools", "Edtech", "Coaching institutes", "NGOs", "Publishing", "Corporate training"],
      certifications: ["B.Ed or D.El.Ed", "CTET/TET where required", "Google Certified Educator"],
      higherStudyOptions: ["M.Ed", "MA Education", "Special education diploma"],
      freelanceOpportunities: ["Tutoring", "Worksheet creation", "Lesson plan writing", "Exam coaching"],
      businessOpportunities: ["Tuition center", "Online course channel", "Curriculum studio"],
      pros: ["High social impact", "Subject expertise compounds", "Many online opportunities"],
      challenges: ["Classroom energy management is demanding", "Assessment fairness matters", "Formal roles need qualifications"],
      futureScope: "Blended learning, skill education, inclusive classrooms, and edtech content continue to create teaching pathways.",
      finalOutcome: "You can create lesson plans, assessments, classroom routines, and a demo teaching portfolio."
    },
    {
      title: "Journalism & Mass Communication", category: "Media & Content", icon: "ph-newspaper", duration: "6-12 months",
      shortDescription: "Report, verify, write, edit, produce, and publish public-interest stories across print, digital, audio, and video media.",
      suitableFor: ["Curious learners who ask questions and follow news", "Students interested in reporting, media, or communication", "Writers who want newsroom discipline"],
      eligibility: ["Class 12 for UG programs", "Graduation for PG journalism programs", "Strong language and current affairs interest"],
      requiredSkills: ["Curiosity", "Writing clarity", "Ethical judgement"],
      skillsToLearn: ["Reporting", "Interviewing", "Fact-checking", "News writing", "Media law", "Audio-video basics", "Newsroom editing"],
      tools: ["CMS", "Audio recorder", "Google Docs", "Fact-checking tools", "Canva", "Video editing software"],
      roles: [
        role("Reporter", "Finds story leads, interviews sources, verifies claims, and files accurate news copy.", ["Reporting", "Interviewing", "Verification"], "INR 2.4-5 LPA", "INR 6-14 LPA"),
        role("News Producer", "Plans bulletins, coordinates scripts, visuals, guests, and publishing timelines.", ["Production", "Script editing", "Coordination"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Communications Executive", "Creates press notes, newsletters, internal updates, and media coordination for organizations.", ["Writing", "Media relations", "Editing"], "INR 3-6 LPA", "INR 7-16 LPA")
      ],
      industries: ["Newsrooms", "Digital media", "Broadcast", "PR agencies", "Corporate communications", "NGOs"],
      certifications: ["Journalism diploma", "Fact-checking certification", "Mobile journalism workshops"],
      higherStudyOptions: ["BJMC", "MJMC", "MA Journalism", "Digital media specialization"],
      freelanceOpportunities: ["Feature writing", "Podcast scripts", "Local reporting", "Newsletter editing"],
      businessOpportunities: ["Niche media publication", "Podcast network", "Local news platform"],
      pros: ["Work is intellectually active", "Portfolio clips show credibility", "Builds public communication skills"],
      challenges: ["Deadlines are intense", "Verification pressure is high", "Field reporting can be unpredictable"],
      futureScope: "Digital subscriptions, explainers, data journalism, newsletters, and multimedia reporting are reshaping media careers.",
      finalOutcome: "You can pitch, report, verify, write, edit, and publish a professional news or feature story portfolio."
    },
    {
      title: "Animation & VFX", category: "Creative & Design", icon: "ph-magic-wand", duration: "9-18 months",
      shortDescription: "Create motion, characters, effects, compositing, and believable visual worlds for media, games, advertising, and film.",
      suitableFor: ["Visual storytellers who enjoy motion and fantasy", "Artists interested in digital production", "Students ready for long practice cycles"],
      eligibility: ["Class 12 for diploma or degree programs", "Drawing practice helpful for animation", "Computer graphics interest"],
      requiredSkills: ["Visual patience", "Drawing or observation", "Practice discipline"],
      skillsToLearn: ["Animation principles", "Storyboarding", "3D modelling", "Rigging", "Compositing", "Tracking", "Rendering"],
      tools: ["Blender", "Maya", "After Effects", "Nuke", "Adobe Animate", "Substance Painter"],
      roles: [
        role("2D Animator", "Creates character motion, key poses, in-betweens, timing, and scene animation.", ["Timing", "Drawing", "Animation principles"], "INR 2.5-5 LPA", "INR 6-14 LPA"),
        role("3D Animator", "Animates characters, cameras, objects, and performances using rigs and scene timelines.", ["Maya", "Body mechanics", "Acting"], "INR 3-7 LPA", "INR 8-20 LPA"),
        role("VFX Artist", "Handles roto, tracking, keying, cleanup, compositing, particles, and shot finishing.", ["Compositing", "Tracking", "Nuke"], "INR 3-6 LPA", "INR 8-18 LPA")
      ],
      industries: ["Film", "OTT", "Gaming", "Advertising", "Edtech media", "Architecture visualization"],
      certifications: ["MAAC/Arena animation diploma", "Autodesk Maya certification", "Foundry Nuke training"],
      higherStudyOptions: ["B.Des Animation", "B.Sc Animation and VFX", "M.Des Animation"],
      freelanceOpportunities: ["Logo animation", "Explainer videos", "3D assets", "Compositing shots"],
      businessOpportunities: ["Animation studio", "Motion graphics agency", "Game asset marketplace"],
      pros: ["Highly visual portfolio", "Global project potential", "Strong creative specialization"],
      challenges: ["Software learning curve is high", "Render and hardware needs can be heavy", "Shot revisions require patience"],
      futureScope: "Streaming content, games, AR/VR, virtual production, and advertising keep demand for animation and VFX skills.",
      finalOutcome: "You can create an animation/VFX showreel with storyboards, animated shots, compositing breakdowns, and final renders."
    },
    {
      title: "Culinary Arts", category: "Hospitality & Tourism", icon: "ph-cooking-pot", duration: "6-12 months",
      shortDescription: "Build professional kitchen technique, food safety, menu planning, costing, plating, and consistent cooking execution.",
      suitableFor: ["Learners who love cooking and organized kitchen work", "Students interested in hotels, restaurants, or food businesses", "Home cooks aiming for professional standards"],
      eligibility: ["Class 10 or 12 depending on diploma", "Food hygiene awareness", "Ability to work in standing kitchen shifts"],
      requiredSkills: ["Cleanliness", "Time discipline", "Taste awareness"],
      skillsToLearn: ["Knife skills", "Mise en place", "Cooking methods", "Food safety", "Bakery basics", "Recipe costing", "Plating"],
      tools: ["Chef knife", "Kitchen scales", "Food thermometer", "Recipe costing sheets", "Commercial kitchen equipment", "POS basics"],
      roles: [
        role("Commis Chef", "Prepares ingredients, follows recipes, supports stations, and maintains kitchen hygiene.", ["Knife skills", "Mise en place", "Hygiene"], "INR 1.8-3.5 LPA", "INR 4-8 LPA"),
        role("Chef de Partie", "Manages a kitchen station, prep schedules, quality checks, and junior team coordination.", ["Station management", "Consistency", "Plating"], "INR 3-6 LPA", "INR 7-14 LPA"),
        role("Culinary Entrepreneur", "Builds food products, cloud kitchens, catering menus, pricing, and service operations.", ["Menu costing", "Operations", "Quality control"], "Variable income", "Variable income")
      ],
      industries: ["Hotels", "Restaurants", "Cloud kitchens", "Bakeries", "Catering", "Food startups"],
      certifications: ["Food safety training", "Culinary diploma", "Bakery and pastry certification"],
      higherStudyOptions: ["BHM Culinary", "Diploma in Culinary Arts", "Bakery specialization"],
      freelanceOpportunities: ["Private dining", "Recipe development", "Food styling support", "Catering events"],
      businessOpportunities: ["Cloud kitchen", "Bakery brand", "Catering service", "Cooking classes"],
      pros: ["Hands-on and creative", "Food business options are wide", "Skill improves through visible practice"],
      challenges: ["Kitchen work is physically demanding", "Consistency under pressure matters", "Margins need careful costing"],
      futureScope: "Cloud kitchens, regional cuisine, premium bakery, healthy meals, and food content create new culinary pathways.",
      finalOutcome: "You can execute core cooking methods, design a menu, cost recipes, maintain hygiene, and present plated dishes."
    },
    {
      title: "Aviation", category: "Aviation & Travel", icon: "ph-airplane-tilt", duration: "6-12 months",
      shortDescription: "Learn airline operations, passenger service, airport processes, grooming, safety awareness, and disruption handling.",
      suitableFor: ["Service-minded learners interested in airlines or airports", "Students comfortable with grooming and communication standards", "People willing to work shifts and travel environments"],
      eligibility: ["Class 12 for many entry roles", "Age, height, medical, and language criteria vary by airline", "Passport may be required for some roles"],
      requiredSkills: ["Service etiquette", "Clear communication", "Calm under pressure"],
      skillsToLearn: ["Airport codes", "Passenger handling", "Check-in", "Boarding", "Baggage basics", "Safety procedures", "Cabin crew grooming"],
      tools: ["Departure Control System", "Reservation systems", "PA announcement scripts", "Safety equipment", "Office suite", "Airline SOPs"],
      roles: [
        role("Cabin Crew", "Ensures passenger safety, service, announcements, emergency readiness, and onboard hospitality.", ["Safety", "Service", "Grooming"], "INR 4-8 LPA", "INR 10-24 LPA"),
        role("Ground Staff", "Handles check-in, boarding, baggage coordination, special assistance, and passenger queries.", ["DCS", "Passenger service", "Coordination"], "INR 2.4-5 LPA", "INR 6-12 LPA"),
        role("Airline Operations Executive", "Supports turnaround, schedules, documentation, disruptions, and operational coordination.", ["Operations", "Documentation", "Problem-solving"], "INR 3.5-7 LPA", "INR 8-18 LPA")
      ],
      industries: ["Airlines", "Airports", "Ground handling", "Travel services", "Hospitality"],
      certifications: ["Aviation hospitality diploma", "IATA foundation courses", "First-aid and safety training"],
      higherStudyOptions: ["BBA Aviation", "Airport management", "IATA programs"],
      freelanceOpportunities: ["Aviation interview coaching", "Grooming workshops", "Travel documentation support"],
      businessOpportunities: ["Aviation training academy", "Cabin crew grooming studio", "Airport services consultancy"],
      pros: ["Professional grooming and service exposure", "Dynamic workplace", "Airline career ladder"],
      challenges: ["Shift timings and physical standards matter", "Passenger issues can be stressful", "Selection criteria can be strict"],
      futureScope: "Airport expansion, regional connectivity, and aviation hospitality continue to create passenger-service roles.",
      finalOutcome: "You can explain airport workflows, prepare for airline interviews, practise announcements, and understand safety responsibilities."
    },
    {
      title: "Travel & Tourism", category: "Aviation & Travel", icon: "ph-globe-hemisphere-east", duration: "4-8 months",
      shortDescription: "Design, sell, and operate travel experiences through destination knowledge, itinerary planning, reservations, visas, and customer care.",
      suitableFor: ["People who enjoy geography, cultures, and planning trips", "Students interested in tourism companies or travel agencies", "Learners with strong service and sales orientation"],
      eligibility: ["Class 12 or graduation in any stream", "Communication and destination research skills", "Basic computer and email ability"],
      requiredSkills: ["Geography awareness", "Customer service", "Planning"],
      skillsToLearn: ["Itinerary design", "Travel costing", "Visa basics", "GDS awareness", "Destination research", "Travel insurance", "Crisis handling"],
      tools: ["Amadeus or Galileo basics", "Booking portals", "Google Maps", "CRM", "Excel", "Itinerary builders"],
      roles: [
        role("Travel Consultant", "Understands customer needs, designs packages, quotes prices, and manages bookings.", ["Itinerary", "Sales", "Booking systems"], "INR 2.4-5 LPA", "INR 6-14 LPA"),
        role("Tour Executive", "Coordinates suppliers, travel documents, group operations, and on-trip support.", ["Operations", "Supplier coordination", "Documentation"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Destination Specialist", "Builds deep destination knowledge, custom experiences, and premium travel proposals.", ["Destination research", "Storytelling", "Costing"], "INR 3.5-7 LPA", "INR 8-18 LPA")
      ],
      industries: ["Travel agencies", "Tour operators", "OTAs", "Hotels", "Destination management companies", "Cruises"],
      certifications: ["IATA travel and tourism courses", "Destination specialist certificates", "GDS training"],
      higherStudyOptions: ["BTTM", "MBA Tourism", "Hospitality and tourism management"],
      freelanceOpportunities: ["Custom itinerary planning", "Visa document checklists", "Travel content", "Group trip coordination"],
      businessOpportunities: ["Boutique travel agency", "Adventure tour company", "Destination wedding travel service"],
      pros: ["Work connects cultures and experiences", "Many niche markets", "Sales plus operations career path"],
      challenges: ["Disruptions require calm handling", "Margins and supplier reliability matter", "Seasonality affects demand"],
      futureScope: "Experiential travel, spiritual tourism, wellness trips, and domestic tourism are expanding India's travel market.",
      finalOutcome: "You can design a complete itinerary with costing, suppliers, documents, risk notes, and customer proposal."
    },
    {
      title: "Supply Chain & Logistics", category: "Business & Management", icon: "ph-truck", duration: "5-9 months",
      shortDescription: "Coordinate sourcing, inventory, warehouses, transportation, documentation, and delivery performance across networks.",
      suitableFor: ["Organized learners interested in operations and movement of goods", "Commerce or engineering graduates exploring logistics", "Professionals in retail, manufacturing, or e-commerce operations"],
      eligibility: ["Graduation preferred for analyst roles", "Class 12 may work for operations entry roles", "Excel comfort helpful"],
      requiredSkills: ["Process thinking", "Numerical accuracy", "Coordination"],
      skillsToLearn: ["Procurement", "Inventory planning", "Warehouse operations", "Transportation", "S&OP basics", "Logistics documentation", "KPI tracking"],
      tools: ["Excel", "SAP basics", "Warehouse Management System", "Transport Management System", "Power BI", "Barcode scanners"],
      roles: [
        role("Logistics Coordinator", "Tracks shipments, routes, documents, vendors, delivery issues, and customer updates.", ["Tracking", "Documentation", "Coordination"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Supply Chain Analyst", "Analyzes demand, inventory, service levels, costs, and improvement opportunities.", ["Excel", "Power BI", "Forecasting"], "INR 4-8 LPA", "INR 10-22 LPA"),
        role("Procurement Executive", "Sources suppliers, compares quotes, negotiates terms, and follows purchase processes.", ["RFQ", "Negotiation", "Supplier evaluation"], "INR 3-6 LPA", "INR 8-16 LPA")
      ],
      industries: ["Manufacturing", "E-commerce", "FMCG", "Retail", "Logistics providers", "Pharma"],
      certifications: ["APICS/ASCM foundations", "CIPS procurement courses", "SAP MM basics"],
      higherStudyOptions: ["MBA Operations", "PG Diploma in Supply Chain", "Logistics management"],
      freelanceOpportunities: ["Inventory templates", "Route cost analysis", "Warehouse SOP writing", "Vendor comparison sheets"],
      businessOpportunities: ["Last-mile delivery service", "Procurement support agency", "Warehouse consulting"],
      pros: ["Critical to every product business", "Operational impact is measurable", "Strong demand in e-commerce"],
      challenges: ["Delays and disruptions are common", "Data accuracy matters", "Coordination across vendors can be demanding"],
      futureScope: "Quick commerce, manufacturing growth, cold chain, and digitized logistics are expanding supply-chain careers.",
      finalOutcome: "You can map a supply chain, calculate inventory metrics, design a logistics dashboard, and propose improvements."
    },
    {
      title: "Real Estate", category: "Business & Management", icon: "ph-house-line", duration: "4-8 months",
      shortDescription: "Evaluate, market, sell, lease, and manage property using location analysis, documentation, finance, and client advisory.",
      suitableFor: ["People interested in property, cities, and client advisory", "Sales-oriented learners", "Family business or brokerage entrants"],
      eligibility: ["Class 12 or graduation in any stream", "Local RERA registration may be required for agents", "Strong communication and field mobility"],
      requiredSkills: ["Client communication", "Local market awareness", "Documentation"],
      skillsToLearn: ["Property types", "Location analysis", "RERA basics", "Site visits", "Valuation basics", "Leasing", "Negotiation"],
      tools: ["Magicbricks", "99acres", "CRM", "Excel", "Google Maps", "RERA portals"],
      roles: [
        role("Real Estate Consultant", "Advises clients, sources properties, arranges site visits, and supports negotiation.", ["Market knowledge", "Sales", "Client needs"], "INR 2.4-5 LPA + incentives", "INR 8-20 LPA + incentives"),
        role("Property Manager", "Handles tenants, maintenance, rent records, inspections, and owner communication.", ["Tenant management", "Maintenance coordination", "Records"], "INR 3-6 LPA", "INR 8-16 LPA"),
        role("Leasing Executive", "Finds tenants, negotiates leases, tracks documents, and supports commercial or residential closures.", ["Leasing", "Documentation", "Negotiation"], "INR 3-6 LPA + incentives", "INR 8-18 LPA + incentives")
      ],
      industries: ["Brokerages", "Developers", "Property management", "Co-working", "Retail leasing", "Real estate investment"],
      certifications: ["RERA registration where required", "Real estate valuation basics", "Property management certificate"],
      higherStudyOptions: ["MBA Real Estate", "Urban planning", "Valuation certification"],
      freelanceOpportunities: ["Property listing copy", "Site-visit coordination", "Rental management", "Market reports"],
      businessOpportunities: ["Brokerage firm", "Property management service", "Co-living operations"],
      pros: ["Local expertise can create advantage", "High incentive potential", "Useful for investment decisions"],
      challenges: ["Trust and documentation are critical", "Market cycles affect income", "Fieldwork is significant"],
      futureScope: "Urbanization, commercial leasing, managed rentals, and proptech support real estate career growth.",
      finalOutcome: "You can evaluate a property, prepare a listing, run a site visit, check documents, and present a deal summary."
    },
    {
      title: "Insurance", category: "Finance & Commerce", icon: "ph-shield-check", duration: "3-6 months",
      shortDescription: "Assess risk, explain insurance products, support underwriting, manage claims, and recommend suitable protection ethically.",
      suitableFor: ["Learners interested in finance and risk", "Sales professionals moving into advisory roles", "Students who enjoy customer education"],
      eligibility: ["Class 12 or graduation depending on role", "IRDAI licensing for insurance agents", "Clear communication and ethical selling mindset"],
      requiredSkills: ["Risk awareness", "Customer listening", "Documentation"],
      skillsToLearn: ["Insurance principles", "Life insurance", "Health insurance", "Motor policies", "Underwriting basics", "Claims process", "Suitability"],
      tools: ["Policy administration systems", "CRM", "Premium calculators", "Excel", "IRDAI resources", "Claims forms"],
      roles: [
        role("Insurance Advisor", "Analyzes customer needs, explains suitable products, and supports policy servicing.", ["Needs analysis", "Product knowledge", "Ethical selling"], "Commission-based or INR 2.5-5 LPA", "INR 6-18 LPA or variable"),
        role("Underwriting Assistant", "Reviews proposal forms, risk factors, documents, exclusions, and pricing support.", ["Risk review", "Documentation", "Policy terms"], "INR 3-6 LPA", "INR 7-15 LPA"),
        role("Claims Executive", "Coordinates claim intimation, document checks, assessments, and settlement communication.", ["Claims process", "Verification", "Customer handling"], "INR 3-6 LPA", "INR 8-16 LPA")
      ],
      industries: ["Life insurance", "Health insurance", "General insurance", "Brokers", "TPAs", "Insurtech"],
      certifications: ["IRDAI agent license", "III insurance certifications", "NISM insurance-related modules"],
      higherStudyOptions: ["MBA Insurance", "Actuarial science basics", "Risk management"],
      freelanceOpportunities: ["Insurance education content", "Policy comparison support", "Claims documentation help"],
      businessOpportunities: ["Insurance advisory practice", "Claims assistance service", "Risk education platform"],
      pros: ["Every household and business needs risk protection", "Advisory income can compound", "Strong regulated industry"],
      challenges: ["Mis-selling risks must be avoided", "Claims can be emotional", "Product terms require careful explanation"],
      futureScope: "Health protection, cyber insurance, embedded insurance, and insurtech are expanding the market.",
      finalOutcome: "You can explain insurance products, map customer needs, compare policies, and support claim documentation."
    },
    {
      title: "Retail Management", category: "Business & Management", icon: "ph-storefront", duration: "4-8 months",
      shortDescription: "Run retail stores through merchandising, inventory, customer service, staff scheduling, sales metrics, and omnichannel operations.",
      suitableFor: ["People who enjoy customer-facing operations", "Students interested in stores, malls, fashion, grocery, or electronics retail", "Family business learners"],
      eligibility: ["Class 12 or graduation in any stream", "Comfort with shifts and customers", "Basic math for billing and stock"],
      requiredSkills: ["Customer service", "Stock discipline", "Teamwork"],
      skillsToLearn: ["Store operations", "Inventory control", "Visual merchandising", "POS billing", "Sales KPIs", "Loss prevention", "Team scheduling"],
      tools: ["POS systems", "ERP", "Excel", "Inventory scanners", "Planogram tools", "CRM"],
      roles: [
        role("Store Executive", "Handles billing support, floor sales, stock checks, customer assistance, and store upkeep.", ["POS", "Product knowledge", "Customer service"], "INR 2-4 LPA", "INR 5-9 LPA"),
        role("Retail Manager", "Manages sales targets, staff, inventory, store standards, and customer experience.", ["Team management", "KPIs", "Inventory"], "INR 4-8 LPA", "INR 10-22 LPA"),
        role("Merchandising Analyst", "Tracks assortment, stock movement, pricing, promotion results, and buying inputs.", ["Assortment", "Excel", "Sales analysis"], "INR 3.5-7 LPA", "INR 9-18 LPA")
      ],
      industries: ["Fashion retail", "Grocery", "Electronics", "Jewellery", "Pharmacy retail", "E-commerce stores"],
      certifications: ["Retail management diploma", "NSDC retail courses", "Visual merchandising certificate"],
      higherStudyOptions: ["BBA Retail", "MBA Retail Management", "Merchandising programs"],
      freelanceOpportunities: ["Store audit checklists", "Visual merchandising support", "Inventory cleanup", "Staff training"],
      businessOpportunities: ["Franchise store", "Specialty retail shop", "Visual merchandising service"],
      pros: ["Practical business exposure", "Performance metrics are visible", "Good path into store leadership"],
      challenges: ["Customer pressure is constant", "Inventory errors affect profit", "Work hours can include weekends"],
      futureScope: "Omnichannel retail, quick commerce, private labels, and experiential stores keep retail skills relevant.",
      finalOutcome: "You can manage store checklists, read retail KPIs, plan merchandising, and improve customer experience."
    },
    {
      title: "E-commerce Management", category: "Business & Management", icon: "ph-shopping-cart", duration: "4-8 months",
      shortDescription: "Operate online stores through catalog management, marketplace listings, pricing, fulfillment, ads, analytics, and retention.",
      suitableFor: ["Learners interested in online selling and D2C brands", "Small business owners moving online", "Students who enjoy operations plus marketing"],
      eligibility: ["Class 12 or graduation in any stream", "Basic spreadsheet and internet skills", "Understanding of products and customer service"],
      requiredSkills: ["Product detail accuracy", "Customer focus", "Spreadsheet basics"],
      skillsToLearn: ["Catalog management", "Marketplace SEO", "Pricing", "Order processing", "Returns", "Conversion optimization", "E-commerce analytics"],
      tools: ["Shopify", "Amazon Seller Central", "Flipkart Seller Hub", "Google Analytics", "Shiprocket", "Canva", "CRM"],
      roles: [
        role("E-commerce Executive", "Manages listings, orders, inventory, offers, content, and daily marketplace operations.", ["Catalog", "Orders", "Seller tools"], "INR 2.5-5 LPA", "INR 6-14 LPA"),
        role("Marketplace Manager", "Improves marketplace visibility, pricing, promotions, seller metrics, and growth plans.", ["Marketplace ads", "Pricing", "Seller metrics"], "INR 4-8 LPA", "INR 10-24 LPA"),
        role("D2C Operations Associate", "Coordinates store operations, fulfillment, customer support, analytics, and retention workflows.", ["Shopify", "Fulfillment", "CRM"], "INR 3.5-7 LPA", "INR 9-20 LPA")
      ],
      industries: ["D2C brands", "Marketplaces", "Retail", "FMCG", "Fashion", "Consumer electronics"],
      certifications: ["Amazon Ads certification", "Shopify learning paths", "Google Analytics certification"],
      higherStudyOptions: ["MBA E-commerce", "Digital marketing", "Retail management"],
      freelanceOpportunities: ["Product listing optimization", "Marketplace account setup", "Catalog cleanup", "Order dashboard setup"],
      businessOpportunities: ["D2C store", "Marketplace management agency", "E-commerce operations consultancy"],
      pros: ["Direct link between work and sales", "Good for entrepreneurship", "Combines marketing and operations"],
      challenges: ["Returns and seller metrics need attention", "Price competition is intense", "Inventory errors can hurt ratings"],
      futureScope: "D2C, quick commerce, social commerce, and marketplace advertising continue to create e-commerce roles.",
      finalOutcome: "You can launch product listings, track seller metrics, process orders, and create an e-commerce growth report."
    },
    {
      title: "Import Export Business", category: "Business & Management", icon: "ph-package", duration: "5-10 months",
      shortDescription: "Plan international trade through product selection, buyer research, documentation, customs, logistics, payments, and compliance.",
      suitableFor: ["Entrepreneurs exploring global trade", "Family business learners", "Students interested in commerce, logistics, and international markets"],
      eligibility: ["Class 12 or graduation in any stream", "IEC and compliance knowledge for business activity", "Basic English and documentation skills"],
      requiredSkills: ["Documentation accuracy", "Market research", "Negotiation"],
      skillsToLearn: ["HS codes", "Incoterms", "IEC registration", "Export documentation", "Customs basics", "Freight costing", "Letters of credit"],
      tools: ["DGFT portal", "ICEGATE", "Trade Map", "IndiaMART", "Alibaba", "Excel", "Freight calculators"],
      roles: [
        role("Export Executive", "Prepares export documents, coordinates buyers, freight, customs, and shipment updates.", ["Documentation", "Incoterms", "Coordination"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Import Coordinator", "Tracks supplier orders, customs documents, duties, logistics, and delivery timelines.", ["Customs basics", "Supplier follow-up", "Freight"], "INR 3-6 LPA", "INR 7-16 LPA"),
        role("International Trade Entrepreneur", "Sources products, validates markets, negotiates buyers, and manages compliant shipments.", ["Market selection", "Pricing", "Risk control"], "Variable income", "Variable income")
      ],
      industries: ["Export houses", "Manufacturing", "Agri commodities", "Textiles", "Handicrafts", "Logistics"],
      certifications: ["Export import management certificate", "DGFT training", "International trade finance courses"],
      higherStudyOptions: ["MBA International Business", "Foreign trade diploma", "Supply chain management"],
      freelanceOpportunities: ["Buyer research", "Documentation checklists", "Trade data reports", "Product-market analysis"],
      businessOpportunities: ["Export trading company", "Import distribution", "Trade documentation service"],
      pros: ["Global market exposure", "Useful for product businesses", "High learning across logistics and finance"],
      challenges: ["Compliance errors are costly", "Payment and currency risks matter", "Supplier and buyer verification is essential"],
      futureScope: "Government export focus, digital trade platforms, and specialized Indian products support international trade careers.",
      finalOutcome: "You can select a product, research buyers, prepare a document checklist, estimate landed cost, and plan a shipment."
    },
    {
      title: "Foreign Languages", category: "Communication & Soft Skills", icon: "ph-translate", duration: "6-18 months",
      shortDescription: "Build practical language ability, cultural fluency, translation basics, interpretation skills, and professional communication.",
      suitableFor: ["Learners interested in global careers and cultures", "Students planning study or work abroad", "Professionals in tourism, export, BPO, or localization"],
      eligibility: ["No fixed requirement for beginner levels", "Consistent daily practice", "Target-language exam requirements vary"],
      requiredSkills: ["Listening patience", "Memory practice", "Cultural curiosity"],
      skillsToLearn: ["Pronunciation", "Core grammar", "Vocabulary", "Listening", "Conversation", "Translation basics", "Business communication"],
      tools: ["Anki", "Duolingo", "Dictionary apps", "Language exchange platforms", "Audio recorder", "CEFR resources"],
      roles: [
        role("Translator", "Converts written content between languages while preserving meaning, tone, and terminology.", ["Writing", "Terminology", "Editing"], "INR 3-6 LPA", "INR 8-20 LPA"),
        role("Language Trainer", "Teaches grammar, speaking, vocabulary, exam prep, and business language.", ["Teaching", "Conversation", "Assessment"], "INR 2.5-6 LPA", "INR 7-18 LPA"),
        role("Localization Associate", "Adapts app, website, media, or product content for language and cultural context.", ["Localization", "QA", "Cultural context"], "INR 4-8 LPA", "INR 10-24 LPA")
      ],
      industries: ["Translation", "Tourism", "Export", "BPO/KPO", "Embassies", "Gaming localization"],
      certifications: ["DELF/DALF", "JLPT", "Goethe Zertifikat", "DELE", "TOPIK depending on language"],
      higherStudyOptions: ["BA Foreign Language", "MA Translation Studies", "Interpretation diploma"],
      freelanceOpportunities: ["Document translation", "Subtitling", "Language tutoring", "Localization QA"],
      businessOpportunities: ["Language academy", "Translation agency", "Localization service"],
      pros: ["Opens global-facing roles", "Pairs well with tourism, export, and content", "Remote freelance options"],
      challenges: ["Fluency takes sustained practice", "Professional translation needs accuracy", "Cultural nuance matters"],
      futureScope: "Localization, global customer support, cross-border trade, and international education keep language skills valuable.",
      finalOutcome: "You can hold practical conversations, translate short documents, prepare for proficiency exams, and build language samples."
    },
    {
      title: "Psychology", category: "Healthcare & Wellness", icon: "ph-brain", duration: "6-12 months",
      shortDescription: "Study behavior and mental processes through research methods, ethics, assessment basics, counselling foundations, and applied psychology.",
      suitableFor: ["Learners curious about human behavior", "Students considering psychology degrees", "Professionals in education, HR, health, or social impact"],
      eligibility: ["Class 12 for UG psychology", "Relevant degree required for professional practice", "Licensure applies to regulated clinical roles"],
      requiredSkills: ["Empathy", "Scientific curiosity", "Ethical sensitivity"],
      skillsToLearn: ["Biological psychology", "Developmental psychology", "Social psychology", "Research methods", "Statistics basics", "Ethics", "Assessment awareness"],
      tools: ["Survey tools", "SPSS or Jamovi", "Research databases", "Case-note templates", "Psychometric manuals", "Google Scholar"],
      roles: [
        role("Psychology Assistant", "Supports psychologists with scheduling, basic observations, documentation, and program tasks under supervision.", ["Ethics", "Observation", "Documentation"], "INR 2.4-5 LPA", "INR 6-12 LPA"),
        role("Research Assistant", "Collects data, reviews literature, manages surveys, and supports analysis in psychology studies.", ["Research methods", "Statistics", "Literature review"], "INR 3-6 LPA", "INR 7-15 LPA"),
        role("Behavioral Program Associate", "Supports behavior-change, wellbeing, education, or organizational psychology programs.", ["Program design", "Assessment basics", "Communication"], "INR 3-6 LPA", "INR 8-16 LPA")
      ],
      industries: ["Education", "Research", "Mental health organizations", "HR", "NGOs", "Wellness programs"],
      certifications: ["BA/B.Sc Psychology", "MA/M.Sc Psychology", "Ethics and research methods courses", "Licensure where required"],
      higherStudyOptions: ["MA Clinical Psychology", "M.Phil/Professional clinical training where applicable", "Organizational psychology", "Counselling psychology"],
      freelanceOpportunities: ["Research assistance", "Psychoeducation content", "Workshop support under qualified supervision"],
      businessOpportunities: ["Wellbeing program studio with qualified professionals", "Psychology education content", "Research support service"],
      pros: ["Deep understanding of people", "Useful across health, education, and work", "Strong research foundation"],
      challenges: ["Clinical practice has strict qualification boundaries", "Emotional topics require care", "Research methods need rigor"],
      futureScope: "Mental health awareness, workplace wellbeing, behavioral science, and education support psychology-related careers.",
      finalOutcome: "You can explain psychology foundations, design a simple ethical study, read research, and understand supervised practice boundaries."
    },
    {
      title: "Counselling", category: "Healthcare & Wellness", icon: "ph-heart", duration: "6-18 months",
      shortDescription: "Develop ethical helping skills, active listening, case notes, assessment awareness, referrals, and supervised practice habits.",
      suitableFor: ["Empathetic learners interested in helping professions", "Teachers, HR professionals, and wellness workers", "Psychology students exploring counselling"],
      eligibility: ["Relevant counselling or psychology qualification for professional roles", "Supervised practice required for client work", "Strong ethical and confidentiality standards"],
      requiredSkills: ["Empathy", "Boundaries", "Listening"],
      skillsToLearn: ["Active listening", "Confidentiality", "Counselling ethics", "Basic assessment", "Goal setting", "CBT basics", "Referral planning"],
      tools: ["Secure case notes", "Consent forms", "Assessment forms", "Telehealth platforms", "Referral directory", "Supervision logs"],
      roles: [
        role("Counselling Assistant", "Supports intake, scheduling, psychoeducation, documentation, and supervised wellbeing activities.", ["Ethics", "Case notes", "Listening"], "INR 2.4-5 LPA", "INR 6-12 LPA"),
        role("Student Counsellor", "Supports students with wellbeing, study stress, referrals, workshops, and parent coordination where qualified.", ["Student support", "Risk awareness", "Workshop facilitation"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Wellbeing Facilitator", "Runs mental health awareness, stress-management, and basic support programs within scope.", ["Psychoeducation", "Facilitation", "Boundaries"], "INR 3-6 LPA", "INR 7-16 LPA")
      ],
      industries: ["Schools", "Colleges", "NGOs", "Wellness platforms", "Healthcare organizations", "Corporate wellbeing"],
      certifications: ["Counselling diploma from recognized institute", "MA Counselling Psychology", "Supervised practice certificates"],
      higherStudyOptions: ["MA Counselling Psychology", "Clinical psychology pathway", "Trauma-informed care training"],
      freelanceOpportunities: ["Psychoeducation workshops", "Wellbeing content", "Support-group facilitation with proper qualifications"],
      businessOpportunities: ["Wellbeing workshop practice", "School counselling service with qualified team", "Mental health awareness programs"],
      pros: ["Meaningful helping work", "Demand in schools and workplaces", "Strong personal growth component"],
      challenges: ["Scope of practice must be respected", "Emotional load can be heavy", "Supervision is essential"],
      futureScope: "Workplace wellbeing, school mental health, tele-counselling, and preventive care are increasing demand for trained counsellors.",
      finalOutcome: "You can demonstrate basic helping skills, write ethical case notes, plan referrals, and understand supervised practice requirements."
    },
    {
      title: "Social Work", category: "Healthcare & Wellness", icon: "ph-hands-clapping", duration: "6-12 months",
      shortDescription: "Support people and communities through case work, advocacy, program design, field visits, safeguarding, and social justice practice.",
      suitableFor: ["Learners motivated by community impact", "Students interested in NGOs, development, or welfare programs", "People comfortable with field work and documentation"],
      eligibility: ["Class 12 for BSW", "Graduation for MSW", "Fieldwork requirements for formal programs"],
      requiredSkills: ["Empathy", "Community listening", "Documentation"],
      skillsToLearn: ["Case work", "Needs assessment", "Community mobilization", "Advocacy", "Safeguarding", "Program monitoring", "Report writing"],
      tools: ["Case management systems", "Survey tools", "Office suite", "Community maps", "MIS dashboards", "Referral directories"],
      roles: [
        role("Social Worker", "Assesses needs, supports individuals or families, coordinates services, and documents interventions.", ["Case work", "Advocacy", "Documentation"], "INR 2.4-5 LPA", "INR 6-12 LPA"),
        role("Program Coordinator", "Plans field activities, tracks outputs, coordinates teams, and reports program progress.", ["Program management", "MIS", "Field coordination"], "INR 3.5-7 LPA", "INR 8-18 LPA"),
        role("Community Outreach Officer", "Builds trust with communities, conducts awareness, referrals, surveys, and local partnerships.", ["Outreach", "Facilitation", "Partnerships"], "INR 2.5-5 LPA", "INR 6-14 LPA")
      ],
      industries: ["NGOs", "CSR programs", "Government projects", "Healthcare outreach", "Education nonprofits", "Development consulting"],
      certifications: ["BSW", "MSW", "Child protection training", "Monitoring and evaluation courses"],
      higherStudyOptions: ["MSW", "Development Studies", "Public Policy", "Community health"],
      freelanceOpportunities: ["Survey support", "Training facilitation", "Proposal drafting", "Impact report writing"],
      businessOpportunities: ["Social impact consultancy", "CSR implementation agency", "Community training organization"],
      pros: ["High social impact", "Field learning is rich", "Many cause areas to specialize in"],
      challenges: ["Field conditions can be difficult", "Emotional boundaries matter", "Funding cycles affect projects"],
      futureScope: "CSR, public health, education access, livelihoods, and climate resilience programs need strong social-work skills.",
      finalOutcome: "You can conduct needs assessments, prepare case plans, design outreach activities, and write field reports."
    },
    {
      title: "Agriculture & Agribusiness", category: "Business & Management", icon: "ph-plant", duration: "5-10 months",
      shortDescription: "Connect farm production, soil, inputs, markets, value chains, finance, and agri-enterprise planning.",
      suitableFor: ["Learners from farming families", "Students interested in rural business and food systems", "Entrepreneurs exploring agri products or services"],
      eligibility: ["Class 12 for agriculture degrees", "Graduation preferred for agribusiness roles", "Field interest and market curiosity"],
      requiredSkills: ["Field observation", "Basic costing", "Market curiosity"],
      skillsToLearn: ["Crop cycles", "Soil basics", "Input planning", "Farm economics", "Post-harvest handling", "Commodity markets", "Agri value chains"],
      tools: ["Farm records", "Soil test kit", "Excel", "GIS apps", "Agmarknet", "Weather apps"],
      roles: [
        role("Agribusiness Executive", "Coordinates farmer engagement, input sales, procurement, market linkages, or agri operations.", ["Farmer communication", "Market linkage", "Records"], "INR 3-6 LPA", "INR 8-16 LPA"),
        role("Farm Manager", "Plans crops, inputs, labour, irrigation, harvest, and cost tracking for farm operations.", ["Crop planning", "Costing", "Supervision"], "INR 2.5-6 LPA", "INR 7-18 LPA"),
        role("Agri-market Analyst", "Tracks prices, supply, demand, value chains, and market opportunities.", ["Market research", "Excel", "Commodity awareness"], "INR 4-7 LPA", "INR 9-20 LPA")
      ],
      industries: ["Agri-inputs", "Food processing", "FPOs", "Agri-tech", "Commodity trading", "Rural finance"],
      certifications: ["Agribusiness management certificate", "Organic farming training", "Agri-extension courses"],
      higherStudyOptions: ["B.Sc Agriculture", "MBA Agribusiness", "Food technology", "Rural management"],
      freelanceOpportunities: ["Farm cost sheets", "Market research", "FPO documentation", "Agri content"],
      businessOpportunities: ["Agri-input dealership", "Farm produce brand", "Processing unit", "Agri advisory service"],
      pros: ["Connects business with essential food systems", "Strong rural enterprise potential", "Many government support schemes"],
      challenges: ["Weather and price risks are real", "Field operations need patience", "Supply chains can be fragmented"],
      futureScope: "Agri-tech, FPOs, food processing, precision farming, and sustainable agriculture are creating new roles.",
      finalOutcome: "You can prepare a crop plan, cost sheet, market linkage map, and agribusiness proposal."
    },
    {
      title: "Pharmacy", category: "Healthcare & Wellness", icon: "ph-first-aid-kit", duration: "12-48 months",
      shortDescription: "Study medicines, dispensing, pharmacology, quality, patient counselling, regulation, and pharmacy operations.",
      suitableFor: ["Science students interested in medicines and healthcare", "Learners who value accuracy and patient safety", "Students considering pharmacy degrees or pharma roles"],
      eligibility: ["Class 12 science with required subjects for D.Pharm/B.Pharm", "Registration rules apply for pharmacists", "Lab and clinical training requirements vary"],
      requiredSkills: ["Accuracy", "Science basics", "Ethical responsibility"],
      skillsToLearn: ["Pharmacology", "Pharmaceutics", "Prescription reading", "Drug interactions", "Patient counselling", "GMP basics", "Inventory"],
      tools: ["Drug databases", "Dispensing systems", "Lab equipment", "Inventory systems", "Pharmacopoeia", "Excel"],
      roles: [
        role("Pharmacist", "Dispenses medicines, checks prescriptions, counsels patients, and follows regulatory standards.", ["Dispensing", "Drug safety", "Counselling"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Pharmacy Assistant", "Supports stock, billing, prescription handling, and customer guidance under supervision.", ["Inventory", "Billing", "Medicine basics"], "INR 1.8-3.5 LPA", "INR 4-8 LPA"),
        role("Quality Assurance Associate", "Supports documentation, GMP checks, batch records, and quality processes in pharma.", ["GMP", "Documentation", "Quality checks"], "INR 3-6 LPA", "INR 8-16 LPA")
      ],
      industries: ["Retail pharmacy", "Hospitals", "Pharmaceutical manufacturing", "Clinical research", "Regulatory affairs"],
      certifications: ["D.Pharm/B.Pharm", "Pharmacy Council registration", "GMP training", "Clinical research certificate"],
      higherStudyOptions: ["M.Pharm", "Pharm.D", "Clinical research", "Regulatory affairs"],
      freelanceOpportunities: ["Medicine information content", "Pharmacy inventory templates", "Health education material under qualified review"],
      businessOpportunities: ["Retail pharmacy", "Pharma distribution", "Medication adherence service"],
      pros: ["Healthcare role with public trust", "Many pharma industry paths", "Science and service combine"],
      challenges: ["Regulatory compliance is strict", "Medication errors are serious", "Formal qualifications are essential"],
      futureScope: "Pharmacovigilance, clinical pharmacy, e-pharmacy, and regulatory roles are growing alongside healthcare access.",
      finalOutcome: "You can understand pharmacy pathways, explain medicine safety basics, manage inventory concepts, and prepare for formal qualifications."
    },
    {
      title: "Nursing", category: "Healthcare & Wellness", icon: "ph-first-aid-kit", duration: "24-48 months",
      shortDescription: "Provide patient-centered care through assessment, medication safety, clinical procedures, documentation, ethics, and teamwork.",
      suitableFor: ["Science students committed to patient care", "Empathetic learners comfortable with clinical settings", "People who can handle responsibility and shifts"],
      eligibility: ["Class 12 science for many nursing programs", "GNM/B.Sc Nursing entry rules vary", "Registration with nursing council required for practice"],
      requiredSkills: ["Compassion", "Attention to detail", "Physical stamina"],
      skillsToLearn: ["Nursing process", "Health assessment", "Vital signs", "Medication administration", "Wound care", "Infection control", "Patient education"],
      tools: ["Clinical records", "Vital-sign equipment", "Medication charts", "Care plan templates", "PPE", "Hospital information systems"],
      roles: [
        role("Staff Nurse", "Provides bedside care, medication administration, monitoring, documentation, and patient education.", ["Clinical care", "Documentation", "Medication safety"], "INR 2.5-5 LPA", "INR 6-14 LPA"),
        role("Community Health Nurse", "Supports preventive care, immunization, health education, and community outreach.", ["Public health", "Education", "Records"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Clinical Coordinator", "Coordinates nursing teams, schedules, quality checks, and patient-care workflows.", ["Coordination", "Clinical protocols", "Teamwork"], "INR 4-8 LPA", "INR 9-20 LPA")
      ],
      industries: ["Hospitals", "Clinics", "Community health", "Home healthcare", "Public health programs"],
      certifications: ["GNM", "B.Sc Nursing", "Nursing council registration", "BLS/ACLS where relevant"],
      higherStudyOptions: ["M.Sc Nursing", "Nurse practitioner programs", "Hospital administration"],
      freelanceOpportunities: ["Home-care nursing where licensed", "Patient education material", "Care coordination support"],
      businessOpportunities: ["Home healthcare agency with licensed staff", "Nursing training support", "Elder-care service"],
      pros: ["High social value", "Strong healthcare demand", "Global mobility possible with licensing"],
      challenges: ["Shift work and emotional load are significant", "Clinical accuracy is critical", "Licensing rules must be followed"],
      futureScope: "Hospital expansion, elder care, home healthcare, and specialized nursing increase demand for trained nurses.",
      finalOutcome: "You can understand nursing pathways, care planning, patient safety, documentation, and clinical skill requirements."
    },
    {
      title: "Physiotherapy", category: "Healthcare & Wellness", icon: "ph-first-aid-kit", duration: "12-48 months",
      shortDescription: "Help people improve movement, strength, pain, function, and rehabilitation through assessment and exercise-based care.",
      suitableFor: ["Science students interested in movement and rehabilitation", "Fitness-aware learners who want healthcare depth", "People comfortable with patient interaction"],
      eligibility: ["Class 12 science for BPT", "Registration requirements vary by state and role", "Clinical internship is typically required"],
      requiredSkills: ["Anatomy interest", "Observation", "Patient motivation"],
      skillsToLearn: ["Anatomy", "Biomechanics", "Assessment", "Therapeutic exercise", "Manual therapy basics", "Rehabilitation planning", "Outcome measures"],
      tools: ["Goniometer", "Resistance bands", "Exercise equipment", "Clinical notes", "Outcome measures", "Posture analysis tools"],
      roles: [
        role("Physiotherapist", "Assesses movement problems, plans rehabilitation, teaches exercises, and tracks recovery.", ["Assessment", "Exercise prescription", "Patient education"], "INR 2.5-5.5 LPA", "INR 7-18 LPA"),
        role("Rehabilitation Assistant", "Supports therapy sessions, equipment setup, exercise supervision, and documentation.", ["Exercise support", "Safety", "Documentation"], "INR 2-4 LPA", "INR 5-9 LPA"),
        role("Sports Therapy Associate", "Supports athlete screening, injury prevention, rehab drills, and return-to-play coordination.", ["Sports rehab", "Mobility", "Strength basics"], "INR 3-6 LPA", "INR 8-20 LPA")
      ],
      industries: ["Hospitals", "Rehab centers", "Sports teams", "Fitness clinics", "Home healthcare", "Ergonomics"],
      certifications: ["BPT", "MPT", "Sports rehab certificates", "Manual therapy workshops"],
      higherStudyOptions: ["MPT", "Sports physiotherapy", "Neuro rehabilitation", "Hospital administration"],
      freelanceOpportunities: ["Home physiotherapy where qualified", "Ergonomic assessments", "Exercise handouts", "Sports recovery support"],
      businessOpportunities: ["Physiotherapy clinic", "Rehab studio", "Corporate ergonomics service"],
      pros: ["Visible patient progress", "Combines science and coaching", "Clinic entrepreneurship possible"],
      challenges: ["Formal qualification is essential", "Patient adherence varies", "Physical work can be demanding"],
      futureScope: "Sports participation, aging population, desk-work injuries, and post-surgical rehab increase physiotherapy demand.",
      finalOutcome: "You can understand movement assessment, design basic rehab plans within scope, and map the formal physiotherapy pathway."
    },
    {
      title: "Nutrition & Dietetics", category: "Healthcare & Wellness", icon: "ph-first-aid-kit", duration: "6-18 months",
      shortDescription: "Plan evidence-informed nutrition using food science, diet assessment, therapeutic diets, counselling, and meal planning.",
      suitableFor: ["Science or health learners interested in food and wellbeing", "Fitness professionals seeking nutrition depth", "Students considering dietetics careers"],
      eligibility: ["Class 12 science for many dietetics degrees", "Registered dietitian pathway requires approved qualifications and internship", "Nutrition coaching scope varies"],
      requiredSkills: ["Food interest", "Science reading", "Empathy"],
      skillsToLearn: ["Macronutrients", "Micronutrients", "Diet assessment", "Meal planning", "Therapeutic nutrition", "Label reading", "Behaviour change"],
      tools: ["Diet analysis software", "Food databases", "Kitchen scales", "Body-measure tools", "Meal planner", "Clinical lab reports"],
      roles: [
        role("Dietitian", "Assesses nutrition needs, designs diet plans, monitors progress, and works with healthcare teams where qualified.", ["Diet assessment", "Therapeutic diets", "Counselling"], "INR 2.5-5.5 LPA", "INR 7-18 LPA"),
        role("Nutritionist", "Supports wellness goals, meal education, food choices, and habit change within scope.", ["Meal planning", "Education", "Behaviour change"], "INR 2.4-5 LPA", "INR 6-15 LPA"),
        role("Wellness Educator", "Creates workshops, content, and group programs on food, lifestyle, and preventive health.", ["Psychoeducation", "Presentation", "Content"], "INR 3-6 LPA", "INR 7-16 LPA")
      ],
      industries: ["Hospitals", "Wellness companies", "Fitness centers", "Food brands", "Public health", "Sports nutrition"],
      certifications: ["B.Sc Nutrition and Dietetics", "Registered Dietitian pathway", "Sports nutrition certificates"],
      higherStudyOptions: ["M.Sc Nutrition", "Clinical dietetics", "Public health nutrition"],
      freelanceOpportunities: ["Meal plans within scope", "Nutrition workshops", "Recipe analysis", "Wellness content"],
      businessOpportunities: ["Nutrition clinic", "Healthy meal service", "Corporate wellness programs"],
      pros: ["High public interest", "Combines science and lifestyle", "Online education opportunities"],
      challenges: ["Misinformation is common", "Clinical advice needs qualification", "Behaviour change takes time"],
      futureScope: "Preventive health, sports nutrition, chronic disease management, and personalized nutrition are growing.",
      finalOutcome: "You can assess diet patterns, plan balanced meals, interpret labels, and understand dietetics qualification boundaries."
    },
    {
      title: "Sports Management", category: "Business & Management", icon: "ph-trophy", duration: "5-9 months",
      shortDescription: "Manage sports events, teams, sponsorships, facilities, athlete services, fan engagement, and sports business operations.",
      suitableFor: ["Sports lovers interested in business and operations", "Event or marketing learners targeting sports roles", "Athletes transitioning to management"],
      eligibility: ["Graduation preferred for management roles", "Sports knowledge and event experience helpful", "Communication and coordination skills"],
      requiredSkills: ["Sports awareness", "Coordination", "Networking"],
      skillsToLearn: ["Sports ecosystem", "Sponsorship", "Venue operations", "Athlete management", "Fan engagement", "Ticketing", "Sports marketing"],
      tools: ["Event software", "CRM", "Ticketing platforms", "Scheduling tools", "Analytics dashboards", "Canva"],
      roles: [
        role("Sports Coordinator", "Coordinates fixtures, teams, venues, volunteers, schedules, and event-day requirements.", ["Scheduling", "Venue coordination", "Team communication"], "INR 2.5-5 LPA", "INR 6-12 LPA"),
        role("Event Operations Executive", "Runs sports event logistics, safety, vendor setup, fan flow, and post-event closure.", ["Operations", "Risk planning", "Vendor management"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Sports Marketing Associate", "Supports sponsorship decks, fan campaigns, content, partnerships, and brand activations.", ["Sponsorship", "Content", "CRM"], "INR 3-7 LPA", "INR 9-20 LPA")
      ],
      industries: ["Leagues", "Sports academies", "Event agencies", "Fitness brands", "Sports marketing", "Facility management"],
      certifications: ["Sports management certificate", "Event management diploma", "Digital marketing for sports"],
      higherStudyOptions: ["MBA Sports Management", "Sports analytics", "Event management"],
      freelanceOpportunities: ["Tournament coordination", "Sponsorship decks", "Sports content calendars", "Academy operations support"],
      businessOpportunities: ["Sports academy operations", "Tournament management company", "Sports marketing agency"],
      pros: ["Combines passion and business", "Events create strong networks", "Growing sports ecosystem in India"],
      challenges: ["Event pressure is high", "Sponsorship sales need persistence", "Seasonality affects workload"],
      futureScope: "Indian leagues, grassroots academies, sports tech, fan engagement, and women's sports are expanding opportunities.",
      finalOutcome: "You can prepare a sports event plan, sponsorship proposal, venue checklist, and fan-engagement campaign."
    },
    {
      title: "Fitness Training", category: "Healthcare & Wellness", icon: "ph-barbell", duration: "3-9 months",
      shortDescription: "Coach safe exercise through assessments, strength, cardio, mobility, program design, motivation, and client progress tracking.",
      suitableFor: ["Fitness enthusiasts who enjoy coaching others", "Sports learners building a training career", "People interested in gyms, wellness, or personal training"],
      eligibility: ["Class 12 generally sufficient for entry courses", "Recognized certification recommended", "CPR/first aid strongly recommended"],
      requiredSkills: ["Exercise interest", "Communication", "Safety awareness"],
      skillsToLearn: ["Anatomy basics", "Movement assessment", "Strength training", "Cardio programming", "Mobility", "Client coaching", "Progress tracking"],
      tools: ["Assessment kit", "Training apps", "Heart-rate monitor", "Resistance equipment", "Body measurement tools", "Program templates"],
      roles: [
        role("Personal Trainer", "Assesses clients, designs workouts, teaches technique, tracks progress, and supports habits.", ["Program design", "Cueing", "Motivation"], "INR 2.4-5 LPA", "INR 6-18 LPA"),
        role("Fitness Coach", "Runs individual or group training sessions with safe progressions and client communication.", ["Coaching", "Exercise selection", "Safety"], "INR 2.5-6 LPA", "INR 7-20 LPA"),
        role("Gym Instructor", "Supervises floor training, equipment use, member support, and basic fitness guidance.", ["Equipment", "Customer service", "Technique"], "INR 1.8-4 LPA", "INR 5-10 LPA")
      ],
      industries: ["Gyms", "Sports academies", "Corporate wellness", "Online fitness", "Rehabilitation support", "Hospitality wellness"],
      certifications: ["ACE", "NSCA-CPT", "K11", "CPR and first aid"],
      higherStudyOptions: ["Sports science", "Physiotherapy", "Strength and conditioning"],
      freelanceOpportunities: ["Personal training", "Online workout plans", "Group classes", "Corporate fitness sessions"],
      businessOpportunities: ["Personal training studio", "Online coaching brand", "Corporate wellness service"],
      pros: ["Visible client progress", "Flexible work models", "Strong wellness demand"],
      challenges: ["Client adherence varies", "Scope of practice must be respected", "Income depends on retention"],
      futureScope: "Preventive fitness, online coaching, wearable data, and strength training awareness keep expanding the field.",
      finalOutcome: "You can conduct basic assessments, design safe programs, coach technique, and build a trainer portfolio."
    },
    {
      title: "Yoga Instructor", category: "Healthcare & Wellness", icon: "ph-person-simple", duration: "3-12 months",
      shortDescription: "Teach yoga safely through asana, breath, sequencing, anatomy awareness, philosophy, modifications, and class management.",
      suitableFor: ["Yoga practitioners who want to teach", "Wellness learners interested in mind-body practices", "Fitness professionals adding yoga skills"],
      eligibility: ["No fixed academic requirement", "Recognized yoga teacher training recommended", "Personal practice and safety awareness required"],
      requiredSkills: ["Consistent practice", "Body awareness", "Calm communication"],
      skillsToLearn: ["Asana alignment", "Pranayama", "Sequencing", "Yoga philosophy", "Anatomy basics", "Modifications", "Meditation guidance"],
      tools: ["Yoga mat", "Blocks and straps", "Class planning templates", "Anatomy resources", "Music apps", "Booking tools"],
      roles: [
        role("Yoga Instructor", "Leads safe classes, demonstrates postures, offers modifications, and supports student progress.", ["Asana", "Cueing", "Sequencing"], "INR 2-5 LPA", "INR 6-16 LPA"),
        role("Wellness Facilitator", "Runs stress, breathwork, relaxation, and wellbeing sessions for groups or workplaces.", ["Breathwork", "Facilitation", "Relaxation"], "INR 2.5-6 LPA", "INR 7-18 LPA"),
        role("Studio Teacher", "Teaches scheduled classes, manages student experience, workshops, and studio routines.", ["Class management", "Student care", "Safety"], "INR 2.4-5.5 LPA", "INR 7-16 LPA")
      ],
      industries: ["Yoga studios", "Wellness resorts", "Corporate wellness", "Online fitness", "Schools", "Retreats"],
      certifications: ["Yoga teacher training 200 hours", "Yoga Certification Board credentials", "CPR and first aid recommended"],
      higherStudyOptions: ["M.Sc Yoga", "Yoga therapy", "Ayurveda and wellness studies"],
      freelanceOpportunities: ["Group classes", "Private sessions", "Corporate yoga", "Online workshops"],
      businessOpportunities: ["Yoga studio", "Retreat programs", "Online yoga membership"],
      pros: ["Supports wellbeing and flexibility", "Can teach online or offline", "Personal practice enriches work"],
      challenges: ["Safety and contraindications matter", "Class attendance can fluctuate", "Teaching requires more than demonstration"],
      futureScope: "Corporate wellness, preventive health, online classes, and yoga tourism support continued demand.",
      finalOutcome: "You can design beginner-safe classes, cue postures, guide breath practices, and create a teaching portfolio."
    },
    {
      title: "Fashion & Lifestyle", category: "Fashion & Lifestyle", icon: "ph-sparkle", duration: "4-8 months",
      shortDescription: "Work across fashion, beauty, lifestyle brands, trends, styling, editorial content, merchandising, and community engagement.",
      suitableFor: ["Trend-aware learners interested in fashion media and lifestyle brands", "Content creators moving into brand work", "Students who enjoy aesthetics, consumer behavior, and culture"],
      eligibility: ["Class 12 or graduation in any stream", "Portfolio of styling, content, or research helpful", "Strong visual and communication sense"],
      requiredSkills: ["Trend observation", "Visual taste", "Communication"],
      skillsToLearn: ["Trend research", "Styling", "Lifestyle branding", "Editorial planning", "Influencer campaigns", "Merchandising basics", "Consumer insights"],
      tools: ["Canva", "Pinterest", "Instagram Insights", "Trend reports", "Mood-board tools", "Google Analytics"],
      roles: [
        role("Lifestyle Brand Associate", "Supports brand campaigns, product stories, community activations, and visual consistency.", ["Brand voice", "Campaign support", "Community"], "INR 3-6 LPA", "INR 8-18 LPA"),
        role("Fashion Content Executive", "Creates fashion and lifestyle content calendars, captions, shoots, and campaign assets.", ["Content planning", "Styling", "Social media"], "INR 2.5-5.5 LPA", "INR 7-16 LPA"),
        role("Trend Researcher", "Tracks culture, consumer shifts, colors, materials, and market signals for brand decisions.", ["Research", "Mood boards", "Insight writing"], "INR 3.5-7 LPA", "INR 8-18 LPA")
      ],
      industries: ["Fashion brands", "Beauty", "Lifestyle media", "D2C brands", "Retail", "Influencer marketing"],
      certifications: ["Fashion styling certificate", "Lifestyle journalism workshops", "Brand management courses"],
      higherStudyOptions: ["Fashion communication", "Luxury brand management", "Lifestyle journalism"],
      freelanceOpportunities: ["Styling boards", "Lifestyle content calendars", "Brand mood boards", "Influencer campaign support"],
      businessOpportunities: ["Lifestyle content studio", "Personal styling service", "Trend newsletter"],
      pros: ["Culture-facing and creative", "Pairs well with content and marketing", "Portfolio can be visual and public"],
      challenges: ["Trends move fast", "Taste must connect to business goals", "Differentiation is important"],
      futureScope: "D2C lifestyle brands, creator commerce, premium retail, and cultural trend strategy are expanding this space.",
      finalOutcome: "You can create trend reports, styling boards, lifestyle campaign plans, and a brand-ready content portfolio."
    }
  ];

  function attachDefaults(course) {
    const id = course.id || slug(course.title);
    const allRoleSkills = unique(course.roles.flatMap(item => item.requiredSkills));
    const beginnerProjects = course.beginnerProjects || [
      `${course.title} starter checklist using ${course.skillsToLearn[0]}`,
      `${course.tools[0]} practice file for a beginner ${course.title} task`
    ];
    const intermediateProjects = course.intermediateProjects || [
      `${course.title} case study for a local organization`,
      `${course.roles[0].role} work-sample brief with review notes`
    ];
    const advancedProjects = course.advancedProjects || [
      `End-to-end ${course.title} portfolio project with measurable outcome`,
      `${course.title} strategy presentation for a realistic client or employer`
    ];
    const roadmap = course.roadmap || [
      {
        phase: 1,
        title: `${course.title} Orientation`,
        duration: "1-2 weeks",
        description: `Start by understanding how ${course.title} work is done, where jobs exist, and what beginner proof employers expect.`,
        topics: [`${course.title} career landscape`, "Common entry roles", "Ethics and professional expectations", "India salary and growth context"],
        practicalTasks: [`Map 10 real ${course.title} job descriptions`, "Create a glossary of role-specific terms", "Interview or research one working professional"],
        milestone: `A one-page ${course.title} career map with target roles and first portfolio goal.`
      },
      {
        phase: 2,
        title: `${course.title} Foundation Skills`,
        duration: "3-5 weeks",
        description: `Build the core concepts and beginner skills needed before using advanced ${course.title} tools.`,
        topics: unique([...course.requiredSkills, ...course.skillsToLearn.slice(0, 4)]),
        practicalTasks: [`Practise ${course.skillsToLearn[0]} with a small case`, `Use ${course.tools[0]} for a guided exercise`, "Write notes in a reusable checklist"],
        milestone: `A reviewed foundation worksheet showing ${course.skillsToLearn.slice(0, 3).join(", ")}.`
      },
      {
        phase: 3,
        title: `${course.title} Tools and Workflows`,
        duration: "3-5 weeks",
        description: `Learn the tools, files, dashboards, documents, or systems used in daily ${course.title} work.`,
        topics: unique([...course.tools.slice(0, 5), ...course.skillsToLearn.slice(3, 7)]),
        practicalTasks: [`Recreate a professional workflow in ${course.tools[0]}`, `Compare outputs from ${course.tools.slice(1, 3).join(" and ")}`, "Document common mistakes and quality checks"],
        milestone: `A tool-practice file or workflow demo specific to ${course.title}.`
      },
      {
        phase: 4,
        title: `${course.title} Portfolio Projects`,
        duration: "4-6 weeks",
        description: `Create realistic ${course.title} work samples that prove judgement, process, and communication.`,
        topics: ["Brief analysis", "Research and planning", "Execution", "Review and revision", "Case-study writing"],
        practicalTasks: beginnerProjects,
        milestone: `Three polished ${course.title} portfolio samples with context, process, and final output.`
      },
      {
        phase: 5,
        title: `${course.title} Internship and Job Preparation`,
        duration: "2-4 weeks",
        description: `Prepare applications, interviews, role-specific assignments, and a portfolio for entry-level ${course.title} opportunities.`,
        topics: unique(["Resume keywords", "Portfolio presentation", "Interview questions", "Assignment practice", ...allRoleSkills.slice(0, 4)]),
        practicalTasks: [`Build a ${course.title} resume`, "Record a project walkthrough", "Prepare answers for role-specific scenarios"],
        milestone: `A job-ready application kit for ${course.roles[0].role}, ${course.roles[1].role}, or related roles.`
      },
      {
        phase: 6,
        title: `${course.title} Advanced Growth`,
        duration: "4-8 weeks",
        description: `Move from beginner delivery to specialization, ownership, and measurable impact in ${course.title}.`,
        topics: unique([...course.skillsToLearn.slice(-4), ...course.industries.slice(0, 3), "Leadership and stakeholder communication"]),
        practicalTasks: advancedProjects,
        milestone: `A specialization plan with advanced project evidence and next certification target.`
      }
    ];
    const recommendedResources = course.recommendedResources || [
      `Official documentation or help center for ${course.tools[0]}`,
      `${course.title} beginner books, government portals, or professional-body resources`,
      `Recent Indian job descriptions for ${course.roles[0].role} and ${course.roles[1].role}`,
      `Case studies from ${course.industries.slice(0, 2).join(" and ")}`
    ];
    const interviewPreparation = course.interviewPreparation || [
      `Explain your approach to ${course.skillsToLearn[0]} with a real example.`,
      `Walk through a ${course.title} portfolio project from brief to final output.`,
      `Prepare scenarios around ${course.roles[0].requiredSkills.slice(0, 2).join(" and ")}.`,
      `Know the tools: ${course.tools.slice(0, 3).join(", ")}.`
    ];
    const portfolioRequirements = course.portfolioRequirements || [
      `Clear ${course.title} problem statement and target audience`,
      `${course.title} research notes, assumptions, and decisions`,
      `Final ${course.roles[0].role} deliverable in a shareable format`,
      `${course.title} outcome metric, reflection, and improvement plan`
    ];
    const careerGrowthPath = course.careerGrowthPath || [
      `Beginner: ${course.roles[0].role}`,
      `Intermediate: ${course.roles[1].role}`,
      `Advanced: ${course.roles[2].role}`,
      `Specialist or manager in ${course.industries[0]} or ${course.industries[1]}`
    ];
    const modules = roadmap.map((phase, index) => module(
      phase.title,
      index < 2 ? "Beginner" : index < 4 ? "Intermediate" : "Advanced",
      index < 2 ? 8 : index < 4 ? 14 : 12,
      [
        ...phase.topics.map(item => [item, ...phase.practicalTasks.slice(0, 2), phase.milestone]),
        ["Milestone review", phase.description, phase.milestone]
      ],
      { stage: phase.phase, branch: phase.duration, phaseDescription: phase.description }
    ));
    modules.splice(4, 0, module(
      `${course.title} Projects`,
      "Intermediate",
      18,
      [
        ...beginnerProjects.map(item => [item, "Beginner proof", "Document process", "Request feedback"]),
        ...intermediateProjects.map(item => [item, "Realistic case", "Measure quality", "Revise output"]),
        ...advancedProjects.map(item => [item, "End-to-end delivery", "Present decisions", "Add to portfolio"])
      ],
      { stage: 4, branch: "Portfolio build", project: true }
    ));
    const salary = `${course.roles.map(item => `${item.role}: fresher ${item.fresherSalary}, experienced ${item.experiencedSalary}`).join("; ")}. ${salaryNote}`;
    return {
      id,
      title: course.title,
      name: course.title,
      category: course.category,
      icon: course.icon || "ph-briefcase",
      shortDescription: course.shortDescription,
      description: course.shortDescription,
      detailedDescription: course.detailedDescription || `${course.title} combines ${course.skillsToLearn.slice(0, 3).join(", ")} with practical tools such as ${course.tools.slice(0, 3).join(", ")}. Learners build role-specific proof for ${course.roles.map(item => item.role).join(", ")} opportunities in ${course.industries.slice(0, 4).join(", ")}.`,
      suitableFor: course.suitableFor,
      eligibility: course.eligibility,
      duration: course.duration || "4-8 months",
      difficulty: course.difficulty || "Beginner friendly",
      estimatedLearningTime: course.estimatedLearningTime || `${modules.reduce((sum, item) => sum + item.time, 0)} guided hours plus project practice`,
      requiredSkills: course.requiredSkills,
      skillsToLearn: course.skillsToLearn,
      tools: course.tools,
      roadmap,
      beginnerProjects,
      intermediateProjects,
      advancedProjects,
      certifications: course.certifications,
      jobRoles: course.roles,
      roles: course.roles.map(item => item.role),
      salary,
      industries: course.industries,
      higherStudyOptions: course.higherStudyOptions,
      freelanceOpportunities: course.freelanceOpportunities,
      businessOpportunities: course.businessOpportunities,
      interviewPreparation,
      portfolioRequirements,
      recommendedResources,
      careerGrowthPath,
      pros: course.pros,
      challenges: course.challenges,
      futureScope: course.futureScope,
      finalOutcome: course.finalOutcome,
      demand: course.futureScope,
      popularity: course.popularity || 84,
      modules
    };
  }

  const catalog = courses.map(attachDefaults);
  global.NON_TECH_CATEGORIES = categories;
  global.NON_TECH_ROADMAPS = catalog;
})(window);
