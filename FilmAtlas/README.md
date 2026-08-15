# Cineast

A production-grade, Netflix-style movie discovery platform built with Next.js 14, TypeScript, and TMDB API.

## Features

- 🎬 **Beautiful UI**: Netflix-inspired dark theme with glassmorphism and smooth animations
- 🔐 **User Authentication**: Full TMDB OAuth integration with session management
- 🎯 **Movie Discovery**: Advanced filtering by genre, year, and rating
- ⭐ **User Dashboard**: Personal watchlist, favorites, and custom lists
- 🎥 **Rich Details**: Movie information with cast, credits, and similar recommendations
- 📱 **Responsive Design**: Optimized for all screen sizes
- 🚀 **Performance**: Server components, image optimization, and caching

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **API**: TMDB (The Movie Database)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gideon-Esq/Vibecode.me.git
   cd Vibecode.me/Cineast
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and add your TMDB API key:
   ```bash
   cp .env.example .env.local
   ```
   
   Get your API key from [TMDB](https://www.themoviedb.org/settings/api)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Cineast/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Page routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   └── shared/            # Shared components (Header, etc.)
├── lib/
│   └── tmdb.ts           # TMDB API service layer
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## API Services

### Authentication
- 3-legged OAuth flow
- Session management
- Secure token handling

### Movie Features
- Trending, Popular, Top Rated
- Now Playing, Upcoming
- Movie details with credits
- Similar movie recommendations
- User ratings

### User Features
- Account details
- Watchlist management
- Favorites management
- Custom lists

### Discovery
- Multi-search (Movies, TV, People)
- Advanced filtering
- Genre-based discovery

## Design System

- **Colors**: Netflix Black (#141414), Netflix Red (#E50914)
- **Typography**: Inter font family
- **Animations**: Framer Motion for micro-interactions
- **Effects**: Glassmorphism overlays, smooth transitions

## License

MIT
