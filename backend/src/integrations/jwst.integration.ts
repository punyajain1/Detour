import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { JWSTData } from '../types/feed.types';

const NASA_IMAGES_BASE = 'https://images-api.nasa.gov';

const SPACE_QUERIES = [
  'jwst',
  'james webb',
  'webb telescope',
  'hubble',
  'hubble telescope',
  'chandra observatory',
  'spitzer space telescope',
  'james webb space telescope'
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

    // 1. Fetch from JWST API
    if (process.env.JWST_API_KEY) {
      try {
        const { data } = await axios.get('https://api.jwstapi.com/v1/all/type/jpg', {
          headers: { 'X-API-KEY': process.env.JWST_API_KEY },
          params: { page: 1, perPage: Math.ceil(limit / 2) },
          timeout: 10000,
        });

        const items = data?.body ?? [];
        for (const item of items) {
          if (!item.location) continue;

          results.push({
            id: uuid(),
            observation_id: item.id || uuid(),
            program: item.program || 0,
            details: {
              mission: item.details?.mission || 'JWST',
              instruments: Array.isArray(item.details?.instruments)
                ? item.details.instruments.map((i: any) => i.instrument || i)
                : [],
              suffix: item.details?.suffix || '',
              description: item.details?.description || 'JWST Observation',
            },
            file_type: item.file_type || 'jpg',
            thumbnail: item.thumbnail || item.location,
            location: item.location,
          });
          seenIds.add(item.id || item.location);
        }
      } catch (err: any) {
        console.warn('[SpaceTelescope] JWST API failed:', err.message);
      }
    }

    // 2. Fetch from NASA API for the remainder
    const remainingLimit = limit - results.length;
    if (remainingLimit > 0) {
      const perQuery = Math.max(3, Math.ceil(remainingLimit / 4));

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
                  : query.toLowerCase().includes('james webb') || query.toLowerCase().includes('webb') || query.toLowerCase().includes('jwst')
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
    }

    return results.slice(0, limit);
  }
}
