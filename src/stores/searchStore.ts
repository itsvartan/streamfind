import { create } from 'zustand';
import type { Movie, SearchFilters } from '@types/movie';

interface SearchHistory {
  query: string;
  timestamp: number;
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Movie[];
  isLoading: boolean;
  error: string | null;
  history: SearchHistory[];
  suggestions: string[];
  
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setResults: (results: Movie[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  setSuggestions: (suggestions: string[]) => void;
}

const MAX_HISTORY_ITEMS = 10;

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  filters: {},
  results: [],
  isLoading: false,
  error: null,
  history: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
  suggestions: [],

  setQuery: (query) => set({ query }),
  
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setResults: (results) => set({ results }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  addToHistory: (query) =>
    set((state) => {
      const newHistory = [
        { query, timestamp: Date.now() },
        ...state.history.filter((item) => item.query !== query),
      ].slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return { history: newHistory };
    }),

  clearHistory: () => {
    localStorage.removeItem('searchHistory');
    set({ history: [] });
  },

  setSuggestions: (suggestions) => set({ suggestions }),
}));