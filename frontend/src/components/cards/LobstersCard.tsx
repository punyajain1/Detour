import React from 'react';
import { FeedCard } from '../../types/feed';
import { ArrowUpRight, MessageSquare, ChevronUp, Clock, Tag, Globe, User, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export const LobstersCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  const isTextPost = !card.url || card.url === md.commentsUrl;
  const displayTags = md.tags ? md.tags.slice(0, 4) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 14px 28px rgba(158, 10, 15, 0.12)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        padding: '0',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}
    >
      {/* ── Top Banner ── */}
      <div
        style={{
          background: '#fafafa',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: '#333333', fontSize: '0.9rem', letterSpacing: '-0.02em' }}>
            Lobste.rs
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: '#fff', border: '1px solid #e0e0e0', borderRadius: '100px',
          padding: '4px 12px', color: '#9e0a0f', fontWeight: 700, fontSize: '0.85rem'
        }}>
          <ChevronUp size={16} strokeWidth={3} />
          {md.score}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>

        {/* Meta Header */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>



          {/* Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#757575', fontSize: '0.85rem', fontWeight: 500 }}>
            <Clock size={14} />
            {md.hoursAgo === 0 ? 'just now' : `${md.hoursAgo}h ago`}
          </div>

          {/* Domain */}
          {!isTextPost && md.domain && (
            <>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d1d1' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#757575', fontSize: '0.85rem', fontWeight: 500 }}>
                <Globe size={14} />
                {md.domain}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#111111',
          marginBottom: '16px',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, serif'
        }}>
          {card.title}
        </h2>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {displayTags.map((tag: string) => (
              <a
                key={tag}
                href={`https://lobste.rs/t/${tag}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '2px',
                  background: '#f8f8f8', color: '#555555', border: '1px solid #e0e0e0',
                  fontSize: '0.75rem', padding: '4px 10px', borderRadius: '100px',
                  fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
                }}
              >
                <Hash size={12} style={{ color: '#9e0a0f' }} />
                {tag}
              </a>
            ))}
          </div>
        )}

        {/* Description Excerpt */}
        {card.description && (
          <div style={{
            color: '#444444',
            fontSize: '1rem',
            lineHeight: 1.6,
            fontWeight: 400,
            marginBottom: '32px',
            fontFamily: 'Georgia, serif',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {card.description}
          </div>
        )}

        <div style={{ flexGrow: 1 }} />

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
          <motion.a
            whileHover={{ background: '#f5f5f5' }}
            whileTap={{ scale: 0.98 }}
            href={md.commentsUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: isTextPost ? 1 : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: '#ffffff', color: '#555555', border: '1px solid #e0e0e0',
              padding: '12px 20px', borderRadius: '12px', fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s', fontSize: '0.9rem'
            }}
          >
            <MessageSquare size={18} strokeWidth={2.5} style={{ color: '#9e0a0f' }} />
            <span>{md.comments} Comments</span>
          </motion.a>

          {!isTextPost && (
            <motion.a
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.98 }}
              href={card.url}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#9e0a0f', color: '#ffffff', border: '1px solid #9e0a0f',
                padding: '12px 20px', borderRadius: '12px', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s', fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(158, 10, 15, 0.2)'
              }}
            >
              <span>Read Article</span>
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
