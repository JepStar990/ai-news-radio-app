# Application Architecture

## Overview
This AI-powered news radio application follows a modern full-stack architecture with clear separation of concerns and scalable design patterns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Pages    │  │ Components  │  │    Hooks    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Audio Ctx   │  │ QueryClient │  │   Utils     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                             │ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │  │   Storage   │  │   OpenAI    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│               External Services                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   OpenAI    │  │ PostgreSQL  │  │ Live Streams│         │
│  │   API       │  │ Database    │  │   & Feeds   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend Architecture

#### State Management
- **React Context**: Used for global audio player state management
- **TanStack Query**: Server state management and caching
- **Local Storage**: User preferences and settings persistence

#### Component Structure
```
components/
├── ui/                    # Base UI components (Shadcn/ui)
│   ├── audio-player.tsx   # Main audio player component
│   ├── button.tsx         # Reusable button component
│   └── ...
├── header.tsx             # Navigation header
└── sidebar.tsx            # Navigation sidebar

pages/
├── home.tsx               # Main dashboard
├── podcasts.tsx           # Podcast discovery
├── social.tsx             # Social sharing
├── live.tsx               # Live radio streams
└── ...
```

#### Audio System Architecture
```
Audio Context Provider
├── State Management
│   ├── Current Article
│   ├── Queue Management
│   ├── Playback Status
│   └── Progress Tracking
├── Audio Controls
│   ├── Play/Pause
│   ├── Skip Forward/Back
│   ├── Volume Control
│   └── Seeking
└── Queue Operations
    ├── Add to Queue
    ├── Remove from Queue
    └── Reorder Queue
```

### Backend Architecture

#### API Structure
```
routes.ts
├── Articles API
│   ├── GET /api/articles
│   ├── GET /api/articles/featured
│   └── GET /api/articles/:id/audio
├── User Content API
│   ├── GET /api/favorites
│   ├── POST /api/favorites
│   └── DELETE /api/favorites/:id
├── New Features API
│   ├── GET /api/podcasts
│   ├── GET /api/live-streams
│   └── POST /api/shares
└── System API
    ├── GET /api/notifications
    └── POST /api/notifications/mark-read
```

#### Storage Layer
```
Storage Interface (IStorage)
├── User Methods
├── Article Methods
├── Favorites Methods
├── Downloads Methods
├── Playlist Methods
├── History Methods
├── Podcast Methods
├── Share Methods
└── Live Stream Methods

Memory Storage Implementation
├── In-Memory Maps for Data
├── Sample Data Initialization
└── CRUD Operations
```

#### AI Integration
```
OpenAI Service (openai.ts)
├── Content Enhancement
│   ├── Article Summarization
│   ├── Content Optimization
│   └── Smart Categorization
└── Audio Generation
    ├── Text-to-Speech
    ├── Voice Synthesis
    └── Audio Processing
```

## Data Flow

### Article Playback Flow
1. User selects article from UI
2. Frontend requests article details via API
3. Backend fetches article from storage
4. Audio generation requested from OpenAI
5. Audio URL returned to frontend
6. Audio player begins playback
7. Progress tracked in listening history

### New Features Flow

#### Podcast Integration
1. User navigates to Podcasts page
2. Frontend fetches podcast list via API
3. User selects podcast for playback
4. Podcast converted to article format
5. Integrated with main audio player

#### Social Sharing
1. User clicks share button on article
2. Frontend sends share request to API
3. Backend logs share activity
4. Platform-specific sharing handled
5. Share analytics updated

#### Live Streaming
1. User navigates to Live Radio page
2. Frontend fetches live stream list
3. Real-time listener counts displayed
4. User selects stream for playback
5. Live stream integrated with audio player

## Security Architecture

### API Security
- Input validation using Zod schemas
- Error handling with proper HTTP status codes
- Rate limiting considerations for AI API calls

### Client Security
- Environment variable protection
- Secure API key handling
- XSS prevention through React's built-in protections

## Performance Optimizations

### Frontend Performance
- React Query caching reduces API calls
- Component lazy loading for better initial load
- Optimized re-renders through proper React patterns
- Responsive design for all device types

### Backend Performance
- In-memory storage for fast development
- Efficient data structures (Maps, Sets)
- Minimal API response payloads
- Error boundary implementation

### Audio Performance
- Progressive audio loading
- Smart buffering strategies
- Seamless queue transitions
- Volume and seeking optimization

## Scalability Considerations

### Database Layer
- Drizzle ORM for type-safe database operations
- Schema-first development approach
- Migration support for production
- PostgreSQL compatibility

### Deployment Architecture
```
Production Environment
├── Frontend (Static Assets)
│   ├── CDN Distribution
│   ├── Gzip Compression
│   └── Cache Headers
├── Backend (Node.js Server)
│   ├── Process Management
│   ├── Load Balancing
│   └── Health Checks
└── External Services
    ├── Database Connection Pool
    ├── OpenAI API Integration
    └── Monitoring & Logging
```

## Technology Decisions

### Frontend Technology Choices
- **React**: Component-based architecture, excellent ecosystem
- **TypeScript**: Type safety, better developer experience
- **TanStack Query**: Powerful data fetching and caching
- **Tailwind CSS**: Utility-first styling, rapid development
- **Wouter**: Lightweight routing solution

### Backend Technology Choices
- **Express**: Minimal, flexible Node.js framework
- **TypeScript**: Shared types between frontend and backend
- **Drizzle ORM**: Type-safe, lightweight ORM
- **Zod**: Runtime type validation

### Development Workflow
- **Vite**: Fast development server and build tool
- **Hot Module Replacement**: Instant feedback during development
- **Shared Types**: Consistent data models across stack
- **Environment Variables**: Secure configuration management

## Future Architecture Considerations

### Potential Enhancements
- WebSocket integration for real-time features
- Redis caching layer for improved performance
- Microservices architecture for scale
- CDN integration for global distribution
- Advanced analytics and monitoring
- Progressive Web App (PWA) capabilities

### Monitoring & Observability
- Error tracking and reporting
- Performance monitoring
- User analytics
- API usage metrics
- Audio streaming quality metrics