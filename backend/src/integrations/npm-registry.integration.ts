import axios from 'axios';
import { NpmPackageCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface NpmSearchObj {
  package: {
    name: string;
    description: string;
    version: string;
    keywords?: string[];
    publisher?: { username: string };
    links: { npm: string; homepage?: string; repository?: string };
  };
  score: {
    detail: { popularity: number; quality: number; maintenance: number };
  };
  downloads?: { weekly?: number };
}

interface NpmSearchResponse {
  objects: NpmSearchObj[];
  total: number;
}

interface NpmDownloads {
  downloads: number;
  package: string;
}

// Curated interesting search terms to rotate through
const SEARCH_TERMS = [
  'framework',
  'utility',
  'cli',
  'bundler',
  'typescript',
  'react',
  'server',
  'parser',
  'testing',
  'security',
];

export class NpmRegistryIntegration {
  private static SEARCH_BASE = 'https://registry.npmjs.org/-/v1/search';
  private static DOWNLOADS_BASE = 'https://api.npmjs.org/downloads/point/last-week';

  static async getTrendingPackages(count: number = 25): Promise<NpmPackageCard[]> {
    try {
      const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];

      const { data } = await axios.get<NpmSearchResponse>(this.SEARCH_BASE, {
        params: {
          text: term,
          size: Math.min(count * 2, 250),
          popularity: 1.0,
          quality: 0.5,
          maintenance: 0.5,
        },
        timeout: 12000,
      });

      if (!data.objects?.length) return [];

      // Sort by popularity score
      const sorted = data.objects
        .filter((o) => o.package.name && o.package.description)
        .sort((a, b) => b.score.detail.popularity - a.score.detail.popularity)
        .slice(0, count);

      // Fetch weekly download counts in parallel (best-effort)
      const withDownloads = await Promise.allSettled(
        sorted.map(async (obj) => {
          try {
            const dl = await axios.get<NpmDownloads>(
              `${this.DOWNLOADS_BASE}/${encodeURIComponent(obj.package.name)}`,
              { timeout: 5000 }
            );
            return { obj, downloads: dl.data.downloads ?? 0 };
          } catch {
            return { obj, downloads: 0 };
          }
        })
      );

      return withDownloads
        .filter((r) => r.status === 'fulfilled')
        .map((r) => {
          const { obj, downloads } = (r as PromiseFulfilledResult<{ obj: NpmSearchObj; downloads: number }>).value;
          const pkg = obj.package;

          return {
            id: uuid(),
            type: 'npm_package' as const,
            category: 'programming' as const,
            fetchedAt: new Date().toISOString(),
            title: pkg.name,
            description: pkg.description,
            url: pkg.links.npm,
            metadata: {
              packageName: pkg.name,
              version: pkg.version,
              weeklyDownloads: downloads,
              author: pkg.publisher?.username,
              keywords: pkg.keywords ?? [],
            },
          };
        });
    } catch (err) {
      console.warn('[NpmRegistry] Failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
