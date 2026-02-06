import { z } from "zod";

// ============================================
// Auth Types (Better Auth)
// ============================================

// User schema for API responses
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type User = z.infer<typeof UserSchema>;

// Session schema for API responses
export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.string().or(z.date()),
});

export type Session = z.infer<typeof SessionSchema>;

// Auth response with user and session
export const AuthResponseSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Signup request schema
export const SignupRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().optional(),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ============================================
// YouTube Types
// ============================================

// YouTube Track schema
export const YouTubeTrackSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  artist: z.string(), // channel name
  thumbnail: z.string().url(),
  duration: z.number(), // duration in seconds
});

export type YouTubeTrack = z.infer<typeof YouTubeTrackSchema>;

// Search Response schema
export const SearchResponseSchema = z.object({
  data: z.array(YouTubeTrackSchema),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// Trending category
export const TrendingCategorySchema = z.object({
  category: z.string(),
  tracks: z.array(YouTubeTrackSchema),
});

export type TrendingCategory = z.infer<typeof TrendingCategorySchema>;

// Trending Response schema
export const TrendingResponseSchema = z.object({
  data: z.array(YouTubeTrackSchema),
});

export type TrendingResponse = z.infer<typeof TrendingResponseSchema>;

// Related Response schema
export const RelatedResponseSchema = z.object({
  data: z.array(YouTubeTrackSchema),
});

export type RelatedResponse = z.infer<typeof RelatedResponseSchema>;

// Invidious API response types (for internal use)
export const InvidiousVideoSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  author: z.string(),
  videoThumbnails: z.array(
    z.object({
      quality: z.string(),
      url: z.string(),
      width: z.number(),
      height: z.number(),
    })
  ),
  lengthSeconds: z.number(),
});

export type InvidiousVideo = z.infer<typeof InvidiousVideoSchema>;

// Invidious search result
export const InvidiousSearchResultSchema = z.object({
  type: z.string(),
  videoId: z.string().optional(),
  title: z.string().optional(),
  author: z.string().optional(),
  videoThumbnails: z
    .array(
      z.object({
        quality: z.string(),
        url: z.string(),
        width: z.number(),
        height: z.number(),
      })
    )
    .optional(),
  lengthSeconds: z.number().optional(),
});

export type InvidiousSearchResult = z.infer<typeof InvidiousSearchResultSchema>;

// Invidious video detail (for related videos)
export const InvidiousVideoDetailSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  author: z.string(),
  videoThumbnails: z.array(
    z.object({
      quality: z.string(),
      url: z.string(),
      width: z.number(),
      height: z.number(),
    })
  ),
  lengthSeconds: z.number(),
  recommendedVideos: z.array(
    z.object({
      videoId: z.string(),
      title: z.string(),
      author: z.string(),
      videoThumbnails: z.array(
        z.object({
          quality: z.string(),
          url: z.string(),
          width: z.number(),
          height: z.number(),
        })
      ),
      lengthSeconds: z.number(),
    })
  ).optional(),
});

export type InvidiousVideoDetail = z.infer<typeof InvidiousVideoDetailSchema>;
