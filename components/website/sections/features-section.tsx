"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

const featureIcons = ["🚀", "⚙️", "🔍", "📊", "🛡️", "🎯", "💬", "🔗", "📱", "☁️"];

export function FeaturesSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const items = section.items || [];
  const cols = items.length <= 2 ? 2 : items.length <= 4 ? 3 : 4;

  return (
    <section id={section.id} className="spec-section spec-section-alt">
      <div className="spec-container">
        <div className="text-center mb-12">
          <span className="spec-label">{section.subheading || "Features"}</span>
          <h2 className="spec-heading">{section.heading}</h2>
          {section.body && (
            <p className="text-sm max-w-xl mx-auto mt-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              {section.body}
            </p>
          )}
        </div>
        <div className={cols === 4 ? "spec-grid-4" : cols === 3 ? "spec-grid-3" : "spec-grid-2"}>
          {items.map((item, i) => (
            <div key={i} className="spec-card">
              <div className="text-2xl mb-4" aria-hidden="true">{featureIcons[i % featureIcons.length]}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                {item.description}
              </p>
              {item.meta && (
                <span
                  className="inline-block mt-3 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: item.metaColor || spec.visualStyle.primary }}
                >
                  {item.meta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
