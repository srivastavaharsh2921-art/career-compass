const crypto = require("crypto");
const {
  readDb,
  writeDb,
  normalizeEmail,
  sanitizeUser,
  hashPassword,
  verifyPassword,
  signToken
} = require("../server");

exports.signup = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const db = await readDb();
    if (db.users.some(user => user.email === email)) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      profile: {},
      quiz: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(user);
    await writeDb(db);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: signToken(user.id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const db = await readDb();
    const user = db.users.find(item => item.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: signToken(user.id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
