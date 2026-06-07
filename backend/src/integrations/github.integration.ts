import axios from 'axios';
import { GHRepoData, GitHubCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

const OSSINSIGHT_BASE = 'https://api.ossinsight.io/v1';
const GITHUB_API_BASE = 'https://api.github.com';

export type GHSortMode = 'trending' | 'top_stars';

export type GHDailyParam =
  | 'stars'
  | 'forks'
  | 'pushes'
  | 'pull_requests'
  | 'score'
  | 'contributors';

export interface GHDailySnapshot {
  param: GHDailyParam;
  label: string;
  cards: GitHubCard[];
}

type GHFeedCategory = 'ai' | 'startups' | 'programming';
type TrendPeriod = 'past_24_hours' | 'past_week' | 'past_month' | 'past_3_months';

const CATEGORY_LANGUAGE: Record<GHFeedCategory, string> = {
  ai:          'Python',
  startups:    'All',
  programming: 'All',
};

const CATEGORY_QUERY: Record<GHFeedCategory, string> = {
  ai:          'topic:machine-learning OR topic:llm OR topic:deep-learning OR topic:artificial-intelligence',
  startups:    'stars:>500',
  programming: 'stars:>1000',
};

const PARAM_LABEL: Record<GHDailyParam, string> = {
  stars:         '⭐ Stars Today',
  forks:         '🍴 Forks Today',
  pushes:        '📦 Pushes Today',
  pull_requests: '🔀 Pull Requests Today',
  score:         '🏆 Daily Score',
  contributors:  '👥 Contributors Today',
};

const PARAM_FIELD: Record<GHDailyParam, keyof OSSInsightRow> = {
  stars:         'stars',
  forks:         'forks',
  pushes:        'pushes',
  pull_requests: 'pull_requests',
  score:         'total_score',
  contributors:  'contributor_logins',
};

interface OSSInsightRow {
  repo_id:            string;
  repo_name:          string;
  primary_language:   string;
  description:        string;
  stars:              string;
  forks:              string;
  pull_requests:      string;
  pushes:             string;
  total_score:        string;
  contributor_logins: string;
  collection_names:   string;
}

interface OSSInsightResponse {
  type: string;
  data: {
    columns: Array<{ col: string; data_type: string; nullable: boolean }>;
    rows:    OSSInsightRow[];
    result:  { code: number; message: string; row_count: number };
  };
}

interface GHSearchItem {
  id:               number;
  full_name:        string;
  description:      string | null;
  stargazers_count: number;
  forks_count:      number;
  language:         string | null;
  topics:           string[];
  html_url:         string;
  pushed_at:        string;
}

interface GHSearchResponse {
  total_count:        number;
  incomplete_results: boolean;
  items:              GHSearchItem[];
}

function rowParamValue(row: OSSInsightRow, param: GHDailyParam): number {
  if (param === 'contributors') {
    return row.contributor_logins
      ? row.contributor_logins.split(',').filter(Boolean).length
      : 0;
  }
  return Number(row[PARAM_FIELD[param]]) || 0;
}

function ossRowToCard(repo: OSSInsightRow, feedCategory: GitHubCard['category']): GitHubCard {
  const [owner, repoName] = repo.repo_name.split('/');
  const stars = Number(repo.stars) || 0;
  const topics = repo.collection_names
    ? repo.collection_names.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    id: uuid(),
    type: 'github' as const,
    category: feedCategory,
    fetchedAt: new Date().toISOString(),
    title: repo.repo_name,
    description: repo.description ?? '',
    url: `https://github.com/${repo.repo_name}`,
    metadata: {
      stars,
      language: repo.primary_language || null,
      topics,
      starsRecent: stars,
      owner: owner ?? repo.repo_name,
      repo: repoName ?? repo.repo_name,
    },
  };
}

export class GitHubIntegration {
  private static async fetchTrending(
    language = 'All',
    period: TrendPeriod = 'past_24_hours',
    limit = 100
  ): Promise<OSSInsightRow[]> {
    const { data } = await axios.get<OSSInsightResponse>(
      `${OSSINSIGHT_BASE}/trends/repos/`,
      { params: { period, language }, timeout: 12000, headers: { Accept: 'application/json' } }
    );
    return (data?.data?.rows ?? []).filter((r) => r.repo_name && r.description).slice(0, limit);
  }

  private static async fetchTopByStars(category: GHFeedCategory, limit = 25): Promise<GHSearchItem[]> {
    const langQualifier = CATEGORY_LANGUAGE[category] !== 'All' ? ` language:${CATEGORY_LANGUAGE[category]}` : '';
    const { data } = await axios.get<GHSearchResponse>(
      `${GITHUB_API_BASE}/search/repositories`,
      {
        params: { q: `${CATEGORY_QUERY[category]}${langQualifier}`, sort: 'stars', order: 'desc', per_page: Math.min(limit, 100) },
        timeout: 12000,
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
      }
    );
    return (data?.items ?? []).filter((r) => r.full_name && r.description);
  }

