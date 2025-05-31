// Frontend-only types - completely independent from backend schema

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