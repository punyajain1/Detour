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

    const whereClause: any = {};
    if (category !== 'all') {
      whereClause.category = category;
    }
    if (type) {
      whereClause.type = type;
    }

    const count = await prisma.feedCard.count({ where: whereClause });
    if (count === 0) {
      return { cards: [], nextCursor: null, hasMore: false, totalFetched: 0 };
    }

    let skip = 0;
    let isWrapped = false;
    
    if (decoded && typeof decoded.page === 'number') {
      skip = decoded.page;
      isWrapped = decoded.seed === 'wrapped';
    } else {
      // Pick a random starting point in the feed
      skip = Math.floor(Math.random() * count);
    }

    let pageCards = await prisma.feedCard.findMany({
      where: whereClause,
      orderBy: { sortOrder: 'desc' },
      skip,
      take: pageSize,
    });

    let nextSkip = skip + pageCards.length;
    let nextSeed = isWrapped ? 'wrapped' : '';
    let hasMore = true;

    // If we hit the end of the database, wrap around to the beginning to keep the feed infinite
    if (pageCards.length < pageSize && !isWrapped) {
      const remaining = pageSize - pageCards.length;
      const wrappedCards = await prisma.feedCard.findMany({
        where: whereClause,
        orderBy: { sortOrder: 'desc' },
        skip: 0,
        take: remaining,
      });
      pageCards = [...pageCards, ...wrappedCards];
      nextSkip = wrappedCards.length; // Continue pagination from the wrap-around point
      nextSeed = 'wrapped';
    }

    // Stop if we wrapped around and hit the end again, or if the whole DB fits in one page
    if (isWrapped && pageCards.length < pageSize) {
      hasMore = false;
    }
    if (count <= pageSize) {
      hasMore = false;
    }

    const nextCursor = hasMore
      ? encodeCursor({ page: nextSkip, seed: nextSeed, category, type })
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

    return {
      cards: mappedCards,
      nextCursor,
      hasMore,
      totalFetched: count,
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
