import React, { useState } from 'react';
import { NasaImageLibraryCard as ImageLibraryCardType } from '../../types/feed';
import { Camera, Calendar, MapPin, Tag, ArrowRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NasaImageLibraryCard: React.FC<{ card: ImageLibraryCardType }> = ({ card }) => {
  const md = card.metadata;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formattedDate = md.dateCreated
    ? new Date(md.dateCreated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 24px 48px rgba(0,0,0,0.8)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background: '#080808',
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
        border: '1px solid #1a1a1a',
      }}
    >
      {/* Image container */}
      <div style={{
        width: '100%',
        height: '52%',
        flexShrink: 0,
        background: '#030303',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #1a1a1a',
      }}>
        {!imgLoaded && !imgError && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #0a0a0a, #111, #0a0a0a)',
            }}
          />
        )}

        <AnimatePresence>
          {imgError && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#444' }}
            >
              <Camera size={32} />
              <span style={{ fontSize: '0.8rem' }}>Image unavailable</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!imgError && (
          <motion.img
            src={card.imageUrl}
            alt={card.title}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            animate={{ opacity: imgLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#000',
            }}
            loading="lazy"
          />
        )}

        {/* Query chip overlay */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          color: '#aaa',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Search size={10} /> {md.searchQuery}
        </div>

        {/* NASA logo chip */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: '4px 10px',
          color: '#e11d48',
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          border: '1px solid rgba(225,29,72,0.25)',
        }}>
          NASA
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 24px', overflowY: 'auto' }}>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#555', fontSize: '0.8rem', marginBottom: '12px' }}>
          {formattedDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {formattedDate}
            </span>
          )}
          {md.center && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Camera size={12} /> {md.center}
            </span>
          )}
          {md.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {md.location}
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#ffffff', marginBottom: '12px', lineHeight: 1.35 }}>
          {card.title}
        </h2>

        <p style={{ color: '#888', fontSize: '0.93rem', lineHeight: 1.65, marginBottom: '18px', flex: 1 }}>
          {card.description}
        </p>

        {/* Keywords */}
        {md.keywords && md.keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
            {md.keywords.slice(0, 5).map((kw) => (
              <span key={kw} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #222',
                borderRadius: '6px',
                padding: '2px 8px',
                color: '#666',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Tag size={9} /> {kw}
              </span>
            ))}
          </div>
        )}

        <motion.a
          whileHover={{ color: '#fff', x: 4 }}
          href={card.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#e11d48',
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
            marginTop: 'auto',
          }}
        >
          View in NASA Image Library <ArrowRight size={15} />
        </motion.a>
      </div>
    </motion.div>
  );
};
