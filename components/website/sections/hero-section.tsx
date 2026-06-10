"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

interface Props {
  section: WebsiteSection;
  spec: WebsiteSpec;
}

export function HeroSection({ section, spec }: Props) {
  const { primary, secondary, heroScale } = spec.visualStyle;
  const isLarge = heroScale === "large";
  const items = section.items || [];

  return (
    <section
      id={section.id}
      className="min-h-[85vh] flex items-center justify-center text-center relative overflow-hidden pt-16"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${primary}08 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        {section.subheading && (
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide"
            style={{
              background: `${primary}20`,
              border: `1px solid ${primary}30`,
              color: primary,
            }}
          >
            {section.subheading}
          </div>
        )}

        <h1
          className={`font-bold leading-tight mb-5 ${
            isLarge ? "text-5xl sm:text-7xl lg:text-8xl" : "text-4xl sm:text-6xl lg:text-7xl"
          }`}
          style={{ fontFamily: `${spec.visualStyle.fontHeading}, system-ui, sans-serif` }}
        >
          {section.heading}
          <br />
          <span
            className="spec-gradient-text"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {spec.copy.tagline}
          </span>
        </h1>

        {section.body && (
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {section.body}
          </p>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#cta"
            className="spec-btn spec-btn-primary"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              boxShadow: `0 4px 20px ${primary}40`,
            }}
          >
            {spec.copy.ctaPrimary}
          </a>
          <a href="#problem" className="spec-btn spec-btn-secondary">
            {spec.copy.ctaSecondary}
          </a>
        </div>

        {items.length > 0 && (
          <div className="flex gap-8 justify-center mt-12 flex-wrap">
            {items.map((item, i) => (
              <div key={i} className="text-center">
                <span
                  className="text-2xl font-extrabold block"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.meta}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
