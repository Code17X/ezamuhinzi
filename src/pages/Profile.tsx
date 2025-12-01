import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, MessageSquare } from "lucide-react";

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
    phone_number: "",
    sms_alerts_enabled: false,
  });
  const [sendingTestSMS, setSendingTestSMS] = useState(false);

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
        phone_number: data.phone_number || "",
        sms_alerts_enabled: data.sms_alerts_enabled || false,
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
        title: "Byakunze",
        description: "Umwirondoro wawe wahinduwe neza",
      });
    } catch (error) {
      toast({
        title: "Ikosa",
        description: error instanceof Error ? error.message : "Habaye ikosa mu guhindura umwirondoro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMS = async () => {
    if (!profileData.phone_number) {
      toast({
        title: "Ikosa",
        description: "Shyiramo nimero ya telephone mbere",
        variant: "destructive",
      });
      return;
    }

    setSendingTestSMS(true);
    try {
      // Normalize phone number to E.164 format
      let normalizedPhone = profileData.phone_number.trim();
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+250' + normalizedPhone.substring(1);
      } else if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = '+250' + normalizedPhone;
      }

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber: normalizedPhone,
          message: "Muraho! Uyu ni ubutumwa bwo kugerageza kuva kuri Eza Muhizi. Ubutumwa bw'amakuru buzatangira kuboneka vuba.",
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Byakunze!",
        description: "Ubutumwa bwoherejwe kuri nimero yawe",
      });
    } catch (error: any) {
      console.error('Error sending test SMS:', error);
      
      // Check for specific Twilio error about same To/From numbers
      const errorMessage = error?.message || '';
      if (errorMessage.includes('same') || errorMessage.includes('21266')) {
        toast({
          title: "Ikosa rya Configuration",
          description: "Nimero ya Twilio sender ntabwo ishobora kuba ari yo nka nimero yawe. Gura nimero ya Twilio.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ikosa",
          description: "Habaye ikosa mu kohereza ubutumwa. Reba niba nimero yawe ari yo kandi configuration ya Twilio ari nziza.",
          variant: "destructive",
        });
      }
    } finally {
      setSendingTestSMS(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isSetup ? "Uzuza Umwirondoro" : "Umwirondoro / My Profile"}
            </h1>
            <p className="text-muted-foreground">
              {isSetup 
                ? "Tubwire ibijyanye n'ubuhinzi bwawe kugira ngo ubone inama"
                : "Gucunga umwirondoro wawe n'amakuru y'ubuhinzi"
              }
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Amakuru Bwite / Personal Information</CardTitle>
              <CardDescription>Amakuru yawe bwite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Amazina Yombi / Full Name</Label>
                <Input
                  id="fullName"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  placeholder="Amazina yawe yombi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Imeri / Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Aho Uhinga / Farm Location</Label>
                <Input
                  id="location"
                  value={profileData.farm_location}
                  onChange={(e) => setProfileData({ ...profileData, farm_location: e.target.value })}
                  placeholder="Umujyi, Intara"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subscription / Kwishyura</CardTitle>
              <CardDescription>Hitamo uburyo bwo kwishyura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      MTN Mobile Money
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Kanda hano kugira ngo wishyure ukoresheje MTN MoMo
                    </p>
                    <Button className="w-full" variant="outline">
                      Hitamo MTN MoMo
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      Airtel Money
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Kanda hano kugira ngo wishyure ukoresheje Airtel Money
                    </p>
                    <Button className="w-full" variant="outline">
                      Hitamo Airtel Money
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Igiciro:</strong> 1,000 RWF / Ukwezi<br/>
                  <strong>Inyungu:</strong> Kubona amakuru yose, Gukoresha AI Assistant, Kubona amasoko n'ibindi
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Amakuru kuri SMS / SMS Alerts
              </CardTitle>
              <CardDescription>Reba amakuru kuri telephone yawe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nimero ya Telephone / Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                  placeholder="+250788123456"
                />
                <p className="text-xs text-muted-foreground">
                  Shyiramo nimero yawe ya telephone (+250...)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="sms-alerts" className="text-base font-medium">
                    Emeza Amakuru kuri SMS
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reba amakuru y'ikirere, ibiciro, n'ibindi
                  </p>
                </div>
                <Switch
                  id="sms-alerts"
                  checked={profileData.sms_alerts_enabled}
                  onCheckedChange={(checked) => 
                    setProfileData({ ...profileData, sms_alerts_enabled: checked })
                  }
                />
              </div>

              <div className="border-t pt-4">
                <Button 
                  onClick={handleTestSMS}
                  disabled={sendingTestSMS || !profileData.phone_number}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {sendingTestSMS ? "Byohereza..." : "Gerageza Kohereza SMS"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Kanda kugira ngo urebe niba nimero yawe ikora neza
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Amakuru uzabona:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Amakuru y'ikirere n'imvura</li>
                  <li>• Ibiciro bishya ku isoko</li>
                  <li>• Ibicuruzwa bishya kuri Tanga Akazi</li>
                  <li>• Iterambere ry'udukoko n'indwara</li>
                  <li>• Amakuru y'ingenzi y'ubuhinzi</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Birabika..." : isSetup ? "Soza Gushyiraho" : "Bika Impinduka"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
