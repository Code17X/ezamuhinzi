import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWeather } from "@/hooks/useWeather";

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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedItem?.name}</DialogTitle></DialogHeader>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />{t('prices.aiAnalysis')}</CardTitle></CardHeader>
            <CardContent>
              {!prediction ? <Button onClick={() => fetchPrediction(selectedItem)} disabled={loading} className="w-full">{loading ? t('prices.analyzing') : t('prices.viewPrediction')}</Button> : <p className="text-sm whitespace-pre-line">{prediction}</p>}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prices;
