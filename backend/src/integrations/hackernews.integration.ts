import axios from 'axios';
import { HNStoryData } from '../types/feed.types';
import { HackerNewsCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

type HNFeedCategory = 'ai' | 'startups' | 'all';

const CATEGORY_KEYWORDS: Record<HNFeedCategory, string> = {
  ai: 'AI OR LLM OR GPT OR "machine learning" OR "neural network" OR "deep learning" OR Claude OR Gemini',
  startups: '"Show HN" OR YC OR "Y Combinator" OR startup OR "Series A" OR "raised"',
  all: '',
};

interface HNSearchResponse {
  hits: Array<{
    objectID: string;
    title: string;
    url?: string;
    points: number;
    num_comments: number;
    created_at: string;
  }>;
}

export class HNIntegration {
  private static BASE = process.env.HN_ALGOLIA ?? 'https://hn.algolia.com/api/v1';

  static async getMostDebated(): Promise<HNStoryData> {
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

    const { data } = await axios.get<HNSearchResponse>(`${this.BASE}/search`, {
      params: {
        tags: 'story',
        numericFilters: `num_comments>100,created_at_i>${oneDayAgo}`,
        hitsPerPage: 20,
      },
      timeout: 10000,
    });

    if (!data.hits.length) {
      return this.getMostDebatedFallback();
    }

    const now = Date.now();
    // Sort by comment velocity = comments per hour since posting
    const withVelocity = data.hits.map((h) => {
      const hoursAgo = Math.max(1, (now - new Date(h.created_at).getTime()) / 3_600_000);
      return { ...h, hoursAgo: Math.round(hoursAgo), velocity: h.num_comments / hoursAgo };
    });

    return withVelocity.sort((a, b) => b.velocity - a.velocity)[0];
  }

  private static async getMostDebatedFallback(): Promise<HNStoryData> {
    const twoDaysAgo = Math.floor(Date.now() / 1000) - 172_800;

    const { data } = await axios.get<HNSearchResponse>(`${this.BASE}/search`, {
      params: {
        tags: 'story',
        numericFilters: `num_comments>50,created_at_i>${twoDaysAgo}`,
        hitsPerPage: 10,
      },
      timeout: 10000,
    });

    if (!data.hits.length) throw new Error('No HN stories found even in fallback');

    const top = data.hits.sort((a, b) => b.num_comments - a.num_comments)[0];
    const hoursAgo = Math.round((Date.now() - new Date(top.created_at).getTime()) / 3_600_000);
    return { ...top, hoursAgo, velocity: top.num_comments / Math.max(1, hoursAgo) };
  }

  // ─────────────────────────────────────────────
  // Feed-specific methods (return HackerNewsCard[])
  // ─────────────────────────────────────────────

  /** Fetches `count` HN stories as feed cards, optionally category-filtered */
  static async getStoriesBatch(count: number, category: HNFeedCategory = 'all'): Promise<HackerNewsCard[]> {
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
    const keywords = CATEGORY_KEYWORDS[category];

    const params: Record<string, unknown> = {
      tags: 'story',
      numericFilters: `points>10,created_at_i>${oneDayAgo}`,
      hitsPerPage: Math.min(count * 3, 50),
    };

    if (keywords) {
      params.query = keywords;
    }

    try {
      const { data } = await axios.get<HNSearchResponse>(`${this.BASE}/search`, {
        params,
        timeout: 10000,
      });

      if (!data.hits.length) return [];

      // Sort by a blend of points + comments
      const sorted = data.hits
        .filter((h) => h.title)
        .sort((a, b) => (b.points + b.num_comments * 2) - (a.points + a.num_comments * 2));

      if (!sorted.length) {
        console.log('[HN] Sorted hits empty.');
        return [];
      }

      return sorted.slice(0, count).map((story) => {
        const hoursAgo = Math.round(
          (Date.now() - new Date(story.created_at).getTime()) / 3_600_000
        );
        const source = story.url ? this.extractDomain(story.url) : 'news.ycombinator.com';

        return {
          id: uuid(),
          type: 'hackernews' as const,
          category: (category === 'all' ? 'all' : category) as HackerNewsCard['category'],
          fetchedAt: new Date().toISOString(),
          title: story.title,
          description: '',
          url: story.url ?? `https://news.ycombinator.com/item?id=${story.objectID}`,
          metadata: {
            points: story.points,
            comments: story.num_comments,
            hoursAgo,
            hnId: story.objectID,
            source,
          },
        };
      });
    } catch (err) {
      console.warn('[HN] getStoriesBatch failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }


}
