import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/lib/audio-context';
import type { Article } from '@/types';

export default function History() {
  const { data: historyArticles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/history'],
  });

  const { playArticle } = useAudio();

  const formatDate = (date: Date | string) => {
    try {
      const validDate = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(validDate.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(validDate);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-radio-dark text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="h-4 bg-gray-800 rounded w-96"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-radio-surface rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radio-dark text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Listening History</h1>
          <p className="text-gray-400">
            Recently played articles and podcasts
          </p>
        </div>

        {/* History Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-radio-surface border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-radio-yellow" />
                <div>
                  <div className="text-2xl font-bold">{historyArticles?.length || 0}</div>
                  <p className="text-sm text-gray-400">Articles played</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-radio-surface border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">
                    {historyArticles ? formatDuration(historyArticles.reduce((acc, article) => acc + (article.readTime || 0), 0)) : '0m'}
                  </div>
                  <p className="text-sm text-gray-400">Total listening time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-radio-surface border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Play className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">Today</div>
                  <p className="text-sm text-gray-400">Last activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {historyArticles?.map((article) => (
            <Card key={article.id} className="bg-radio-surface border-gray-800 hover:border-radio-yellow/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Article Image */}
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{article.sourceName}</span>
                      <span>•</span>
                      <span>{formatDate(article.publishedAt)}</span>
                      <span>•</span>
                      <span>{article.readTime || 0} min</span>
                    </div>
                  </div>

                  {/* Category and Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className="text-gray-400 border-gray-600">
                      {article.category}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-radio-yellow hover:bg-radio-yellow/10"
                      title="Play Again"
                      onClick={() => playArticle(article)}
                    >
                      <Play className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar (mock progress for demonstration) */}
                <div className="mt-4 w-full bg-gray-800 rounded-full h-1">
                  <div 
                    className="bg-radio-yellow h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.random() * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )) || []}
        </div>

        {/* Empty State */}
        {(!historyArticles || historyArticles.length === 0) && !isLoading && (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No Listening History</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start listening to articles and they'll appear here for easy access.
            </p>
            <Button className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90">
              Explore Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}