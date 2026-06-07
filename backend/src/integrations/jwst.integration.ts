import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { JWSTData } from '../types/feed.types';

const NASA_IMAGES_BASE = 'https://images-api.nasa.gov';

const SPACE_QUERIES = [
  'james webb space telescope galaxy',
  'james webb space telescope nebula',
  'james webb space telescope deep field',
  'james webb space telescope exoplanet',
  'james webb space telescope star cluster',
  'hubble space telescope galaxy',
  'hubble space telescope nebula',
  'hubble space telescope deep field',
  'hubble space telescope pillars of creation',
  'hubble space telescope star cluster',
  'nasa observatory galaxy infrared',
  'nasa nebula stellar nursery cosmos',
  'nasa black hole galaxy cluster',
  'nasa exoplanet atmosphere observation',
  'nasa deep space supernova remnant',
];

const BLOCKLIST = [
  'screening', 'cinema', 'theater', 'theatre', 'attendee', 'audience',
  'press release photo', 'photo credit', 'photographer', 'portrait',
  'ribbon cutting', 'ceremony', 'employee', 'staff', 'administrator',
  'conference', 'meeting', 'tour', 'visit', 'exhibit', 'display',
  'logo', 'sign', 'banner', 'poster', 'artwork', 'illustration of nasa',
  "artist concept", "artist's concept",
];

const ALLOWLIST = [
  'galaxy', 'galaxies', 'nebula', 'nebulae', 'star cluster', 'stellar',
  'light-year', 'parsec', 'infrared', 'ultraviolet', 'spectrum',
  'deep field', 'exoplanet', 'atmosphere', 'supernova', 'black hole',
  'quasar', 'pulsar', 'cosmic', 'universe', 'cosmos', 'interstellar',
  'nircam', 'miri', 'nirspec', 'wfpc', 'acs/wfc', 'hubble wfc3',
  'chandra', 'spitzer', 'milky way', 'andromeda', 'magellanic',
  'cepheid', 'remnant', 'protostar', 'accretion', 'gravitational lens',
  'dark matter', 'dark energy', 'redshift', 'light years',
];

function isSpaceImage(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  if (BLOCKLIST.some((w) => text.includes(w))) return false;
  return ALLOWLIST.some((w) => text.includes(w));
}

interface NasaImageItem {
  href: string;
  data: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    date_created: string;
    center?: string;
    media_type: string;
  }>;
  links?: Array<{ href: string; rel: string; render?: string }>;
}

interface NasaImagesResponse {
  collection: {
    items: NasaImageItem[];
    metadata: { total_hits: number };
  };
}

export class JwstIntegration {
  static async getLatestImages(limit: number = 10): Promise<JWSTData[]> {
    const results: JWSTData[] = [];
    const seenIds = new Set<string>();
    const perQuery = Math.max(3, Math.ceil(limit / 4));

    for (const query of SPACE_QUERIES) {
      if (results.length >= limit) break;

      try {
        const { data } = await axios.get<NasaImagesResponse>(
          `${NASA_IMAGES_BASE}/search`,
          {
            params: { q: query, media_type: 'image', year_start: '1990', page_size: 100 },
            timeout: 12000,
          }
        );

        const items = data?.collection?.items ?? [];
        let addedFromQuery = 0;

        for (const item of items) {
          if (results.length >= limit || addedFromQuery >= perQuery) break;

          const meta = item.data?.[0];
          if (!meta) continue;

          const title = meta.title ?? '';
          const desc = meta.description ?? '';
          if (!isSpaceImage(title, desc)) continue;

          const previewLink = item.links?.find((l) => l.rel === 'preview' && l.render === 'image');
          if (!previewLink?.href || seenIds.has(meta.nasa_id)) continue;
          seenIds.add(meta.nasa_id);

          results.push({
            id: uuid(),
            observation_id: meta.nasa_id,
            program: 0,
            details: {
              mission: query.toLowerCase().includes('hubble')
                ? 'Hubble Space Telescope'
                : query.toLowerCase().includes('james webb') || query.toLowerCase().includes('webb')
                  ? 'JWST'
                  : 'NASA Observatory',
              instruments: [],
              suffix: '',
              description: desc || title,
            },
            file_type: 'jpg',
            thumbnail: previewLink.href,
            location: previewLink.href,
          });

          addedFromQuery++;
        }
      } catch (err) {
        console.warn(`[SpaceTelescope] "${query}" failed:`, (err as Error).message);
      }
    }

    return results.slice(0, limit);
  }
}
