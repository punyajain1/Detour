/**
 * ArXiv Integration — RSS/Atom feed-based
 *
 * Uses the official rss.arxiv.org feeds instead of the Search API.
 * Combined-category URLs (e.g. cs.AI+cs.LG) reduce total requests to ~9.
 * No rate-limit issues; feeds are updated daily by arXiv.
 *
 * Feed format: https://rss.arxiv.org/rss/{category}
 *              https://rss.arxiv.org/rss/{cat1}+{cat2}+{cat3}
 */

import Parser from 'rss-parser';
import { ArxivData } from '../types/feed.types';

// ─────────────────────────────────────────────────────────────────────────────
// Feed definitions
// Each entry maps to ONE HTTP request (combined feeds are free)
// ─────────────────────────────────────────────────────────────────────────────

interface ArxivFeed {
  url: string;
  /** Feed card category used when writing to DB */
  feedCategory: 'ai' | 'programming' | 'science';
  /** Primary arXiv category for metadata */
  primaryCategory: string;
}

const ARXIV_RSS_FEEDS: ArxivFeed[] = [
  // ── CS: Artificial Intelligence & Machine Learning ────────────────────────
  // cs.AI, cs.LG, cs.CL, cs.CV, cs.NE
  {
    url: 'https://rss.arxiv.org/rss/cs.AI+cs.LG+cs.CL+cs.CV+cs.NE',
    feedCategory: 'ai',
    primaryCategory: 'cs.AI',
  },
  // ── CS: NLP, IR, Multiagent, Multimedia, Sound ────────────────────────────
  // cs.MA, cs.IR, cs.IT, cs.MM, cs.SD
  {
    url: 'https://rss.arxiv.org/rss/cs.MA+cs.IR+cs.IT+cs.MM+cs.SD',
    feedCategory: 'ai',
    primaryCategory: 'cs.MA',
  },
  // ── CS: Systems, Networking, OS, Databases ────────────────────────────────
  // cs.DC, cs.DB, cs.NI, cs.OS, cs.SY, cs.PF
  {
    url: 'https://rss.arxiv.org/rss/cs.DC+cs.DB+cs.NI+cs.OS+cs.SY+cs.PF',
    feedCategory: 'programming',
    primaryCategory: 'cs.DC',
  },
  // ── CS: Software Engineering, PL, Architecture ────────────────────────────
  // cs.SE, cs.PL, cs.AR, cs.CE
  {
    url: 'https://rss.arxiv.org/rss/cs.SE+cs.PL+cs.AR+cs.CE',
    feedCategory: 'programming',
    primaryCategory: 'cs.SE',
  },
  // ── CS: Theory — Complexity, Algorithms, Logic ────────────────────────────
  // cs.CC, cs.DM, cs.DS, cs.FL, cs.LO, cs.NA, cs.MS, cs.SC
  {
    url: 'https://rss.arxiv.org/rss/cs.CC+cs.DM+cs.DS+cs.FL+cs.LO+cs.NA+cs.MS+cs.SC',
    feedCategory: 'programming',
    primaryCategory: 'cs.DS',
  },
  // ── CS: Applied, Graphics, Security, HCI, Robotics ───────────────────────
  // cs.CG, cs.CR, cs.CY, cs.DL, cs.ET, cs.GL, cs.GR, cs.GT, cs.HC, cs.RO, cs.SI
  {
    url: 'https://rss.arxiv.org/rss/cs.CG+cs.CR+cs.CY+cs.DL+cs.ET+cs.GL+cs.GR+cs.GT+cs.HC+cs.RO+cs.SI',
    feedCategory: 'programming',
    primaryCategory: 'cs.CR',
  },
  // ── Electrical Engineering & Systems Science ──────────────────────────────
  // eess.AS, eess.IV, eess.SP, eess.SY
  {
    url: 'https://rss.arxiv.org/rss/eess.AS+eess.IV+eess.SP+eess.SY',
    feedCategory: 'science',
    primaryCategory: 'eess',
  },
  // ── Physics: Astrophysics ─────────────────────────────────────────────────
  // astro-ph.CO, astro-ph.EP, astro-ph.GA, astro-ph.HE, astro-ph.IM, astro-ph.SR
  {
    url: 'https://rss.arxiv.org/rss/astro-ph.CO+astro-ph.EP+astro-ph.GA+astro-ph.HE+astro-ph.IM+astro-ph.SR',
    feedCategory: 'science',
    primaryCategory: 'astro-ph',
  },
  // ── Physics: Condensed Matter ─────────────────────────────────────────────
  // cond-mat.dis-nn, cond-mat.mes-hall, cond-mat.mtrl-sci, cond-mat.quant-gas,
  // cond-mat.soft, cond-mat.stat-mech, cond-mat.str-el, cond-mat.supr-con
  {
    url: 'https://rss.arxiv.org/rss/cond-mat.dis-nn+cond-mat.mes-hall+cond-mat.mtrl-sci+cond-mat.quant-gas+cond-mat.soft+cond-mat.stat-mech+cond-mat.str-el+cond-mat.supr-con',
    feedCategory: 'science',
    primaryCategory: 'cond-mat',
  },
  // ── Physics: High Energy, Quantum, Nuclear ────────────────────────────────
  // gr-qc, hep-ex, hep-lat, hep-ph, hep-th, math-ph, nucl-ex, nucl-th, quant-ph
  {
    url: 'https://rss.arxiv.org/rss/gr-qc+hep-ex+hep-lat+hep-ph+hep-th+math-ph+nucl-ex+nucl-th+quant-ph',
    feedCategory: 'science',
    primaryCategory: 'quant-ph',
  },
  // ── Physics: General Subcategories (part 1) ───────────────────────────────
  // physics.acc-ph, physics.ao-ph, physics.app-ph, physics.atm-clus, physics.atom-ph,
  // physics.bio-ph, physics.chem-ph, physics.class-ph, physics.comp-ph, physics.data-an
  {
    url: 'https://rss.arxiv.org/rss/physics.acc-ph+physics.ao-ph+physics.app-ph+physics.atm-clus+physics.atom-ph+physics.bio-ph+physics.chem-ph+physics.class-ph+physics.comp-ph+physics.data-an',
    feedCategory: 'science',
    primaryCategory: 'physics',
  },
  // ── Physics: General Subcategories (part 2) + Nonlinear Sciences ─────────
  // physics.flu-dyn, physics.geo-ph, physics.ins-det, physics.med-ph, physics.optics,
  // physics.plasm-ph, physics.pop-ph, physics.soc-ph, physics.space-ph,
  // nlin.AO, nlin.CD, nlin.CG, nlin.PS, nlin.SI
  {
    url: 'https://rss.arxiv.org/rss/physics.flu-dyn+physics.geo-ph+physics.ins-det+physics.med-ph+physics.optics+physics.plasm-ph+physics.pop-ph+physics.soc-ph+physics.space-ph+nlin.AO+nlin.CD+nlin.CG+nlin.PS+nlin.SI',
    feedCategory: 'science',
    primaryCategory: 'physics',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the canonical arXiv ID from a link like https://arxiv.org/abs/2506.12345v1 */
function extractArxivId(link: string): string {
  const match = link.match(/arxiv\.org\/abs\/([^\s?#]+)/i);
  return match ? match[1] : link;
}

/** Strip HTML tags and excess whitespace from RSS description fields */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

// Shared rss-parser instance — configured for arXiv feeds
const rssParser = new Parser({
  timeout: 20000,
  headers: {
    'User-Agent': 'Detour/1.0 (https://detour.app; academic feed aggregator)',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['arxiv:primary_category', 'arxivCategory', { keepArray: false }],
    ],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main integration class
// ─────────────────────────────────────────────────────────────────────────────

export class ArxivIntegration {
  /**
   * Fetch papers from all grouped RSS feeds.
   * Returns deduplicated ArxivData[] sorted newest first.
   *
   * @param limitPerFeed  max papers to take from each combined feed (default 30)
   */
  public static async getRandomPapers(limitPerFeed: number = 30): Promise<ArxivData[]> {
    const seenIds = new Set<string>();
    const allPapers: ArxivData[] = [];

    const results = await Promise.allSettled(
      ARXIV_RSS_FEEDS.map(feed => this.fetchFeed(feed, limitPerFeed))
    );

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      for (const paper of result.value) {
        const id = extractArxivId(paper.html_url ?? paper.id);
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        allPapers.push(paper);
      }
    }

    // Sort newest first
    allPapers.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    console.log(`[ArxivIntegration] Fetched ${allPapers.length} unique papers from ${ARXIV_RSS_FEEDS.length} RSS feeds`);
    return allPapers;
  }

  private static async fetchFeed(feed: ArxivFeed, limit: number): Promise<ArxivData[]> {
    try {
      const parsed = await rssParser.parseURL(feed.url);

      return (parsed.items ?? []).slice(0, limit).map((item): ArxivData => {
        const link = item.link ?? item.guid ?? '';
        const arxivId = extractArxivId(link);

        // Author(s) — arXiv RSS uses dc:creator or author field
        const authorRaw: string = (item as any).creator ?? (item as any).author ?? '';
        const authors = authorRaw
          .split(/,|;|\band\b/)
          .map((a: string) => a.trim())
          .filter(Boolean)
          .slice(0, 5);

        // Category — from item's arxiv:primary_category or fallback to feed's primaryCategory
        const categoryTerm: string =
          (item as any).arxivCategory?.['$']?.term ??
          (item as any).arxivCategory ??
          feed.primaryCategory;

        // Abstract — RSS description contains the abstract (may have HTML)
        const summary = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? '');

        return {
          id: arxivId,
          title: (item.title ?? 'Untitled').replace(/\[.*?\]\s*/g, '').trim(),
          summary,
          published_at: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
          authors,
          pdf_url: link.replace('/abs/', '/pdf/'),
          html_url: link,
          category: categoryTerm,
        };
      });
    } catch (err) {
      console.warn(
        `[ArxivIntegration] Feed failed (${feed.primaryCategory}):`,
        err instanceof Error ? err.message : String(err)
      );
      return [];
    }
  }
}
