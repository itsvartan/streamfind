import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useSearchStore } from '@stores/searchStore';

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { history, clearHistory } = useSearchStore();

  if (history.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-2">No recent searches</p>
        <p className="text-sm text-muted-foreground">
          Start typing to search for movies
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
        <button
          onClick={clearHistory}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      
      {history.slice(0, 5).map((item, index) => (
        <motion.button
          key={`${item.query}-${item.timestamp}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(item.query)}
          className={clsx(
            'w-full px-4 py-3 text-left',
            'hover:bg-muted/50 transition-colors',
            'flex items-center gap-3 group'
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-foreground flex-1">{item.query}</span>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </motion.button>
      ))}
    </div>
  );
}