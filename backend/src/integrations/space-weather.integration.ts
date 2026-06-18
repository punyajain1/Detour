import axios from 'axios';
import { SpaceWeatherCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface NOAAAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

interface KpIndex {
  time_tag: string;
  kp: number;
  a_running: string;
  station_count: number;
}

// SWPC solar event
interface SolarEvent {
  event_type: string;
  begin_time: string;
  max_time?: string;
  end_time?: string;
  class_type?: string;        // e.g. M1, X2
  scale?: string;
  linked_events?: string[];
}

function classifyAlert(message: string): SpaceWeatherCard['metadata']['alertType'] {
  const lower = message.toLowerCase();
  if (lower.includes('solar flare') || lower.includes('x-ray')) return 'flare';
  if (lower.includes('geomagnetic') || lower.includes('kp')) return 'geomagnetic';
  if (lower.includes('radiation') || lower.includes('proton')) return 'radiation';
  return 'general';
}

function extractScale(message: string): string | undefined {
  const match = message.match(/\b([GRS]\d)\b/);
  return match?.[1];
}

function extractClassification(message: string): string | undefined {
  const match = message.match(/\b([BCMX]\d+(?:\.\d+)?)\b/);
  return match?.[1];
}

export class SpaceWeatherIntegration {
  private static ALERT_URL = 'https://services.swpc.noaa.gov/json/alerts.json';
  private static KP_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';

  static async getAlerts(count: number = 10): Promise<SpaceWeatherCard[]> {
    const results: SpaceWeatherCard[] = [];

    // Fetch alerts
    try {
      const { data: alerts } = await axios.get<NOAAAlert[]>(this.ALERT_URL, {
        timeout: 10000,
      });

      const recent = Array.isArray(alerts)
        ? alerts.slice(0, count * 2)
        : [];

      for (const alert of recent) {
        if (results.length >= count) break;
        const firstLine = alert.message.split('\n').find((l) => l.trim()) ?? alert.message;

        results.push({
          id: uuid(),
          type: 'space_weather',
          category: 'space',
          fetchedAt: new Date().toISOString(),
          title: `☀️ NOAA Space Weather Alert`,
          description: alert.message.slice(0, 500),
          url: 'https://www.swpc.noaa.gov/alerts-watches-warnings',
          metadata: {
            classification: extractClassification(alert.message),
            scale: extractScale(alert.message),
            issuedAt: alert.issue_datetime,
            alertType: classifyAlert(alert.message),
          },
        });
      }
    } catch (err) {
      console.warn('[SpaceWeather] Alert fetch failed:', err instanceof Error ? err.message : err);
    }

    // Supplement with current Kp index card
    if (results.length < count) {
      try {
        const { data: kpData } = await axios.get<KpIndex[]>(this.KP_URL, {
          timeout: 8000,
        });

        const latest = Array.isArray(kpData) ? kpData[kpData.length - 1] : null;
        if (latest) {
          const kp = latest.kp;
          const severity =
            kp >= 7 ? 'Severe (G3+)' :
            kp >= 5 ? 'Moderate (G1-G2)' :
            kp >= 3 ? 'Active' : 'Quiet';

          results.push({
            id: uuid(),
            type: 'space_weather',
            category: 'space',
            fetchedAt: new Date().toISOString(),
            title: `🌍 Geomagnetic Activity: Kp ${kp}`,
            description: `Current planetary Kp index is ${kp} (${severity}). ${kp >= 5 ? 'Aurora may be visible at high latitudes.' : 'Conditions are relatively calm.'} Data from NOAA Space Weather Prediction Center.`,
            url: 'https://www.swpc.noaa.gov/products/planetary-k-index',
            metadata: {
              kpIndex: kp,
              issuedAt: latest.time_tag,
              alertType: 'geomagnetic',
            },
          });
        }
      } catch (err) {
        console.warn('[SpaceWeather] Kp fetch failed:', err instanceof Error ? err.message : err);
      }
    }

    return results.slice(0, count);
  }
}
