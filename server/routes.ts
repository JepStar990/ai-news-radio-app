import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertFavoriteSchema, insertPlaylistSchema, insertListeningHistorySchema, NEWS_CATEGORIES } from "./types";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Articles endpoints
  app.get("/api/articles", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      
      const articles = await storage.getArticles(limit, offset, category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/featured", async (req, res) => {
    try {
      const articles = await storage.getFeaturedArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured articles" });
    }
  });

  app.get("/api/articles/trending", async (req, res) => {
    try {
      const articles = await storage.getTrendingArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending articles" });
    }
  });

  app.get("/api/articles/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const category = req.query.category as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const articles = await storage.searchArticles(query, category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get("/api/articles/:id/audio", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getArticle(articleId);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const { convertTextToSpeech } = await import('./openai.js');
      const audioBuffer = await convertTextToSpeech(article.content, article.title);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error('Failed to generate audio:', error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Categories endpoint
  app.get("/api/categories", (req, res) => {
    res.json(NEWS_CATEGORIES);
  });

  // Favorites endpoints (assuming userId = 1 for demo)
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }
      
      const validatedData = insertFavoriteSchema.parse({ userId, articleId });
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid favorite data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:articleId", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const articleId = parseInt(req.params.articleId);
      
      const success = await storage.removeFavorite(userId, articleId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:articleId/check", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const articleId = parseInt(req.params.articleId);
      
      const isFavorite = await storage.isFavorite(userId, articleId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Playlists endpoints
  app.get("/api/playlists", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const playlists = await storage.getUserPlaylists(userId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const validatedData = insertPlaylistSchema.parse({ ...req.body, userId });
      const playlist = await storage.createPlaylist(validatedData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid playlist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create playlist" });
    }
  });

  app.get("/api/playlists/:id/articles", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const articles = await storage.getPlaylistArticles(id);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlist articles" });
    }
  });

  // Downloads endpoints
  app.get("/api/downloads", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const downloads = await storage.getUserDownloads(userId);
      res.json(downloads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  app.post("/api/downloads", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      await storage.addDownload(userId, articleId);
      res.status(201).json({ message: "Article downloaded for offline use", articleId });
    } catch (error) {
      res.status(500).json({ message: "Failed to download article" });
    }
  });

  app.delete("/api/downloads/:articleId", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const articleId = parseInt(req.params.articleId);
      
      const removed = await storage.removeDownload(userId, articleId);
      if (removed) {
        res.status(200).json({ message: "Download removed" });
      } else {
        res.status(404).json({ message: "Download not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove download" });
    }
  });

  // In-memory notification state
  const notificationReadStatus = new Map<number, boolean>();

  // Notifications endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      
      // Generate dynamic notifications based on recent articles
      const recentArticles = await storage.getArticles(5, 0);
      const notifications = recentArticles.map((article, index) => ({
        id: index + 1,
        type: index % 3 === 0 ? 'breaking' : index % 3 === 1 ? 'update' : 'trending',
        title: index % 3 === 0 ? 'Breaking News' : index % 3 === 1 ? 'News Update' : 'Trending Now',
        message: `New article: ${article.title}`,
        read: notificationReadStatus.get(index + 1) || false,
        timestamp: new Date(Date.now() - index * 3600000), // Stagger timestamps
        articleId: article.id
      }));
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/mark-read", async (req, res) => {
    try {
      const { notificationId } = req.body;
      const id = parseInt(notificationId);
      notificationReadStatus.set(id, true);
      res.json({ message: "Notification marked as read", notificationId });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Listening history endpoints
  app.get("/api/history", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const history = await storage.getUserHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listening history" });
    }
  });

  app.post("/api/history/progress", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const validatedData = insertListeningHistorySchema.parse({ ...req.body, userId });
      const history = await storage.updateProgress(validatedData);
      res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.get("/api/history/:articleId/progress", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const articleId = parseInt(req.params.articleId);
      
      const progress = await storage.getProgress(userId, articleId);
      res.json(progress || { progress: 0, completed: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Podcast endpoints
  app.get("/api/podcasts", async (req, res) => {
    try {
      const { category } = req.query;
      const podcasts = await storage.getPodcasts(category as string);
      res.json(podcasts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch podcasts" });
    }
  });

  app.get("/api/podcasts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const podcast = await storage.getPodcast(id);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
      res.json(podcast);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch podcast" });
    }
  });

  // Share endpoints
  app.get("/api/shares", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const shares = await storage.getUserShares(userId);
      res.json(shares);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shares" });
    }
  });

  app.post("/api/shares", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const { platform, articleId, playlistId } = req.body;
      
      const shareData = {
        userId,
        platform,
        articleId: articleId || null,
        playlistId: playlistId || null,
      };
      
      const share = await storage.shareContent(shareData);
      res.json(share);
    } catch (error) {
      res.status(500).json({ message: "Failed to create share" });
    }
  });

  // Live stream endpoints
  app.get("/api/live-streams", async (req, res) => {
    try {
      const { category } = req.query;
      const streams = await storage.getLiveStreams(category as string);
      res.json(streams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live streams" });
    }
  });

  app.get("/api/live-streams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stream = await storage.getLiveStream(id);
      if (!stream) {
        return res.status(404).json({ message: "Live stream not found" });
      }
      res.json(stream);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live stream" });
    }
  });

  // Downloads endpoint (for offline articles)
  app.get("/api/downloads", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const articles = await storage.getUserHistory(userId);
      res.json(articles.filter(article => article.audioUrl)); // Only articles with audio
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  // User history endpoint
  app.get("/api/history", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from auth session
      const history = await storage.getUserHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
