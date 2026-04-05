import "server-only";
import fs from "fs/promises";
import path from "path";
import type { MediaItem, MediaType } from "./tmdb-config";
import { providerIdsToKeys } from "./tmdb-config";

export { PROVIDERS, posterUrl } from "./tmdb-config";
export type { ProviderKey, MediaType, MediaItem } from "./tmdb-config";

const API_KEY = process.env.TMDB_API_KEY!;
const BASE_URL = "https://api.themoviedb.org/3";
const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

async function getCached<T>(key: string): Promise<T | null> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const stat = await fs.stat(filePath);
    if (Date.now() - stat.mtimeMs > CACHE_TTL) return null;
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: unknown): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(data));
  } catch {
    // silently fail cache writes
  }
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}${endpoint}?${searchParams}`;
  const cacheKey = Buffer.from(url).toString("base64url");

  const cached = await getCached<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = await res.json();

  await setCache(cacheKey, data);
  return data as T;
}

export async function discoverMedia(
  mediaType: MediaType,
  providerIds: number[],
  page = 1,
  sortBy = "popularity.desc"
): Promise<{ results: MediaItem[]; total_pages: number }> {
  const data = await fetchTMDB<{
    results: TMDBResult[];
    total_pages: number;
  }>(`/discover/${mediaType}`, {
    with_watch_providers: providerIds.join("|"),
    watch_region: "DE",
    sort_by: sortBy,
    "vote_count.gte": "50",
    page: String(page),
  });

  const resultsWithProviders = await Promise.all(
    data.results.map(async (item) => {
      const providers = await getItemProviders(mediaType, item.id);
      return {
        id: item.id,
        title: item.title || item.name || "Unknown",
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date || "",
        media_type: mediaType,
        providers,
      };
    })
  );

  return { total_pages: data.total_pages, results: resultsWithProviders };
}

async function getItemProviders(
  mediaType: MediaType,
  id: number
): Promise<import("./tmdb-config").ProviderKey[]> {
  try {
    const data = await fetchTMDB<{
      results: Record<string, { flatrate?: { provider_id: number }[] }>;
    }>(`/${mediaType}/${id}/watch/providers`, {});
    const de = data.results?.DE;
    if (!de?.flatrate) return [];
    return providerIdsToKeys(de.flatrate.map((p) => p.provider_id));
  } catch {
    return [];
  }
}
