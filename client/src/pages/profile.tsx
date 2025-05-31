import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { User, Settings, Heart, Clock, Download, Headphones } from 'lucide-react';

export default function Profile() {
  const [username, setUsername] = useState('Radio Listener');
  const [email, setEmail] = useState('listener@radioai.com');
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated."
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'favorites':
        setLocation('/favorites');
        break;
      case 'downloads':
        setLocation('/downloads');
        break;
      case 'history':
        setLocation('/history');
        break;
      case 'settings':
        setLocation('/settings');
        break;
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <Card className="bg-radio-surface border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-radio-yellow text-radio-dark text-2xl font-bold">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{username}</h1>
                <p className="text-gray-400 mt-1">{email}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <Badge className="bg-radio-yellow text-radio-dark">Premium</Badge>
                  <Badge variant="outline" className="border-gray-600">Active</Badge>
                </div>
              </div>
              
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
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
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-radio-card border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-radio-card border-gray-700 text-white"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-radio-yellow text-radio-dark hover:bg-yellow-400"
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Statistics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Listening Stats */}
            <Card className="bg-radio-surface border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Headphones className="w-5 h-5 mr-2 text-radio-yellow" />
                  Listening Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">147</div>
                    <div className="text-sm text-gray-400">Articles Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">24h</div>
                    <div className="text-sm text-gray-400">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">32</div>
                    <div className="text-sm text-gray-400">Favorites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-radio-yellow">8</div>
                    <div className="text-sm text-gray-400">Downloads</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-radio-surface border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Clock className="w-5 h-5 mr-2 text-radio-yellow" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-radio-card rounded-lg">
                  <div>
                    <div className="text-white font-medium">Completed: Global Markets Rally</div>
                    <div className="text-sm text-gray-400">Business • 2 hours ago</div>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-400">Completed</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-radio-card rounded-lg">
                  <div>
                    <div className="text-white font-medium">Added to favorites: Climate Summit Update</div>
                    <div className="text-sm text-gray-400">Environment • 4 hours ago</div>
                  </div>
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-radio-card rounded-lg">
                  <div>
                    <div className="text-white font-medium">Downloaded: Tech Innovation Report</div>
                    <div className="text-sm text-gray-400">Technology • 1 day ago</div>
                  </div>
                  <Download className="w-4 h-4 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            
            {/* Preferences */}
            <Card className="bg-radio-surface border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => handleQuickAction('favorites')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  View Favorites
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => handleQuickAction('downloads')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Manage Downloads
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => handleQuickAction('history')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Listening History
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => handleQuickAction('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-radio-surface border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white">Premium</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">Jan 2024</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Storage Used</span>
                  <span className="text-white">2.4 GB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}