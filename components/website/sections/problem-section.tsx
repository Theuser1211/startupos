"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

interface Props {
  section: WebsiteSection;
  spec: WebsiteSpec;
}

export function ProblemSection({ section, spec }: Props) {
  const { primary, secondary } = spec.visualStyle;
  const items = section.items || [];

  return (
    <section id={section.id} className="spec-section">
      <div className="spec-container">
        <div className="spec-split">
          <div>
            <span className="spec-label" style={{ color: primary }}>
              {section.subheading || "The Problem"}
            </span>
            <h2 className="spec-heading">{section.heading}</h2>
            {section.body && <p className="spec-body">{section.body}</p>}
            {items.length > 0 && (
              <div className="mt-6 space-y-3">
                {items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: primary }}
                    />
                    <span className="text-sm text-muted-foreground">{item.description || item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className="aspect-[4/3] rounded-2xl flex items-center justify-center p-8"
            style={{
              background: `linear-gradient(135deg, ${primary}10, ${secondary}08)`,
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
            aria-hidden="true"
          >
            <div className="w-full space-y-3">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="h-3 rounded" style={{ width: "85%", background: `linear-gradient(90deg, ${primary}40, ${secondary}40)` }} />
              <div className="h-3 rounded" style={{ width: "60%", background: `linear-gradient(90deg, ${primary}30, ${secondary}30)` }} />
              <div className="h-3 rounded" style={{ width: "40%", background: `linear-gradient(90deg, ${primary}20, ${secondary}20)` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
