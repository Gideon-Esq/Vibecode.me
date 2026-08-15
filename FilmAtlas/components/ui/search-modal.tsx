'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { SearchService, tmdb } from '@/lib/tmdb';
import type { SearchResult } from '@/types/tmdb';
import Image from 'next/image';

const MEDIA_LABELS: Record<string, string> = {
  movie: 'Movie',
  tv: 'TV Series',
  person: 'Person',
};

function resultPath(mediaType: string): string {
  if (mediaType === 'tv') return 'tv';
  if (mediaType === 'person') return 'person';
  return 'movie';
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Two pages, because roughly half of a typical multi-search page is TV and
  // gets dropped below — one page alone leaves the list looking sparse.
  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const [first, second] = await Promise.all([
        SearchService.multi(query, 1),
        SearchService.multi(query, 2).catch(() => null),
      ]);
      return [...first.results, ...(second?.results ?? [])];
    },
    enabled: query.length > 2,
  });

  const results = useMemo(() => {
    const seen = new Set<string>();

    return (data ?? []).filter((result) => {
      // TMDB occasionally returns other media types; only these three have a page.
      if (!['movie', 'tv', 'person'].includes(result.media_type)) return false;

      const key = `${result.media_type}-${result.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/${resultPath(result.media_type)}/${result.id}`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:text-gray-300 transition-colors"
        aria-label="Search"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glassmorphism rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies, TV series and people..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {query.length > 2 && (
                  <div className="max-h-[60vh] overflow-y-auto space-y-2">
                    {isLoading ? (
                      <div className="text-center py-8 text-gray-400">Searching...</div>
                    ) : results.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No results found</div>
                    ) : (
                      results.map((result) => {
                        const isPerson = result.media_type === 'person';
                        const imagePath = isPerson
                          ? result.profile_path
                          : result.poster_path;
                        const year =
                          result.release_date || result.first_air_date || '';

                        return (
                          <button
                            key={`${result.media_type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                          >
                            <div className="w-16 h-24 flex-shrink-0 bg-netflix-gray-medium rounded overflow-hidden">
                              <Image
                                src={
                                  isPerson
                                    ? tmdb.getProfileUrl(imagePath ?? null, 'w185')
                                    : tmdb.getImageUrl(imagePath ?? null, 'w200')
                                }
                                alt={result.title || result.name || 'Result'}
                                width={64}
                                height={96}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {result.title || result.name}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {MEDIA_LABELS[result.media_type]}
                                {year && ` · ${new Date(year).getFullYear()}`}
                              </p>
                              {result.overview && (
                                <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                                  {result.overview}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {query.length <= 2 && query.length > 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Type at least 3 characters to search
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
