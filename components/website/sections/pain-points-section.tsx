"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function PainPointsSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const { primary, secondary } = spec.visualStyle;
  const items = section.items || [];
  const midpoint = Math.ceil(items.length / 2);
  const challenges = items.slice(0, midpoint);
  const goals = items.slice(midpoint);

  return (
    <section id={section.id} className="spec-section spec-section-alt">
      <div className="spec-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <span className="spec-label" style={{ color: primary }}>
              {section.subheading || "Common Challenges"}
            </span>
            <h2 className="spec-heading">{section.heading}</h2>
            <div className="space-y-3 mt-6">
              {challenges.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{ background: spec.visualStyle.surface, border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: primary }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {item.description || item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="spec-label" style={{ color: secondary }}>
              Goals That Matter
            </span>
            <h2 className="spec-heading">What they want</h2>
            <div className="space-y-3 mt-6">
              {goals.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{
                    background: spec.visualStyle.surface,
                    border: `1px solid ${primary}20`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: secondary }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {item.description || item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
