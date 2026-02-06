import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { YouTubeTrack } from "../types";

const youtubeRouter = new Hono();

// YouTube Data API key
const YOUTUBE_API_KEY = "AIzaSyCAG3fCbM50euKVvC3b1QpQyUzCLepxuQo";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Type definitions for YouTube API responses
interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
  contentDetails?: {
    duration: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[];
}

// Parse ISO 8601 duration to seconds (e.g., "PT4M13S" -> 253)
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Get best thumbnail
function getBestThumbnail(thumbnails: YouTubeVideoItem["snippet"]["thumbnails"]): string {
  return thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "";
}

// Transform YouTube search result to YouTubeTrack
function searchItemToTrack(item: YouTubeSearchItem, duration: number = 0): YouTubeTrack {
  return {
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: getBestThumbnail(item.snippet.thumbnails),
    duration,
  };
}

// Transform YouTube video to YouTubeTrack
function videoToTrack(item: YouTubeVideoItem): YouTubeTrack {
  return {
    videoId: item.id,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: getBestThumbnail(item.snippet.thumbnails),
    duration: item.contentDetails ? parseDuration(item.contentDetails.duration) : 0,
  };
}

// Fetch video details (for duration)
async function getVideoDetails(videoIds: string[]): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  if (videoIds.length === 0) return durations;

  try {
    const url = `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    if (response.ok) {
      const data: YouTubeVideosResponse = await response.json();
      if (data.items) {
        for (const item of data.items) {
          if (item.contentDetails?.duration) {
            durations.set(item.id, parseDuration(item.contentDetails.duration));
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch video details:", e);
  }
  return durations;
}

// GET /search?q=query - Search YouTube for music videos
youtubeRouter.get(
  "/search",
  zValidator("query", z.object({ q: z.string().min(1) })),
  async (c) => {
    const { q } = c.req.valid("query");

    try {
      // Search for music videos
      const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error("YouTube search failed:", error);
        return c.json(
          { error: { message: "YouTube search failed", code: "SEARCH_FAILED" } },
          503
        );
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) {
        return c.json({ data: [] });
      }

      // Get video durations
      const videoIds = searchData.items.map((item) => item.id.videoId);
      const durations = await getVideoDetails(videoIds);

      // Transform to tracks
      const tracks: YouTubeTrack[] = searchData.items.map((item) =>
        searchItemToTrack(item, durations.get(item.id.videoId) || 0)
      );

      return c.json({ data: tracks });
    } catch (e) {
      console.error("Search error:", e);
      return c.json(
        { error: { message: "Search failed", code: "SEARCH_FAILED" } },
        503
      );
    }
  }
);

// GET /trending - Get trending music videos
youtubeRouter.get("/trending", async (c) => {
  try {
    // Get most popular music videos
    const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&regionCode=US&maxResults=20&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      console.error("YouTube trending failed:", error);
      return c.json(
        { error: { message: "Failed to fetch trending", code: "TRENDING_FAILED" } },
        503
      );
    }

    const data: YouTubeVideosResponse = await response.json();
    if (!data.items || data.items.length === 0) {
      return c.json({ data: [] });
    }

    const tracks: YouTubeTrack[] = data.items.map(videoToTrack);
    return c.json({ data: tracks });
  } catch (e) {
    console.error("Trending error:", e);
    return c.json(
      { error: { message: "Failed to fetch trending", code: "TRENDING_FAILED" } },
      503
    );
  }
});

// GET /artist?name=artistName - Get videos from a specific artist/channel
youtubeRouter.get(
  "/artist",
  zValidator("query", z.object({ name: z.string().min(1) })),
  async (c) => {
    const { name } = c.req.valid("query");

    try {
      // Search for videos from this artist
      const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(name)}&type=video&videoCategoryId=10&maxResults=30&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error("YouTube artist search failed:", error);
        return c.json(
          { error: { message: "Artist search failed", code: "ARTIST_FAILED" } },
          503
        );
      }

      const searchData: YouTubeSearchResponse = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) {
        return c.json({ data: { artist: name, tracks: [] } });
      }

      // Get video durations
      const videoIds = searchData.items.map((item) => item.id.videoId);
      const durations = await getVideoDetails(videoIds);

      // Transform to tracks
      const tracks: YouTubeTrack[] = searchData.items.map((item) =>
        searchItemToTrack(item, durations.get(item.id.videoId) || 0)
      );

      // Get artist thumbnail from first result
      const artistThumbnail = tracks[0]?.thumbnail || "";

      return c.json({
        data: {
          artist: name,
          thumbnail: artistThumbnail,
          tracks,
        },
      });
    } catch (e) {
      console.error("Artist error:", e);
      return c.json(
        { error: { message: "Artist search failed", code: "ARTIST_FAILED" } },
        503
      );
    }
  }
);

// GET /related/:videoId - Get related videos for a track
youtubeRouter.get("/related/:videoId", async (c) => {
  const videoId = c.req.param("videoId");

  try {
    // Search for related music videos
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=15&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      console.error("YouTube related failed:", error);
      return c.json(
        { error: { message: "Failed to fetch related", code: "RELATED_FAILED" } },
        503
      );
    }

    const data: YouTubeSearchResponse = await response.json();
    if (!data.items || data.items.length === 0) {
      return c.json({ data: [] });
    }

    // Get video durations
    const videoIds = data.items.map((item) => item.id.videoId);
    const durations = await getVideoDetails(videoIds);

    const tracks: YouTubeTrack[] = data.items.map((item) =>
      searchItemToTrack(item, durations.get(item.id.videoId) || 0)
    );

    return c.json({ data: tracks });
  } catch (e) {
    console.error("Related error:", e);
    return c.json(
      { error: { message: "Failed to fetch related", code: "RELATED_FAILED" } },
      503
    );
  }
});

export { youtubeRouter };
