import axios, { AxiosInstance } from 'axios';
import type {
  Movie,
  MovieDetails,
  Credits,
  AccountDetails,
  AuthToken,
  Session,
  PaginatedResponse,
  SearchResult,
  WatchlistRequest,
  FavoriteRequest,
  RatingRequest,
  ApiResponse,
  ListItem,
  Genre,
  PersonDetails,
  PersonMovieCredits,
  TVShow,
  TVDetails,
} from '@/types/tmdb';

class TMDBClient {
  private client: AxiosInstance;
  private baseURL: string;
  private imageBaseURL: string;
  private authBaseURL: string;

  constructor() {
    // Requests go through our own /api/tmdb proxy, which attaches the TMDB API
    // key server-side (see app/api/tmdb/[...path]/route.ts) — the key never
    // reaches the browser bundle.
    this.baseURL = '/api/tmdb';
    this.imageBaseURL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';
    this.authBaseURL = process.env.NEXT_PUBLIC_TMDB_AUTH_BASE_URL || 'https://www.themoviedb.org';

    this.client = axios.create({
      baseURL: this.baseURL,
    });
  }

  // Helper to get session from local storage
  private getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tmdb_session_id');
  }

  // Image URL helpers
  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-movie.png';
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getProfileUrl(path: string | null, size: 'w185' | 'w300' | 'h632' | 'original' = 'w185'): string {
    if (!path) return '/placeholder-profile.png';
    return `${this.imageBaseURL}/${size}${path}`;
  }

  // =====================================
  // AUTHENTICATION (3-Legged OAuth Flow)
  // =====================================

  async getRequestToken(): Promise<AuthToken> {
    const response = await this.client.get<AuthToken>('/authentication/token/new');
    return response.data;
  }

  getAuthUrl(requestToken: string, redirectUrl?: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : redirectUrl || '';
    return `${this.authBaseURL}/authenticate/${requestToken}?redirect_to=${encodeURIComponent(baseUrl)}/auth/callback`;
  }

  async createSession(requestToken: string): Promise<Session> {
    const response = await this.client.post<Session>('/authentication/session/new', {
      request_token: requestToken,
    });
    
    if (response.data.success && typeof window !== 'undefined') {
      localStorage.setItem('tmdb_session_id', response.data.session_id);
    }
    
    return response.data;
  }

  async deleteSession(): Promise<ApiResponse> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.delete<ApiResponse>('/authentication/session', {
      data: { session_id: sessionId },
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tmdb_session_id');
    }
    
    return response.data;
  }

  // =====================================
  // ACCOUNT & USER DASHBOARD
  // =====================================

  async getAccountDetails(): Promise<AccountDetails> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.get<AccountDetails>('/account', {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  async getWatchlist(accountId: number, page: number = 1): Promise<PaginatedResponse<Movie>> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.get<PaginatedResponse<Movie>>(
      `/account/${accountId}/watchlist/movies`,
      {
        params: { session_id: sessionId, page },
      }
    );
    return response.data;
  }

  async addToWatchlist(accountId: number, request: WatchlistRequest): Promise<ApiResponse> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.post<ApiResponse>(
      `/account/${accountId}/watchlist`,
      request,
      {
        params: { session_id: sessionId },
      }
    );
    return response.data;
  }

  async getFavorites(accountId: number, page: number = 1): Promise<PaginatedResponse<Movie>> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.get<PaginatedResponse<Movie>>(
      `/account/${accountId}/favorite/movies`,
      {
        params: { session_id: sessionId, page },
      }
    );
    return response.data;
  }

  async addToFavorites(accountId: number, request: FavoriteRequest): Promise<ApiResponse> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.post<ApiResponse>(
      `/account/${accountId}/favorite`,
      request,
      {
        params: { session_id: sessionId },
      }
    );
    return response.data;
  }

  async getCreatedLists(accountId: number, page: number = 1): Promise<PaginatedResponse<ListItem>> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.get<PaginatedResponse<ListItem>>(
      `/account/${accountId}/lists`,
      {
        params: { session_id: sessionId, page },
      }
    );
    return response.data;
  }

  // =====================================
  // DISCOVERY & SEARCH
  // =====================================

  async multiSearch(query: string, page: number = 1): Promise<PaginatedResponse<SearchResult>> {
    const response = await this.client.get<PaginatedResponse<SearchResult>>('/search/multi', {
      params: { query, page },
    });
    return response.data;
  }

  async searchMovies(query: string, page: number = 1): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>('/search/movie', {
      params: { query, page },
    });
    return response.data;
  }

  async discoverMovies(params: {
    page?: number;
    with_genres?: string;
    primary_release_year?: number;
    'vote_average.gte'?: number;
    'vote_average.lte'?: number;
    sort_by?: string;
  }): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>('/discover/movie', {
      params,
    });
    return response.data;
  }

  // =====================================
  // TV SERIES
  // =====================================

  async getTVDetails(tvId: number): Promise<TVDetails> {
    const response = await this.client.get<TVDetails>(`/tv/${tvId}`);
    return response.data;
  }

  async getTVCredits(tvId: number): Promise<Credits> {
    const response = await this.client.get<Credits>(`/tv/${tvId}/credits`);
    return response.data;
  }

  async getSimilarTV(tvId: number, page: number = 1): Promise<PaginatedResponse<TVShow>> {
    const response = await this.client.get<PaginatedResponse<TVShow>>(`/tv/${tvId}/similar`, {
      params: { page },
    });
    return response.data;
  }

  async getTrendingTV(timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<TVShow>> {
    const response = await this.client.get<PaginatedResponse<TVShow>>(
      `/trending/tv/${timeWindow}`
    );
    return response.data;
  }

  async getPopularTV(page: number = 1): Promise<PaginatedResponse<TVShow>> {
    const response = await this.client.get<PaginatedResponse<TVShow>>('/tv/popular', {
      params: { page },
    });
    return response.data;
  }

  async getTopRatedTV(page: number = 1): Promise<PaginatedResponse<TVShow>> {
    const response = await this.client.get<PaginatedResponse<TVShow>>('/tv/top_rated', {
      params: { page },
    });
    return response.data;
  }

  async getOnTheAirTV(page: number = 1): Promise<PaginatedResponse<TVShow>> {
    const response = await this.client.get<PaginatedResponse<TVShow>>('/tv/on_the_air', {
      params: { page },
    });
    return response.data;
  }

  async getAiringTodayTV(page: number = 1): Promise<PaginatedResponse<TVShow>> {
    const response = await this.client.get<PaginatedResponse<TVShow>>('/tv/airing_today', {
      params: { page },
    });
    return response.data;
  }

  // =====================================
  // PEOPLE
  // =====================================

  async getPersonDetails(personId: number): Promise<PersonDetails> {
    const response = await this.client.get<PersonDetails>(`/person/${personId}`);
    return response.data;
  }

  async getPersonMovieCredits(personId: number): Promise<PersonMovieCredits> {
    const response = await this.client.get<PersonMovieCredits>(
      `/person/${personId}/movie_credits`
    );
    return response.data;
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    const response = await this.client.get<{ genres: Genre[] }>('/genre/movie/list');
    return response.data;
  }

  // =====================================
  // MOVIE DETAILS
  // =====================================

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    const response = await this.client.get<MovieDetails>(`/movie/${movieId}`);
    return response.data;
  }

  async getMovieCredits(movieId: number): Promise<Credits> {
    const response = await this.client.get<Credits>(`/movie/${movieId}/credits`);
    return response.data;
  }

  async getSimilarMovies(movieId: number, page: number = 1): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>(`/movie/${movieId}/similar`, {
      params: { page },
    });
    return response.data;
  }

  async rateMovie(movieId: number, rating: number): Promise<ApiResponse> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const request: RatingRequest = { value: rating };
    const response = await this.client.post<ApiResponse>(
      `/movie/${movieId}/rating`,
      request,
      {
        params: { session_id: sessionId },
      }
    );
    return response.data;
  }

  async deleteMovieRating(movieId: number): Promise<ApiResponse> {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No active session');
    
    const response = await this.client.delete<ApiResponse>(`/movie/${movieId}/rating`, {
      params: { session_id: sessionId },
    });
    return response.data;
  }

  // =====================================
  // TRENDING & POPULAR
  // =====================================

  async getTrending(mediaType: 'movie' | 'tv' | 'all' = 'movie', timeWindow: 'day' | 'week' = 'week'): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>(`/trending/${mediaType}/${timeWindow}`);
    return response.data;
  }

  async getNowPlaying(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>('/movie/now_playing', {
      params: { page },
    });
    return response.data;
  }

  async getPopular(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>('/movie/popular', {
      params: { page },
    });
    return response.data;
  }

  async getTopRated(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  }

  async getUpcoming(page: number = 1): Promise<PaginatedResponse<Movie>> {
    const response = await this.client.get<PaginatedResponse<Movie>>('/movie/upcoming', {
      params: { page },
    });
    return response.data;
  }
}

