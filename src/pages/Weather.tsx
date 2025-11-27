import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from "lucide-react";

const Weather = () => {
  const { t } = useTranslation();
  
  const currentWeather = {
    temperature: 24,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    precipitation: 20
  };

  const forecast = [
    { day: "Mon", high: 26, low: 18, condition: "Sunny", icon: Sun },
    { day: "Tue", high: 25, low: 19, condition: "Cloudy", icon: Cloud },
    { day: "Wed", high: 23, low: 17, condition: "Rainy", icon: CloudRain },
    { day: "Thu", high: 24, low: 18, condition: "Sunny", icon: Sun },
    { day: "Fri", high: 27, low: 20, condition: "Sunny", icon: Sun },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('weather.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('landing.weatherPricesDesc')}
            </p>
          </div>

          {/* Current Weather */}
          <Card className="mb-6 bg-gradient-to-br from-blue-500/10 to-primary/10 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">{t('weather.currentWeather')}</CardTitle>
              <CardDescription>{t('weather.localConditions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-6xl font-bold text-foreground">
                    {currentWeather.temperature}°C
                  </div>
                  <div className="text-xl text-muted-foreground mt-2">
                    {currentWeather.condition}
                  </div>
                </div>
                <Cloud className="w-24 h-24 text-primary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.humidity')}</div>
                    <div className="font-semibold">{currentWeather.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.wind')}</div>
                    <div className="font-semibold">{currentWeather.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.visibility')}</div>
                    <div className="font-semibold">{currentWeather.visibility} km</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.rain')}</div>
                    <div className="font-semibold">{currentWeather.precipitation}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>{t('weather.forecast')}</CardTitle>
              <CardDescription>{t('weather.weekOutlook')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.map((day) => {
                  const Icon = day.icon;
                  return (
                    <div
                      key={day.day}
                      className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="font-semibold mb-2">{day.day}</div>
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-sm text-muted-foreground mb-2">
                        {day.condition}
                      </div>
                      <div className="flex justify-center gap-2 text-sm">
                        <span className="font-semibold">{day.high}°</span>
                        <span className="text-muted-foreground">{day.low}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Farming Tips */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>{t('weather.farmingRecommendations')}</CardTitle>
              <CardDescription>{t('weather.basedOnConditions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Good conditions for planting leafy vegetables</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Consider irrigation as rainfall expected to be low</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Ideal weather for outdoor livestock activities</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Weather;