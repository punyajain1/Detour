import React from 'react';
import { FeedCard } from '../../types/feed';
import { ShieldAlert, AlertTriangle, ArrowUpRight, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';

type CVEFeedCard = Extract<FeedCard, { type: 'cve' }>;

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  CRITICAL: {
    color: '#ff0000',
    bg: '#ffcccc',
    icon: <ShieldAlert size={18} strokeWidth={2.5} />,
    label: 'CRITICAL',
  },
  HIGH: {
    color: '#ff6600',
    bg: '#ffe6cc',
    icon: <AlertTriangle size={18} strokeWidth={2.5} />,
    label: 'HIGH',
  },
  MEDIUM: {
    color: '#ffcc00',
    bg: '#fff5cc',
    icon: <AlertTriangle size={18} strokeWidth={2.5} />,
    label: 'MEDIUM',
  },
  LOW: {
    color: '#4caf50',
    bg: '#e8f5e9',
    icon: <AlertTriangle size={18} strokeWidth={2.5} />,
    label: 'LOW',
  },
  NONE: {
    color: '#000000',
    bg: '#f0f0f0',
    icon: <AlertTriangle size={18} strokeWidth={2.5} />,
    label: 'NONE',
  },
};

export const SecurityCard: React.FC<{ card: CVEFeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  const sev = SEVERITY_CONFIG[md.severity ?? 'NONE'] ?? SEVERITY_CONFIG.NONE;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: `8px 8px 0px #000000` }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '0px',
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        boxShadow: '4px 4px 0px #000000',
      }}
    >
      {/* Hazard Banner Header */}
      <div style={{
        background: sev.color,
        borderBottom: '2px solid #000000',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#000000', // Black text for high contrast on bright hazard colors
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
          {sev.icon}
          <span>SECURITY ADVISORY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {md.cvssScore !== undefined && (
            <span style={{
              background: '#000000',
              color: sev.color,
              padding: '2px 8px',
              fontWeight: 900,
              fontSize: '0.85rem',
            }}>
              {md.cvssScore.toFixed(1)}
            </span>
          )}
          <span style={{
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            padding: '2px 8px',
            fontWeight: 800,
            fontSize: '0.75rem',
            boxShadow: '2px 2px 0px #000000',
          }}>
            {sev.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* CVE ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: sev.bg,
            color: '#000000',
            border: '2px solid #000000',
            padding: '4px 12px',
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            boxShadow: '2px 2px 0px #000000',
          }}>
            {md.cveId}
          </span>
          {md.publishedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontSize: '0.85rem', fontWeight: 600 }}>
              <Calendar size={14} strokeWidth={2.5} />
              {new Date(md.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <h2 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: 800,
          color: '#000000',
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}>
          {card.description.slice(0, 200)}{card.description.length > 200 ? '...' : ''}
        </h2>

        {/* Affected products */}
        {md.affectedProducts?.length > 0 && (
          <div>
            <div style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Affected Products</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {md.affectedProducts.slice(0, 5).map((p: string) => (
                <span key={p} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0f0f0',
                  border: '2px solid #000000',
                  color: '#000000',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  <Package size={14} strokeWidth={2.5} />
                  {p}
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
            marginTop: '8px',
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
          <span>View on NVD</span>
          <ArrowUpRight size={18} strokeWidth={2.5} />
        </motion.a>
      </div>
    </motion.div>
  );
};
