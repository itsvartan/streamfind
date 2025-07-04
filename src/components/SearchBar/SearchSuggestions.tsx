import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import clsx from 'clsx';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
}

const POPULAR_SEARCHES = [
  'Marvel movies',
  'Netflix originals',
  'Tom Hanks movies',
  'Sci-fi from the 90s',
  'Oscar winners',
  'Action movies',
  'Comedy shows',
  'Documentaries',
];

const GENRE_KEYWORDS = [
  'action', 'adventure', 'animation', 'comedy', 'crime', 'documentary',
  'drama', 'family', 'fantasy', 'horror', 'mystery', 'romance',
  'sci-fi', 'science fiction', 'thriller', 'war', 'western',
];

const DECADE_KEYWORDS = [
  '80s', '90s', '2000s', '2010s', '2020s',
  '1980s', '1990s', 'eighties', 'nineties',
];

export default function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const generateSuggestions = () => {
      const allSuggestions = [...POPULAR_SEARCHES];
      
      const fuse = new Fuse(allSuggestions, {
        threshold: 0.3,
        includeScore: true,
      });

      const fuzzyResults = fuse.search(query).map(result => result.item);
      
      const naturalLanguageSuggestions: string[] = [];
      const lowerQuery = query.toLowerCase();

      if (GENRE_KEYWORDS.some(genre => lowerQuery.includes(genre))) {
        naturalLanguageSuggestions.push(`Best ${query} movies`);
        naturalLanguageSuggestions.push(`Top rated ${query}`);
      }

      if (DECADE_KEYWORDS.some(decade => lowerQuery.includes(decade))) {
        naturalLanguageSuggestions.push(`Movies from the ${query}`);
        naturalLanguageSuggestions.push(`Best of ${query}`);
      }

      if (lowerQuery.includes('like')) {
        const movieName = query.replace(/like\s*/i, '').trim();
        naturalLanguageSuggestions.push(`Movies similar to ${movieName}`);
        naturalLanguageSuggestions.push(`If you liked ${movieName}`);
      }

      const combinedSuggestions = [
        ...new Set([
          ...naturalLanguageSuggestions,
          ...fuzzyResults,
          ...allSuggestions.filter(s => 
            s.toLowerCase().includes(lowerQuery)
          ),
        ]),
      ].slice(0, 6);

      setSuggestions(combinedSuggestions);
    };

    generateSuggestions();
  }, [query]);

  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No suggestions found
      </div>
    );
  }

  return (
    <div className="py-2">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(suggestion)}
          className={clsx(
            'w-full px-4 py-3 text-left',
            'hover:bg-muted/50 transition-colors',
            'flex items-center gap-3'
          )}
        >
          <svg
            className="w-4 h-4 text-muted-foreground"
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
          <span className="text-foreground">{suggestion}</span>
        </motion.button>
      ))}
    </div>
  );
}