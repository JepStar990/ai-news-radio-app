import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart, 
  List,
  Shuffle,
  Repeat,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  className?: string;
}

export function AudioPlayer({ className }: AudioPlayerProps) {
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
  } = useAudioPlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isFavorited, setIsFavorited] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async ({ articleId, action }: { articleId: number; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        return await apiRequest('POST', '/api/favorites', { articleId });
      } else {
        return await apiRequest('DELETE', `/api/favorites/${articleId}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      setIsFavorited(variables.action === 'add');
      toast({
        title: variables.action === 'add' ? "Added to Favorites" : "Removed from Favorites",
        description: currentArticle?.title
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  });

  if (!currentArticle) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
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
    const newVolume = value[0] / 100;
    setVolume(newVolume);
  };

  const handleToggleFavorite = () => {
    if (!currentArticle) return;
    
    const action = isFavorited ? 'remove' : 'add';
    favoriteMutation.mutate({ articleId: currentArticle.id, action });
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    toast({
      title: isShuffled ? "Shuffle Off" : "Shuffle On",
      description: "Queue playback order updated"
    });
  };

  const handleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    
    const modeLabels = { off: 'Off', all: 'All', one: 'One' };
    toast({
      title: `Repeat ${modeLabels[nextMode]}`,
      description: `Repeat mode: ${modeLabels[nextMode]}`
    });
  };

  const handleShowQueue = () => {
    if (queue.length === 0) {
      toast({
        title: "Queue is empty",
        description: "Add articles to your queue to see them here"
      });
      return;
    }
    
    const upcomingArticles = queue.slice(queueIndex + 1, queueIndex + 4);
    const queueInfo = upcomingArticles.length > 0 
      ? `Next: ${upcomingArticles.map(a => a.title).join(', ')}`
      : "No more articles in queue";
    
    toast({
      title: `Queue (${queue.length} articles)`,
      description: queueInfo
    });
  };

  const handleMoreOptions = () => {
    toast({
      title: "More Options",
      description: "Additional playback settings"
    });
  };

  const hasNext = queueIndex < queue.length - 1;
  const hasPrevious = queueIndex > 0;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-radio-surface border-t border-gray-800 p-4 z-50",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        


        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center space-x-3 text-xs text-gray-400 mb-1">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1">
              <Slider
                value={[getProgressPercent()]}
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="w-full cursor-pointer"
              />
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="flex items-center justify-between">
          
          {/* Currently Playing Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {currentArticle.imageUrl && (
              <img
                src={currentArticle.imageUrl}
                alt={currentArticle.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden">
                <h4 className="font-semibold text-white animate-marquee whitespace-nowrap">
                  {currentArticle.title}
                </h4>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm text-gray-400 animate-marquee whitespace-nowrap">
                  {currentArticle.sourceName} • {currentArticle.category}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden sm:flex w-8 h-8 hover:bg-radio-card transition-colors",
                isFavorited ? "text-red-500" : "text-gray-400 hover:text-radio-yellow"
              )}
              onClick={handleToggleFavorite}
              disabled={favoriteMutation.isPending}
            >
              <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
            </Button>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-4 mx-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              onClick={skipPrevious}
              disabled={!hasPrevious}
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              size="icon"
              className="bg-radio-yellow text-radio-dark rounded-full p-3 hover:bg-yellow-400 transition-colors disabled:opacity-50"
              onClick={handlePlayPause}
              disabled={isBuffering}
            >
              {isBuffering ? (
                <div className="w-5 h-5 border-2 border-radio-dark border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              onClick={skipNext}
              disabled={!hasNext}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                isShuffled && "text-radio-yellow"
              )}
              onClick={handleShuffle}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                repeatMode !== 'off' && "text-radio-yellow"
              )}
              onClick={handleRepeat}
            >
              <Repeat className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white transition-colors"
              onClick={handleShowQueue}
            >
              <List className="w-4 h-4" />
            </Button>
            
            <div 
              className="relative group"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowVolume(!showVolume)}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              
              {showVolume && (
                <div className="absolute bottom-full right-0 mb-2 bg-radio-surface border border-gray-700 rounded-lg p-3 shadow-xl z-50">
                  <div className="flex items-center space-x-3 min-w-[140px]">
                    <span className="text-xs text-gray-400 font-mono w-8">{Math.round(volume * 100)}%</span>
                    <div className="flex-1">
                      <Slider
                        value={[volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar (mobile) */}
        <div className="md:hidden mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1">
              <Slider
                value={[getProgressPercent()]}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <nav className="flex justify-around py-2 border-t border-gray-700">
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-radio-yellow">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
              </svg>
              <span className="text-xs">Radio</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs">Browse</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Favorites</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Downloads</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center space-y-1 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Settings</span>
            </Button>
          </nav>
        </div>

      </div>
    </div>
  );
}
