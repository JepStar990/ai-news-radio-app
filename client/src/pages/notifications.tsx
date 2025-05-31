import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useAudio } from '@/lib/audio-context';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  articleId: number;
}

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'trending'>('all');
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { playArticle } = useAudio();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
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

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'trending') return notification.type === 'trending';
    return true;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const handleMarkAllAsRead = () => {
    notifications.forEach((n: Notification) => markAsRead(n.id.toString()));
    toast({
      title: "All notifications marked as read",
      description: `${notifications.length} notifications updated`
    });
  };

  const handleViewArticle = (articleId: number) => {
    setLocation(`/browse`);
    toast({
      title: "Opening article",
      description: "Redirecting to browse page"
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-radio-yellow rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-radio-dark" />
            </div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-gray-400">Stay updated with the latest news and alerts</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-radio-yellow text-radio-dark' : ''}
            >
              All ({notifications.length})
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
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-radio-yellow border-radio-yellow hover:bg-radio-yellow hover:text-radio-dark"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-radio-card border-gray-700">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No notifications</h3>
                <p className="text-gray-400">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : filter === 'trending'
                    ? "No trending notifications right now."
                    : "No notifications available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <Card 
                key={notification.id} 
                className={`bg-radio-card border-gray-700 hover:border-gray-600 transition-colors cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-radio-yellow' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id.toString());
                  }
                  handleViewArticle(notification.articleId);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'breaking' ? 'bg-red-500/20 text-red-400' :
                      notification.type === 'trending' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {notification.type === 'breaking' ? <AlertCircle className="w-5 h-5" /> :
                       notification.type === 'trending' ? <TrendingUp className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white flex items-center space-x-2">
                          <span>{notification.title}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-radio-yellow rounded-full" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(notification.timestamp)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            notification.type === 'breaking' ? 'bg-red-500/20 text-red-400' :
                            notification.type === 'trending' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {notification.type}
                        </Badge>
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id.toString());
                            }}
                            className="text-radio-yellow hover:text-radio-dark hover:bg-radio-yellow"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}