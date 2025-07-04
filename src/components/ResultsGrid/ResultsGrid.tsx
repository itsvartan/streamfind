import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '@stores/searchStore';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import MovieDetail from '@components/MovieDetail/DetailModal';
import type { Movie } from '@types/movie';

export default function ResultsGrid() {
  const { results, isLoading, error } = useSearchStore();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container py-12 text-center"
      >
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-error mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container py-12 text-center"
      >
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-muted-foreground mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M5 12h14M5 16h14"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or browse trending movies
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <section className="container py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))
            : results.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  index={index}
                  onClick={() => setSelectedMovie(movie)}
                />
              ))}
        </motion.div>
      </section>

      <AnimatePresence>
        {selectedMovie && (
          <MovieDetail
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}