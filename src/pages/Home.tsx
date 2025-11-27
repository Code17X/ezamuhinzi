import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Bot, Cloud, DollarSign, Newspaper, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import heroFarmers from "@/assets/hero-farmers.jpg";
import heroCoffeeFarm from "@/assets/hero-coffee-farm.jpg";
import heroVegetableHarvest from "@/assets/hero-vegetable-harvest.jpg";
import heroLivestockFarming from "@/assets/hero-livestock-farming.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    heroFarmers,
    heroCoffeeFarm,
    heroVegetableHarvest,
    heroLivestockFarming,
  ];

  useEffect(() => {
    if (!user) {
      navigate('/landing');
    }
  }, [user, navigate]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const features = [
    {
      icon: Bot,
      title: t('assistant'),
      description: t('landing.aiAssistantDesc'),
      link: "/assistant",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Cloud,
      title: t('weather'),
      description: t('landing.weatherPricesDesc'),
      link: "/weather",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: DollarSign,
      title: t('prices'),
      description: t('landing.weatherPricesDesc'),
      link: "/prices",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Newspaper,
      title: t('news'),
      description: t('landing.agriNewsDesc'),
      link: "/news",
      color: "bg-green-500/10 text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Carousel */}
        <section className="mb-12 relative">
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <img 
              src={heroImages[currentImageIndex]} 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20 flex flex-col justify-end p-8">
              <h1 className="text-4xl font-bold mb-4 text-foreground">{t('home.welcome')}</h1>
              <p className="text-xl text-foreground/90 mb-6">
                {t('landing.subtitle')}
              </p>
            </div>
            
            {heroImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-foreground">{t('home.latestNews')}</h2>
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-accent/10 to-primary/10 border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{t('news')}</CardTitle>
                <Link to="/news">
                  <Button variant="ghost" size="sm">
                    {t('common.viewAll')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="text-6xl">🌽</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">New Drought-Resistant Maize Variety Released</h3>
                  <p className="text-muted-foreground mb-4">
                    Agricultural researchers have developed a new maize variety that can withstand extended dry periods, 
                    promising better yields for farmers in arid regions.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Newspaper className="w-4 h-4" />
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">{t('home.features')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.link}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between group">
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
