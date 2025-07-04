import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Stream<span className="text-blue-600">Find</span>
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {query && (
            <p className="mt-4 text-gray-600">
              Searching for: <strong>{query}</strong>
            </p>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>StreamFind - Find where to watch your favorite movies</p>
          <p className="mt-2">
            Add your API keys in Vercel Environment Variables:
            <br />
            VITE_WATCHMODE_API_KEY and VITE_TMDB_API_KEY
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;