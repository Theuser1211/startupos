"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function MetricsSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const items = section.items || [];

  if (items.length === 0) return null;

  return (
    <section id={section.id} className="spec-section">
      <div className="spec-container">
        {section.heading && section.heading !== "Metrics" && (
          <div className="text-center mb-12">
            <span className="spec-label">{section.subheading || "Metrics"}</span>
            <h2 className="spec-heading">{section.heading}</h2>
          </div>
        )}
        <div className="flex gap-12 justify-center flex-wrap">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <span
                className="text-3xl font-extrabold block"
                style={{
                  background: `linear-gradient(135deg, ${spec.visualStyle.primary}, ${spec.visualStyle.secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {item.meta || item.title}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {item.description || item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
