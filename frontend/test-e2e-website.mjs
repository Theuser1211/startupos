// End-to-end website generation test
const BACKEND = "http://127.0.0.1:3001";

async function api(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BACKEND}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { throw new Error(`Parse error on ${method} ${path}: ${e.message}\nBody: ${text.substring(0, 200)}`); }
  }
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${data?.error || data?.message || text.substring(0, 100)}`);
  return data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pollJob(jobId, token, label, maxAttempts) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(3000);
    const resp = await api("GET", `/jobs/${jobId}`, null, token);
    const j = resp.job || resp;
    console.log(`   ${label}: ${j.status} (attempt ${i+1}/${maxAttempts})`);
    if (j.status === "COMPLETED") return j;
    if (j.status === "FAILED") throw new Error(`${label} FAILED: ${j.error}`);
  }
  // Check one more time with raw response for debugging
  const resp = await api("GET", `/jobs/${jobId}`, null, token);
  throw new Error(`${label} still ${(resp.job || resp).status} after ${maxAttempts} attempts. Full response: ${JSON.stringify(resp)}`);
}

async function main() {
  const email = `test-${Date.now()}@example.com`;

  // 1. Register
  console.log("1. Register...");
  const reg = await api("POST", "/auth/register", { email, password: "password123", name: "Test" });
  const token = reg.token;
  console.log(`   Token OK (${token.substring(0, 20)}...)`);

  // 2. Create startup (response wraps in { startup: {...} })
  console.log("\n2. Creating startup...");
  const startupResp = await api("POST", "/startups", { name: "Test Startup AI", description: "AI-powered analytics platform for healthcare providers to improve patient outcomes." }, token);
  const startupId = startupResp.startup.id;
  console.log(`   Startup: ${startupId}`);

  // 3. Generate blueprint
  console.log("\n3. Generate blueprint...");
  const bpResp = await api("POST", "/blueprints/generate", { startupId }, token);
  const bpJobId = bpResp.jobId;
  console.log(`   Blueprint job: ${bpJobId}`);
  await pollJob(bpJobId, token, "Blueprint", 90);
  console.log(`   Blueprint generation OK`);

  // 4. Generate website
  console.log("\n4. Generate website...");
  const wsResp = await api("POST", "/websites/generate", { startupId }, token);
  const wsJobId = wsResp.jobId;
  console.log(`   Website job: ${wsJobId}`);

  try {
    const completed = await pollJob(wsJobId, token, "Website", 180);
    console.log(`\n*** WEBSITE GENERATION COMPLETED ***`);
    const websiteId = completed.result?.websiteId;
    if (websiteId) {
      const ws = await api("GET", `/websites/${websiteId}`, null, token);
      console.log(`   Website ID: ${websiteId}`);
      console.log(`   Website name: ${ws.website?.name || "N/A"}`);
    }
  } catch (e) {
    console.log(`\n*** WEBSITE GENERATION FAILED/STUCK ***`);
    console.log(`   ${e.message}`);
    // Check the DB directly - is the job PROCESSING?
    const resp = await api("GET", `/jobs/${wsJobId}`, null, token);
    const j = resp.job || resp;
    console.log(`   Current DB status: ${j.status}`);
    console.log(`   Error: ${j.error || "none"}`);
    console.log(`   Result: ${JSON.stringify(j.result || {})}`);
  }

  console.log("\n=== DONE ===");
}

main().catch(err => {
  console.error(`\nFATAL: ${err.message}`);
  process.exit(1);
});
