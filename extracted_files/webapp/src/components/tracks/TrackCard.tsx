import { Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayer } from "@/components/player/PlayerContext";
import type { YouTubeTrack } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TrackCardProps {
  track: YouTubeTrack;
  tracks?: YouTubeTrack[];
  index?: number;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TrackCard({ track, tracks, index = 0 }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, playTracks, togglePlay } = usePlayer();

  const isCurrentTrack = currentTrack?.videoId === track.videoId;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else if (tracks && tracks.length > 0) {
      playTracks(tracks, index);
    } else {
      playTrack(track);
    }
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden bg-card/50 hover:bg-card transition-all duration-300 cursor-pointer",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        isCurrentTrack && "ring-2 ring-primary/50"
      )}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-primary shadow-lg shadow-primary/30",
              "group-hover:scale-110"
            )}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            )}
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white font-medium">
          {formatDuration(track.duration)}
        </div>

        {/* Playing indicator */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary/90 flex items-center gap-1.5">
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[2px] bg-white rounded-sm animate-playing-bar-1" />
              <span className="w-[2px] bg-white rounded-sm animate-playing-bar-2" />
              <span className="w-[2px] bg-white rounded-sm animate-playing-bar-3" />
            </div>
            <span className="text-[10px] font-medium text-white uppercase tracking-wide">
              Playing
            </span>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {track.title}
        </h3>
        <Link
          to={`/artist?name=${encodeURIComponent(track.artist)}`}
          onClick={handleArtistClick}
          className="text-xs text-muted-foreground truncate mt-0.5 block hover:text-primary hover:underline transition-colors"
        >
          {track.artist}
        </Link>
      </div>
    </div>
  );
}
