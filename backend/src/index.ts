import 'dotenv/config';
import { app } from './app';
import { startFeedSyncJob } from './jobs/feed-sync.job';
import { runShuffle } from './jobs/shuffle.job';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  // Verify DB connection on startup
  try {
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');
  } catch (err) {
    console.error('[DB] Failed to connect to PostgreSQL:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     Detour Backend                    ║
║     Running on port ${PORT}              ║
║     ENV: ${process.env.NODE_ENV ?? 'development'}               ║
╚═══════════════════════════════════════╝
    `);

    // Start the cron job for data fetching
    startFeedSyncJob();
    
    
    // Also run it once immediately to initialize sortOrders
    runShuffle().catch(console.error);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[SERVER] SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[SERVER] SIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch(console.error);
