import { prisma } from '../lib/prisma';

export async function runShuffle(): Promise<void> {
  const start = Date.now();
  console.log('[Shuffle] Starting database shuffle...');
  
  // Assign a random value to sortOrder for all rows to mix up the feed
  await prisma.$executeRawUnsafe(`
    UPDATE feed_cards
    SET "sortOrder" = random()
  `);
  
  console.log(`[Shuffle] Done in ${Date.now() - start}ms`);
}
