import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_KEY = Platform.OS === 'ios'
  ? Constants.expoConfig?.extra?.giphyApiKeyIos ?? ''
  : Constants.expoConfig?.extra?.giphyApiKey ?? '';
const BASE_URL = 'https://api.giphy.com/v1/gifs';

export interface Gif {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

interface GiphyImage {
  url: string;
  width: string;
  height: string;
}

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height: GiphyImage;
    fixed_height_still: GiphyImage;
    fixed_width_small: GiphyImage;
  };
}

function mapGif(g: GiphyGif): Gif {
  return {
    id: g.id,
    title: g.title,
    url: g.images.fixed_height.url,
    previewUrl: g.images.fixed_width_small.url,
    width: parseInt(g.images.fixed_height.width, 10),
    height: parseInt(g.images.fixed_height.height, 10),
  };
}

export async function fetchTrendingGifs(limit = 20, offset = 0): Promise<Gif[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
    limit: String(limit),
    offset: String(offset),
    rating: 'pg-13',
  });

  const res = await fetch(`${BASE_URL}/trending?${params}`);
  if (!res.ok) return [];

  const json = await res.json();
  return (json.data as GiphyGif[]).map(mapGif);
}

export async function searchGifs(query: string, limit = 20, offset = 0): Promise<Gif[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
    q: query,
    limit: String(limit),
    offset: String(offset),
    rating: 'pg-13',
    lang: 'en',
  });

  const res = await fetch(`${BASE_URL}/search?${params}`);
  if (!res.ok) return [];

  const json = await res.json();
  return (json.data as GiphyGif[]).map(mapGif);
}
