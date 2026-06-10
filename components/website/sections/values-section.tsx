"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

const emojis = ["🎯", "⚡", "🔒", "🌍", "💡", "🤝", "🚀", "🎨", "📊", "🛡️"];

export function ValuesSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const items = section.items || [];

  return (
    <section id={section.id} className="spec-section">
      <div className="spec-container">
        <div className="text-center mb-12">
          <span className="spec-label">{section.subheading || "Our Values"}</span>
          <h2 className="spec-heading">{section.heading}</h2>
        </div>
        <div className="spec-grid-4">
          {items.map((item, i) => (
            <div key={i} className="spec-card">
              <div className="text-2xl mb-4" aria-hidden="true">{emojis[i % emojis.length]}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
