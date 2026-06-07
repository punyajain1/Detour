import axios from 'axios';
import { SpaceNewsData } from '../types/feed.types';

export class SpaceNewsIntegration {
  private static BASE = 'https://api.spaceflightnewsapi.net/v4';

  public static async getLatestArticles(limit: number = 10): Promise<SpaceNewsData[]> {
    try {
      const response = await axios.get(`${this.BASE}/articles/`, {
        params: {
          limit,
        },
      });

      if (!response.data || !response.data.results) {
        return [];
      }

      return response.data.results as SpaceNewsData[];
    } catch (err) {
      console.error('[SpaceNewsIntegration] Failed to fetch articles:', err);
      throw err;
    }
  }

  public static async getLatestBlogs(limit: number = 10): Promise<SpaceNewsData[]> {
    try {
      const response = await axios.get(`${this.BASE}/blogs/`, {
        params: {
          limit,
        },
      });

      if (!response.data || !response.data.results) {
        return [];
      }

      return response.data.results as SpaceNewsData[];
    } catch (err) {
      console.error('[SpaceNewsIntegration] Failed to fetch blogs:', err);
      throw err;
    }
  }


}
