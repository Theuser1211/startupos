import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-glass-border bg-glass-bg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
