import React from 'react';
import { FeedCard } from '../../../types/feed';
import { HelpCircle, ThumbsUp, MessageCircle, ArrowRight } from 'lucide-react';

export const StackOverflowCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #222',
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#888' }}>
          <ThumbsUp size={24} color={md.score > 10 ? '#f48024' : '#888'} />
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ddd' }}>{md.score || 0}</span>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0a95ff', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <HelpCircle size={16} /> Question
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#f5f5f5', lineHeight: 1.3 }}>
            {card.title}
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px', marginLeft: '40px' }}>
        {md.tags?.map((t: string) => (
          <span key={t} style={{ background: 'rgba(10, 149, 255, 0.1)', color: '#0a95ff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ 
        flex: 1, overflowY: 'auto', color: '#bbb', fontSize: '1.05rem', lineHeight: 1.6, 
        background: '#151515', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #f48024'
      }}>
        {card.description}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: md.isAnswered ? '#2e7d32' : '#888', fontWeight: 600 }}>
          <MessageCircle size={18} /> {md.answerCount || 0} Answers {md.isAnswered ? '(Resolved)' : ''}
        </div>
        
        <a href={card.url} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#0a95ff', fontWeight: 600, textDecoration: 'none'
        }}>
          View Discussion <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};
