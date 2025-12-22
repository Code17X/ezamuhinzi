import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import HomeButton from "@/components/HomeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_alerts_enabled: boolean;
  phone_number: string;
  profile_visibility: boolean;
  show_location: boolean;
  ai_detail_level: 'simple' | 'detailed';
  units: 'metric' | 'imperial';
}

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    sms_alerts_enabled: false,
    phone_number: '',
    profile_visibility: true,
    show_location: true,
    ai_detail_level: 'simple',
    units: 'metric'
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    const stored = localStorage.getItem(`user_settings_${user.id}`);
    if (stored) {
      setSettings(JSON.parse(stored));
    }

    // Load phone number and SMS alerts from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone_number, sms_alerts_enabled')
      .eq('id', user.id)
      .single();

    if (profile) {
      setSettings(prev => ({
        ...prev,
        phone_number: profile.phone_number || '',
        sms_alerts_enabled: profile.sms_alerts_enabled || false
      }));
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    localStorage.setItem(`user_settings_${user.id}`, JSON.stringify(settings));
    
    // Save phone number and SMS alerts to profile
    const { error } = await supabase
      .from('profiles')
      .update({
        phone_number: settings.phone_number,
        sms_alerts_enabled: settings.sms_alerts_enabled
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: t('settings.saved'),
      description: t('common.success'),
    });
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      <HomeButton />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">{t('settings.title')}</h1>
        
        <div className="space-y-6 max-w-2xl">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">{t('settings.darkMode')}</Label>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select value={i18n.language} onValueChange={changeLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rw">Kinyarwanda</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">{t('settings.enableNotifications')}</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, notifications_enabled: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">{t('settings.emailNotifications')}</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, email_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sms-alerts">{t('settings.smsAlerts')}</Label>
                <Switch
                  id="sms-alerts"
                  checked={settings.sms_alerts_enabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, sms_alerts_enabled: checked })
                  }
                />
              </div>

              {settings.sms_alerts_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="phone-number">{t('settings.phoneNumber')}</Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    placeholder={t('settings.phoneNumberPlaceholder')}
                    value={settings.phone_number}
                    onChange={(e) => 
                      setSettings({ ...settings, phone_number: e.target.value })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.privacy')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility">{t('settings.profileVisibility')}</Label>
                <Switch
                  id="profile-visibility"
                  checked={settings.profile_visibility}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, profile_visibility: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-location">{t('settings.showLocation')}</Label>
                <Switch
                  id="show-location"
                  checked={settings.show_location}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, show_location: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.aiPreferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.responseDetail')}</Label>
                <RadioGroup 
                  value={settings.ai_detail_level}
                  onValueChange={(value) => 
                    setSettings({ ...settings, ai_detail_level: value as 'simple' | 'detailed' })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple" id="simple" />
                    <Label htmlFor="simple">{t('settings.simple')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed">{t('settings.detailed')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Units */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.units')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={settings.units}
                onValueChange={(value) => 
                  setSettings({ ...settings, units: value as 'metric' | 'imperial' })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="metric" />
                  <Label htmlFor="metric">{t('settings.metric')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imperial" id="imperial" />
                  <Label htmlFor="imperial">{t('settings.imperial')}</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button onClick={handleSaveSettings} className="w-full">
            {t('settings.saveChanges')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
