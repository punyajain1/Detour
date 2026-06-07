import React from 'react';
import { FeedCard } from '../../types/feed';
import { ArrowUpRight, MessageSquare, TrendingUp } from 'lucide-react';

export const HackerNewsCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #333',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '560px',
      height: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '32px',
      fontFamily: 'var(--font-sans)',
      position: 'relative'
    }}>
      {/* Orange accent tag */}
      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: '#ff6600', color: 'white', padding: '6px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '32px' }}>
        Y COMBINATOR
      </div>

      <h2 style={{ fontSize: '2.5rem', fontWeight: 500, color: '#f5f5f5', marginBottom: '24px', lineHeight: 1.15, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }}>
        "{card.title}"
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', color: '#ff6600', fontWeight: 600, fontSize: '0.9rem' }}>
        {md.points && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} /> {md.points} points
          </span>
        )}
        {md.comments && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888' }}>
            <MessageSquare size={16} /> {md.comments} comments
          </span>
        )}
        {md.hoursAgo !== undefined && (
          <span style={{ color: '#555' }}>
            {md.hoursAgo === 0 ? 'Just now' : `${md.hoursAgo} hours ago`}
          </span>
        )}
        {md.source && (
          <span style={{ color: '#888', fontStyle: 'italic' }}>
            ({md.source})
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', color: '#aaa', fontSize: '1.1rem', lineHeight: 1.7, fontWeight: 300 }}>
        {card.description}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #333' }}>
        <a href={card.url} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#f5f5f5', textDecoration: 'none', fontWeight: 500, fontSize: '1.1rem'
        }}>
          <span>Read Discussion</span>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={20} />
          </div>
        </a>
      </div>
    </div>
  );
};
