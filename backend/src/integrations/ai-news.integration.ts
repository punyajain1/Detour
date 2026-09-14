import axios from 'axios';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import Parser from 'rss-parser';
import { v4 as uuid } from 'uuid';
import { AiNewsCard } from '../types/feed.types';
import { runWithConcurrencyLimit } from '../lib/concurrency';

// Use rss-parser for feeds that fast-xml-parser struggles with (CDATA, mixed content, entity expansion)
const RSS_PARSER_FEEDS = new Set([
  'Google AI Blog',
  'AWS AI',
]);

// Deduplication helpers
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'].forEach(p => u.searchParams.delete(p));
    return u.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleSimilarity(a: string, b: string): number {
  const wa = new Set(a.split(' ').filter(w => w.length > 3));
  const wb = new Set(b.split(' ').filter(w => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  for (const w of wa) { if (wb.has(w)) overlap++; }
  return overlap / Math.max(wa.size, wb.size);
}

function deduplicateItems(items: AiNewsCard[]): AiNewsCard[] {
  const seenUrls = new Set<string>();
  const seenTitles: string[] = [];
  const result: AiNewsCard[] = [];

  for (const item of items) {
    const normUrl = normalizeUrl(item.url);
    if (seenUrls.has(normUrl)) continue;

    const normTitle = normalizeTitle(item.title);
    const isDuplicateTitle = seenTitles.some(t => titleSimilarity(t, normTitle) > 0.75);
    if (isDuplicateTitle) continue;

    seenUrls.add(normUrl);
    seenTitles.push(normTitle);
    result.push(item);
  }
  return result;
}

interface FeedSource {
  company: string;
  url: string;
}

const AI_NEWS_FEEDS: FeedSource[] = [
  { company: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { company: 'Anthropic Blog', url: 'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml' },
  { company: 'Meta Engineering', url: 'https://engineering.fb.com/feed/' },
  { company: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/feed/' },
  { company: 'Apple ML Research', url: 'https://machinelearning.apple.com/rss.xml' },
  { company: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
  { company: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
  { company: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { company: 'NVIDIA AI', url: 'https://blogs.nvidia.com/feed/' },
  { company: 'AWS AI', url: 'https://aws.amazon.com/blogs/ai/feed/' },
  { company: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { company: 'VentureBeat', url: 'https://venturebeat.com/feed/', extraHeaders: { 'Cache-Control': 'max-age=3600' } } as any,
  { company: 'The Information', url: 'https://news.google.com/rss/search?q=site:theinformation.com+(OpenAI+OR+Anthropic+OR+Google+OR+Microsoft+OR+Meta+OR+Apple+OR+AI+OR+startup+OR+funding)&hl=en-US&gl=US&ceid=US:en' },
  { company: 'The Decoder', url: 'https://the-decoder.com/feed/' },
  { company: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed' },
  { company: 'IEEE Spectrum AI', url: 'https://news.google.com/rss/search?q=site:spectrum.ieee.org+(AI+OR+%22artificial+intelligence%22+OR+machine+learning)&hl=en-US&gl=US&ceid=US:en' },
  { company: 'Import AI', url: 'https://importai.substack.com/feed' },
  { company: 'Last Week in AI', url: 'https://lastweekin.ai/feed' },
  { company: 'AI Supremacy', url: 'https://www.ai-supremacy.com/feed' },
  { company: 'The Algorithmic Bridge', url: 'https://www.thealgorithmicbridge.com/feed' },
  
  // YouTube ATOM
  { company: 'OpenAI YouTube', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A' },
  { company: 'DeepMind YouTube', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCP7jMXSY2xbc3KCAE0MHQ-A' },
  { company: 'Anthropic YouTube', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrDwWp7EBBv4NwvScIpBDOA' },
  { company: 'NVIDIA YouTube', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCHuiy8bXnmK5nisYHUd1J5g' },
  { company: 'Greg Isenberg', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCPjNBjflYl0-HQtUvOx0Ibw' },
  { company: 'Two Minute Papers', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg' },
  { company: 'Matt Wolfe', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UChpleBmo18P08aKCIgti38g' },
  { company: 'Fireship', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA' }
];

export class AiNewsIntegration {
  public static async getAiNews(limitTotal = 100): Promise<AiNewsCard[]> {
    try {
      const allCards = await this.fetchAllRssAtomFeeds(limitTotal);

      // Sort newest first
      const sorted = allCards.sort((a, b) => {
        const da = new Date(a.metadata.publishedAt || a.fetchedAt).getTime();
        const db = new Date(b.metadata.publishedAt || b.fetchedAt).getTime();
        return db - da;
      });

      const deduped = deduplicateItems(sorted);
      return deduped.slice(0, limitTotal);
    } catch (err) {
      console.error('[AiNewsIntegration] Failed to fetch AI news:', err);
      return [];
    }
  }

  private static async fetchAllRssAtomFeeds(limitPerFeed: number): Promise<AiNewsCard[]> {
    const results = await runWithConcurrencyLimit(5, AI_NEWS_FEEDS, feed => {
      if (RSS_PARSER_FEEDS.has(feed.company)) {
        return this.fetchSingleFeedWithRssParser(feed, limitPerFeed);
      }
      return this.fetchSingleFeed(feed, limitPerFeed);
    });
    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  private static async fetchSingleFeed(feed: FeedSource, limit: number): Promise<AiNewsCard[]> {
    try {
      const extraHeaders = (feed as any).extraHeaders ?? {};
      const { data } = await axios.get(feed.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Detour/1.0 (https://detour.app; feed aggregator)',
          ...extraHeaders,
        },
      });
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        removeNSPrefix: true,
        processEntities: false, // fixes AWS AI entity expansion limit
      });
      const parsed = parser.parse(data);

      let cards: AiNewsCard[] = [];

      // RSS 2.0
      if (parsed.rss?.channel?.item) {
        const items = Array.isArray(parsed.rss.channel.item) 
          ? parsed.rss.channel.item 
          : [parsed.rss.channel.item];
        cards = items.map((item: any) => this.normalizeRssItem(item, feed)).filter((x: any) => x !== null) as AiNewsCard[];
      }
      // ATOM
      else if (parsed.feed?.entry) {
        const entries = Array.isArray(parsed.feed.entry) 
          ? parsed.feed.entry 
          : [parsed.feed.entry];
        cards = entries.map((entry: any) => this.normalizeAtomItem(entry, feed)).filter((x: any) => x !== null) as AiNewsCard[];
      }

      return cards.slice(0, limit);
    } catch (err) {
      console.warn(`[AiNewsIntegration] Fetch failed for ${feed.company}:`, err instanceof Error ? err.message : String(err));
      return [];
    }
  }

  /** rss-parser handles CDATA, mixed content and Google/YouTube feeds better than fast-xml-parser */
  private static async fetchSingleFeedWithRssParser(feed: FeedSource, limit: number): Promise<AiNewsCard[]> {
    try {
      const rssParser = new Parser({ timeout: 15000, maxRedirects: 5 });
      const parsed = await rssParser.parseURL(feed.url);

      return (parsed.items ?? []).slice(0, limit).map((item): AiNewsCard => ({
        id: uuid(),
        type: 'ai_news',
        category: 'ai',
        fetchedAt: new Date().toISOString(),
        title: item.title ?? 'Untitled',
        description: cheerio.load(item.contentSnippet ?? item.content ?? item.summary ?? '').text().trim().substring(0, 300),
        url: item.link ?? '',
        imageUrl: (item as any).enclosure?.url ?? (item as any)['media:thumbnail']?.['$']?.url,
        metadata: {
          source: feed.company,
          authorOrCompany: item.creator ?? feed.company,
          publishedAt: item.isoDate ?? new Date().toISOString(),
        },
      })).filter(c => c.url);
    } catch (err) {
      console.warn(`[AiNewsIntegration] rss-parser fetch failed for ${feed.company}:`, err instanceof Error ? err.message : String(err));
      return [];
    }
  }

  private static normalizeRssItem(item: any, feed: FeedSource): AiNewsCard | null {
    if (!item.title || !item.link) return null;

    let title = typeof item.title === 'string' ? item.title : item.title['#text'] || '';
    let link = typeof item.link === 'string' ? item.link : item.link['@_href'] || '';
    if (!title || !link) return null;

    const rawDesc = item.encoded || item.description || '';
    const description = cheerio.load(rawDesc).text().trim().substring(0, 300);

    const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
    
    // Attempt to extract image
    let imageUrl: string | undefined = undefined;
    if (item.thumbnail && item.thumbnail['@_url']) {
        imageUrl = item.thumbnail['@_url'];
    } else if (item.enclosure && item.enclosure['@_url'] && item.enclosure['@_type']?.startsWith('image')) {
        imageUrl = item.enclosure['@_url'];
    }

    return {
      id: uuid(),
      type: 'ai_news',
      category: 'ai',
      fetchedAt: new Date().toISOString(),
      title,
      description,
      url: link,
      imageUrl,
      metadata: {
        source: feed.company,
        authorOrCompany: feed.company,
        publishedAt: pubDate
      }
    };
  }

  private static normalizeAtomItem(entry: any, feed: FeedSource): AiNewsCard | null {
    if (!entry.title) return null;

    let title = typeof entry.title === 'string' ? entry.title : entry.title['#text'] || '';
    let link = '';
    if (entry.link) {
      if (Array.isArray(entry.link)) {
        link = entry.link.find((l: any) => l['@_rel'] === 'alternate')?.['@_href'] || entry.link[0]['@_href'];
      } else {
        link = entry.link['@_href'] || entry.link;
      }
    }
    if (!title || typeof link !== 'string' || !link) return null;

    const rawDesc = entry.content?.['#text'] || entry.content || entry.summary?.['#text'] || entry.summary || '';
    const description = cheerio.load(rawDesc).text().trim().substring(0, 300);

    const pubDate = (entry.published || entry.updated) ? new Date(entry.published || entry.updated).toISOString() : new Date().toISOString();
    
    let imageUrl: string | undefined = undefined;
    if (entry.group && entry.group.thumbnail && entry.group.thumbnail['@_url']) {
        imageUrl = entry.group.thumbnail['@_url']; // YouTube ATOM uses media:group > media:thumbnail
    }

    return {
      id: uuid(),
      type: 'ai_news',
      category: 'ai',
      fetchedAt: new Date().toISOString(),
      title,
      description,
      url: link,
      imageUrl,
      metadata: {
        source: feed.company,
        authorOrCompany: feed.company,
        publishedAt: pubDate
      }
    };
  }
}
