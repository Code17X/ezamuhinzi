import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MarketPrice {
  id: string;
  product_name: string;
  product_name_kinyarwanda: string;
  category: string;
  current_price: number;
  unit: string;
  location: string;
  trend: string;
  trend_percentage: number | null;
  price_factors: string[];
}

const Prices = () => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<MarketPrice | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<MarketPrice[]>([]);
  const [livestock, setLivestock] = useState<MarketPrice[]>([]);
  const [priceHistory, setPriceHistory] = useState<{month: string; price: number}[]>([]);

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadPriceHistory(selectedItem);
    }
  }, [selectedItem]);

  const loadPriceHistory = async (item: MarketPrice) => {
    const history = await getPriceHistory(item);
    setPriceHistory(history);
  };

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('product_name_kinyarwanda');

      if (error) throw error;

      if (data) {
        setCrops(data.filter(p => p.category === 'crop'));
        setLivestock(data.filter(p => p.category === 'livestock'));
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error("Habaye ikosa mu gushaka ibiciro");
    }
  };

  const getPriceHistory = async (item: MarketPrice) => {
    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('price, recorded_at')
        .eq('market_price_id', item.id)
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(record => ({
          month: new Date(record.recorded_at).toLocaleDateString('rw-RW', { month: 'long', year: 'numeric' }),
          price: Number(record.price)
        }));
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    }

    // Fallback to generated history if no data
    const months = ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena'];
    const basePrice = item.current_price;
    const trend = item.trend;
    
    return months.map((month, index) => {
      let price = basePrice;
      if (trend === 'up') {
        price = basePrice * (0.85 + (index * 0.03));
      } else if (trend === 'down') {
        price = basePrice * (1.15 - (index * 0.03));
      } else {
        price = basePrice * (0.95 + Math.random() * 0.1);
      }
      return {
        month,
        price: Math.round(price)
      };
    });
  };

  const fetchPrediction = async (item: MarketPrice) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-prediction', {
        body: { 
          item: item.product_name_kinyarwanda,
          currentPrice: item.current_price,
          trend: item.trend
        }
      });

      if (error) throw error;
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      toast.error("Habaye ikosa mu gushaka ihinduka");
    } finally {
      setLoading(false);
    }
  };

  const renderPriceCard = (item: MarketPrice, index: number) => {
    return (
      <Card key={item.id} className="card-hover button-press animate-fade-in-up stagger-item" style={{ '--stagger': index } as React.CSSProperties}>
        <CardHeader className="cursor-pointer" onClick={() => setSelectedItem(item)}>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{item.product_name_kinyarwanda}</CardTitle>
              <CardDescription>{item.location}</CardDescription>
            </div>
            <Badge 
              variant={
                item.trend === 'up' ? 'default' : 
                item.trend === 'down' ? 'destructive' : 
                'secondary'
              }
              className="flex items-center gap-1"
            >
              {item.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
               item.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
               <Minus className="w-3 h-3" />}
              {item.trend_percentage ? `${item.trend_percentage > 0 ? '+' : ''}${item.trend_percentage}%` : '0%'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="cursor-pointer" onClick={() => setSelectedItem(item)}>
          <div className="text-2xl font-bold">{item.current_price.toLocaleString()} RWF</div>
          <p className="text-sm text-muted-foreground">ku {item.unit}</p>
        </CardContent>
      </Card>
    );
  };

  return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Ibiciro ku Isoko</h1>
            <p className="text-muted-foreground">Ibiciro by'ibihingwa n'amatungo kuri uyu munsi</p>
          </div>

          {/* Crops Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Ibihingwa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((crop, index) => renderPriceCard(crop, index))}
            </div>
          </div>

          {/* Livestock Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Amatungo n'Ibicuruzwa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livestock.map((item, index) => renderPriceCard(item, index))}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setPrediction(""); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle>{selectedItem?.product_name_kinyarwanda}</DialogTitle>
            <DialogDescription>
              {selectedItem?.location} • {selectedItem?.current_price.toLocaleString()} RWF ku {selectedItem?.unit}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Price History Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Amateka y'Ibiciro</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Igiciro (RWF)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Price Factors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Impamvu Ziterwa n'Igiciro</h3>
              <div className="space-y-2">
                {selectedItem?.price_factors.map((factor, idx) => (
                  <Alert key={idx}>
                    <AlertDescription>{factor}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            {/* AI Prediction */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Isesengura rya AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!prediction ? (
                  <Button 
                    onClick={() => selectedItem && fetchPrediction(selectedItem)} 
                    disabled={loading}
                    className="w-full button-press hover-glow"
                  >
                    {loading ? "Turasuzuma..." : "Reba Ihinduka"}
                  </Button>
                ) : (
                  <p className="text-sm whitespace-pre-line animate-fade-in">{prediction}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prices;
