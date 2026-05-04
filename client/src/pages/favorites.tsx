import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { isUserBackendAvailable } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { ArticleCard } from "@/components/article-card";
import { ArticleListItem } from "@/components/article-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Grid, List } from "lucide-react";
import { useState } from "react";
import type { Article } from "@/types";

export default function Favorites() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { isBackendAvailable, isAuthenticated } = useAuth();
  const useGo = isBackendAvailable && isAuthenticated;

  const queryKey = useGo ? ["/api/private/favorites"] : ["/api/favorites"];

  const { data, isLoading } = useQuery<any[]>({ queryKey });

  // Normalize data: Go backend returns UserFavorite records, Express returns Article[]
  const favorites = useGo
    ? (data || []).map((f: any) => ({
        id: f.ID || f.id,
        title: f.Title || f.ContentID || f.content_id || "Untitled",
        summary: f.ContentType || f.content_type || "",
        category: f.ContentType || f.content_type || "Unknown",
        sourceName: "",
        readTime: f.DurationSeconds || 0,
        imageUrl: null,
        audioUrl: null,
        publishedAt: f.CreatedAt || f.created_at || new Date().toISOString(),
      })) as Article[]
    : (data as Article[]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-32 h-8" />
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <h1 className="text-2xl font-bold">Your Favorites</h1>
            <span className="text-gray-400">{favorites?.length || 0} items</span>
          </div>
          <div className="flex bg-radio-card rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 ${viewMode === "grid" ? "bg-radio-yellow text-radio-dark" : "text-gray-400"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 ${viewMode === "list" ? "bg-radio-yellow text-radio-dark" : "text-gray-400"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!favorites || favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-radio-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-gray-400 mb-6">Articles you favorite will appear here</p>
            <Button className="bg-radio-yellow text-radio-dark hover:bg-yellow-400" onClick={() => window.history.back()}>
              Browse Articles
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
