import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, Filter, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/lib/audio-context';
import { NEWS_CATEGORIES } from '@/types';
import type { Article } from '@/types';

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles', { category: selectedCategory }],
    enabled: !searchQuery, // Don't auto-fetch when searching
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<Article[]>({
    queryKey: ['/api/articles/search', { q: searchQuery, category: selectedCategory }],
    enabled: searchQuery.length > 2, // Only search after 3+ characters
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
      }).format(validDate);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const displayArticles = searchQuery.length > 2 ? searchResults : articles;
  const isLoadingData = searchQuery.length > 2 ? isSearching : isLoading;

  const filteredArticles = displayArticles?.filter(article => {
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesCategory;
  }) || [];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-radio-dark text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="h-4 bg-gray-800 rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-radio-surface rounded-lg p-4">
                  <div className="w-full h-48 bg-gray-800 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radio-dark text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Articles</h1>
          <p className="text-gray-400">
            Discover news articles across all categories
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-radio-surface text-white placeholder-gray-400 rounded-lg py-3 px-4 pl-12 w-full border border-gray-700 focus:ring-2 focus:ring-radio-yellow focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className={cn(
                selectedCategory === '' 
                  ? 'bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90' 
                  : 'border-gray-600 text-gray-300 hover:bg-radio-card'
              )}
            >
              All
            </Button>
            {NEWS_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  selectedCategory === category 
                    ? 'bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90' 
                    : 'border-gray-600 text-gray-300 hover:bg-radio-card'
                )}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-none",
                viewMode === 'grid' ? 'bg-radio-yellow text-radio-dark' : 'text-gray-400'
              )}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-none",
                viewMode === 'list' ? 'bg-radio-yellow text-radio-dark' : 'text-gray-400'
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            {selectedCategory && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Articles Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        )}>
          {filteredArticles.map((article) => (
            <Card 
              key={article.id} 
              className={cn(
                "bg-radio-surface border-gray-800 hover:border-radio-yellow/30 transition-colors group",
                viewMode === 'list' ? "flex-row" : ""
              )}
            >
              <CardContent className={cn(
                "p-0",
                viewMode === 'list' ? "flex items-center" : ""
              )}>
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    {article.imageUrl && (
                      <div className="relative">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => playArticle(article)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-radio-yellow transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {article.sourceName} • {article.readTime || 0} min read
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playArticle(article)}
                          className="text-radio-yellow hover:bg-radio-yellow/10"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center gap-4 p-4 w-full">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-radio-yellow transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {article.sourceName} • {article.readTime || 0} min read
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playArticle(article)}
                          className="text-radio-yellow hover:bg-radio-yellow/10"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No Articles Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try adjusting your search or browse different categories.
            </p>
            <Button 
              className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}