import { 
  users, articles, favorites, playlists, listeningHistory, podcasts, podcastEpisodes, shares, liveStreams,
  type User, type InsertUser,
  type Article, type InsertArticle,
  type Favorite, type InsertFavorite,
  type Playlist, type InsertPlaylist,
  type ListeningHistory, type InsertListeningHistory,
  type Podcast, type InsertPodcast,
  type PodcastEpisode, type InsertPodcastEpisode,
  type Share, type InsertShare,
  type LiveStream, type InsertLiveStream
} from "./types";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Article methods
  getArticles(limit?: number, offset?: number, category?: string): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, updates: Partial<Article>): Promise<Article | undefined>;
  searchArticles(query: string, category?: string): Promise<Article[]>;
  getTrendingArticles(): Promise<Article[]>;
  getFeaturedArticles(): Promise<Article[]>;

  // Favorites methods
  getUserFavorites(userId: number): Promise<Article[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, articleId: number): Promise<boolean>;
  isFavorite(userId: number, articleId: number): Promise<boolean>;

  // Downloads methods
  getUserDownloads(userId: number): Promise<Article[]>;
  addDownload(userId: number, articleId: number): Promise<boolean>;
  removeDownload(userId: number, articleId: number): Promise<boolean>;

  // Playlist methods
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, updates: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
  getPlaylistArticles(playlistId: number): Promise<Article[]>;

  // Listening history methods
  getUserHistory(userId: number): Promise<Article[]>;
  updateProgress(history: InsertListeningHistory): Promise<ListeningHistory>;
  getProgress(userId: number, articleId: number): Promise<ListeningHistory | undefined>;

  // Podcast methods
  getPodcasts(category?: string): Promise<Podcast[]>;
  getPodcast(id: number): Promise<Podcast | undefined>;
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getPodcastEpisodes(podcastId: number): Promise<PodcastEpisode[]>;
  getEpisode(id: number): Promise<PodcastEpisode | undefined>;
  addPodcastEpisode(episode: InsertPodcastEpisode): Promise<PodcastEpisode>;

  // Share methods
  shareContent(share: InsertShare): Promise<Share>;
  getUserShares(userId: number): Promise<Share[]>;

  // Live stream methods
  getLiveStreams(category?: string): Promise<LiveStream[]>;
  getLiveStream(id: number): Promise<LiveStream | undefined>;
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  updateStreamStatus(id: number, isLive: boolean, listeners?: number): Promise<LiveStream | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private favorites: Map<number, Favorite>;
  private downloads: Set<string>; // Store userId-articleId combinations
  private playlists: Map<number, Playlist>;
  private listeningHistory: Map<number, ListeningHistory>;
  private podcasts: Map<number, Podcast>;
  private podcastEpisodes: Map<number, PodcastEpisode>;
  private shares: Map<number, Share>;
  private liveStreams: Map<number, LiveStream>;
  private currentUserId: number;
  private currentArticleId: number;
  private currentFavoriteId: number;
  private currentPlaylistId: number;
  private currentHistoryId: number;
  private currentPodcastId: number;
  private currentEpisodeId: number;
  private currentShareId: number;
  private currentStreamId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.favorites = new Map();
    this.downloads = new Set();
    this.playlists = new Map();
    this.listeningHistory = new Map();
    this.podcasts = new Map();
    this.podcastEpisodes = new Map();
    this.shares = new Map();
    this.liveStreams = new Map();
    this.currentUserId = 1;
    this.currentArticleId = 1;
    this.currentFavoriteId = 1;
    this.currentPlaylistId = 1;
    this.currentHistoryId = 1;
    this.currentPodcastId = 1;
    this.currentEpisodeId = 1;
    this.currentShareId = 1;
    this.currentStreamId = 1;

    // Add some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create a sample user
    const sampleUser: User = {
      id: this.currentUserId++,
      username: "demo",
      password: "password",
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample articles
    const sampleArticles: Article[] = [
      {
        id: this.currentArticleId++,
        title: "OpenAI Announces Revolutionary Language Model with Enhanced Reasoning",
        content: "OpenAI has unveiled its latest breakthrough in artificial intelligence with the release of a new language model that demonstrates unprecedented reasoning capabilities. The model, which has been in development for over two years, shows remarkable improvements in logical thinking, mathematical problem-solving, and complex decision-making processes. This advancement represents a significant leap forward in AI technology, potentially transforming industries from healthcare to finance.",
        summary: "The latest AI breakthrough promises to transform how we interact with artificial intelligence, featuring improved logical reasoning and multilingual capabilities...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://techcrunch.com/ai-breakthrough",
        sourceName: "TechCrunch",
        category: "Technology",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 240,
        readTime: 4,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      } as Article,
      {
        id: this.currentArticleId++,
        title: "Global Markets Rally as Tech Stocks Lead Recovery",
        content: "Major indices surged following positive earnings reports from technology giants, with the NASDAQ posting its best day in six months. Apple, Microsoft, and Google all exceeded analyst expectations, driving broader market optimism. The rally comes amid growing confidence in the tech sector's resilience and innovation capabilities.",
        summary: "Major indices surge following positive earnings reports from technology giants, with analysts predicting continued growth through Q4...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://bloomberg.com/markets-rally",
        sourceName: "Bloomberg",
        category: "Business",
        imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 180,
        readTime: 3,
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Breakthrough Gene Therapy Shows Promise for Rare Diseases",
        content: "Clinical trials demonstrate significant improvement in patients with inherited genetic disorders, offering hope for thousands of families worldwide. The therapy uses advanced CRISPR technology to correct genetic mutations at the cellular level, showing remarkable success rates in early-stage trials.",
        summary: "Clinical trials demonstrate significant improvement in patients with inherited genetic disorders, offering hope for thousands of families...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://nature.com/gene-therapy",
        sourceName: "Nature Medicine",
        category: "Health",
        imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 360,
        readTime: 6,
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "NASA's James Webb Telescope Discovers Ancient Galaxy Formation",
        content: "The James Webb Space Telescope has captured images of galaxy formation from over 13 billion years ago, providing unprecedented insights into the early universe. These observations challenge existing theories about cosmic evolution and offer new understanding of how the first galaxies formed after the Big Bang.",
        summary: "Webb telescope reveals galaxy formation from 13 billion years ago, challenging current cosmic evolution theories...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://nasa.gov/webb-discovery",
        sourceName: "NASA",
        category: "Science",
        imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 300,
        readTime: 5,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "World Cup Final Breaks Global Viewership Records",
        content: "The FIFA World Cup final attracted over 1.5 billion viewers worldwide, setting new records for sports broadcasting. The thrilling match went to penalties, keeping audiences on the edge of their seats for over two hours. Social media engagement reached unprecedented levels during the event.",
        summary: "World Cup final attracts record 1.5 billion viewers, becoming most-watched sporting event in history...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://fifa.com/worldcup-final",
        sourceName: "FIFA",
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 220,
        readTime: 4,
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Climate Summit Reaches Historic Agreement on Carbon Emissions",
        content: "World leaders at COP29 have reached a landmark agreement to reduce global carbon emissions by 50% within the next decade. The accord includes binding commitments from 195 countries and establishes a $500 billion fund for clean energy transition in developing nations.",
        summary: "COP29 climate summit produces historic agreement with 50% emission reduction target and $500B clean energy fund...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://un.org/cop29-agreement",
        sourceName: "United Nations",
        category: "Breaking",
        imageUrl: "https://images.unsplash.com/photo-1569163139394-de44aa904459?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 280,
        readTime: 5,
        publishedAt: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Major Breakthrough in Quantum Computing Achieved",
        content: "Researchers at MIT have successfully demonstrated quantum error correction at scale, bringing practical quantum computing significantly closer to reality. The breakthrough solves one of the most persistent challenges in quantum technology and could revolutionize computing within the next decade.",
        summary: "MIT achieves quantum error correction breakthrough, bringing practical quantum computing closer to reality...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://mit.edu/quantum-breakthrough",
        sourceName: "MIT Technology Review",
        category: "Technology",
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 320,
        readTime: 6,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Hollywood Strike Ends with Groundbreaking AI Usage Agreement",
        content: "The entertainment industry reaches a historic deal regarding AI use in film and television production. The agreement establishes new guidelines for AI-generated content while protecting actors' rights and establishing fair compensation structures for AI-assisted productions.",
        summary: "Entertainment industry reaches historic AI usage agreement, ending months-long strike with new protection guidelines...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://variety.com/hollywood-ai-agreement",
        sourceName: "Variety",
        category: "Entertainment",
        imageUrl: "https://images.unsplash.com/photo-1489599540877-b75e7b3e4522?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 260,
        readTime: 4,
        publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Revolutionary Cancer Treatment Shows 95% Success Rate",
        content: "A new immunotherapy treatment for aggressive forms of cancer has shown remarkable success in Phase III trials, with 95% of patients showing complete remission. The treatment combines cutting-edge gene therapy with personalized medicine approaches.",
        summary: "New immunotherapy treatment achieves 95% success rate in cancer trials, offering hope for aggressive forms...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://nejm.org/cancer-breakthrough",
        sourceName: "New England Journal of Medicine",
        category: "Health",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 340,
        readTime: 6,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Major Political Reform Bill Passes with Bipartisan Support",
        content: "Congress passes comprehensive electoral reform legislation with overwhelming bipartisan support, addressing voting rights, campaign finance, and redistricting. The bill represents the most significant political reform in decades and aims to strengthen democratic institutions.",
        summary: "Congress passes major electoral reform bill with bipartisan support, addressing voting rights and campaign finance...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://politico.com/reform-bill",
        sourceName: "Politico",
        category: "Politics",
        imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 290,
        readTime: 5,
        publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Electric Vehicle Sales Surpass Traditional Cars for First Time",
        content: "Electric vehicle sales have officially surpassed traditional gasoline-powered cars in global markets for the first time in automotive history. This milestone represents a fundamental shift in consumer preferences and accelerating adoption of sustainable transportation.",
        summary: "EV sales surpass traditional car sales globally for first time, marking historic shift in automotive industry...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://automotive-news.com/ev-milestone",
        sourceName: "Automotive News",
        category: "Business",
        imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 200,
        readTime: 4,
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      },
      {
        id: this.currentArticleId++,
        title: "Mars Mission Reveals Evidence of Ancient Microbial Life",
        content: "NASA's Perseverance rover has discovered compelling evidence of ancient microbial life on Mars, marking one of the most significant scientific discoveries in human history. The findings suggest that Mars once hosted conditions suitable for life and may have implications for understanding life's origin in the universe.",
        summary: "NASA rover discovers evidence of ancient microbial life on Mars, marking historic scientific breakthrough...",
        enhancedContent: null,
        audioUrl: null,
        sourceUrl: "https://nasa.gov/mars-life-discovery",
        sourceName: "NASA",
        category: "Science",
        imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        duration: 380,
        readTime: 7,
        publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
        createdAt: new Date(),
        isProcessed: false,
        metadata: null,
      }
    ];

    sampleArticles.forEach(article => this.articles.set(article.id, article as Article));

    // Add some sample favorites and history for the demo user
    const sampleFavorites = [1, 3, 6]; // Favorite article IDs
    sampleFavorites.forEach(articleId => {
      const favorite: Favorite = {
        id: this.currentFavoriteId++,
        userId: 1,
        articleId,
        createdAt: new Date(),
      };
      this.favorites.set(favorite.id, favorite);
    });

    // Add some listening history
    const historyArticles = [1, 2, 3, 4, 5];
    historyArticles.forEach((articleId, index) => {
      const history: ListeningHistory = {
        id: this.currentHistoryId++,
        userId: 1,
        articleId,
        progress: Math.random() * 100,
        completed: Math.random() > 0.5,
        listenedAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000),
      };
      this.listeningHistory.set(history.id, history);
    });

    // Initialize sample podcasts
    const samplePodcasts: Podcast[] = [
      {
        id: this.currentPodcastId++,
        title: "Tech Talk Daily",
        description: "Daily insights into the latest technology trends and breakthroughs",
        feedUrl: "https://feeds.example.com/tech-talk-daily",
        imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Technology",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.currentPodcastId++,
        title: "Health & Wellness Today",
        description: "Expert advice on health, wellness, and medical breakthroughs",
        feedUrl: "https://feeds.example.com/health-wellness",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Health",
        isActive: true,
        createdAt: new Date(),
      },
    ];
    samplePodcasts.forEach(podcast => this.podcasts.set(podcast.id, podcast));

    // Initialize sample live streams
    const sampleStreams: LiveStream[] = [
      {
        id: this.currentStreamId++,
        title: "Breaking News Live",
        description: "24/7 breaking news coverage",
        streamUrl: "https://stream.example.com/breaking-news",
        category: "Breaking",
        isLive: true,
        listeners: 1250,
        language: "en",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        createdAt: new Date(),
      },
      {
        id: this.currentStreamId++,
        title: "Tech News Radio",
        description: "Live technology news and discussions",
        streamUrl: "https://stream.example.com/tech-radio",
        category: "Technology",
        isLive: true,
        listeners: 890,
        language: "en",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        createdAt: new Date(),
      },
    ];
    sampleStreams.forEach(stream => this.liveStreams.set(stream.id, stream));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Article methods
  async getArticles(limit = 20, offset = 0, category?: string): Promise<Article[]> {
    let allArticles = Array.from(this.articles.values());
    
    if (category && category !== "All") {
      allArticles = allArticles.filter(article => article.category === category);
    }
    
    return allArticles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const article: Article = {
      ...insertArticle,
      id: this.currentArticleId++,
      createdAt: new Date(),
      isProcessed: false,
      enhancedContent: insertArticle.enhancedContent || null,
      audioUrl: insertArticle.audioUrl || null,
      imageUrl: insertArticle.imageUrl || null,
      duration: insertArticle.duration || null,
      readTime: insertArticle.readTime || null,
      metadata: insertArticle.metadata || null,
    };
    this.articles.set(article.id, article);
    return article;
  }

  async updateArticle(id: number, updates: Partial<Article>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updated = { ...article, ...updates };
    this.articles.set(id, updated);
    return updated;
  }

  async searchArticles(query: string, category?: string): Promise<Article[]> {
    const searchTerm = query.toLowerCase();
    let allArticles = Array.from(this.articles.values());
    
    if (category && category !== "All") {
      allArticles = allArticles.filter(article => article.category === category);
    }
    
    return allArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm)
    ).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getTrendingArticles(): Promise<Article[]> {
    // For demo purposes, return recent articles sorted by some engagement metric
    return Array.from(this.articles.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 6);
  }

  async getFeaturedArticles(): Promise<Article[]> {
    // Return the most recent articles as featured
    return Array.from(this.articles.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 3);
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<Article[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);
    
    const favoriteArticles: Article[] = [];
    for (const favorite of userFavorites) {
      const article = this.articles.get(favorite.articleId);
      if (article) {
        favoriteArticles.push(article);
      }
    }
    
    return favoriteArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const favorite: Favorite = {
      ...insertFavorite,
      id: this.currentFavoriteId++,
      createdAt: new Date(),
    };
    this.favorites.set(favorite.id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, articleId: number): Promise<boolean> {
    for (const [id, favorite] of Array.from(this.favorites.entries())) {
      if (favorite.userId === userId && favorite.articleId === articleId) {
        this.favorites.delete(id);
        return true;
      }
    }
    return false;
  }

  async isFavorite(userId: number, articleId: number): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(fav => fav.userId === userId && fav.articleId === articleId);
  }

  // Downloads methods
  async getUserDownloads(userId: number): Promise<Article[]> {
    const downloadedArticles: Article[] = [];
    Array.from(this.downloads).forEach(downloadKey => {
      const [downloadUserId, articleId] = downloadKey.split('-').map(Number);
      if (downloadUserId === userId) {
        const article = this.articles.get(articleId);
        if (article) {
          downloadedArticles.push(article);
        }
      }
    });
    return downloadedArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async addDownload(userId: number, articleId: number): Promise<boolean> {
    const downloadKey = `${userId}-${articleId}`;
    this.downloads.add(downloadKey);
    return true;
  }

  async removeDownload(userId: number, articleId: number): Promise<boolean> {
    const downloadKey = `${userId}-${articleId}`;
    return this.downloads.delete(downloadKey);
  }

  // Playlist methods
  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values())
      .filter(playlist => playlist.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const playlist: Playlist = {
      ...insertPlaylist,
      id: this.currentPlaylistId++,
      createdAt: new Date(),
      description: insertPlaylist.description || null,
      articleIds: insertPlaylist.articleIds || null,
    };
    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, updates: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const updated = { ...playlist, ...updates };
    this.playlists.set(id, updated);
    return updated;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    return this.playlists.delete(id);
  }

  async getPlaylistArticles(playlistId: number): Promise<Article[]> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist || !playlist.articleIds) return [];
    
    const articles: Article[] = [];
    for (const articleIdStr of playlist.articleIds) {
      const articleId = parseInt(articleIdStr);
      const article = this.articles.get(articleId);
      if (article) {
        articles.push(article);
      }
    }
    
    return articles;
  }

  // Listening history methods
  async getUserHistory(userId: number): Promise<Article[]> {
    const userHistory = Array.from(this.listeningHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.listenedAt.getTime() - a.listenedAt.getTime());
    
    const historyArticles: Article[] = [];
    const seenArticleIds = new Set<number>();
    
    for (const history of userHistory) {
      if (!seenArticleIds.has(history.articleId)) {
        const article = this.articles.get(history.articleId);
        if (article) {
          historyArticles.push(article);
          seenArticleIds.add(history.articleId);
        }
      }
    }
    
    return historyArticles;
  }

  async updateProgress(insertHistory: InsertListeningHistory): Promise<ListeningHistory> {
    // Find existing history entry
    const existing = Array.from(this.listeningHistory.values())
      .find(h => h.userId === insertHistory.userId && h.articleId === insertHistory.articleId);
    
    if (existing) {
      const updated = { ...existing, ...insertHistory, listenedAt: new Date() };
      this.listeningHistory.set(existing.id, updated);
      return updated;
    } else {
      const history: ListeningHistory = {
        ...insertHistory,
        id: this.currentHistoryId++,
        listenedAt: new Date(),
        progress: insertHistory.progress ?? null,
        completed: insertHistory.completed ?? null,
      };
      this.listeningHistory.set(history.id, history);
      return history;
    }
  }

  async getProgress(userId: number, articleId: number): Promise<ListeningHistory | undefined> {
    return Array.from(this.listeningHistory.values())
      .find(history => history.userId === userId && history.articleId === articleId);
  }

  // Podcast methods
  async getPodcasts(category?: string): Promise<Podcast[]> {
    const allPodcasts = Array.from(this.podcasts.values()).filter(p => p.isActive);
    return category ? allPodcasts.filter(p => p.category === category) : allPodcasts;
  }

  async getPodcast(id: number): Promise<Podcast | undefined> {
    return this.podcasts.get(id);
  }

  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const podcast: Podcast = {
      ...insertPodcast,
      id: this.currentPodcastId++,
      createdAt: new Date(),
    };
    this.podcasts.set(podcast.id, podcast);
    return podcast;
  }

  async getPodcastEpisodes(podcastId: number): Promise<PodcastEpisode[]> {
    return Array.from(this.podcastEpisodes.values())
      .filter(episode => episode.podcastId === podcastId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getEpisode(id: number): Promise<PodcastEpisode | undefined> {
    return this.podcastEpisodes.get(id);
  }

  async addPodcastEpisode(insertEpisode: InsertPodcastEpisode): Promise<PodcastEpisode> {
    const episode: PodcastEpisode = {
      ...insertEpisode,
      id: this.currentEpisodeId++,
      createdAt: new Date(),
    };
    this.podcastEpisodes.set(episode.id, episode);
    return episode;
  }

  // Share methods
  async shareContent(insertShare: InsertShare): Promise<Share> {
    const share: Share = {
      ...insertShare,
      id: this.currentShareId++,
      sharedAt: new Date(),
    };
    this.shares.set(share.id, share);
    return share;
  }

  async getUserShares(userId: number): Promise<Share[]> {
    return Array.from(this.shares.values())
      .filter(share => share.userId === userId)
      .sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
  }

  // Live stream methods
  async getLiveStreams(category?: string): Promise<LiveStream[]> {
    const allStreams = Array.from(this.liveStreams.values());
    return category ? allStreams.filter(s => s.category === category) : allStreams;
  }

  async getLiveStream(id: number): Promise<LiveStream | undefined> {
    return this.liveStreams.get(id);
  }

  async createLiveStream(insertStream: InsertLiveStream): Promise<LiveStream> {
    const stream: LiveStream = {
      ...insertStream,
      id: this.currentStreamId++,
      createdAt: new Date(),
    };
    this.liveStreams.set(stream.id, stream);
    return stream;
  }

  async updateStreamStatus(id: number, isLive: boolean, listeners?: number): Promise<LiveStream | undefined> {
    const stream = this.liveStreams.get(id);
    if (stream) {
      const updated = { ...stream, isLive, listeners: listeners ?? stream.listeners };
      this.liveStreams.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
