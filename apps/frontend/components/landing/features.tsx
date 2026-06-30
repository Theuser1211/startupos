"use client";

const features = [
  {
    title: "Verdict",
    desc: "Tells you if your idea is worth building based on market, competition, and your answers.",
  },
  {
    title: "Website",
    desc: "Generates a complete landing page from your interview answers. Deploy to Vercel in one click.",
  },
  {
    title: "Brand",
    desc: "Defines your mission, values, tone of voice, and visual identity so you don't have to guess.",
  },
  {
    title: "Revenue",
    desc: "Walks through pricing models, projections, and unit economics. Figures out if you can make money.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-lg font-semibold mb-6">What you get</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-border rounded p-4"
            >
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
