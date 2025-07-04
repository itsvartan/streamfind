import { apiClient } from './client';
import { API_CONFIG, STREAMING_SERVICES } from './config';
import type { Movie, SearchResult, SearchFilters, StreamingSource } from '@/types/movie';

interface WatchmodeTitle {
  id: number;
  title: string;
  year: number;
  imdb_id: string;
  tmdb_id: number;
  tmdb_type: string;
  genre_names: string[];
  user_rating: number;
  runtime_minutes: number;
  sources?: WatchmodeSource[];
}

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  ios_url: string;
  android_url: string;
  web_url: string;
  format: string;
  price: number;
  seasons: number;
  episodes: number;
}

interface WatchmodeSearchResponse {
  title_results: WatchmodeTitle[];
  total_results: number;
  total_pages: number;
  page: number;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
}

export class MoviesAPI {
  private async getMovieDetailsFromTMDB(tmdbId: number): Promise<Partial<Movie>> {
    if (!API_CONFIG.TMDB_API_KEY) {
      return {};
    }

    try {
      const movie = await apiClient.request<TMDBMovie>(
        `${API_CONFIG.TMDB_BASE_URL}/movie/${tmdbId}`,
        {
          params: {
            api_key: API_CONFIG.TMDB_API_KEY,
            append_to_response: 'credits,videos',
          },
        }
      );

      return {
        overview: movie.overview,
        poster: movie.poster_path ? `${API_CONFIG.TMDB_IMAGE_BASE}/w500${movie.poster_path}` : '',
        backdrop: movie.backdrop_path ? `${API_CONFIG.TMDB_IMAGE_BASE}/w1280${movie.backdrop_path}` : '',
      };
    } catch {
      return {};
    }
  }

  private mapWatchmodeToMovie(watchmodeTitle: WatchmodeTitle, tmdbDetails?: Partial<Movie>): Movie {
    const streamingSources: StreamingSource[] = (watchmodeTitle.sources || [])
      .filter(source => source.type === 'sub' || source.type === 'free')
      .map(source => ({
        id: String(source.source_id),
        name: source.name,
        type: source.type === 'sub' ? 'subscription' : 'free' as const,
        quality: 'HD' as const,
        link: source.web_url,
        logo: (STREAMING_SERVICES as any)[source.name.toLowerCase().replace(/\s+/g, '_')]?.logo,
      }));

    return {
      id: String(watchmodeTitle.id),
      title: watchmodeTitle.title,
      year: watchmodeTitle.year,
      overview: tmdbDetails?.overview || 'No description available.',
      poster: tmdbDetails?.poster || '/placeholder-poster.jpg',
      backdrop: tmdbDetails?.backdrop,
      rating: watchmodeTitle.user_rating || 0,
      runtime: watchmodeTitle.runtime_minutes || 0,
      genres: watchmodeTitle.genre_names || [],
      streamingSources,
      imdbId: watchmodeTitle.imdb_id,
      tmdbId: String(watchmodeTitle.tmdb_id),
    };
  }

  async searchMovies(query: string, filters?: SearchFilters, page = 1): Promise<SearchResult> {
    const params: Record<string, any> = {
      search_field: 'name',
      search_value: query,
      page,
      limit: 20,
    };

    if (filters?.genre) {
      params.genres = filters.genre;
    }

    if (filters?.year) {
      params.year = filters.year;
    }

    if (filters?.minRating) {
      params.min_rating = filters.minRating;
    }

    const response = await apiClient.request<WatchmodeSearchResponse>('/search/', { params });

    const moviesWithDetails = await Promise.all(
      response.title_results.map(async (title) => {
        const tmdbDetails = title.tmdb_id ? await this.getMovieDetailsFromTMDB(title.tmdb_id) : {};
        return this.mapWatchmodeToMovie(title, tmdbDetails);
      })
    );

    return {
      movies: moviesWithDetails,
      totalResults: response.total_results,
      page: response.page,
      totalPages: response.total_pages,
    };
  }

  async getMovieDetails(movieId: string): Promise<Movie> {
    const [watchmodeDetails, sources] = await Promise.all([
      apiClient.request<WatchmodeTitle>(`/title/${movieId}/details/`),
      apiClient.request<WatchmodeSource[]>(`/title/${movieId}/sources/`),
    ]);

    const watchmodeWithSources = { ...watchmodeDetails, sources };
    const tmdbDetails = watchmodeDetails.tmdb_id 
      ? await this.getMovieDetailsFromTMDB(watchmodeDetails.tmdb_id)
      : {};

    return this.mapWatchmodeToMovie(watchmodeWithSources, tmdbDetails);
  }

  async getTrending(page = 1): Promise<SearchResult> {
    const response = await apiClient.request<WatchmodeTitle[]>('/list-titles/', {
      params: {
        types: 'movie',
        sort_by: 'popularity_desc',
        page,
        limit: 20,
      },
    });

    const moviesWithDetails = await Promise.all(
      response.map(async (title) => {
        const tmdbDetails = title.tmdb_id ? await this.getMovieDetailsFromTMDB(title.tmdb_id) : {};
        return this.mapWatchmodeToMovie(title, tmdbDetails);
      })
    );

    return {
      movies: moviesWithDetails,
      totalResults: moviesWithDetails.length,
      page,
      totalPages: 1,
    };
  }
}

export const moviesAPI = new MoviesAPI();