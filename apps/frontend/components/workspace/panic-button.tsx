"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Sparkles, Flame, RefreshCw } from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

const actions = [
  "Talk to 3 potential customers today. Not tomorrow. Today.",
  "Delete half the features from your roadmap. Ship what's left.",
  "Write one email to a user who churned. Ask them why they left.",
  "Go outside. Touch grass. Come back with a clearer head.",
  "Send your MVP to ONE person who doesn't love you. Get real feedback.",
  "Pick the ONE metric that matters. Ignore everything else.",
  "Cut your burn rate by 20%. You don't need that SaaS tool anyway.",
  "Rewrite your value proposition in one sentence. If you can't, you're not ready.",
  "Schedule a call with a founder who's 6 months ahead of you.",
  "Close Slack. Close Twitter. Close Hacker News. Open your code editor.",
  "Write down 3 things your startup does better than anyone else. Find them.",
  "Record a Loom video of your product and send it to 5 strangers.",
  "Pick one channel. Go deep. Stop trying to be everywhere at once.",
  "Create a landing page today. Even if your product doesn't exist yet.",
  "Send a 'why did you leave?' survey to 10 former users. Read the responses.",
  "Stop fundraising and start building. Revenue > pitch decks.",
  "Fire your worst customer. Yes, that one. You know who it is.",
  "Reach out to 5 investors who rejected you. Ask what they didn't like.",
  "Write the absolute worst version of your landing page. Ship it.",
  "Read your own analytics for 30 minutes. What did you learn?",
];

const motivations = [
  "Every successful founder started exactly where you are — confused and slightly terrified.",
  "The only way out is through. And coffee. Lots of coffee.",
  "Your startup isn't dying, it's just building character.",
  "Remember: Airbnb sold cereal boxes to survive. You've got this.",
  "The difference between success and failure is one more iteration.",
  "Building a startup is like eating glass and staring into the abyss. You'll be fine.",
  "You're not behind. You're exactly on time for your own journey.",
  "The most dangerous thing is to give up. The second most dangerous? Running out of cash.",
  "Your competitors are just as confused as you are. They're better at faking it.",
  "This is the part where most people quit. Don't be most people.",
  "The best time to start was yesterday. The second best time is right now.",
  "Successful people are just failed people who never gave up. Keep failing forward.",
  "If it was easy, everyone would do it. Actually, everyone IS doing it. That's the problem.",
  "Your users don't care about your code quality. They want their problem solved.",
  "There are no overnight successes. Just 10,000 overnight failures first.",
  "Every unicorn was once a worthless MVP that nobody cared about.",
  "You have exactly the same number of hours in a day as Elon Musk. Use them wisely.",
  "The best founders aren't the smartest. They're the ones who didn't quit.",
  "Failure is just data for your next attempt. Collect as much as you can.",
  "If you're not embarrassed by your first product, you launched too late.",
];

const roasts = [
  "Your MVP isn't minimal, it's invisible. Nobody knows it exists.",
  "You've spent more time naming your startup than building it. Classic.",
  "Your 'disruptive' idea has been tried 47 times before. The other 46 failed.",
  "Your roadmap is a wishlist, not a plan. But it looks pretty.",
  "You asked users what they wanted. They told you. You ignored them. Beautiful.",
  "Your 'we'll figure out monetization later' is startup for 'I'll pay you next week'.",
  "You've pivoted so many times you don't even understand what you're building.",
  "You've been 'in stealth mode' so long even your mom forgot what you do.",
  "Your pitch deck has more buzzwords than a LinkedIn influencer's bio.",
  "You want to 'move fast and break things' but you haven't moved in 3 months.",
  "Your 'burn rate' isn't burning — it's arson. Call the fire department.",
  "You're pre-revenue, pre-product, and pre-sanity. That's a hat trick!",
  "That 'growth hack' you're reading about won't work. They never do.",
  "Your todo list has 47 urgent items. That's not productivity, it's a cry for help.",
  "You're not in a pivot, you're in denial. Welcome to the club.",
  "Your 'we're like Uber for X' pitch lost you the room in 3 seconds.",
  "You've raised $0 and spent $50k on branding. Math checks out.",
  "Your co-founder meetings are 90% venting and 10% deciding to vent more.",
  "You checked Hacker News 14 times today. Zero customers acquired.",
  "Your competitive advantage is 'we care more'. So does everyone else.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function template(str: string, name?: string, stage?: string): string {
  return str
    .replace(/\{name\}/g, name || "founder")
    .replace(/\{stage\}/g, stage || "early-stage");
}

interface PanicButtonProps {
  blueprint?: StartupBlueprint | null;
}

export function PanicButton({ blueprint }: PanicButtonProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("");
  const [motivation, setMotivation] = useState("");
  const [roast, setRoast] = useState("");

  const name = blueprint?.startupName;
  const stage = blueprint?.companySnapshot?.stage;

  const generate = useCallback(() => {
    setAction(template(pick(actions), name, stage));
    setMotivation(template(pick(motivations), name, stage));
    setRoast(template(pick(roasts), name, stage));
  }, [name, stage]);

  const handleOpen = () => {
    generate();
    setOpen(true);
  };

  return (
    <>
      <motion.button
        onClick={handleOpen}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-base shrink-0">😭</span>
        <span className="truncate">I&apos;m Stuck</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-glass-border bg-card shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center justify-between p-6 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-lg">😭</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold">Panic Button</h2>
                    <p className="text-xs text-muted-foreground">Let&apos;s get you unstuck</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                      <Lightbulb className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Do this now</span>
                  </div>
                  <p className="text-sm">{action}</p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Remember this</span>
                  </div>
                  <p className="text-sm italic">&ldquo;{motivation}&rdquo;</p>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Tough love</span>
                  </div>
                  <p className="text-sm">{roast}</p>
                </div>

                <motion.button
                  onClick={generate}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/10 border border-primary/20 text-primary py-2.5 text-sm font-medium hover:bg-primary/20 transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Give me another
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
