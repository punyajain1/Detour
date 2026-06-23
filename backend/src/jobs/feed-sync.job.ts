import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { runShuffle } from './shuffle.job';
import { v4 as uuid } from 'uuid';

import { NasaIntegration } from '../integrations/nasa.integration';
import { NasaMarsIntegration } from '../integrations/nasa-mars.integration';
import { NasaNeoWsIntegration } from '../integrations/nasa-neows.integration';
import { GitHubIntegration } from '../integrations/github.integration';
import { HNIntegration } from '../integrations/hackernews.integration';
import { SOIntegration } from '../integrations/stackoverflow.integration';
import { LeetCodeIntegration } from '../integrations/leetcode.integration';
import { SpaceNewsIntegration } from '../integrations/space-news.integration';
import { JwstIntegration } from '../integrations/jwst.integration';
import { ArxivIntegration } from '../integrations/arxiv.integration';
import { SystemDesignIntegration } from '../integrations/system-design.integration';
// New integrations
import { CratesIoIntegration } from '../integrations/crates-io.integration';
import { NpmRegistryIntegration } from '../integrations/npm-registry.integration';
import { PypiIntegration } from '../integrations/pypi.integration';
import { CodeforcesIntegration } from '../integrations/codeforces.integration';
import { CveIntegration } from '../integrations/cve.integration';
import { HuggingFaceIntegration } from '../integrations/huggingface.integration';
import { PapersWithCodeIntegration } from '../integrations/papers-with-code.integration';
import { SpaceWeatherIntegration } from '../integrations/space-weather.integration';
import { NasaExoplanetsIntegration } from '../integrations/nasa-exoplanets.integration';
import { NasaImageLibraryIntegration } from '../integrations/nasa-image-library.integration';
import { LobstersIntegration } from '../integrations/lobsters.integration';

import {
  FeedCard,
  APODData,
  SOQuestionData,
  LCDailyChallengeData,
  SpaceNewsData,
  JWSTData,
  ArxivData,
  SystemDesignData,
} from '../types/feed.types';

export function startFeedSyncJob(): void {
  cron.schedule(
    '0 */6 * * *',
    async () => {
      try {
        const result = await runFeedSync();
        console.log(`[CRON] Sync done in ${(result.durationMs / 1000).toFixed(1)}s — inserted ${result.inserted}, pruned ${result.deleted}`);
      } catch (err) {
        console.error('[CRON] Feed sync failed:', err);
      }
    },
    { timezone: 'UTC' }
  );
}

export const SOURCE_FETCHERS: Record<string, () => Promise<FeedCard[]>> = {
  // ─── Existing sources ───────────────────────────────────
  nasa_apod: () => NasaIntegration.getLatestAPODs(10).then(a => a.map(apodToCard)),
  nasa_mars: () => NasaMarsIntegration.getLatestPhotos(50),
  nasa_neows: () => NasaNeoWsIntegration.getTodaysCloseApproaches(50),
  github: () => Promise.all([
    GitHubIntegration.getTrendingBatch(50, 'programming'),
    GitHubIntegration.getTrendingBatch(50, 'startups'),
    GitHubIntegration.getTrendingBatch(50, 'ai'),
  ]).then(r => r.flat()),
  hackernews: () => Promise.all([
    HNIntegration.getStoriesBatch(20, 'ai'),
    HNIntegration.getStoriesBatch(20, 'startups'),
    HNIntegration.getStoriesBatch(20, 'all'),
  ]).then(r => r.flat()),
  stackoverflow: () => SOIntegration.getRandomTop(20).then(so => so.map(soToCard)),
  leetcode: () => LeetCodeIntegration.getDailyChallenge().then(lc => [leetCodeToCard(lc)]),
  space_news: () => Promise.all([
    SpaceNewsIntegration.getLatestArticles(50),
    SpaceNewsIntegration.getLatestBlogs(50),
  ]).then(([a, b]) => [...a, ...b].map(spaceNewsToCard)),
  jwst: () => JwstIntegration.getLatestImages(50).then(imgs => imgs.map(jwstToCard)),
  arxiv: () => ArxivIntegration.getRandomPapers(20).then(papers => papers.map(arxivToCard)),
  system_design: () => SystemDesignIntegration.getSystemDesignFeeds(50).then(feeds => feeds.map(systemDesignToCard)),

  // ─── New: HN variants ────────────────────────────────────
  ask_hn: () => HNIntegration.getAskHNBatch(30),
  show_hn: () => HNIntegration.getShowHNBatch(30),
  hn_job: () => HNIntegration.getJobsBatch(20),

  // ─── New: Dev ecosystem ──────────────────────────────────
  crates_io: () => CratesIoIntegration.getTrendingCrates(25),
  npm_package: () => NpmRegistryIntegration.getTrendingPackages(25),
  pypi_release: () => PypiIntegration.getLatestReleases(25),
  codeforces: () => CodeforcesIntegration.getRandomProblems(20),
  cve: () => CveIntegration.getHighSeverityCVEs(20),

  // ─── New: AI / ML ─────────────────────────────────────────
  huggingface: () => HuggingFaceIntegration.getTrendingModels(25),
  papers_with_code: () => PapersWithCodeIntegration.getLatestPapers(20),

  // ─── New: Space ──────────────────────────────────
  space_weather: () => SpaceWeatherIntegration.getAlerts(10),

  // ─── NASA Exoplanets & Image Library ───────────
  nasa_exoplanet: () => NasaExoplanetsIntegration.getRecentExoplanets(20),
  nasa_image_library: () => NasaImageLibraryIntegration.getSpaceImages(20),

  // ─── Lobste.rs ────────────────────────────────────
  lobsters: () => LobstersIntegration.getStoriesBatch(40),
};

