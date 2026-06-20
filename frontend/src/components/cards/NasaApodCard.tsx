import React from 'react';
import { NasaApodCard as ApodCardType } from '../../types/feed';
import { Camera, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const NasaApodCard: React.FC<{ card: ApodCardType }> = ({ card }) => {
  const md: any = card.metadata || {};
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: 'transparent',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        borderRadius: '12px',
      }}
    >
      {/* Top Metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ flex: 1, paddingRight: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#fff', margin: '0 0 12px 0', letterSpacing: '0.02em', lineHeight: 1.3 }}>
            {card.title}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#888', fontSize: '0.85rem' }}>
            {(md.date || md.dateCreated) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {md.date || md.dateCreated}</span>
            )}
            {md.copyright && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Camera size={12} /> {md.copyright}</span>
            )}
          </div>
        </div>
        <span style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px' }}>
          APOD
        </span>
      </div>

      {/* Image */}
      {card.imageUrl && (
        <div style={{ width: '100%', background: '#050505', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <img
            src={card.imageUrl}
            alt={card.title}
            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Description */}
      <div style={{ color: '#999', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px', fontWeight: 300, flex: 1 }}>
        {card.description || md.caption}
      </div>

      {/* Action */}
      <motion.a
        whileHover={{ opacity: 0.8 }}
        href={card.url} target="_blank" rel="noreferrer" style={{
          alignSelf: 'flex-start',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#fff', fontSize: '0.9rem', textDecoration: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px'
        }}
      >
        Explore Origin <ArrowRight size={14} />
      </motion.a>
    </motion.div>
  );
};
