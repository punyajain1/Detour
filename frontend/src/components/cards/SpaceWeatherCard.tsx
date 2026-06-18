import React from 'react';
import { FeedCard } from '../../types/feed';
import { ArrowUpRight, Radio, Zap, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

type SWCard = Extract<FeedCard, { type: 'space_weather' }>;

const ALERT_TYPE_CONFIG = {
  flare: { emoji: '☀️', label: 'SOLAR FLARE', color: '#ff6600', bg: '#ffffff' },
  geomagnetic: { emoji: '🌍', label: 'GEOMAGNETIC STORM', color: '#4caf50', bg: '#ffffff' },
  radiation: { emoji: '⚡', label: 'RADIATION STORM', color: '#a855f7', bg: '#ffffff' },
  general: { emoji: '📡', label: 'SPACE WEATHER ALERT', color: '#000000', bg: '#ffffff' },
};

function getKpColor(kp: number): string {
  if (kp >= 7) return '#ff0000';
  if (kp >= 5) return '#ff6600';
  if (kp >= 3) return '#ffcc00';
  return '#4caf50';
}

function getKpLabel(kp: number): string {
  if (kp >= 7) return 'SEVERE';
  if (kp >= 5) return 'MODERATE';
  if (kp >= 3) return 'ACTIVE';
  return 'QUIET';
}

export const SpaceWeatherCard: React.FC<{ card: SWCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  const alertType = md.alertType as keyof typeof ALERT_TYPE_CONFIG ?? 'general';
  const cfg = ALERT_TYPE_CONFIG[alertType] ?? ALERT_TYPE_CONFIG.general;
  const kp: number | undefined = md.kpIndex !== undefined ? Number(md.kpIndex) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: `8px 8px 0px #000000` }}
      transition={{ duration: 0.2 }}
      style={{
        background: cfg.bg,
        border: `2px solid #000000`,
        borderRadius: '0px',
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        boxShadow: `4px 4px 0px #000000`,
      }}
    >
      {/* Header */}
      <div style={{
        background: cfg.color,
        borderBottom: `2px solid #000000`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800 }}>
          <Radio size={20} strokeWidth={2.5} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>NOAA SPACE WEATHER</span>
            <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
        </div>
        {/* Scale badge */}
        {md.scale && (
          <span style={{
            background: '#ffffff',
            color: '#000000',
            border: `2px solid #000000`,
            padding: '4px 12px',
            fontWeight: 900,
            fontSize: '1rem',
            fontFamily: 'ui-monospace, monospace',
            boxShadow: '2px 2px 0px #000000',
          }}>
            {md.scale}
          </span>
        )}
        {md.classification && !md.scale && (
          <span style={{
            background: '#ffffff',
            color: '#000000',
            border: `2px solid #000000`,
            padding: '4px 12px',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: '2px 2px 0px #000000',
          }}>
            {md.classification}
          </span>
        )}
      </div>

      {/* Kp gauge */}
      {kp !== undefined && (
        <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000', fontSize: '0.85rem', fontWeight: 800 }}>
              <Wind size={18} strokeWidth={2.5} /> Kp INDEX
            </div>
            <span style={{ color: getKpColor(kp), fontWeight: 900, fontSize: '1.2rem', fontFamily: 'ui-monospace, monospace', WebkitTextStroke: '1px #000' }}>
              {kp.toFixed(1)} <span style={{ fontSize: '0.8rem', color: '#000000', WebkitTextStroke: '0' }}>{getKpLabel(kp)}</span>
            </span>
          </div>
          {/* Gauge bar */}
          <div style={{ display: 'flex', gap: '4px', height: '16px' }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{
                flex: 1,
                border: '2px solid #000000',
                background: i < Math.round(kp)
                  ? (i >= 6 ? '#ff0000' : i >= 4 ? '#ff6600' : i >= 2 ? '#ffcc00' : '#4caf50')
                  : '#e0e0e0',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: 800,
          color: '#000000',
          lineHeight: 1.4,
        }}>
          {card.title}
        </h2>

        <p style={{
          margin: 0,
          color: '#333333',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          fontWeight: 500,
          maxHeight: '120px',
          overflow: 'hidden',
        }}>
          {card.description}
        </p>

        {/* Alert metadata */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {md.issuedAt && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontSize: '0.8rem',
              background: '#ffffff', border: '2px solid #000000', padding: '6px 12px', fontWeight: 700, boxShadow: '2px 2px 0px #000000'
            }}>
              <Zap size={14} strokeWidth={2.5} />
              {new Date(md.issuedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Aurora note for geomagnetic */}
        {alertType === 'geomagnetic' && kp !== undefined && kp >= 5 && (
          <div style={{
            background: '#e8f5e9',
            border: '2px solid #4caf50',
            padding: '12px 16px',
            color: '#000000',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '4px 4px 0px #4caf50',
          }}>
            🌌 AURORA BOREALIS LIKELY AT HIGH LATITUDES
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
            border: '2px solid #000000',
            padding: '12px 16px',
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'all 0.2s',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>NOAA Space Weather Center</span>
          <ArrowUpRight size={18} strokeWidth={2.5} />
        </motion.a>
      </div>
    </motion.div>
  );
};
