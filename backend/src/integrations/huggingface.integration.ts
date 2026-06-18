import axios from 'axios';
import { HuggingFaceCard } from '../types/feed.types';
import { v4 as uuid } from 'uuid';

interface HFModel {
  id: string;
  author?: string;
  downloads?: number;
  likes?: number;
  tags?: string[];
  pipeline_tag?: string;
  lastModified?: string;
  cardData?: { description?: string; license?: string };
  description?: string;
}

export class HuggingFaceIntegration {
  private static BASE = 'https://huggingface.co/api';

  static async getTrendingModels(count: number = 25): Promise<HuggingFaceCard[]> {
    try {
      const { data } = await axios.get<HFModel[]>(`${this.BASE}/models`, {
        params: {
          sort: 'downloads',
          direction: -1,
          limit: Math.min(count * 2, 100),
          full: true,
        },
        timeout: 12000,
      });

      if (!data?.length) return [];

      // Filter out models without meaningful metadata
      const filtered = data.filter(
        (m) => m.id && (m.downloads ?? 0) > 0
      );

      return filtered.slice(0, count).map((model): HuggingFaceCard => {
        const [author] = model.id.split('/');
        const description =
          model.cardData?.description ??
          model.description ??
          (model.pipeline_tag
            ? `A ${model.pipeline_tag.replace(/-/g, ' ')} model with ${(model.downloads ?? 0).toLocaleString()} downloads.`
            : `A trending model with ${(model.downloads ?? 0).toLocaleString()} downloads.`);

        const cleanTags = (model.tags ?? [])
          .filter((t) => !t.startsWith('arxiv:') && !t.includes(':'))
          .slice(0, 8);

        return {
          id: uuid(),
          type: 'huggingface',
          category: 'ai',
          fetchedAt: new Date().toISOString(),
          title: model.id,
          description: description.slice(0, 400),
          url: `https://huggingface.co/${model.id}`,
          metadata: {
            modelId: model.id,
            author: model.author ?? author ?? 'Unknown',
            downloads: model.downloads ?? 0,
            likes: model.likes ?? 0,
            tags: cleanTags,
            pipeline: model.pipeline_tag,
            updatedAt: model.lastModified ?? new Date().toISOString(),
          },
        };
      });
    } catch (err) {
      console.warn('[HuggingFace] Failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
