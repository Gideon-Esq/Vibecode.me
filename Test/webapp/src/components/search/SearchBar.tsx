import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  className,
  size = "default",
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (onSearch && debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, navigate]
  );

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center transition-all duration-300",
          isFocused && "scale-[1.02]"
        )}
      >
        <div
          className={cn(
            "absolute left-0 flex items-center justify-center text-muted-foreground",
            isLarge ? "w-14 h-14" : "w-10 h-10"
          )}
        >
          <Search className={cn(isLarge ? "w-5 h-5" : "w-4 h-4")} />
        </div>

        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for songs, artists..."
          autoFocus={autoFocus}
          className={cn(
            "w-full bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all",
            isLarge
              ? "h-14 pl-14 pr-12 text-lg rounded-2xl"
              : "h-10 pl-10 pr-10 text-sm rounded-xl",
            isFocused && "bg-secondary"
          )}
        />

        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className={cn(
              "absolute right-1 text-muted-foreground hover:text-foreground",
              isLarge ? "w-10 h-10" : "w-8 h-8"
            )}
          >
            <X className={cn(isLarge ? "w-5 h-5" : "w-4 h-4")} />
          </Button>
        )}
      </div>

      {/* Glow effect when focused */}
      {isFocused && (
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-2xl opacity-50 blur-xl transition-opacity",
            "bg-gradient-to-r from-primary/20 to-accent/20"
          )}
        />
      )}
    </form>
  );
}
