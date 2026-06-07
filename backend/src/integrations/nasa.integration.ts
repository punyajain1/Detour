import axios, { AxiosError } from 'axios';
import { APODData } from '../types/feed.types';

export class NasaIntegration {
  private static BASE = 'https://api.nasa.gov/planetary/apod';

  static async getAPOD(date?: string): Promise<APODData> {
    const { data } = await axios.get<APODData>(this.BASE, {
      params: { api_key: process.env.NASA_API_KEY ?? 'DEMO_KEY', date: date ?? todayUTC(), thumbs: true },
      timeout: 12000,
    });
    return data;
  }

  static async getLatestAPODs(days: number = 10): Promise<APODData[]> {
    const apiKey = process.env.NASA_API_KEY ?? 'DEMO_KEY';
    const safeDays = Math.min(days, 30);
    const endDate = todayUTC();
    const startDate = offsetDays(endDate, -(safeDays - 1));

    try {
      const { data } = await axios.get<APODData[]>(this.BASE, {
        params: { api_key: apiKey, start_date: startDate, end_date: endDate, thumbs: true },
        timeout: 15000,
      });
      const apods = Array.isArray(data) ? data : [data];
      return apods
        .filter((a) => a.media_type === 'image' || a.url?.match(/\.(jpg|jpeg|png|gif|webp)/i))
        .reverse();
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      console.warn(`[NasaAPOD] Date-range failed (HTTP ${status ?? 'network'}), falling back to random`);
      return this.getRandomAPODs(safeDays, apiKey);
    }
  }

  static async getRandomAPODs(count: number = 10, apiKey?: string): Promise<APODData[]> {
    const key = apiKey ?? process.env.NASA_API_KEY ?? 'DEMO_KEY';
    try {
      const { data } = await axios.get<APODData[]>(this.BASE, {
        params: { api_key: key, count: Math.min(count, 10), thumbs: true },
        timeout: 12000,
      });
      const apods = Array.isArray(data) ? data : [data];
      return apods.filter((a) => a.media_type === 'image' || a.url?.match(/\.(jpg|jpeg|png|gif|webp)/i));
    } catch (err) {
      console.warn('[NasaAPOD] Random batch failed:', (err as Error).message);
      return [];
    }
  }
}

function todayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

function offsetDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().split('T')[0];
}
