/**
 * Runs an array of tasks with a concurrency limit.
 *
 * @param limit The maximum number of concurrent tasks.
 * @param items The items to process.
 * @param fn The async function to execute for each item.
 * @returns An array of PromiseSettledResult for each task.
 */
export async function runWithConcurrencyLimit<T, R>(
  limit: number,
  items: T[],
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        const value = await fn(items[index]);
        results[index] = { status: 'fulfilled', value };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
