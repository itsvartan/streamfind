import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '@components/SearchBar/SearchBar';
import ResultsGrid from '@components/ResultsGrid/ResultsGrid';
import { moviesAPI } from '@api/movies';
import { useSearchStore } from '@stores/searchStore';

function App() {
  const { query, setResults, setLoading, setError } = useSearchStore();

  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: () => moviesAPI.getTrending(),
    enabled: !query,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  useEffect(() => {
    if (!query && trendingData) {
      setResults(trendingData.movies);
      setLoading(false);
      setError(null);
    }
  }, [query, trendingData, setResults, setLoading, setError]);

  return (
    <>
      <Helmet>
        <title>StreamFind - Find Movies Across All Streaming Services</title>
        <meta
          name="description"
          content="Search for movies and shows across Netflix, Prime Video, Disney+, and more. Find out where to watch your favorite content instantly."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://api.watchmode.com" />
        <link rel="preconnect" href="https://image.tmdb.org" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-muted">
          <div className="container py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                Stream<span className="text-accent">Find</span>
              </h1>
              <nav className="flex items-center gap-4">
                <button className="btn-ghost btn-sm">
                  Trending
                </button>
                <button className="btn-ghost btn-sm">
                  Browse
                </button>
              </nav>
            </div>
            <SearchBar />
          </div>
        </header>

        <main>
          <div className="container py-6">
            <h2 className="text-xl font-semibold mb-4">
              {query ? `Results for "${query}"` : 'Trending Now'}
            </h2>
          </div>
          <ResultsGrid />
        </main>

        <footer className="mt-16 py-8 border-t border-muted">
          <div className="container text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} StreamFind. Movie data provided by{' '}
              <a
                href="https://www.watchmode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Watchmode
              </a>
              {' and '}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                TMDB
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App
