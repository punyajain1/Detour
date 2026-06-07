import React from 'react';

interface BottomNavBarProps {
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'nasa_apod', label: 'APOD' },
  { id: 'nasa_mars', label: 'Mars' },
  { id: 'nasa_neows', label: 'Asteroids' },
  { id: 'github', label: 'GitHub' },
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'hackernews', label: 'HackerNews' },
  { id: 'stackoverflow', label: 'Stack Overflow' },
  { id: 'space_news', label: 'Space News' },
  { id: 'jwst', label: 'JWST' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeFilter, onSelectFilter }) => {
  return (
    <>
      <style>{`
        .scrollable-pill-nav::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div 
        className="scrollable-pill-nav"
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(20, 20, 20, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          padding: '6px',
          gap: '4px',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          maxWidth: '90vw',
          overflowX: 'auto',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {FILTERS.map(f => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              style={{
                background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                border: 'none',
                color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                padding: '8px 16px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </>
  );
};
