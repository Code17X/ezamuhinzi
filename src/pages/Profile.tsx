import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    farm_location: "",
    farm_size: "",
    crop_types: [] as string[],
    farming_methods: "",
    experience_level: "" as "beginner" | "intermediate" | "experienced" | "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfileData({
        full_name: data.full_name || "",
        farm_location: data.farm_location || "",
        farm_size: data.farm_size || "",
        crop_types: data.crop_types || [],
        farming_methods: data.farming_methods || "",
        experience_level: (data.experience_level as "beginner" | "intermediate" | "experienced") || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isSetup ? "Complete Your Profile" : "My Profile"}
            </h1>
            <p className="text-muted-foreground">
              {isSetup 
                ? "Tell us about your farm to get personalized recommendations"
                : "Manage your account and farm information"
              }
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Farm Location</Label>
                <Input
                  id="location"
                  value={profileData.farm_location}
                  onChange={(e) => setProfileData({ ...profileData, farm_location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Farm Information</CardTitle>
              <CardDescription>Details about your farming operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Farming Experience</Label>
                <Select
                  value={profileData.experience_level}
                  onValueChange={(value: "beginner" | "intermediate" | "experienced") => 
                    setProfileData({ ...profileData, experience_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (Starting out)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Few years experience)</SelectItem>
                    <SelectItem value="experienced">Experienced (Professional farmer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm Size</Label>
                <Input
                  id="farmSize"
                  value={profileData.farm_size}
                  onChange={(e) => setProfileData({ ...profileData, farm_size: e.target.value })}
                  placeholder="e.g., 5 hectares, 2 acres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropTypes">Main Crops</Label>
                <Input
                  id="cropTypes"
                  value={profileData.crop_types.join(", ")}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    crop_types: e.target.value.split(",").map(s => s.trim()) 
                  })}
                  placeholder="e.g., Maize, Beans, Potatoes (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmingMethods">Farming Methods</Label>
                <Textarea
                  id="farmingMethods"
                  value={profileData.farming_methods}
                  onChange={(e) => setProfileData({ ...profileData, farming_methods: e.target.value })}
                  placeholder="Describe your farming methods (organic, conventional, etc.)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Saving..." : isSetup ? "Complete Setup" : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
