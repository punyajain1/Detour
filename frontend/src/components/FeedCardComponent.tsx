import React from 'react';
import { motion } from 'framer-motion';
import { FeedCard } from '../types/feed';

import { GithubCard } from './cards/GithubCard';
import { HackerNewsCard } from './cards/HackerNewsCard';
import { LeetCodeCard } from './cards/LeetCodeCard';
import { NasaCard } from './cards/NasaCard';
import { StackOverflowCard } from './cards/StackOverflowCard';

interface FeedCardProps {
  card: FeedCard;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const FeedCardComponent: React.FC<FeedCardProps> = ({ card }) => {
  const renderSpecificCard = () => {
    if (card.type === 'github') return <GithubCard card={card} />;
    if (card.type === 'hackernews') return <HackerNewsCard card={card} />;
    if (card.type === 'leetcode') return <LeetCodeCard card={card} />;
    if (card.type === 'stackoverflow') return <StackOverflowCard card={card} />;
    if (card.type.startsWith('nasa') || card.type === 'space_news' || card.type === 'jwst') return <NasaCard card={card} />;
    
    return null;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      style={{
        height: '100vh',
        width: '100%',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {renderSpecificCard()}
    </motion.div>
  );
};
