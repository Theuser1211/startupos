"use client";

import confetti from "canvas-confetti";

export function fireCelebration() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#a78bfa", "#818cf8", "#6366f1", "#c084fc", "#e879f9"];

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }

  frame();

  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.5 },
    colors,
  });
}
