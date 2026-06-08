import axios from 'axios';
import { SOQuestionData } from '../types/feed.types';

interface SOResponse {
  items: Array<{
    title: string;
    link: string;
    score: number;
    answer_count: number;
    tags: string[];
    is_answered: boolean;
  }>;
  quota_remaining?: number;
}

export class SOIntegration {
  private static BASE = 'https://api.stackexchange.com/2.3';

  static async getRandomTop(limit: number = 20): Promise<SOQuestionData[]> {
    const oneWeekAgo = Math.floor((Date.now() - 7 * 86_400_000) / 1000);

    const params: Record<string, unknown> = {
      accepted: true,
      sort: 'votes',
      order: 'desc',
      fromdate: oneWeekAgo,
      site: 'stackoverflow',
      pagesize: limit * 3, // Fetch more to allow for random sampling
      filter: 'default',
    };

    // API key is optional — improves rate limits
    if (process.env.SO_API_KEY) {
      params.key = process.env.SO_API_KEY;
    }

    try {
      const { data } = await axios.get<SOResponse>(`${this.BASE}/search/advanced`, {
        params,
        timeout: 10000,
      });

      // Quality gate: score > 10, must have accepted answer
      const valid = data.items.filter((q) => q.score > 10 && q.is_answered);

      if (valid.length) {
        // Shuffle
        for (let i = valid.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [valid[i], valid[j]] = [valid[j], valid[i]];
        }
        return valid.slice(0, limit);
      }
    } catch (err) {
      console.warn('[SOIntegration] Fetch failed:', err instanceof Error ? err.message : err);
    }

    // Fallback: broaden to last 30 days, lower threshold
    return this.getTopFallback(limit);
  }

  private static async getTopFallback(limit: number): Promise<SOQuestionData[]> {
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 86_400_000) / 1000);

    const params: Record<string, unknown> = {
      accepted: true,
      sort: 'votes',
      order: 'desc',
      fromdate: thirtyDaysAgo,
      site: 'stackoverflow',
      pagesize: limit * 2,
      filter: 'default',
    };
    if (process.env.SO_API_KEY) params.key = process.env.SO_API_KEY;

    try {
      const { data } = await axios.get<SOResponse>(`${this.BASE}/search/advanced`, {
        params,
        timeout: 10000,
      });

      const valid = data.items.filter((q) => q.is_answered);
      if (!valid.length) return [];
      
      // Shuffle
      for (let i = valid.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [valid[i], valid[j]] = [valid[j], valid[i]];
      }
      return valid.slice(0, limit);
    } catch (err) {
      console.warn('[SOIntegration] Fallback fetch failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
