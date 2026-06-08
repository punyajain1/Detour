import React from 'react';
import { FeedCard } from '../../types/feed';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const decodeHtml = (text: string) => {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

export const StackOverflowCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  return (
    <>
      <style>{`
        .so-card-layout {
          display: flex;
          flex-direction: row;
        }
        .so-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          min-width: 108px;
          margin-right: 16px;
          flex-shrink: 0;
          font-size: 13px;
        }
        @media (max-width: 500px) {
          .so-card-layout {
            flex-direction: column;
          }
          .so-stats {
            flex-direction: row;
            align-items: center;
            min-width: auto;
            margin-right: 0;
            margin-bottom: 12px;
            gap: 12px;
          }
        }
      `}</style>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        transition={{ duration: 0.2 }}
        style={{
          background: '#2d2d2d',
          border: '1px solid #444',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '750px',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI Adjusted", "Segoe UI", "Liberation Sans", sans-serif',
          color: '#e3e6e8',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
        onClick={() => window.open(card.url, '_blank')}
      >
        {/* Header with Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #444', paddingBottom: '12px' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Stack_Overflow_icon.svg" 
            alt="Stack Overflow"
            style={{ width: '20px', height: '20px' }}
          />
          <span style={{ color: '#babfc4', fontSize: '13px', fontWeight: 600 }}>Stack Overflow</span>
        </div>

        <div className="so-card-layout">
          {/* Left Column: Stats */}
          <div className="so-stats">
            {/* Votes */}
            <div style={{ color: '#e3e6e8' }}>
              <span style={{ fontWeight: 500, fontSize: '15px' }}>{md.score || 0}</span> votes
            </div>

            {/* Answers */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              borderRadius: '3px',
              border: md.isAnswered ? '1px solid transparent' : (md.answerCount > 0 ? '1px solid #5eba7d' : '1px solid transparent'),
              background: md.isAnswered ? '#2f6f44' : 'transparent',
              color: md.isAnswered ? '#ffffff' : (md.answerCount > 0 ? '#5eba7d' : '#babfc4'),
            }}>
              {md.isAnswered && <Check size={14} strokeWidth={3} />}
              <span><span style={{ fontWeight: md.isAnswered ? 700 : 500, fontSize: '14px' }}>{md.answerCount || 0}</span> answers</span>
            </div>
          </div>

          {/* Right Column: Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ 
              fontSize: '19px', 
              fontWeight: 400, 
              color: '#3ca4ff', 
              lineHeight: 1.3, 
              margin: '0 0 8px 0',
              wordBreak: 'break-word',
            }}>
              <a href={card.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = '#7aa7c7'} onMouseOut={(e) => e.currentTarget.style.color = '#3ca4ff'}>
                {decodeHtml(card.title)}
              </a>
            </h3>

            {/* Excerpt (if available) */}
            {card.description && (
              <div style={{ 
                fontSize: '13px', 
                lineHeight: 1.4, 
                color: '#e3e6e8',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
              }}>
                {decodeHtml(card.description)}
              </div>
            )}

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
              {md.tags?.map((t: string) => (
                <span 
                  key={t} 
                  style={{ 
                    background: '#3e4a52', 
                    color: '#9cc3db', 
                    padding: '4.8px 6px', 
                    borderRadius: '3px', 
                    fontSize: '12px', 
                    lineHeight: 1,
                    cursor: 'pointer' 
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#323941';
                    e.currentTarget.style.color = '#b3d3ea';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#3e4a52';
                    e.currentTarget.style.color = '#9cc3db';
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
