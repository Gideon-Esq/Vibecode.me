import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Music, User, Play, Shuffle } from "lucide-react";
import { TrackList } from "@/components/tracks/TrackList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { musicApi } from "@/lib/api";
import { usePlayer } from "@/components/player/PlayerContext";

function ArtistSkeleton() {
  return (
    <div className="animate-fade-in-up">
      {/* Header skeleton */}
      <div className="relative h-64 md:h-80">
        <Skeleton className="absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      {/* Tracks skeleton */}
      <div className="p-4 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function Artist() {
  const [searchParams] = useSearchParams();
  const artistName = searchParams.get("name") || "";
  const { playTracks } = usePlayer();

  const {
    data: artistData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["artist", artistName],
    queryFn: () => musicApi.getArtist(artistName),
    enabled: !!artistName,
    staleTime: 1000 * 60 * 5,
  });

  const handlePlayAll = () => {
    if (artistData?.tracks && artistData.tracks.length > 0) {
      playTracks(artistData.tracks, 0);
    }
  };

  const handleShuffle = () => {
    if (artistData?.tracks && artistData.tracks.length > 0) {
      const shuffled = [...artistData.tracks].sort(() => Math.random() - 0.5);
      playTracks(shuffled, 0);
    }
  };

  if (!artistName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">No artist specified</h2>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-20">
        <Link to="/">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <ArtistSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Unable to load artist
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            We couldn't fetch this artist's information. Please try again later.
          </p>
          <Link to="/">
            <Button variant="outline">Go back home</Button>
          </Link>
        </div>
      ) : artistData ? (
        <div className="animate-fade-in-up">
          {/* Artist Header */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {/* Background image with blur */}
            <div className="absolute inset-0">
              {artistData.thumbnail ? (
                <img
                  src={artistData.thumbnail}
                  alt={artistData.artist}
                  className="w-full h-full object-cover scale-110 blur-2xl opacity-50"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            {/* Artist info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-end gap-6">
                {/* Artist avatar */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-2xl flex-shrink-0">
                  {artistData.thumbnail ? (
                    <img
                      src={artistData.thumbnail}
                      alt={artistData.artist}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Artist name and stats */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Artist</p>
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground truncate mb-2">
                    {artistData.artist}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {artistData.tracks.length} tracks
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 md:px-8 py-4 flex items-center gap-3">
            <Button
              onClick={handlePlayAll}
              className="rounded-full gradient-bg hover:opacity-90 text-white gap-2"
              disabled={!artistData.tracks.length}
            >
              <Play className="w-4 h-4 fill-current" />
              Play All
            </Button>
            <Button
              onClick={handleShuffle}
              variant="outline"
              className="rounded-full gap-2"
              disabled={!artistData.tracks.length}
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </Button>
          </div>

          {/* Tracks */}
          <div className="px-4 md:px-8 py-4">
            {artistData.tracks.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Popular Tracks</h2>
                <TrackList tracks={artistData.tracks} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Music className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No tracks found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We couldn't find any tracks for this artist.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
