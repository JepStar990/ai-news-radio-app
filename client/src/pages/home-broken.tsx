import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart, 
  Share2,
  Shuffle,
  Repeat,
  Mic,
  Radio,
  Settings,
  Download,
  List,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/lib/audio-context';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useVoiceCommands } from '@/hooks/use-voice-commands';
import type { Article } from '@/types';

export default function Home() {
  const {
    currentArticle,
    isPlaying,
    currentTime,
    duration,
    volume,
    pauseAudio,
    resumeAudio,
    skipNext,
    skipPrevious,
    setVolume,
    seekTo,
    formatTime,
    getProgressPercent,
    isBuffering,
    queue,
    queueIndex,
    playArticle,
    setQueue
  } = useAudioPlayer();

  const [location, setLocation] = useLocation();
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  // Disable voice commands temporarily to fix errors
  // const { isSupported: voiceSupported } = useVoiceCommands({
  //   enabled: showVoiceControl,
  // });

  // Fetch featured articles
  const { data: featuredArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles/featured'],
  });

  // Auto-start with featured articles
  useEffect(() => {
    if (featuredArticles && featuredArticles.length > 0 && !currentArticle) {
      setQueue(featuredArticles, 0);
      setIsLiveMode(true);
    }
  }, [featuredArticles, currentArticle, setQueue]);

  const handlePlayPause = () => {
    if (!currentArticle && featuredArticles?.length) {
      playArticle(featuredArticles[0]);
      setIsLiveMode(true);
    } else if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
    if (!isLiveMode && featuredArticles?.length) {
      setQueue(featuredArticles, 0);
      playArticle(featuredArticles[0]);
    }
  };

  const hasNext = queueIndex < queue.length - 1;
  const hasPrevious = queueIndex > 0;

  if (!currentArticle) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-radio-dark via-gray-900 to-radio-surface">
        <div className="text-center">
          <div className="w-20 h-20 bg-radio-yellow rounded-full flex items-center justify-center mx-auto mb-6">
            <Radio className="w-10 h-10 text-radio-dark" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to RadioAI</h2>
          <p className="text-gray-400 mb-6">Loading your personalized news radio experience...</p>
          <div className="animate-pulse flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-radio-yellow rounded-full"></div>
            <div className="w-2 h-2 bg-radio-yellow rounded-full animation-delay-200"></div>
            <div className="w-2 h-2 bg-radio-yellow rounded-full animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-radio-dark via-gray-900 to-radio-surface overflow-hidden">
      <div className="flex-1 flex flex-col justify-between p-6 max-h-screen">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full transition-all",
                isLiveMode 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-radio-card text-gray-400 hover:text-white"
              )}
              onClick={toggleLiveMode}
            >
              <Radio className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-radio-yellow">RadioAI</h1>
              <p className="text-sm text-gray-400">
                {isLiveMode ? "Live Radio" : "On Demand"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-colors",
                showVoiceControl 
                  ? "text-radio-yellow bg-radio-yellow/10 hover:bg-radio-yellow/20" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setShowVoiceControl(!showVoiceControl)}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
              onClick={() => setLocation('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
              onClick={() => {
                console.log('More options clicked');
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content Area - Article & Queue Side by Side */}
        <div className="flex-1 flex items-center justify-center gap-8 max-w-7xl mx-auto">
          
          {/* Current Article Section */}
          <div className="flex-1 flex flex-col items-center text-center max-w-2xl">
            
            {/* Large Article Image */}
            <div className="relative mb-8">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={currentArticle.imageUrl || '/placeholder-news.jpg'}
                  alt={currentArticle.title}
                  className="w-full h-full object-cover"
                />
                {isBuffering && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-radio-yellow border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
            </div>
            
            {/* Live Indicator */}
            {isLiveMode && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                LIVE
              </div>
            )}
          </div>

          {/* Article Info */}
          <div className="mb-8 max-w-lg">
            <Badge className="mb-3 bg-radio-yellow text-radio-dark font-medium">
              {currentArticle.category}
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              {currentArticle.title}
            </h2>
            <p className="text-gray-400 text-lg mb-2">
              {currentArticle.sourceName}
            </p>
            <p className="text-sm text-gray-500">
              Article {queueIndex + 1} of {queue.length}
            </p>
          </div>
          
          {/* Queue Display Section */}
          <div className="w-80 flex flex-col">
            <div className="bg-radio-card rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Up Next</h3>
                <Badge variant="secondary" className="bg-radio-yellow/20 text-radio-yellow">
                  {queue.length} items
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {queue.slice(queueIndex + 1, queueIndex + 6).map((article, index) => (
                  <div key={article.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-radio-surface/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={article.imageUrl || '/placeholder-news.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {article.sourceName}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {index + 1}
                    </span>
                  </div>
                ))}
                
                {queue.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No articles in queue</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="max-w-2xl mx-auto w-full">
          
          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[getProgressPercent()]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              onClick={skipPrevious}
              disabled={!hasPrevious}
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              size="icon"
              className="bg-radio-yellow text-radio-dark rounded-full w-16 h-16 hover:bg-yellow-400 transition-colors disabled:opacity-50"
              onClick={handlePlayPause}
              disabled={isBuffering}
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-radio-dark border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              onClick={skipNext}
              disabled={!hasNext}
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => {
                console.log('Repeat clicked');
              }}
            >
              <Repeat className="w-5 h-5" />
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-red-500"
                onClick={() => {
                  console.log('Toggle favorite for:', currentArticle?.title);
                }}
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  console.log('Download article:', currentArticle?.title);
                }}
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  console.log('Share article:', currentArticle?.title);
                }}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  console.log('Show queue/playlist');
                }}
              >
                <List className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <div className="w-20">
                  <Slider
                    value={[volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Control Indicator */}
        {showVoiceControl && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-radio-yellow text-radio-dark px-4 py-2 rounded-full text-sm font-medium">
            🎤 Voice control active - Try "Next story" or "Pause"
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
