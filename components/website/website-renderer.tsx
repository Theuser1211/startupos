"use client";

import React, { useMemo } from "react";
import type { WebsiteSpec, WebsiteSection } from "@/lib/startup/website-spec";
import { HeroSection } from "@/components/website/sections/hero-section";
import { ProblemSection } from "@/components/website/sections/problem-section";
import { SolutionSection } from "@/components/website/sections/solution-section";
import { ValuesSection } from "@/components/website/sections/values-section";
import { PainPointsSection } from "@/components/website/sections/pain-points-section";
import { FeaturesSection } from "@/components/website/sections/features-section";
import { SocialProofSection } from "@/components/website/sections/social-proof-section";
import { PricingSection } from "@/components/website/sections/pricing-section";
import { FaqSection } from "@/components/website/sections/faq-section";
import { CtaSection } from "@/components/website/sections/cta-section";
import { TestimonialsSection } from "@/components/website/sections/testimonials-section";
import { MetricsSection } from "@/components/website/sections/metrics-section";

/* ─── Section Renderer Registry ─── */

const sectionRegistry: Record<string, React.FC<{ section: WebsiteSection; spec: WebsiteSpec }>> = {
  hero: ({ section, spec }) => <HeroSection section={section} spec={spec} />,
  problem: ({ section, spec }) => <ProblemSection section={section} spec={spec} />,
  solution: ({ section, spec }) => <SolutionSection section={section} spec={spec} />,
  values: ({ section, spec }) => <ValuesSection section={section} spec={spec} />,
  "pain-points": ({ section, spec }) => <PainPointsSection section={section} spec={spec} />,
  features: ({ section, spec }) => <FeaturesSection section={section} spec={spec} />,
  "social-proof": ({ section, spec }) => <SocialProofSection section={section} spec={spec} />,
  pricing: ({ section, spec }) => <PricingSection section={section} spec={spec} />,
  faq: ({ section, spec }) => <FaqSection section={section} spec={spec} />,
  cta: ({ section, spec }) => <CtaSection section={section} spec={spec} />,
  testimonials: ({ section, spec }) => <TestimonialsSection section={section} spec={spec} />,
  metrics: ({ section, spec }) => <MetricsSection section={section} spec={spec} />,
};

/* ─── Fallback for unknown sections ─── */

function FallbackSection({ section }: { section: WebsiteSection }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
          {section.type}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{section.heading}</h2>
        {section.body && (
          <p className="text-muted-foreground max-w-2xl mx-auto">{section.body}</p>
        )}
      </div>
    </section>
  );
}

/* ─── Navigation ─── */

function SpecNav({ spec }: { spec: WebsiteSpec }) {
  const { primary, secondary } = spec.visualStyle;
  const navItems = spec.sectionOrder
    .filter((id) => id !== "hero" && id !== "cta")
    .slice(0, 4);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: `${spec.visualStyle.background}d9`,
        borderColor: `rgba(255,255,255,0.08)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span
          className="text-lg font-bold"
          style={{
            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {spec.sections.find((s) => s.type === "hero")?.heading || "✦ Startup"}
        </span>
        <div className="flex items-center gap-6">
          {navItems.map((id) => {
            const section = spec.sections.find((s) => s.id === id);
            if (!section) return null;
            return (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                {section.heading.substring(0, 20)}
              </a>
            );
          })}
          <a
            href="#cta"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            }}
          >
            {spec.copy.ctaPrimary}
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Footer ─── */

function SpecFooter({ spec }: { spec: WebsiteSpec }) {
  return (
    <footer className="border-t py-12 px-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          {spec.sectionOrder.filter((id) => id !== "hero" && id !== "cta").slice(0, 5).map((id) => {
            const section = spec.sections.find((s) => s.id === id);
            if (!section) return null;
            return (
              <a
                key={id}
                href={`#${id}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.heading.substring(0, 20)}
              </a>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {spec.sections.find((s) => s.type === "hero")?.heading || "Startup"}. All rights reserved.
        </p>
        {spec.metadata && (
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
            Generated by {spec.metadata.provider} · {spec.metadata.model}
          </p>
        )}
      </div>
    </footer>
  );
}

/* ─── CSS Variables Injection ─── */

function SpecStyles({ spec }: { spec: WebsiteSpec }) {
  const { visualStyle } = spec;

  const css = useMemo(() => {
    const { primary, secondary, accent, background, surface, radius, fontHeading, fontBody } = visualStyle;
    const glowStyle = `0 0 30px ${primary}15, 0 8px 40px ${primary}10`;

    return `
:root {
  --spec-primary: ${primary};
  --spec-secondary: ${secondary};
  --spec-accent: ${accent};
  --spec-bg: ${background};
  --spec-surface: ${surface};
  --spec-radius: ${radius};
  --spec-font-heading: ${fontHeading};
  --spec-font-body: ${fontBody};
  --spec-spacing: ${spec.visualStyle.spacing};
}

.spec-section { padding: var(--spec-spacing) 0; }
.spec-section-alt { background: var(--spec-surface); }
.spec-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.spec-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 16px;
  color: var(--spec-primary);
}
.spec-heading {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
  font-family: var(--spec-font-heading), system-ui, sans-serif;
}
.spec-body {
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  line-height: 1.8;
  font-family: var(--spec-font-body), system-ui, sans-serif;
}
.spec-gradient-text {
  background: linear-gradient(135deg, var(--spec-primary), var(--spec-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.spec-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.spec-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.spec-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.spec-card {
  background: var(--spec-surface);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--spec-radius);
  padding: 32px;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.spec-card:hover {
  transform: translateY(-4px);
  border-color: ${primary}40;
  box-shadow: ${glowStyle};
}
.spec-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.spec-split-reverse { direction: rtl; }
.spec-split-reverse > * { direction: ltr; }
.spec-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--spec-radius);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;
  cursor: pointer;
}
.spec-btn:hover { transform: translateY(-2px); }
.spec-btn-primary {
  color: white;
  box-shadow: 0 4px 20px ${primary}40;
}
.spec-btn-secondary {
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
}

@media (max-width: 768px) {
  .spec-split { grid-template-columns: 1fr; gap: 32px; }
  .spec-split-reverse { direction: ltr; }
  .spec-grid-2 { grid-template-columns: 1fr; }
  .spec-grid-3 { grid-template-columns: 1fr; }
}
`;
  }, [visualStyle]);

  return <style>{css}</style>;
}

/* ─── Main Renderer ─── */

interface WebsiteRendererProps {
  spec: WebsiteSpec;
  className?: string;
}

export function WebsiteRenderer({ spec, className = "" }: WebsiteRendererProps) {
  const renderedSections = useMemo(() => {
    return spec.sectionOrder
      .map((id) => {
        const section = spec.sections.find((s) => s.id === id);
        if (!section) return null;

        const SectionComponent = sectionRegistry[section.type];
        if (!SectionComponent) {
          return <FallbackSection key={id} section={section} />;
        }

        return <SectionComponent key={id} section={section} spec={spec} />;
      })
      .filter(Boolean);
  }, [spec]);

  return (
    <div
      className={className}
      style={{
        fontFamily: `${spec.visualStyle.fontBody}, system-ui, sans-serif`,
        background: spec.visualStyle.background,
        color: "#f1f1f5",
        minHeight: "100vh",
      }}
    >
      <SpecStyles spec={spec} />
      <SpecNav spec={spec} />

      <main className="pt-16">
        {renderedSections}
        <SpecFooter spec={spec} />
      </main>
    </div>
  );
}

export { SpecStyles, SpecNav };
