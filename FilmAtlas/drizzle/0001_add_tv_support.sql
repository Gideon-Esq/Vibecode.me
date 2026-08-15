-- Adds TV series support to the library.
--
-- TMDB ids are only unique within a media type (movie 1399 and TV 1399 are
-- different titles), so `media_type` joins the key of `movies` and of all three
-- list tables. Existing rows take the 'movie' default, which is correct: only
-- movies could be stored before this.
--
-- Hand-ordered. drizzle-kit generated the primary-key swaps before the columns
-- they reference existed, and could not resolve the name of the old `movies`
-- primary key to drop it — leaving a migration that would fail on both counts.

CREATE TYPE "public"."media_type" AS ENUM('movie', 'tv');
--> statement-breakpoint

-- 1. Drop the foreign keys that depend on the movies primary key.
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_movie_id_movies_id_fk";--> statement-breakpoint
ALTER TABLE "watched" DROP CONSTRAINT "watched_movie_id_movies_id_fk";--> statement-breakpoint
ALTER TABLE "watchlist" DROP CONSTRAINT "watchlist_movie_id_movies_id_fk";--> statement-breakpoint

-- 2. Add the discriminator column everywhere it belongs.
ALTER TABLE "movies" ADD COLUMN "media_type" "media_type" DEFAULT 'movie' NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites" ADD COLUMN "media_type" "media_type" DEFAULT 'movie' NOT NULL;--> statement-breakpoint
ALTER TABLE "watched" ADD COLUMN "media_type" "media_type" DEFAULT 'movie' NOT NULL;--> statement-breakpoint
ALTER TABLE "watchlist" ADD COLUMN "media_type" "media_type" DEFAULT 'movie' NOT NULL;--> statement-breakpoint

-- 3. Widen the primary keys. The movies key was created inline by 0000, so its
--    generated name is looked up rather than assumed.
DO $$
DECLARE
  pk_name text;
BEGIN
  SELECT constraint_name INTO pk_name
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'movies'
    AND constraint_type = 'PRIMARY KEY';

  IF pk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "public"."movies" DROP CONSTRAINT %I', pk_name);
  END IF;
END
$$;
--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_id_media_type_pk" PRIMARY KEY("id","media_type");--> statement-breakpoint

ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_movie_id_pk";--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_movie_id_media_type_pk" PRIMARY KEY("user_id","movie_id","media_type");--> statement-breakpoint

ALTER TABLE "watched" DROP CONSTRAINT "watched_user_id_movie_id_pk";--> statement-breakpoint
ALTER TABLE "watched" ADD CONSTRAINT "watched_user_id_movie_id_media_type_pk" PRIMARY KEY("user_id","movie_id","media_type");--> statement-breakpoint

ALTER TABLE "watchlist" DROP CONSTRAINT "watchlist_user_id_movie_id_pk";--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_movie_id_media_type_pk" PRIMARY KEY("user_id","movie_id","media_type");--> statement-breakpoint

-- 4. Restore the foreign keys, now composite.
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_movie_id_media_type_movies_id_media_type_fk" FOREIGN KEY ("movie_id","media_type") REFERENCES "public"."movies"("id","media_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watched" ADD CONSTRAINT "watched_movie_id_media_type_movies_id_media_type_fk" FOREIGN KEY ("movie_id","media_type") REFERENCES "public"."movies"("id","media_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_movie_id_media_type_movies_id_media_type_fk" FOREIGN KEY ("movie_id","media_type") REFERENCES "public"."movies"("id","media_type") ON DELETE cascade ON UPDATE no action;
