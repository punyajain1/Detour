import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { v4 as uuid } from 'uuid';
import { SystemDesignData } from '../types/feed.types';

const HN_SYSTEM_DESIGN_KEYWORDS = '"system design" OR architecture OR "distributed systems" OR microservices OR databases OR scaling';

const ARXIV_SYSTEM_DESIGN_CATEGORIES = ['cs.DC', 'cs.DB', 'cs.NI', 'cs.SE'];

function isSystemDesignRelated(title: string, summary: string): boolean {
  const keywords = [
    'architecture', 'distributed system', 'scalability', 'scale', 'caching',
    'database', 'microservice', 'backend', 'system design', 'infrastructure',
    'throughput', 'latency', 'kafka', 'redis', 'cassandra', 'sharding', 
    'load balancing', 'concurrency', 'fault tolerance', 'consensus'
  ];
  const text = (title + ' ' + summary).toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

const ENGINEERING_BLOG_FEEDS = [
  { company: 'Netflix', url: 'https://netflixtechblog.com/feed' },
  { company: 'Uber', url: 'https://www.uber.com/en-IN/blog/engineering/rss/' },
  // Some Medium blogs
  { company: 'Airbnb', url: 'https://medium.com/feed/airbnb-engineering' },
  { company: 'Cloudflare', url: 'https://blog.cloudflare.com/rss/' },
  { company: 'Discord', url: 'https://discord.com/blog/rss.xml' }, // Example discord feed, might not work without specific eng tag
  { company: 'Stripe', url: 'https://stripe.com/blog/feed.xml' }
];

export class SystemDesignIntegration {
  public static async getSystemDesignFeeds(limitPerSource: number = 10): Promise<SystemDesignData[]> {
    try {
      const [hn, arxiv, blogs] = await Promise.allSettled([
        this.fetchHNSearch(limitPerSource),
        this.fetchArxivPapers(limitPerSource),
        this.fetchEngineeringBlogs(limitPerSource)
      ]);

      const hnData = hn.status === 'fulfilled' ? hn.value : [];
      const arxivData = arxiv.status === 'fulfilled' ? arxiv.value : [];
      const blogData = blogs.status === 'fulfilled' ? blogs.value : [];

      // Combine and shuffle slightly to make feed diverse
      const allData = [...hnData, ...arxivData, ...blogData];
      
      // Basic shuffle
      for (let i = allData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allData[i], allData[j]] = [allData[j], allData[i]];
      }

      return allData;
    } catch (err) {
      console.error('[SystemDesignIntegration] Failed to fetch system design feeds:', err);
      return [];
    }
  }

  private static async fetchHNSearch(limit: number): Promise<SystemDesignData[]> {
    try {
      const oneMonthAgo = Math.floor(Date.now() / 1000) - (30 * 86400); // Last month for system design to get good hits
      const { data } = await axios.get('https://hn.algolia.com/api/v1/search', {
        params: {
          query: HN_SYSTEM_DESIGN_KEYWORDS,
          tags: 'story',
          numericFilters: `points>50,created_at_i>${oneMonthAgo}`,
          hitsPerPage: limit,
        },
        timeout: 10000,
      });

      const filteredHits = data.hits.filter((hit: any) => 
        isSystemDesignRelated(hit.title || '', '')
      );

      return filteredHits.map((hit: any) => ({
        id: uuid(),
        title: hit.title,
        summary: `Hacker News discussion with ${hit.points} points and ${hit.num_comments} comments.`,
        url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        sourceType: 'hackernews' as const,
        authorOrCompany: 'Hacker News',
        published_at: hit.created_at,
      }));
    } catch (err) {
      console.warn('[SystemDesignIntegration] HN fetch failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private static async fetchArxivPapers(limit: number): Promise<SystemDesignData[]> {
    try {
      const category = ARXIV_SYSTEM_DESIGN_CATEGORIES[Math.floor(Math.random() * ARXIV_SYSTEM_DESIGN_CATEGORIES.length)];
      const start = Math.floor(Math.random() * 50);

      const response = await axios.get('http://export.arxiv.org/api/query', {
        params: {
          search_query: `cat:${category}`,
          start,
          max_results: limit,
          sortBy: 'lastUpdatedDate',
          sortOrder: 'descending'
        },
        timeout: 10000,
      });

      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const parsed = parser.parse(response.data);
      const entries = parsed.feed?.entry;
      if (!entries) return [];

      const entriesArray = Array.isArray(entries) ? entries : [entries];

      return entriesArray.map((entry: any) => {
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        const htmlLink = links.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate');

        const authorsRaw = Array.isArray(entry.author) ? entry.author : [entry.author];
        const authors = authorsRaw.map((a: any) => a?.name).filter(Boolean);

        return {
          id: uuid(),
          title: typeof entry.title === 'string' ? entry.title.replace(/\n/g, ' ').trim() : 'Unknown Title',
          summary: typeof entry.summary === 'string' ? entry.summary.replace(/\n/g, ' ').trim() : '',
          url: htmlLink ? htmlLink['@_href'] : entry.id,
          sourceType: 'arxiv_paper' as const,
          authorOrCompany: authors.join(', ') || 'ArXiv',
          published_at: entry.published,
          tags: [category]
        };
      }).filter((paper: any) => isSystemDesignRelated(paper.title, paper.summary));
    } catch (err) {
      console.warn('[SystemDesignIntegration] Arxiv fetch failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private static async fetchEngineeringBlogs(limitPerBlog: number): Promise<SystemDesignData[]> {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    let results: SystemDesignData[] = [];

    const fetchBlog = async (feed: { company: string, url: string }) => {
      try {
        const response = await axios.get(feed.url, { timeout: 10000 });
        const parsed = parser.parse(response.data);
        
        let items = [];
        if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
          items = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];
        } else if (parsed.feed && parsed.feed.entry) {
          // Atom feed fallback
          items = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
        }

        const validItems = items.slice(0, limitPerBlog).map((item: any) => {
          // Parse content/summary carefully to avoid massive payloads
          let rawSummary = item.description || item.summary || item.content || '';
          if (typeof rawSummary === 'object' && rawSummary['#text']) rawSummary = rawSummary['#text'];
          
          // Strip HTML tags
          const cleanSummary = typeof rawSummary === 'string' ? rawSummary.replace(/<[^>]*>?/gm, '').trim() : '';
          const titleStr = typeof item.title === 'string' ? item.title : (item.title?.['#text'] || 'Unknown Blog Post');

          return {
            id: uuid(),
            title: titleStr,
            summary: cleanSummary.slice(0, 300) + (cleanSummary.length > 300 ? '...' : ''),
            url: item.link?.['@_href'] || item.link || feed.url,
            sourceType: 'engineering_blog',
            authorOrCompany: feed.company,
            published_at: item.pubDate || item.published || item.updated || new Date().toISOString(),
          } as SystemDesignData;
        }).filter((card: SystemDesignData) => isSystemDesignRelated(card.title, card.summary));

        results = results.concat(validItems.slice(0, limitPerBlog));
      } catch (err) {
        console.warn(`[SystemDesignIntegration] Failed to fetch blog ${feed.company}:`, err instanceof Error ? err.message : err);
      }
    };

    await Promise.allSettled(ENGINEERING_BLOG_FEEDS.map(fetchBlog));

    return results;
  }
}
