import 'dotenv/config';
import { runFeedSync } from '../jobs/feed-sync.job';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('[Render Cron Job] Starting feed sync...');
  const start = Date.now();
  
  try {
    const result = await runFeedSync();
    console.log(`[Render Cron Job] Sync complete!`);
    console.log(`- Inserted: ${result.inserted}`);
    console.log(`- Deleted (pruned): ${result.deleted}`);
    console.log(`- Duration: ${(result.durationMs / 1000).toFixed(1)}s`);
  } catch (error) {
    console.error('[Render Cron Job] Error during feed sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
