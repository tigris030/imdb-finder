import Link from "next/link";
import { posterUrl, PROVIDERS, type MediaItem, type ProviderKey, type MediaType, type SortKey } from "@/lib/tmdb-config";

interface Props {
  items: MediaItem[];
  currentPage: number;
  totalPages: number;
  activeProviders: ProviderKey[];
  mediaType: MediaType;
  sortBy: SortKey;
}

function buildPageUrl(page: number, providers: ProviderKey[], type: MediaType, sort: SortKey) {
  const params = new URLSearchParams();
  if (providers.length > 0) params.set("providers", providers.join(","));
  if (type !== "movie") params.set("type", type);
  if (sort !== "popularity.desc") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return `/?${params.toString()}`;
}

export default function MediaGrid({ items, currentPage, totalPages, activeProviders, mediaType, sortBy }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-center text-zinc-500 py-20">
        No results found. Try selecting a provider above.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-lg overflow-hidden bg-zinc-900 transition-transform hover:scale-105"
          >
            <div className="aspect-[2/3] relative">
              {item.poster_path ? (
                <img
                  src={posterUrl(item.poster_path)}
                  alt={item.title}
                  loading="lazy"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-sm">
                  No Image
                </div>
              )}

              {/* Rating badge — always visible */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1">
                <span className="text-yellow-400 text-xs font-bold">★ {item.vote_average.toFixed(1)}</span>
              </div>

              {/* Provider badges — always visible */}
              {item.providers.length > 0 && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.providers.map((key) => (
                    <span
                      key={key}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white leading-tight"
                      style={{ backgroundColor: PROVIDERS[key].color }}
                    >
                      {PROVIDERS[key].name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hover overlay with details */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <h3 className="text-white font-semibold text-sm leading-tight">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {item.release_date && (
                  <span className="text-zinc-300 text-xs">{item.release_date.slice(0, 4)}</span>
                )}
                <span className="text-yellow-400 text-xs font-medium">
                  ★ {item.vote_average.toFixed(1)}
                </span>
              </div>
              <p className="text-zinc-300 text-xs mt-1 line-clamp-3">{item.overview}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {currentPage > 1 ? (
            <Link
              href={buildPageUrl(currentPage - 1, activeProviders, mediaType, sortBy)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              ← Previous
            </Link>
          ) : (
            <span className="px-4 py-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-600">← Previous</span>
          )}

          <span className="text-zinc-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={buildPageUrl(currentPage + 1, activeProviders, mediaType, sortBy)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              Next →
            </Link>
          ) : (
            <span className="px-4 py-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-600">Next →</span>
          )}
        </div>
      )}
    </>
  );
}
