"use client";

export function ScreenshotSection() {
  return (
    <section className="py-16 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs text-muted-foreground font-mono mb-4">
          // demo.mp4
        </p>
        <h2 className="text-lg font-semibold mb-4">What it looks like</h2>

        <div className="border border-border rounded overflow-hidden">
          <img
            src="/product-screenshot-2.png"
            alt="StartupOS website generator"
            className="w-full h-auto block"
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground font-mono text-center">
          // the website generator in action
        </p>
      </div>
    </section>
  );
}
