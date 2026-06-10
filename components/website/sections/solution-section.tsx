"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

interface Props {
  section: WebsiteSection;
  spec: WebsiteSpec;
}

export function SolutionSection({ section, spec }: Props) {
  const { primary, secondary } = spec.visualStyle;

  return (
    <section id={section.id} className="spec-section spec-section-alt">
      <div className="spec-container">
        <div className="spec-split spec-split-reverse">
          <div
            className="aspect-[4/3] rounded-2xl flex items-center justify-center p-8"
            style={{
              background: `linear-gradient(135deg, ${primary}10, ${secondary}08)`,
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
            aria-hidden="true"
          >
            <div className="w-full space-y-3">
              <div className="text-3xl mb-2">✦</div>
              <div className="h-3 rounded" style={{ width: "95%", background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
              <div className="h-3 rounded" style={{ width: "88%", background: `linear-gradient(90deg, ${primary}80, ${secondary}80)` }} />
              <div className="h-3 rounded" style={{ width: "76%", background: `linear-gradient(90deg, ${primary}60, ${secondary}60)` }} />
            </div>
          </div>
          <div>
            <span className="spec-label" style={{ color: primary }}>
              {section.subheading || "How We Help"}
            </span>
            <h2 className="spec-heading">{section.heading}</h2>
            {section.body && <p className="spec-body">{section.body}</p>}
            {spec.sections.find((s) => s.type === "values") && (
              <p className="mt-4 text-sm italic" style={{ color: "rgba(255,255,255,0.5)" }}>
                &ldquo;{spec.sections.find((s) => s.type === "values")?.heading}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
