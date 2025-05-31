import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  enhancedContent: text("enhanced_content"),
  audioUrl: text("audio_url"),
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  duration: integer("duration"), // in seconds
  readTime: integer("read_time"), // in minutes
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isProcessed: boolean("is_processed").default(false),
  metadata: jsonb("metadata"),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  articleIds: text("article_ids").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listeningHistory = pgTable("listening_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  progress: integer("progress").default(0), // in seconds
  completed: boolean("completed").default(false),
  listenedAt: timestamp("listened_at").defaultNow().notNull(),
});

export const podcasts = pgTable("podcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  feedUrl: text("feed_url").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const podcastEpisodes = pgTable("podcast_episodes", {
  id: serial("id").primaryKey(),
  podcastId: integer("podcast_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration"), // Duration in seconds
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id"),
  playlistId: integer("playlist_id"),
  platform: text("platform").notNull(), // 'twitter', 'facebook', 'email', etc.
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
});

export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  streamUrl: text("stream_url").notNull(),
  category: text("category").notNull(),
  isLive: boolean("is_live").default(false).notNull(),
  listeners: integer("listeners").default(0).notNull(),
  language: text("language").default('en').notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  isProcessed: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export const insertListeningHistorySchema = createInsertSchema(listeningHistory).omit({
  id: true,
  listenedAt: true,
});

export const insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  createdAt: true,
});

export const insertPodcastEpisodeSchema = createInsertSchema(podcastEpisodes).omit({
  id: true,
  createdAt: true,
});

export const insertShareSchema = createInsertSchema(shares).omit({
  id: true,
  sharedAt: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type ListeningHistory = typeof listeningHistory.$inferSelect;
export type InsertListeningHistory = z.infer<typeof insertListeningHistorySchema>;

export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;

export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type InsertPodcastEpisode = z.infer<typeof insertPodcastEpisodeSchema>;

export type Share = typeof shares.$inferSelect;
export type InsertShare = z.infer<typeof insertShareSchema>;

export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;

// News categories
export const NEWS_CATEGORIES = [
  "Breaking",
  "Politics",
  "Technology",
  "Business",
  "Sports",
  "Health",
  "Science",
  "Entertainment"
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];
