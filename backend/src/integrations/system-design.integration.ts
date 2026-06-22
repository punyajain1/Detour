import axios from 'axios';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { XMLParser } from 'fast-xml-parser';
import { v4 as uuid } from 'uuid';
import { SystemDesignData } from '../types/feed.types';


const SYSTEM_DESIGN_KEYWORDS = [
  'architecture', 'distributed system', 'scalability', 'scale', 'caching',
  'database', 'microservice', 'backend', 'system design', 'infrastructure',
  'throughput', 'latency', 'kafka', 'redis', 'cassandra', 'sharding',
  'load balancing', 'concurrency', 'fault tolerance', 'consensus', 'replication',
  'service mesh', 'kubernetes', 'container', 'observability', 'monitoring',
  'reliability', 'availability', 'consistency', 'partition', 'raft', 'paxos',
  'event driven', 'message queue', 'api gateway', 'circuit breaker', 'grpc',
  'postgres', 'mysql', 'nosql', 'storage', 'networking', 'protocol',
  'performance', 'optimization', 'deployment', 'devops', 'sre', 'platform',
  'data pipeline', 'streaming', 'batch', 'etl', 'data warehouse',
  'cloud', 'multi-region', 'failover', 'disaster recovery', 'incident',
];

function isSystemDesignRelated(title: string, summary: string): boolean {
  const text = (title + ' ' + summary).toLowerCase();
  return SYSTEM_DESIGN_KEYWORDS.some(kw => text.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Deduplication helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Strip trailing slash, query params that are tracking-only, and fragments
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

/** Rough word-overlap similarity between two normalised titles (Jaccard on words) */
function titleSimilarity(a: string, b: string): number {
  const wa = new Set(a.split(' ').filter(w => w.length > 3));
  const wb = new Set(b.split(' ').filter(w => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  for (const w of wa) { if (wb.has(w)) overlap++; }
  return overlap / Math.max(wa.size, wb.size);
}

function deduplicateItems(items: SystemDesignData[]): SystemDesignData[] {
  const seenUrls = new Set<string>();
  const seenTitles: string[] = [];
  const result: SystemDesignData[] = [];

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

// ─────────────────────────────────────────────────────────────────────────────
// Feed source lists
// ─────────────────────────────────────────────────────────────────────────────

interface FeedSource {
  company: string;
  url: string;
  sourceType: SystemDesignData['sourceType'];
}

const RSS_ATOM_FEEDS: FeedSource[] = [
  // ── Engineering Blogs ────────────────────────────────────────────────────
  { company: 'Netflix', url: 'https://netflixtechblog.com/feed', sourceType: 'engineering_blog' },
  { company: 'Cloudflare', url: 'https://blog.cloudflare.com/rss/', sourceType: 'engineering_blog' },
  { company: 'Stripe', url: 'https://stripe.com/blog/feed.xml', sourceType: 'engineering_blog' },
  { company: 'GitHub Engineering', url: 'https://github.blog/engineering/feed/', sourceType: 'engineering_blog' },
  { company: 'AWS Architecture', url: 'https://aws.amazon.com/blogs/architecture/feed/', sourceType: 'engineering_blog' },
  { company: 'Google Cloud', url: 'https://cloud.google.com/blog/products/rss', sourceType: 'engineering_blog' },
  { company: 'Microsoft DevBlogs', url: 'https://devblogs.microsoft.com/feed/', sourceType: 'engineering_blog' },
  { company: 'Shopify Engineering', url: 'https://shopify.engineering/blogs/engineering.atom', sourceType: 'engineering_blog' },
  { company: 'Dropbox Tech', url: 'https://dropbox.tech/feed', sourceType: 'engineering_blog' },
  { company: 'Slack Engineering', url: 'https://slack.engineering/feed/', sourceType: 'engineering_blog' },
  { company: 'Datadog Engineering', url: 'https://www.datadoghq.com/blog/rss/', sourceType: 'engineering_blog' },
  { company: 'Canva Engineering', url: 'https://www.canva.dev/blog/rss.xml', sourceType: 'engineering_blog' },
  { company: 'Instacart Engineering', url: 'https://tech.instacart.com/feed', sourceType: 'engineering_blog' },
  { company: 'DoorDash Engineering', url: 'https://doordash.engineering/feed', sourceType: 'engineering_blog' },
  { company: 'Vercel Engineering', url: 'https://vercel.com/blog/rss.xml', sourceType: 'engineering_blog' },
  // ── Medium Engineering Publications ─────────────────────────────────────
  { company: 'Airbnb Engineering', url: 'https://medium.com/feed/airbnb-engineering', sourceType: 'engineering_blog' },
  { company: 'Pinterest Engineering', url: 'https://medium.com/feed/pinterest-engineering', sourceType: 'engineering_blog' },
  // ── Architecture & System Design ─────────────────────────────────────────
  { company: 'Martin Fowler', url: 'https://martinfowler.com/feed.atom', sourceType: 'architecture_blog' },
  { company: 'InfoQ Architecture', url: 'https://www.infoq.com/architecture-design/feed/', sourceType: 'architecture_blog' },
  { company: 'High Scalability', url: 'https://feeds.feedburner.com/HighScalability', sourceType: 'architecture_blog' },
  { company: 'ByteByteGo', url: 'https://blog.bytebytego.com/feed', sourceType: 'architecture_blog' },
  // ── Database & Storage ────────────────────────────────────────────────────
  { company: 'MongoDB', url: 'https://www.mongodb.com/blog/rss', sourceType: 'database_blog' },
  { company: 'CockroachDB', url: 'https://www.cockroachlabs.com/blog/rss/', sourceType: 'database_blog' },
  { company: 'PlanetScale', url: 'https://planetscale.com/blog/rss.xml', sourceType: 'database_blog' },
  { company: 'ScyllaDB', url: 'https://www.scylladb.com/feed/', sourceType: 'database_blog' },
  // ── CNCF / Infrastructure ─────────────────────────────────────────────────
  { company: 'Kubernetes', url: 'https://kubernetes.io/feed.xml', sourceType: 'infrastructure_blog' },
  { company: 'CNCF', url: 'https://www.cncf.io/feed/', sourceType: 'infrastructure_blog' },
  { company: 'Grafana', url: 'https://grafana.com/blog/index.xml', sourceType: 'infrastructure_blog' },
  { company: 'Prometheus', url: 'https://prometheus.io/blog/index.xml', sourceType: 'infrastructure_blog' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Hacker News multi-query terms
// ─────────────────────────────────────────────────────────────────────────────

const HN_QUERIES = [
  'distributed systems',
  'system design',
  'software architecture',
  'scalability',
  'database',
  'postgres',
  'redis',
  'kafka',
  'consensus',
  'raft',
  'sharding',
  'replication',
  'load balancing',
  'observability',
  'sre',
  'platform engineering',
  'event driven architecture',
  'microservices',
];

// ─────────────────────────────────────────────────────────────────────────────
// ArXiv multi-term search
// ─────────────────────────────────────────────────────────────────────────────

const ARXIV_SEARCH_TERMS = [
  'distributed systems',
  'distributed databases',
  'database systems',
  'fault tolerance',
  'consensus',
  'replication',
  'sharding',
  'storage systems',
  'networking',
  'cloud computing',
  'large scale systems',
  'service mesh',
];

// ─────────────────────────────────────────────────────────────────────────────
// Scrape-only sites (no RSS available)
// ─────────────────────────────────────────────────────────────────────────────

const SCRAPE_SITES = [
  { company: 'Discord Engineering', url: 'https://discord.com/blog' },
  { company: 'Uber Engineering', url: 'https://www.uber.com/blog/engineering/' },
  { company: 'Figma Engineering', url: 'https://www.figma.com/blog/section/engineering/' },
];

// ─────────────────────────────────────────────────────────────────────────────
// XML parser (shared instance)
// ─────────────────────────────────────────────────────────────────────────────

const XML_PARSER = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

// ─────────────────────────────────────────────────────────────────────────────
// Main integration class
// ─────────────────────────────────────────────────────────────────────────────

export class SystemDesignIntegration {
  public static async getSystemDesignFeeds(limitPerSource: number = 15): Promise<SystemDesignData[]> {
    try {
      const [blogs, hn, arxiv, scraped] = await Promise.allSettled([
        this.fetchAllRssAtomFeeds(limitPerSource),
        this.fetchHNMultiQuery(limitPerSource),
        this.fetchArxivMultiTerm(limitPerSource),
        this.fetchScrapedSites(limitPerSource),
      ]);

      const allData = [
        ...(blogs.status === 'fulfilled' ? blogs.value : []),
        ...(hn.status === 'fulfilled' ? hn.value : []),
        ...(arxiv.status === 'fulfilled' ? arxiv.value : []),
        ...(scraped.status === 'fulfilled' ? scraped.value : []),
      ];

      // Deduplicate, then shuffle for a diverse feed
      const deduped = deduplicateItems(allData);

      for (let i = deduped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
      }

      console.log(`[SystemDesign] Fetched ${allData.length} items → ${deduped.length} after dedup`);
      return deduped;
    } catch (err) {
      console.error('[SystemDesign] getSystemDesignFeeds failed:', err);
      return [];
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RSS / Atom feeds
  // ───────────────────────────────────────────────────────────────────────────

  private static async fetchAllRssAtomFeeds(limitPerFeed: number): Promise<SystemDesignData[]> {
    const results = await Promise.allSettled(
      RSS_ATOM_FEEDS.map(feed => this.fetchSingleFeed(feed, limitPerFeed))
    );

    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  private static async fetchSingleFeed(feed: FeedSource, limit: number): Promise<SystemDesignData[]> {
    try {
      const response = await axios.get(feed.url, {
        timeout: 12000,
        headers: { 'User-Agent': 'Detour-FeedBot/1.0 (+https://detour.app)' },
      });

      const parsed = XML_PARSER.parse(response.data);

      let rawItems: any[] = [];
      if (parsed.rss?.channel?.item) {
        const items = parsed.rss.channel.item;
        rawItems = Array.isArray(items) ? items : [items];
      } else if (parsed.feed?.entry) {
        const entries = parsed.feed.entry;
        rawItems = Array.isArray(entries) ? entries : [entries];
      }

      return rawItems
        .slice(0, limit)
        .map((item: any) => this.normalizeRssItem(item, feed))
        .filter((card): card is SystemDesignData => card !== null)
        .filter(card => isSystemDesignRelated(card.title, card.summary));
    } catch (err) {
      console.warn(`[SystemDesign] RSS fetch failed for ${feed.company}:`, err instanceof Error ? err.message : err);
      return [];
    }
  }

  private static normalizeRssItem(item: any, feed: FeedSource): SystemDesignData | null {
    try {
      // Title
      let title = item.title;
      if (typeof title === 'object') title = title?.['#text'] ?? title?._ ?? '';
      title = String(title).replace(/\n/g, ' ').trim();
      if (!title || title === 'Unknown Blog Post') return null;

      // URL
      let url: string = '';
      if (typeof item.link === 'string') {
        url = item.link;
      } else if (item.link?.['@_href']) {
        url = item.link['@_href'];
      } else if (Array.isArray(item.link)) {
        const alternate = item.link.find((l: any) => l['@_rel'] === 'alternate' || l['@_type'] === 'text/html');
        url = alternate?.['@_href'] ?? item.link[0]?.['@_href'] ?? '';
      }
      if (!url) url = feed.url;

      // Summary — strip HTML, cap at 400 chars
      let raw = item.description ?? item.summary ?? item['content:encoded'] ?? item.content ?? '';
      if (typeof raw === 'object') raw = raw?.['#text'] ?? raw?._ ?? '';
      const summary = String(raw)
        .replace(/<[^>]*>?/gm, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 400);

      // Author
      let author = item.author ?? item['dc:creator'] ?? feed.company;
      if (typeof author === 'object') author = author?.name ?? author?.['#text'] ?? feed.company;
      author = String(author).trim() || feed.company;

      // Published date
      const published_at = item.pubDate ?? item.published ?? item.updated ?? item['dc:date'] ?? new Date().toISOString();

      return {
        id: uuid(),
        title,
        summary,
        url,
        sourceType: feed.sourceType,
        authorOrCompany: feed.company,
        published_at: String(published_at),
        tags: [],
      };
    } catch {
      return null;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Hacker News — 18 queries via Algolia
  // ───────────────────────────────────────────────────────────────────────────

  private static async fetchHNMultiQuery(limitPerQuery: number): Promise<SystemDesignData[]> {
    const oneMonthAgo = Math.floor(Date.now() / 1000) - 30 * 86400;

    const results = await Promise.allSettled(
      HN_QUERIES.map(query => this.fetchHNQuery(query, limitPerQuery, oneMonthAgo))
    );

    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  private static async fetchHNQuery(
    query: string,
    limit: number,
    createdAfter: number
  ): Promise<SystemDesignData[]> {
    try {
      const { data } = await axios.get('https://hn.algolia.com/api/v1/search', {
        params: {
          query,
          tags: 'story',
          numericFilters: `points>30,created_at_i>${createdAfter}`,
          hitsPerPage: limit,
        },
        timeout: 10000,
        headers: { 'User-Agent': 'Detour-FeedBot/1.0' },
      });

      return (data.hits ?? [])
        .filter((hit: any) => hit.title && isSystemDesignRelated(hit.title, ''))
        .map((hit: any): SystemDesignData => ({
          id: uuid(),
          title: hit.title,
          summary: `Hacker News — ${hit.points ?? 0} points · ${hit.num_comments ?? 0} comments`,
          url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
          sourceType: 'hackernews',
          authorOrCompany: 'Hacker News',
          published_at: hit.created_at,
          tags: [query],
        }));
    } catch (err) {
      console.warn(`[SystemDesign] HN query "${query}" failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ArXiv — 12 search terms
  // ───────────────────────────────────────────────────────────────────────────

  private static async fetchArxivMultiTerm(limitPerTerm: number): Promise<SystemDesignData[]> {
    // Spread requests to avoid hammering ArXiv
    const results = await Promise.allSettled(
      ARXIV_SEARCH_TERMS.map(term => this.fetchArxivTerm(term, limitPerTerm))
    );

    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  private static async fetchArxivTerm(term: string, limit: number): Promise<SystemDesignData[]> {
    try {
      const response = await axios.get('https://export.arxiv.org/api/query', {
        params: {
          search_query: `all:"${term}"`,
          max_results: limit,
          sortBy: 'lastUpdatedDate',
          sortOrder: 'descending',
        },
        timeout: 12000,
        headers: { 'User-Agent': 'Detour-FeedBot/1.0' },
      });

      const parsed = XML_PARSER.parse(response.data);
      const entries = parsed.feed?.entry;
      if (!entries) return [];

      const arr: any[] = Array.isArray(entries) ? entries : [entries];

      return arr
        .map((entry: any): SystemDesignData | null => {
          try {
            // Title
            const title = typeof entry.title === 'string'
              ? entry.title.replace(/\n/g, ' ').trim()
              : String(entry.title ?? '').replace(/\n/g, ' ').trim();
            if (!title) return null;

            // URL — prefer the HTML abstract page
            const links: any[] = Array.isArray(entry.link) ? entry.link : [entry.link].filter(Boolean);
            const htmlLink = links.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate');
            const url: string = htmlLink?.['@_href'] ?? entry.id ?? '';
            if (!url) return null;

            // Authors
            const authorsRaw = Array.isArray(entry.author) ? entry.author : [entry.author];
            const authors: string[] = authorsRaw.map((a: any) => a?.name).filter(Boolean);

            // Summary
            const summary = typeof entry.summary === 'string'
              ? entry.summary.replace(/\n/g, ' ').trim().slice(0, 400)
              : '';

            // Categories as tags
            const categories: any[] = Array.isArray(entry.category) ? entry.category : [entry.category].filter(Boolean);
            const tags = categories.map((c: any) => c?.['@_term']).filter(Boolean);

            return {
              id: uuid(),
              title,
              summary,
              url,
              sourceType: 'arxiv_paper',
              authorOrCompany: authors.slice(0, 3).join(', ') || 'ArXiv',
              published_at: String(entry.published ?? entry.updated ?? new Date().toISOString()),
              tags,
            };
          } catch {
            return null;
          }
        })
        .filter((item): item is SystemDesignData => item !== null)
        .filter(item => isSystemDesignRelated(item.title, item.summary));
    } catch (err) {
      console.warn(`[SystemDesign] ArXiv term "${term}" failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Cheerio scraping — Discord, Uber, Figma
  // ───────────────────────────────────────────────────────────────────────────

  private static async fetchScrapedSites(limit: number): Promise<SystemDesignData[]> {
    const results = await Promise.allSettled(
      SCRAPE_SITES.map(site => this.scrapeSite(site, limit))
    );

    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  private static async scrapeSite(
    site: { company: string; url: string },
    limit: number
  ): Promise<SystemDesignData[]> {
    try {
      const { data: html } = await axios.get(site.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Detour-FeedBot/1.0 (+https://detour.app)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      const $ = cheerio.load(html);
      const items: SystemDesignData[] = [];

      // Generic article-card selectors that cover most modern blog layouts
      const ARTICLE_SELECTORS = [
        'article',
        '[class*="post-card"]',
        '[class*="blog-post"]',
        '[class*="blog-card"]',
        '[class*="article-card"]',
        '[class*="entry"]',
        'li[class*="post"]',
      ];

      let found = false;
      for (const sel of ARTICLE_SELECTORS) {
        const els = $(sel).slice(0, limit * 2);
        if (els.length === 0) continue;

        els.each((_i: number, el: AnyNode) => {
          if (items.length >= limit) return false; // stop iteration

          // Title — look for heading or link text
          const titleEl = $(el).find('h1, h2, h3, h4').first();
          let title = titleEl.text().trim();
          if (!title) {
            title = $(el).find('a').first().text().trim();
          }
          if (!title || title.length < 10) return;

          // URL — first anchor in the card
          let href = $(el).find('a').first().attr('href') ?? '';
          if (!href) return;
          if (href.startsWith('/')) {
            const base = new URL(site.url);
            href = `${base.protocol}//${base.host}${href}`;
          }
          if (!href.startsWith('http')) return;

          // Excerpt
          const excerptEl = $(el).find('p, [class*="excerpt"], [class*="description"], [class*="summary"]').first();
          const summary = excerptEl.text().trim().slice(0, 300);

          // Date — look for <time> or common date class
          const dateEl = $(el).find('time, [class*="date"], [class*="published"], [datetime]').first();
          const published_at = dateEl.attr('datetime') ?? dateEl.text().trim() ?? new Date().toISOString();

          if (!isSystemDesignRelated(title, summary)) return;

          items.push({
            id: uuid(),
            title,
            summary,
            url: href,
            sourceType: 'engineering_blog',
            authorOrCompany: site.company,
            published_at,
            tags: [],
          });
        });

        if (items.length > 0) { found = true; break; }
      }

      if (!found) {
        // Fallback: grab all <a> with non-trivial text inside the main content area
        const mainArea = $('main, [role="main"], #content, .content, body').first();
        mainArea.find('a[href]').slice(0, limit * 3).each((_i: number, el: AnyNode) => {
          if (items.length >= limit) return false;

          const title = $(el).text().trim();
          if (!title || title.length < 15 || title.length > 200) return;

          let href = $(el).attr('href') ?? '';
          if (href.startsWith('/')) {
            const base = new URL(site.url);
            href = `${base.protocol}//${base.host}${href}`;
          }
          if (!href.startsWith('http')) return;

          if (!isSystemDesignRelated(title, '')) return;

          items.push({
            id: uuid(),
            title,
            summary: '',
            url: href,
            sourceType: 'engineering_blog',
            authorOrCompany: site.company,
            published_at: new Date().toISOString(),
            tags: [],
          });
        });
      }

      console.log(`[SystemDesign] Scraped ${items.length} items from ${site.company}`);
      return items;
    } catch (err) {
      console.warn(`[SystemDesign] Scrape failed for ${site.company}:`, err instanceof Error ? err.message : err);
      return [];
    }
  }
}
