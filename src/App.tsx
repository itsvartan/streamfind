import { useState, useEffect, useRef } from 'react';

// Movie type
interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  overview: string;
  rating: number;
  runtime: string;
  streamingSources: string[];
}

// Streaming service mapping
const STREAMING_SERVICES: Record<string, { url: string; color: string; bgColor: string; watchmodeId?: number }> = {
  'Netflix': { url: 'https://www.netflix.com/search?q=', color: '#FFFFFF', bgColor: '#E50914', watchmodeId: 203 },
  'Prime Video': { url: 'https://www.amazon.com/s?k=', color: '#FFFFFF', bgColor: '#00A8E1', watchmodeId: 157 },
  'Disney+': { url: 'https://www.disneyplus.com/search/', color: '#FFFFFF', bgColor: '#113CCF', watchmodeId: 372 },
  'Max': { url: 'https://www.max.com/search?q=', color: '#FFFFFF', bgColor: '#002BE7', watchmodeId: 387 },
  'Hulu': { url: 'https://www.hulu.com/search/', color: '#000000', bgColor: '#1CE783', watchmodeId: 26 },
  'Apple TV+': { url: 'https://tv.apple.com/search?term=', color: '#FFFFFF', bgColor: '#000000', watchmodeId: 371 },
  'Paramount+': { url: 'https://www.paramountplus.com/search/', color: '#FFFFFF', bgColor: '#0064FF', watchmodeId: 389 },
  'Peacock': { url: 'https://www.peacocktv.com/search/', color: '#FFFFFF', bgColor: '#000000', watchmodeId: 386 }
};

