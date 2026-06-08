import React from 'react';
import { FeedCard } from '../../types/feed';
import { Award, Code, CheckCircle, ArrowRight, Circle, Play } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
      transition={{ duration: 0.3 }}
      style={{
        background: '#1e1e1e', // VS Code dark theme bg
        border: '1px solid #333',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}
    >
      {/* Editor Window Controls */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#2d2d2d', padding: '10px 16px', borderBottom: '1px solid #111' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Circle size={12} fill="#ff5f56" color="#ff5f56" />
          <Circle size={12} fill="#ffbd2e" color="#ffbd2e" />
          <Circle size={12} fill="#27c93f" color="#27c93f" />
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: '#999', fontSize: '0.75rem', fontFamily: 'monospace' }}>
          solution.ts — LeetCode
        </div>
      </div>

      <div style={{ padding: '20px 24px 0 24px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffa116', fontWeight: 600 }}>
            <Code size={16} /> <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Algorithm</span>
          </div>
          {md.difficulty && (
            <motion.div
              animate={{ boxShadow: [`0 0 0px ${diffColor}`, `0 0 10px ${diffColor}`, `0 0 0px ${diffColor}`] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ background: `${diffColor}22`, border: `1px solid ${diffColor}55`, color: diffColor, padding: '2px 10px', borderRadius: '100px', fontWeight: 700, fontSize: '0.75rem' }}
            >
              {md.difficulty}
            </motion.div>
          )}
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '16px', lineHeight: 1.3 }}>
          {card.title}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ display: 'inline-block', width: '8px', height: '16px', background: '#ffa116', marginLeft: '6px', verticalAlign: 'middle' }}
          />
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#aaa', fontSize: '0.8rem', padding: '8px', background: '#252526', borderRadius: '6px' }}>
          {md.acceptanceRate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} color="#00b8a3" /> <span style={{ color: '#00b8a3', fontWeight: 600 }}>{md.acceptanceRate.toFixed(1)}%</span> Acceptance
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffa116' }}>
            <Award size={14} /> Premium Quality
          </span>
        </div>

        {/* Mock Code Block for Description */}
        <div style={{
          flex: 1, color: '#cfcfcf', fontSize: '0.85rem', lineHeight: 1.5,
          fontFamily: 'monospace', position: 'relative', paddingLeft: '32px',
          overflowY: 'auto'
        }}>
          {/* Line Numbers Fake (Fixed position, let content scroll next to it if needed) */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20px', borderRight: '1px solid #333', color: '#666', textAlign: 'right', paddingRight: '6px', display: 'flex', flexDirection: 'column', fontSize: '0.8rem', userSelect: 'none' }}>
            {Array.from({ length: 20 }).map((_, i) => <span key={i} style={{ lineHeight: 1.5 }}>{i + 1}</span>)}
          </div>
          <div style={{ color: '#6a9955', marginBottom: '16px', whiteSpace: 'pre-wrap', paddingLeft: '8px' }}>
            {'/**\n * Problem Statement:\n * ' + (card.description || '').replace(/\n/g, '\n * ') + '\n */'}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px', marginBottom: '24px' }}>
          {md.topicTags?.map((t: { name: string }) => (
            <motion.span
              whileHover={{ color: '#fff', background: '#444' }}
              key={t.name} style={{ background: '#333', color: '#ccc', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {t.name}
            </motion.span>
          ))}
        </div>

        <motion.a
          whileHover={{ scale: 1.02, background: '#ffb347' }}
          whileTap={{ scale: 0.98 }}
          href={card.url} target="_blank" rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#ffa116', color: '#000', padding: '12px', borderRadius: '6px',
            fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', marginBottom: '24px',
            fontFamily: 'var(--font-sans)', fontSize: '0.95rem'
          }}
        >
          <Play size={16} fill="#000" /> Run Solution
        </motion.a>
      </div>
    </motion.div>
  );
};

