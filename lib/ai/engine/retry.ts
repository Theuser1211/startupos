interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
  jitter: true,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let i = 0; i <= opts.maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i === opts.maxRetries) break;

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, i),
        opts.maxDelayMs,
      );
      const jittered = opts.jitter ? delay * (0.5 + Math.random()) : delay;
      await new Promise((resolve) => setTimeout(resolve, jittered));
    }
  }

  throw lastError;
}
