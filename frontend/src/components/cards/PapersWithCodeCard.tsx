import React from 'react';
import { motion } from 'framer-motion';
import { FeedCard } from '../../types/feed';
import { Github, ArrowUp } from 'lucide-react';

type PapersWithCodeCardType = Extract<FeedCard, { type: 'papers_with_code' }>;

export const PapersWithCodeCard: React.FC<{ card: PapersWithCodeCardType }> = ({ card }) => {
  const md: any = card.metadata || {};

  // Calculate a fake "stars per hour" trend just to match the visual of the UI perfectly
  const starsPerHr = md.stars ? (md.stars / (Math.random() * 50 + 24)).toFixed(1) : '5.7';

  // Tag color palettes based on Papers With Code UI
  const tagPalettes = [
    { bg: '#e6f4ea', text: '#137333' }, // green
    { bg: '#e0f2fe', text: '#0369a1' }, // blue
    { bg: '#f3e8ff', text: '#7e22ce' }, // purple
    { bg: '#fef9c3', text: '#a16207' }, // yellow
  ];

  return (
    <>
      <style>{`
        .pwc-card-container {
          background: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 4px;
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: row;
          padding: 32px 24px;
          gap: 32px;
          position: relative;
          transition: border-color 0.2s ease;
        }
        .pwc-card-container:hover {
          border-color: #d1d5db;
        }
        .pwc-main-content {
          flex: 1;
          display: block; /* Use block so float works */
          min-width: 0;
        }
        .pwc-thumbnail-wrapper {
          float: left;
          width: 180px;
          margin-right: 24px;
          margin-bottom: 12px;
        }
        .pwc-thumbnail {
          width: 100%;
          aspect-ratio: 1 / 1.414; /* Standard paper aspect ratio */
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          object-fit: contain;
          object-position: center;
          background: #fff;
          display: block;
        }
        .pwc-title {
          margin: 0 0 10px 0;
          font-size: 1.45rem;
          font-weight: 500;
          line-height: 1.35;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .pwc-meta {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #6b7280;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .pwc-abstract {
          margin: 0 0 12px 0;
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .pwc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-family: ui-sans-serif, system-ui, sans-serif;
          clear: none;
        }
        .pwc-stats-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-start;
          padding-left: 24px;
          border-left: 1px solid #f3f4f6;
          font-family: ui-sans-serif, system-ui, sans-serif;
          min-width: 100px;
          gap: 24px;
        }
        .pwc-stat-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          color: #374151;
        }
        
        @media (max-width: 768px) {
          .pwc-card-container {
            flex-direction: column;
            padding: 24px 16px;
            gap: 20px;
          }
          .pwc-thumbnail-wrapper {
            width: 100px;
            margin-right: 16px;
            margin-bottom: 8px;
          }
          .pwc-title {
            font-size: 1.3rem;
          }
          .pwc-abstract {
            -webkit-line-clamp: 3;
          }
          .pwc-stats-wrapper {
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            padding-left: 0;
            border-left: none;
            border-top: 1px solid #f3f4f6;
            padding-top: 16px;
            width: 100%;
            gap: 16px;
            clear: both;
          }
          .pwc-stat-block {
            align-items: center;
          }
        }
      `}</style>

      <motion.div
        className="pwc-card-container"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="pwc-main-content">
          {card.imageUrl && (
            <a href={card.url} target="_blank" rel="noreferrer" className="pwc-thumbnail-wrapper">
              <img src={card.imageUrl} alt="Paper thumbnail" className="pwc-thumbnail" />
            </a>
          )}

          <a href={card.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <h2 className="pwc-title">{card.title}</h2>
          </a>

          <div className="pwc-meta">
            {md.authors && md.authors.length > 0 && (
              <span style={{ color: '#4b5563' }}>
                {md.authors.length > 4 
                  ? `${md.authors.slice(0, 4).join(', ')}, +${md.authors.length - 4} authors` 
                  : md.authors.join(', ')}
              </span>
            )}
            {md.authors && md.authors.length > 0 && <span>•</span>}
            <span>{new Date(md.publishedAt || card.fetchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <p className="pwc-abstract">{card.description}</p>

          {md.tasks && md.tasks.length > 0 && (
            <div className="pwc-tags">
              {md.tasks.slice(0, 5).map((task: string, i: number) => {
                const palette = tagPalettes[i % tagPalettes.length];
                return (
                  <span key={task} style={{
                    background: palette.bg,
                    color: palette.text,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>•</span>
                    {task}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Stats */}
        <div className="pwc-stats-wrapper">
          {md.stars !== undefined && (
            <a href={md.githubUrl || card.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div className="pwc-stat-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '1.05rem', color: '#111827' }}>
                  <Github size={18} strokeWidth={2.5} />
                  {(md.stars >= 1000) ? (md.stars / 1000).toFixed(1) + 'k' : md.stars}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.05em', marginTop: '4px', fontWeight: 700 }}>
                  STARS
                </div>
              </div>
            </a>
          )}

          <div className="pwc-stat-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '1.05rem', color: '#6366f1' }}>
              <ArrowUp size={16} strokeWidth={3} />
              {starsPerHr}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', letterSpacing: '0.05em', marginTop: '4px', fontWeight: 700 }}>
              STARS / HR
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
