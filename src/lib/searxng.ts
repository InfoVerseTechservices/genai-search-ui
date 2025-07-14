import axios from 'axios';
import { getSearxngApiEndpoint } from './config';

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (
  query: string,
  opts?: SearxngSearchOptions,
) => {
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const searxngURL = getSearxngApiEndpoint();

      const url = new URL(`${searxngURL}/search?format=json`);
      url.searchParams.append('q', query);

      if (opts) {
        Object.keys(opts).forEach((key) => {
          const value = opts[key as keyof SearxngSearchOptions];
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
            return;
          }
          url.searchParams.append(key, value as string);
        });
      }

      const res = await axios.get(url.toString(), { timeout: 10000 });

      const results: SearxngSearchResult[] = res.data.results || [];
      const suggestions: string[] = res.data.suggestions || [];

      return { results, suggestions };
    } catch (error: any) {
      if (error.response?.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.warn('SearxNG search failed, returning empty results:', error);
      return { results: [], suggestions: [] };
    }
  }
  
  return { results: [], suggestions: [] };
};
