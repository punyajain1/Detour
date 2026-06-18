import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PypiReleaseCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface PypiApiInfo {
  info: {
    name: string;
    version: string;
    summary: string | null;
    author: string | null;
    home_page: string | null;
    project_url: string;
  };
}

export class PypiIntegration {
  private static RSS_URL = 'https://pypi.org/rss/updates.xml';
  private static API_BASE = 'https://pypi.org/pypi';

  static async getLatestReleases(count: number = 25): Promise<PypiReleaseCard[]> {
    try {
      const { data: rssXml } = await axios.get<string>(this.RSS_URL, {
        timeout: 10000,
        headers: { Accept: 'application/rss+xml, application/xml' },
      });

      const parser = new XMLParser({ ignoreAttributes: false });
      const parsed = parser.parse(rssXml);
      const items: any[] = parsed?.rss?.channel?.item ?? [];
      const arr = Array.isArray(items) ? items : [items];

      const candidates = arr.slice(0, count * 3);

      // Enrich with PyPI API in parallel (best-effort)
      const enriched = await Promise.allSettled(
        candidates.map(async (item: any) => {
          const title: string = item.title ?? '';
          // RSS title format: "packagename version"
          const parts = title.trim().split(' ');
          const pkgName = parts[0];
          const version = parts.slice(1).join(' ');

          let description = '';
          let author: string | undefined;

          try {
            const { data } = await axios.get<PypiApiInfo>(
              `${this.API_BASE}/${encodeURIComponent(pkgName)}/json`,
              { timeout: 5000 }
            );
            description = data.info.summary ?? '';
            author = data.info.author ?? undefined;
          } catch {
            description = item.description ?? '';
          }

          const pubDate: string = item.pubDate ?? new Date().toISOString();
          const link: string = item.link ?? `https://pypi.org/project/${pkgName}/`;

          return {
            id: uuid(),
            type: 'pypi_release' as const,
            category: 'programming' as const,
            fetchedAt: new Date().toISOString(),
            title: `${pkgName} ${version}`,
            description: description.slice(0, 300),
            url: link,
            metadata: {
              packageName: pkgName,
              version,
              author,
              publishedAt: pubDate,
            },
          } satisfies PypiReleaseCard;
        })
      );

      return enriched
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<PypiReleaseCard>).value)
        .filter((c) => c.description)
        .slice(0, count);
    } catch (err) {
      console.warn('[PyPI] Failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
