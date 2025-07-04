import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Movie } from '@types/movie';
import LazyImage from '@components/shared/LazyImage';
import StreamingBadge from './StreamingBadge';

interface MovieCardProps {
  movie: Movie;
  index: number;
  onClick: () => void;
}

export default function MovieCard({ movie, index, onClick }: MovieCardProps) {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.3, 
      ease: 'easeOut',
      delay: index * 0.05 
    },
  };

  return (
    <motion.article
      {...fadeInUp}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card-hover cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${movie.title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        <LazyImage
          src={movie.poster}
          alt={`${movie.title} poster`}
          className="w-full h-full"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 right-2 flex gap-1">
          {movie.streamingSources.slice(0, 3).map((source) => (
            <StreamingBadge key={source.id} source={source} size="sm" />
          ))}
        </div>

        {movie.rating > 0 && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
            <span className="text-sm font-medium text-white">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-accent transition-colors">
          {movie.title}
        </h3>
        
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{movie.year}</span>
          {movie.runtime > 0 && (
            <>
              <span>•</span>
              <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </>
          )}
        </div>

        {movie.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-1 bg-muted rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {movie.overview}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {movie.streamingSources.length} streaming options
          </span>
          <motion.span
            className="text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
          >
            View Details →
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}