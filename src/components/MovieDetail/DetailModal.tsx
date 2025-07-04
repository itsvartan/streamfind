import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import type { Movie } from '../../types/movie';
import LazyImage from '@components/shared/LazyImage';
import StreamingBadge from '@components/ResultsGrid/StreamingBadge';

interface MovieDetailProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieDetail({ movie, onClose }: MovieDetailProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          aria-label="Close dialog"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {movie.backdrop && (
          <div className="relative h-64 md:h-96">
            <LazyImage
              src={movie.backdrop}
              alt={`${movie.title} backdrop`}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {!movie.backdrop && (
              <div className="flex-shrink-0">
                <LazyImage
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  className="w-48 h-72 rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="flex-1">
              <h2 id="movie-title" className="text-3xl font-bold mb-2">
                {movie.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
                <span>{movie.year}</span>
                {movie.runtime > 0 && (
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                )}
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                    <span className="font-medium">{movie.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-lg mb-6 leading-relaxed">{movie.overview}</p>

              {movie.director && (
                <p className="mb-2">
                  <span className="font-medium">Director:</span> {movie.director}
                </p>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.slice(0, 5).map((actor) => (
                      <span key={actor.id} className="text-sm text-muted-foreground">
                        {actor.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Where to Watch</h3>
            
            {movie.streamingSources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {movie.streamingSources.map((source) => (
                  <a
                    key={source.id}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      'flex items-center gap-3 p-4 rounded-lg',
                      'bg-muted hover:bg-muted/80 transition-colors'
                    )}
                  >
                    <StreamingBadge source={source} size="md" />
                    <div className="flex-1">
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.type === 'subscription' && 'Subscription'}
                        {source.type === 'rent' && `Rent from $${source.price}`}
                        {source.type === 'buy' && `Buy from $${source.price}`}
                        {source.type === 'free' && 'Free with ads'}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No streaming sources available for your region.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}