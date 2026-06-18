import React from 'react';
import { FeedCard } from '../../types/feed';
import { Code2, Users, ArrowUpRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

type CFCard = Extract<FeedCard, { type: 'codeforces' }>;

function getRatingColor(rating?: number): { color: string; label: string } {
  if (!rating) return { color: '#000000', label: 'Unrated' };
  if (rating >= 3000) return { color: '#FF0000', label: 'Legendary Grandmaster' };
  if (rating >= 2600) return { color: '#FF0000', label: 'International Grandmaster' };
  if (rating >= 2400) return { color: '#FF3333', label: 'Grandmaster' };
  if (rating >= 2100) return { color: '#FF8C00', label: 'International Master' };
  if (rating >= 1900) return { color: '#FF8C00', label: 'Master' };
  if (rating >= 1600) return { color: '#AA00AA', label: 'Expert' };
  if (rating >= 1400) return { color: '#0000FF', label: 'Specialist' };
  if (rating >= 1200) return { color: '#03A89E', label: 'Pupil' };
  return { color: '#808080', label: 'Newbie' };
}

export const CodeforcesCard: React.FC<{ card: CFCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  const { color, label } = getRatingColor(md.rating);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: `8px 8px 0px ${color}` }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#ffffff',
        border: `2px solid #000000`,
        borderRadius: '0px',
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Verdana, Arial, sans-serif',
        boxShadow: `4px 4px 0px #000000`,
      }}
    >
      {/* Header */}
      <div style={{
        background: '#3B5998', // Classic Codeforces Blue
        borderBottom: `2px solid #000000`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={22} strokeWidth={2.5} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>CODEFORCES</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Contest #{md.contestId} — {md.index}</span>
          </div>
        </div>

        {/* Rating badge */}
        {md.rating && (
          <div style={{
            background: '#ffffff',
            border: '2px solid #000000',
            padding: '4px 12px',
            textAlign: 'center',
            boxShadow: '2px 2px 0px #000000',
          }}>
            <div style={{
              color,
              fontWeight: 900,
              fontSize: '1.2rem',
              lineHeight: 1,
            }}>
              {md.rating}
            </div>
            <div style={{ color: '#000000', fontSize: '0.65rem', marginTop: '2px', fontWeight: 800 }}>{label.toUpperCase()}</div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: 800,
          color: '#000000',
          lineHeight: 1.3,
        }}>
          {card.title}
        </h2>

        {/* Solved count */}
        {md.solvedCount !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000', fontSize: '0.9rem', fontWeight: 700 }}>
            <Users size={18} strokeWidth={2.5} />
            <span><span style={{ color: color, fontSize: '1.05rem', WebkitTextStroke: '0.5px #000' }}>{md.solvedCount.toLocaleString()}</span> users solved this</span>
          </div>
        )}

        {/* Difficulty indicator bar */}
        {md.rating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#000000', fontWeight: 800, textTransform: 'uppercase' }}>
              <span>Difficulty</span>
              <span style={{ color, WebkitTextStroke: '0.5px #000' }}>★ {md.rating}</span>
            </div>
            <div style={{ border: '2px solid #000000', height: '12px', background: '#f0f0f0' }}>
              <div style={{
                width: `${Math.min((md.rating / 3500) * 100, 100)}%`,
                height: '100%',
                background: color,
                borderRight: '2px solid #000000',
              }} />
            </div>
          </div>
        )}

        {/* Tags */}
        {md.tags?.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              <Tag size={16} strokeWidth={2.5} /> Algorithm Tags
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {md.tags.slice(0, 6).map((t: string) => (
                <span key={t} style={{
                  background: '#ffffff',
                  color: '#000000',
                  border: `2px solid #000000`,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '2px 2px 0px #000000',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <motion.a
          whileHover={{ background: '#000000', color: '#ffffff' }}
          whileTap={{ scale: 0.98 }}
          href={card.url}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#ffffff',
            color: '#000000',
            border: `2px solid #000000`,
            padding: '12px 16px',
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'all 0.2s',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
          }}
        >
          <span>Solve on Codeforces</span>
          <ArrowUpRight size={18} strokeWidth={2.5} />
        </motion.a>
      </div>
    </motion.div>
  );
};
