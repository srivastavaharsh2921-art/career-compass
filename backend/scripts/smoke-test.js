const { server, startServer } = require("../server");

const baseUrl = `http://localhost:${process.env.PORT || 5000}/api`;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Id": "smoke-test-guest",
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(`${path} failed: ${data.message || response.statusText}`);
  }
  return data;
}

async function run() {
  await startServer();

  const email = `smoke-${Date.now()}@example.com`;
  await request("/health");
  const session = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name: "Smoke Test", email, password: "secret123" })
  });
  await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "secret123" })
  });
  await request("/quiz/interests", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ selections: ["Technology"], other: "AI" })
  });
  await request("/results", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ quiz: { interests: { selections: ["Technology"] } } })
  });
  await request("/roadmaps", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ topic: "Backend Development" })
  });
  await request("/contact", {
    method: "POST",
    body: JSON.stringify({ name: "Smoke Test", email, message: "Hello" })
  });

  console.log("Backend smoke test passed");
}

run()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    server.close();
  });
