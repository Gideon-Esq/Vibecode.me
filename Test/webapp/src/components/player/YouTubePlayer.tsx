import { useEffect, useRef, useCallback } from "react";
import { usePlayer } from "./PlayerContext";

// Declare the YouTube IFrame API on window
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height: string;
          width: string;
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
}

export function YouTubePlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    playerRef,
    setProgress,
    setDuration,
    nextTrack,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);
  const lastVideoIdRef = useRef<string | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize player when API is ready
  const initPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) return;

    const player = new window.YT.Player("youtube-player", {
      height: "1",
      width: "1",
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event) => {
          playerRef.current = event.target;
          isReadyRef.current = true;
          event.target.setVolume(volume);
        },
        onStateChange: (event) => {
          // Track ended
          if (event.data === window.YT.PlayerState.ENDED) {
            nextTrack();
          }

          // Update duration when video is cued or playing
          if (
            event.data === window.YT.PlayerState.PLAYING ||
            event.data === window.YT.PlayerState.CUED
          ) {
            const duration = event.target.getDuration();
            if (duration > 0) {
              setDuration(duration);
            }
          }
        },
        onError: (event) => {
          console.error("YouTube Player Error:", event.data);
          // Skip to next track on error
          nextTrack();
        },
      },
    });
  }, [playerRef, volume, setDuration, nextTrack]);

  // Wait for YT API and initialize
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [initPlayer]);

  // Load new video when track changes
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current || !currentTrack) return;

    if (lastVideoIdRef.current !== currentTrack.videoId) {
      lastVideoIdRef.current = currentTrack.videoId;
      playerRef.current.loadVideoById(currentTrack.videoId);
      setProgress(0);
    }
  }, [currentTrack, playerRef, setProgress]);

  // Control playback state
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, playerRef]);

  // Control volume
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    const actualVolume = isMuted ? 0 : volume;
    playerRef.current.setVolume(actualVolume);
  }, [volume, isMuted, playerRef]);

  // Update progress
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (isPlaying && playerRef.current) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && isReadyRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          setProgress(currentTime);
        }
      }, 1000);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, playerRef, setProgress]);

  return (
    <div ref={containerRef} className="youtube-player-hidden">
      <div id="youtube-player" />
    </div>
  );
}