  static async getTrending(): Promise<GHRepoData> {
    const rows = await this.fetchTrending('All', 'past_24_hours', 10);
    if (!rows.length) throw new Error('[GitHubIntegration] No trending repos returned');
    const top = rows[0];
    return {
      full_name:         top.repo_name,
      name:              top.repo_name.split('/')[1] ?? top.repo_name,
      description:       top.description,
      html_url:          `https://github.com/${top.repo_name}`,
      stargazers_count:  Number(top.stars) || 0,
      language:          top.primary_language || null,
      topics:            top.collection_names ? top.collection_names.split(',').map((s) => s.trim()).filter(Boolean) : [],
      starsIn48h:        Number(top.stars) || 0,
    };
  }

  static async getTrendingBatch(
    count: number,
    category: GHFeedCategory = 'programming',
    sortBy: GHSortMode = 'trending'
  ): Promise<GitHubCard[]> {
    const feedCategory =
      category === 'ai' ? 'ai' : category === 'startups' ? 'startups' : 'programming';

    if (sortBy === 'top_stars') {
      const items = await this.fetchTopByStars(category, count).catch(() => []);
      return items.slice(0, count).map((repo) => {
        const [owner, repoName] = repo.full_name.split('/');
        return {
          id: uuid(),
          type: 'github' as const,
          category: feedCategory as GitHubCard['category'],
          fetchedAt: new Date().toISOString(),
          title: repo.full_name,
          description: repo.description ?? '',
          url: repo.html_url,
          metadata: {
            stars:       repo.stargazers_count,
            language:    repo.language ?? null,
            topics:      repo.topics ?? [],
            starsRecent: repo.stargazers_count,
            owner:       owner ?? repo.full_name,
            repo:        repoName ?? repo.full_name,
          },
        };
      });
    }

    let rows = await this.fetchTrending(CATEGORY_LANGUAGE[category], 'past_24_hours', count * 2).catch(() => []);

    if (rows.length < count) {
      const fallback = await this.fetchTrending(CATEGORY_LANGUAGE[category], 'past_week', count * 2).catch(() => []);
      const seen = new Set(rows.map((r) => r.repo_id));
      rows = [...rows, ...fallback.filter((r) => !seen.has(r.repo_id))];
    }

    if (!rows.length) return [];

    if (category === 'ai') {
      const AI_KEYWORDS = ['ai', 'machine-learning', 'llm', 'deep-learning', 'neural'];
      rows = rows.sort((a, b) => {
        const aIsAI = AI_KEYWORDS.some((kw) => (a.collection_names + ' ' + a.description).toLowerCase().includes(kw));
        const bIsAI = AI_KEYWORDS.some((kw) => (b.collection_names + ' ' + b.description).toLowerCase().includes(kw));
        if (aIsAI && !bIsAI) return -1;
        if (!aIsAI && bIsAI) return 1;
        return Number(b.total_score) - Number(a.total_score);
      });
    }

    return rows.slice(0, count).map((r) => ossRowToCard(r, feedCategory as GitHubCard['category']));
  }

  static async getDailyTopByAllParams(
    count: number = 10,
    category: GHFeedCategory = 'programming'
  ): Promise<GHDailySnapshot[]> {
    const feedCategory =
      category === 'ai' ? 'ai' : category === 'startups' ? 'startups' : 'programming';

    const pool = await this.fetchTrending(CATEGORY_LANGUAGE[category], 'past_24_hours', 100).catch(() => []);
    if (!pool.length) return [];

    const ALL_PARAMS: GHDailyParam[] = ['stars', 'forks', 'pushes', 'pull_requests', 'score', 'contributors'];

    return ALL_PARAMS.map((param) => {
      const cards = [...pool]
        .sort((a, b) => rowParamValue(b, param) - rowParamValue(a, param))
        .slice(0, count)
        .map((r) => ossRowToCard(r, feedCategory as GitHubCard['category']));
      return { param, label: PARAM_LABEL[param], cards };
    });
  }

  static async getDailyTopByParam(
    param: GHDailyParam,
    count: number = 10,
    category: GHFeedCategory = 'programming'
  ): Promise<GHDailySnapshot> {
    const feedCategory =
      category === 'ai' ? 'ai' : category === 'startups' ? 'startups' : 'programming';

    const pool = await this.fetchTrending(CATEGORY_LANGUAGE[category], 'past_24_hours', 100).catch(() => []);
    const cards = [...pool]
      .sort((a, b) => rowParamValue(b, param) - rowParamValue(a, param))
      .slice(0, count)
      .map((r) => ossRowToCard(r, feedCategory as GitHubCard['category']));

    return { param, label: PARAM_LABEL[param], cards };
  }
}
