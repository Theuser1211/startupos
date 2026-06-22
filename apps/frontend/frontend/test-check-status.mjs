const BACKEND = "http://127.0.0.1:3001";

async function api(method, path) {
  const res = await fetch(`${BACKEND}${path}`, { method });
  return res.json();
}

async function main() {
  // Check providers
  const providers = await api("GET", "/admin/providers");
  console.log("AI Providers:");
  for (const p of providers) {
    console.log(`  ${p.id}: ${p.status} (requests: ${p.requestCount}, failures: ${p.failureCount})`);
  }

  // List jobs in DB
  const jobs = await api("GET", "/jobs");
  console.log(`\nTotal jobs: ${jobs.length || jobs.total || "?"}`);
  if (Array.isArray(jobs)) {
    for (const j of jobs) {
      console.log(`  ${j.id?.substring(0,8)}... | ${j.type} | ${j.status} | error: ${j.error || "-"}`);
    }
  } else if (jobs.jobs) {
    for (const j of jobs.jobs) {
      console.log(`  ${j.id?.substring(0,8)}... | ${j.type} | ${j.status} | error: ${j.error || "-"}`);
    }
  }
}
main();
