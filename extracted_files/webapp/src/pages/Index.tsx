import { useQuery } from "@tanstack/react-query";
import { Music, TrendingUp, Disc3 } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { TrackCard } from "@/components/tracks/TrackCard";
import { Skeleton } from "@/components/ui/skeleton";
import { musicApi, type YouTubeTrack } from "@/lib/api";

function TrackCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card/50">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function TrackGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <TrackCardSkeleton key={i} />
      ))}
    </div>
  );
}

function TrackGrid({ tracks }: { tracks: YouTubeTrack[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {tracks.map((track, index) => (
        <TrackCard
          key={track.videoId}
          track={track}
          tracks={tracks}
          index={index}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const {
    data: trendingTracks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trending"],
    queryFn: musicApi.getTrending,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo / Brand */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 gradient-bg flex items-center justify-center shadow-lg shadow-primary/20 rounded-none">
                <Disc3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="gradient-text">Beatlogic.ai</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-md mx-auto">
              Discover and stream music for free. Your next favorite song is waiting.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar size="large" />
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Trending Now
              </h2>
              <p className="text-sm text-muted-foreground">
                The hottest tracks right now
              </p>
            </div>
          </div>

          {/* Track Grid */}
          {isLoading ? (
            <TrackGridSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Unable to load tracks
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We could not fetch the trending tracks. Please try again later.
              </p>
            </div>
          ) : trendingTracks && trendingTracks.length > 0 ? (
            <TrackGrid tracks={trendingTracks} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No tracks available
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Search for your favorite songs to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015] z-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
