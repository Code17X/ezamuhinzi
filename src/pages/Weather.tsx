import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, CloudDrizzle, CloudSnow, CloudFog } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { Skeleton } from "@/components/ui/skeleton";

const Weather = () => {
  const { t } = useTranslation();
  const { weather, loading, error } = useWeather();

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain')) return CloudRain;
    if (conditionLower.includes('cloud')) return Cloud;
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) return Sun;
    if (conditionLower.includes('drizzle')) return CloudDrizzle;
    if (conditionLower.includes('snow')) return CloudSnow;
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return CloudFog;
    return Cloud;
  };

  const getFarmingRecommendations = () => {
    if (!weather) return [];
    
    const recommendations = [];
    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const rain = weather.current.precipitation;

    // Check if whole week has good temperature
    const allDaysGoodTemp = weather.forecast.every(day => day.high >= 20 && day.high <= 28);
    
    if (allDaysGoodTemp) {
      recommendations.push("🌟 IGIHE CYIZA CYO GUHINGA! Ubushyuhe bw'icyumweru cyose buri hagati ya 20-28°C - ikirere cyiza cyo gutera ibihingwa byinshi.");
    }

    if (temp >= 20 && temp <= 28 && humidity > 50) {
      recommendations.push("🌱 Ibirere byiza byo gutera imboga zitoshye nk'ishu, inyanya, n'ibitunguru. Ubushyuhe n'ubushuhe birakwiye.");
    }
    
    if (rain < 30 && humidity < 60) {
      recommendations.push("💧 Tekereza gusarura cyangwa gushyira sistem yo kuvomera kubera ko imvura itegerejwe kuba nke. Ibihingwa bisaba amazi menshi.");
    }
    
    if (temp > 18 && humidity < 80) {
      recommendations.push("🐄 Ikirere cyiza cyo gukora ibikorwa byo hanze by'ubworozi - gukingira amatungo, gusana urugo, n'ibindi.");
    }

    if (temp > 25 && rain < 20) {
      recommendations.push("🌾 Igihe cyiza cyo gusarura ibihingwa bishaje - ubushyuhe n'ikirere cyumye bifasha ibihingwa gukama neza.");
    }

    if (humidity > 70 && temp < 22) {
      recommendations.push("🛡️ Witondere indwara z'ibihingwa nk'urubura kubera ubushuhe bwinshi. Koresha imiti yo kurinda.");
    }

    if (weather.alerts) {
      recommendations.push("⚠️ IBURIRA: Ikirere gikomeye giteganywa. Witondere kandi urinde ibihingwa byawe.");
    }

    // Ensure at least 3 recommendations
    if (recommendations.length < 3) {
      recommendations.push("🌤️ Kureba ikirere buri munsi bigufasha gufata ibyemezo byiza byo guhinga.");
      if (recommendations.length < 3) {
        recommendations.push("📱 Koresha ubu buryo bwo kubona amakuru y'ikirere maze wishyire imbere mu bikorwa byawe by'ubuhinzi.");
      }
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
          <div className="max-w-5xl mx-auto">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.current.condition);

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
              {weather.location.name}, {weather.location.country}
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
                    {weather.current.temperature}°C
                  </div>
                  <div className="text-xl text-muted-foreground mt-2">
                    {weather.current.description}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t('weather.feelsLike')}: {weather.current.feelsLike}°C
                  </div>
                </div>
                <WeatherIcon className="w-24 h-24 text-primary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.humidity')}</div>
                    <div className="font-semibold">{weather.current.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.wind')}</div>
                    <div className="font-semibold">{weather.current.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.visibility')}</div>
                    <div className="font-semibold">{weather.current.visibility} km</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t('weather.rain')}</div>
                    <div className="font-semibold">{weather.current.precipitation}%</div>
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
                {weather.forecast.map((day) => {
                  const Icon = getWeatherIcon(day.condition);
                  return (
                    <div
                      key={day.day}
                      className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="font-semibold mb-2">{day.day}</div>
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-sm text-muted-foreground mb-2">
                        {day.description}
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
                {getFarmingRecommendations().map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Weather;
