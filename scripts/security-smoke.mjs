import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const tempDir = await mkdtemp(join(tmpdir(), "lexmarcorp-security-"));
const port = 31000 + Math.floor(Math.random() * 20000);
const adminEmail = "admin@example.test";
const adminPassword = randomBytes(18).toString("base64url") + "Aa1!";
const clientEmail = "client@example.test";
const clientPassword = randomBytes(18).toString("base64url") + "Aa1!";
const env = {
  ...process.env,
  NODE_ENV: "development",
  PORT: String(port),
  DATABASE_PATH: join(tempDir, "test.db"),
  JWT_SECRET: randomBytes(32).toString("hex"),
  ADMIN_NAME: "Smoke Test Admin",
  ADMIN_EMAIL: adminEmail,
  ADMIN_PASSWORD: adminPassword,
  SEED_DEMO_DATA: "false",
  GEMINI_API_KEY: "",
  STRIPE_SECRET_KEY: ""
};
const child = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "server.ts"], { env, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
child.stdout.on("data", chunk => { logs += chunk.toString(); });
child.stderr.on("data", chunk => { logs += chunk.toString(); });
const base = `http://127.0.0.1:${port}`;
const check = (condition, message) => { if (!condition) throw new Error(message); };
async function request(path, options = {}) {
  return fetch(base + path, { ...options, headers: { ...(options.headers || {}) } });
}
async function waitReady() {
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) throw new Error("Server exited before becoming ready.\n" + logs);
    try { const r = await request("/api/auth/me"); if (r.status === 401) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error("Server did not become ready.\n" + logs);
}
function cookieFrom(response) {
  const header = response.headers.get("set-cookie") || "";
  return { header, token: header.match(/(?:^|,\s*)token=([^;]+)/)?.[1] };
}
try {
  await waitReady();
  check((await request("/api/clients")).status === 401, "Unauthenticated clients request should return 401.");
  const badLogin = await request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: adminEmail, password: "wrong-password" }) });
  check(badLogin.status === 401, "Invalid credentials should return 401.");

  const adminLogin = await request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: adminEmail, password: adminPassword }) });
  check(adminLogin.status === 200, "Configured admin should log in.");
  const admin = cookieFrom(adminLogin);
  check(admin.token, "Admin login should set a session cookie.");
  check(!/; secure(?:;|$)/i.test(admin.header), "Development cookie should work on localhost without HTTPS.");
  const adminMe = await request("/api/auth/me", { headers: { cookie: `token=${admin.token}` } });
  check(adminMe.status === 200, "Admin session should persist.");
  check((await adminMe.json()).user.role === "admin", "Configured account should have admin role.");
  const adminClients = await request("/api/clients", { headers: { cookie: `token=${admin.token}` } });
  check(adminClients.status === 200, "Admin should be able to access client records.");
  check(Array.isArray(await adminClients.json()), "Client records endpoint should return an array.");

  const register = await request("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Smoke Test Client", email: clientEmail, password: clientPassword, role: "admin" }) });
  check(register.status === 201, "Valid public registration should succeed.");
  const clientLogin = await request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: clientEmail, password: clientPassword }) });
  check(clientLogin.status === 200, "Registered user should log in.");
  const client = cookieFrom(clientLogin);
  check(client.token, "Client login should set a session cookie.");
  const clientMe = await request("/api/auth/me", { headers: { cookie: `token=${client.token}` } });
  check(clientMe.status === 200, "Registered user's session should persist.");
  const registeredUser = (await clientMe.json()).user;
  check(registeredUser.role === "cliente", "Public registration must not grant admin role.");
  check((await request("/api/clients", { headers: { cookie: `token=${client.token}` } })).status === 403, "Client role must not access internal client records.");
  check((await request("/api/admin/users", { headers: { cookie: `token=${client.token}` } })).status === 403, "Client role must not access admin endpoints.");
  const promote = await request(`/api/admin/users/${registeredUser.id}/role`, { method: "PATCH", headers: { cookie: `token=${admin.token}`, "content-type": "application/json" }, body: JSON.stringify({ role: "admin" }) });
  check(promote.status === 200, "Admin should be able to promote a user.");
  check((await request("/api/admin/users", { headers: { cookie: `token=${client.token}` } })).status === 200, "Authorization should reflect the current database role, not stale JWT claims.");
  const demote = await request(`/api/admin/users/${registeredUser.id}/role`, { method: "PATCH", headers: { cookie: `token=${admin.token}`, "content-type": "application/json" }, body: JSON.stringify({ role: "cliente" }) });
  check(demote.status === 200, "Admin should be able to demote a user.");
  check((await request("/api/admin/users", { headers: { cookie: `token=${client.token}` } })).status === 403, "Demoted account must lose admin access immediately.");
  const invalidRole = await request(`/api/admin/users/${registeredUser.id}/role`, { method: "PATCH", headers: { cookie: `token=${admin.token}`, "content-type": "application/json" }, body: JSON.stringify({ role: "superadmin" }) });
  check(invalidRole.status === 400, "Unknown roles must be rejected.");
  check((await request("/api/auth/logout", { method: "POST", headers: { cookie: `token=${admin.token}` } })).status === 200, "Logout should succeed.");
  check((await request("/api/auth/me")).status === 401, "Request without a session cookie should not be authenticated.");
  console.log("SECURITY SMOKE TEST PASSED: startup, admin login/session, invalid login, registration role, role restrictions, client data endpoint and logout.");
} catch (error) {
  console.error(String(error)); console.error(logs); process.exitCode = 1;
} finally {
  child.kill("SIGTERM");
  await new Promise(resolve => setTimeout(resolve, 300));
  if (child.exitCode === null) child.kill("SIGKILL");
  await rm(tempDir, { recursive: true, force: true });
}
