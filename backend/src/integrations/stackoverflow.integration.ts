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

  static async getTopThisWeek(): Promise<SOQuestionData> {
    const oneWeekAgo = Math.floor((Date.now() - 7 * 86_400_000) / 1000);

    const params: Record<string, unknown> = {
      accepted: true,
      sort: 'votes',
      order: 'desc',
      fromdate: oneWeekAgo,
      site: 'stackoverflow',
      pagesize: 20,
      filter: 'default',
    };

    // API key is optional — improves rate limits
    if (process.env.SO_API_KEY) {
      params.key = process.env.SO_API_KEY;
    }

    const { data } = await axios.get<SOResponse>(`${this.BASE}/search/advanced`, {
      params,
      timeout: 10000,
    });

    // Quality gate: score > 50, must have accepted answer
    const valid = data.items.filter((q) => q.score > 50 && q.is_answered);

    if (valid.length) return valid[0];

    // Fallback: broaden to last 30 days, lower threshold
    return this.getTopFallback();
  }

  private static async getTopFallback(): Promise<SOQuestionData> {
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 86_400_000) / 1000);

    const params: Record<string, unknown> = {
      accepted: true,
      sort: 'votes',
      order: 'desc',
      fromdate: thirtyDaysAgo,
      site: 'stackoverflow',
      pagesize: 10,
      filter: 'default',
    };
    if (process.env.SO_API_KEY) params.key = process.env.SO_API_KEY;

    const { data } = await axios.get<SOResponse>(`${this.BASE}/search/advanced`, {
      params,
      timeout: 10000,
    });

    const valid = data.items.filter((q) => q.is_answered);
    if (!valid.length) throw new Error('No Stack Overflow questions found');
    return valid[0];
  }
}
