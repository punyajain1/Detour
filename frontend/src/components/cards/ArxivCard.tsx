import React from 'react';
import { FeedCard } from '../../types/feed';
import { FileText, Calendar, Users, ArrowUpRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const ArxivCard: React.FC<{ card: FeedCard }> = ({ card }) => {
  const md: any = card.metadata || {};

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: '8px 8px 0px #b31b1b' }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#ffffff', // Clean white background for papers
        border: '2px solid #000000',
        borderRadius: '0px', 
        width: '100%',
        maxWidth: '560px',
        height: 'auto',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '4px 4px 0px #000000',
        padding: '0',
        fontFamily: 'var(--font-sans)',
        position: 'relative'
      }}
    >
      {/* Top Banner */}
      <div style={{ background: '#b31b1b', color: '#ffffff', padding: '12px 16px', borderBottom: '2px solid #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span>Thank you to arXiv for use of its open access interoperability.</span>
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ffffff', color: '#b31b1b', padding: '4px 8px', border: '1.5px solid #000000' }}>
          {md.arxivCategory || 'Research'}
        </div>
      </div>

      <div style={{ padding: '24px 24px 0 24px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#000000', marginBottom: '16px', lineHeight: 1.3, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }}>
          {card.title}
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px dashed #000000' }}>
          {md.publishedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#000', fontWeight: 600, fontSize: '0.85rem' }}>
              <Calendar size={14} strokeWidth={2.5} /> {new Date(md.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
          {md.authors && md.authors.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#444', fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>
              <Users size={14} strokeWidth={2.5} /> {md.authors.length > 3 ? `${md.authors.slice(0, 3).join(', ')} et al.` : md.authors.join(', ')}
            </span>
          )}
        </div>

        <div style={{ 
          color: '#333333', 
          fontSize: '0.95rem', 
          lineHeight: 1.6, 
          fontWeight: 400,
          marginBottom: '24px',
          fontFamily: 'Georgia, serif'
        }}>
          {card.description}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', marginBottom: '24px' }}>
          {md.pdfUrl && (
            <motion.a 
              whileHover={{ background: '#b31b1b', color: '#ffffff', borderColor: '#b31b1b' }}
              whileTap={{ scale: 0.98 }}
              href={md.pdfUrl} target="_blank" rel="noreferrer" 
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'transparent', color: '#b31b1b', border: '2px solid #b31b1b', padding: '10px 16px',
                fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', textTransform: 'uppercase',
                letterSpacing: '0.05em', fontSize: '0.8rem'
              }}
            >
              <FileText size={16} strokeWidth={3} />
              <span>Read PDF</span>
            </motion.a>
          )}
          
          <motion.a 
            whileHover={{ background: '#000000', color: '#ffffff' }}
            whileTap={{ scale: 0.98 }}
            href={card.url} target="_blank" rel="noreferrer" 
            style={{
              flex: md.pdfUrl ? 1 : '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'transparent', color: '#000000', border: '2px solid #000000', padding: '10px 16px',
              fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', textTransform: 'uppercase',
              letterSpacing: '0.05em', fontSize: '0.8rem'
            }}
          >
            <span>View Abstract</span>
            <ArrowUpRight size={16} strokeWidth={3} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};
