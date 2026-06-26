const crypto = require("crypto");
const { readDb, writeDb, normalizeEmail } = require("../server");

const sendContact = async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required"
    });
  }

  const db = await readDb();
  db.contacts.push({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() });
  await writeDb(db);

  res.status(201).json({
    success: true,
    message: "Message received successfully"
  });
};

module.exports = { sendContact };
