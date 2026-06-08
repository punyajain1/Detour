import React from 'react';
import { FeedCard } from '../../types/feed';
import { Orbit, Camera, Calendar, ArrowRight, AlertTriangle, Activity, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const NasaCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  const isAsteroid = card.type === 'nasa_neows';

  if (isAsteroid) {
    const isHaz = md.isPotentiallyHazardous;
    const themeColor = isHaz ? '#ff2a5f' : '#00f0ff';
    const bgGradient = isHaz 
      ? 'radial-gradient(circle at top right, rgba(255, 42, 95, 0.15), transparent 60%), #050508'
      : 'radial-gradient(circle at top right, rgba(0, 240, 255, 0.15), transparent 60%), #050508';

    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -5, boxShadow: `0 10px 40px rgba(${isHaz ? '255, 42, 95' : '0, 240, 255'}, 0.2)` }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: bgGradient,
          border: `1px solid rgba(${isHaz ? '255, 42, 95' : '0, 240, 255'}, 0.3)`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Background Icon Watermark */}
        <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.03, pointerEvents: 'none', color: themeColor }}>
          <Target size={300} />
        </div>

        {/* Header section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', fontWeight: 700 }}>
            <Activity size={16} /> NEO Telemetry
          </div>
          <motion.div 
            animate={{ opacity: [1, 0.6, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ 
              background: isHaz ? 'rgba(255, 42, 95, 0.15)' : 'rgba(0, 240, 255, 0.15)', 
              color: themeColor, 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontWeight: 800, 
              fontSize: '0.75rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              border: `1px solid rgba(${isHaz ? '255, 42, 95' : '0, 240, 255'}, 0.4)`,
              boxShadow: `0 0 10px rgba(${isHaz ? '255, 42, 95' : '0, 240, 255'}, 0.2)`
            }}
          >
            <ShieldAlert size={14} /> {isHaz ? 'HAZARDOUS' : 'SAFE'}
          </motion.div>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px', lineHeight: 1.2, zIndex: 1, letterSpacing: '-0.02em' }}>
          {card.title}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', marginBottom: '12px', fontSize: '0.9rem', zIndex: 1, fontWeight: 500 }}>
          <Calendar size={14} color={themeColor} />
          Closest Approach: <span style={{ color: '#ccc' }}>{md.closestApproachDate}</span>
        </div>

        {card.description && (
          <div style={{ color: '#a0a0a0', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.5, zIndex: 1 }}>
            {card.description}
          </div>
        )}

        {/* Stats List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#a0a0a0', fontSize: '0.95rem', zIndex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Relative Velocity:</strong></span>
            <span>{Math.round(md.relativeVelocityKmh).toLocaleString()} km/h</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Miss Distance:</strong></span>
            <span>{Math.round(md.missDistanceKm).toLocaleString()} km</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Diameter Range:</strong></span>
            <span>{md.estimatedDiameterMinKm?.toFixed(3)} - {md.estimatedDiameterMaxKm?.toFixed(3)} km</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Absolute Magnitude:</strong></span>
            <span>{md.absoluteMagnitude?.toFixed(2)} H</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Orbiting Body:</strong></span>
            <span>{md.orbitingBody || 'Sun'}</span>
          </div>
        </div>

        {/* Footer Action */}
        <motion.a 
          whileHover={{ gap: '12px', color: '#fff' }}
          href={card.url} target="_blank" rel="noreferrer" 
          style={{
            marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px',
            color: themeColor, textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', fontSize: '0.9rem', zIndex: 1, padding: '12px 0'
          }}
        >
          Access Deep Space Data <ArrowRight size={18} />
        </motion.a>
      </motion.div>
    );
  }

  // Normal Space Card (Image Focused)
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#0a0a0a',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'var(--font-sans)',
        border: '1px solid #222'
      }}
    >
      {/* Uncropped Image Container */}
      {card.imageUrl && (
        <div style={{ width: '100%', height: '50%', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #222' }}>
          <img 
            src={card.imageUrl} 
            alt={card.title} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Content Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ background: '#222', color: '#ccc', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Orbit size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> {card.category}
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#ffffff', marginBottom: '16px', lineHeight: 1.3 }}>
          {card.title}
        </h2>

        {/* Generic Space Details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', color: '#888', fontSize: '0.9rem' }}>
          {(md.date || md.dateCreated) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {md.date || md.dateCreated}</span>
          )}
          {md.center && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Camera size={14} /> {md.center}</span>
          )}
        </div>

        {/* Full Description */}
        <div style={{ color: '#ccc', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
          {card.description || md.caption}
        </div>

        <motion.a 
          whileHover={{ color: '#fff', x: 5 }}
          href={card.url} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: '#00e5ff', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none',
            marginTop: 'auto'
          }}
        >
          View Source <ArrowRight size={16} />
        </motion.a>
      </div>
    </motion.div>
  );
};
