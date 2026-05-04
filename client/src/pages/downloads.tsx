import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { isUserBackendAvailable } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Play, Trash2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/lib/audio-context";
import type { Article } from "@/types";

export default function Downloads() {
  const { isBackendAvailable, isAuthenticated } = useAuth();
  const useGo = isBackendAvailable && isAuthenticated;

  const queryKey = useGo ? ["/api/private/downloads"] : ["/api/downloads"];

  const { data, isLoading } = useQuery<any[]>({ queryKey });

  const downloadedArticles = useGo
    ? ((data as any)?.downloads || data || []).map((d: any) => ({
        id: d.ID || d.id || String(d.ContentID || d.content_id || "0"),
        title: d.Title || d.ContentID || d.content_id || "Untitled",
        summary: d.ContentType || d.content_type || "",
        category: d.ContentType || d.content_type || "Unknown",
        sourceName: "",
        readTime: d.DurationSeconds || 0,
        imageUrl: null,
        audioUrl: null,
        publishedAt: d.CreatedAt || d.created_at || new Date().toISOString(),
      })) as Article[]
    : (data as Article[]);

  const { playArticle } = useAudio();

  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
    } catch {
      return "";
    }
  };

  const formatFileSize = (minutes: number | null) => {
    if (!minutes) return "0 KB";
    const sizeMB = minutes * 1.2;
    return sizeMB < 1 ? `${(sizeMB * 1024).toFixed(0)} KB` : `${sizeMB.toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-radio-dark text-white p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-6" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radio-dark text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Downloaded Articles</h1>
          <p className="text-gray-400">Listen to your downloaded content offline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-radio-surface border-gray-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-400">Total Downloads</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-radio-yellow">{downloadedArticles?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-radio-surface border-gray-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-400">Storage Used</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {downloadedArticles?.reduce((acc, a) => acc + ((a.readTime || 0) * 1.2), 0).toFixed(1) || "0"} MB
              </div>
            </CardContent>
          </Card>
          <Card className="bg-radio-surface border-gray-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-400">Last Download</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-400">Today</div></CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {downloadedArticles?.map((article) => (
            <Card key={article.id} className="bg-radio-surface border-gray-800 hover:border-radio-yellow/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {article.imageUrl && (
                    <img src={article.imageUrl} alt={article.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{article.sourceName}</span>
                      <span>{formatDate(article.publishedAt)}</span>
                      <span>{article.readTime || 0} min</span>
                      <span>{formatFileSize(article.readTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" /> Downloaded
                    </Badge>
                    <Badge variant="outline" className="text-gray-400 border-gray-600">{article.category}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="text-radio-yellow hover:bg-radio-yellow/10" onClick={() => playArticle(article)}>
                    <Play className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) || []}
        </div>

        {(!downloadedArticles || downloadedArticles.length === 0) && !isLoading && (
          <div className="text-center py-16">
            <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No Downloads Yet</h3>
            <p className="text-gray-500 mb-6">Download articles to listen offline.</p>
            <Button className="bg-radio-yellow text-radio-dark hover:bg-radio-yellow/90">Browse Articles</Button>
          </div>
        )}
      </div>
    </div>
  );
}
