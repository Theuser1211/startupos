"use client";

import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function TestimonialsSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const items = section.items || [];

  if (items.length === 0) return null;

  return (
    <section id={section.id} className="spec-section spec-section-alt">
      <div className="spec-container">
        <div className="text-center mb-12">
          <span className="spec-label">{section.subheading || "Testimonials"}</span>
          <h2 className="spec-heading">{section.heading}</h2>
        </div>
        <div className="spec-grid-3">
          {items.map((item, i) => (
            <div key={i} className="spec-card flex flex-col">
              <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                &ldquo;{item.description}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: `${spec.visualStyle.primary}20`, color: spec.visualStyle.primary }}
                >
                  {item.title.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  {item.meta && (
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{item.meta}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
