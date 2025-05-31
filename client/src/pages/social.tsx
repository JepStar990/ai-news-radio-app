import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Twitter, Facebook, Mail, Link, Copy, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Article, Playlist } from '@/types';

interface ShareItem {
  id: number;
  userId: number;
  articleId: number | null;
  playlistId: number | null;
  platform: string;
  sharedAt: string;
  article?: Article;
  playlist?: Playlist;
}

export default function Social() {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Article | Playlist | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentShares = [] } = useQuery<ShareItem[]>({
    queryKey: ['/api/shares'],
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles/featured'],
  });

  const shareMutation = useMutation({
    mutationFn: async ({ platform, articleId, playlistId }: { 
      platform: string; 
      articleId?: number; 
      playlistId?: number; 
    }) => {
      return await apiRequest('POST', '/api/shares', {
        platform,
        articleId: articleId || null,
        playlistId: playlistId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shares'] });
      toast({
        title: "Content shared successfully",
        description: "Your content has been shared to your selected platform"
      });
    }
  });

  const handleShare = (platform: string, item: Article | Playlist) => {
    const isArticle = 'content' in item;
    const shareData = {
      platform,
      ...(isArticle ? { articleId: item.id } : { playlistId: item.id })
    };

    if (platform === 'copy') {
      const url = `${window.location.origin}/${isArticle ? 'article' : 'playlist'}/${item.id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share link has been copied to your clipboard"
      });
      return;
    }

    shareMutation.mutate(shareData);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const shareDate = new Date(date);
    const diff = now.getTime() - shareDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const ShareButton = ({ platform, icon: Icon, label, item }: {
    platform: string;
    icon: any;
    label: string;
    item: Article | Playlist;
  }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleShare(platform, item)}
      className="flex items-center space-x-2 hover:bg-radio-yellow hover:text-radio-dark border-gray-600"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-radio-yellow rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-radio-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Social Sharing</h1>
              <p className="text-gray-400">Share your favorite content and connect with others</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shares */}
          <div className="lg:col-span-2">
            <Card className="bg-radio-card border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-radio-yellow" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentShares.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No shares yet</h3>
                    <p className="text-gray-400">Start sharing content to see your activity here</p>
                  </div>
                ) : (
                  recentShares.map((share) => (
                    <div key={share.id} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-radio-yellow/20 rounded-full flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-radio-yellow" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          You shared <span className="font-medium">
                            {share.article?.title || share.playlist?.name || 'Unknown content'}
                          </span> to <span className="text-radio-yellow">{share.platform}</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">{formatTimeAgo(share.sharedAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Share Popular Content */}
          <div>
            <Card className="bg-radio-card border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-radio-yellow" />
                  <span>Popular Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {articles.slice(0, 3).map((article) => (
                  <div key={article.id} className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white text-sm mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-1 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{article.readTime}m read</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <ShareButton
                        platform="twitter"
                        icon={Twitter}
                        label="Tweet"
                        item={article}
                      />
                      <ShareButton
                        platform="copy"
                        icon={Copy}
                        label="Copy"
                        item={article}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-radio-card border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Twitter className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Twitter</h3>
              <p className="text-2xl font-bold text-radio-yellow">
                {recentShares.filter(s => s.platform === 'twitter').length}
              </p>
              <p className="text-gray-400 text-sm">shares</p>
            </CardContent>
          </Card>

          <Card className="bg-radio-card border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Facebook className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-white mb-1">Facebook</h3>
              <p className="text-2xl font-bold text-radio-yellow">
                {recentShares.filter(s => s.platform === 'facebook').length}
              </p>
              <p className="text-gray-400 text-sm">shares</p>
            </CardContent>
          </Card>

          <Card className="bg-radio-card border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Email</h3>
              <p className="text-2xl font-bold text-radio-yellow">
                {recentShares.filter(s => s.platform === 'email').length}
              </p>
              <p className="text-gray-400 text-sm">shares</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}