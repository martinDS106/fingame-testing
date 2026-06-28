const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 700,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await sleep(delayMs * (i + 1));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}
