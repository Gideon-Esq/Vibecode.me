import {
  pgTable,
  pgSchema,
  pgEnum,
  uuid,
  text,
  integer,
  smallint,
  boolean,
  real,
  date,
  jsonb,
  timestamp,
  primaryKey,
  foreignKey,
  index,
  unique,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { Genre } from '@/types/tmdb';

/**
 * The `neon_auth` schema is created and maintained by Neon Auth (Managed Better
 * Auth). We never write to it — it is declared here only so our own tables can
 * declare real foreign keys against the user table.
 *
 * `drizzle.config.ts` sets `schemaFilter: ['public', 'neon_auth']` so drizzle-kit
 * knows these tables already exist and does not try to create them.
 */
export const neonAuth = pgSchema('neon_auth');

export const users = neonAuth.table(
  'user',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text('role'),
    banned: boolean('banned'),
    banReason: text('banReason'),
    banExpires: timestamp('banExpires', { withTimezone: true }),
  },
  (table) => [unique('user_email_key').on(table.email)]
);

/**
 * Local cache of TMDB movie metadata.
 *
 * The list tables below only store an id and a media type. Without this cache,
 * rendering a 200-item watchlist would mean 200 TMDB round-trips. Rows are
 * upserted from the TMDB details endpoint whenever a title first enters any of a
 * user's lists, and refreshed when `syncedAt` goes stale.
 *
 * The table is still called `movies` for continuity with the first migration; it
 * holds TV series too, distinguished by `mediaType`.
 */
export const mediaType = pgEnum('media_type', ['movie', 'tv']);

export const movies = pgTable(
  'movies',
  {
    // TMDB ids are only unique *within* a media type — movie 1399 and TV 1399 are
    // different titles — so the type is part of the key everywhere.
    id: integer('id').notNull(),
    mediaType: mediaType('media_type').notNull().default('movie'),
    title: text('title').notNull(),
    posterPath: text('poster_path'),
    backdropPath: text('backdrop_path'),
    overview: text('overview'),
    releaseDate: date('release_date'),
    /** For a series this is the whole run: episode length × episode count. */
    runtime: integer('runtime'),
    voteAverage: real('vote_average'),
    genres: jsonb('genres').$type<Genre[]>(),
    syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id, table.mediaType] })]
);

/**
 * Links an app user to a TMDB account.
 *
 * `sessionId` is TMDB's long-lived session id and is stored encrypted (AES-256-GCM,
 * see lib/crypto.ts) because it grants write access to that person's TMDB account.
 * It is only ever decrypted server-side.
 *
 * One row per user, and a TMDB account may only be claimed by one app user — that
 * uniqueness is what makes "sign in with TMDB" resolve back to the same app user.
 */
export const tmdbAccounts = pgTable(
  'tmdb_accounts',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    tmdbAccountId: integer('tmdb_account_id').notNull(),
    username: text('username').notNull(),
    name: text('name'),
    sessionId: text('session_id').notNull(), // encrypted at rest
    /** True when the account was created via "Continue with TMDB" rather than linked later. */
    isPrimaryLogin: boolean('is_primary_login').notNull().default(false),
    linkedAt: timestamp('linked_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('tmdb_accounts_tmdb_account_id_key').on(table.tmdbAccountId),
  ]
);

const listColumns = {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  movieId: integer('movie_id').notNull(),
  mediaType: mediaType('media_type').notNull().default('movie'),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
};

/** Composite FK into `movies`, which is keyed on (id, media_type). */
const mediaReference = (table: { movieId: AnyPgColumn; mediaType: AnyPgColumn }) =>
  foreignKey({
    columns: [table.movieId, table.mediaType],
    foreignColumns: [movies.id, movies.mediaType],
  }).onDelete('cascade');

export const watchlist = pgTable(
  'watchlist',
  listColumns,
  (table) => [
    primaryKey({ columns: [table.userId, table.movieId, table.mediaType] }),
    mediaReference(table),
    index('watchlist_user_added_idx').on(table.userId, table.addedAt),
  ]
);

export const favorites = pgTable(
  'favorites',
  listColumns,
  (table) => [
    primaryKey({ columns: [table.userId, table.movieId, table.mediaType] }),
    mediaReference(table),
    index('favorites_user_added_idx').on(table.userId, table.addedAt),
  ]
);

/**
 * Titles the user has marked as already watched.
 *
 * Unlike watchlist/favorites this carries its own state: when they saw it, how
 * they rated it, and how many times they've rewatched it. TMDB has no "watched"
 * concept, so this table is the sole source of truth for it.
 */
export const watched = pgTable(
  'watched',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    movieId: integer('movie_id').notNull(),
    mediaType: mediaType('media_type').notNull().default('movie'),
    /** When they watched it. Defaults to the moment they tagged it. */
    watchedAt: timestamp('watched_at', { withTimezone: true }).defaultNow().notNull(),
    /** Personal 1–10 score. Mirrored to TMDB as a rating when an account is linked. */
    rating: smallint('rating'),
    rewatchCount: integer('rewatch_count').notNull().default(1),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.movieId, table.mediaType] }),
    mediaReference(table),
    index('watched_user_watched_at_idx').on(table.userId, table.watchedAt),
  ]
);

export type MediaType = (typeof mediaType.enumValues)[number];
export type MovieRow = typeof movies.$inferSelect;
export type TmdbAccount = typeof tmdbAccounts.$inferSelect;
export type WatchedRow = typeof watched.$inferSelect;
