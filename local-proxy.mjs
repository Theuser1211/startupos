import http from "http";
import httpProxy from "http-proxy";

const BACKEND = "startupos-backend-production.up.railway.app";
const PORT = 3099;

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  target: `https://${BACKEND}`,
  ssl: { rejectUnauthorized: false },
});

// Store simulated website jobs
const websiteJobs = new Map();

proxy.on("error", (err) => {
  console.error("Proxy error:", err.message);
});

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;

  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Intercept website generation
  if (method === "POST" && url.pathname === "/websites/generate") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const jobId = crypto.randomUUID();
      const startupId = JSON.parse(body).startupId;

      websiteJobs.set(jobId, {
        id: jobId,
        type: "WEBSITE_GENERATION",
        status: "COMPLETED",
        result: {
          websiteId: crypto.randomUUID(),
          website: generateWebsite(startupId),
        },
        error: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.writeHead(202, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jobId, status: "PENDING" }));
    });
    return;
  }

  // Intercept website generation job polling
  if (method === "GET" && url.pathname.startsWith("/jobs/")) {
    const jobId = url.pathname.split("/").pop();
    if (websiteJobs.has(jobId)) {
      const job = websiteJobs.get(jobId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ job }));
      return;
    }
  }

  // Pass through to Railway backend
  proxy.web(req, res, {
    target: `https://${BACKEND}`,
    changeOrigin: true,
  });
});

server.listen(PORT, () => {
  console.log(`Local proxy running at http://localhost:${PORT}`);
  console.log(`Proxying to https://${BACKEND}`);
  console.log("Intercepting: POST /websites/generate, GET /jobs/:id (website jobs)");
});

function generateWebsite(startupId) {
  return {
    id: crypto.randomUUID(),
    spec: {
      pages: [
        { type: "hero", heading: "Welcome to Our Platform", content: "Your journey starts here" },
        { type: "features", heading: "Features", content: "Discover what we offer", items: ["AI-powered insights", "Real-time analytics", "Seamless integration"] },
        { type: "cta", heading: "Get Started", content: "Join thousands of satisfied users" },
      ],
      theme: {
        primary: "#7C3AED",
        secondary: "#06B6D4",
        font: "Inter",
      },
      components: [
        { name: "Header", type: "navigation" },
        { name: "Footer", type: "footer" },
      ],
    },
    deployment_url: null,
    deployment_status: "pending",
    created_at: new Date().toISOString(),
  };
}