// API configuration
const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Check if API key exists
  useEffect(() => {
    setHasApiKey(!!WATCHMODE_API_KEY);
    if (WATCHMODE_API_KEY) {
      loadTrendingMovies();
    }
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasApiKey) return;
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && !loadingMore && hasMore && movies.length > 0) {
        if (selectedService) {
          // Don't paginate when filtering by service for now
          return;
        }
        loadTrendingMovies(true);
      }
    };
    
    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, movies.length, selectedService, hasApiKey]);

  // Load trending movies
  const loadTrendingMovies = async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }
    
    try {
      const currentPage = loadMore ? page : 1;
      const offset = (currentPage - 1) * 20;
      
      console.log(`Loading movies - Page: ${currentPage}, Offset: ${offset}`);
      const response = await fetch(
        `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&types=movie&sort_by=popularity_desc&limit=20&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movies response:', data);
      
      // Check if data has titles array or is the array itself
      const newMovies = data.titles || data || [];
      
      if (newMovies.length < 20) {
        setHasMore(false);
      }
      
      // Process movies in batches to avoid rate limiting
      const formattedMovies: Movie[] = [];
      const batchSize = 5;
      
      for (let i = 0; i < newMovies.length; i += batchSize) {
        const batch = newMovies.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (movie: any) => {
            const tmdbData = await fetchTMDBData(movie.tmdb_id);
            // Fetch sources for each movie
            return await formatMovie(movie, tmdbData, true);
          })
        );
        formattedMovies.push(...batchResults);
      }
      
      if (loadMore) {
        setMovies(prev => [...prev, ...formattedMovies]);
        setPage(prev => prev + 1);
      } else {
        setMovies(formattedMovies);
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      if (!loadMore) {
        setMovies([]);
      }
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  // Fetch additional data from TMDB
  const fetchTMDBData = async (tmdbId: number) => {
    if (!TMDB_API_KEY || !tmdbId) return null;
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
      );
      return await response.json();
    } catch {
      return null;
    }
  };

  // Fetch sources for a single movie
  const fetchMovieSources = async (titleId: string) => {
    try {
      const response = await fetch(
        `${WATCHMODE_BASE_URL}/title/${titleId}/sources/?apiKey=${WATCHMODE_API_KEY}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Error fetching sources for title ${titleId}:`, error);
      return [];
    }
  };

  // Format movie data
  const formatMovie = async (watchmodeData: any, tmdbData: any, fetchSources = true): Promise<Movie> => {
    // Fetch sources if not provided and fetchSources is true
    let sources = watchmodeData.sources || [];
    
    if (fetchSources && (!sources || sources.length === 0) && watchmodeData.id) {
      sources = await fetchMovieSources(watchmodeData.id);
    }
    
    return {
      id: String(watchmodeData.id),
      title: watchmodeData.title,
      year: watchmodeData.year || new Date().getFullYear(),
      poster: tmdbData?.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
        : watchmodeData.poster_url || 'https://via.placeholder.com/500x750?text=No+Poster',
      overview: tmdbData?.overview || watchmodeData.plot_overview || 'No description available.',
      rating: tmdbData?.vote_average || watchmodeData.user_rating || 0,
      runtime: tmdbData?.runtime ? `${Math.floor(tmdbData.runtime / 60)}h ${tmdbData.runtime % 60}m` : 'N/A',
      streamingSources: getStreamingSources(sources)
    };
  };

  // Extract streaming sources
  const getStreamingSources = (sources: any[]): string[] => {
    const serviceMap: Record<number, string> = {
      203: 'Netflix',
      157: 'Prime Video',
      372: 'Disney+',
      387: 'Max',
      371: 'Apple TV+',
      389: 'Paramount+',
      386: 'Peacock',
      26: 'Hulu' // Adding Hulu's actual ID
    };

    const uniqueSources = new Set<string>();
    
    if (Array.isArray(sources)) {
      sources.forEach(source => {
        // Log to debug what we're receiving
        if (source.source_id && !serviceMap[source.source_id]) {
          console.log('Unknown source ID:', source.source_id, source);
        }
        
        if (serviceMap[source.source_id]) {
          uniqueSources.add(serviceMap[source.source_id]);
        }
      });
    }

    return Array.from(uniqueSources);
  };

  // Search movies
  const searchMovies = async (searchQuery: string) => {
    if (!WATCHMODE_API_KEY) return;
    
    setLoading(true);
    setPage(1);
    setHasMore(false); // No pagination for search results
    try {
      console.log(`Searching for: ${searchQuery}`);
      const response = await fetch(
        `${WATCHMODE_BASE_URL}/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(searchQuery)}&types=movie&limit=20`
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search response:', data);
      
      const formattedMovies = await Promise.all(
        (data.title_results || []).map(async (movie: any) => {
          const tmdbData = await fetchTMDBData(movie.tmdb_id);
          return await formatMovie(movie, tmdbData, true);
        })
      );
      
      setMovies(formattedMovies);
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
    }
    setLoading(false);
  };

  // Filter by streaming service
  const filterByService = async (service: string | null) => {
    setSelectedService(service);
    setQuery('');
    setPage(1);
    setHasMore(true);
    
    if (!service || !WATCHMODE_API_KEY) {
      loadTrendingMovies();
      return;
    }
    
    setLoading(true);
    try {
      const serviceId = STREAMING_SERVICES[service]?.watchmodeId;
      if (!serviceId) {
        console.error(`No watchmode ID found for service: ${service}`);
        setLoading(false);
        return;
      }

      console.log(`Fetching movies for ${service} (ID: ${serviceId})`);
      const response = await fetch(
        `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&types=movie&source_ids=${serviceId}&sort_by=popularity_desc&limit=20`
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API returned ${data.titles?.length || 0} movies for ${service}`, data);
      
      // Check if data has titles array or is the array itself
      const movies = data.titles || data || [];
      
      const formattedMovies = await Promise.all(
        movies.map(async (movie: any) => {
          const tmdbData = await fetchTMDBData(movie.tmdb_id);
          // Fetch sources even when filtering to get all available services
          const movieData = await formatMovie(movie, tmdbData, true);
          return movieData;
        })
      );
      
      setMovies(formattedMovies);
    } catch (error) {
      console.error('Error filtering by service:', error);
      setMovies([]);
    }
    setLoading(false);
  };

  // Get unique streaming services
  const allServices = Object.keys(STREAMING_SERVICES);

  // Search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      searchMovies(query);
    }
  };

  // No API key message
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="min-h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-8 bg-gray-900/80 rounded-2xl max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">API Key Required</h1>
            <p className="text-gray-300 mb-4">
              To see real movie data from all streaming services, please add your API keys in Vercel:
            </p>
            <div className="text-left bg-black/50 p-4 rounded-lg text-sm text-gray-400">
              <p>VITE_WATCHMODE_API_KEY=your_key</p>
              <p>VITE_TMDB_API_KEY=your_key (optional)</p>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              Get your free API key at{' '}
              <a href="https://api.watchmode.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                api.watchmode.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">
              Stream<span className="text-blue-400">Find</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">Real-time streaming availability</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search movies..."
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-900/80 backdrop-blur text-white rounded-full 
                         border border-gray-700 focus:border-blue-500 focus:outline-none 
                         placeholder-gray-400 text-base sm:text-lg pr-20 sm:pr-24"
              />
              <button
                onClick={() => query.trim() && searchMovies(query)}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Search
              </button>
            </div>
          </div>

          {/* Streaming Service Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => filterByService(null)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  !selectedService 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                }`}
              >
                All
              </button>
              {allServices.map((service) => (
                <button
                  key={service}
                  onClick={() => filterByService(service)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                    selectedService === service
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                  }`}
                >
                  {service.split(' ')[0]}
                </button>
              ))}
            </div>
            {selectedService && (
              <p className="text-center text-gray-400 text-sm mt-3">
                Showing movies on {selectedService}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="mt-4 text-gray-300">Loading real movie data...</p>
            </div>
          )}

          {/* Movie Grid */}
          {!loading && movies.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {movies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="group relative bg-gray-900/60 backdrop-blur rounded-lg overflow-hidden 
                           hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedMovie(movie)}
                >
                  {/* Movie Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Movie Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                      <span>{movie.year}</span>
                      {movie.rating > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{movie.rating.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Streaming Services - Compact with Colors */}
                    <div className="flex flex-wrap gap-1">
                      {movie.streamingSources.length > 0 ? (
                        <>
                          {movie.streamingSources.slice(0, 2).map((source) => {
                            const service = STREAMING_SERVICES[source];
                            return (
                              <span
                                key={source}
                                className="px-2 py-0.5 text-xs rounded font-medium"
                                style={{
                                  backgroundColor: service?.bgColor || '#1f2937',
                                  color: service?.color || '#ffffff'
                                }}
                              >
                                {source.split(' ')[0]}
                              </span>
                            );
                          })}
                          {movie.streamingSources.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 
                                           text-xs rounded font-medium">
                              +{movie.streamingSources.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">Loading...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Trigger */}
          {!loading && movies.length > 0 && !selectedService && (
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="text-gray-300">Loading more movies...</span>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && movies.length === 0 && (query || selectedService) && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {query && `No movies found for "${query}"`}
                {query && selectedService && ' on '}
                {selectedService && !query && `No movies found on ${selectedService}`}
                {selectedService && query && selectedService}
              </p>
            </div>
          )}

          {/* Movie Detail Modal */}
          {selectedMovie && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMovie(null)}
            >
              <div 
                className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-full h-64 sm:h-96 object-cover rounded-t-2xl"
                  />
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2 
                             hover:bg-black/80 transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                  <div className="flex items-center gap-4 text-gray-400 mb-4">
                    <span>{selectedMovie.year}</span>
                    {selectedMovie.runtime !== 'N/A' && (
                      <>
                        <span>•</span>
                        <span>{selectedMovie.runtime}</span>
                      </>
                    )}
                    {selectedMovie.rating > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-white font-semibold">{selectedMovie.rating.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-6">{selectedMovie.overview}</p>
                  
                  {selectedMovie.streamingSources.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Watch Now</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedMovie.streamingSources.map((source) => (
                          <a
                            key={source}
                            href={`${STREAMING_SERVICES[source]?.url || '#'}${encodeURIComponent(selectedMovie.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                     transition-colors font-medium"
                          >
                            Watch on {source}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;