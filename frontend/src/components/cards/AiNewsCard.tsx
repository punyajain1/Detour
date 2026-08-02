import React from 'react';
import { FeedCard } from '../../types/feed';
import { Sparkles, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

type AINewsCardType = Extract<FeedCard, { type: 'ai_news' }>;

export const AiNewsCard: React.FC<{ card: AINewsCardType }> = ({ card }) => {
  const md = card.metadata || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 14px 28px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        padding: '32px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        cursor: 'pointer',
        alignSelf: 'center'
      }}
      onClick={() => window.open(card.url, '_blank')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', 
          color: '#8A2BE2', fontWeight: 600, fontSize: '0.8rem', 
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <Sparkles size={14} />
          <span>AI News</span>
        </div>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d1d1' }} />
        <div style={{ color: '#757575', fontSize: '0.85rem', fontWeight: 500 }}>
          {md.source || md.authorOrCompany}
        </div>
      </div>

      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 700, 
        color: '#292929', 
        marginBottom: '12px', 
        lineHeight: 1.3,
        fontFamily: 'var(--font-sans)'
      }}>
        {card.title}
      </h2>

      {card.imageUrl && (
        <div style={{ width: '100%', height: '200px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
          <img src={card.imageUrl} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ 
        color: '#4b5563', 
        fontSize: '1rem', 
        lineHeight: 1.6, 
        marginBottom: '24px',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {card.description}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: 'auto' }}>
        <Calendar size={14} style={{ marginRight: '6px' }} />
        {md.publishedAt ? new Date(md.publishedAt).toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric'
        }) : 'Recent'}
      </div>
    </motion.div>
  );
};
