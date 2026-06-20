import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { NasaExoplanetCard } from '../types/feed.types';

// NASA Exoplanet Archive TAP API — the actual public endpoint
const BASE = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

interface ExoplanetRow {
  pl_name: string;
  hostname: string;
  discoverymethod: string;
  disc_year: number;
  pl_orbper: number | null;    // Orbital period (days)
  pl_rade: number | null;      // Planet radius (Earth radii)
  pl_bmasse: number | null;    // Planet mass (Earth masses)
  pl_eqt: number | null;       // Equilibrium temperature (K)
  sy_dist: number | null;      // Distance (parsecs)
  st_spectype: string | null;  // Stellar spectral type
  disc_facility: string | null;
  pl_controv_flag: number;     // 1 = controversial
}

export class NasaExoplanetsIntegration {
  /**
   * Fetches recently confirmed exoplanets from the NASA Exoplanet Archive
   * using their public TAP (Table Access Protocol) service.
   */
  static async getRecentExoplanets(count = 10): Promise<NasaExoplanetCard[]> {
    try {
      const { data: raw } = await axios.get<string>(BASE, {
        params: {
          query: `SELECT TOP ${Math.min(count * 3, 60)} pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_rade,pl_bmasse,pl_eqt,sy_dist,st_spectype,disc_facility,pl_controv_flag FROM ps WHERE pl_controv_flag=0 AND disc_year IS NOT NULL ORDER BY disc_year DESC, pl_name ASC`,
          format: 'json',
        },
        timeout: 15000,
      });

      // The API returns a JSON string body — handle both object and string
      let rows: ExoplanetRow[] = [];
      if (typeof raw === 'string') {
        rows = JSON.parse(raw) as ExoplanetRow[];
      } else {
        rows = raw as unknown as ExoplanetRow[];
      }

      if (!Array.isArray(rows) || rows.length === 0) return [];

      // Shuffle and take count
      const shuffled = rows.sort(() => Math.random() - 0.5).slice(0, count);

      return shuffled.map((row) => {
        const radiusStr = row.pl_rade != null ? `${row.pl_rade.toFixed(2)}× Earth radii` : null;
        const massStr = row.pl_bmasse != null ? `${row.pl_bmasse.toFixed(2)}× Earth masses` : null;
        const distStr = row.sy_dist != null ? `${row.sy_dist.toFixed(1)} parsecs away` : null;
        const tempStr = row.pl_eqt != null ? `${Math.round(row.pl_eqt)} K equilibrium temperature` : null;
        const periodStr = row.pl_orbper != null ? `${row.pl_orbper.toFixed(2)}-day orbit` : null;

        const facts = [radiusStr, massStr, periodStr, tempStr, distStr].filter(Boolean);
        const description = `${row.pl_name} orbits the star ${row.hostname}. Discovered via ${row.discoverymethod} in ${row.disc_year}${row.disc_facility ? ` at ${row.disc_facility}` : ''}.${facts.length ? ' ' + facts.join(', ') + '.' : ''}`;

        return {
          id: uuid(),
          type: 'nasa_exoplanet' as const,
          category: 'space' as const,
          fetchedAt: new Date().toISOString(),
          title: `Exoplanet ${row.pl_name}`,
          description,
          url: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(row.pl_name)}`,
          metadata: {
            planetName: row.pl_name,
            hostStar: row.hostname,
            discoveryMethod: row.discoverymethod,
            discoveryYear: row.disc_year,
            orbitalPeriodDays: row.pl_orbper ?? undefined,
            radiusEarthRadii: row.pl_rade ?? undefined,
            massEarthMasses: row.pl_bmasse ?? undefined,
            equilibriumTempK: row.pl_eqt ?? undefined,
            distanceParsecs: row.sy_dist ?? undefined,
            stellarSpectralType: row.st_spectype ?? undefined,
            facility: row.disc_facility ?? undefined,
          },
        } satisfies NasaExoplanetCard;
      });
    } catch (err) {
      console.warn('[NasaExoplanets] Fetch failed:', (err as Error).message);
      return [];
    }
  }
}
