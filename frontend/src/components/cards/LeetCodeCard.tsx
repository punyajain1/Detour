import React from 'react';
import { FeedCard } from '../../types/feed';
import { Award, Code, CheckCircle, ArrowRight } from 'lucide-react';

export const LeetCodeCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return '#00b8a3';
      case 'medium': return '#ffc01e';
      case 'hard': return '#ff375f';
      default: return '#888';
    }
  };

  const diffColor = getDifficultyColor(md.difficulty);

  return (
    <div style={{
      background: '#282828', // Leetcode editor dark bg
      border: '1px solid #444',
      borderRadius: '16px', // Sharper corners for a coding tool vibe
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
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: diffColor }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffa116', fontWeight: 600 }}>
          <Code size={20} /> <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Algorithm</span>
        </div>
        {md.difficulty && (
          <div style={{ background: `${diffColor}22`, color: diffColor, padding: '4px 12px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem' }}>
            {md.difficulty}
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#ffffff', marginBottom: '20px', lineHeight: 1.3 }}>
        {card.title}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', color: '#aaa', fontSize: '0.9rem' }}>
        {md.acceptanceRate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} color="#00b8a3" /> {md.acceptanceRate.toFixed(1)}% Acceptance
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={16} /> Premium Quality
        </span>
      </div>

      <div style={{ 
        flex: 1, overflowY: 'auto', color: '#cfcfcf', fontSize: '1.05rem', lineHeight: 1.6, 
        background: '#1e1e1e', padding: '24px', borderRadius: '8px', border: '1px solid #333'
      }}>
        <div style={{ fontFamily: 'monospace', color: '#7a7a7a', marginBottom: '12px' }}>// Problem Statement</div>
        {card.description}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', marginBottom: '32px' }}>
        {md.topicTags?.map((t: {name: string}) => (
          <span key={t.name} style={{ background: '#333', color: '#ccc', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
            {t.name}
          </span>
        ))}
      </div>

      <a href={card.url} target="_blank" rel="noreferrer" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        background: '#ffa116', color: '#000', padding: '16px', borderRadius: '8px',
        fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s'
      }}>
        Solve Problem <ArrowRight size={18} />
      </a>
    </div>
  );
};
