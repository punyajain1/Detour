import { Router, Request, Response } from 'express';
import { runFeedSync } from '../jobs/feed-sync.job';

export const syncRouter = Router();

// Endpoint to trigger a manual feed sync
// You can use a query parameter like ?secret=YOUR_SECRET to protect this endpoint
// if you set the SYNC_SECRET environment variable in Render.
syncRouter.get('/feed', (req: Request, res: Response): void => {
  const secret = req.query.secret;
  
  if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // We run this asynchronously and return 202 Accepted immediately so that
  // Render's request timeout doesn't kill the request while fetching.
  runFeedSync()
    .then(result => {
      console.log(`[Manual Sync] Success. Inserted: ${result.inserted}, Deleted: ${result.deleted}`);
    })
    .catch(err => {
      console.error(`[Manual Sync] Error:`, err);
    });

  res.status(202).json({ message: 'Feed sync started in the background' });
});
