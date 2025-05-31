import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Play, Pause, Volume2, Users, Clock, Globe } from 'lucide-react';
import { useState } from 'react';
import { useAudio } from '@/lib/audio-context';
import { Article } from '@/types';

interface LiveStream {
  id: number;
  title: string;
  description: string;
  streamUrl: string;
  category: string;
  isLive: boolean;
  listeners: number;
  language: string;
  imageUrl: string;
  createdAt: string;
}

export default function Live() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { playArticle, pauseAudio, currentArticle, isPlaying } = useAudio();

  const { data: streams = [] } = useQuery<LiveStream[]>({
    queryKey: ['/api/live-streams'],
  });

  const categories = ['all', ...Array.from(new Set(streams.map(s => s.category)))];
  const liveStreams = streams.filter(s => s.isLive);
  
  const filteredStreams = selectedCategory === 'all' 
    ? liveStreams 
    : liveStreams.filter(s => s.category === selectedCategory);

  const handlePlayStream = (stream: LiveStream) => {
    // Convert stream to article format for audio player
    const streamAsArticle: Article = {
      id: stream.id,
      title: stream.title,
      content: stream.description || '',
      summary: stream.description || '',
      enhancedContent: null,
      audioUrl: stream.streamUrl,
      sourceUrl: stream.streamUrl,
      sourceName: stream.title,
      category: stream.category,
      imageUrl: stream.imageUrl,
      duration: null, // Live streams don't have duration
      readTime: null,
      publishedAt: new Date(stream.createdAt),
      createdAt: new Date(stream.createdAt),
      isProcessed: true,
      metadata: { isLiveStream: true, listeners: stream.listeners },
    };
    
    if (isPlaying && currentArticle?.id === stream.id) {
      pauseAudio();
    } else {
      playArticle(streamAsArticle);
    }
  };

  const formatListeners = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Live Radio</h1>
              <p className="text-gray-400">Real-time news and talk radio stations</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>{liveStreams.length} live stations</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{streams.reduce((sum, s) => sum + s.listeners, 0).toLocaleString()} total listeners</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-radio-yellow text-radio-dark' : ''}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Live Streams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <Card key={stream.id} className="bg-radio-card border-gray-700 hover:border-red-500/50 transition-all group">
              <CardContent className="p-0">
                {/* Stream Image */}
                <div className="relative aspect-video">
                  <img
                    src={stream.imageUrl}
                    alt={stream.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  
                  {/* Live Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Live Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white border-0">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  </div>

                  {/* Listeners Count */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center space-x-1 bg-black/60 rounded-full px-2 py-1">
                      <Users className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">
                        {formatListeners(stream.listeners)}
                      </span>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-red-500 text-white hover:bg-red-600 border-0"
                      onClick={() => handlePlayStream(stream)}
                    >
                      {isPlaying && currentArticle?.id === stream.id ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                      {stream.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                      <Badge variant="secondary" className="text-xs">
                        {stream.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{stream.language.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {stream.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayStream(stream)}
                      className="text-red-400 hover:text-white hover:bg-red-500"
                    >
                      {isPlaying && currentArticle?.id === stream.id ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Listen
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Volume2 className="w-4 h-4" />
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStreams.length === 0 && (
          <Card className="bg-radio-card border-gray-700">
            <CardContent className="p-12 text-center">
              <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No live streams</h3>
              <p className="text-gray-400 mb-6">
                {selectedCategory === 'all' 
                  ? "No stations are currently broadcasting." 
                  : `No live stations found in the ${selectedCategory} category.`}
              </p>
              <p className="text-sm text-gray-500">Check back later for live content</p>
            </CardContent>
          </Card>
        )}

        {/* Currently Playing */}
        {isPlaying && currentArticle?.metadata?.isLiveStream && (
          <Card className="fixed bottom-6 right-6 w-80 bg-radio-card border-red-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm line-clamp-1">
                    {currentArticle.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Live</span>
                    <Users className="w-3 h-3" />
                    <span>{formatListeners(currentArticle.metadata?.listeners || 0)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pauseAudio}
                  className="text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}