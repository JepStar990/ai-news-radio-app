import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  isUserBackendAvailable,
  getProfile,
  updateProfile,
  changePassword,
  getFavorites,
  getDownloads,
  getHistory,
} from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  User,
  Settings,
  Heart,
  Clock,
  Download,
  Headphones,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isBackendAvailable, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Go-backend mode: fetch real data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/private/profile"],
    enabled: isBackendAvailable && isAuthenticated,
  });

  const { data: favData } = useQuery({
    queryKey: ["/api/private/favorites"],
    enabled: isBackendAvailable && isAuthenticated,
  });

  const { data: dlData } = useQuery({
    queryKey: ["/api/private/downloads"],
    enabled: isBackendAvailable && isAuthenticated,
  });

  const { data: histData } = useQuery({
    queryKey: ["/api/private/history"],
    enabled: isBackendAvailable && isAuthenticated,
  });

  // Get counts - from Go backend or fallback to hardcoded
  const favCount = isBackendAvailable && Array.isArray(favData)
    ? favData.length
    : 32;
  const dlCount = isBackendAvailable && Array.isArray(dlData)
    ? dlData.length
    : 8;
  const histCount = isBackendAvailable && Array.isArray(histData)
    ? histData.length
    : 147;

  const profile = (profileData as any) || {};
  const displayName =
    user?.fullName || profile.full_name || user?.username || "Radio Listener";
  const displayEmail = user?.email || "listener@radioai.com";
  const avatarUrl = user?.avatarUrl || profile.avatar_url || "";
  const bio = user?.bio || profile.bio || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Edit profile dialog
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (isBackendAvailable) {
        return updateProfile(editName, editBio);
      }
      return null;
    },
    onSuccess: () => {
      setIsEditing(false);
      refreshProfile();
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  // Password change dialog
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const pwMutation = useMutation({
    mutationFn: async () => changePassword(oldPw, newPw),
    onSuccess: () => {
      setIsChangingPw(false);
      setOldPw("");
      setNewPw("");
      toast({ title: "Password Changed", description: "Your password has been updated." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to change password.", variant: "destructive" });
    },
  });

  // Avatar upload
  const [uploading, setUploading] = useState(false);
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isBackendAvailable) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("radioai_token");
      const res = await fetch(
        `${import.meta.env.VITE_USER_API_BASE_URL}/api/private/profile/avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      toast({ title: "Avatar Updated" });
      refreshProfile();
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (profileLoading && isBackendAvailable && isAuthenticated) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-radio-surface border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <label className="cursor-pointer relative group">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-radio-yellow text-radio-dark text-2xl font-bold">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      initials || <User className="w-8 h-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {isBackendAvailable && isAuthenticated && (
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-medium">Edit</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <p className="text-gray-400 mt-1">{displayEmail}</p>
                {bio && <p className="text-gray-500 text-sm mt-2">{bio}</p>}
                <div className="flex items-center space-x-4 mt-3">
                  <Badge className="bg-radio-yellow text-radio-dark">
                    {isAuthenticated && isBackendAvailable ? "Member" : "Demo"}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600">
                    Active
                  </Badge>
                </div>
              </div>

              <Dialog open={isEditing} onOpenChange={(v) => { setIsEditing(v); if (v) { setEditName(displayName); setEditBio(bio); } }}>
                <DialogTrigger asChild>
                  <Button className="bg-radio-yellow text-radio-dark hover:bg-yellow-400">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-radio-surface border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-white">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-radio-card border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-white">Bio</Label>
                      <Input
                        id="bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="bg-radio-card border-gray-700 text-white"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-radio-yellow text-radio-dark hover:bg-yellow-400"
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card className="bg-radio-surface border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Headphones className="w-5 h-5 mr-2 text-radio-yellow" />
                  Listening Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">{histCount}</div>
                    <div className="text-sm text-gray-400">Articles Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">24h</div>
                    <div className="text-sm text-gray-400">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">{favCount}</div>
                    <div className="text-sm text-gray-400">Favorites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">{dlCount}</div>
                    <div className="text-sm text-gray-400">Downloads</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            {isBackendAvailable && isAuthenticated && (
              <Card className="bg-radio-surface border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                    onClick={() => setIsChangingPw(true)}
                  >
                    Change Password
                  </Button>
                  <Dialog open={isChangingPw} onOpenChange={setIsChangingPw}>
                    <DialogContent className="bg-radio-surface border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="oldPw" className="text-white">Current Password</Label>
                          <Input
                            id="oldPw"
                            type="password"
                            value={oldPw}
                            onChange={(e) => setOldPw(e.target.value)}
                            className="bg-radio-card border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPw" className="text-white">New Password</Label>
                          <Input
                            id="newPw"
                            type="password"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            className="bg-radio-card border-gray-700 text-white"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsChangingPw(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-radio-yellow text-radio-dark hover:bg-yellow-400"
                            onClick={() => pwMutation.mutate()}
                            disabled={pwMutation.isPending}
                          >
                            {pwMutation.isPending ? "Changing..." : "Change Password"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-radio-surface border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="ghost" onClick={() => setLocation("/favorites")}>
                  <Heart className="w-4 h-4 mr-2" /> View Favorites
                </Button>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setLocation("/downloads")}>
                  <Download className="w-4 h-4 mr-2" /> Manage Downloads
                </Button>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setLocation("/history")}>
                  <Clock className="w-4 h-4 mr-2" /> Listening History
                </Button>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setLocation("/settings")}>
                  <Settings className="w-4 h-4 mr-2" /> Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
