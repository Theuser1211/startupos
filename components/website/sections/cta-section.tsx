"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function CtaSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const { primary, secondary } = spec.visualStyle;

  return (
    <section
      id={section.id}
      className="spec-section text-center"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: `linear-gradient(135deg, ${primary}10, ${secondary}05)`,
      }}
    >
      <div className="spec-container">
        <h2 className="spec-heading max-w-xl mx-auto">{section.heading || "Ready to get started?"}</h2>
        {section.body && (
          <p className="text-base max-w-md mx-auto mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
            {section.body}
          </p>
        )}
        {!section.body && spec.copy.ctaSubtext && (
          <p className="text-base max-w-md mx-auto mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
            {spec.copy.ctaSubtext}
          </p>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#"
            className="spec-btn spec-btn-primary"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              boxShadow: `0 4px 20px ${primary}40`,
            }}
            onClick={(e) => { e.preventDefault(); }}
          >
            {spec.copy.ctaPrimary}
          </a>
          <a
            href="#"
            className="spec-btn spec-btn-secondary"
            onClick={(e) => { e.preventDefault(); }}
          >
            {spec.copy.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
