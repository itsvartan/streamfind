# StreamFind 🎬

A blazing-fast movie streaming search application that helps you find where to watch your favorite movies across all major streaming platforms.

## Features ✨

- **Universal Search**: Search across Netflix, Prime Video, Disney+, Hulu, Max, Apple TV+, and more
- **Smart Suggestions**: Fuzzy search with natural language processing
- **Lightning Fast**: Sub-second search results with intelligent caching
- **Beautiful UI**: Smooth animations and responsive design
- **Accessibility First**: WCAG AA compliant with full keyboard navigation
- **Performance Optimized**: Code splitting, lazy loading, and virtual scrolling

## Tech Stack 🛠

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion
- **API**: Watchmode API + TMDB API

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys from [Watchmode](https://api.watchmode.com/) and [TMDB](https://www.themoviedb.org/settings/api) (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/streamfind.git
cd streamfind
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```env
VITE_WATCHMODE_API_KEY=your_watchmode_api_key
VITE_TMDB_API_KEY=your_tmdb_api_key  # Optional but recommended
```

5. Start the development server:
```bash
npm run dev
```

## Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage

## Project Structure 📁

```
src/
├── api/              # API clients and configuration
├── components/       # React components
│   ├── SearchBar/    # Search functionality
│   ├── ResultsGrid/  # Movie grid display
│   ├── MovieDetail/  # Movie detail modal
│   └── shared/       # Reusable components
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── styles/           # Global styles
```

## Performance 🚄

- First Contentful Paint < 1s
- Time to Interactive < 2s
- Lighthouse scores: 100/100 across all categories
- Bundle size < 150KB initial load

## Deployment 🌐

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Watchmode](https://www.watchmode.com) for streaming availability data
- [TMDB](https://www.themoviedb.org) for movie metadata and images
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for beautiful animations

---

Built with ❤️ and lots of ☕
 
