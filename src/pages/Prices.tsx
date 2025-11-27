import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const Prices = () => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const generatePriceHistory = (currentPrice: number, trending: string) => {
    const history = [];
    let price = currentPrice;
    const variation = trending === "up" ? 1.02 : trending === "down" ? 0.98 : 1;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 30);
      price = price / variation;
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        price: Math.round(price)
      });
    }
    
    return history.reverse();
  };

  const crops = [
    { name: "Maize / Ibigori", price: 45000, unit: "kg", change: 5, trending: "up" },
    { name: "Beans / Ibishyimbo", price: 38000, unit: "kg", change: 8, trending: "up" },
    { name: "Rice / Umuceri", price: 52000, unit: "kg", change: 2, trending: "up" },
    { name: "Coffee / Ikawa", price: 125000, unit: "kg", change: 8, trending: "up" },
    { name: "Tea / Icyayi", price: 89000, unit: "kg", change: 4, trending: "up" },
    { name: "Cassava / Imyumbati", price: 28000, unit: "kg", change: 0, trending: "stable" },
    { name: "Potatoes / Ibirayi", price: 42000, unit: "kg", change: -2, trending: "down" },
    { name: "Bananas / Ibitoki", price: 35000, unit: "kg", change: 3, trending: "up" },
  ];

  const livestock = [
    { name: "Cattle / Inka", price: 1200000, unit: "head", change: 7, trending: "up" },
    { name: "Goats / Ihene", price: 180000, unit: "head", change: 0, trending: "stable" },
    { name: "Chickens / Inkoko", price: 8000, unit: "kg", change: -2, trending: "down" },
    { name: "Pigs / Ingurube", price: 350000, unit: "head", change: 4, trending: "up" },
    { name: "Eggs (dozen) / Amagi", price: 4500, unit: "dozen", change: 0, trending: "stable" },
    { name: "Milk (liter) / Amata", price: 1200, unit: "liter", change: 1, trending: "up" },
  ];

  const renderPriceCard = (item: any) => (
    <Card 
      key={item.name} 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedItem(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-2xl font-bold text-primary">
              {item.price.toLocaleString()} RWF
              <span className="text-sm text-muted-foreground ml-1">/{item.unit}</span>
            </p>
          </div>
          <Badge
            variant={item.trending === "up" ? "default" : item.trending === "down" ? "destructive" : "secondary"}
            className="flex items-center gap-1"
          >
            {item.trending === "up" && <TrendingUp className="w-3 h-3" />}
            {item.trending === "down" && <TrendingDown className="w-3 h-3" />}
            {item.change !== 0 ? `${item.change > 0 ? "+" : ""}${item.change}%` : t('prices.stable')}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {item.trending === "up" ? t('prices.up') : item.trending === "down" ? t('prices.down') : t('prices.stable')}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('prices.marketPrices')}
            </h1>
            <p className="text-muted-foreground">
              {t('prices.realTimePricing')}
            </p>
          </div>

          {/* Crops Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{t('prices.cropPrices')}</CardTitle>
              <CardDescription>{t('prices.currentRates')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map(renderPriceCard)}
              </div>
            </CardContent>
          </Card>

          {/* Livestock Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('prices.livestockProduce')}</CardTitle>
              <CardDescription>{t('prices.currentRates')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {livestock.map(renderPriceCard)}
              </div>
            </CardContent>
          </Card>

          {/* Market Info */}
          <Card className="mt-6 bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle>{t('prices.marketInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">{t('prices.lastUpdated')}:</span>
                <span className="font-medium">Today, 2:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">{t('prices.marketStatus')}:</span>
                <Badge variant="default">{t('prices.open')}</Badge>
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                * Prices are indicative and may vary by location and quality. 
                Please verify with local markets before making transactions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Price Chart Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedItem?.name} {t('prices.priceHistory')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('prices.currentPrice')}</p>
                <p className="text-3xl font-bold text-primary">
                  {selectedItem?.price?.toLocaleString()} RWF
                  <span className="text-base text-muted-foreground ml-2">/{selectedItem?.unit}</span>
                </p>
              </div>
              <Badge
                variant={selectedItem?.trending === "up" ? "default" : selectedItem?.trending === "down" ? "destructive" : "secondary"}
                className="flex items-center gap-1 px-4 py-2 text-base"
              >
                {selectedItem?.trending === "up" && <TrendingUp className="w-4 h-4" />}
                {selectedItem?.trending === "down" && <TrendingDown className="w-4 h-4" />}
                {selectedItem?.change !== 0 ? `${selectedItem?.change > 0 ? "+" : ""}${selectedItem?.change}%` : t('prices.stable')}
              </Badge>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedItem ? generatePriceHistory(selectedItem.price, selectedItem.trending) : []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: any) => [`${value.toLocaleString()} RWF`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Price history over the last 6 months
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prices;