"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { fetchFeed } from '../lib/api';
import { FeedCard, FeedPage } from '../types/feed';
import { FeedCardComponent } from './FeedCardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNavBar } from './BottomNavBar';

export const InfiniteFeed: React.FC = () => {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

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
