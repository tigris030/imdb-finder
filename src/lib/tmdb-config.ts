export const PROVIDERS = {
  netflix: { id: 8, name: "Netflix", color: "#E50914" },
  amazon: { id: 9, name: "Amazon Prime", color: "#00A8E1" },
  disney: { id: 337, name: "Disney+", color: "#113CCF" },
  apple: { id: 350, name: "Apple TV+", color: "#000000" },
} as const;

export type ProviderKey = keyof typeof PROVIDERS;
export type MediaType = "movie" | "tv";

export const SORT_OPTIONS = {
  "popularity.desc": "Most Popular",
  "vote_average.desc": "Highest Rated",
  "primary_release_date.desc": "Newest",
  "primary_release_date.asc": "Oldest",
  "vote_count.desc": "Most Voted",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export interface MediaItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  media_type: MediaType;
  providers: ProviderKey[];
}

const PROVIDER_ID_TO_KEY: Record<number, ProviderKey> = Object.fromEntries(
  (Object.entries(PROVIDERS) as [ProviderKey, { id: number }][]).map(([key, val]) => [val.id, key])
) as Record<number, ProviderKey>;

export function providerIdsToKeys(ids: number[]): ProviderKey[] {
  return ids.map((id) => PROVIDER_ID_TO_KEY[id]).filter(Boolean);
}

export function posterUrl(imgPath: string | null, size = "w500"): string {
  if (!imgPath) return "/no-poster.svg";
  return `/api/image?path=${encodeURIComponent(imgPath)}&size=${size}`;
}
