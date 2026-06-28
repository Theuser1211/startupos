"use client";

import { PageErrorFallback } from "@/components/ui/page-error";

export default function InterviewError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageErrorFallback {...props} title="Interview" />;
}
