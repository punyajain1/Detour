import { Request, Response } from 'express';
import { FeedService } from '../services/feed.service';
import { runFeedSync, SOURCE_FETCHERS } from '../jobs/feed-sync.job';
import { FeedCategory, FeedSourcesResponse } from '../types/feed.types';

const VALID_CATEGORIES: FeedCategory[] = ['all', 'space', 'programming', 'startups', 'ai', 'science'];

export class FeedController {
  /**
   * GET /api/feed
   * Query params:
   *   cursor?   — opaque pagination cursor from previous response
   *   category? — 'all' | 'space' | 'programming' | 'startups' | 'ai' | 'science'
   *   limit?    — cards per page (default: 10, max: 20)
   *   type?     — filter by card type (e.g. 'nasa_apod')
   */
  static async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      const limitRaw = parseInt(String(req.query.limit ?? '10'), 10);
      const limit = isNaN(limitRaw) ? 10 : Math.min(Math.max(limitRaw, 1), 20);

      const rawCategory = req.query.category as string | undefined;
      const category: FeedCategory =
        rawCategory && VALID_CATEGORIES.includes(rawCategory as FeedCategory)
          ? (rawCategory as FeedCategory)
          : 'all';

      const type = req.query.type as string | undefined;

      const page = await FeedService.getFeedPage(cursor, category, limit, type);
      res.json(page);
    } catch (err) {
      console.error('[FeedController] getFeed error:', err);
      res.status(503).json({
        error: 'Feed is temporarily unavailable. Please try again.',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * GET /api/feed/sources
   * Returns available categories and source types for filter UI.
   */
  static getSources(_req: Request, res: Response): void {
    const response: FeedSourcesResponse = {
      categories: ['all', 'space', 'programming', 'startups', 'ai', 'science'],
      sources: [
        'nasa_apod',
        'nasa_mars',
        'nasa_neows',
        'github',
        'leetcode',
        'hackernews',
        'stackoverflow',
        'space_news',
        'jwst',
      ],
    };
    res.json(response);
  }

  /**
   * POST /api/feed/cache/clear
   * Dev-only — clears the in-memory feed cache.
   * Protected by x-admin-secret header.
   */
  static clearCache(req: Request, res: Response): void {
    const secret = req.headers['x-admin-secret'];
    if (secret !== process.env.JWT_SECRET) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    FeedService.clearCache();
    res.json({ message: 'Feed cache cleared' });
  }

  /**
   * POST /api/feed/sync
   * (Legacy alias — kept for backwards compat; delegates to forceFetch)
   */
  static async syncFeed(req: Request, res: Response): Promise<void> {
    return FeedController.forceFetch(req, res);
  }

  /**
   * POST /api/feed/force-fetch
   *
   * Immediately runs the feed-sync job and returns detailed stats.
   * Optionally scoped to specific sources via the request body.
   *
   * Body (JSON, all optional):
   *   sources?: string[]   — subset of source keys to refresh, e.g. ["nasa_apod", "jwst"]
   *                          omit or pass [] to refresh ALL sources
   *
   * Returns:
   *   { inserted, deleted, sources, durationMs }
   *
   * Available source keys:
   *   nasa_apod | nasa_mars | nasa_neows | github |
   *   hackernews | stackoverflow | leetcode | space_news | jwst
   */
  static async forceFetch(req: Request, res: Response): Promise<void> {
    const rawSources: unknown = req.body?.sources;
    const availableKeys = Object.keys(SOURCE_FETCHERS);

    // Validate requested sources
    let sources: string[] = [];
    if (Array.isArray(rawSources) && rawSources.length > 0) {
      const invalid = (rawSources as string[]).filter(s => !availableKeys.includes(s));
      if (invalid.length) {
        res.status(400).json({
          error: 'Invalid source key(s)',
          invalid,
          available: availableKeys,
        });
        return;
      }
      sources = rawSources as string[];
    }
    // empty sources array → sync all

    try {
      console.log(`[ForceFetch] Triggered for sources: ${sources.length ? sources.join(', ') : 'ALL'}`);
      const result = await runFeedSync(sources.length ? sources : undefined);

      res.json({
        ok: true,
        inserted:   result.inserted,
        deleted:    result.deleted,
        sources:    result.sources,
        durationMs: result.durationMs,
        message: `Synced ${result.sources.length} source(s) — inserted ${result.inserted} cards, pruned ${result.deleted} old cards in ${(result.durationMs / 1000).toFixed(2)}s`,
      });
    } catch (err) {
      console.error('[ForceFetch] Failed:', err);
      res.status(500).json({
        ok: false,
        error:   'Force fetch failed',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