export interface SyncResult {
  inserted: number;
  deleted: number;
  sources: string[];
  durationMs: number;
}

export async function runFeedSync(sources?: string[]): Promise<SyncResult> {
  const start = Date.now();
  const keys = sources?.length ? sources : Object.keys(SOURCE_FETCHERS);

  const fetches = keys.map(k => {
    const fn = SOURCE_FETCHERS[k];
    if (!fn) return Promise.resolve<FeedCard[]>([]);
    return fn().catch(err => {
      console.warn(`[Sync] "${k}" failed:`, err?.message ?? err);
      return [] as FeedCard[];
    });
  });

  const settled = await Promise.allSettled(fetches);
  const cards = settled.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  if (cards.length === 0) {
    return { inserted: 0, deleted: 0, sources: keys, durationMs: Date.now() - start };
  }

  const dataToInsert = cards.map(c => ({
    type: c.type,
    category: c.category,
    title: c.title,
    description: (c as any).description || '',
    url: (c as any).url || null,
    imageUrl: c.imageUrl || null,
    metadata: c.metadata ? JSON.parse(JSON.stringify(c.metadata)) : {},
    fetchedAt: new Date(c.fetchedAt),
    sortOrder: Math.random(),
  }));

  const { count: inserted } = await prisma.feedCard.createMany({ data: dataToInsert });

  // ── Per-type TTLs (full life before deletion) ─────────────────────────────
  // Values are derived from the "fades to half in" durations — each source's
  // content is kept alive for its full relevant lifespan before being pruned.
  const TYPE_TTL_HOURS: Record<string, number> = {
    // 🌌 Space & Science
    nasa_apod: 30,
    nasa_mars: 36,
    nasa_neows: 18,
    nasa_exoplanet: 2 * 24,   // ~2 days
    nasa_image_library: 2 * 24,   // ~2 days
    jwst: 24, // ~2.5 days
    space_news: 24,
    space_weather: 12,
    arxiv: 7 * 24,   // ~7 days

    // 💻 Programming & Tech
    github: 24,
    hackernews: 16,
    ask_hn: 24,
    show_hn: 24,
    hn_job: 7 * 24,
    stackoverflow: 36,
    leetcode: 24,
    system_design: 10 * 24,   // ~10 days
    papers_with_code: 7 * 24,   // ~7 days
    huggingface: 48,
    codeforces: 24,
    lobsters: 24,

    // 📦 Open-Source Ecosystem
    npm_package: 30,
    pypi_release: 30,
    crates_io: 30,

    // 🔐 Security
    cve: 5 * 24,   // ~5 days
  };

  // Fallback TTL for any type not explicitly listed
  const DEFAULT_TTL_HOURS = 29;

  // Group all known types and issue a targeted deleteMany per TTL bucket
  const allTypes = Object.keys(TYPE_TTL_HOURS);
  let deleted = 0;

  for (const type of allTypes) {
    const ttlHours = TYPE_TTL_HOURS[type];
    const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000);
    const { count } = await prisma.feedCard.deleteMany({
      where: { type, fetchedAt: { lt: cutoff } },
    });
    deleted += count;
  }

  // Catch-all: prune any card whose type isn't in the map after the default TTL
  const defaultCutoff = new Date(Date.now() - DEFAULT_TTL_HOURS * 60 * 60 * 1000);
  const { count: catchAllDeleted } = await prisma.feedCard.deleteMany({
    where: {
      type: { notIn: allTypes },
      fetchedAt: { lt: defaultCutoff },
    },
  });
  deleted += catchAllDeleted;

  await runShuffle();

  return { inserted, deleted, sources: keys, durationMs: Date.now() - start };
}

