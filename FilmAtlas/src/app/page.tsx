import { Suspense } from 'react';
import { TMDBService } from '@/lib/tmdb';
import { getSessionId, loginAction, logoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

async function TrendingMovies() {
  let trending;
  // We use try/catch to handle the case where the API key is missing or invalid in dev
  try {
    trending = await TMDBService.getTrending();
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    return (
      <div className="text-red-500">
        Failed to load movies. Please check your API Key configuration.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {trending.results.map((movie) => (
        <div key={movie.id} className="relative aspect-[2/3] group cursor-pointer bg-neutral-900 rounded-md overflow-hidden">
            {movie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">No Image</div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-white font-bold text-sm mb-2">{movie.title}</p>
                <p className="text-green-400 text-xs font-semibold">{(movie.vote_average * 10).toFixed(0)}% Match</p>
            </div>
        </div>
      ))}
    </div>
  );
}

function TrendingSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full" />
            ))}
        </div>
    )
}

export default async function Home() {
  const sessionId = await getSessionId();
  let user = null;

  if (sessionId) {
      try {
        user = await TMDBService.getAccountDetails(sessionId);
      } catch (e) {
          console.error("Failed to fetch user details", e);
      }
  }

  return (
    <main className="min-h-screen p-8 space-y-8 bg-background text-foreground">
      <header className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <h1 className="text-4xl font-bold text-netflixRed tracking-tighter">FilmAtlas</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                  {user.username}
              </span>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm">Logout</Button>
              </form>
            </div>
          ) : (
            <form action={loginAction}>
              <Button variant="netflix">Login with TMDB</Button>
            </form>
          )}
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingMovies />
        </Suspense>
      </section>
    </main>
  );
}
