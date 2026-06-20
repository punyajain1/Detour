import React from 'react';
import { NasaExoplanetCard as ExoplanetCardType } from '../../types/feed';
import { SatelliteDish, Orbit, Globe, Thermometer, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const NasaExoplanetCard: React.FC<{ card: ExoplanetCardType }> = ({ card }) => {
  const md = card.metadata;

  const getMethodConfig = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'transit':
        return { color: '#0369a1', label: 'Transit' };
      case 'radial velocity':
        return { color: '#7c3aed', label: 'Radial Velocity' };
      case 'imaging':
        return { color: '#059669', label: 'Direct Imaging' };
      case 'microlensing':
        return { color: '#d97706', label: 'Microlensing' };
      case 'astrometry':
        return { color: '#dc2626', label: 'Astrometry' };
      default:
        return { color: '#525252', label: method || 'Unknown' };
    }
  };

  const methodConfig = getMethodConfig(md.discoveryMethod);

  const stats = [
    md.radiusEarthRadii != null && { label: 'Radius', value: `${md.radiusEarthRadii.toFixed(2)}× Earth`, icon: <Globe size={13} /> },
    md.massEarthMasses != null && { label: 'Mass', value: `${md.massEarthMasses.toFixed(2)}× Earth`, icon: <Globe size={13} /> },
    md.orbitalPeriodDays != null && { label: 'Period', value: `${md.orbitalPeriodDays.toFixed(2)} days`, icon: <Orbit size={13} /> },
    md.equilibriumTempK != null && { label: 'Temp', value: `${Math.round(md.equilibriumTempK)} K`, icon: <Thermometer size={13} /> },
    md.distanceParsecs != null && { label: 'Distance', value: `${md.distanceParsecs.toFixed(1)} pc`, icon: <Star size={13} /> },
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 14px 28px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: '#ffffff',
        border: '1px solid #f0f0f0',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        padding: '32px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => window.open(card.url, '_blank')}
    >
      {/* Meta header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          color: methodConfig.color, fontWeight: 600, fontSize: '0.8rem',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <SatelliteDish size={14} />
          <span>{methodConfig.label}</span>
        </div>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d1d1' }} />
        <div style={{ color: '#757575', fontSize: '0.85rem', fontWeight: 500 }}>
          Host star: {md.hostStar}{md.stellarSpectralType ? ` (${md.stellarSpectralType})` : ''}
        </div>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#292929',
        marginBottom: '12px',
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
        fontFamily: 'Georgia, serif',
      }}>
        {card.title}
      </h2>

      {/* Description */}
      <div style={{
        color: '#6b6b6b',
        fontSize: '1rem',
        lineHeight: 1.6,
        fontWeight: 400,
        marginBottom: '24px',
        fontFamily: 'Georgia, serif',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {card.description}
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '24px',
        }}>
          {stats.map((stat) => (
            <span key={stat.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f5f5f5',
              color: '#525252',
              fontSize: '0.78rem',
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: '100px',
            }}>
              {stat.icon}
              <span style={{ color: '#292929', fontWeight: 600 }}>{stat.value}</span>
              <span style={{ color: '#a0a0a0' }}>{stat.label}</span>
            </span>
          ))}
        </div>
      )}

      <div style={{ flexGrow: 1 }} />

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#757575', fontSize: '0.8rem', fontWeight: 400 }}>
            <Calendar size={14} /> Discovered {md.discoveryYear}
          </span>
          {md.facility && (
            <span style={{ color: '#757575', fontSize: '0.8rem', fontWeight: 400 }}>
              {md.facility}
            </span>
          )}
        </div>

        <span style={{
          background: '#f2f2f2',
          color: '#757575',
          fontSize: '0.75rem',
          padding: '4px 8px',
          borderRadius: '100px',
          fontWeight: 500,
          textTransform: 'lowercase',
        }}>
          exoplanet
        </span>
      </div>
    </motion.div>
  );
};
