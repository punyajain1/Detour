import React from 'react';
import { FeedCard } from '../../types/feed';
import { BookOpen, Calendar, Clock, Terminal, Newspaper, LayoutTemplate, Database, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemDesignCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  // Source-specific icons and colors
  const getSourceConfig = (source: string) => {
    switch(source) {
      case 'engineering_blog':
        return { icon: <Terminal size={14} />, color: '#1a8917', label: 'Engineering Blog' }; // Medium green
      case 'hackernews':
        return { icon: <Newspaper size={14} />, color: '#ff6600', label: 'Hacker News' }; // HN orange
      case 'arxiv_paper':
        return { icon: <BookOpen size={14} />, color: '#b31b1b', label: 'Research Paper' }; // Cornell red
      case 'architecture_blog':
        return { icon: <LayoutTemplate size={14} />, color: '#4a90e2', label: 'Architecture Blog' };
      case 'database_blog':
        return { icon: <Database size={14} />, color: '#00684a', label: 'Database Blog' };
      case 'infrastructure_blog':
        return { icon: <Server size={14} />, color: '#8e44ad', label: 'Infrastructure Blog' };
      default:
        return { icon: <LayoutTemplate size={14} />, color: '#292929', label: 'System Design' };
    }
  };

  const sourceConfig = getSourceConfig(md.source);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 14px 28px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: '#ffffff',
        border: '1px solid #f0f0f0',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        padding: '32px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        cursor: 'pointer'
      }}
      onClick={() => window.open(card.url, '_blank')}
    >
      {/* Meta Information header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', 
          color: sourceConfig.color, fontWeight: 600, fontSize: '0.8rem', 
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          {sourceConfig.icon}
          <span>{sourceConfig.label}</span>
        </div>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d1d1' }} />
        <div style={{ color: '#757575', fontSize: '0.85rem', fontWeight: 500 }}>
          {md.authorOrCompany}
        </div>
      </div>

      {/* Main Title */}
      <h2 style={{ 
        fontSize: '1.75rem', 
        fontWeight: 700, 
        color: '#292929', 
        marginBottom: '12px', 
        lineHeight: 1.25, 
        letterSpacing: '-0.02em', 
        fontFamily: 'Georgia, serif' 
      }}>
        {card.title}
      </h2>

      {/* Description / Excerpt */}
      <div style={{ 
        color: '#6b6b6b', 
        fontSize: '1rem', 
        lineHeight: 1.6, 
        fontWeight: 400,
        marginBottom: '28px',
        fontFamily: 'Georgia, serif',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {card.description}
      </div>

      <div style={{ flexGrow: 1 }} />

      {/* Footer Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {md.publishedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#757575', fontSize: '0.8rem', fontWeight: 400 }}>
              <Calendar size={14} /> 
              {new Date(md.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {md.readingTimeMinutes && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#757575', fontSize: '0.8rem', fontWeight: 400 }}>
              <Clock size={14} /> 
              {md.readingTimeMinutes} min read
            </span>
          )}
        </div>
        
        {/* Tags */}
        {md.tags && md.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {md.tags.slice(0, 2).map((tag: string, i: number) => (
              <span key={i} style={{ 
                background: '#f2f2f2', color: '#757575', fontSize: '0.75rem', 
                padding: '4px 8px', borderRadius: '100px', fontWeight: 500, textTransform: 'lowercase'
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
