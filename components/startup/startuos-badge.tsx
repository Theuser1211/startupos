import Link from "next/link";

export function StartupOSBadge() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white/60 hover:text-white/80 transition-colors rounded-full border border-white/10 hover:border-white/20"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-3 h-3"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      Published with StartupOS
    </Link>
  );
}
