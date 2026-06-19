import { describe, it, expect } from "vitest";
import { buildDeployFiles, buildFileManifest } from "../src/services/deploy/builder.js";
import type { WebsiteResult } from "../src/types/ai.js";

const mockWebsite: WebsiteResult = {
  pages: [
    {
      slug: "/",
      title: "Home",
      html: "<!DOCTYPE html><html><head><title>Home</title></head><body><h1>Home Page</h1></body></html>",
    },
    {
      slug: "/about",
      title: "About",
      html: "<!DOCTYPE html><html><head><title>About</title></head><body><h1>About Page</h1></body></html>",
    },
    {
      slug: "/features",
      title: "Features",
      html: "<!DOCTYPE html><html><head><title>Features</title></head><body><h1>Features Page</h1></body></html>",
    },
  ],
  css: "body { margin: 0; }",
  js: "console.log('hello');",
};

describe("Deployment Builder", () => {
  it("converts Website.content to deployment files", () => {
    const files = buildDeployFiles(mockWebsite);

    expect(files).toHaveLength(5);

    const indexFile = files.find((f) => f.path === "index.html");
    expect(indexFile).toBeDefined();
    expect(indexFile!.content).toContain("Home Page");

    const aboutFile = files.find((f) => f.path === "about/index.html");
    expect(aboutFile).toBeDefined();
    expect(aboutFile!.content).toContain("About Page");

    const featuresFile = files.find((f) => f.path === "features/index.html");
    expect(featuresFile).toBeDefined();
    expect(featuresFile!.content).toContain("Features Page");

    const cssFile = files.find((f) => f.path === "styles.css");
    expect(cssFile).toBeDefined();
    expect(cssFile!.content).toBe("body { margin: 0; }");

    const jsFile = files.find((f) => f.path === "app.js");
    expect(jsFile).toBeDefined();
    expect(jsFile!.content).toBe("console.log('hello');");
  });

  it("handles root page correctly", () => {
    const files = buildDeployFiles(mockWebsite);
    const rootFile = files.find((f) => f.path === "index.html");
    expect(rootFile).toBeDefined();
    expect(rootFile!.path).toBe("index.html");
  });

  it("handles nested slugs", () => {
    const website: WebsiteResult = {
      pages: [
        { slug: "/pricing/detail", title: "Detail", html: "<html>detail</html>" },
      ],
      css: "",
      js: "",
    };

    const files = buildDeployFiles(website);
    expect(files[0].path).toBe("pricing/detail/index.html");
  });

  it("skips empty css and js", () => {
    const website: WebsiteResult = {
      pages: [{ slug: "/", title: "Home", html: "<html>home</html>" }],
      css: "",
      js: "",
    };

    const files = buildDeployFiles(website);
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("index.html");
  });

  it("generates file manifest", () => {
    const files = buildDeployFiles(mockWebsite);
    const manifest = buildFileManifest(files);

    expect(manifest).toContain("index.html");
    expect(manifest).toContain("about/index.html");
    expect(manifest).toContain("styles.css");
    expect(manifest).toContain("app.js");
    expect(manifest).toContain("bytes");
  });
});
