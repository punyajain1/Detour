// ─────────────────────────────────────────────
// Feed Card Types — Discriminated Union
// ─────────────────────────────────────────────

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
  | 'jwst';

/** Base fields every card must have */
interface FeedCardBase {
  id: string;
  type: FeedCardType;
  category: FeedCategory;
  fetchedAt: string; // ISO timestamp
  imageUrl?: string;
}

// ─── NASA APOD ───────────────────────────────

export interface NasaApodCard extends FeedCardBase {
  type: 'nasa_apod';
  category: 'space';
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

// ─── NASA Mars Rover ─────────────────────────

export interface NasaMarsCard extends FeedCardBase {
  type: 'nasa_mars';
  category: 'space';
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  metadata: {
    rover: string;       // Curiosity | Perseverance | Opportunity
    camera: string;      // FHAZ | RHAZ | MAST | CHEMCAM | etc.
    sol: number;         // Martian sol (day)
    earthDate: string;
    photoId: number;
  };
}

// ─── NASA NeoWs (Near Earth Objects) ─────────

export interface NasaNeoWsCard extends FeedCardBase {
  type: 'nasa_neows';
  category: 'space';
  title: string;         // e.g. "Asteroid 2024 YR4 is passing by today"
  description: string;
  url: string;
  metadata: {
    neoId: string;
    isPotentiallyHazardous: boolean;
    estimatedDiameterMinKm: number;
    estimatedDiameterMaxKm: number;
    closestApproachDate: string;
    missDistanceKm: number;
    relativeVelocityKmh: number;
    absoluteMagnitude: number;
    orbitingBody: string;
  };
}

// ─── GitHub Trending ──────────────────────────

export interface GitHubCard extends FeedCardBase {
  type: 'github';
  category: 'programming' | 'ai' | 'startups';
  title: string;         // owner/repo
  description: string;
  url: string;
  metadata: {
    stars: number;
    language: string | null;
    topics: string[];
    starsRecent: number; // stars gained recently (approximated)
    owner: string;
    repo: string;
  };
}

// ─── LeetCode Daily Challenge ─────────────────

export interface LeetCodeCard extends FeedCardBase {
  type: 'leetcode';
  category: 'programming';
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

// ─── Hacker News ──────────────────────────────

export interface HackerNewsCard extends FeedCardBase {
  type: 'hackernews';
  category: 'startups' | 'ai' | 'programming' | 'all';
  title: string;
  description: string;   // empty string (HN has no body text)
  url: string;
  metadata: {
    points: number;
    comments: number;
    hoursAgo: number;
    hnId: string;
    source?: string;     // domain of the article (e.g. "techcrunch.com")
  };
}

// ─── Stack Overflow ───────────────────────────

export interface StackOverflowCard extends FeedCardBase {
  type: 'stackoverflow';
  category: 'programming';
  title: string;
  description: string;   // empty string
  url: string;
  metadata: {
    score: number;
    answerCount: number;
    tags: string[];
    isAnswered: boolean;
  };
}


// ─── Space News (SNAPI) ──────────────────────

export interface SpaceNewsCard extends FeedCardBase {
  type: 'space_news';
  category: 'space';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata: {
    newsSite: string;
    publishedAt: string;
  };
}

// ─── JWST Images ─────────────────────────────

export interface JwstCard extends FeedCardBase {
  type: 'jwst';
  category: 'space';
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

// ─────────────────────────────────────────────
// Union & Pagination
// ─────────────────────────────────────────────

export type FeedCard =
  | NasaApodCard
  | NasaMarsCard
  | NasaNeoWsCard
  | GitHubCard
  | LeetCodeCard
  | HackerNewsCard
  | StackOverflowCard
  | SpaceNewsCard
  | JwstCard;

export interface FeedPage {
  cards: FeedCard[];
  nextCursor: string | null;
  hasMore: boolean;
  totalFetched: number;
}

/** Decoded cursor payload — encoded as base64 JSON */
export interface FeedCursor {
  page: number;
  seed: string;
  category: FeedCategory;
  type?: string;
}

export interface FeedSourcesResponse {
  categories: FeedCategory[];
  sources: FeedCardType[];
}

// ─────────────────────────────────────────────
// Raw integration return types
// ─────────────────────────────────────────────

export interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  date: string;
  copyright?: string;
}

export interface GHRepoData {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  starsIn48h: number;
}

export interface HNStoryData {
  objectID: string;
  title: string;
  url?: string;
  points: number;
  num_comments: number;
  created_at: string;
  hoursAgo: number;
  velocity: number;
}

export interface SOQuestionData {
  title: string;
  link: string;
  score: number;
  answer_count: number;
  tags: string[];
  is_answered: boolean;
}

export interface LCDailyChallengeData {
  titleSlug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acRate: number;
  topicTags: Array<{ name: string; slug: string }>;
  content?: string;
}

export interface SpaceNewsData {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
}

export interface JWSTData {
  id: string;
  observation_id: string;
  program: number;
  details: {
    mission: string;
    instruments: Array<{ instrument: string }>;
    suffix: string;
    description: string;
  };
  file_type: string;
  thumbnail: string;
  location: string;
}
