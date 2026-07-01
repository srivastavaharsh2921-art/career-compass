const crypto = require("crypto");
const fsSync = require("fs");
const fs = require("fs/promises");
const http = require("http");
const os = require("os");
const path = require("path");
const { URL } = require("url");

function loadEnv() {
  [".env.local", ".env"].forEach(filename => {
    const envPath = path.join(__dirname, filename);
    if (!fsSync.existsSync(envPath)) return;

    const raw = fsSync.readFileSync(envPath, "utf8");
    raw.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim();
      const unquoted = value.replace(/^(['"])(.*)\1$/, "$2");
      if (!process.env[key]) process.env[key] = unquoted;
    });
  });
}

loadEnv();

const PORT = Number(process.env.PORT || 5000);
const TOKEN_SECRET = process.env.JWT_SECRET || process.env.TOKEN_SECRET || "careercompass-dev-secret";
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = process.env.DATA_DIR || (IS_SERVERLESS
  ? path.join(os.tmpdir(), "career-compass-data")
  : path.join(__dirname, "data"));
const DB_PATH = path.join(DATA_DIR, "db.json");
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const defaultDb = {
  users: [],
  guests: [],
  contacts: [],
  roadmaps: []
};

const mongoStore = {
  enabled: false,
  collection: null
};

let initializationPromise;

async function readJsonDbIfPresent() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return { ...defaultDb, ...JSON.parse(raw) };
  } catch {
    return { ...defaultDb };
  }
}

function stripMongoId(db) {
  const { _id, ...data } = db || {};
  return data;
}

async function connectMongo() {
  if (!process.env.MONGO_URI) return false;

  let mongoose;
  try {
    mongoose = require("mongoose");
  } catch {
    console.warn("MONGO_URI is set, but mongoose is not installed. Using local JSON storage.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000)
    });
    mongoStore.enabled = true;
    mongoStore.collection = mongoose.connection.collection(process.env.MONGO_COLLECTION || "career_compass");
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed (${error.message}). Using local JSON storage.`);
    return false;
  }
}

function initializeBackend() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await connectMongo();
      await ensureDb();
    })().catch(error => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

async function ensureDb() {
  if (mongoStore.enabled) {
    const initialDb = await readJsonDbIfPresent();
    await mongoStore.collection.updateOne(
      { _id: "app" },
      { $setOnInsert: { _id: "app", ...initialDb } },
      { upsert: true }
    );
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(defaultDb, null, 2));
  }
}

async function readDb() {
  if (mongoStore.enabled) {
    const db = await mongoStore.collection.findOne({ _id: "app" });
    return { ...defaultDb, ...stripMongoId(db) };
  }

  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return { ...defaultDb, ...JSON.parse(raw) };
}

async function writeDb(db) {
  if (mongoStore.enabled) {
    await mongoStore.collection.updateOne(
      { _id: "app" },
      { $set: stripMongoId({ ...defaultDb, ...db }) },
      { upsert: true }
    );
    return;
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-Id",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS"
  });
  res.end(JSON.stringify(body));
}

function sendError(res, status, message) {
  sendJson(res, status, { success: false, message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    profile: user.profile || {},
    quiz: user.quiz || {}
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const saved = String(storedHash || "");
  const [salt, hash] = saved.split(":");
  if (!salt || !hash || !/^[a-f0-9]{32}$/i.test(salt) || !/^[a-f0-9]{128}$/i.test(hash)) return false;
  const attempted = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(attempted), Buffer.from(saved));
}

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function signToken(userId, authVersion = 0) {
  const payload = {
    sub: userId,
    ver: Number(authVersion || 0),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  const encoded = base64Url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;

  const [encoded, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(encoded).digest("base64url");

  const signatureBuffer = Buffer.from(signature || "");
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function nowIso() {
  return new Date().toISOString();
}

function getGuestId(req, body = {}) {
  return String(req.headers["x-guest-id"] || body.guestId || "").trim();
}

async function getActor(req, body = {}) {
  const db = await readDb();
  const tokenPayload = verifyToken(getBearerToken(req));

  if (tokenPayload) {
    const user = db.users.find(item => item.id === tokenPayload.sub);
    if (user && Number(tokenPayload.ver || 0) === Number(user.authVersion || 0)) {
      return { db, type: "user", record: user };
    }
  }

  return { db, type: "anonymous", record: null };
}

function requireUser(req, res, db) {
  const payload = verifyToken(getBearerToken(req));
  const user = payload
    ? db.users.find(item => (
      item.id === payload.sub
      && Number(payload.ver || 0) === Number(item.authVersion || 0)
    ))
    : null;

  if (!user) {
    sendError(res, 401, "Please log in first");
    return null;
  }

  return user;
}

function resetCodeHash(code) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(String(code)).digest("hex");
}

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function requestOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const protocol = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return `${protocol}://${req.headers.host || `localhost:${PORT}`}`;
}

