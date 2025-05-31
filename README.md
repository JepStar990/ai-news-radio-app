# AI-Powered News Radio Application

A modern, AI-enhanced news radio platform that transforms text articles into immersive audio experiences with podcast integration, social sharing, and live streaming capabilities.

## 🚀 Features

### Core Functionality
- **AI-Powered Audio Conversion**: Transform news articles into natural-sounding speech using OpenAI's text-to-speech API
- **Smart Content Enhancement**: AI-generated summaries and enhanced article content
- **Intelligent Categorization**: Automatic news categorization across 8 major topics
- **Advanced Audio Player**: Full-featured player with queue management, progress tracking, and volume controls

### Content Discovery
- **Featured Articles**: Curated trending news with AI-enhanced readability
- **Category Browsing**: Browse news by Politics, Technology, Business, Sports, Health, Science, Entertainment, and Breaking News
- **Advanced Search**: Find articles with intelligent filtering and sorting
- **Personalized Recommendations**: Smart content suggestions based on listening history

### Audio Experience
- **Seamless Playback**: Continuous audio streaming with smart queue management
- **Progress Tracking**: Resume articles where you left off
- **Volume Control**: Precise audio level management with visual feedback
- **Seeking Controls**: Navigate through audio content with precision timeline
- **Animated Text Display**: Marquee animation for long titles and descriptions

### New Features
- **Podcast Integration**: 
  - Discover and subscribe to podcasts across multiple categories
  - Integrated feed management with active status tracking
  - Seamless playback through the main audio player
  
- **Social Sharing**: 
  - Share articles and playlists to Twitter, Facebook, and email
  - Copy direct links for easy sharing
  - Track sharing activity and platform statistics
  
- **Live Radio Streaming**: 
  - Real-time news radio stations with live indicators
  - Listener count tracking and category filtering
  - Visual live badges with animated elements

### Personal Library
- **Favorites Management**: Save and organize preferred articles
- **Download Queue**: Offline access to important content
- **Listening History**: Track your audio consumption with detailed progress
- **Custom Playlists**: Create personalized content collections

### User Experience
- **Dark Mode**: Professional dark theme optimized for extended use
- **Theme Customization**: 5 color schemes (Blue, Green, Purple, Orange, Pink)
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Real-time Notifications**: Stay updated with breaking news and system alerts
- **Glassmorphism UI**: Modern toast notifications with backdrop blur effects

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for robust component development
- **Wouter** for efficient client-side routing
- **TanStack Query** for intelligent data fetching and caching
- **Tailwind CSS** for responsive, utility-first styling
- **Shadcn/ui** components for consistent design system
- **Framer Motion** for smooth animations and transitions

### Backend
- **Node.js** with Express for scalable server architecture
- **TypeScript** for type-safe backend development
- **Drizzle ORM** for database schema management
- **Zod** for runtime data validation
- **PostgreSQL** support with in-memory storage for development

### AI Integration
- **OpenAI GPT-4o** for content enhancement and summarization
- **OpenAI TTS** for high-quality audio generation
- **Smart categorization** using advanced language models

