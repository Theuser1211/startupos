"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function PricingSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const { primary, secondary } = spec.visualStyle;

  return (
    <section id={section.id} className="spec-section spec-section-alt">
      <div className="spec-container">
        <div className="text-center mb-12">
          <span className="spec-label" style={{ color: primary }}>
            {section.subheading || "Pricing"}
          </span>
          <h2 className="spec-heading">{section.heading}</h2>
          {section.body && (
            <p className="text-sm max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              {section.body}
            </p>
          )}
        </div>

        <div className="max-w-md mx-auto">
          {section.items?.map((item, i) => (
            <div key={i} className="spec-card text-center mb-4">
              {item.icon && <div className="text-3xl mb-3">{item.icon}</div>}
              {item.title && <h3 className="text-lg font-bold mb-2">{item.title}</h3>}
              {item.description && (
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {item.description}
                </p>
              )}
              {item.meta && (
                <span
                  className="inline-block text-3xl font-extrabold"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.meta}
                </span>
              )}
            </div>
          ))}

          <div className="text-center mt-8">
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
          </div>
        </div>
      </div>
    </section>
  );
}
