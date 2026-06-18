import axios from 'axios';
import { CodeforcesCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

interface CFProblemStatistic {
  contestId: number;
  index: string;
  solvedCount: number;
}

interface CFResponse {
  status: 'OK' | 'FAILED';
  result: {
    problems: CFProblem[];
    problemStatistics: CFProblemStatistic[];
  };
}

export class CodeforcesIntegration {
  private static BASE = 'https://codeforces.com/api';

  static async getRandomProblems(count: number = 20): Promise<CodeforcesCard[]> {
    try {
      const { data } = await axios.get<CFResponse>(`${this.BASE}/problemset.problems`, {
        timeout: 12000,
      });

      if (data.status !== 'OK') return [];

      const { problems, problemStatistics } = data.result;

      // Build a map for solved counts
      const solvedMap = new Map<string, number>();
      for (const stat of problemStatistics) {
        solvedMap.set(`${stat.contestId}-${stat.index}`, stat.solvedCount);
      }

      // Filter: must have a rating and tags
      const rated = problems.filter(
        (p) => p.rating && p.tags.length > 0 && p.contestId
      );

      // Pick a random sample
      const shuffled = [...rated];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled.slice(0, count).map((p): CodeforcesCard => {
        const solvedCount = solvedMap.get(`${p.contestId}-${p.index}`) ?? 0;

        return {
          id: uuid(),
          type: 'codeforces',
          category: 'programming',
          fetchedAt: new Date().toISOString(),
          title: p.name,
          description: `A rated Codeforces problem (${p.rating ?? 'unrated'}) in contest ${p.contestId}. Tags: ${p.tags.join(', ')}.`,
          url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
          metadata: {
            contestId: p.contestId,
            index: p.index,
            rating: p.rating,
            tags: p.tags,
            solvedCount,
          },
        };
      });
    } catch (err) {
      console.warn('[Codeforces] Failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
