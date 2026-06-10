"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function SocialProofSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const items = section.items || [];

  return (
    <section id={section.id} className="spec-section">
      <div className="spec-container">
        <div className="text-center mb-12">
          <span className="spec-label">{section.subheading || "The Verdict"}</span>
          <h2 className="spec-heading">{section.heading}</h2>
          {section.body && (
            <p className="text-base max-w-xl mx-auto mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              {section.body}
            </p>
          )}
        </div>
        <div className="spec-grid-3">
          {items.map((item, i) => {
            const score = parseInt(item.meta || "0", 10);
            const scoreColor = score >= 7 ? "#ef4444" : score >= 5 ? "#f59e0b" : "#22c55e";
            const severity = item.metaColor || (score >= 7 ? "HIGH" : score >= 5 ? "MEDIUM" : "LOW");

            return (
              <div key={i} className="spec-card">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold">{item.title}</span>
                  <span className="text-sm font-bold" style={{ color: scoreColor }}>{item.meta}</span>
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {item.description}
                </p>
                <span
                  className="inline-block mt-3 text-[10px] font-bold tracking-wider"
                  style={{ color: scoreColor }}
                >
                  {severity}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
