import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CloudSun, TrendingUp, Newspaper, Stethoscope, CheckCircle2, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-farmers.jpg";

const Landing = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'rw', label: 'Kinyarwanda' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };
  
  const features = [
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: t("landing.features.cropDetection"),
      description: t("landing.features.cropDetectionDesc"),
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-primary" />,
      title: t("landing.features.vetAssistant"),
      description: t("landing.features.vetAssistantDesc"),
    },
    {
      icon: <CloudSun className="w-8 h-8 text-primary" />,
      title: t("landing.features.weatherPrices"),
      description: t("landing.features.weatherPricesDesc"),
    },
    {
      icon: <Newspaper className="w-8 h-8 text-primary" />,
      title: t("landing.features.news"),
      description: t("landing.features.newsDesc"),
    },
  ];

  const innovations = [
    t("landing.innovation.1"),
    t("landing.innovation.2"),
    t("landing.innovation.3"),
    t("landing.innovation.4"),
    t("landing.innovation.5"),
    t("landing.innovation.6"),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Language Selector - Fixed Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[140px] bg-white/90 backdrop-blur-sm border-white/20 text-foreground">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden animate-fade-in">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t("landing.hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 hover-scale">
                {t("landing.hero.getStarted")}
              </Button>
            </Link>
            <Link to="/auth?mode=login">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20 hover-scale">
                {t("landing.hero.login")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("landing.features.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow hover-scale animate-fade-in">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-20 px-4 bg-muted/30 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("landing.innovation.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {innovations.map((innovation, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{innovation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 animate-fade-in">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("landing.cta.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("landing.cta.subtitle")}
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-lg px-8 hover-scale">
              {t("landing.cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
