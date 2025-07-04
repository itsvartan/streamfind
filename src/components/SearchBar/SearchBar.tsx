import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useSearchStore } from '@stores/searchStore';
import { useDebounce } from '@hooks/useDebounce';
import { moviesAPI } from '@api/movies';
import SearchSuggestions from './SearchSuggestions';
import RecentSearches from './RecentSearches';

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { setQuery, setResults, setLoading, setError, addToHistory } = useSearchStore();
  const debouncedQuery = useDebounce(inputValue, 300);

  const { refetch } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => moviesAPI.searchMovies(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setLoading(true);
      refetch().then((result) => {
        if (result.data) {
          setResults(result.data.movies);
          setError(null);
        }
        if (result.error) {
          setError(result.error instanceof Error ? result.error.message : 'Search failed');
        }
      }).finally(() => setLoading(false));
    }
  }, [debouncedQuery, refetch, setLoading, setResults, setError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue);
      addToHistory(inputValue);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setQuery(suggestion);
    addToHistory(suggestion);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search for movies, shows, actors..."
              className={clsx(
                'w-full px-6 py-4 text-lg rounded-full',
                'bg-background border-2 transition-all duration-200',
                'placeholder:text-muted-foreground',
                isFocused ? 'border-accent' : 'border-muted',
                'focus:outline-none'
              )}
              aria-label="Search movies"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={isFocused}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <button
                type="submit"
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Search"
              >
                <svg
                  className="w-6 h-6 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </form>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            id="search-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-background rounded-lg shadow-xl border border-muted overflow-hidden"
          >
            {inputValue.length > 2 ? (
              <SearchSuggestions
                query={inputValue}
                onSelect={handleSelectSuggestion}
              />
            ) : (
              <RecentSearches onSelect={handleSelectSuggestion} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}