import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayer } from "@/components/player/PlayerContext";
import type { YouTubeTrack } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TrackListProps {
  tracks: YouTubeTrack[];
  showIndex?: boolean;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function PlayingIndicator() {
  return (
    <div className="flex items-end gap-[2px] h-3">
      <span className="w-[2px] bg-primary rounded-sm animate-playing-bar-1" />
      <span className="w-[2px] bg-primary rounded-sm animate-playing-bar-2" />
      <span className="w-[2px] bg-primary rounded-sm animate-playing-bar-3" />
    </div>
  );
}

export function TrackList({ tracks, showIndex = true }: TrackListProps) {
  const { currentTrack, isPlaying, playTracks, togglePlay } = usePlayer();

  const handleTrackClick = (index: number) => {
    const track = tracks[index];
    if (currentTrack?.videoId === track.videoId) {
      togglePlay();
    } else {
      playTracks(tracks, index);
    }
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-1">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.videoId === track.videoId;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;

        return (
          <div
            key={track.videoId}
            className={cn(
              "group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer",
              "hover:bg-white/5",
              isCurrentTrack && "bg-white/5"
            )}
            onClick={() => handleTrackClick(index)}
          >
            {/* Index / Play indicator */}
            <div className="w-8 flex items-center justify-center flex-shrink-0">
              {isCurrentlyPlaying ? (
                <PlayingIndicator />
              ) : (
                <>
                  <span
                    className={cn(
                      "text-sm text-muted-foreground group-hover:hidden",
                      isCurrentTrack && "text-primary"
                    )}
                  >
                    {showIndex ? index + 1 : null}
                  </span>
                  <Play
                    className={cn(
                      "w-4 h-4 hidden group-hover:block",
                      isCurrentTrack ? "text-primary" : "text-foreground"
                    )}
                    fill="currentColor"
                  />
                </>
              )}
            </div>

            {/* Thumbnail */}
            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              {isCurrentlyPlaying && (
                <div className="absolute inset-0 bg-black/30" />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "text-sm font-medium truncate transition-colors",
                  isCurrentTrack ? "text-primary" : "text-foreground"
                )}
              >
                {track.title}
              </h4>
              <Link
                to={`/artist?name=${encodeURIComponent(track.artist)}`}
                onClick={handleArtistClick}
                className="text-xs text-muted-foreground truncate block hover:text-primary hover:underline transition-colors"
              >
                {track.artist}
              </Link>
            </div>

            {/* Duration */}
            <div className="text-sm text-muted-foreground flex-shrink-0">
              {formatDuration(track.duration)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
