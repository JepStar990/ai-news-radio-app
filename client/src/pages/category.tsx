import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { ArticleCard } from '@/components/article-card';
import { ArticleListItem } from '@/components/article-list-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, List } from 'lucide-react';
import { useState } from 'react';
import type { Article } from '@/types';
import { NEWS_CATEGORIES } from '@/types';

const categoryIcons = {
  breaking: '🌍',
  politics: '🏛️',
  technology: '💻',
  business: '📈',
  sports: '⚽',
  health: '❤️',
  entertainment: '🎬',
  science: '🔬',
};

const categoryColors = {
  breaking: 'bg-yellow-500',
  politics: 'bg-blue-500',
  technology: 'bg-purple-500',
  business: 'bg-green-500',
  sports: 'bg-orange-500',
  health: 'bg-red-500',
  entertainment: 'bg-pink-500',
  science: 'bg-cyan-500',
};

export default function Category() {
  const [match, params] = useRoute('/category/:category');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const categorySlug = params?.category || '';
  const category = NEWS_CATEGORIES.find(cat => 
    cat.toLowerCase() === categorySlug.toLowerCase()
  );

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles', { category }],
    queryFn: async () => {
      const response = await fetch(`/api/articles?category=${category}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
    enabled: !!category,
  });

  if (!match || !category) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
          <p className="text-gray-400">The requested category does not exist.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="w-32 h-8 mb-2" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="w-10 h-10" />
              <Skeleton className="w-10 h-10" />
            </div>
          </div>
          
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
        </div>
      </div>
    );
  }

  const categoryIcon = categoryIcons[categorySlug as keyof typeof categoryIcons];
  const categoryColor = categoryColors[categorySlug as keyof typeof categoryColors];

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{categoryIcon}</div>
            <div>
              <h1 className="text-3xl font-bold">{category} News</h1>
              <p className="text-gray-400">
                {articles?.length || 0} articles available
              </p>
            </div>
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

        {/* Category Badge */}
        <div className="mb-6">
          <Badge className={`${categoryColor} text-white px-4 py-2 text-sm font-medium`}>
            {category}
          </Badge>
        </div>

        {/* Content */}
        {!articles || articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{categoryIcon}</div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-400 mb-6">
              There are currently no articles available in the {category} category.
            </p>
            <Button
              className="bg-radio-yellow text-radio-dark hover:bg-yellow-400"
              onClick={() => window.history.back()}
            >
              Browse Other Categories
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
