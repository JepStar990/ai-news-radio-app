import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';
import { useAudio } from '@/lib/audio-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ArticleListItemProps {
  article: Article;
  className?: string;
}

const categoryColors = {
  Breaking: 'bg-yellow-500',
  Politics: 'bg-blue-500',
  Technology: 'bg-purple-500',
  Business: 'bg-green-500',
  Sports: 'bg-orange-500',
  Health: 'bg-red-500',
  Entertainment: 'bg-pink-500',
  Science: 'bg-cyan-500',
};

export function ArticleListItem({ article, className }: ArticleListItemProps) {
  const { currentArticle, isPlaying, playArticle, pauseAudio, resumeAudio } = useAudio();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isCurrentArticle = currentArticle?.id === article.id;
  const isCurrentlyPlaying = isCurrentArticle && isPlaying;

  // Check if article is favorited
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${article.id}/check`],
  });

  const isFavorited = favoriteStatus?.isFavorite || false;

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/favorites', { articleId: article.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${article.id}/check`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: "Article has been added to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add article to favorites.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/favorites/${article.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${article.id}/check`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Article has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to remove article from favorites.",
        variant: "destructive",
      });
    },
  });

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentArticle) {
      if (isPlaying) {
        pauseAudio();
      } else {
        resumeAudio();
      }
    } else {
      playArticle(article);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <article className={cn(
      "bg-radio-card rounded-xl p-4 hover:bg-radio-surface transition-colors cursor-pointer flex items-center space-x-4",
      className
    )}>
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <Badge className={cn(
            "text-white px-2 py-1 text-xs font-medium",
            categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-500'
          )}>
            {article.category}
          </Badge>
          <span className="text-xs text-gray-500">
            {article.sourceName} • {formatTimeAgo(new Date(article.publishedAt))}
          </span>
        </div>
        
        <h3 className="font-semibold mb-1 truncate">
          {article.title}
        </h3>
        
        <p className="text-sm text-gray-400 line-clamp-2">
          {article.summary}
        </p>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className="text-xs text-gray-500">
          {article.readTime} min
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-8 h-8 hover:bg-radio-surface transition-colors",
            isFavorited ? "text-red-500" : "text-gray-400 hover:text-radio-yellow"
          )}
          onClick={handleFavoriteToggle}
          disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
        >
          <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
        </Button>
        
        <Button
          size="icon"
          className={cn(
            "rounded-full transition-colors",
            isCurrentlyPlaying 
              ? "bg-radio-yellow text-radio-dark hover:bg-yellow-400" 
              : "bg-radio-yellow text-radio-dark hover:bg-yellow-400"
          )}
          onClick={handlePlayPause}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
      </div>
    </article>
  );
}