// Export singleton instance
export const tmdb = new TMDBClient();

// Export service repository pattern
export const MovieService = {
  getTrending: () => tmdb.getTrending(),
  getNowPlaying: () => tmdb.getNowPlaying(),
  getPopular: () => tmdb.getPopular(),
  getTopRated: () => tmdb.getTopRated(),
  getUpcoming: () => tmdb.getUpcoming(),
  getDetails: (id: number) => tmdb.getMovieDetails(id),
  getCredits: (id: number) => tmdb.getMovieCredits(id),
  getSimilar: (id: number) => tmdb.getSimilarMovies(id),
  rate: (id: number, rating: number) => tmdb.rateMovie(id, rating),
  deleteRating: (id: number) => tmdb.deleteMovieRating(id),
};

export const TVService = {
  getTrending: () => tmdb.getTrendingTV(),
  getPopular: (page?: number) => tmdb.getPopularTV(page),
  getTopRated: (page?: number) => tmdb.getTopRatedTV(page),
  getOnTheAir: (page?: number) => tmdb.getOnTheAirTV(page),
  getAiringToday: (page?: number) => tmdb.getAiringTodayTV(page),
  getDetails: (id: number) => tmdb.getTVDetails(id),
  getCredits: (id: number) => tmdb.getTVCredits(id),
  getSimilar: (id: number) => tmdb.getSimilarTV(id),
};

