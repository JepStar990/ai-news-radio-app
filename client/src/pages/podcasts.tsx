import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Plus, Mic, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { useAudio } from '@/lib/audio-context';
import { Article } from '@/types';

interface Podcast {
  id: number;
  title: string;
  description: string;
  feedUrl: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export default function Podcasts() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { playArticle, pauseAudio, currentArticle, isPlaying } = useAudio();

  const { data: podcasts = [] } = useQuery<Podcast[]>({
    queryKey: ['/api/podcasts'],
  });

  const categories = ['all', ...Array.from(new Set(podcasts.map(p => p.category)))];

  const filteredPodcasts = selectedCategory === 'all' 
    ? podcasts 
    : podcasts.filter(p => p.category === selectedCategory);

  const handlePlayPodcast = (podcast: Podcast) => {
    // Convert podcast to article format for audio player
    const podcastAsArticle: Article = {
      id: podcast.id,
      title: podcast.title,
      content: podcast.description || '',
      summary: podcast.description || '',
      enhancedContent: null,
      audioUrl: null, // Would be set from feed
      sourceUrl: podcast.feedUrl,
      sourceName: podcast.title,
      category: podcast.category,
      imageUrl: podcast.imageUrl,
      duration: 1800, // 30 minutes default
      readTime: 30,
      publishedAt: new Date(podcast.createdAt),
      createdAt: new Date(podcast.createdAt),
      isProcessed: false,
      metadata: null,
    };
    
    if (isPlaying && currentArticle?.id === podcast.id) {
      pauseAudio();
    } else {
      playArticle(podcastAsArticle);
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-radio-yellow rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-radio-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Podcasts</h1>
                <p className="text-gray-400">Discover and listen to your favorite shows</p>
              </div>
            </div>
            <Button className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Podcast
            </Button>
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

        {/* Podcasts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPodcasts.map((podcast) => (
            <Card key={podcast.id} className="bg-radio-card border-gray-700 hover:border-gray-600 transition-all group">
              <CardContent className="p-0">
                {/* Podcast Image */}
                <div className="relative aspect-square">
                  <img
                    src={podcast.imageUrl}
                    alt={podcast.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90"
                      onClick={() => handlePlayPodcast(podcast)}
                    >
                      {isPlaying && currentArticle?.id === podcast.id ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Live indicator */}
                  {podcast.isActive && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        Active
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Podcast Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {podcast.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">
                    {podcast.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {podcast.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayPodcast(podcast)}
                      className="text-radio-yellow hover:text-radio-dark hover:bg-radio-yellow"
                    >
                      {isPlaying && currentArticle?.id === podcast.id ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPodcasts.length === 0 && (
          <Card className="bg-radio-card border-gray-700">
            <CardContent className="p-12 text-center">
              <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No podcasts found</h3>
              <p className="text-gray-400 mb-6">
                {selectedCategory === 'all' 
                  ? "No podcasts available yet." 
                  : `No podcasts found in the ${selectedCategory} category.`}
              </p>
              <Button className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Podcast
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}