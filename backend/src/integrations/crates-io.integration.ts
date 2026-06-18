import axios from 'axios';
import { CratesIoCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface CrateItem {
  id: string;
  name: string;
  description: string | null;
  newest_version: string;
  downloads: number;
  recent_downloads: number;
  repository: string | null;
  keywords: string[];
}

interface CratesResponse {
  crates: CrateItem[];
}

export class CratesIoIntegration {
  private static BASE = 'https://crates.io/api/v1';

  static async getTrendingCrates(count: number = 25): Promise<CratesIoCard[]> {
    try {
      // Fetch by recent downloads (trending this week)
      const { data } = await axios.get<CratesResponse>(`${this.BASE}/crates`, {
        params: {
          sort: 'recent-downloads',
          per_page: Math.min(count * 2, 100),
        },
        headers: {
          // Crates.io requires a User-Agent
          'User-Agent': 'Detour-Feed/1.0 (https://github.com/detour-app)',
        },
        timeout: 12000,
      });

      const valid = data.crates.filter(
        (c) => c.name && (c.description || c.repository)
      );

      return valid.slice(0, count).map((crate): CratesIoCard => ({
        id: uuid(),
        type: 'crates_io',
        category: 'programming',
        fetchedAt: new Date().toISOString(),
        title: crate.name,
        description: crate.description ?? `A Rust crate with ${crate.downloads.toLocaleString()} downloads.`,
        url: `https://crates.io/crates/${crate.id}`,
        metadata: {
          crateName: crate.name,
          version: crate.newest_version,
          downloads: crate.downloads,
          recentDownloads: crate.recent_downloads,
          repository: crate.repository ?? undefined,
          keywords: crate.keywords ?? [],
        },
      }));
    } catch (err) {
      console.warn('[CratesIo] Failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
