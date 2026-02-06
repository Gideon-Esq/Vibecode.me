export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] md:w-[250px]">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-netflix-gray-medium animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
      <div className="mt-2 space-y-2">
        <div className="h-4 bg-netflix-gray-medium rounded animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
        <div className="h-3 bg-netflix-gray-medium rounded w-2/3 animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%] animate-shimmer" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 space-y-4">
        <div className="h-12 bg-netflix-gray-medium rounded w-1/2 animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
        <div className="h-6 bg-netflix-gray-medium rounded w-3/4 animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
        <div className="flex gap-4 mt-4">
          <div className="h-12 w-32 bg-netflix-gray-medium rounded animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
          <div className="h-12 w-32 bg-netflix-gray-medium rounded animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-netflix-gray-medium rounded w-48 animate-shimmer bg-gradient-to-r from-netflix-gray-medium via-netflix-gray-light to-netflix-gray-medium bg-[length:1000px_100%]" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
