import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Music, ArrowLeft, Disc3 } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { TrackList } from "@/components/tracks/TrackList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { musicApi } from "@/lib/api";

function TrackListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-10 h-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-10 h-4" />
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const {
    data: results,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => musicApi.search(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
                <Disc3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold gradient-text hidden sm:block">
                SoundFlow
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <SearchBar autoFocus={!query} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {!query ? (
          /* No query state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Search for music
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Enter a song title, artist name, or keywords to find your favorite
              tracks.
            </p>
          </div>
        ) : (
          <>
            {/* Search Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-foreground">
                {isFetching && !isLoading ? (
                  <span className="flex items-center gap-2">
                    Searching
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </span>
                ) : (
                  `Results for "${query}"`
                )}
              </h1>
              {results && results.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {results.length} track{results.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {/* Results */}
            {isLoading ? (
              <TrackListSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Music className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Search failed
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We could not complete your search. Please try again.
                </p>
              </div>
            ) : results && results.length > 0 ? (
              <TrackList tracks={results} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Music className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No results found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We could not find any tracks matching "{query}". Try a different
                  search term.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
