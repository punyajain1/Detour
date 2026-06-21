import axios from 'axios';
import { LobstersCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

/** Shape of a single story from lobste.rs JSON endpoints */
interface LobstersStory {
  short_id: string;
  short_id_url: string;
  created_at: string;
  title: string;
  url: string;
  score: number;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  description: string;         // HTML body (text posts have this; link posts may be empty)
  description_plain: string;   // Plain-text version
  comments_url: string;
  submitter_user: {
    username: string;
    created_at: string;
    karma: number;
    avatar_url: string;
    invited_by_user?: string;
    github_username?: string;
    twitter_username?: string;
  };
  tags: string[];
  is_expired: boolean;
  user_is_author?: boolean;
}

type LobstersFeed = LobstersStory[];

// Map Lobste.rs tags → Detour categories
function inferCategory(tags: string[]): LobstersCard['category'] {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  if (tagSet.has('ai') || tagSet.has('ml') || tagSet.has('llm') || tagSet.has('machinelearning')) return 'ai';
  if (tagSet.has('astronomy') || tagSet.has('space') || tagSet.has('physics')) return 'science';
  if (
    tagSet.has('javascript') || tagSet.has('python') || tagSet.has('rust') ||
    tagSet.has('go') || tagSet.has('c') || tagSet.has('ruby') || tagSet.has('java') ||
    tagSet.has('webdev') || tagSet.has('programming') || tagSet.has('devops') ||
    tagSet.has('security') || tagSet.has('networking') || tagSet.has('databases')
  ) return 'programming';
  if (tagSet.has('show') || tagSet.has('ask') || tagSet.has('meta')) return 'all';
  return 'programming'; // default for the computing community
}

function storyToCard(story: LobstersStory): LobstersCard {
  const hoursAgo = Math.round(
    (Date.now() - new Date(story.created_at).getTime()) / 3_600_000
  );

  // Prefer the external URL; fall back to the Lobste.rs comments page
  const url = story.url || story.comments_url;

  const description = (story.description_plain || story.description.replace(/<[^>]+>/g, ''))
    .trim()
    .slice(0, 300);

  return {
    id: uuid(),
    type: 'lobsters',
    category: inferCategory(story.tags),
    fetchedAt: new Date().toISOString(),
    title: story.title,
    description,
    url,
    metadata: {
      shortId: story.short_id,
      score: story.score,
      comments: story.comment_count,
      hoursAgo,
      tags: story.tags,
      submitter: story.submitter_user.username,
      commentsUrl: story.comments_url,
      domain: story.url ? extractDomain(story.url) : 'lobste.rs',
    },
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export class LobstersIntegration {
  private static BASE = 'https://lobste.rs';

  /**
   * Fetch the hottest stories from lobste.rs/hottest.json
   */
  static async getHottestStories(count: number = 25): Promise<LobstersCard[]> {
    return this.fetchFeed('hottest', count);
  }

  /**
   * Fetch the newest stories from lobste.rs/newest.json
   */
  static async getNewestStories(count: number = 25): Promise<LobstersCard[]> {
    return this.fetchFeed('newest', count);
  }

  /**
   * Combined batch: hottest + newest, de-duplicated by short_id.
   */
  static async getStoriesBatch(count: number = 40): Promise<LobstersCard[]> {
    try {
      const [hottest, newest] = await Promise.allSettled([
        this.getHottestStories(Math.ceil(count * 0.6)),
        this.getNewestStories(Math.ceil(count * 0.4)),
      ]);

      const seen = new Set<string>();
      const cards: LobstersCard[] = [];

      for (const result of [hottest, newest]) {
        if (result.status === 'fulfilled') {
          for (const card of result.value) {
            const shortId = (card.metadata as LobstersCard['metadata']).shortId;
            if (!seen.has(shortId)) {
              seen.add(shortId);
              cards.push(card);
            }
          }
        }
      }

      return cards.slice(0, count);
    } catch (err) {
      console.warn('[Lobsters] getStoriesBatch failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private static async fetchFeed(
    endpoint: 'hottest' | 'newest',
    count: number
  ): Promise<LobstersCard[]> {
    try {
      const { data } = await axios.get<LobstersFeed>(
        `${this.BASE}/${endpoint}.json`,
        {
          timeout: 12_000,
          headers: {
            'User-Agent': 'Detour-Feed/1.0 (tech aggregator; contact via GitHub)',
          },
        }
      );

      if (!Array.isArray(data) || data.length === 0) return [];

      return data
        .filter((s) => !s.is_expired && s.title)
        .slice(0, count)
        .map(storyToCard);
    } catch (err) {
      console.warn(`[Lobsters] fetchFeed(${endpoint}) failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }
}
