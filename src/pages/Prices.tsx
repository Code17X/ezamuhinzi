import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Sparkles, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWeather } from "@/hooks/useWeather";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Prices = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { weather } = useWeather();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const crops = [
    { name: "Ibigori / Maize", price: 45000, unit: "kg", change: 5, trending: "up", location: "Kigali" },
    { name: "Ibishyimbo / Beans", price: 38000, unit: "kg", change: 8, trending: "up", location: "Kigali" },
    { name: "Umuceri / Rice", price: 52000, unit: "kg", change: 2, trending: "up", location: "Musanze" },
    { name: "Ikawa / Coffee", price: 125000, unit: "kg", change: 8, trending: "up", location: "Huye" },
    { name: "Icyayi / Tea", price: 89000, unit: "kg", change: 4, trending: "up", location: "Nyamagabe" },
    { name: "Imyumbati / Cassava", price: 28000, unit: "kg", change: 0, trending: "stable", location: "Bugesera" },
    { name: "Ibirayi / Potatoes", price: 42000, unit: "kg", change: -2, trending: "down", location: "Musanze" },
    { name: "Ibitoki / Bananas", price: 35000, unit: "kg", change: 3, trending: "up", location: "Rusizi" },
  ];

  const livestock = [
    { name: "Inka / Cattle", price: 1200000, unit: "umutwe", change: 7, trending: "up", location: "Kigali" },
    { name: "Ihene / Goats", price: 180000, unit: "umutwe", change: 0, trending: "stable", location: "Nyagatare" },
    { name: "Inkoko / Chickens", price: 8000, unit: "kg", change: -2, trending: "down", location: "Kigali" },
    { name: "Ingurube / Pigs", price: 350000, unit: "umutwe", change: 4, trending: "up", location: "Rwamagana" },
    { name: "Amagi (icumi n'abiri)", price: 4500, unit: "icumi n'abiri", change: 0, trending: "stable", location: "Kigali" },
    { name: "Amata / Milk", price: 1200, unit: "litiro", change: 1, trending: "up", location: "Kigali" },
  ];

  const getPriceHistory = (item: any) => {
    // Generate realistic price history for the last 6 months
    const months = ['Kamena', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'];
    const basePrice = item.price;
    const history = months.map((month, index) => {
      const variation = (Math.random() - 0.5) * 0.15; // ±15% variation
      const price = Math.round(basePrice * (1 + variation));
      return { name: month, price };
    });
    return history;
  };

  const getPriceFactors = (item: any) => {
    const factors = {
      'Ibigori / Maize': [
        '🌧️ Imvura nyinshi yongera umusaruro, ibiciro bigamanuka',
        '⛽ Ibiciro bya lisansi byongera ibiciro byo gutwara',
        '🌍 Isoko ry\'amahanga riterwa n\'ibiciro by\'isi'
      ],
      'Ibishyimbo / Beans': [
        '🌦️ Ikirere cyumye kigira ingaruka ku musaruro',
        '🦠 Indwara z\'ibihingwa zongera ibiciro',
        '📈 Isoko ry\'imbere ryongera ibiciro'
      ],
      'Umuceri / Rice': [
        '💧 Amazi menshi akenewe, ihwiri rigabanya umusaruro',
        '🚜 Ubuhinga bw\'ikoranabuhanga bwongera ibiciro',
        '🌏 Umuceri uturuka hanze uterwa n\'ibiciro'
      ],
      'Ikawa / Coffee': [
        '🌡️ Ubushyuhe bw\'isi bwongera ibiciro by\'ikawa',
        '☕ Isoko ry\'amahanga riterwa n\'ubuziranenge',
        '🌱 Ubwoko bushya bw\'ikawa bugira ingaruka ku biciro'
      ],
      'Icyayi / Tea': [
        '🌿 Ikirere cyiza cyongera umusaruro w\'icyayi',
        '📊 Isoko ry\'i Bwongereza n\'i Kenya riterwa',
        '💰 Ibiciro by\'amafaranga bigira ingaruka'
      ],
      'Imyumbati / Cassava': [
        '🌾 Ikawa igira ingaruka ku musaruro w\'imyumbati',
        '🏭 Inganda z\'ifu zongera ibiciro',
        '🚛 Ibiciro byo gutwara bigira ingaruka'
      ],
      'Ibirayi / Potatoes': [
        '❄️ Imbeho zongera ibiciro ku gihe cy\'imbeho',
        '🌡️ Ubushyuhe bukabije bugabanya umusaruro',
        '📦 Ububiko bubi bugira ingaruka ku biciro'
      ],
      'Ibitoki / Bananas': [
        '🌪️ Umuyaga ukomeye ugira ingaruka ku mihingwe',
        '🦠 Indwara nk\'umuhaha bigira ingaruka',
        '🏪 Isoko ry\'i Kigali riterwa n\'ibyifuzo'
      ],
      'Inka / Cattle': [
        '🌾 Ibiciro by\'ibyokurisha bigira ingaruka',
        '💉 Imiti y\'amatungo yongera ibiciro',
        '🥩 Isoko ry\'inyama riterwa n\'ibyifuzo'
      ],
      'Ihene / Goats': [
        '🌿 Ibyatsi byinshi bigabanya ibiciro',
        '🎉 Ibirori byongera ibyifuzo',
        '🏥 Ubuzima bw\'amatungo bugira ingaruka'
      ],
      'Inkoko / Chickens': [
        '🌽 Ibiciro by\'ibigori bigira ingaruka',
        '🦠 Indwara z\'inkoko zongera ibiciro',
        '🥚 Isoko ry\'amagi riterwa'
      ],
      'Ingurube / Pigs': [
        '🌾 Ibiciro by\'ibiryo bigira ingaruka',
        '🦠 Indwara nk\'icyorezo bigira ingaruka',
        '🥓 Isoko ry\'inyama y\'ingurube riterwa'
      ],
      'Amagi (icumi n\'abiri)': [
        '🐔 Umubare w\'inkoko ugira ingaruka',
        '🌡️ Ubushyuhe bukabije bugira ingaruka',
        '🏪 Isoko ry\'i Kigali riterwa n\'ibyifuzo'
      ],
      'Amata / Milk': [
        '🐄 Umusaruro w\'inka ugira ingaruka',
        '🌡️ Ikirere cyongera cyangwa kigabanya',
        '🏭 Inganda z\'amata ziterwa'
      ]
    };
    return factors[item.name as keyof typeof factors] || [
      '🌍 Isoko ry\'isi riterwa n\'ibiciro',
      '🌦️ Ikirere kigira ingaruka ku musaruro',
      '💰 Ibyifuzo n\'isoko riterwa'
    ];
  };

  const fetchPrediction = async (item: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('market-prediction', {
        body: { cropName: item.name, currentPrice: item.price, weather: weather?.current || {}, location: item.location }
      });
      if (error) throw error;
      setPrediction(data.prediction);
    } catch (error) {
      toast({ title: t('common.error'), description: 'Ntibyashobotse', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderPriceCard = (item: any) => (
    <Card key={item.name} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedItem(item); setPrediction(null); }}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-2xl font-bold text-primary">{item.price.toLocaleString()} RWF<span className="text-sm text-muted-foreground ml-1">/{item.unit}</span></p>
        <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
        <Badge variant={item.trending === "up" ? "default" : item.trending === "down" ? "destructive" : "secondary"} className="mt-2">
          {item.trending === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
          {item.trending === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
          {item.change !== 0 ? `${item.change > 0 ? "+" : ""}${item.change}%` : t('prices.stable')}
        </Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">{t('prices.marketPrices')}</h1>
          <p className="text-center text-muted-foreground mb-8">{t('prices.realTimePricing')}</p>
          
          <Card className="mb-8">
            <CardHeader><CardTitle className="text-2xl">{t('prices.cropPrices')}</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{crops.map(renderPriceCard)}</div></CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-2xl">{t('prices.livestockProduce')}</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{livestock.map(renderPriceCard)}</div></CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setPrediction(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.location} - {selectedItem?.price.toLocaleString()} RWF/{selectedItem?.unit}
            </DialogDescription>
          </DialogHeader>
          
          {/* Price History Graph */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">📊 Ihinduka ry'Ibiciro (Amezi 6 Ashize)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={selectedItem ? getPriceHistory(selectedItem) : []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => `${value.toLocaleString()} RWF`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Factors */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Ibintu Bigira Ingaruka ku Biciro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedItem && getPriceFactors(selectedItem).map((factor, index) => (
                  <Alert key={index} className="border-primary/20">
                    <AlertDescription className="text-sm">{factor}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Prediction */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t('prices.aiAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!prediction ? (
                <Button onClick={() => fetchPrediction(selectedItem)} disabled={loading} className="w-full">
                  {loading ? t('prices.analyzing') : t('prices.viewPrediction')}
                </Button>
              ) : (
                <p className="text-sm whitespace-pre-line">{prediction}</p>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prices;
