import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/lib/audio-context";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { AudioPlayer } from "@/components/ui/audio-player";
import Home from "@/pages/home";
import Favorites from "@/pages/favorites";
import Category from "@/pages/category";
import Search from "@/pages/search";
import Settings from "@/pages/settings";
import Downloads from "@/pages/downloads";
import History from "@/pages/history";
import Browse from "@/pages/browse";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import Podcasts from "@/pages/podcasts";
import Social from "@/pages/social";
import Live from "@/pages/live";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/category/:category" component={Category} />
      <Route path="/search" component={Search} />
      <Route path="/browse" component={Browse} />
      <Route path="/settings" component={Settings} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/history" component={History} />
      <Route path="/podcasts" component={Podcasts} />
      <Route path="/live" component={Live} />
      <Route path="/social" component={Social} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={Notifications} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <div className="min-h-screen flex flex-col bg-radio-dark text-white">
            
            {/* Header */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            {/* Main Layout */}
            <main className="flex-1 flex relative">
              {/* Sidebar */}
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
              
              {/* Mobile Sidebar Overlay */}
              {sidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              
              {/* Content Area */}
              <div className="flex-1 min-w-0 pb-24 lg:pb-28">
                <Router />
              </div>
            </main>
            
            {/* Audio Player */}
            <AudioPlayer />
            
          </div>
          
          <Toaster />
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
