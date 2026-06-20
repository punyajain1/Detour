"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { fetchFeed } from '../lib/api';
import { FeedCard, FeedPage } from '../types/feed';
import { FeedCardComponent } from './FeedCardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNavBar } from './BottomNavBar';

// ─── Secret console helper ──────────────────────────────────────────────────
// Open DevTools and run: detour.sync()
// Optional: detour.sync(['nasa_exoplanet', 'nasa_image_library'])
declare global { interface Window { detour: { sync: (sources?: string[]) => Promise<void> } } }

export const InfiniteFeed: React.FC = () => {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const reloadRef = useRef<() => void>(() => {});

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '400px', // Fetch 400px before reaching the bottom
  });

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    try {
      const data: FeedPage = await fetchFeed(cursor, activeFilter);
      setCards((prev) => {
        // filter out duplicates just in case
        const existingIds = new Set(prev.map((c) => c.id));
        const newCards = data.cards.filter((c) => !existingIds.has(c.id));
        // Shuffle the new cards
        const shuffledCards = newCards.sort(() => Math.random() - 0.5);
        return [...prev, ...shuffledCards];
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Failed to load feed. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [cursor, hasMore, isLoading, activeFilter]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      loadMore();
    }
  }, [isInitialLoad, loadMore]);

  const handleFilterChange = useCallback((filter: string) => {
    if (filter === activeFilter) return;
    setCards([]);
    setCursor(null);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
    setActiveFilter(filter);
    setIsInitialLoad(true);
  }, [activeFilter]);

  // Keep reloadRef current so the console helper always has a fresh reload fn
  useEffect(() => {
    reloadRef.current = () => {
      setCards([]);
      setCursor(null);
      setHasMore(true);
      setIsLoading(false);
      setError(null);
      setIsInitialLoad(true);
    };
  });

  // Register secret console command: detour.sync(sources?)
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.detour = {
      sync: async (sources?: string[]) => {
        const label = sources?.length ? sources.join(', ') : 'all sources';
        console.log(`%c[Detour] Syncing ${label}…`, 'color:#6366f1;font-weight:700');
        try {
          const res = await fetch(`${API}/feed/force-fetch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sources?.length ? { sources } : {}),
          });
          const json = await res.json();
          console.log('%c[Detour] Sync complete', 'color:#22c55e;font-weight:700', json);
          reloadRef.current();
        } catch (e) {
          console.error('[Detour] Sync failed', e);
        }
      },
    };
    return () => { delete (window as any).detour; };
  }, []);


  // Trigger load on scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isInitialLoad) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isInitialLoad, loadMore]);

  return (
    <>
      <div style={{ padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '80px' }}>

        {cards.length === 0 && !isLoading && !error && (
          <div className="end-message" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No feed items found.</div>
        )}

        {error && (
          <div style={{ padding: '20px', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', textAlign: 'center', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence>
            {cards.map((card, index) => (
              <FeedCardComponent key={card.id} card={card} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div ref={ref} className="loader-container" style={{ height: '100vh', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" />
          </div>
        )}

        {!hasMore && cards.length > 0 && (
          <div className="end-message" style={{ height: '100vh', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            You've reached the end of the universe.
          </div>
        )}
      </div>
      <BottomNavBar activeFilter={activeFilter} onSelectFilter={handleFilterChange} />
    </>
  );
};