### Development Tools
- **Vite** for fast development and optimized builds
- **ESLint** and **Prettier** for code quality
- **TypeScript** for enhanced developer experience

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news-radio-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=your_database_url_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # Base UI components (buttons, cards, etc.)
│   │   │   ├── header.tsx      # Main navigation header
│   │   │   └── sidebar.tsx     # Navigation sidebar
│   │   ├── pages/              # Application pages
│   │   │   ├── home.tsx        # Main dashboard
│   │   │   ├── podcasts.tsx    # Podcast discovery and management
│   │   │   ├── social.tsx      # Social sharing interface
│   │   │   ├── live.tsx        # Live radio streaming
│   │   │   └── ...             # Other pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility libraries
│   │   │   ├── audio-context.tsx    # Audio player state management
│   │   │   └── queryClient.ts       # API client configuration
│   │   └── App.tsx             # Main application component
├── server/
│   ├── index.ts                # Express server entry point
│   ├── routes.ts               # API route definitions
│   ├── storage.ts              # Data storage abstraction
│   ├── openai.ts               # AI integration services
│   └── vite.ts                 # Vite integration
├── shared/
│   └── schema.ts               # Shared type definitions
└── README.md                   # This file
```

## 🎵 Audio Player Features

### Core Controls
- **Play/Pause**: Start or stop audio playback
- **Skip Forward/Backward**: Navigate through your queue
- **Progress Seeking**: Jump to any point in the audio timeline
- **Volume Control**: Adjust audio levels with precise control
- **Queue Management**: View and manage upcoming articles

### Advanced Features
- **Continuous Playback**: Seamless transitions between articles
- **Resume Functionality**: Pick up where you left off
- **Animated Text**: Long titles scroll smoothly for full readability
- **Smart Buffering**: Intelligent preloading for uninterrupted listening
- **Visual Feedback**: Real-time progress and status indicators

## 🎙 Podcast Integration

### Features
- **Feed Discovery**: Browse podcasts across multiple categories
- **Subscription Management**: Track active and inactive podcast feeds
- **Episode Playback**: Full integration with the main audio player
- **Category Filtering**: Find podcasts by topic (Technology, Health, etc.)
- **Visual Indicators**: Clear active/inactive status for all feeds

### Sample Podcasts
- **Tech Talk Daily**: Technology trends and breakthroughs
- **Health & Wellness Today**: Medical insights and wellness advice

## 📡 Live Radio Streaming

### Features
- **Real-time Streams**: Live news radio with current listener counts
- **Category Selection**: Filter streams by news category
- **Live Indicators**: Animated badges showing broadcast status
- **Listener Analytics**: See real-time audience engagement
- **Stream Quality**: High-quality audio streaming

### Available Streams
- **Breaking News Live**: 24/7 breaking news coverage
- **Tech News Radio**: Technology-focused live discussions

## 🌐 Social Sharing

### Platforms
- **Twitter**: Quick sharing with automatic hashtags
- **Facebook**: Rich previews and engagement tracking
- **Email**: Direct article sharing via email
- **Direct Links**: Copy-to-clipboard functionality

### Analytics
- **Share Tracking**: Monitor your sharing activity
- **Platform Statistics**: See performance across different social networks
- **Activity Feed**: Review recent sharing history

## 🎨 Customization

### Theme Options
Choose from 5 carefully crafted color schemes:
- **Classic Blue**: Professional and calming
- **Nature Green**: Fresh and organic
- **Royal Purple**: Elegant and sophisticated
- **Sunset Orange**: Warm and energetic
- **Cherry Pink**: Modern and vibrant

### Settings Persistence
- **Local Storage**: Your preferences are saved automatically
- **Cross-session**: Settings persist between browser sessions
- **Instant Application**: Changes take effect immediately

## 📱 Responsive Design

The application is fully optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Touch-optimized interface with gesture support

## 🔧 API Documentation

### Article Endpoints
- `GET /api/articles` - Fetch articles with pagination and filtering
- `GET /api/articles/featured` - Get featured/trending articles
- `GET /api/articles/trending` - Get trending articles
- `GET /api/articles/:id` - Get specific article details

### Audio & Playback
- `GET /api/history` - User's listening history
- `POST /api/history/progress` - Update playback progress
- `GET /api/history/:articleId/progress` - Get article progress

### User Content
- `GET /api/favorites` - User's favorite articles
- `POST /api/favorites` - Add article to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### New Endpoints
- `GET /api/podcasts` - Fetch available podcasts
- `GET /api/shares` - User's sharing history
- `POST /api/shares` - Share content to social platforms
- `GET /api/live-streams` - Available live radio streams

## 🤖 AI Integration

### OpenAI Services
The application leverages multiple OpenAI models:

1. **Content Enhancement** (GPT-4o)
   - Article summarization
   - Content optimization for audio
   - Smart categorization

2. **Text-to-Speech**
   - High-quality voice synthesis
   - Natural speech patterns
   - Optimized for news content

### Configuration
Ensure your OpenAI API key has access to:
- GPT-4o model for text processing
- TTS-1 model for audio generation

## 🔒 Environment Variables

Required environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # Your OpenAI API key

# Database Configuration  
DATABASE_URL=postgresql://...            # PostgreSQL connection string

# Development Settings
NODE_ENV=development                     # Environment mode
PORT=5000                               # Server port (optional)
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Configure PostgreSQL database
- [ ] Set up OpenAI API access
- [ ] Configure domain and SSL
- [ ] Test all audio playback features
- [ ] Verify social sharing functionality

## 🐛 Troubleshooting

### Common Issues

**Audio not playing:**
- Verify OpenAI API key is set and valid
- Check browser audio permissions
- Ensure TTS API access is enabled

**API errors:**
- Confirm all environment variables are set
- Check database connectivity
- Verify OpenAI API quota and billing

**Build failures:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for powerful AI integration
- **Unsplash** for high-quality images
- **Shadcn/ui** for excellent component library
- **TailwindCSS** for flexible styling system

---

**Built with ❤️ for the future of news consumption**