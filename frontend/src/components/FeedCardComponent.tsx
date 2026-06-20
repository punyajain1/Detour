import React from 'react';
import { motion } from 'framer-motion';
import { FeedCard } from '../types/feed';

import { GithubCard } from './cards/GithubCard';
import { HackerNewsCard } from './cards/HackerNewsCard';
import { LeetCodeCard } from './cards/LeetCodeCard';
import { StackOverflowCard } from './cards/StackOverflowCard';
import { ArxivCard } from './cards/ArxivCard';
import { SystemDesignCard } from './cards/SystemDesignCard';
import { NasaApodCard } from './cards/NasaApodCard';
import { NasaMarsCard } from './cards/NasaMarsCard';
import { NasaNeoWsCard } from './cards/NasaNeoWsCard';
import { SpaceNewsCard } from './cards/SpaceNewsCard';
import { JwstCard } from './cards/JwstCard';
// New card components
import { DevPackageCard } from './cards/DevPackageCard';
import { SecurityCard } from './cards/SecurityCard';
import { AIResearchCard } from './cards/AIResearchCard';
import { PapersWithCodeCard } from './cards/PapersWithCodeCard';
import { SpaceWeatherCard } from './cards/SpaceWeatherCard';
import { CodeforcesCard } from './cards/CodeforcesCard';
import { NasaExoplanetCard } from './cards/NasaExoplanetCard';
import { NasaImageLibraryCard } from './cards/NasaImageLibraryCard';

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
    // ─── Original card types ─────────────────────────────────────
    if (card.type === 'github') return <GithubCard card={card} />;
    if (card.type === 'leetcode') return <LeetCodeCard card={card} />;
    if (card.type === 'stackoverflow') return <StackOverflowCard card={card} />;
    if (card.type === 'arxiv') return <ArxivCard card={card} />;
    if (card.type === 'system_design') return <SystemDesignCard card={card} />;
    if (card.type === 'nasa_apod') return <NasaApodCard card={card as any} />;
    if (card.type === 'nasa_mars') return <NasaMarsCard card={card as any} />;
    if (card.type === 'nasa_neows') return <NasaNeoWsCard card={card as any} />;
    if (card.type === 'space_news') return <SpaceNewsCard card={card as any} />;
    if (card.type === 'jwst') return <JwstCard card={card as any} />;

    // ─── HN variants ────────────────────────────────────────────
    if (card.type === 'hackernews' || card.type === 'ask_hn' || card.type === 'show_hn' || card.type === 'hn_job') {
      return <HackerNewsCard card={card as any} />;
    }

    // ─── Dev ecosystem packages ──────────────────────────────────
    if (card.type === 'crates_io' || card.type === 'npm_package' || card.type === 'pypi_release') {
      return <DevPackageCard card={card as any} />;
    }

    // ─── Security ───────────────────────────────────────────────
    if (card.type === 'cve') return <SecurityCard card={card as any} />;

    // ─── AI / ML Research ───────────────────────────────────────
    if (card.type === 'papers_with_code') {
      return <PapersWithCodeCard card={card as any} />;
    }
    if (card.type === 'huggingface') {
      return <AIResearchCard card={card as any} />;
    }

    // ─── Competitive programming ────────────────────────────────
    if (card.type === 'codeforces') return <CodeforcesCard card={card as any} />;

    // ─── Space ───────────────────────────────────────
    if (card.type === 'space_weather') return <SpaceWeatherCard card={card as any} />;

    // ─── NASA Exoplanets & Image Library ───────────
    if (card.type === 'nasa_exoplanet') return <NasaExoplanetCard card={card as any} />;
    if (card.type === 'nasa_image_library') return <NasaImageLibraryCard card={card as any} />;

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
        paddingBottom: '80px', // Added to prevent overlap with the BottomNavBar
      }}
    >
      {renderSpecificCard()}
    </motion.div>
  );
};