function passwordResetEmailProvider() {
  if (process.env.DISABLE_RESET_EMAIL === "true") return "";
  if (process.env.RESEND_API_KEY) return "resend";

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (user && pass) return "smtp";

  return "";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
}

async function sendPasswordResetEmail({ email, name, code, req }) {
  const resetUrl = new URL("/forgot-password.html", requestOrigin(req));
  resetUrl.searchParams.set("email", email);
  resetUrl.searchParams.set("code", code);
  const from = process.env.RESET_EMAIL_FROM
    || process.env.EMAIL_FROM
    || `Career Compass <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
  const subject = "Reset your Career Compass password";
  const text = `Hello ${name || "there"},\n\nYour Career Compass password reset code is ${code}. It expires in 10 minutes.\n\nReset your password: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `<p>Hello ${escapeHtml(name || "there")},</p><p>Your password reset code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p><p><a href="${escapeHtml(resetUrl.toString())}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`;

  if (passwordResetEmailProvider() === "smtp") {
    const nodemailer = require("nodemailer");
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({ from, to: email, subject, text, html });
    return "smtp";
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Password reset email provider is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESET_EMAIL_FROM || "Career Compass <onboarding@resend.dev>",
      to: [email],
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Password reset email failed (${response.status}): ${details.slice(0, 180)}`);
  }
  return "resend";
}

function pickTextArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, 10);
}

function careerMatches(quiz = {}) {
  const allAnswers = [
    ...(quiz.interests?.selections || []),
    ...(quiz.skills?.selections || []),
    ...(quiz.personality?.selections || []),
    ...(quiz.goals?.selections || [])
  ].join(" ").toLowerCase();

  const matches = [];

  if (/tech|coding|data|research|problem|python|java|ai|cyber/.test(allAnswers)) {
    matches.push({
      title: "Software Developer",
      match: 94,
      reason: "Strong fit for technology, structured problem solving, and continuous learning."
    });
  }

  if (/design|creative|art|ui|ux|expressive/.test(allAnswers)) {
    matches.push({
      title: "UI/UX Designer",
      match: 89,
      reason: "Good fit for creative thinking, user empathy, and visual communication."
    });
  }

  if (/business|marketing|sales|leadership|salary|impact/.test(allAnswers)) {
    matches.push({
      title: "Product Manager",
      match: 87,
      reason: "Good fit for leadership, communication, business thinking, and impact."
    });
  }

  if (/health|education|empathetic|society|social/.test(allAnswers)) {
    matches.push({
      title: "Career Counselor",
      match: 84,
      reason: "Good fit for empathy, education, and helping people make decisions."
    });
  }

  if (!matches.length) {
    matches.push(
      {
        title: "Data Analyst",
        match: 82,
        reason: "A balanced path for analytical thinking and practical problem solving."
      },
      {
        title: "Business Analyst",
        match: 78,
        reason: "A flexible option that blends communication, planning, and research."
      }
    );
  }

  return matches.slice(0, 3);
}

function buildRoadmap(topic) {
  const cleanTopic = String(topic || "").trim();
  const title = cleanTopic || "Career Growth";

  const steps = [
    {
      title: `Understand ${title} basics`,
      items: ["Learn core terms", "Watch beginner lessons", "Build a small notes document"]
    },
    {
      title: "Practice with guided projects",
      items: ["Follow 2-3 tutorials", "Rebuild one project without copying", "Track mistakes and fixes"]
    },
    {
      title: "Build portfolio proof",
      items: ["Create one original project", "Write a short case study", "Publish it on GitHub or a portfolio"]
    },
    {
      title: "Prepare for real opportunities",
      items: ["Learn interview questions", "Improve resume keywords", "Apply to internships or entry roles"]
    }
  ];

  const lower = title.toLowerCase();
  if (/frontend|ui|ux|design/.test(lower)) {
    steps[1].items = ["Practice HTML/CSS layouts", "Build responsive screens", "Review accessibility basics"];
    steps[2].items = ["Create a polished landing page", "Document design decisions", "Publish live demos"];
  } else if (/backend|api|server/.test(lower)) {
    steps[1].items = ["Build REST APIs", "Connect a database", "Add auth and validation"];
    steps[2].items = ["Create a deployed API project", "Write API docs", "Add tests for key routes"];
  } else if (/python|java|program/.test(lower)) {
    steps[1].items = ["Practice syntax daily", "Solve beginner problems", "Read standard library docs"];
    steps[2].items = ["Build a CLI app", "Build a web app", "Refactor with clean code principles"];
  } else if (/ai|ml|machine/.test(lower)) {
    steps[1].items = ["Learn Python and statistics", "Train simple models", "Understand evaluation metrics"];
    steps[2].items = ["Build a prediction project", "Explain model decisions", "Publish a notebook and demo"];
  }

  return {
    id: crypto.randomUUID(),
    topic: title,
    summary: `A practical learning path for ${title}, from foundations to portfolio-ready work.`,
    steps,
    createdAt: nowIso()
  };
}

function mentorReply(message) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();

  if (!text) {
    return {
      topic: "general",
      reply: "Ask me about a career path, skill roadmap, resume, interview prep, or switching fields."
    };
  }

  if (/frontend|react|ui|web/.test(lower)) {
    return {
      topic: "frontend",
      reply: "Start with HTML, CSS, and JavaScript fundamentals, then move into Git, responsive layouts, React, API fetching, accessibility, and two polished portfolio projects."
    };
  }

  if (/backend|api|server|database|node/.test(lower)) {
    return {
      topic: "backend",
      reply: "Focus on HTTP, REST API design, Node.js or another server stack, database modeling, authentication, validation, logging, and tests for the most important routes."
    };
  }

  if (/resume|cv/.test(lower)) {
    return {
      topic: "resume",
      reply: "Make your resume project-driven: list your stack, show measurable outcomes, link GitHub or live demos, and rewrite tasks as impact statements."
    };
  }

  if (/interview|prep|prepare/.test(lower)) {
    return {
      topic: "interview",
      reply: "Prepare in layers: fundamentals, practical project walkthroughs, common role-specific questions, behavioral stories using STAR, and timed mock interviews."
    };
  }

  if (/product|manager|pm/.test(lower)) {
    return {
      topic: "product",
      reply: "For product management, build proof around user research, prioritization, metrics, communication, PRDs, and cross-functional project ownership."
    };
  }

  return {
    topic: "general",
    reply: "A good next step is to pick one target role, list the skills it asks for, build one project that proves those skills, then turn that project into resume and interview material."
  };
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { success: true, message: "Career Compass API is running" });
    return;
  }

  const body = ["POST", "PUT"].includes(req.method) ? await parseBody(req) : {};

  if (req.method === "POST" && url.pathname === "/api/auth/signup") {
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!name || !email || !password) return sendError(res, 400, "Name, email, and password are required");
    if (password.length < 6) return sendError(res, 400, "Password must be at least 6 characters");

    const db = await readDb();
    if (db.users.some(user => normalizeEmail(user.email) === email)) return sendError(res, 409, "User already exists");

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      authVersion: 0,
      profile: {},
      quiz: {},
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    db.users.push(user);
    await writeDb(db);

    sendJson(res, 201, {
      success: true,
      message: "Account created successfully",
      token: signToken(user.id, user.authVersion),
      user: sanitizeUser(user)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const db = await readDb();
    const user = db.users.find(item => normalizeEmail(item.email) === email);

    if (!user || !verifyPassword(password, user.passwordHash)) return sendError(res, 401, "Invalid email or password");

    sendJson(res, 200, {
      success: true,
      message: "Logged in successfully",
      token: signToken(user.id, user.authVersion),
      user: sanitizeUser(user)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/forgot-password") {
    const email = normalizeEmail(body.email);
    if (!email) return sendError(res, 400, "Email is required");

    const isLocalDevelopment = !IS_SERVERLESS && process.env.NODE_ENV !== "production";
    const emailProvider = passwordResetEmailProvider();
    if (!emailProvider && !isLocalDevelopment) {
      return sendError(res, 503, "Password reset email is not configured yet");
    }

    const db = await readDb();
    const user = db.users.find(item => normalizeEmail(item.email) === email);
    let developmentCode;

    if (user) {
      const requestedAt = Date.parse(user.passwordReset?.requestedAt || "");
      const tooSoon = Number.isFinite(requestedAt) && Date.now() - requestedAt < 60_000;

      if (!tooSoon || (isLocalDevelopment && !emailProvider)) {
        const code = String(crypto.randomInt(100000, 1000000));
        const passwordReset = {
          codeHash: resetCodeHash(code),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          requestedAt: nowIso(),
          attempts: 0
        };

        if (isLocalDevelopment && !emailProvider) {
          developmentCode = code;
        } else {
          try {
            await sendPasswordResetEmail({ email, name: user.name, code, req });
          } catch (error) {
            console.error(error.message);
            return sendError(res, 502, "We couldn't send the reset email. Please try again shortly.");
          }
        }

        user.passwordReset = passwordReset;
        await writeDb(db);
      }
    }

    sendJson(res, 200, {
      success: true,
      message: "If an account exists for that email, a reset code has been sent. It expires in 10 minutes.",
      ...(developmentCode ? { developmentCode } : {})
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
    const email = normalizeEmail(body.email);
    const code = String(body.code || "").trim();
    const password = String(body.password || "");

    if (!email || !code || !password) return sendError(res, 400, "Email, reset code, and new password are required");
    if (!/^\d{6}$/.test(code)) return sendError(res, 400, "Enter the 6-digit reset code");
    if (password.length < 6) return sendError(res, 400, "Password must be at least 6 characters");

    const db = await readDb();
    const user = db.users.find(item => normalizeEmail(item.email) === email);
    const reset = user?.passwordReset;
    const isExpired = !reset?.expiresAt || Date.parse(reset.expiresAt) < Date.now();
    const tooManyAttempts = Number(reset?.attempts || 0) >= 5;
    const isValid = !isExpired && !tooManyAttempts && secureEqual(resetCodeHash(code), reset?.codeHash);

    if (!user || !isValid) {
      if (user && reset && !isExpired && !tooManyAttempts) {
        reset.attempts = Number(reset.attempts || 0) + 1;
        await writeDb(db);
      }
      return sendError(res, 400, "The reset code is invalid or has expired");
    }

    user.passwordHash = hashPassword(password);
    user.authVersion = Number(user.authVersion || 0) + 1;
    user.updatedAt = nowIso();
    delete user.passwordReset;
    await writeDb(db);

    sendJson(res, 200, { success: true, message: "Password reset successfully. You can now log in." });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    const db = await readDb();
    const user = requireUser(req, res, db);
    if (!user) return;
    sendJson(res, 200, { success: true, user: sanitizeUser(user) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    sendJson(res, 200, { success: true, message: "Logged out" });
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/profile") {
    const db = await readDb();
    const user = requireUser(req, res, db);
    if (!user) return;

    user.name = String(body.name || user.name).trim();
    user.profile = {
      ...user.profile,
      classLevel: body.classLevel || user.profile?.classLevel || "",
      location: body.location || user.profile?.location || "",
      targetCareer: body.targetCareer || user.profile?.targetCareer || ""
    };
    user.updatedAt = nowIso();
    await writeDb(db);
    sendJson(res, 200, { success: true, user: sanitizeUser(user) });
    return;
  }

  const quizStepMatch = url.pathname.match(/^\/api\/quiz\/([a-z-]+)$/);
  if (req.method === "POST" && quizStepMatch) {
    const step = quizStepMatch[1];
    const allowedSteps = new Set(["interests", "skills", "personality", "goals"]);
    if (!allowedSteps.has(step)) return sendError(res, 404, "Unknown quiz step");

    const actor = await getActor(req, body);
    if (!actor.record) return sendError(res, 401, "Please log in or provide a guest id");

    actor.record.quiz = actor.record.quiz || {};
    actor.record.quiz[step] = {
      selections: pickTextArray(body.selections),
      other: String(body.other || "").trim(),
      updatedAt: nowIso()
    };
    actor.record.updatedAt = nowIso();
    await writeDb(actor.db);

    sendJson(res, 200, { success: true, quiz: actor.record.quiz });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/quiz") {
    const actor = await getActor(req);
    if (!actor.record) return sendError(res, 401, "Please log in or provide a guest id");
    sendJson(res, 200, { success: true, quiz: actor.record.quiz || {} });
    return;
  }

  if ((req.method === "GET" || req.method === "POST") && url.pathname === "/api/results") {
    const actor = await getActor(req, body);
    if (!actor.record) return sendError(res, 401, "Please log in first");
    const quiz = body.quiz || actor.record?.quiz || {};
    const matches = careerMatches(quiz);
    sendJson(res, 200, {
      success: true,
      matches,
      summary: "These suggestions are based on your selected interests, skills, personality, and goals."
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/roadmaps") {
    const topic = String(body.topic || "").trim();
    if (!topic) return sendError(res, 400, "Please enter a roadmap topic");

    const roadmap = buildRoadmap(topic);
    const actor = await getActor(req, body);
    if (!actor.record) return sendError(res, 401, "Please log in first");
    roadmap.ownerType = actor.record ? actor.type : "anonymous";
    roadmap.ownerId = actor.record?.id || null;

    actor.db.roadmaps.push(roadmap);
    await writeDb(actor.db);
    sendJson(res, 201, { success: true, roadmap });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/roadmaps") {
    const actor = await getActor(req);
    if (!actor.record) return sendError(res, 401, "Please log in first");
    const roadmaps = actor.record
      ? actor.db.roadmaps.filter(item => item.ownerId === actor.record.id)
      : [];
    sendJson(res, 200, { success: true, roadmaps });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const message = String(body.message || "").trim();
    if (!name || !email || !message) return sendError(res, 400, "Name, email, and message are required");

    const db = await readDb();
    db.contacts.push({ id: crypto.randomUUID(), name, email, message, createdAt: nowIso() });
    await writeDb(db);
    sendJson(res, 201, { success: true, message: "Message received successfully" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/mentor") {
    const db = await readDb();
    if (!requireUser(req, res, db)) return;
    const reply = mentorReply(body.message || body.prompt || body.query);
    sendJson(res, 200, { success: true, ...reply });
    return;
  }

  sendError(res, 404, "API route not found");
}

async function serveStatic(req, res, url) {
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(FRONTEND_DIR, safePath);
  const relative = path.relative(FRONTEND_DIR, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  } catch {
    const notFoundPath = path.join(FRONTEND_DIR, "index.html");
    const file = await fs.readFile(notFoundPath);
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(file);
  }
}

async function requestHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  try {
    await initializeBackend();

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    sendError(res, 500, error.message || "Something went wrong");
  }
}

const server = http.createServer(requestHandler);

async function startServer() {
  await initializeBackend();
  server.listen(PORT, () => {
    console.log(`Career Compass running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch(error => {
    console.error(error.message || "Unable to start Career Compass");
    process.exit(1);
  });
}

module.exports = {
  server,
  startServer,
  requestHandler,
  initializeBackend,
  handleApi,
  readDb,
  writeDb,
  normalizeEmail,
  sanitizeUser,
  hashPassword,
  verifyPassword,
  signToken,
  careerMatches,
  buildRoadmap,
  mentorReply
};
