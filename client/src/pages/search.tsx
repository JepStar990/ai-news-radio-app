import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArticleCard } from '@/components/article-card';
import { ArticleListItem } from '@/components/article-list-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Grid, List, Filter } from 'lucide-react';
import type { Article } from '@/types';
import { NEWS_CATEGORIES } from '@/types';

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Parse query from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const q = params.get('q');
    const cat = params.get('category');
    
    if (q) setSearchQuery(q);
    if (cat) setCategory(cat);
  }, [searchParams]);

  const { data: searchResults, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles/search', { q: searchQuery, category: category !== 'All' ? category : undefined }],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        ...(category !== 'All' && { category }),
      });
      
      const response = await fetch(`/api/articles/search?${params}`);
      if (!response.ok) throw new Error('Failed to search articles');
      return response.json();
    },
    enabled: !!searchQuery.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        ...(category !== 'All' && { category }),
      });
      setLocation(`/search?${params}`);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        ...(newCategory !== 'All' && { category: newCategory }),
      });
      setLocation(`/search?${params}`);
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search News</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-radio-card text-white placeholder-gray-400 border-none focus:ring-2 focus:ring-radio-yellow pl-12 pr-4 py-3 text-lg"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Filters and View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              {showFilters && (
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48 bg-radio-card border-none">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {NEWS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-radio-card rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${
                  viewMode === 'grid'
                    ? 'bg-radio-yellow text-radio-dark'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${
                  viewMode === 'list'
                    ? 'bg-radio-yellow text-radio-dark'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {!searchQuery.trim() ? (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Search for news articles</h3>
            <p className="text-gray-400">
              Enter keywords to find articles across all categories
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-radio-card rounded-xl overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-radio-card rounded-xl p-4 flex items-center space-x-4">
                    <Skeleton className="w-24 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                {category !== 'All' && ` in ${category}`}
              </p>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((article) => (
                  <ArticleListItem key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or browse by category
            </p>
            <Button
              className="bg-radio-yellow text-radio-dark hover:bg-yellow-400"
              onClick={() => setLocation('/')}
            >
              Browse All Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
