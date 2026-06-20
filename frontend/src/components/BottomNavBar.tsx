import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SlidersHorizontal, X, Check, Star, Orbit, Target, Github, Code2,
  Newspaper, HelpCircle, Rocket, Aperture, BookOpen, Network,
  MessageSquare, Presentation, Briefcase, FileCode, PackageOpen,
  Package, Box, Trophy, ShieldAlert, Smile, FileText, GraduationCap,
  Satellite, Sun, LayoutGrid, SatelliteDish, Image,
} from 'lucide-react';

interface BottomNavBarProps {
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

const FILTER_GROUPS = [
  {
    title: 'General',
    items: [
      { id: 'all', label: 'All', description: 'Mixed feed of all sources', icon: LayoutGrid },
    ],
  },
  {
    title: 'Space & Astronomy',
    items: [
      { id: 'nasa_apod', label: 'APOD', description: 'Astronomy picture of the day', icon: Star },
      { id: 'nasa_mars', label: 'Mars', description: 'Rover photos', icon: Orbit },
      { id: 'nasa_neows', label: 'Asteroids', description: 'Near-Earth objects', icon: Target },
      { id: 'jwst', label: 'JWST', description: 'Webb telescope images', icon: Aperture },
      { id: 'space_weather', label: 'Space Weather', description: 'Solar flares & storms', icon: Sun },
      { id: 'space_news', label: 'Space News', description: 'Aerospace updates', icon: Rocket },
      { id: 'nasa_exoplanet', label: 'Exoplanets', description: 'Confirmed exoplanet discoveries', icon: SatelliteDish },
      { id: 'nasa_image_library', label: 'NASA Images', description: 'NASA image & video library', icon: Image },
    ],
  },
  {
    title: 'Tech News & Discussions',
    items: [
      { id: 'hackernews', label: 'HackerNews', description: 'Top tech news & links', icon: Newspaper },
      { id: 'ask_hn', label: 'Ask HN', description: 'Community Q&A', icon: MessageSquare },
      { id: 'show_hn', label: 'Show HN', description: 'Creator projects & startups', icon: Presentation },
      { id: 'hn_job', label: 'HN Jobs', description: 'YC startup job postings', icon: Briefcase },
      { id: 'system_design', label: 'System Design', description: 'Architecture case studies', icon: Network },
    ],
  },
  {
    title: 'Programming & Packages',
    items: [
      { id: 'github', label: 'GitHub', description: 'Trending repositories', icon: Github },
      { id: 'npm_package', label: 'NPM Packages', description: 'Node.js modules', icon: Package },
      { id: 'pypi_release', label: 'PyPI Releases', description: 'Python packages', icon: Box },
      { id: 'crates_io', label: 'Crates.io', description: 'Rust crates', icon: PackageOpen },
      { id: 'stackoverflow', label: 'Stack Overflow', description: 'Top programming Q&A', icon: HelpCircle },
      { id: 'leetcode', label: 'LeetCode', description: 'Coding challenges', icon: Code2 },
      { id: 'codeforces', label: 'Codeforces', description: 'Competitive programming', icon: Trophy },
    ],
  },
  {
    title: 'Research & Security',
    items: [
      { id: 'arxiv', label: 'Research Papers', description: 'Pre-print tech papers', icon: BookOpen },
      { id: 'papers_with_code', label: 'Papers w/ Code', description: 'ML papers + implementations', icon: FileText },
      { id: 'huggingface', label: 'HuggingFace', description: 'Trending AI models', icon: Smile },
      { id: 'cve', label: 'CVEs', description: 'Security vulnerabilities', icon: ShieldAlert },
    ],
  },
];

const FILTERS = FILTER_GROUPS.flatMap((g) => g.items);

// --- Animation variants ---
const menuVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.03 },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.97,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

const groupVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// --- Filter Item ---
const FilterItem: React.FC<{
  f: (typeof FILTERS)[0];
  isActive: boolean;
  onSelect: () => void;
}> = ({ f, isActive, onSelect }) => {
  const IconComponent = f.icon;
  return (
    <motion.button
      variants={groupVariants}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: isActive
          ? 'rgba(255,255,255,0.08)'
          : 'transparent',
        border: '1px solid',
        borderColor: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
        color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)',
        padding: '10px 14px',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'left',
        boxShadow: isActive ? '0 0 0 1px rgba(255,255,255,0.1) inset' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)';
        }
      }}
    >
      <div style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55, transition: 'opacity 0.2s' }}>
        <IconComponent size={17} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, overflow: 'hidden' }}>
        <span style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 500,
          letterSpacing: '-0.01em',
        }}>
          {f.label}
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 400,
          color: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.33)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '0.01em',
        }}>
          {f.description}
        </span>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            style={{ flexShrink: 0 }}
          >
            <Check size={13} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// --- Main Component ---
export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeFilter, onSelectFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = FILTERS.find((f) => f.id === activeFilter);
  const activeLabel = activeItem?.label || 'Filters';
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '860px',
        pointerEvents: 'none',
      }}
    >
      {/* ── Menu Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              width: '90vw',
              maxWidth: '860px',
              maxHeight: '68vh',
              overflowY: 'auto',
              background: 'rgba(12, 12, 14, 0.82)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '24px',
              padding: '20px 22px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset',
              pointerEvents: 'auto',
              scrollbarWidth: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {FILTER_GROUPS.map((group, gi) => (
              <motion.div
                key={group.title}
                variants={groupVariants}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                {/* Section label with thin divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.28)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}>
                    {group.title}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: 'rgba(255,255,255,0.06)',
                  }} />
                </div>

                {/* Grid of filter buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '8px',
                }}>
                  {group.items.map((f) => (
                    <FilterItem
                      key={f.id}
                      f={f}
                      isActive={activeFilter === f.id}
                      onSelect={() => {
                        onSelectFilter(f.id);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>

                {/* Spacer between groups (except last) */}
                {gi < FILTER_GROUPS.length - 1 && (
                  <div style={{ height: '2px' }} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger Pill ── */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          background: isOpen
            ? 'rgba(10, 10, 12, 0.92)'
            : 'rgba(22, 22, 26, 0.88)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          padding: '12px 24px',
          gap: '9px',
          boxShadow: isOpen
            ? '0 4px 24px rgba(0,0,0,0.5)'
            : '0 8px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
          color: '#fff',
          cursor: 'pointer',
          pointerEvents: 'auto',
          transition: 'background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* Animated icon: rotates when open */}
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {isOpen
            ? <X size={15} color="rgba(255,255,255,0.55)" strokeWidth={2.5} />
            : <SlidersHorizontal size={15} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
          }
        </motion.div>

        {/* Active dot when a non-all filter is selected */}
        <AnimatePresence mode="wait">
          <motion.span
            key={isOpen ? '__close__' : activeLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: isOpen ? 'rgba(255,255,255,0.55)' : '#fff',
            }}
          >
            {isOpen ? 'Close' : activeLabel}
          </motion.span>
        </AnimatePresence>

        {/* Subtle active indicator dot */}
        {!isOpen && activeFilter !== 'all' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.7)',
              boxShadow: '0 0 5px rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}
          />
        )}
      </motion.button>
    </div>
  );
};
