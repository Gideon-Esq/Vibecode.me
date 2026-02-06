import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { YouTubeTrack } from "@/lib/api";

// YouTube IFrame API types
interface YTPlayer {
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

interface PlayerState {
  currentTrack: YouTubeTrack | null;
  queue: YouTubeTrack[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
}

interface PlayerContextType extends PlayerState {
  playTrack: (track: YouTubeTrack) => void;
  playTracks: (tracks: YouTubeTrack[], startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: YouTubeTrack) => void;
  clearQueue: () => void;
  playerRef: React.MutableRefObject<YTPlayer | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    volume: 80,
    progress: 0,
    duration: 0,
    isMuted: false,
    isShuffled: false,
    repeatMode: "off",
  });

  const playerRef = useRef<YTPlayer | null>(null);
  const originalQueueRef = useRef<YouTubeTrack[]>([]);

  const playTrack = useCallback((track: YouTubeTrack) => {
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
    }));
  }, []);

  const playTracks = useCallback((tracks: YouTubeTrack[], startIndex = 0) => {
    if (tracks.length === 0) return;

    originalQueueRef.current = tracks;
    const queue = state.isShuffled
      ? shuffleArray([...tracks])
      : [...tracks];

    const trackToPlay = state.isShuffled
      ? queue[0]
      : tracks[startIndex];

    setState((prev) => ({
      ...prev,
      queue,
      currentTrack: trackToPlay,
      isPlaying: true,
      progress: 0,
    }));
  }, [state.isShuffled]);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const play = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const nextTrack = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0 || !prev.currentTrack) return prev;

      const currentIndex = prev.queue.findIndex(
        (t) => t.videoId === prev.currentTrack?.videoId
      );

      let nextIndex: number;

      if (prev.repeatMode === "one") {
        return { ...prev, progress: 0 };
      } else if (currentIndex === prev.queue.length - 1) {
        if (prev.repeatMode === "all") {
          nextIndex = 0;
        } else {
          return { ...prev, isPlaying: false };
        }
      } else {
        nextIndex = currentIndex + 1;
      }

      return {
        ...prev,
        currentTrack: prev.queue[nextIndex],
        progress: 0,
        isPlaying: true,
      };
    });
  }, []);

  const prevTrack = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0 || !prev.currentTrack) return prev;

      // If more than 3 seconds in, restart current track
      if (prev.progress > 3) {
        return { ...prev, progress: 0 };
      }

      const currentIndex = prev.queue.findIndex(
        (t) => t.videoId === prev.currentTrack?.videoId
      );

      const prevIndex = currentIndex <= 0 ? prev.queue.length - 1 : currentIndex - 1;

      return {
        ...prev,
        currentTrack: prev.queue[prevIndex],
        progress: 0,
        isPlaying: true,
      };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const seekTo = useCallback((time: number) => {
    setState((prev) => ({ ...prev, progress: time }));
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, duration }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const newShuffled = !prev.isShuffled;

      if (newShuffled && prev.queue.length > 0) {
        const shuffledQueue = shuffleArray([...prev.queue]);
        // Move current track to front
        if (prev.currentTrack) {
          const currentIndex = shuffledQueue.findIndex(
            (t) => t.videoId === prev.currentTrack?.videoId
          );
          if (currentIndex > 0) {
            [shuffledQueue[0], shuffledQueue[currentIndex]] = [
              shuffledQueue[currentIndex],
              shuffledQueue[0],
            ];
          }
        }
        return { ...prev, isShuffled: newShuffled, queue: shuffledQueue };
      } else if (!newShuffled && originalQueueRef.current.length > 0) {
        return { ...prev, isShuffled: newShuffled, queue: [...originalQueueRef.current] };
      }

      return { ...prev, isShuffled: newShuffled };
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, repeatMode: modes[nextIndex] };
    });
  }, []);

  const addToQueue = useCallback((track: YouTubeTrack) => {
    setState((prev) => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
    originalQueueRef.current.push(track);
  }, []);

  const clearQueue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      queue: [],
      currentTrack: null,
      isPlaying: false,
    }));
    originalQueueRef.current = [];
  }, []);

  // Sync volume with player
  useEffect(() => {
    if (playerRef.current) {
      const actualVolume = state.isMuted ? 0 : state.volume;
      playerRef.current.setVolume(actualVolume);
    }
  }, [state.volume, state.isMuted]);

  // Sync play state with player
  useEffect(() => {
    if (playerRef.current && state.currentTrack) {
      if (state.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [state.isPlaying, state.currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playTrack,
        playTracks,
        togglePlay,
        pause,
        play,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        seekTo,
        setProgress,
        setDuration,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        clearQueue,
        playerRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
