import axios from 'axios';
import { NasaNeoWsCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface NeoWsFeedResponse {
  near_earth_objects: Record<
    string,
    Array<{
      id: string;
      name: string;
      nasa_jpl_url: string;
      absolute_magnitude_h: number;
      is_potentially_hazardous_asteroid: boolean;
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: number;
          estimated_diameter_max: number;
        };
      };
      close_approach_data: Array<{
        close_approach_date: string;
        relative_velocity: {
          kilometers_per_hour: string;
        };
        miss_distance: {
          kilometers: string;
        };
        orbiting_body: string;
      }>;
    }>
  >;
  element_count: number;
}

export class NasaNeoWsIntegration {
  private static BASE = 'https://api.nasa.gov/neo/rest/v1';

  /**
   * Fetches today's close-approaching Near Earth Objects.
   * Sorts by miss distance (closest first) and returns the most
   * interesting ones — favouring potentially hazardous asteroids
   * for dramatic, engaging feed cards.
   */
  static async getTodaysCloseApproaches(count = 3): Promise<NasaNeoWsCard[]> {
    const apiKey = process.env.NASA_API_KEY ?? 'DEMO_KEY';
    const today = new Date().toISOString().split('T')[0];

    const { data } = await axios.get<NeoWsFeedResponse>(`${this.BASE}/feed`, {
      params: {
        start_date: today,
        end_date: today,
        api_key: apiKey,
      },
      timeout: 12000,
    });

    const todaysNeos = data.near_earth_objects[today] ?? [];

    if (!todaysNeos.length) {
      console.warn('[NeoWs] No NEOs found for today.');
      return [];
    }

    // Enrich with computed fields and sort strategy:
    // Hazardous ones first, then by closest miss distance
    const enriched = todaysNeos
      .filter((neo) => neo.close_approach_data.length > 0)
      .map((neo) => {
        const approach = neo.close_approach_data[0];
        const missDistanceKm = parseFloat(approach.miss_distance.kilometers);
        const velocityKmh = parseFloat(approach.relative_velocity.kilometers_per_hour);
        const diamMin = neo.estimated_diameter.kilometers.estimated_diameter_min;
        const diamMax = neo.estimated_diameter.kilometers.estimated_diameter_max;

        return {
          neo,
          approach,
          missDistanceKm,
          velocityKmh,
          diamMin,
          diamMax,
        };
      })
      .sort((a, b) => {
        // Hazardous ones first, then closest
        if (a.neo.is_potentially_hazardous_asteroid !== b.neo.is_potentially_hazardous_asteroid) {
          return a.neo.is_potentially_hazardous_asteroid ? -1 : 1;
        }
        return a.missDistanceKm - b.missDistanceKm;
      });

    return enriched.slice(0, count).map(({ neo, approach, missDistanceKm, velocityKmh, diamMin, diamMax }) => {
      const moonDistances = (missDistanceKm / 384400).toFixed(1);
      const hazardLabel = neo.is_potentially_hazardous_asteroid ? '⚠️ Potentially Hazardous' : 'Safe Flyby';
      const diamStr =
        diamMin < 0.1
          ? `${Math.round(diamMin * 1000)}–${Math.round(diamMax * 1000)} meters`
          : `${diamMin.toFixed(2)}–${diamMax.toFixed(2)} km`;

      // Clean up asteroid names: remove parenthetical designations
      const cleanName = neo.name.replace(/^\(/, '').replace(/\)$/, '').trim();

      return {
        id: uuid(),
        type: 'nasa_neows' as const,
        category: 'space' as const,
        fetchedAt: new Date().toISOString(),
        title: `Asteroid ${cleanName} is flying past Earth today`,
        description: `${hazardLabel}. ${cleanName} is estimated to be ${diamStr} wide and will pass Earth at ${moonDistances} times the Moon's distance (${(missDistanceKm / 1_000_000).toFixed(2)}M km) at ${Math.round(velocityKmh).toLocaleString()} km/h. Orbiting body: ${approach.orbiting_body}.`,
        url: neo.nasa_jpl_url,
        metadata: {
          neoId: neo.id,
          isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
          estimatedDiameterMinKm: diamMin,
          estimatedDiameterMaxKm: diamMax,
          closestApproachDate: approach.close_approach_date,
          missDistanceKm,
          relativeVelocityKmh: velocityKmh,
          absoluteMagnitude: neo.absolute_magnitude_h,
          orbitingBody: approach.orbiting_body,
        },
      } satisfies NasaNeoWsCard;
    });
  }


}
