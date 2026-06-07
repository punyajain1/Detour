import cron from 'node-cron';
import { prisma } from '../lib/prisma';
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
import { FeedCard, APODData, SOQuestionData, LCDailyChallengeData, SpaceNewsData, JWSTData } from '../types/feed.types';

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
  nasa_apod:     () => NasaIntegration.getLatestAPODs(10).then(a => a.map(apodToCard)),
  nasa_mars:     () => NasaMarsIntegration.getLatestPhotos(50),
  nasa_neows:    () => NasaNeoWsIntegration.getTodaysCloseApproaches(50),
  github:        () => Promise.all([
    GitHubIntegration.getTrendingBatch(50, 'programming'),
    GitHubIntegration.getTrendingBatch(50, 'startups'),
    GitHubIntegration.getTrendingBatch(50, 'ai'),
  ]).then(r => r.flat()),
  hackernews:    () => HNIntegration.getStoriesBatch(50, 'all'),
  stackoverflow: () => SOIntegration.getTopThisWeek().then(so => [soToCard(so)]),
  leetcode:      () => LeetCodeIntegration.getDailyChallenge().then(lc => [leetCodeToCard(lc)]),
  space_news:    () => Promise.all([
    SpaceNewsIntegration.getLatestArticles(50),
    SpaceNewsIntegration.getLatestBlogs(50),
  ]).then(([a, b]) => [...a, ...b].map(spaceNewsToCard)),
  jwst:          () => JwstIntegration.getLatestImages(50).then(imgs => imgs.map(jwstToCard)),
};

export interface SyncResult {
  inserted:   number;
  deleted:    number;
  sources:    string[];
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
  const cards   = settled.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  if (cards.length === 0) {
    return { inserted: 0, deleted: 0, sources: keys, durationMs: Date.now() - start };
  }

  const dataToInsert = cards.map(c => ({
    type:        c.type,
    category:    c.category,
    title:       c.title,
    description: (c as any).description || '',
    url:         (c as any).url || null,
    imageUrl:    c.imageUrl || null,
    metadata:    c.metadata ? JSON.parse(JSON.stringify(c.metadata)) : {},
    fetchedAt:   new Date(c.fetchedAt),
  }));

  const { count: inserted } = await prisma.feedCard.createMany({ data: dataToInsert });

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { count: deleted } = await prisma.feedCard.deleteMany({
    where: { fetchedAt: { lt: cutoff } },
  });

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
      difficulty:     lc.difficulty,
      acceptanceRate: lc.acRate,
      topicTags:      lc.topicTags,
      titleSlug:      lc.titleSlug,
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
      score:       so.score,
      answerCount: so.answer_count,
      tags:        so.tags,
      isAnswered:  so.is_answered,
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
      newsSite:    sn.news_site,
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
      mission:       jwst.details?.mission ?? 'JWST',
      observationId: jwst.observation_id,
      instruments:   jwst.details?.instruments?.map(i => i.instrument) ?? [],
    },
  };
}
