"use client";

import { useRouter } from "next/navigation";
import { PROVIDERS, SORT_OPTIONS, type ProviderKey, type MediaType, type SortKey } from "@/lib/tmdb-config";

interface Props {
  activeProviders: ProviderKey[];
  mediaType: MediaType;
  sortBy: SortKey;
}

export default function ProviderFilter({ activeProviders, mediaType, sortBy }: Props) {
  const router = useRouter();

  function navigate(providers: ProviderKey[], type: MediaType, sort: SortKey) {
    const params = new URLSearchParams();
    if (providers.length > 0) params.set("providers", providers.join(","));
    if (type !== "movie") params.set("type", type);
    if (sort !== "popularity.desc") params.set("sort", sort);
    router.push(`/?${params.toString()}`);
  }

  function toggleProvider(key: ProviderKey) {
    const next = activeProviders.includes(key)
      ? activeProviders.filter((p) => p !== key)
      : [...activeProviders, key];
    navigate(next, mediaType, sortBy);
  }

  function toggleMediaType() {
    navigate(activeProviders, mediaType === "movie" ? "tv" : "movie", sortBy);
  }

  function changeSort(sort: SortKey) {
    navigate(activeProviders, mediaType, sort);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
        const provider = PROVIDERS[key];
        const active = activeProviders.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggleProvider(key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
            style={{
              backgroundColor: active ? provider.color : "transparent",
              borderColor: provider.color,
              color: active ? "#fff" : provider.color,
              opacity: active ? 1 : 0.6,
            }}
          >
            {provider.name}
          </button>
        );
      })}

      <div className="ml-auto flex items-center gap-3">
        <select
          value={sortBy}
          onChange={(e) => changeSort(e.target.value as SortKey)}
          className="bg-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-zinc-500"
        >
          {(Object.entries(SORT_OPTIONS) as [SortKey, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1">
          <button
            onClick={() => mediaType !== "movie" && toggleMediaType()}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mediaType === "movie" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => mediaType !== "tv" && toggleMediaType()}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mediaType === "tv" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            Series
          </button>
        </div>
      </div>
    </div>
  );
}