export const PersonService = {
  getDetails: (id: number) => tmdb.getPersonDetails(id),
  getMovieCredits: (id: number) => tmdb.getPersonMovieCredits(id),
};

export const SearchService = {
  multi: (query: string, page?: number) => tmdb.multiSearch(query, page),
  movies: (query: string, page?: number) => tmdb.searchMovies(query, page),
  discover: (params: Parameters<typeof tmdb.discoverMovies>[0]) => tmdb.discoverMovies(params),
  getGenres: () => tmdb.getGenres(),
};

export const AccountService = {
  getDetails: () => tmdb.getAccountDetails(),
  getWatchlist: (accountId: number, page?: number) => tmdb.getWatchlist(accountId, page),
  addToWatchlist: (accountId: number, request: WatchlistRequest) => tmdb.addToWatchlist(accountId, request),
  getFavorites: (accountId: number, page?: number) => tmdb.getFavorites(accountId, page),
  addToFavorites: (accountId: number, request: FavoriteRequest) => tmdb.addToFavorites(accountId, request),
  getLists: (accountId: number, page?: number) => tmdb.getCreatedLists(accountId, page),
};

export const AuthService = {
  getRequestToken: () => tmdb.getRequestToken(),
  getAuthUrl: (token: string, redirectUrl?: string) => tmdb.getAuthUrl(token, redirectUrl),
  createSession: (token: string) => tmdb.createSession(token),
  deleteSession: () => tmdb.deleteSession(),
};
