import React from 'react';
import { FeedCard } from '../../types/feed';
import { Brain, Download, Heart, Github, ArrowUpRight, FileText, Users, Tag, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

type AIResearchCard = Extract<FeedCard, { type: 'huggingface' }>;

const TYPE_CONFIG = {
  huggingface: {
    label: 'HUGGING FACE',
    emoji: '🤗',
    headerBg: '#FFD21E',
    headerColor: '#000000',
    borderColor: '#000000',
    tagBg: '#FFD21E',
    tagColor: '#000000',
  },
};

export const AIResearchCard: React.FC<{ card: AIResearchCard }> = ({ card }) => {
  const cfg = TYPE_CONFIG[card.type];
  const md: any = card.metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: `8px 8px 0px ${cfg.borderColor}` }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#ffffff',
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
        color: cfg.headerColor,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
          <span style={{ fontSize: '1.2rem' }}>{cfg.emoji}</span>
          {cfg.label}
        </div>
        {/* Key stat badge */}
        {card.type === 'huggingface' && md.pipeline && (
          <span style={{
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            boxShadow: '2px 2px 0px #000000',
          }}>
            {md.pipeline.replace(/-/g, ' ').toUpperCase()}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: 800,
          color: '#000000',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
        }}>
          {card.title}
        </h2>

        {/* Author line */}
        {card.type === 'huggingface' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontSize: '0.9rem', fontWeight: 600 }}>
            <Tag size={16} strokeWidth={2.5} />
            <span style={{ textDecoration: 'underline' }}>@{md.author}</span>
          </div>
        )}

        {card.description && (
          <p style={{ margin: 0, color: '#333333', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500, maxHeight: '120px', overflow: 'hidden' }}>
            {card.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {card.type === 'huggingface' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontSize: '0.85rem', fontWeight: 800, border: '2px solid #000', padding: '4px 8px', boxShadow: '2px 2px 0px #000' }}>
                <Download size={14} strokeWidth={3} /> {Number(md.downloads ?? 0).toLocaleString()} DL
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0000', fontSize: '0.85rem', fontWeight: 800, border: '2px solid #000', padding: '4px 8px', boxShadow: '2px 2px 0px #000' }}>
                <Heart size={14} strokeWidth={3} /> {Number(md.likes ?? 0).toLocaleString()}
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {(() => {
          const tags: string[] = (md.tags ?? []).slice(0, 6);
          return tags.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tags.slice(0, 5).map((t: string) => (
                <span key={t} style={{
                  background: cfg.tagBg,
                  color: cfg.tagColor,
                  border: '2px solid #000000',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}>
                  {t}
                </span>
              ))}
            </div>
          ) : null;
        })()}

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
          <motion.a
            whileHover={{ background: '#000000', color: '#ffffff' }}
            whileTap={{ scale: 0.98 }}
            href={card.url}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1,
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
            <Download size={18} strokeWidth={2.5} />
            <span>View Model</span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};
