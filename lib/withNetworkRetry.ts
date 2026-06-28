const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return true;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    msg.includes('fetch') ||
    msg.includes('failed')
  );
}

export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  attempts = 5,
  delayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1 && isRetryableNetworkError(err)) {
        await sleep(delayMs * (i + 1));
      } else if (!isRetryableNetworkError(err)) {
        throw err;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}
