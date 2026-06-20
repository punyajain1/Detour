import React from 'react';
import { SpaceNewsCard as SpaceNewsCardType } from '../../types/feed';
import { Calendar, ArrowUpRight, Rss, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const SpaceNewsCard: React.FC<{ card: SpaceNewsCardType }> = ({ card }) => {
  const md: any = card.metadata || {};
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#ffffff', // Light theme for editorial feel!
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Editorial Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Rss size={14} /> AEROSPACE BULLETIN
        </div>
        {md.newsSite && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#e2e8f0', padding: '4px 10px', borderRadius: '12px' }}>
            {md.newsSite}
          </span>
        )}
      </div>

      {card.imageUrl && (
        <div style={{ width: '100%', height: '40%', background: '#f1f5f9', overflow: 'hidden' }}>
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={card.imageUrl}
            alt={card.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Content Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto', background: '#ffffff' }}>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: 1.3 }}>
          {card.title}
        </h2>

        {/* Date Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
          <Clock size={14} /> {md.publishedAt || md.date ? new Date(md.publishedAt || md.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent'}
        </div>

        {/* Description */}
        <div style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
          {card.description || md.caption}
        </div>

        <motion.a
          whileHover={{ color: '#2563eb', x: 3 }}
          href={card.url} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#3b82f6', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px'
          }}
        >
          Read Full Article <ArrowUpRight size={18} />
        </motion.a>
      </div>
    </motion.div>
  );
};
