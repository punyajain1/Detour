import React from 'react';
import { FeedCard } from '../../types/feed';
import { ArrowUpRight, MessageSquare, TrendingUp, Clock, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const HackerNewsCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: '8px 8px 0px #ff6600' }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#f6f6ef', // Classic HN background
        border: '2px solid #000000',
        borderRadius: '0px', // Brutalist sharp edges
        width: '100%',
        maxWidth: '560px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '4px 4px 0px #000000',
        padding: '0',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}
    >
      {/* Top Banner */}
      <div style={{ background: '#ff6600', padding: '12px 16px', borderBottom: '2px solid #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, color: '#000000', fontSize: '1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ border: '2px solid #000', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontSize: '0.8rem' }}>Y</span>
          {card.type === 'ask_hn' ? 'ASK HN' : card.type === 'show_hn' ? 'SHOW HN' : card.type === 'hn_job' ? 'HN JOBS' : 'HACKER NEWS'}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000' }}>
          No. {Math.floor(Math.random() * 10000)}
        </div>
      </div>

      <div style={{ padding: '24px 24px 0 24px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#000000', marginBottom: '16px', lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }}>
          {card.title}
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px dashed #000000' }}>
          {md.points && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#ff6600', fontSize: '0.85rem' }}>
              <TrendingUp size={16} strokeWidth={3} /> {md.points}
            </span>
          )}
          {md.comments && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#000', fontWeight: 600, fontSize: '0.85rem' }}>
              <MessageSquare size={14} strokeWidth={2.5} /> {md.comments}
            </span>
          )}
          {md.hoursAgo !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontWeight: 600, fontSize: '0.85rem' }}>
              <Clock size={14} strokeWidth={2.5} /> {md.hoursAgo === 0 ? 'Just now' : `${md.hoursAgo}h`}
            </span>
          )}
          {md.source && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#000', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>
              <Link2 size={12} /> {md.source}
            </span>
          )}
        </div>

        {card.description && (
          <div style={{ 
            color: '#333333', 
            fontSize: '0.9rem', 
            lineHeight: 1.5, 
            fontWeight: 500,
            marginBottom: '24px',
            fontFamily: 'Georgia, serif'
          }}>
            {card.description}
          </div>
        )}

        {/* Show HN: two buttons — HN discussion + external site */}
        {card.type === 'show_hn' ? (
          <div style={{ marginTop: 'auto', marginBottom: '24px', display: 'flex', gap: '8px' }}>
            <motion.a
              whileHover={{ background: '#000000', color: '#ffffff' }}
              whileTap={{ scale: 0.98 }}
              href={`https://news.ycombinator.com/item?id=${md.hnId}`}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'transparent', color: '#000000', border: '2px solid #000000', padding: '10px 12px',
                fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', textTransform: 'uppercase',
                letterSpacing: '0.05em', fontSize: '0.75rem'
              }}
            >
              <MessageSquare size={14} strokeWidth={3} />
              <span>Discussion</span>
            </motion.a>
            <motion.a
              whileHover={{ background: '#ff6600', color: '#000000', borderColor: '#ff6600' }}
              whileTap={{ scale: 0.98 }}
              href={card.url}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: '#000000', color: '#ffffff', border: '2px solid #000000', padding: '10px 12px',
                fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', textTransform: 'uppercase',
                letterSpacing: '0.05em', fontSize: '0.75rem'
              }}
            >
              <span>Visit Site</span>
              <ArrowUpRight size={14} strokeWidth={3} />
            </motion.a>
          </div>
        ) : (
          <motion.a 
            whileHover={{ background: '#000000', color: '#ffffff' }}
            whileTap={{ scale: 0.98 }}
            href={card.url} target="_blank" rel="noreferrer" 
            style={{
              marginTop: 'auto', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'transparent', color: '#000000', border: '2px solid #000000', padding: '10px 16px',
              fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', textTransform: 'uppercase',
              letterSpacing: '0.05em', fontSize: '0.8rem'
            }}
          >
            <span>{card.type === 'ask_hn' ? 'Read Discussion' : 'Read Full Discussion'}</span>
            <ArrowUpRight size={16} strokeWidth={3} />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};
