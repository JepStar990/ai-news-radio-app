import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Volume2, 
  Mic, 
  Bell, 
  Download, 
  Radio,
  Moon,
  Sun,
  Globe,
  Shield,
  Smartphone,
  Headphones,
  Timer,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState('high');
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [autoSkip, setAutoSkip] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [backgroundPlay, setBackgroundPlay] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('yellow');
  
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('radioai-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setVoiceEnabled(settings.voiceEnabled ?? true);
        setNotifications(settings.notifications ?? true);
        setAutoPlay(settings.autoPlay ?? true);
        setDarkMode(settings.darkMode ?? true);
        setDownloadQuality(settings.downloadQuality ?? 'high');
        setVoiceSpeed(settings.voiceSpeed ?? [1.0]);
        setAutoSkip(settings.autoSkip ?? false);
        setLiveMode(settings.liveMode ?? true);
        setBackgroundPlay(settings.backgroundPlay ?? true);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Apply theme function
  const applyTheme = (theme: string) => {
    const themeColors = {
      yellow: '#fbbf24',
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      red: '#ef4444'
    };
    
    const color = themeColors[theme as keyof typeof themeColors] || themeColors.yellow;
    document.documentElement.style.setProperty('--radio-yellow', color);
    
    toast({
      title: "Theme Applied",
      description: `Switched to ${theme} theme`,
      variant: "success"
    });
  };

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      voiceEnabled,
      notifications,
      autoPlay,
      darkMode,
      downloadQuality,
      voiceSpeed,
      autoSkip,
      liveMode,
      backgroundPlay,
      selectedTheme
    };
    localStorage.setItem('radioai-settings', JSON.stringify(settings));
    
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [voiceEnabled, notifications, autoPlay, darkMode, downloadQuality, voiceSpeed, autoSkip, liveMode, backgroundPlay, selectedTheme]);

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-radio-yellow rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-radio-dark" />
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-gray-400">Customize your RadioAI experience</p>
      </div>

      <div className="space-y-6">
        
        {/* Audio Settings */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-radio-yellow" />
              <span>Audio Settings</span>
            </CardTitle>
            <CardDescription>Configure audio playback and quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-play next article</h4>
                <p className="text-sm text-gray-400">Automatically play the next article when current one ends</p>
              </div>
              <Switch
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Background playback</h4>
                <p className="text-sm text-gray-400">Continue playing when app is in background</p>
              </div>
              <Switch
                checked={backgroundPlay}
                onCheckedChange={setBackgroundPlay}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Playback speed</h4>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-12">0.5x</span>
                <Slider
                  value={voiceSpeed}
                  onValueChange={setVoiceSpeed}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-400 w-12">2.0x</span>
              </div>
              <p className="text-sm text-gray-400">Current: {voiceSpeed[0]}x</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Download quality</h4>
              <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                <SelectTrigger className="bg-radio-surface border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (32 kbps) - Save storage</SelectItem>
                  <SelectItem value="medium">Medium (64 kbps) - Balanced</SelectItem>
                  <SelectItem value="high">High (128 kbps) - Best quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Voice Control Settings */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-radio-yellow" />
              <span>Voice Control</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">New</Badge>
            </CardTitle>
            <CardDescription>Hands-free control with voice commands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable voice commands</h4>
                <p className="text-sm text-gray-400">Use "Hey Radio" to activate voice control</p>
              </div>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>

            {voiceEnabled && (
              <div className="bg-radio-surface p-4 rounded-lg border border-gray-600">
                <h5 className="font-medium mb-3">Available Commands</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-radio-yellow">"Play"</span>
                    <span className="text-gray-400">- Start playback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-radio-yellow">"Pause"</span>
                    <span className="text-gray-400">- Pause playback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-radio-yellow">"Next story"</span>
                    <span className="text-gray-400">- Skip to next article</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-radio-yellow">"Previous story"</span>
                    <span className="text-gray-400">- Go to previous article</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-radio-yellow">"Volume up/down"</span>
                    <span className="text-gray-400">- Adjust volume</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-radio-yellow">"Add to favorites"</span>
                    <span className="text-gray-400">- Save current article</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Radio Settings */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-radio-yellow" />
              <span>Live Radio</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Live</Badge>
            </CardTitle>
            <CardDescription>Configure live streaming and scheduled programming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Live mode by default</h4>
                <p className="text-sm text-gray-400">Start with live radio stream when opening app</p>
              </div>
              <Switch
                checked={liveMode}
                onCheckedChange={setLiveMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-skip silence</h4>
                <p className="text-sm text-gray-400">Skip long pauses in live broadcasts</p>
              </div>
              <Switch
                checked={autoSkip}
                onCheckedChange={setAutoSkip}
              />
            </div>

            <div className="bg-radio-surface p-4 rounded-lg border border-gray-600">
              <h5 className="font-medium mb-3 flex items-center space-x-2">
                <Timer className="w-4 h-4 text-radio-yellow" />
                <span>Scheduled Programming</span>
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Morning Briefing</span>
                  <span className="text-gray-400">6:00 AM - 9:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Tech News Hour</span>
                  <span className="text-gray-400">12:00 PM - 1:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Evening Wrap-up</span>
                  <span className="text-gray-400">6:00 PM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Late Night Deep Dive</span>
                  <span className="text-gray-400">10:00 PM - 12:00 AM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-radio-yellow" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Manage breaking news alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Breaking news alerts</h4>
                <p className="text-sm text-gray-400">Get notified about important breaking news</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {notifications && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h5 className="font-medium">Alert categories</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {['Breaking', 'Politics', 'Technology', 'Business'].map((category) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-radio-yellow bg-radio-surface border-gray-600 rounded focus:ring-radio-yellow"
                          defaultChecked
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-radio-yellow" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the app's look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dark mode</h4>
                <p className="text-sm text-gray-400">Use dark theme for better night listening</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <div className="bg-radio-surface p-4 rounded-lg border border-gray-600">
              <h5 className="font-medium mb-3">Theme Colors</h5>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[
                  { name: 'Yellow (Default)', color: 'bg-radio-yellow', value: 'yellow' },
                  { name: 'Blue', color: 'bg-blue-500', value: 'blue' },
                  { name: 'Green', color: 'bg-green-500', value: 'green' },
                  { name: 'Purple', color: 'bg-purple-500', value: 'purple' },
                  { name: 'Red', color: 'bg-red-500', value: 'red' }
                ].map((theme, index) => (
                  <button
                    key={theme.value}
                    className={`w-10 h-10 ${theme.color} rounded-full border-2 transition-all hover:scale-110 ${
                      index === 0 ? 'border-white' : 'border-gray-600 hover:border-gray-400'
                    }`}
                    title={theme.name}
                    onClick={() => {
                      setSelectedTheme(theme.value);
                      applyTheme(theme.value);
                    }}
                  />
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Background Opacity</span>
                  <span className="text-xs text-gray-400">90%</span>
                </div>
                <Slider
                  defaultValue={[90]}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Blur Effects</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-radio-yellow" />
              <span>Privacy & Data</span>
            </CardTitle>
            <CardDescription>Control your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export listening history
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Clear cache and downloads
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete all data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-radio-card border-gray-700">
          <CardHeader>
            <CardTitle>About RadioChat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Version 1.0.0</p>
              <p>AI-powered news radio with voice control</p>
              <p>Built with modern web technologies</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
