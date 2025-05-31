import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Play, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/lib/audio-context';
import type { Article } from '@/types';

export default function Downloads() {
  const { data: downloadedArticles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/downloads'],
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
        year: 'numeric'
      }).format(validDate);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatFileSize = (minutes: number | null) => {
    if (!minutes) return '0 KB';
    const sizeMB = minutes * 1.2;
    return sizeMB < 1 ? `${(sizeMB * 1024).toFixed(0)} KB` : `${sizeMB.toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-radio-dark text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="h-4 bg-gray-800 rounded w-96"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-radio-surface rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-800 rounded-lg"></div>
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Downloaded Articles</h1>
          <p className="text-gray-400">
            Listen to your downloaded content offline
          </p>
        </div>

        {/* Download Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-radio-surface border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-radio-yellow">{downloadedArticles?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Articles available offline</p>
            </CardContent>
          </Card>

          <Card className="bg-radio-surface border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {downloadedArticles?.reduce((acc, article) => acc + ((article.readTime || 0) * 1.2), 0).toFixed(1) || '0'} MB
              </div>
              <p className="text-xs text-gray-500 mt-1">of downloaded content</p>
            </CardContent>
          </Card>

          <Card className="bg-radio-surface border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Last Download</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Today</div>
              <p className="text-xs text-gray-500 mt-1">Most recent download</p>
            </CardContent>
          </Card>
        </div>

        {/* Downloaded Articles List */}
        <div className="space-y-4">
          {downloadedArticles?.map((article) => (
            <Card key={article.id} className="bg-radio-surface border-gray-800 hover:border-radio-yellow/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Article Image */}
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
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
                          <span>•</span>
                          <span>{formatFileSize(article.readTime)}</span>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Downloaded
                        </Badge>
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-radio-yellow hover:bg-radio-yellow/10"
                      title="Play Article"
                      onClick={() => playArticle(article)}
                    >
                      <Play className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                      title="Delete Download"
                      onClick={() => {
                        console.log('Delete download:', article.title);
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || []}
        </div>

        {/* Empty State */}
        {(!downloadedArticles || downloadedArticles.length === 0) && !isLoading && (
          <div className="text-center py-16">
            <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No Downloads Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Download articles to listen offline. Look for the download button on any article.
            </p>
            <Button className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90">
              Browse Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}