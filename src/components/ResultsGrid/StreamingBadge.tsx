import clsx from 'clsx';
import type { StreamingSource } from '@types/movie';

interface StreamingBadgeProps {
  source: StreamingSource;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const STREAMING_COLORS: Record<string, string> = {
  netflix: '#E50914',
  amazon_prime: '#00A8E1',
  disney_plus: '#113CCF',
  hulu: '#1CE783',
  hbo_max: '#B535F6',
  apple_tv_plus: '#000000',
  paramount_plus: '#0064FF',
  peacock: '#000000',
};

export default function StreamingBadge({ 
  source, 
  size = 'md',
  showName = false 
}: StreamingBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const backgroundColor = STREAMING_COLORS[source.id] || '#6B7280';

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-lg',
        showName && 'bg-white/10 backdrop-blur-sm pr-3'
      )}
      title={source.name}
    >
      <div
        className={clsx(
          'flex items-center justify-center rounded-lg font-bold text-white',
          sizeClasses[size]
        )}
        style={{ backgroundColor }}
      >
        {source.logo ? (
          <img
            src={source.logo}
            alt={source.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <span>{source.name.charAt(0)}</span>
        )}
      </div>
      
      {showName && (
        <div>
          <p className="text-sm font-medium">{source.name}</p>
          {source.type === 'rent' && source.price && (
            <p className="text-xs text-muted-foreground">
              Rent ${source.price}
            </p>
          )}
        </div>
      )}
    </div>
  );
}