import { useState, useEffect } from 'react';

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
const STREAMING_SERVICES: Record<string, { url: string; color: string; watchmodeId?: number }> = {
  'Netflix': { url: 'https://www.netflix.com/search?q=', color: '#E50914', watchmodeId: 203 },
  'Prime Video': { url: 'https://www.amazon.com/s?k=', color: '#00A8E1', watchmodeId: 157 },
  'Disney+': { url: 'https://www.disneyplus.com/search/', color: '#113CCF', watchmodeId: 372 },
  'Max': { url: 'https://www.max.com/search?q=', color: '#002BE7', watchmodeId: 387 },
  'Hulu': { url: 'https://www.hulu.com/search/', color: '#1CE783', watchmodeId: 157 },
  'Apple TV+': { url: 'https://tv.apple.com/search?term=', color: '#000000', watchmodeId: 371 },
  'Paramount+': { url: 'https://www.paramountplus.com/search/', color: '#0064FF', watchmodeId: 389 },
  'Peacock': { url: 'https://www.peacocktv.com/search/', color: '#000000', watchmodeId: 386 }
};

// API configuration
const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check if API key exists
  useEffect(() => {
    setHasApiKey(!!WATCHMODE_API_KEY);
    if (WATCHMODE_API_KEY) {
      loadTrendingMovies();
    }
  }, []);

  // Load trending movies on start
  const loadTrendingMovies = async () => {
    setLoading(true);
    try {
      console.log('Loading trending movies...');
      const response = await fetch(
        `${WATCHMODE_BASE_URL}/list-titles/?apiKey=${WATCHMODE_API_KEY}&types=movie&sort_by=popularity_desc&limit=12`
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Trending movies response:', data);
      
      // Check if data has titles array or is the array itself
      const movies = data.titles || data || [];
      
      const formattedMovies = await Promise.all(
        movies.map(async (movie: any) => {
          const tmdbData = await fetchTMDBData(movie.tmdb_id);
          return formatMovie(movie, tmdbData);
        })
      );
      
      setMovies(formattedMovies);
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
    }
    setLoading(false);
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

  // Format movie data
  const formatMovie = (watchmodeData: any, tmdbData: any): Movie => {
    return {
      id: String(watchmodeData.id),
      title: watchmodeData.title,
      year: watchmodeData.year || new Date().getFullYear(),
      poster: tmdbData?.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster',
      overview: tmdbData?.overview || watchmodeData.plot_overview || 'No description available.',
      rating: tmdbData?.vote_average || watchmodeData.user_rating || 0,
      runtime: tmdbData?.runtime ? `${Math.floor(tmdbData.runtime / 60)}h ${tmdbData.runtime % 60}m` : 'N/A',
      streamingSources: getStreamingSources(watchmodeData.sources || [])
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
      386: 'Peacock'
    };

    const uniqueSources = new Set<string>();
    sources.forEach(source => {
      if (serviceMap[source.source_id]) {
        uniqueSources.add(serviceMap[source.source_id]);
      }
    });

    return Array.from(uniqueSources);
  };

  // Search movies
  const searchMovies = async (searchQuery: string) => {
    if (!WATCHMODE_API_KEY) return;
    
    setLoading(true);
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
          return formatMovie(movie, tmdbData);
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
          return formatMovie(movie, tmdbData);
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">
              Stream<span className="text-blue-400">Find</span>
            </h1>
            <p className="text-gray-300">Real-time streaming availability from all platforms</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search from thousands of movies..."
                className="w-full px-6 py-4 bg-gray-900/80 backdrop-blur text-white rounded-full 
                         border border-gray-700 focus:border-blue-500 focus:outline-none 
                         placeholder-gray-400 text-lg"
              />
              <button
                onClick={() => query.trim() && searchMovies(query)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Streaming Service Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => filterByService(null)}
                className={`px-4 py-2 rounded-full transition-all ${
                  !selectedService 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                }`}
              >
                All Movies
              </button>
              {allServices.map((service) => (
                <button
                  key={service}
                  onClick={() => filterByService(service)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedService === service
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
            {selectedService && (
              <p className="text-center text-gray-400 mt-4">
                Showing movies available on {selectedService}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="group relative bg-gray-900/60 backdrop-blur rounded-xl overflow-hidden 
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Rating Badge */}
                    {movie.rating > 0 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 
                                    flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-semibold">{movie.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Movie Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
                      <span>{movie.year}</span>
                      {movie.runtime !== 'N/A' && (
                        <>
                          <span>•</span>
                          <span>{movie.runtime}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Streaming Services */}
                    <div className="flex flex-wrap gap-2">
                      {movie.streamingSources.length > 0 ? (
                        movie.streamingSources.map((source) => (
                          <a
                            key={source}
                            href={`${STREAMING_SERVICES[source]?.url || '#'}${encodeURIComponent(movie.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 
                                     text-xs rounded-full hover:bg-blue-600/30 transition-colors"
                          >
                            {source}
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No streaming info</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-full h-96 object-cover rounded-t-2xl"
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