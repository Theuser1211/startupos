"use client";

import { PageErrorFallback } from "@/components/ui/page-error";

export default function BriefError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageErrorFallback {...props} title="Brief" />;
}
