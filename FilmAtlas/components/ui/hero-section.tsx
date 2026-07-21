'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { tmdb } from '@/lib/tmdb';
import type { Movie } from '@/types/tmdb';

interface HeroSectionProps {
  movie: Movie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={tmdb.getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Vignette effect */}
        <div className="absolute inset-0 vignette" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col justify-end p-8 md:p-16 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-gradient"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {movie.title}
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-gray-200 mb-6 line-clamp-3 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {movie.overview}
        </motion.p>

        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="text-lg font-semibold">{movie.vote_average.toFixed(1)}</span>
          </div>
          <span className="text-gray-400">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </span>
        </motion.div>

        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <button className="px-8 py-3 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Play
          </button>
          <button className="px-8 py-3 bg-gray-600/70 hover:bg-gray-600 text-white font-bold rounded-md transition-colors flex items-center gap-2">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            More Info
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
