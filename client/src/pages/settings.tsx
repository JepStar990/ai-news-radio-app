import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { isUserBackendAvailable, getSettings, updateSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_SETTINGS: Record<string, any> = {
  audio: { volume: 0.8, equalizer: "flat", crossfade: true, autoplay: true },
  voice: { language: "en", speed: 1.0, pitch: 1.0 },
  live_radio: { preferred_genre: "", explicit_filter: false, auto_play: false },
  notifications: { push_enabled: true, email_enabled: true },
  appearance: { theme: "dark", font_size: "medium" },
  privacy: { show_activity: true, show_favorites: true },
};

export default function SettingsPage() {
  const { isAuthenticated, isBackendAvailable } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const connected = isBackendAvailable && isAuthenticated;

  // Local state for UI controls
  const [autoPlay, setAutoPlay] = useState(true);
  const [backgroundPlay, setBackgroundPlay] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [autoSkip, setAutoSkip] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState("high");
  const [selectedTheme, setSelectedTheme] = useState("yellow");
  const [initialized, setInitialized] = useState(false);

  // Load from Go backend
  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ["/api/private/settings"],
    enabled: connected,
  });

  // Apply server settings once loaded
  useEffect(() => {
    if (connected && serverSettings && !initialized) {
      const s = serverSettings as Record<string, any>;
      const audio = s.audio || {};
      const voice = s.voice || {};
      const live = s.live_radio || {};
      const notif = s.notifications || {};
      const appearance = s.appearance || {};

      setAutoPlay(audio.autoplay ?? true);
      setVoiceSpeed([voice.speed ?? 1.0]);
      setVoiceEnabled(true);
      setNotifications(notif.push_enabled ?? true);
      setDarkMode(appearance.theme === "dark");
      setLiveMode(live.auto_play ?? true);
      setDownloadQuality("high");
      setSelectedTheme(appearance.theme === "light" ? "yellow" : "yellow");
      setBackgroundPlay(audio.autoplay ?? true);
      setAutoSkip(false);
      setInitialized(true);
    }
  }, [connected, serverSettings, initialized]);

  // Load from localStorage (fallback)
  useEffect(() => {
    if (!connected && !initialized) {
      const saved = localStorage.getItem("radioai-settings");
      if (saved) {
        try {
          const s = JSON.parse(saved);
          setVoiceEnabled(s.voiceEnabled ?? true);
          setNotifications(s.notifications ?? true);
          setAutoPlay(s.autoPlay ?? true);
          setDarkMode(s.darkMode ?? true);
          setDownloadQuality(s.downloadQuality ?? "high");
          setVoiceSpeed(s.voiceSpeed ?? [1.0]);
          setAutoSkip(s.autoSkip ?? false);
          setLiveMode(s.liveMode ?? true);
          setBackgroundPlay(s.backgroundPlay ?? true);
        } catch {}
      }
      setInitialized(true);
    }
  }, [connected, initialized]);

  // Save to localStorage (always, as local cache)
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(
      "radioai-settings",
      JSON.stringify({ voiceEnabled, notifications, autoPlay, darkMode, downloadQuality, voiceSpeed, autoSkip, liveMode, backgroundPlay, selectedTheme })
    );
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [voiceEnabled, notifications, autoPlay, darkMode, downloadQuality, voiceSpeed, autoSkip, liveMode, backgroundPlay]);

  // Mutation to push a section to Go backend
  const sectionMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: Record<string, any> }) => {
      return updateSettings(section, data);
    },
    onError: () => {
      toast({ title: "Sync Failed", description: "Could not save settings to server.", variant: "destructive" });
    },
  });

  const saveSection = (section: string, data: Record<string, any>) => {
    if (connected) {
      sectionMutation.mutate({ section, data });
    }
  };

  const applyTheme = (theme: string) => {
    const colors: Record<string, string> = {
      yellow: "#fbbf24",
      blue: "#3b82f6",
      green: "#10b981",
      purple: "#8b5cf6",
      red: "#ef4444",
    };
    const color = colors[theme] || colors.yellow;
    document.documentElement.style.setProperty("--radio-yellow", color);
    toast({ title: "Theme Applied", description: `Switched to ${theme} theme` });
  };

  if (isLoading && connected) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-radio-yellow rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-radio-dark" />
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
          {connected && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Synced</Badge>
          )}
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
                onCheckedChange={(v) => { setAutoPlay(v); saveSection("audio", { autoplay: v }); }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Background playback</h4>
                <p className="text-sm text-gray-400">Continue playing when app is in background</p>
              </div>
              <Switch checked={backgroundPlay} onCheckedChange={setBackgroundPlay} />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Playback speed</h4>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-12">0.5x</span>
                <Slider value={voiceSpeed} onValueChange={(v) => { setVoiceSpeed(v); saveSection("voice", { speed: v[0] }); }} max={2} min={0.5} step={0.1} className="flex-1" />
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
                  <SelectItem value="low">Low (32 kbps)</SelectItem>
                  <SelectItem value="medium">Medium (64 kbps)</SelectItem>
                  <SelectItem value="high">High (128 kbps)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Voice Control */}
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
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Live Radio */}
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
                onCheckedChange={(v) => { setLiveMode(v); saveSection("live_radio", { auto_play: v }); }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-skip silence</h4>
                <p className="text-sm text-gray-400">Skip long pauses in live broadcasts</p>
              </div>
              <Switch checked={autoSkip} onCheckedChange={setAutoSkip} />
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
                <h4 className="font-medium">Push notifications</h4>
                <p className="text-sm text-gray-400">Get notified about important breaking news</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={(v) => { setNotifications(v); saveSection("notifications", { push_enabled: v }); }}
              />
            </div>
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
                onCheckedChange={(v) => { setDarkMode(v); saveSection("appearance", { theme: v ? "dark" : "light" }); }}
              />
            </div>
            <div className="bg-radio-surface p-4 rounded-lg border border-gray-600">
              <h5 className="font-medium mb-3">Theme Colors</h5>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: "Yellow", color: "bg-radio-yellow", value: "yellow" },
                  { name: "Blue", color: "bg-blue-500", value: "blue" },
                  { name: "Green", color: "bg-green-500", value: "green" },
                  { name: "Purple", color: "bg-purple-500", value: "purple" },
                  { name: "Red", color: "bg-red-500", value: "red" },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    className={`w-10 h-10 ${theme.color} rounded-full border-2 transition-all hover:scale-110 ${
                      selectedTheme === theme.value ? "border-white" : "border-gray-600"
                    }`}
                    title={theme.name}
                    onClick={() => { setSelectedTheme(theme.value); applyTheme(theme.value); }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
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
                <Download className="w-4 h-4 mr-2" /> Export listening history
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
          <CardHeader><CardTitle>About RadioChat</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Version 1.0.0</p>
              <p>AI-powered news radio with voice control</p>
              {connected && <p className="text-green-400">Connected to user profile service</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
