import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  Heart, 
  Download, 
  History, 
  Settings,
  Globe,
  Landmark,
  Cpu,
  TrendingUp,
  Award,
  Heart as HeartBeat,
  Film,
  FlaskRound,
  Mic,
  Share2,
  Radio
} from 'lucide-react';
import { useLocation } from 'wouter';
import { NEWS_CATEGORIES } from '@/types';

const categoryIcons = {
  "Breaking News": Globe,
  "Politics": Landmark,
  "Technology": Cpu,
  "Business": TrendingUp,
  "Sports": Award,
  "Health": HeartBeat,
  "Entertainment": Film,
  "Science": FlaskRound,
};

const categoryColors = {
  "Breaking News": 'text-yellow-400',
  "Politics": 'text-blue-400',
  "Technology": 'text-purple-400',
  "Business": 'text-green-400',
  "Sports": 'text-orange-400',
  "Health": 'text-red-400',
  "Entertainment": 'text-pink-400',
  "Science": 'text-cyan-400',
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose?.();
  };

  return (
    <aside className={cn(
      "w-64 bg-radio-surface border-r border-gray-800 p-4 transition-transform duration-300",
      "fixed lg:static inset-y-0 left-0 z-30",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <nav className="space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/')}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location.startsWith("/browse") 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/browse')}
        >
          <Search className="w-5 h-5" />
          <span>Browse</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location.startsWith("/search") 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/search')}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/favorites" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/favorites')}
        >
          <Heart className="w-5 h-5" />
          <span>Favorites</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/downloads" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/downloads')}
        >
          <Download className="w-5 h-5" />
          <span>Downloads</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/history" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/history')}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/podcasts" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/podcasts')}
        >
          <Mic className="w-5 h-5" />
          <span>Podcasts</span>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/live" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/live')}
        >
          <Radio className="w-5 h-5" />
          <span>Live Radio</span>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/social" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/social')}
        >
          <Share2 className="w-5 h-5" />
          <span>Social</span>
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-3 p-3 rounded-lg transition-colors",
            location === "/settings" 
              ? "bg-radio-yellow text-radio-dark font-medium" 
              : "text-gray-300 hover:bg-radio-card"
          )}
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Button>
      </nav>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          News Categories
        </h3>
        <nav className="space-y-1">
          {NEWS_CATEGORIES.map((category) => {
            const Icon = categoryIcons[category];
            const colorClass = categoryColors[category];
            
            return (
              <Button
                key={category}
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-3 p-2 rounded-lg transition-colors text-sm",
                  location === `/category/${category.toLowerCase()}` 
                    ? "bg-radio-card text-white" 
                    : "text-gray-300 hover:bg-radio-card"
                )}
                onClick={() => handleNavigation(`/category/${category.toLowerCase()}`)}
              >
                <Icon className={cn("w-4 h-4", colorClass)} />
                <span>{category}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
