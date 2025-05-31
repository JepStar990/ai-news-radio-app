// Backend-only types - completely independent from frontend
import { z } from "zod";

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  createdAt: Date;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  imageUrl: string | null;
  audioUrl: string | null;
  readingTime: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: number;
  userId: number;
  articleId: number;
  createdAt: Date;
}

export interface Playlist {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListeningHistory {
  id: number;
  userId: number;
  articleId: number;
  progress: number;
  completed: boolean;
  lastListenedAt: Date;
}

export interface Podcast {
  id: number;
  title: string;
  category: string;
  imageUrl: string | null;
  createdAt: Date;
  description: string | null;
  feedUrl: string;
  isActive: boolean;
}

export interface PodcastEpisode {
  id: number;
  title: string;
  audioUrl: string;
  duration: number | null;
  publishedAt: Date;
  createdAt: Date;
  description: string | null;
  podcastId: number;
}

export interface Share {
  id: number;
  articleId: number | null;
  userId: number;
  playlistId: number | null;
  platform: string;
  sharedAt: Date;
}

export interface LiveStream {
  id: number;
  title: string;
  category: string;
  imageUrl: string | null;
  createdAt: Date;
  description: string | null;
  streamUrl: string;
  isLive: boolean;
  listeners: number;
  language: string;
}

// Insert types for validation
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
});

export const insertArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().nullable().optional(),
  category: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  readingTime: z.number().nullable().optional(),
});

export const insertFavoriteSchema = z.object({
  userId: z.number(),
  articleId: z.number(),
});

export const insertPlaylistSchema = z.object({
  userId: z.number(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const insertListeningHistorySchema = z.object({
  userId: z.number(),
  articleId: z.number(),
  progress: z.number(),
  completed: z.boolean(),
});

export const insertPodcastSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().nullable().optional(),
  feedUrl: z.string().url(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const insertPodcastEpisodeSchema = z.object({
  title: z.string().min(1),
  audioUrl: z.string().url(),
  duration: z.number().nullable().optional(),
  publishedAt: z.date(),
  description: z.string().nullable().optional(),
  podcastId: z.number(),
});

export const insertShareSchema = z.object({
  userId: z.number(),
  platform: z.string().min(1),
  articleId: z.number().nullable().optional(),
  playlistId: z.number().nullable().optional(),
});

export const insertLiveStreamSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  streamUrl: z.string().url(),
  category: z.string().min(1),
  isLive: z.boolean().default(false),
  listeners: z.number().default(0),
  language: z.string().default('en'),
  imageUrl: z.string().nullable().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type InsertListeningHistory = z.infer<typeof insertListeningHistorySchema>;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type InsertPodcastEpisode = z.infer<typeof insertPodcastEpisodeSchema>;
export type InsertShare = z.infer<typeof insertShareSchema>;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;

export const NEWS_CATEGORIES = [
  "Breaking News",
  "Politics", 
  "Technology",
  "Business",
  "Sports",
  "Health",
  "Science",
  "Entertainment"
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];