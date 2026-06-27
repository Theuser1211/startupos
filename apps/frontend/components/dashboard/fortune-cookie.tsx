"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FORTUNE_KEY = "startupos-fortune";

const fortunes = [
  "Your startup will find product-market fit right after you stop pivoting.",
  "The investor who says 'not right now' means 'not ever.' Move on.",
  "Your best feature is the one you haven't built yet. Ship faster.",
  "Revenue cures all existential dread. Go sell something.",
  "The competitor you're afraid of is also afraid of you.",
  "Your first 100 users will be acquired manually. There are no shortcuts.",
  "The best time to raise money was before you needed it.",
  "A bad launch today beats a perfect launch next month.",
  "Your co-founder is not a mind reader. Communicate better.",
  "The market doesn't care about your vision. It cares about your solution.",
  "Pivoting is not failure. It's market research with more coding.",
  "Your pricing is too low. Raise it. Watch what happens.",
  "A confused mind says no. Simplify your pitch.",
  "The best marketing is a product that works. Make it work.",
  "Burnout is not a badge of honor. Sleep more.",
  "Your MVP should embarrass you. If it doesn't, you built too much.",
  "The customer is not always right. But they're always the customer.",
  "Founders who listen win. Founders who don't, pivot.",
  "Revenue destroys all arguments. Get some.",
  "Your cap table is your future board. Choose wisely.",
  "A good founder hires people smarter than themselves. Then gets out of the way.",
  "The best pitch deck is a profitable company. Build one.",
  "Your first hire will define your culture. Don't rush it.",
  "The only traction that matters is people paying you money.",
  "Distribution beats product every time. Learn to sell.",
  "No one cares about your feature list. They care about their problem.",
  "raised money = raised expectations. Make sure you can deliver.",
  "Your startup name doesn't matter. Your execution does.",
  "Customer support is your secret weapon. Use it.",
  "The best founders are obsessed with a problem, not a solution.",
  "A great team beats a great idea. Invest in people.",
  "Your first version should make someone's life better. That's it.",
  "Focus is saying no to good ideas. Say no more often.",
  "The competition is not the enemy. Your own inertia is.",
  "Cash flow is reality. Everything else is a story.",
  "Your users will tell you what to build. Listen closely.",
  "A pivot is just a data-informed restart. Do it with conviction.",
  "The valley of death is real. Plan your runway carefully.",
  "Good culture attracts good people. Bad culture repels everyone.",
  "Your board meeting should be a conversation, not a presentation.",
  "Founder-market fit matters more than product-market fit.",
  "The best sales pitch is a demo. Show, don't tell.",
  "Your idea is worth nothing. Execution is worth everything.",
  "Nail the first 10 customers. The next 100 will follow.",
  "Don't build features for people who aren't paying you.",
  "Your network is your net worth. Nurture it.",
  "Speed is the only moat that matters. Move faster.",
  "The best time to fire someone is the first time you think about it.",
  "A clean cap table is a happy cap table.",
  "Your metrics are lying to you. Dig deeper.",
  "The best founders are paranoid but not paralyzed.",
  "Customers don't buy features. They buy outcomes.",
  "Your TAM is smaller than you think. Get specific.",
  "A good CEO hires their weaknesses. Compensate, don't hide.",
  "The best advice comes from people who've done it. Everyone else is noise.",
  "Your startup will take twice as long and cost twice as much. Plan for it.",
  "The only bad pivot is the one you don't learn from.",
  "Perfection is the enemy of shipped. Ship the imperfect thing.",
  "Your investors are your partners. Treat them like it.",
  "Culture eats strategy for breakfast. Every single day.",
  "The best founders are relentless, not reckless. Know the difference.",
  "Your first employee should be better than you. Hire up.",
  "A good board member opens doors. A great one opens your mind.",
  "Revenue solves everything. If something isn't working, sell harder.",
  "The product you want to build isn't the product users need. Find the gap.",
  "Your churn rate is a symptom. The disease is elsewhere.",
  "Great founders are great listeners. Stop talking and start hearing.",
  "A bad hire costs more than no hire. Be patient.",
  "Your distribution strategy is not optional. Build it early.",
  "The best founders build products they themselves want to use.",
  "Your brand is what people say about you when you're not in the room.",
  "The best time to network is when you don't need anything.",
  "A clear mission attracts aligned people. Be clear.",
  "Your biggest risk is building something nobody wants. Validate constantly.",
  "Great founders are great storytellers. Craft your narrative.",
  "Your pricing model is a product decision. Treat it with care.",
  "The best meetings end with a decision. No decision = no meeting.",
  "Your startup will break your heart. Then it will make your dreams come true.",
  "A good founder knows what they don't know. Ask for help.",
  "The best products are simple. Complexity is a crutch.",
  "Your customer persona is wrong. Talk to more customers.",
  "Fundraising is not a milestone. It's a means to an end.",
  "The best founders are optimists with a calculator. Dream, but measure.",
  "Your competitor analysis is probably wrong. Focus on customers instead.",
  "A great pitch is a story, not a spec sheet. Tell a story.",
  "Your first dollar is the hardest. After that, it's just scaling.",
  "The best teams argue about ideas, not people. Disagree constructively.",
  "Your product roadmap is a hypothesis. Test it against reality.",
  "Founders who don't sell don't survive. Close deals yourself.",
  "The best advice often comes from unexpected places. Stay open.",
  "Your burnout is not helping anyone. Take the day off.",
  "A good founder celebrates small wins. They're the only wins there are.",
  "The market rewards speed, not perfection. Ship it now.",
  "Your co-founder relationship is the most important business decision. Get it right.",
  "The best companies are built in plain sight. Share your journey.",
  "Your users are your best salespeople. Make them successful, then famous.",
  "A great product sells itself. Make yours great.",
  "The best founders are lifelong learners. Read more.",
  "Your startup is a reflection of your values. Choose them carefully.",
  "The only sustainable advantage is your team. Hire well, manage well.",
  "A good founder is comfortable being uncomfortable. Get comfortable.",
  "Your first 100 customers will teach you everything. Listen to them.",
  "The best time to start was 6 months ago. The second best time is now.",
  "In a startup, you make your own luck by shipping constantly.",
  "Your worst day as a founder is still better than your best day as an employee.",
  "The secret to fundraising is not needing the money. Build a real business.",
  "Good ideas are obvious in hindsight. Trust your gut when it's not.",
  "The best founders don't compete. They create new categories.",
  "Your mental health is your most important asset. Protect it fiercely.",
];

