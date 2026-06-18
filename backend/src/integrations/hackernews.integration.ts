import axios from 'axios';
import { HNStoryData, HackerNewsCard, AskHNCard, ShowHNCard, HNJobCard } from '../types/feed.types';
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
    author?: string;
    story_text?: string; // body text present for Ask HN in Algolia
  }>;
}

/** Shape returned by the official HN Firebase REST API */
interface HNFirebaseItem {
  id: number;
  type: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
  by?: string;
  time: number;         // Unix timestamp
  title?: string;
  text?: string;        // HTML body (Ask HN questions, job posts)
  url?: string;         // External link (Show HN, regular stories)
  score?: number;
  descendants?: number; // total comment count
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
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

  /** Ask HN posts — community questions */
  static async getAskHNBatch(count: number): Promise<AskHNCard[]> {
    return this.fetchTaggedBatch('ask_hn', count) as Promise<AskHNCard[]>;
  }

  /** Show HN posts — things people built */
  static async getShowHNBatch(count: number): Promise<ShowHNCard[]> {
    return this.fetchTaggedBatch('show_hn', count) as Promise<ShowHNCard[]>;
  }

  /** HN job postings */
  static async getJobsBatch(count: number): Promise<HNJobCard[]> {
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
    try {
      const { data } = await axios.get<HNSearchResponse>(`${this.BASE}/search_by_date`, {
        params: {
          tags: 'job',
          numericFilters: `created_at_i>${oneWeekAgo}`,
          hitsPerPage: Math.min(count * 2, 50),
        },
        timeout: 10000,
      });

      return data.hits.filter((h) => h.title).slice(0, count).map((story) => {
        const hoursAgo = Math.round(
          (Date.now() - new Date(story.created_at).getTime()) / 3_600_000
        );

        return {
          id: uuid(),
          type: 'hn_job' as const,
          category: 'startups' as const,
          fetchedAt: new Date().toISOString(),
          title: story.title,
          description: '',
          url: story.url ?? `https://news.ycombinator.com/item?id=${story.objectID}`,
          metadata: {
            hoursAgo,
            hnId: story.objectID,
            company: story.author ?? undefined,
          },
        };
      });
    } catch (err) {
      console.warn('[HN] getJobsBatch failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Fetches Ask HN / Show HN using the **official Firebase API**.
   *
   * Flow:
   *  1. GET /v0/askstories.json or /v0/showstories.json → array of up to 200 IDs (already ranked)
   *  2. Hydrate the first `count * 3` IDs in parallel via /v0/item/<id>.json
   *  3. Map to typed cards with body text (Ask) or external URL + domain (Show)
   */
  private static async fetchTaggedBatch(
    tag: 'ask_hn' | 'show_hn',
    count: number
  ): Promise<(AskHNCard | ShowHNCard)[]> {
    const FIREBASE = 'https://hacker-news.firebaseio.com/v0';
    const listEndpoint = tag === 'ask_hn' ? 'askstories' : 'showstories';

    try {
      // Step 1: get ranked list of IDs
      const { data: ids } = await axios.get<number[]>(
        `${FIREBASE}/${listEndpoint}.json`,
        { timeout: 10_000 }
      );

      if (!ids || ids.length === 0) {
        console.warn(`[HN] ${listEndpoint}.json returned empty list`);
        return [];
      }

      // Step 2: hydrate items (fetch count*3 then filter/slice to count)
      const candidateIds = ids.slice(0, Math.min(count * 3, 60));
      const itemResults = await Promise.allSettled(
        candidateIds.map((id) =>
          axios.get<HNFirebaseItem>(`${FIREBASE}/item/${id}.json`, { timeout: 8_000 })
        )
      );

      const now = Date.now();
      const cards: (AskHNCard | ShowHNCard)[] = [];

      for (const result of itemResults) {
        if (result.status === 'rejected') continue;
        const item = result.value.data;

        // Skip deleted / dead / missing items
        if (!item || item.deleted || item.dead || !item.title) continue;

        const hoursAgo = Math.round((now - item.time * 1000) / 3_600_000);
        const hnUrl = `https://news.ycombinator.com/item?id=${item.id}`;
        const points = item.score ?? 0;
        const comments = item.descendants ?? 0;

        if (tag === 'ask_hn') {
          // Ask HN: always links to HN thread; description from body text
          const rawText = item.text ?? '';
          // Strip HTML tags for a readable plain-text description
          const description = rawText
            .replace(/<p>/gi, ' ')
            .replace(/<[^>]+>/g, '')
            .replace(/&#x27;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim()
            .slice(0, 300);

          cards.push({
            id: uuid(),
            type: 'ask_hn' as const,
            category: this.inferAskCategory(item.title),
            fetchedAt: new Date().toISOString(),
            title: item.title,
            description,
            url: hnUrl,
            metadata: { points, comments, hoursAgo, hnId: String(item.id) },
          } satisfies AskHNCard);
        } else {
          // Show HN: prefer the external URL they're showcasing
          const externalUrl = item.url ?? hnUrl;

          // Builders sometimes add a description in the text field
          const rawText = item.text ?? '';
          const description = rawText
            .replace(/<p>/gi, ' ')
            .replace(/<[^>]+>/g, '')
            .replace(/&#x27;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim()
            .slice(0, 300);

          cards.push({
            id: uuid(),
            type: 'show_hn' as const,
            category: this.inferShowCategory(item.title),
            fetchedAt: new Date().toISOString(),
            title: item.title,
            description,
            url: externalUrl,
            metadata: { points, comments, hoursAgo, hnId: String(item.id) },
          } satisfies ShowHNCard);
        }

        if (cards.length >= count) break;
      }

      return cards;
    } catch (err) {
      console.warn(`[HN] fetchTaggedBatch(${tag}) failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }

  /** Infer a category for Ask HN posts based on title keywords */
  private static inferAskCategory(
    title: string
  ): AskHNCard['category'] {
    const t = title.toLowerCase();
    if (/\b(ai|llm|gpt|ml|machine learning|deep learning|neural|claude|gemini|openai)\b/.test(t)) return 'ai';
    if (/\b(startup|founder|yc|saas|funding|raise|product|launch)\b/.test(t)) return 'startups';
    return 'programming';
  }

  /** Infer a category for Show HN posts based on title keywords */
  private static inferShowCategory(
    title: string
  ): ShowHNCard['category'] {
    const t = title.toLowerCase();
    if (/\b(ai|llm|gpt|ml|machine learning|deep learning|neural|claude|gemini|openai)\b/.test(t)) return 'ai';
    if (/\b(startup|saas|app|product|launch|tool|service)\b/.test(t)) return 'startups';
    return 'programming';
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
}
