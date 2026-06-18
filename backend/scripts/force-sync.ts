import { runFeedSync } from '../src/jobs/feed-sync.job';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting force sync...');
  try {
    const result = await runFeedSync();
    console.log(`Synced ${result.sources.length} source(s) — inserted ${result.inserted} cards, pruned ${result.deleted} old cards in ${(result.durationMs / 1000).toFixed(2)}s`);
    console.log('Sources:', result.sources);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
