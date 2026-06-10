"use client";

import { useState } from "react";
import type { WebsiteSection, WebsiteSpec } from "@/lib/startup/website-spec";

export function FaqSection({ section, spec }: { section: WebsiteSection; spec: WebsiteSpec }) {
  const items = section.items || [];
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id={section.id} className="spec-section">
      <div className="spec-container">
        <div className="text-center mb-12">
          <span className="spec-label">{section.subheading || "FAQ"}</span>
          <h2 className="spec-heading">{section.heading}</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {items.map((item, i) => {
            const id = `faq-${i}`;
            const isOpen = openId === id;

            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  background: spec.visualStyle.surface,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : id)}
                  className="w-full flex justify-between items-center p-5 text-left font-semibold text-sm"
                  aria-expanded={isOpen}
                >
                  <span>{item.title}</span>
                  <span
                    className="text-lg font-light transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
