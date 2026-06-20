import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { NasaImageLibraryCard } from '../types/feed.types';

// NASA Image and Video Library — free, no API key needed
const BASE = 'https://images-api.nasa.gov';

const SEARCH_QUERIES = [
  // Galaxies & Deep Space
  'nebula',
  'galaxy',
  'spiral galaxy',
  'elliptical galaxy',
  'milky way',
  'andromeda galaxy',
  'deep space',
  'interstellar cloud',
  'star cluster',
  'globular cluster',

  // Stars & Stellar Events
  'supernova',
  'red giant',
  'white dwarf',
  'neutron star',
  'binary star',
  'star formation',
  'protostar',
  'solar flare',
  'sunspot',
  'coronal mass ejection',

  // Black Holes
  'black hole',
  'event horizon',
  'accretion disk',
  'Sagittarius A*',
  'supermassive black hole',

  // Planets
  'Mercury planet',
  'Venus surface',
  'Earth from space',
  'Mars surface',
  'Mars rover',
  'Jupiter storm',
  'Great Red Spot',
  'Saturn rings',
  'Uranus',
  'Neptune',

  // Moons
  'Moon landing',
  'lunar surface',
  'Apollo moon',
  'Europa moon',
  'Titan moon',
  'Enceladus',
  'Ganymede',
  'Io moon',

  // Space Missions
  'Apollo mission',
  'Artemis mission',
  'Voyager',
  'Cassini',
  'Juno mission',
  'New Horizons',
  'Perseverance rover',
  'Curiosity rover',
  'Spirit rover',
  'Opportunity rover',

  // Spacecraft & Stations
  'space station',
  'ISS',
  'International Space Station',
  'space shuttle',
  'spacewalk',
  'astronaut',
  'rocket launch',
  'satellite',
  'mission control',

  // Telescopes
  'Hubble',
  'Hubble telescope',
  'James Webb',
  'Webb telescope',
  'Chandra Observatory',
  'Spitzer telescope',
  'Kepler telescope',

  // Earth & Atmosphere
  'aurora',
  'northern lights',
  'earth at night',
  'hurricane from space',
  'volcano from space',
  'earth horizon',
  'atmosphere',
  'climate observation',

  // Small Bodies
  'comet',
  'asteroid',
  'meteor shower',
  'meteorite',
  'Kuiper belt',
  'Oort cloud',

  // Exoplanets
  'exoplanet',
  'habitable planet',
  'alien world',
  'planetary system',

];

interface NasaImageItem {
  data: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    date_created: string;
    center?: string;
    keywords?: string[];
    media_type: 'image' | 'video' | 'audio';
    photographer?: string;
    location?: string;
  }>;
  links?: Array<{ href: string; rel: string }>;
}

interface NasaSearchResponse {
  collection: {
    items: NasaImageItem[];
    metadata: { total_hits: number };
  };
}

export class NasaImageLibraryIntegration {
  /**
   * Searches the NASA Image and Video Library across a rotating set of
   * space-related search terms and returns image results as feed cards.
   */
  static async getSpaceImages(count = 10): Promise<NasaImageLibraryCard[]> {
    // Pick a few random queries to diversify results
    const queries = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5).slice(0, 3);
    const perQuery = Math.ceil(count / queries.length);

    const results: NasaImageLibraryCard[] = [];

    for (const query of queries) {
      if (results.length >= count) break;
      try {
        const { data } = await axios.get<NasaSearchResponse>(`${BASE}/search`, {
          params: {
            q: query,
            media_type: 'image',
            page_size: perQuery * 2, // overfetch then filter
            year_start: '2000',
          },
          timeout: 12000,
        });

        const items = data.collection?.items ?? [];

        for (const item of items) {
          if (results.length >= count) break;
          const meta = item.data?.[0];
          if (!meta) continue;
          if (meta.media_type !== 'image') continue;

          // Thumbnail image href from the links array
          const thumbLink = item.links?.find(l => l.rel === 'preview');
          const imageUrl = thumbLink?.href;
          if (!imageUrl) continue;

          const description = (meta.description ?? '')
            .replace(/<[^>]*>/g, '') // strip HTML tags
            .trim()
            .slice(0, 500);

          results.push({
            id: uuid(),
            type: 'nasa_image_library' as const,
            category: 'space' as const,
            fetchedAt: new Date().toISOString(),
            title: meta.title,
            description: description || `A stunning NASA image of ${query}, captured${meta.center ? ` by ${meta.center}` : ''}.`,
            imageUrl,
            url: `https://images.nasa.gov/details/${encodeURIComponent(meta.nasa_id)}`,
            metadata: {
              nasaId: meta.nasa_id,
              dateCreated: meta.date_created,
              center: meta.center ?? undefined,
              keywords: meta.keywords ?? [],
              photographer: meta.photographer ?? undefined,
              location: meta.location ?? undefined,
              searchQuery: query,
            },
          } satisfies NasaImageLibraryCard);
        }
      } catch (err) {
        console.warn(`[NasaImageLibrary] Query "${query}" failed:`, (err as Error).message);
      }
    }

    return results.slice(0, count);
  }
}
