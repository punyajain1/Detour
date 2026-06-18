import axios from 'axios';
import { PapersWithCodeCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

// ─── Hugging Face Daily Papers API shapes ───────────────────────────────────

interface HFPaperAuthor {
  _id: string;
  name: string;
  hidden?: boolean;
}

interface HFPaperInner {
  id: string;           // arxiv ID, e.g. "2606.16533"
  title: string;
  summary: string;
  publishedAt: string;
  authors: HFPaperAuthor[];
  upvotes: number;
  githubRepo?: string | null;
  githubStars?: number | null;
  ai_keywords?: string[];
}

interface HFDailyPaperItem {
  paper: HFPaperInner;
  publishedAt: string;
  title: string;
  summary: string;
  thumbnail?: string | null;
  numComments?: number;
}

// ─── Papers With Code repository shape ──────────────────────────────────────

interface PWCRepository {
  url: string;
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  framework?: string;
  is_official?: boolean;
}

interface PWCRepositoriesResponse {
  count: number;
  results: PWCRepository[];
}

// ────────────────────────────────────────────────────────────────────────────

export class PapersWithCodeIntegration {
  private static HF_BASE = 'https://huggingface.co/api';
  private static PWC_BASE = 'https://paperswithcode.com/api/v1';

  /**
   * Fetch popular AI papers of the day via the Hugging Face Daily Papers API,
   * which natively surfaces trending scores. Then enrich each paper with the
   * official GitHub repository URL from Papers With Code when available.
   */
  static async getLatestPapers(count: number = 20): Promise<PapersWithCodeCard[]> {
    // ── 1. Fetch daily papers from HuggingFace ───────────────────────────────
    let items: HFDailyPaperItem[] = [];
    try {
      const { data } = await axios.get<HFDailyPaperItem[]>(
        `${this.HF_BASE}/daily_papers`,
        {
          params: { limit: Math.min(count * 2, 50) },
          timeout: 12000,
          headers: { Accept: 'application/json' },
        },
      );
      items = Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn(
        '[PapersWithCode] HuggingFace Daily Papers fetch failed:',
        err instanceof Error ? err.message : err,
      );
      return [];
    }

    if (!items.length) return [];

    // Filter to items that have a title and summary
    const filtered = items.filter((item) => item.paper?.title && item.paper?.summary);

    // Sort descending by upvotes (already done server-side, but be explicit)
    filtered.sort((a, b) => (b.paper.upvotes ?? 0) - (a.paper.upvotes ?? 0));

    const candidates = filtered.slice(0, count);

    // ── 2. Enrich with PWC repository data in parallel ───────────────────────
    const enriched = await Promise.all(
      candidates.map(async (item) => {
        const arxivId = item.paper.id;

        // Prefer the githubRepo already embedded in the HF response
        let githubUrl: string | null = item.paper.githubRepo ?? null;
        let stars: number | undefined = item.paper.githubStars ?? undefined;

        // If HF didn't provide a repo, try PWC's repositories endpoint
        if (!githubUrl && arxivId) {
          try {
            const { data } = await axios.get<PWCRepositoriesResponse>(
              `${this.PWC_BASE}/papers/${arxivId}/repositories/`,
              {
                timeout: 6000,
                headers: { Accept: 'application/json' },
              },
            );
            if (data?.results?.length) {
              // Prefer the official implementation; fall back to most-starred
              const official = data.results.find((r) => r.is_official);
              const top = data.results.sort((a, b) => b.stars - a.stars)[0];
              const chosen = official ?? top;
              githubUrl = chosen.url;
              stars = chosen.stars;
            }
          } catch {
            // PWC lookup is best-effort — silently skip
          }
        }

        return { item, githubUrl, stars };
      }),
    );

    // ── 3. Map to PapersWithCodeCard ─────────────────────────────────────────
    return enriched.map(({ item, githubUrl, stars }): PapersWithCodeCard => {
      const paper = item.paper;
      const arxivId = paper.id;

      const abstract = paper.summary ?? item.summary ?? '';
      const description =
        abstract.slice(0, 500) + (abstract.length > 500 ? '...' : '');

      const authorNames = (paper.authors ?? [])
        .filter((a) => !a.hidden)
        .map((a) => a.name)
        .slice(0, 5);

      // Derive tasks / keywords from ai_keywords when available
      const tasks = (paper.ai_keywords ?? []).slice(0, 5);

      // Canonical URL: HuggingFace paper page (always accessible)
      const url = `https://huggingface.co/papers/${arxivId}`;

      return {
        id: uuid(),
        type: 'papers_with_code',
        category: 'ai',
        fetchedAt: new Date().toISOString(),
        imageUrl: item.thumbnail ?? undefined,
        title: paper.title ?? item.title,
        description,
        url,
        metadata: {
          arxivId,
          githubUrl: githubUrl ?? undefined,
          stars,
          publishedAt: paper.publishedAt ?? item.publishedAt ?? new Date().toISOString(),
          tasks,
          authors: authorNames,
        },
      };
    });
  }
}
