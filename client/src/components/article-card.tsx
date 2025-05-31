import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Share2, Pause, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';
import { useAudio } from '@/lib/audio-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ArticleCardProps {
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

export function ArticleCard({ article, className }: ArticleCardProps) {
  const { currentArticle, isPlaying, playArticle, pauseAudio, resumeAudio } = useAudio();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isCurrentArticle = currentArticle?.id === article.id;
  const isCurrentlyPlaying = isCurrentArticle && isPlaying;

  // Check if article is favorited
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${article.id}/check`],
  });

  const isFavorited = (favoriteStatus as any)?.isFavorite || false;

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

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/downloads', { articleId: article.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
      toast({
        title: "Downloaded for offline use",
        description: article.title,
      });
    },
    onError: () => {
      toast({
        title: "Download failed",
        description: "Could not download article for offline use",
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.sourceUrl,
      });
    } else {
      navigator.clipboard.writeText(article.sourceUrl);
      toast({
        title: "Link copied",
        description: "Article link has been copied to clipboard.",
      });
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
    <Card className={cn(
      "bg-radio-card hover:bg-radio-surface transition-colors group cursor-pointer overflow-hidden",
      className
    )}>
      {article.imageUrl && (
        <div className="relative overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={cn(
            "text-white px-2 py-1 text-xs font-medium",
            categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-500'
          )}>
            {article.category}
          </Badge>
          
          <div className="flex items-center space-x-2">
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
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-radio-yellow hover:bg-radio-surface transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                downloadMutation.mutate();
              }}
              disabled={downloadMutation.isPending}
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-radio-yellow hover:bg-radio-surface transition-colors"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{article.sourceName}</span>
            <span>•</span>
            <span>{article.readTime} min read</span>
            <span>•</span>
            <span>{formatTimeAgo(new Date(article.publishedAt))}</span>
          </div>
          
          <Button
            size="icon"
            className={cn(
              "rounded-full transition-all duration-200",
              isCurrentlyPlaying 
                ? "bg-radio-yellow text-radio-dark hover:bg-yellow-400" 
                : "bg-radio-yellow text-radio-dark opacity-0 group-hover:opacity-100 hover:bg-yellow-400"
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
      </CardContent>
    </Card>
  );
}
