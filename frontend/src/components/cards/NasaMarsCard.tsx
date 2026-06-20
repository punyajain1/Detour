import React from 'react';
import { GenericNasaCard } from '../../types/feed';
import { Orbit, Camera, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const NasaMarsCard: React.FC<{ card: GenericNasaCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#0a0a0a',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'var(--font-sans)',
        border: '1px solid #222'
      }}
    >
      {/* Uncropped Image Container */}
      {card.imageUrl && (
        <div style={{ width: '100%', height: '50%', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #222' }}>
          <img
            src={card.imageUrl}
            alt={card.title}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Content Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ background: '#222', color: '#ccc', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Orbit size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> {card.category}
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#ffffff', marginBottom: '16px', lineHeight: 1.3 }}>
          {card.title}
        </h2>

        {/* Generic Space Details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', color: '#888', fontSize: '0.9rem' }}>
          {(md.date || md.dateCreated) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {md.date || md.dateCreated}</span>
          )}
          {md.center && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Camera size={14} /> {md.center}</span>
          )}
        </div>

        {/* Full Description */}
        <div style={{ color: '#ccc', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
          {card.description || md.caption}
        </div>

        <motion.a
          whileHover={{ color: '#fff', x: 5 }}
          href={card.url} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: '#00e5ff', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none',
            marginTop: 'auto'
          }}
        >
          View Source <ArrowRight size={16} />
        </motion.a>
      </div>
    </motion.div>
  );
};
