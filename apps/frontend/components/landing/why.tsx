"use client";

export function WhySection() {
  return (
    <section className="py-16 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs text-muted-foreground font-mono mb-4">
          // README.md
        </p>
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
            the users, the business model — all the stuff I usually skip
            because I&apos;m too excited to build.
          </p>
          <p>
            It&apos;s not a replacement for talking to customers. It&apos;s
            a replacement for my own impulsiveness.
          </p>
        </div>

        <div className="mt-8 p-4 border border-border rounded font-mono text-xs text-muted-foreground">
          <div className="text-primary/60 mb-2">$ cat TODO.txt</div>
          <div className="space-y-1">
            <div className="flex gap-3">
              <span className="text-primary shrink-0">[x]</span>
              <span>Founder interview (works on my machine)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary shrink-0">[x]</span>
              <span>Blueprint generation (kinda slow but works)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-primary shrink-0">[x]</span>
              <span>Website generator (makes something, at least)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground shrink-0">[ ]</span>
              <span>Mobile app (maybe next year)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground shrink-0">[ ]</span>
              <span>Write tests that don&apos;t suck</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
