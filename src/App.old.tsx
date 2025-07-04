import { useState } from 'react';

// Simple movie type
interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  overview: string;
  streamingSources: string[];
}

// Streaming service URLs
const STREAMING_URLS: Record<string, string> = {
  'Netflix': 'https://www.netflix.com/search?q=',
  'Prime Video': 'https://www.amazon.com/s?k=',
  'Disney+': 'https://www.disneyplus.com/search/',
  'Max': 'https://www.max.com/search?q=',
  'Hulu': 'https://www.hulu.com/search/',
  'Apple TV+': 'https://tv.apple.com/search?term=',
  'Paramount+': 'https://www.paramountplus.com/search/',
  'Peacock': 'https://www.peacocktv.com/search/'
};

// Mock data for demonstration
const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'The Matrix',
    year: 1999,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    overview: 'A computer hacker learns about the true nature of reality.',
    streamingSources: ['Netflix', 'Max', 'Prime Video']
  },
  {
    id: '2',
    title: 'Inception',
    year: 2010,
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    streamingSources: ['Netflix', 'Apple TV+']
  },
  {
    id: '3',
    title: 'Interstellar',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview: 'A team of explorers travel through a wormhole in space.',
    streamingSources: ['Paramount+', 'Prime Video']
  },
  {
    id: '4',
    title: 'The Dark Knight',
    year: 2008,
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview: 'Batman faces the Joker in a battle for Gotham City.',
    streamingSources: ['Max', 'Prime Video']
  },
  {
    id: '5',
    title: 'Titanic',
    year: 1997,
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    overview: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
    streamingSources: ['Paramount+', 'Prime Video']
  },
  {
    id: '6',
    title: 'Avatar',
    year: 2009,
    poster: 'https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg',
    overview: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission.',
    streamingSources: ['Disney+', 'Max']
  },
  {
    id: '7',
    title: 'The Avengers',
    year: 2012,
    poster: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    overview: "Earth's mightiest heroes must come together to stop Loki and his alien army.",
    streamingSources: ['Disney+']
  },
  {
    id: '8',
    title: 'Pulp Fiction',
    year: 1994,
    poster: 'https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg',
    overview: 'The lives of two mob hitmen, a boxer, and a pair of bandits intertwine.',
    streamingSources: ['Netflix', 'Prime Video']
  },
  {
    id: '9',
    title: 'The Shawshank Redemption',
    year: 1994,
    poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    overview: 'Two imprisoned men bond over years, finding redemption through acts of common decency.',
    streamingSources: ['Max', 'Apple TV+']
  },
  {
    id: '10',
    title: 'Forrest Gump',
    year: 1994,
    poster: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
    overview: 'The story of a man with low IQ who achieves great things in his life.',
    streamingSources: ['Paramount+', 'Prime Video']
  }
];

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Simple search function
  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock data based on query
    const results = MOCK_MOVIES.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setMovies(results);
    setLoading(false);
  };

  // Search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMovies(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Stream<span className="text-blue-600">Find</span>
        </h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for movies..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => searchMovies(query)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}

        {!loading && hasSearched && movies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No movies found. Try searching for "Matrix" or "Inception"</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{movie.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{movie.year}</p>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{movie.overview}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-600">Available on:</p>
                    <div className="flex flex-wrap gap-1">
                      {movie.streamingSources.map((source) => (
                        <a
                          key={source}
                          href={`${STREAMING_URLS[source] || '#'}${encodeURIComponent(movie.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          {source}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Search for your favorite movies to see where they're streaming!</p>
            <p className="text-sm">Try searching for: Titanic, Avatar, Matrix, Inception, Avengers, or Forrest Gump</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;