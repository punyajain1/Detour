import React from 'react';
import { FeedCard } from '../../types/feed';
import { Star, GitFork, ArrowRight, Book, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export const GithubCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  const getLanguageColor = (lang: string) => {
    switch (lang?.toLowerCase()) {
      case 'typescript': return '#3178c6';
      case 'javascript': return '#f1e05a';
      case 'python': return '#3572A5';
      case 'go': return '#00ADD8';
      case 'rust': return '#dea584';
      case 'java': return '#b07219';
      case 'c++': return '#f34b7d';
      default: return '#8b949e';
    }
  };

  const [owner, repo] = card.title.split('/');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
        width: '100%',
        maxWidth: '560px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '24px',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '50%', background: '#21262d', 
          border: '1px solid #30363d', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {owner ? (
            <img src={`https://github.com/${owner}.png?size=64`} alt={owner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
          ) : (
            <Book size={16} color="#8b949e" />
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
            <a href={card.url} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none', wordBreak: 'break-all' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
              {owner ? <span style={{ color: '#58a6ff', fontWeight: 400 }}>{owner} / </span> : null}
              <span style={{ fontWeight: 600 }}>{repo || card.title}</span>
            </a>
            <span style={{ border: '1px solid #30363d', borderRadius: '2em', color: '#8b949e', fontSize: '0.75rem', padding: '0 7px', marginLeft: '8px', fontWeight: 500, lineHeight: '18px' }}>Public</span>
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ color: '#8b949e', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px', wordWrap: 'break-word' }}>
          {card.description}
        </div>

        {md.topics && md.topics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
            {md.topics.map((t: string) => (
              <a key={t} href={`https://github.com/topics/${t}`} target="_blank" rel="noreferrer" style={{ background: '#1158c733', color: '#58a6ff', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.background = '#1158c755'} onMouseOut={(e) => e.currentTarget.style.background = '#1158c733'}>
                {t}
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#8b949e', marginBottom: '16px' }}>
          {md.language && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Circle size={12} fill={getLanguageColor(md.language)} color={getLanguageColor(md.language)} />
              <span>{md.language}</span>
            </div>
          )}
          
          {md.stars !== undefined && (
            <a href={`${card.url}/stargazers`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = '#58a6ff'} onMouseOut={(e) => e.currentTarget.style.color = '#8b949e'}>
              <Star size={14} /> <span>{md.stars.toLocaleString()}</span>
            </a>
          )}
          
          {md.forks !== undefined && (
            <a href={`${card.url}/network/members`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = '#58a6ff'} onMouseOut={(e) => e.currentTarget.style.color = '#8b949e'}>
              <GitFork size={14} /> <span>{md.forks.toLocaleString()}</span>
            </a>
          )}

          {md.starsRecent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#e3b341" color="#e3b341" /> <span style={{ color: '#e3b341' }}>{md.starsRecent} today</span>
            </div>
          )}
        </div>

        <motion.a 
          whileHover={{ background: '#30363d' }}
          whileTap={{ scale: 0.98 }}
          href={card.url} target="_blank" rel="noreferrer" 
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '6px 16px', borderRadius: '6px',
            fontWeight: 500, fontSize: '0.85rem', textDecoration: 'none', transition: 'background-color 0.2s',
            boxShadow: '0 1px 0 rgba(27,31,36,0.04)'
          }}
        >
          <Star size={16} /> Star repository
        </motion.a>
      </div>
    </motion.div>
  );
};
