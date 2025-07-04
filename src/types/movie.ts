export interface StreamingSource {
  id: string;
  name: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  price?: number;
  quality: 'SD' | 'HD' | '4K';
  link: string;
  logo?: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  overview: string;
  poster: string;
  backdrop?: string;
  rating: number;
  runtime: number;
  genres: string[];
  cast?: Actor[];
  director?: string;
  trailer?: string;
  streamingSources: StreamingSource[];
  imdbId?: string;
  tmdbId?: string;
}

export interface Actor {
  id: string;
  name: string;
  character: string;
  image?: string;
}

export interface SearchFilters {
  genre?: string;
  year?: number;
  minRating?: number;
  streamingService?: string;
  sortBy?: 'relevance' | 'rating' | 'year' | 'title';
}

export interface SearchResult {
  movies: Movie[];
  totalResults: number;
  page: number;
  totalPages: number;
}