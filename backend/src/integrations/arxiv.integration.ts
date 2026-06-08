import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { ArxivData } from '../types/feed.types';

export class ArxivIntegration {
  private static BASE = 'http://export.arxiv.org/api/query';
  
  // Mix of interesting AI/CS/Science categories
  private static CATEGORIES = [
    'cs.AI', 'cs.LG', 'cs.CL', 'cs.RO', 'cs.CV', 
    'astro-ph', 'quant-ph', 'math.PR', 'stat.ML', 'physics.pop-ph'
  ];

  public static async getRandomPapers(limit: number = 5): Promise<ArxivData[]> {
    try {
      // Pick a random category
      const category = this.CATEGORIES[Math.floor(Math.random() * this.CATEGORIES.length)];
      
      // Pick a random start offset. Let's keep it modest to ensure we get results
      // without hitting the end of the category.
      const start = Math.floor(Math.random() * 200);

      const response = await axios.get(this.BASE, {
        params: {
          search_query: `cat:${category}`,
          start,
          max_results: limit,
          sortBy: 'lastUpdatedDate',
          sortOrder: 'descending'
        },
      });

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      const parsed = parser.parse(response.data);

      const entries = parsed.feed?.entry;
      if (!entries) {
        return [];
      }

      // Handle single entry vs array of entries
      const entriesArray = Array.isArray(entries) ? entries : [entries];

      return entriesArray.map((entry: any) => {
        // Find pdf link
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        const pdfLink = links.find((l: any) => l['@_title'] === 'pdf' || l['@_type'] === 'application/pdf');
        const htmlLink = links.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate');

        // Extract authors
        const authorsRaw = Array.isArray(entry.author) ? entry.author : [entry.author];
        const authors = authorsRaw.map((a: any) => a?.name).filter(Boolean);

        return {
          id: entry.id,
          title: typeof entry.title === 'string' ? entry.title.replace(/\n/g, ' ').trim() : 'Unknown Title',
          summary: typeof entry.summary === 'string' ? entry.summary.replace(/\n/g, ' ').trim() : '',
          published_at: entry.published || new Date().toISOString(),
          authors,
          pdf_url: pdfLink ? pdfLink['@_href'] : undefined,
          html_url: htmlLink ? htmlLink['@_href'] : entry.id,
          category,
        };
      });
    } catch (err) {
      console.error('[ArxivIntegration] Failed to fetch papers:', err);
      return [];
    }
  }
}
