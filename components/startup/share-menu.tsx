"use client";

import { useState } from "react";
import { Share2, Copy, Twitter, Linkedin, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareMenuProps {
  shareUrl: string;
  startupName: string;
  tagline: string;
  className?: string;
}

export function ShareMenu({ shareUrl, startupName, tagline, className }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${startupName} — StartupOS Blueprint`,
          text: tagline,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${startupName} — ${tagline}`)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`${startupName} — StartupOS Blueprint`)}&body=${encodeURIComponent(`Check out this startup blueprint:\n\n${shareUrl}`)}`;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Twitter / X
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href={emailUrl}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>
        </>
      )}
    </div>
  );
}
