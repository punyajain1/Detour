import React from 'react';
import { FeedCard } from '../../types/feed';
import { Orbit, Camera, Calendar, ArrowRight, AlertTriangle, Wind, Zap } from 'lucide-react';

export const NasaCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};
  const isAsteroid = card.type === 'nasa_neows';

  return (
    <div style={{
      background: '#000000',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '32px',
      width: '100%',
      maxWidth: '560px',
      height: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'var(--font-sans)',
      boxShadow: '0 30px 60px -15px rgba(0,0,0,1)'
    }}>
      {card.imageUrl ? (
        <div style={{ position: 'relative', height: '45%', flexShrink: 0, width: '100%', background: '#000' }}>
          <img 
            src={card.imageUrl} 
            alt={card.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
            loading="lazy"
          />
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', 
            background: 'linear-gradient(to bottom, transparent, #000000)' 
          }} />
        </div>
      ) : (
        <div style={{ height: '20%', background: 'linear-gradient(135deg, #ef444422, #000)' }} />
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#ef4444' }}>
          <Orbit size={18} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {card.category} {isAsteroid ? '— Asteroid Tracker' : ''}
          </span>
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 300, color: '#ffffff', marginBottom: '24px', lineHeight: 1.1 }}>
          {card.title}
        </h2>

        {/* Asteroid specific details */}
        {isAsteroid && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: md.isPotentiallyHazardous ? '#ef4444' : '#10b981', fontWeight: 600, marginBottom: '12px' }}>
              <AlertTriangle size={16} /> 
              {md.isPotentiallyHazardous ? 'Potentially Hazardous' : 'Non-Hazardous'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', color: '#aaa' }}>
              <div><strong>Velocity:</strong> {Math.round(md.relativeVelocityKmh).toLocaleString()} km/h</div>
              <div><strong>Miss Dist:</strong> {Math.round(md.missDistanceKm).toLocaleString()} km</div>
              <div><strong>Diameter:</strong> {md.estimatedDiameterMaxKm?.toFixed(2)} km</div>
              <div><strong>Approach:</strong> {md.closestApproachDate}</div>
            </div>
          </div>
        )}

        {/* Mars Rover specific details */}
        {card.type === 'nasa_mars' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Rover:</strong> {md.rover}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Camera:</strong> {md.camera}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Sol:</strong> {md.sol}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Earth Date:</strong> {md.earthDate}
            </span>
          </div>
        )}

        {/* JWST specific details */}
        {card.type === 'jwst' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Mission:</strong> {md.mission}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Instruments:</strong> {md.instruments?.join(', ')}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Program:</strong> {md.program}
            </span>
          </div>
        )}

        {/* Generic Space Details */}
        {!isAsteroid && card.type !== 'nasa_mars' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            {(md.date || md.dateCreated) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {md.date || md.dateCreated}</span>
            )}
            {md.center && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Center: {md.center}</span>
            )}
          </div>
        )}

        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 300, whiteSpace: 'pre-wrap', flex: 1, marginBottom: '32px' }}>
          {card.description || md.caption}
        </div>

        <a href={card.url} target="_blank" rel="noreferrer" style={{
          marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: '#ef4444', fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
          textTransform: 'uppercase', letterSpacing: '0.1em'
        }}>
          Explore Deep Space <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};
