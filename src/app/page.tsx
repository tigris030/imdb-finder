import { discoverMedia, PROVIDERS, type ProviderKey, type MediaType } from "@/lib/tmdb";
import { SORT_OPTIONS, type SortKey } from "@/lib/tmdb-config";
import MediaGrid from "@/components/media-grid";
import ProviderFilter from "@/components/provider-filter";

interface Props {
  searchParams: Promise<{ providers?: string; type?: string; page?: string; sort?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const activeProviders: ProviderKey[] = params.providers
    ? (params.providers.split(",") as ProviderKey[])
    : ["netflix", "amazon", "disney", "apple"];
  const mediaType: MediaType = params.type === "tv" ? "tv" : "movie";
  const page = Math.max(1, Number(params.page) || 1);
  const sortBy: SortKey = params.sort && params.sort in SORT_OPTIONS
    ? (params.sort as SortKey)
    : "popularity.desc";

  const providerIds = activeProviders.map((key) => PROVIDERS[key].id);

  const { results, total_pages } = providerIds.length > 0
    ? await discoverMedia(mediaType, providerIds, page, sortBy)
    : { results: [], total_pages: 0 };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Streaming Finder DE</h1>
      <p className="text-zinc-400 mb-6">
        Browse movies &amp; series available on streaming platforms in Germany
      </p>

      <ProviderFilter
        activeProviders={activeProviders}
        mediaType={mediaType}
        sortBy={sortBy}
      />

      <MediaGrid
        items={results}
        currentPage={page}
        totalPages={total_pages}
        activeProviders={activeProviders}
        mediaType={mediaType}
        sortBy={sortBy}
      />
    </main>
  );
}
