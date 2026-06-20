export type FeedCategory = 'all' | 'space' | 'programming' | 'startups' | 'ai' | 'science';

export type FeedCardType =
  | 'nasa_apod'
  | 'nasa_mars'
  | 'nasa_neows'
  | 'nasa_exoplanet'
  | 'nasa_image_library'
  | 'github'
  | 'leetcode'
  | 'hackernews'
  | 'ask_hn'
  | 'show_hn'
  | 'hn_job'
  | 'stackoverflow'
  | 'space_news'
  | 'jwst'
  | 'arxiv'
  | 'system_design'
  | 'crates_io'
  | 'npm_package'
  | 'pypi_release'
  | 'codeforces'
  | 'cve'
  | 'huggingface'
  | 'papers_with_code'
  | 'space_weather';

export interface FeedCardBase {
  id: string;
  type: FeedCardType;
  category: FeedCategory;
  fetchedAt: string; // ISO timestamp
  imageUrl?: string;
}

// ─── NASA APOD ────────────────────────────────

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

// ─── GitHub Trending ──────────────────────────

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

// ─── Hacker News ──────────────────────────────

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

export interface AskHNCard extends FeedCardBase {
  type: 'ask_hn';
  title: string;
  description: string;
  url: string;
  metadata: {
    points: number;
    comments: number;
    hoursAgo: number;
    hnId: string;
  };
}

export interface ShowHNCard extends FeedCardBase {
  type: 'show_hn';
  title: string;
  description: string;
  url: string;
  metadata: {
    points: number;
    comments: number;
    hoursAgo: number;
    hnId: string;
  };
}

export interface HNJobCard extends FeedCardBase {
  type: 'hn_job';
  title: string;
  description: string;
  url: string;
  metadata: {
    hoursAgo: number;
    hnId: string;
    company?: string;
  };
}

// ─── Stack Overflow ───────────────────────────

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

// ─── LeetCode ─────────────────────────────────

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

// ─── Space News ───────────────────────────────

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

// ─── JWST ─────────────────────────────────────

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

// ─── ArXiv ────────────────────────────────────

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

// ─── System Design ────────────────────────────

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

// ─── NASA Mars / NeoWs fallback ───────────────

export interface GenericNasaCard extends FeedCardBase {
  type: 'nasa_mars' | 'nasa_neows';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata: any;
}

// ─── Crates.io ────────────────────────────────

export interface CratesIoCard extends FeedCardBase {
  type: 'crates_io';
  category: 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    crateName: string;
    version: string;
    downloads: number;
    recentDownloads: number;
    repository?: string;
    keywords: string[];
  };
}

// ─── npm Package ──────────────────────────────

export interface NpmPackageCard extends FeedCardBase {
  type: 'npm_package';
  category: 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    packageName: string;
    version: string;
    weeklyDownloads: number;
    author?: string;
    keywords: string[];
  };
}

// ─── PyPI Release ─────────────────────────────

export interface PypiReleaseCard extends FeedCardBase {
  type: 'pypi_release';
  category: 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    packageName: string;
    version: string;
    author?: string;
    publishedAt: string;
  };
}

// ─── Codeforces ───────────────────────────────

export interface CodeforcesCard extends FeedCardBase {
  type: 'codeforces';
  category: 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    contestId: number;
    index: string;
    rating?: number;
    tags: string[];
    solvedCount?: number;
  };
}

// ─── CVE ──────────────────────────────────────

export interface CveCard extends FeedCardBase {
  type: 'cve';
  category: 'programming';
  title: string;
  description: string;
  url: string;
  metadata: {
    cveId: string;
    cvssScore?: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    publishedAt: string;
    affectedProducts: string[];
  };
}

// ─── Hugging Face ─────────────────────────────

export interface HuggingFaceCard extends FeedCardBase {
  type: 'huggingface';
  category: 'ai';
  title: string;
  description: string;
  url: string;
  metadata: {
    modelId: string;
    author: string;
    downloads: number;
    likes: number;
    tags: string[];
    pipeline?: string;
    updatedAt: string;
  };
}

// ─── Papers With Code ─────────────────────────

export interface PapersWithCodeCard extends FeedCardBase {
  type: 'papers_with_code';
  category: 'ai';
  title: string;
  description: string;
  url: string;
  metadata: {
    arxivId?: string;
    githubUrl?: string;
    stars?: number;
    publishedAt: string;
    tasks: string[];
    authors: string[];
  };
}

// ─── Space Weather ────────────────────────────

export interface SpaceWeatherCard extends FeedCardBase {
  type: 'space_weather';
  category: 'space';
  title: string;
  description: string;
  url: string;
  metadata: {
    kpIndex?: number;
    classification?: string;
    scale?: string;
    issuedAt: string;
    alertType: 'flare' | 'geomagnetic' | 'radiation' | 'general';
  };
}

// ─── NASA Exoplanet Archive ───────────────────

export interface NasaExoplanetCard extends FeedCardBase {
  type: 'nasa_exoplanet';
  category: 'space';
  title: string;
  description: string;
  url: string;
  metadata: {
    planetName: string;
    hostStar: string;
    discoveryMethod: string;
    discoveryYear: number;
    orbitalPeriodDays?: number;
    radiusEarthRadii?: number;
    massEarthMasses?: number;
    equilibriumTempK?: number;
    distanceParsecs?: number;
    stellarSpectralType?: string;
    facility?: string;
  };
}

// ─── NASA Image & Video Library ───────────────

export interface NasaImageLibraryCard extends FeedCardBase {
  type: 'nasa_image_library';
  category: 'space';
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  metadata: {
    nasaId: string;
    dateCreated: string;
    center?: string;
    keywords: string[];
    photographer?: string;
    location?: string;
    searchQuery: string;
  };
}

// ─────────────────────────────────────────────
// Discriminated Union
// ─────────────────────────────────────────────

export type FeedCard =
  | NasaApodCard
  | GitHubCard
  | HackerNewsCard
  | AskHNCard
  | ShowHNCard
  | HNJobCard
  | StackOverflowCard
  | LeetCodeCard
  | SpaceNewsCard
  | JwstCard
  | GenericNasaCard
  | ArxivCard
  | SystemDesignCard
  | CratesIoCard
  | NpmPackageCard
  | PypiReleaseCard
  | CodeforcesCard
  | CveCard
  | HuggingFaceCard
  | PapersWithCodeCard
  | SpaceWeatherCard
  | NasaExoplanetCard
  | NasaImageLibraryCard;

export interface FeedPage {
  cards: FeedCard[];
  nextCursor: string | null;
  hasMore: boolean;
  totalFetched: number;
}
