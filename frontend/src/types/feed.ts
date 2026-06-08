export type FeedCategory = 'all' | 'space' | 'programming' | 'startups' | 'ai' | 'science';

export type FeedCardType =
  | 'nasa_apod'
  | 'nasa_mars'
  | 'nasa_neows'
  | 'github'
  | 'leetcode'
  | 'hackernews'
  | 'stackoverflow'
  | 'space_news'
  | 'jwst'
  | 'arxiv'
  | 'system_design';

export interface FeedCardBase {
  id: string;
  type: FeedCardType;
  category: FeedCategory;
  fetchedAt: string; // ISO timestamp
  imageUrl?: string;
}

export interface NasaApodCard extends FeedCardBase {
  type: 'nasa_apod';
  title: string;
  description: string;
  imageUrl: string;
  hdImageUrl?: string;
  url: string;
  metadata: {
    date: string;
    mediaType: 'image' | 'video';
    copyright?: string;
  };
}

export interface GitHubCard extends FeedCardBase {
  type: 'github';
  title: string;
  description: string;
  url: string;
  metadata: {
    stars: number;
    language: string | null;
    topics: string[];
    starsRecent: number;
    owner: string;
    repo: string;
  };
}

export interface HackerNewsCard extends FeedCardBase {
  type: 'hackernews';
  title: string;
  description: string;
  url: string;
  metadata: {
    points: number;
    comments: number;
    hoursAgo: number;
    hnId: string;
    source?: string;
  };
}

export interface StackOverflowCard extends FeedCardBase {
  type: 'stackoverflow';
  title: string;
  description: string;
  url: string;
  metadata: {
    score: number;
    answerCount: number;
    tags: string[];
    isAnswered: boolean;
  };
}

export interface LeetCodeCard extends FeedCardBase {
  type: 'leetcode';
  title: string;
  description: string;
  url: string;
  metadata: {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    acceptanceRate: number;
    topicTags: Array<{ name: string; slug: string }>;
    titleSlug: string;
  };
}

export interface SpaceNewsCard extends FeedCardBase {
  type: 'space_news';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata: {
    newsSite: string;
    publishedAt: string;
  };
}

export interface JwstCard extends FeedCardBase {
  type: 'jwst';
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  metadata: {
    program: number;
    observationId: string;
    mission: string;
    instruments: string[];
    fileType: string;
  };
}

export interface ArxivCard extends FeedCardBase {
  type: 'arxiv';
  category: 'science' | 'ai' | 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    authors: string[];
    pdfUrl?: string;
    publishedAt: string;
    arxivCategory: string;
  };
}

export interface SystemDesignCard extends FeedCardBase {
  type: 'system_design';
  category: 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    source: 'engineering_blog' | 'hackernews' | 'arxiv_paper';
    authorOrCompany: string;
    publishedAt?: string;
    readingTimeMinutes?: number;
    tags?: string[];
  };
}

// Fallback generic card for the rest
export interface GenericNasaCard extends FeedCardBase {
  type: 'nasa_mars' | 'nasa_neows';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata: any;
}

export type FeedCard =
  | NasaApodCard
  | GitHubCard
  | HackerNewsCard
  | StackOverflowCard
  | LeetCodeCard
  | SpaceNewsCard
  | JwstCard
  | GenericNasaCard
  | ArxivCard
  | SystemDesignCard;

export interface FeedPage {
  cards: FeedCard[];
  nextCursor: string | null;
  hasMore: boolean;
  totalFetched: number;
}
