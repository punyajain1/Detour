import axios from 'axios';
import { LCDailyChallengeData } from '../types/feed.types';

const ALFA_BASE = 'https://alfa-leetcode-api.onrender.com';

interface AlfaDailyResponse {
  questionLink: string;
  date: string;
  questionId: string;
  questionFrontendId: string;
  questionTitle: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isPaidOnly: boolean;
  question: string;
  topicTags?: Array<{ name: string; slug: string }>;
  acRate?: number;
}

export class LeetCodeIntegration {
  static async getDailyChallenge(): Promise<LCDailyChallengeData> {
    const { data } = await axios.get<AlfaDailyResponse>(`${ALFA_BASE}/daily`, {
      timeout: 12000,
      headers: { Accept: 'application/json', 'User-Agent': 'SynthesisEngine/1.0' },
    });

    if (!data?.questionTitle) {
      throw new Error('LeetCode daily challenge unavailable');
    }

    return {
      title: data.questionTitle,
      titleSlug: data.titleSlug,
      difficulty: data.difficulty,
      acRate: data.acRate ?? 0,
      topicTags: data.topicTags ?? [],
      content: data.question ?? '',
    } as LCDailyChallengeData;
  }
}
