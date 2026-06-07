import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';

export const feedRouter = Router();

// ─────────────────────────────────────────────
// Public feed routes — no authentication required
// ─────────────────────────────────────────────

// GET /api/feed?cursor=&category=all&limit=10
feedRouter.get('/', FeedController.getFeed);

// GET /api/feed/sources — must come BEFORE /:anything to avoid route conflicts
feedRouter.get('/sources', FeedController.getSources);

// POST /api/feed/cache/clear — admin only (protected by x-admin-secret header)
feedRouter.post('/cache/clear', FeedController.clearCache);

// POST /api/feed/force-fetch — immediately trigger a feed sync
// Body: { sources?: string[] }  — omit to refresh all sources
feedRouter.post('/force-fetch', FeedController.forceFetch);

// POST /api/feed/sync — legacy alias for force-fetch
feedRouter.post('/sync', FeedController.syncFeed);