interface StoredFortune {
  date: string;
  fortune: string;
}

export function FortuneCookie() {
  const [fortune, setFortune] = useState("");
  const [key, setKey] = useState(0);

  const loadFortune = useCallback(() => {
    const today = new Date().toDateString();
    try {
      const stored = localStorage.getItem(FORTUNE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as StoredFortune;
        if (data.date === today) {
          return data.fortune;
        }
      }
    } catch {}
    return null;
  }, []);

  const saveFortune = useCallback((f: string) => {
    const today = new Date().toDateString();
    try {
      localStorage.setItem(FORTUNE_KEY, JSON.stringify({ date: today, fortune: f }));
    } catch {}
  }, []);

  const pickRandom = useCallback(() => {
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  }, []);

  const newFortune = useCallback(() => {
    const f = pickRandom();
    saveFortune(f);
    setFortune(f);
    setKey((k) => k + 1);
  }, [pickRandom, saveFortune]);

  useEffect(() => {
    const saved = loadFortune();
    if (saved) {
      setFortune(saved);
    } else {
      newFortune();
    }
  }, [loadFortune, newFortune]);

  return (
    <Card className="border-glass-border bg-glass-bg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">🥠</span>
          Startup Fortune Cookie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center py-2">
          <motion.div
            className="text-3xl mb-4"
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          >
            🥠
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.p
              key={key}
              className="text-sm leading-relaxed text-foreground/90 italic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              &ldquo;{fortune}&rdquo;
            </motion.p>
          </AnimatePresence>
          <motion.button
            onClick={newFortune}
            className="mt-5 text-xs text-muted-foreground hover:text-primary border border-glass-border rounded-lg px-4 py-2 hover:border-primary/30 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ✨ New Fortune
          </motion.button>
        </div>
      </CardContent>
    </Card>
  );
}
