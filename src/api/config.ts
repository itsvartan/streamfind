export const API_CONFIG = {
  WATCHMODE_API_KEY: import.meta.env.VITE_WATCHMODE_API_KEY || '',
  WATCHMODE_BASE_URL: 'https://api.watchmode.com/v1',
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY || '',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
  CACHE_DURATION: {
    SEARCH: 5 * 60 * 1000, // 5 minutes
    DETAILS: 60 * 60 * 1000, // 1 hour
    TRENDING: 24 * 60 * 60 * 1000, // 24 hours
  },
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
  },
};

export const STREAMING_SERVICES = {
  netflix: { name: 'Netflix', logo: '/logos/netflix.svg' },
  amazon_prime: { name: 'Prime Video', logo: '/logos/prime.svg' },
  disney_plus: { name: 'Disney+', logo: '/logos/disney.svg' },
  hulu: { name: 'Hulu', logo: '/logos/hulu.svg' },
  hbo_max: { name: 'Max', logo: '/logos/max.svg' },
  apple_tv_plus: { name: 'Apple TV+', logo: '/logos/apple.svg' },
  paramount_plus: { name: 'Paramount+', logo: '/logos/paramount.svg' },
  peacock: { name: 'Peacock', logo: '/logos/peacock.svg' },
} as const;