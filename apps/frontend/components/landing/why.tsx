"use client";

export function WhySection() {
  return (
    <section className="py-16 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Why I built this</h2>

        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            I keep starting projects and abandoning them after 72 hours.
            Usually because I jump into building without thinking things
            through first.
          </p>
          <p>
            So I made a tool that walks me through a structured interview
            before I write a single line of code. It asks about the market,
            the users, the business model.
          </p>
          <p>
            It&apos;s not a replacement for talking to customers. It&apos;s
            a replacement for my own impulsiveness.
          </p>
        </div>
      </div>
    </section>
  );
}
