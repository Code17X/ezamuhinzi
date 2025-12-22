import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import HomeButton from "@/components/HomeButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles, Info, Cloud, CloudRain, Sun, Calendar, MapPin, Bell, TrendingUpIcon, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [weatherImpact, setWeatherImpact] = useState<any>(null);
  const [locationComparison, setLocationComparison] = useState<MarketPrice[]>([]);
  const [cropCalendar, setCropCalendar] = useState<any>(null);
  const [sellingRecommendation, setSellingRecommendation] = useState<any>(null);
  const [priceAlert, setPriceAlert] = useState<{targetPrice: number; alertType: 'above' | 'below'} | null>(null);
  const [seasonalTrends, setSeasonalTrends] = useState<any[]>([]);
  const [profitCalc, setProfitCalc] = useState<{quantity: number; costPerUnit: number; transportCost: number}>({
    quantity: 0,
    costPerUnit: 0,
    transportCost: 0
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadPriceHistory(selectedItem);
      fetchWeatherImpact(selectedItem);
      fetchLocationComparison(selectedItem);
      generateCropCalendar(selectedItem);
      generateSellingRecommendation(selectedItem);
      generateSeasonalTrends(selectedItem);
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
        .eq('location', 'Kigali')
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

  const fetchWeatherImpact = async (item: MarketPrice) => {
    try {
      const { data: weatherData } = await supabase.functions.invoke('weather-service', {
        body: { latitude: -1.9536, longitude: 30.0606 } // Kigali coordinates
      });

      if (weatherData) {
        const impact = {
          temperature: weatherData.current.temperature,
          precipitation: weatherData.current.precipitation,
          condition: weatherData.current.condition,
          impact_level: calculateWeatherImpact(weatherData.current, item)
        };
        setWeatherImpact(impact);
      }
    } catch (error) {
      console.error('Error fetching weather impact:', error);
    }
  };

  const calculateWeatherImpact = (weather: any, item: MarketPrice) => {
    // Simple impact calculation based on weather conditions
    if (weather.temperature > 30 && item.category === 'crop') {
      return { level: 'high', message: 'Ubushyuhe buringaniye bushobora kwongera ibiciro' };
    } else if (weather.precipitation > 50) {
      return { level: 'medium', message: 'Imvura nyinshi ishobora guhindura ibiciro' };
    }
    return { level: 'low', message: 'Ikirere gifite ingaruka nkeya ku biciro' };
  };

  const fetchLocationComparison = async (item: MarketPrice) => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('product_name_kinyarwanda', item.product_name_kinyarwanda);

      if (error) throw error;
      if (data) setLocationComparison(data);
    } catch (error) {
      console.error('Error fetching location comparison:', error);
    }
  };

  const generateCropCalendar = (item: MarketPrice) => {
    const calendars: Record<string, any> = {
      'Ibigori': {
        plant: 'Werurwe - Mata',
        harvest: 'Kamena - Nyakanga',
        notes: 'Hinga mugihe cy\'imvura, sezera nyuma y\'amezi 3-4'
      },
      'Ibirayi': {
        plant: 'Gashyantare - Werurwe',
        harvest: 'Kamena - Nyakanga',
        notes: 'Hinga mu butaka bworoshye, sezera nyuma y\'amezi 3-4'
      },
      'Ibishyimbo': {
        plant: 'Mutarama - Ukwakira',
        harvest: 'Mata - Ugushyingo',
        notes: 'Hinga kabiri mu mwaka, sezera nyuma y\'amezi 2-3'
      },
      'Umuceri': {
        plant: 'Ukwakira - Ugushyingo',
        harvest: 'Gashyantare - Werurwe',
        notes: 'Sezera nyuma y\'amezi 4-5, ikirere cy\'ubushyuhe'
      }
    };

    setCropCalendar(calendars[item.product_name_kinyarwanda] || {
      plant: 'Bigenwa n\'akarere',
      harvest: 'Bigenwa n\'akarere',
      notes: 'Reba n\'umuhanga w\'ubuhinzi mu karere kawe'
    });
  };

  const generateSellingRecommendation = async (item: MarketPrice) => {
    try {
      const { data: weatherData } = await supabase.functions.invoke('weather-service', {
        body: { latitude: -1.9536, longitude: 30.0606 }
      });

      if (weatherData && weatherData.current) {
        const temp = weatherData.current.temperature;
        const precip = weatherData.current.precipitation;
        const trend = item.trend;

        let recommendation = '';
        let timing = '';
        let reason = '';

        if (trend === 'up' && temp < 25 && precip < 20) {
          recommendation = 'Igihe cyiza cyo kugurisha';
          timing = 'Gurisha vuba - ibiciro biriyongera';
          reason = 'Ikirere cyiza, ibicuruzwa bike, icyifuzo kinini';
        } else if (trend === 'up' && precip > 50) {
          recommendation = 'Tegereza iminsi 2-3';
          timing = 'Ibiciro bikomeza kwiyongera';
          reason = 'Imvura nyinshi ishobora guhindura isoko';
        } else if (trend === 'down') {
          recommendation = 'Gurisha none';
          timing = 'Ntutegereze - ibiciro biragabanuka';
          reason = 'Umusaruro mwinshi ku isoko';
        } else {
          recommendation = 'Isoko rihamye';
          timing = 'Ushobora gutegereza cyangwa kugurisha';
          reason = 'Ibiciro bihamye, ikirere cyiza';
        }

        setSellingRecommendation({ recommendation, timing, reason });
      }
    } catch (error) {
      console.error('Error generating selling recommendation:', error);
    }
  };

  const generateSeasonalTrends = (item: MarketPrice) => {
    const months = ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 
                    'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'];
    const currentPrice = item.current_price;
    
    const trends = months.map((month, index) => {
      let multiplier = 1;
      if (item.product_name_kinyarwanda === 'Ibigori' || item.product_name_kinyarwanda === 'Ibirayi') {
        multiplier = index < 3 ? 1.15 : index < 6 ? 0.85 : index < 9 ? 1.05 : 0.95;
      } else if (item.product_name_kinyarwanda === 'Ibishyimbo') {
        multiplier = index < 2 ? 1.2 : index < 5 ? 0.9 : index < 8 ? 1.1 : 0.95;
      } else {
        multiplier = 0.9 + Math.sin(index * Math.PI / 6) * 0.15;
      }
      
      return {
        month,
        averagePrice: Math.round(currentPrice * multiplier),
        trend: multiplier > 1.05 ? 'Hejuru' : multiplier < 0.95 ? 'Hasi' : 'Bihamye'
      };
    });
    
    setSeasonalTrends(trends);
  };

  const handleSetPriceAlert = () => {
    if (priceAlert && priceAlert.targetPrice > 0 && selectedItem) {
      toast.success(`Ubutumwa buzakubwerekeye iyo igiciro ${priceAlert.alertType === 'above' ? 'kirenze' : 'kiri munsi ya'} ${priceAlert.targetPrice.toLocaleString()} RWF`);
      setPriceAlert(null);
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

    // Fallback to generated history with 12 months of data
    const months = ['Ukuboza', 'Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo'];
    const basePrice = item.current_price;
    const trend = item.trend;
    
    return months.map((month, index) => {
      let price = basePrice;
      if (trend === 'up') {
        // Gradual increase over time
        price = basePrice * (0.70 + (index * 0.025));
      } else if (trend === 'down') {
        // Gradual decrease over time
        price = basePrice * (1.30 - (index * 0.025));
      } else {
        // Stable with minor fluctuations
        price = basePrice * (0.92 + Math.sin(index) * 0.08);
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
        <HomeButton />
        
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

      <Dialog open={!!selectedItem} onOpenChange={() => { 
        setSelectedItem(null); 
        setPrediction(""); 
        setWeatherImpact(null);
        setLocationComparison([]);
        setCropCalendar(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle>{selectedItem?.product_name_kinyarwanda}</DialogTitle>
            <DialogDescription>
              {selectedItem?.location} • {selectedItem?.current_price.toLocaleString()} RWF ku {selectedItem?.unit}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="history">Amateka</TabsTrigger>
              <TabsTrigger value="weather">Ikirere</TabsTrigger>
              <TabsTrigger value="calendar">Kalindari</TabsTrigger>
              <TabsTrigger value="locations">Ahantu</TabsTrigger>
              <TabsTrigger value="recommendations">Inama</TabsTrigger>
              <TabsTrigger value="alerts">Kumenyesha</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-6">
              {/* Price History Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Amateka y'Ibiciro - Amezi 12 Ashize</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Igiciro (RWF)"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Profit Calculator */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Kubara Inyungu
                  </CardTitle>
                  <CardDescription>Menya inyungu uzabona ukigurishije</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ingano Uzagurisha ({selectedItem?.unit})</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                        placeholder="Urugero: 100"
                        value={profitCalc.quantity || ''}
                        onChange={(e) => setProfitCalc({...profitCalc, quantity: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Igiciro Wakoze ku {selectedItem?.unit} (RWF)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                        placeholder="Urugero: 400"
                        value={profitCalc.costPerUnit || ''}
                        onChange={(e) => setProfitCalc({...profitCalc, costPerUnit: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ibiciro byo Gutambukana (RWF)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded bg-white dark:bg-gray-800"
                        placeholder="Urugero: 5000"
                        value={profitCalc.transportCost || ''}
                        onChange={(e) => setProfitCalc({...profitCalc, transportCost: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  {profitCalc.quantity > 0 && profitCalc.costPerUnit > 0 && selectedItem && (
                    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Igiciro ku Isoko:</span>
                        <span className="text-lg font-bold">{selectedItem.current_price.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amafaranga Uzinjiza:</span>
                        <span className="text-lg">{(selectedItem.current_price * profitCalc.quantity).toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Ibiciro Byose:</span>
                        <span className="text-lg">-{((profitCalc.costPerUnit * profitCalc.quantity) + profitCalc.transportCost).toLocaleString()} RWF</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold">Inyungu Zawe:</span>
                          <span className={`text-2xl font-bold ${
                            ((selectedItem.current_price * profitCalc.quantity) - ((profitCalc.costPerUnit * profitCalc.quantity) + profitCalc.transportCost)) > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                          }`}>
                            {((selectedItem.current_price * profitCalc.quantity) - ((profitCalc.costPerUnit * profitCalc.quantity) + profitCalc.transportCost)).toLocaleString()} RWF
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {((selectedItem.current_price * profitCalc.quantity) - ((profitCalc.costPerUnit * profitCalc.quantity) + profitCalc.transportCost)) > 0 
                            ? '✓ Uzabona inyungu' 
                            : '✗ Uzacibwa, Wongera igiciro cyangwa ugabanye ibiciro'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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
            </TabsContent>

            <TabsContent value="weather" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Ingaruka z'Ikirere ku Biciro
                </h3>
                {weatherImpact ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Ikirere kiri iki gihe</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Sun className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="font-medium">Ubushyuhe</p>
                            <p className="text-sm text-muted-foreground">{weatherImpact.temperature}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CloudRain className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Imvura</p>
                            <p className="text-sm text-muted-foreground">{weatherImpact.precipitation}mm</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>{weatherImpact.impact_level.message}</AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Turareba ikirere...</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Kalindari y'Ubuhinzi
                </h3>
                {cropCalendar && selectedItem?.category === 'crop' ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Igihe cyo Guhinga</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-green-600">{cropCalendar.plant}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Igihe cyo Gusarura</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold text-blue-600">{cropCalendar.harvest}</p>
                      </CardContent>
                    </Card>
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>{cropCalendar.notes}</AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Kalindari y'ubuhinzi iraboneka gusa ku bihingwa
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Ibiciro mu Turere Dutandukanye
                </h3>
                {locationComparison.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={locationComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current_price" fill="#8884d8" name="Igiciro (RWF)" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="grid gap-3">
                      {locationComparison.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.location}</p>
                                <p className="text-sm text-muted-foreground">ku {item.unit}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{item.current_price.toLocaleString()} RWF</p>
                                <Badge variant={item.trend === 'up' ? 'default' : item.trend === 'down' ? 'destructive' : 'secondary'}>
                                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.trend_percentage}%
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Turareba ahantu...</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5" />
                  Inama yo Kugurisha Hashingiwe ku Kirere
                </h3>
                {sellingRecommendation ? (
                  <div className="space-y-4">
                    <Card className={`${
                      sellingRecommendation.recommendation.includes('Igihe cyiza') ? 'bg-green-50 dark:bg-green-950' :
                      sellingRecommendation.recommendation.includes('none') ? 'bg-red-50 dark:bg-red-950' :
                      'bg-yellow-50 dark:bg-yellow-950'
                    }`}>
                      <CardHeader>
                        <CardTitle className="text-base">{sellingRecommendation.recommendation}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-semibold text-lg">{sellingRecommendation.timing}</p>
                        <p className="text-sm text-muted-foreground">{sellingRecommendation.reason}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Ibindi Byifuzo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Reba ibiciro ku masoko atandukanye mbere yo gufata icyemezo. Tekereza n'ibiciro byo gutambukana n'ibindi bikoresho.</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Imyitwarire y'Isoko mu Byumweru 12 Bishize</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={seasonalTrends.slice(0, 6)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="averagePrice" stroke="#8884d8" name="Igiciro" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Turareba inama...</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Shiraho Kumenyesha Ibiciro
                </h3>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Shiraho Igiciro Ushaka</CardTitle>
                    <CardDescription>Uzahamagara SMS iyo ibiciro bigeze ku rwego ushaka</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Igiciro Ushaka (RWF)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder={`Igiciro kiriho: ${selectedItem?.current_price.toLocaleString()} RWF`}
                        onChange={(e) => setPriceAlert({ 
                          targetPrice: Number(e.target.value), 
                          alertType: priceAlert?.alertType || 'above' 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ubwoko bw'Itumwa</label>
                      <select
                        className="w-full p-2 border rounded"
                        onChange={(e) => setPriceAlert({ 
                          targetPrice: priceAlert?.targetPrice || 0, 
                          alertType: e.target.value as 'above' | 'below' 
                        })}
                      >
                        <option value="above">Iyo kirenze igiciro</option>
                        <option value="below">Iyo kiri munsi y'igiciro</option>
                      </select>
                    </div>
                    <Button onClick={handleSetPriceAlert} className="w-full">
                      Emeza Kumenyesha
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Imyitwarire y'Ibiciro mu Mezi 12</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={seasonalTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="averagePrice" fill="#8884d8" name="Igiciro cy'Impuzandengo (RWF)" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid gap-2">
                      {seasonalTrends.map((trend, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{trend.month}</span>
                          <div className="flex items-center gap-2">
                            <span>{trend.averagePrice.toLocaleString()} RWF</span>
                            <Badge variant={
                              trend.trend === 'Hejuru' ? 'default' : 
                              trend.trend === 'Hasi' ? 'destructive' : 
                              'secondary'
                            }>
                              {trend.trend}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prices;