function apodToCard(apod: APODData): any {
  return {
    id: uuid(),
    type: 'nasa_apod',
    category: 'space',
    fetchedAt: new Date().toISOString(),
    title: apod.title,
    description: apod.explanation.slice(0, 500),
    imageUrl: apod.url,
    url: apod.hdurl ?? apod.url,
    metadata: {
      date: apod.date,
      mediaType: apod.media_type,
      copyright: apod.copyright?.trim() ?? undefined,
      hdImageUrl: apod.hdurl ?? undefined,
    },
  };
}

function leetCodeToCard(lc: LCDailyChallengeData): any {
  return {
    id: uuid(),
    type: 'leetcode',
    category: 'programming',
    fetchedAt: new Date().toISOString(),
    title: lc.title,
    description: (lc.content ?? '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 400),
    url: `https://leetcode.com/problems/${lc.titleSlug}`,
    metadata: {
      difficulty: lc.difficulty,
      acceptanceRate: lc.acRate,
      topicTags: lc.topicTags,
      titleSlug: lc.titleSlug,
    },
  };
}

function soToCard(so: SOQuestionData): any {
  return {
    id: uuid(),
    type: 'stackoverflow',
    category: 'programming',
    fetchedAt: new Date().toISOString(),
    title: so.title,
    description: '',
    url: so.link,
    metadata: {
      score: so.score,
      answerCount: so.answer_count,
      tags: so.tags,
      isAnswered: so.is_answered,
    },
  };
}

function spaceNewsToCard(sn: SpaceNewsData): any {
  return {
    id: uuid(),
    type: 'space_news',
    category: 'space',
    fetchedAt: sn.published_at || new Date().toISOString(),
    title: sn.title,
    description: sn.summary,
    url: sn.url,
    imageUrl: sn.image_url,
    metadata: {
      newsSite: sn.news_site,
      publishedAt: sn.published_at,
    },
  };
}

function jwstToCard(jwst: JWSTData): any {
  return {
    id: uuid(),
    type: 'jwst',
    category: 'space',
    fetchedAt: new Date().toISOString(),
    title: `Space Telescope: ${jwst.observation_id}`,
    description: jwst.details?.description || `Image from ${jwst.details?.mission ?? 'NASA Observatory'}.`,
    url: jwst.location,
    imageUrl: jwst.location,
    metadata: {
      mission: jwst.details?.mission ?? 'JWST',
      observationId: jwst.observation_id,
      instruments: jwst.details?.instruments?.map(i => i.instrument) ?? [],
    },
  };
}

function arxivToCard(arxiv: ArxivData): any {
  let category = 'science';
  if (arxiv.category.startsWith('cs.')) category = 'ai';
  if (arxiv.category === 'math.PR' || arxiv.category === 'stat.ML') category = 'programming';

  return {
    id: uuid(),
    type: 'arxiv',
    category,
    fetchedAt: new Date().toISOString(),
    title: arxiv.title,
    description: arxiv.summary.slice(0, 500) + (arxiv.summary.length > 500 ? '...' : ''),
    url: arxiv.html_url,
    metadata: {
      authors: arxiv.authors,
      pdfUrl: arxiv.pdf_url,
      publishedAt: arxiv.published_at,
      arxivCategory: arxiv.category,
    },
  };
}

function systemDesignToCard(sd: SystemDesignData): any {
  return {
    id: sd.id,
    type: 'system_design',
    category: 'programming',
    fetchedAt: new Date().toISOString(),
    title: sd.title,
    description: sd.summary,
    url: sd.url,
    metadata: {
      source: sd.sourceType,
      authorOrCompany: sd.authorOrCompany,
      publishedAt: sd.published_at,
      tags: sd.tags || [],
    },
  };
}
