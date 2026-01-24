'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { tmdb } from '@/lib/tmdb';
import type { Movie } from '@/types/tmdb';

interface MovieCardProps {
  movie: Movie;
  onHover?: (movie: Movie | null) => void;
}

export function MovieCard({ movie, onHover }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-shrink-0 w-[200px] md:w-[250px] cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => {
        setIsHovered(true);
        onHover?.(movie);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        onHover?.(null);
      }}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden netflix-shadow">
        <Image
          src={tmdb.getImageUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 200px, 250px"
        />
        
        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <h3 className="font-bold text-sm md:text-base line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-semibold text-sm line-clamp-1">{movie.title}</h3>
      </div>
    </motion.div>
  );
}
