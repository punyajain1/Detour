import React from 'react';
import { FeedCard } from '../../types/feed';
import { Download, Tag, GitBranch, Package, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type PackageCard = Extract<FeedCard, { type: 'crates_io' | 'npm_package' | 'pypi_release' }>;

const ECOSYSTEM_CONFIG = {
  crates_io: {
    name: 'Crates.io',
    emoji: '🦀',
    accentColor: '#000000',
    headerBg: '#e87321', // Rust orange
    headerText: '#ffffff',
    bgColor: '#f9f7ec', // Off-white
    borderColor: '#000000',
    tagBg: '#e87321',
    tagColor: '#ffffff',
    label: 'RUST CRATE',
  },
  npm_package: {
    name: 'npm',
    emoji: '📦',
    accentColor: '#000000',
    headerBg: '#cb3837', // npm red
    headerText: '#ffffff',
    bgColor: '#ffffff',
    borderColor: '#000000',
    tagBg: '#cb3837',
    tagColor: '#ffffff',
    label: 'NPM PACKAGE',
  },
  pypi_release: {
    name: 'PyPI',
    emoji: '🐍',
    accentColor: '#000000',
    headerBg: '#3776AB', // Python blue
    headerText: '#FFD43B', // Python yellow
    bgColor: '#ffffff',
    borderColor: '#000000',
    tagBg: '#FFD43B',
    tagColor: '#000000',
    label: 'PYTHON PACKAGE',
  },
};

export const DevPackageCard: React.FC<{ card: PackageCard }> = ({ card }) => {
  const cfg = ECOSYSTEM_CONFIG[card.type];
  const md: any = card.metadata || {};

  const stats: Array<{ icon: React.ReactNode; label: string; value: string }> = [];

  if (card.type === 'crates_io') {
    stats.push(
      { icon: <Download size={14} strokeWidth={2.5} />, label: 'Downloads', value: Number(md.downloads ?? 0).toLocaleString() },
      { icon: <Clock size={14} strokeWidth={2.5} />, label: 'Recent', value: Number(md.recentDownloads ?? 0).toLocaleString() }
    );
  } else if (card.type === 'npm_package') {
    stats.push(
      { icon: <Download size={14} strokeWidth={2.5} />, label: 'Weekly DL', value: Number(md.weeklyDownloads ?? 0).toLocaleString() }
    );
    if (md.author) stats.push({ icon: <Tag size={14} strokeWidth={2.5} />, label: 'Author', value: md.author });
  } else if (card.type === 'pypi_release') {
    if (md.author) stats.push({ icon: <Tag size={14} strokeWidth={2.5} />, label: 'Author', value: md.author });
    if (md.publishedAt) stats.push({
      icon: <Clock size={14} strokeWidth={2.5} />,
      label: 'Published',
      value: new Date(md.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    });
  }

  const keywords: string[] = md.keywords ?? [];
  const version: string = md.version ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: `8px 8px 0px ${cfg.borderColor}` }}
      transition={{ duration: 0.2 }}
      style={{
        background: cfg.bgColor,
        border: `2px solid ${cfg.borderColor}`,
        borderRadius: '0px',
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        boxShadow: `4px 4px 0px ${cfg.borderColor}`,
      }}
    >
      {/* Header */}
      <div style={{
        background: cfg.headerBg,
        borderBottom: `2px solid ${cfg.borderColor}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{cfg.emoji}</span>
          <div style={{ color: cfg.headerText, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            {cfg.label}
          </div>
        </div>
        {version && (
          <span style={{
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            boxShadow: '2px 2px 0px #000000',
          }}>
            v{version}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#000000',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            wordBreak: 'break-all',
          }}>
            <Package size={20} strokeWidth={2.5} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {card.title}
          </h2>
        </div>

        {card.description && (
          <p style={{ margin: 0, color: '#333333', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
            {card.description}
          </p>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#000000',
                fontSize: '0.85rem',
                background: '#ffffff',
                padding: '6px 12px',
                border: '2px solid #000000',
                fontWeight: 700,
                boxShadow: '2px 2px 0px #000000',
              }}>
                {s.icon}
                <span>{s.label}:</span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {keywords.slice(0, 6).map((kw: string) => (
              <span key={kw} style={{
                background: cfg.tagBg,
                color: cfg.tagColor,
                border: '2px solid #000000',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}>
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Repository link for Crates */}
        {card.type === 'crates_io' && md.repository && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontSize: '0.85rem', fontWeight: 600 }}>
            <GitBranch size={16} strokeWidth={2.5} />
            <a href={md.repository} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '2px solid #000000' }}>
              {md.repository.replace('https://github.com/', '')}
            </a>
          </div>
        )}

        {/* CTA */}
        <motion.a
          whileHover={{ background: '#000000', color: '#ffffff' }}
          whileTap={{ scale: 0.98 }}
          href={card.url}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '12px 16px',
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'all 0.2s',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>View on {cfg.name}</span>
          <ArrowUpRight size={18} strokeWidth={2.5} />
        </motion.a>
      </div>
    </motion.div>
  );
};
