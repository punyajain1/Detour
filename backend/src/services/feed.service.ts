import { prisma } from '../lib/prisma';
import { FeedCategory, FeedCard, FeedPage, FeedCursor } from '../types/feed.types';

const DEFAULT_PAGE_SIZE = Number(process.env.FEED_PAGE_SIZE_DEFAULT ?? 10);
const MAX_PAGE_SIZE = 20;

export class FeedService {
  static async getFeedPage(
    cursor?: string,
    category: FeedCategory = 'all',
    limit?: number,
    type?: string
  ): Promise<FeedPage> {
    const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    let decoded = cursor ? decodeCursor(cursor) : null;
    if (decoded && (decoded.category !== category || decoded.type !== type)) {
      decoded = null;
    }

    const page = decoded?.page ?? 0;
    const skip = page * pageSize;

    const whereClause: any = {};
    if (category !== 'all') {
      whereClause.category = category;
    }
    if (type) {
      whereClause.type = type;
    }

    const cards = await prisma.feedCard.findMany({
      where: whereClause,
      orderBy: { fetchedAt: 'desc' },
      skip,
      take: pageSize + 1, // take one extra to check if hasMore
    });

    const hasMore = cards.length > pageSize;
    const pageCards = hasMore ? cards.slice(0, pageSize) : cards;

    const nextCursor = hasMore
      ? encodeCursor({ page: page + 1, seed: '', category, type })
      : null;

    // Map Prisma models to FeedCard type
    const mappedCards: FeedCard[] = pageCards.map((c) => ({
      id: c.id,
      type: c.type as any,
      category: c.category as any,
      fetchedAt: c.fetchedAt.toISOString(),
      title: c.title,
      description: c.description,
      url: c.url || '',
      imageUrl: c.imageUrl || undefined,
      metadata: c.metadata as any,
    }));

    // In a real app we'd do a count query for totalFetched, or just mock it:
    const totalFetched = await prisma.feedCard.count({ where: whereClause });

    return {
      cards: mappedCards,
      nextCursor,
      hasMore,
      totalFetched,
    };
  }

  static clearCache(): void {
    // No-op since we moved to DB
    console.log('[FeedService] clearCache called, but cache is deprecated.');
  }
}

// ─────────────────────────────────────────────
// Cursor helpers
// ─────────────────────────────────────────────
function encodeCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(encoded: string): FeedCursor | null {
  try {
    const raw = Buffer.from(encoded, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as FeedCursor;
    if (typeof parsed.page !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}
