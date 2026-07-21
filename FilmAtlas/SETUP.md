# FilmAtlas Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- A TMDB account and API key

### 2. Get Your TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account or sign in
3. Navigate to Settings → API
4. Request an API key (choose "Developer")
5. Fill out the form (use "Personal" for type if this is for learning)
6. Copy your API key

### 3. Environment Setup

1. Navigate to the FilmAtlas directory:
   ```bash
   cd FilmAtlas
   ```

2. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

3. Open `.env.local` and add your TMDB API key:
   ```
   NEXT_PUBLIC_TMDB_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_TMDB_API_BASE_URL=https://api.themoviedb.org/3
   NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   NEXT_PUBLIC_TMDB_AUTH_BASE_URL=https://www.themoviedb.org
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

To create a production build:

```bash
npm run build
npm start
```

## Features Overview

### 🏠 Home Page
- Cinematic hero section with the top trending movie
- Multiple carousels: Trending, Now Playing, Popular, Top Rated
- Smooth scroll animations and hover effects

### 🔐 Authentication
1. Click "Sign In" in the header
2. Click "Sign in with TMDB"
3. You'll be redirected to TMDB to approve the application
4. After approval, you'll be redirected back and automatically logged in

### 🎬 Movie Details
- Click any movie card to view full details
- See cast with avatars
- Rate movies (1-10 stars)
- View similar movie recommendations

### 🔍 Discover
- Filter movies by genre
- Filter by release year
- Set minimum rating threshold
- Results update automatically

### 📝 Personal Features (Requires Login)
- **Watchlist**: Add movies to watch later
- **Favorites**: Mark movies as favorites
- **Account**: View your profile and manage settings

## Project Structure

```
FilmAtlas/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── login/               # Login page
│   ├── auth/callback/       # OAuth callback handler
│   ├── movie/[id]/          # Dynamic movie details
│   ├── discover/            # Discovery/filtering page
│   ├── watchlist/           # User watchlist
│   ├── favorites/           # User favorites
│   └── account/             # Account settings
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── hero-section.tsx
│   │   ├── movie-card.tsx
│   │   ├── movie-carousel.tsx
│   │   └── skeleton.tsx
│   ├── shared/              # Shared layout components
│   │   └── header.tsx
│   └── providers.tsx        # TanStack Query provider
├── lib/
│   └── tmdb.ts             # TMDB API service layer
├── store/                   # Zustand state management
│   ├── auth.ts             # Authentication state
│   └── ui.ts               # UI state
├── types/
│   └── tmdb.ts             # TypeScript type definitions
└── public/                  # Static assets
```

## API Service Architecture

### TMDB Client (`lib/tmdb.ts`)
The entire TMDB API integration is in one file with a clean service pattern:

```typescript
// Direct client usage
import { tmdb } from '@/lib/tmdb';
const movies = await tmdb.getTrending();

// Service pattern usage (recommended)
import { MovieService } from '@/lib/tmdb';
const movies = await MovieService.getTrending();
```

### Available Services

1. **MovieService** - Movie-related operations
   - `getTrending()` - Get trending movies
   - `getNowPlaying()` - Get now playing movies
   - `getPopular()` - Get popular movies
   - `getTopRated()` - Get top rated movies
   - `getUpcoming()` - Get upcoming movies
   - `getDetails(id)` - Get movie details
   - `getCredits(id)` - Get movie credits/cast
   - `getSimilar(id)` - Get similar movies
   - `rate(id, rating)` - Rate a movie
   - `deleteRating(id)` - Remove rating

2. **SearchService** - Search and discovery
   - `multi(query)` - Search movies, TV, people
   - `discover(params)` - Advanced filtering
   - `getGenres()` - Get genre list

3. **AccountService** - User account operations
   - `getDetails()` - Get account info
   - `getWatchlist(accountId)` - Get watchlist
   - `addToWatchlist(accountId, request)` - Add to watchlist
   - `getFavorites(accountId)` - Get favorites
   - `addToFavorites(accountId, request)` - Add to favorites
   - `getLists(accountId)` - Get custom lists

4. **AuthService** - Authentication
   - `getRequestToken()` - Start OAuth flow
   - `getAuthUrl(token)` - Get auth redirect URL
   - `createSession(token)` - Complete OAuth flow
   - `deleteSession()` - Logout

## State Management

### Zustand Stores

**Auth Store** (`store/auth.ts`):
```typescript
const { isAuthenticated, account, setSession, logout } = useAuthStore();
```

**UI Store** (`store/ui.ts`):
```typescript
const { isSidebarOpen, toggleSidebar } = useUIStore();
```

## Styling

### Tailwind CSS Custom Theme

```css
/* Colors */
.bg-netflix-red      → #E50914
.bg-netflix-black    → #141414
.bg-netflix-gray-dark → #1a1a1a

/* Custom Utilities */
.glassmorphism       → Semi-transparent backdrop blur
.text-gradient       → White to gray gradient text
.netflix-shadow      → Soft shadow for cards
.vignette           → Dark edge vignette effect
```

### Framer Motion Animations

All interactive elements use Framer Motion:
- Movie cards scale on hover (1.05x)
- Page transitions with fade
- Hero section animated entrance
- Smooth carousel scrolling

## TanStack Query (React Query)

Data fetching and caching:
```typescript
const { data: movies, isLoading } = useQuery({
  queryKey: ['trending'],
  queryFn: () => MovieService.getTrending(),
});
```

## Troubleshooting

### API Key Issues
- Make sure your API key is in `.env.local` (not `.env.example`)
- The file must be named exactly `.env.local`
- Restart the dev server after adding environment variables

### Build Errors
```bash
# Clean build cache
rm -rf .next
npm run build
```

### CORS Errors
- TMDB API should work from localhost
- If issues persist, check your API key is valid

## License

MIT
