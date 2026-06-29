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

async function expectFailure(path, options, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Id": "smoke-test-guest",
      ...(options.headers || {})
    }
  });
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}`);
  }
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
  await request("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` }
  });
  const repeatedSession = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.toUpperCase(), password: "secret123" })
  });
  if (repeatedSession.user?.id !== session.user?.id) {
    throw new Error("Login after logout did not restore the saved account");
  }
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
  await request("/mentor", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ message: "How do I learn backend?" })
  });
  await request("/contact", {
    method: "POST",
    body: JSON.stringify({ name: "Smoke Test", email, message: "Hello" })
  });

  const resetRequest = await request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
  if (!/^\d{6}$/.test(resetRequest.developmentCode || "")) {
    throw new Error("Local password reset did not return a development code");
  }
  await request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code: resetRequest.developmentCode, password: "changed123" })
  });
  await expectFailure("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "secret123" })
  }, 401);
  await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "changed123" })
  });
  await expectFailure("/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${session.token}` }
  }, 401);

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
