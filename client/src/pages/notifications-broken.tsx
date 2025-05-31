import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useAudio } from '@/lib/audio-context';
import { apiRequest } from '@/lib/queryClient';

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'trending'>('all');
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { playArticle } = useAudio();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest('POST', '/api/notifications/mark-read', { notificationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'trending') return notification.type === 'trending';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    notifications.forEach((n: any) => markAsRead(n.id.toString()));
    toast({
      title: "All notifications marked as read",
      description: `${notifications.length} notifications updated`
    });
  };

  const handleViewArticle = (article: Article) => {
    playArticle(article);
    toast({
      title: "Now Playing",
      description: article.title
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    try {
      const now = new Date();
      const notificationDate = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(notificationDate.getTime())) {
        return 'Unknown time';
      }
      
      const diff = now.getTime() - notificationDate.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-radio-yellow" />
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-radio-yellow text-radio-dark' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-radio-yellow text-radio-dark' : ''}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('trending')}
              className={filter === 'trending' ? 'bg-radio-yellow text-radio-dark' : ''}
            >
              Trending
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-radio-surface border-gray-800">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                <p className="text-gray-400">No new notifications at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className="bg-radio-surface border-gray-800 hover:bg-radio-card transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'trending' 
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {notification.type === 'trending' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-radio-yellow rounded-full" />
                        )}
                        <Badge variant="outline" className="text-xs border-gray-600">
                          {notification.article?.category || 'News'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(notification.time)}</span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-radio-yellow hover:bg-radio-yellow/10"
                          onClick={() => handleViewArticle(notification.article)}
                        >
                          View Article
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              className="border-gray-600 hover:bg-radio-card"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}