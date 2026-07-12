import 'server-only';

const BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;
const API_KEY = process.env.TMDB_API_KEY;

if (!ACCESS_TOKEN && !API_KEY) {
  console.warn('TMDB_READ_ACCESS_TOKEN or TMDB_API_KEY is missing in environment variables.');
}

// --- Types ---

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  video: boolean;
  adult: boolean;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface RequestTokenResponse {
  success: boolean;
  expires_at: string;
  request_token: string;
}

export interface SessionIdResponse {
  success: boolean;
  session_id: string;
}

export interface AccountDetails {
  id: number;
  name: string;
  username: string;
  include_adult: boolean;
  avatar: {
    gravatar: {
      hash: string;
    };
    tmdb: {
      avatar_path: string | null;
    };
  };
}

// --- Helpers ---

async function fetchTMDB<T>(endpoint: string, options: RequestInit = {}, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  // Add API Key to params if using v3 auth via query param and no bearer token is present (or as fallback)
  // Standard way: Bearer token in header is preferred.

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
  } else if (API_KEY) {
    params['api_key'] = API_KEY;
  }

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// --- Service ---

export const TMDBService = {
  getTrending: async (timeWindow: 'day' | 'week' = 'day'): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
  },

  getNowPlaying: async (): Promise<TMDBResponse<TMDBMovie>> => {
    return fetchTMDB<TMDBResponse<TMDBMovie>>('/movie/now_playing', {
      next: { revalidate: 3600 },
    });
  },

  getRequestToken: async (): Promise<RequestTokenResponse> => {
    return fetchTMDB<RequestTokenResponse>('/authentication/token/new', {
      cache: 'no-store',
    });
  },

  createSessionId: async (requestToken: string): Promise<SessionIdResponse> => {
    return fetchTMDB<SessionIdResponse>('/authentication/session/new', {
      method: 'POST',
      body: JSON.stringify({ request_token: requestToken }),
      cache: 'no-store',
    });
  },

  getAccountDetails: async (sessionId: string): Promise<AccountDetails> => {
    return fetchTMDB<AccountDetails>('/account', {
      cache: 'no-store',
    }, { session_id: sessionId });
  },
};
