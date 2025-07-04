import { useState } from 'react';

// Simple movie type
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

// Streaming service URLs and colors
const STREAMING_SERVICES: Record<string, { url: string; color: string }> = {
  'Netflix': { url: 'https://www.netflix.com/search?q=', color: '#E50914' },
  'Prime Video': { url: 'https://www.amazon.com/s?k=', color: '#00A8E1' },
  'Disney+': { url: 'https://www.disneyplus.com/search/', color: '#113CCF' },
  'Max': { url: 'https://www.max.com/search?q=', color: '#002BE7' },
  'Hulu': { url: 'https://www.hulu.com/search/', color: '#1CE783' },
  'Apple TV+': { url: 'https://tv.apple.com/search?term=', color: '#000000' },
  'Paramount+': { url: 'https://www.paramountplus.com/search/', color: '#0064FF' },
  'Peacock': { url: 'https://www.peacocktv.com/search/', color: '#000000' }
};

// Enhanced mock data
const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Oppenheimer',
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    rating: 8.5,
    runtime: '3h',
    streamingSources: ['Prime Video', 'Apple TV+']
  },
  {
    id: '2',
    title: 'Barbie',
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    overview: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.',
    rating: 7.2,
    runtime: '1h 54m',
    streamingSources: ['Max', 'Prime Video']
  },
  {
    id: '3',
    title: 'The Batman',
    year: 2022,
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    overview: 'Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind cryptic clues.',
    rating: 7.9,
    runtime: '2h 56m',
    streamingSources: ['Max', 'Netflix']
  },
  {
    id: '4',
    title: 'Dune',
    year: 2021,
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    rating: 8.0,
    runtime: '2h 35m',
    streamingSources: ['Max', 'Prime Video']
  },
  {
    id: '5',
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.',
    rating: 8.7,
    runtime: '2h 20m',
    streamingSources: ['Netflix', 'Prime Video']
  },
  {
    id: '6',
    title: 'The Matrix',
    year: 1999,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    rating: 8.7,
    runtime: '2h 16m',
    streamingSources: ['Netflix', 'Max', 'Prime Video']
  },
  {
    id: '7',
    title: 'Inception',
    year: 2010,
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    rating: 8.8,
    runtime: '2h 28m',
    streamingSources: ['Netflix', 'Apple TV+']
  },
  {
    id: '8',
    title: 'Interstellar',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    rating: 8.6,
    runtime: '2h 49m',
    streamingSources: ['Paramount+', 'Prime Video']
  },
  {
    id: '9',
    title: 'Titanic',
    year: 1997,
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    overview: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
    rating: 7.9,
    runtime: '3h 14m',
    streamingSources: ['Paramount+', 'Prime Video']
  },
  {
    id: '10',
    title: 'Avatar: The Way of Water',
    year: 2022,
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    overview: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
    rating: 7.6,
    runtime: '3h 12m',
    streamingSources: ['Disney+', 'Max']
  }
];

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES.slice(0, 6));
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Simple search function
  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim() && !selectedService) {
      setMovies(MOCK_MOVIES.slice(0, 6));
      return;
    }
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock data based on query and/or service
    let results = MOCK_MOVIES;
    
    if (searchQuery.trim()) {
      results = results.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedService) {
      results = results.filter(movie => 
        movie.streamingSources.includes(selectedService)
      );
    }
    
    setMovies(results);
    setLoading(false);
  };

  // Filter by streaming service
  const filterByService = (service: string | null) => {
    setSelectedService(service);
    setQuery('');
    
    if (!service) {
      setMovies(MOCK_MOVIES.slice(0, 6));
      return;
    }
    
    const filtered = MOCK_MOVIES.filter(movie => 
      movie.streamingSources.includes(service)
    );
    setMovies(filtered);
  };

  // Get unique streaming services
  const allServices = Array.from(new Set(
    MOCK_MOVIES.flatMap(movie => movie.streamingSources)
  )).sort();

  // Search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMovies(query);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">
              Stream<span className="text-blue-400">Find</span>
            </h1>
            <p className="text-gray-300">Find where to watch your favorite movies</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  searchMovies(e.target.value);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Search movies..."
                className="w-full px-6 py-4 bg-gray-900/80 backdrop-blur text-white rounded-full 
                         border border-gray-700 focus:border-blue-500 focus:outline-none 
                         placeholder-gray-400 text-lg"
              />
              <svg 
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
              {allServices.map((service) => {
                const serviceInfo = STREAMING_SERVICES[service];
                return (
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
                );
              })}
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
            </div>
          )}

          {/* Movie Grid */}
          {!loading && movies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 
                                  flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-semibold">{movie.rating}</span>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1">{movie.title}</h3>
                    <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.runtime}</span>
                    </div>
                    
                    {/* Streaming Services */}
                    <div className="flex flex-wrap gap-2">
                      {movie.streamingSources.map((source) => (
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
                      ))}
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
                    <span>•</span>
                    <span>{selectedMovie.runtime}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-semibold">{selectedMovie.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{selectedMovie.overview}</p>
                  
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