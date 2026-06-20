import React from 'react';
import { JwstCard as JwstCardType } from '../../types/feed';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const JwstCard: React.FC<{ card: JwstCardType }> = ({ card }) => {
  const md: any = card.metadata || {};
  
  // Filter out long text fields or fields we've already displayed
  const excludedKeys = ['caption', 'description', 'title'];
  const metadataEntries = Object.entries(md).filter(([key, val]) => {
    return !excludedKeys.includes(key) && val !== null && val !== undefined && val !== '';
  });

  const formatKey = (key: string) => {
    const spaced = key.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        padding: '28px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#ffffff', margin: '0 0 24px 0', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
        {card.title}
      </h2>

      {card.imageUrl && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <img
            src={card.imageUrl}
            alt={card.title}
            style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px' }}
            loading="lazy"
          />
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Dynamic Metadata Grid */}
        {metadataEntries.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
            gap: '20px', 
            marginBottom: '28px',
            borderLeft: '2px solid rgba(255,255,255,0.1)',
            paddingLeft: '16px'
          }}>
            {metadataEntries.map(([key, value]) => {
              let displayValue: string = '';
              
              if (Array.isArray(value)) {
                displayValue = value.join(', ');
              } else if (value && typeof value === 'object') {
                try {
                  displayValue = Object.values(value).join(', ');
                } catch (e) {
                  displayValue = JSON.stringify(value);
                }
              } else {
                displayValue = String(value);
              }
              
              if (!displayValue || displayValue === 'undefined') return null;

              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ color: '#777', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {formatKey(key)}
                  </span>
                  <span style={{ color: '#e0e0e0', fontSize: '0.85rem', fontWeight: 500 }}>
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ color: '#a0a0a0', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
          {card.description || md.caption}
        </div>

        <motion.a
          whileHover={{ x: 5, color: '#fff' }}
          href={card.url} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#d4af37', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
            marginTop: 'auto', alignSelf: 'flex-start'
          }}
        >
          View Full Details <ArrowRight size={14} />
        </motion.a>
      </div>
    </motion.div>
  );
};
