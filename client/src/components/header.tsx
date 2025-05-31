import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Bell,
  User,
  Menu,
  Radio,
  Zap,
  Settings,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export function Header({ onSearch, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 300000,
  });

  const unreadCount = Array.isArray(notificationsData) ? notificationsData.filter((n: any) => !n.read).length : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.(searchQuery.trim());
    }
  };

  return (
    <header className="bg-gradient-to-r from-radio-surface to-radio-card border-b border-gray-800 px-4 py-3 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left Section - Logo & Status */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-radio-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Radio className="w-5 h-5 text-radio-dark" />
            </div>
            {isLive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-radio-surface" />
            )}
          </div>

          <div className="cursor-pointer" onClick={() => setLocation('/')}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-radio-yellow to-yellow-400 bg-clip-text text-transparent">
              RadioAI
            </h1>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className={cn(
                "flex items-center space-x-1",
                isLive ? "text-red-400" : "text-gray-400"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isLive ? "bg-red-500 animate-pulse" : "bg-gray-400"
                )} />
                <span>{isLive ? "LIVE" : "ON DEMAND"}</span>
              </div>
              <span>•</span>
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Search breaking news, topics, sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-radio-card/50 text-white placeholder-gray-400 rounded-full py-2.5 px-4 pl-12 pr-16 w-full border border-gray-700 focus:ring-2 focus:ring-radio-yellow focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                type="submit"
                size="icon"
                className="w-7 h-7 bg-radio-yellow text-radio-dark rounded-full hover:bg-yellow-400 transition-colors"
              >
                <Search className="w-3 h-3" />
              </Button>
            </div>
          </form>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center space-x-2">

          {/* Live Status Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden md:flex rounded-full transition-colors",
              isLive
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "hover:bg-radio-card text-gray-300 hover:text-white"
            )}
            onClick={() => setIsLive(!isLive)}
          >
            <Zap className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-radio-card rounded-full text-gray-300 hover:text-radio-yellow transition-colors"
            onClick={() => {
              console.log('Notifications clicked');
              setLocation('/notifications');
            }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 text-white border-2 border-radio-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex hover:bg-radio-card rounded-full text-gray-300 hover:text-white transition-colors"
            onClick={() => setLocation('/settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-radio-card rounded-full text-gray-300 hover:text-white transition-colors"
            onClick={() => {
              console.log('Profile clicked');
              setLocation('/profile');
            }}
          >
            <User className="w-4 h-4" />
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-radio-card rounded-full text-gray-300 hover:text-white transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden mt-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-radio-card/50 text-white placeholder-gray-400 rounded-full py-2 px-4 pl-10 w-full border border-gray-700 focus:ring-2 focus:ring-radio-yellow focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </form>
      </div>
    </header>
  );
}
