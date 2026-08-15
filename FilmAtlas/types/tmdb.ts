// Type definitions for TMDB API responses

export interface Movie {
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
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  imdb_id: string;
}

export interface Genre {
  id: number;
  name: string;
}

/**
 * TMDB names TV fields differently from movies: `name`/`first_air_date` rather
 * than `title`/`release_date`. `lib/movie-shape.ts` normalises both for the UI.
 */
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface TVDetails extends TVShow {
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string;
  tagline: string;
  last_air_date: string | null;
  in_production: boolean;
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  seasons: Season[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  overview: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id: number;
  credit_id: string;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonMovieCredits {
  cast: (Movie & { character: string })[];
  crew: (Movie & { job: string })[];
}

export interface AccountDetails {
  id: number;
  username: string;
  name: string;
  include_adult: boolean;
  iso_639_1: string;
  iso_3166_1: string;
  avatar: {
    gravatar: {
      hash: string;
    };
    tmdb: {
      avatar_path: string | null;
    };
  };
}

export interface AuthToken {
  success: boolean;
  expires_at: string;
  request_token: string;
}

export interface Session {
  success: boolean;
  session_id: string;
}

export interface ListItem {
  id: number;
  name: string;
  description: string;
  item_count: number;
  iso_639_1: string;
  list_type: string;
  poster_path: string | null;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface SearchResult {
  media_type: 'movie' | 'tv' | 'person';
  id: number;
  name?: string;
  title?: string;
  profile_path?: string | null;
  poster_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
}

export interface WatchlistRequest {
  media_type: 'movie' | 'tv';
  media_id: number;
  watchlist: boolean;
}

export interface FavoriteRequest {
  media_type: 'movie' | 'tv';
  media_id: number;
  favorite: boolean;
}

export interface RatingRequest {
  value: number;
}

export interface ApiResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}
