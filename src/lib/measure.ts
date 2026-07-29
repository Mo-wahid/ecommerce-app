export async function measureTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    // In a real production app, this could send metrics to Datadog/NewRelic
    console.log(`[API MEASURE] ${name} took ${duration}ms`);
  }
}
