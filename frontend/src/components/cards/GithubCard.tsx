import React from 'react';
import { FeedCard } from '../../types/feed';
import { Terminal, Star, GitBranch, ArrowRight } from 'lucide-react';

export const GithubCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  return (
    <div style={{
      background: '#010409',
      border: '1px solid rgba(88, 166, 255, 0.2)',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '560px',
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 0 40px rgba(88, 166, 255, 0.05)',
      fontFamily: 'var(--font-sans)',
      padding: '32px',
      position: 'relative',
    }}>
      {/* Decorative top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #58a6ff, #1f6feb)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(88, 166, 255, 0.1)', padding: '12px', borderRadius: '12px', color: '#58a6ff' }}>
          <Terminal size={24} />
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#58a6ff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          OPEN SOURCE
        </span>
      </div>

      <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#c9d1d9', marginBottom: '8px', lineHeight: 1.2, wordBreak: 'break-word' }}>
        {md.repo || card.title}
      </h2>
      <div style={{ color: '#58a6ff', fontSize: '1.2rem', marginBottom: '20px', fontWeight: 500 }}>
        by {md.owner || 'unknown'}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#8b949e' }}>
        {md.stars && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(210, 153, 34, 0.1)', color: '#d29922', padding: '4px 8px', borderRadius: '4px' }}>
            <Star size={14} color="#d29922" /> {md.stars.toLocaleString()} stars total
          </span>
        )}
        {md.starsRecent && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#238636' }}>
            +{md.starsRecent} recent
          </span>
        )}
        {md.language && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#58a6ff' }} />
            {md.language}
          </span>
        )}
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        color: '#8b949e', 
        fontSize: '1.1rem', 
        lineHeight: 1.6, 
        marginBottom: '24px',
        paddingRight: '12px'
      }}>
        {card.description}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
        {md.topics?.map((t: string) => (
          <span key={t} style={{ background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
            {t}
          </span>
        ))}
      </div>

      <a href={card.url} target="_blank" rel="noreferrer" style={{
        marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        background: '#238636', color: '#ffffff', borderRadius: '8px', padding: '16px',
        fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s'
      }}>
        View Repository <ArrowRight size={16} />
      </a>
    </div>
  );
};
