import axios from 'axios';
import { FeedPage } from '../types/feed';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchFeed = async (cursor: string | null = null, filter: string = 'all'): Promise<FeedPage> => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  
  const categories = ['all', 'space', 'programming', 'startups', 'ai', 'science'];
  if (filter !== 'all') {
    if (categories.includes(filter)) {
      params.append('category', filter);
    } else {
      params.append('type', filter);
    }
  }
  
  const response = await apiClient.get<FeedPage>(`/feed?${params.toString()}`);
  return response.data;
};
