import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Investment {
  id: string;
  cropName: string;
  quantityKg: number;
  costPerKg: number;
  otherCosts: number;
}

interface PredictionResult {
  cropName: string;
  investedAmount: number;
  currentMarketPrice: number;
  estimatedRevenue: number;
  estimatedProfit: number;
  profitMargin: number;
  recommendation: string;
}

const FinanceCalculator = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([
    { id: "1", cropName: "", quantityKg: 0, costPerKg: 0, otherCosts: 0 }
  ]);
  const [marketPrices, setMarketPrices] = useState<{ product_name: string; product_name_kinyarwanda: string; current_price: number; unit: string; trend: string }[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalSummary, setTotalSummary] = useState<{ totalInvested: number; totalRevenue: number; totalProfit: number } | null>(null);

  useEffect(() => {
    fetchMarketPrices();
  }, []);

  const fetchMarketPrices = async () => {
    const { data } = await supabase
      .from("market_prices")
      .select("product_name, product_name_kinyarwanda, current_price, unit, trend")
      .order("product_name");
    if (data) setMarketPrices(data);
  };

  const addInvestment = () => {
    setInvestments(prev => [...prev, {
      id: Date.now().toString(),
      cropName: "",
      quantityKg: 0,
      costPerKg: 0,
      otherCosts: 0
    }]);
  };

  const removeInvestment = (id: string) => {
    if (investments.length > 1) {
      setInvestments(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateInvestment = (id: string, field: keyof Investment, value: string | number) => {
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const analyzeInvestments = async () => {
    const validInvestments = investments.filter(i => i.cropName && i.quantityKg > 0);
    if (validInvestments.length === 0) {
      toast({ title: t("finance.error"), description: t("finance.addInvestment"), variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const results: PredictionResult[] = [];
      
      for (const inv of validInvestments) {
        const marketItem = marketPrices.find(p => p.product_name === inv.cropName || p.product_name_kinyarwanda === inv.cropName);
        const currentPrice = marketItem?.current_price || 0;
        const totalCost = (inv.quantityKg * inv.costPerKg) + inv.otherCosts;
        const estimatedRevenue = inv.quantityKg * currentPrice;
        const profit = estimatedRevenue - totalCost;
        const margin = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        // Get AI prediction
        let recommendation = "";
        try {
          const { data } = await supabase.functions.invoke("market-prediction", {
            body: {
              cropName: inv.cropName,
              currentPrice,
              weather: "normal",
              location: "Kigali"
            }
          });
          recommendation = data?.prediction || (profit > 0 ? t("finance.profitAdvice") : t("finance.lossAdvice"));
        } catch {
          recommendation = profit > 0 ? t("finance.profitAdvice") : t("finance.lossAdvice");
        }

        results.push({
          cropName: inv.cropName,
          investedAmount: totalCost,
          currentMarketPrice: currentPrice,
          estimatedRevenue,
          estimatedProfit: profit,
          profitMargin: margin,
          recommendation
        });
      }

      setPredictions(results);
      setTotalSummary({
        totalInvested: results.reduce((s, r) => s + r.investedAmount, 0),
        totalRevenue: results.reduce((s, r) => s + r.estimatedRevenue, 0),
        totalProfit: results.reduce((s, r) => s + r.estimatedProfit, 0)
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: t("finance.error"), description: t("common.error"), variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Investment Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            {t("finance.title")}
          </CardTitle>
          <CardDescription>{t("finance.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {investments.map((inv, index) => (
            <Card key={inv.id} className="p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">{t("finance.investment")} #{index + 1}</h4>
                {investments.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeInvestment(inv.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("finance.crop")}</Label>
                  <Select value={inv.cropName} onValueChange={v => updateInvestment(inv.id, "cropName", v)}>
                    <SelectTrigger><SelectValue placeholder={t("finance.selectCrop")} /></SelectTrigger>
                    <SelectContent>
                      {marketPrices.map(p => (
                        <SelectItem key={p.product_name} value={p.product_name}>
                          {p.product_name_kinyarwanda} ({p.product_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t("finance.quantity")} (kg)</Label>
                  <Input type="number" min="0" value={inv.quantityKg || ""} onChange={e => updateInvestment(inv.id, "quantityKg", Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">{t("finance.costPerKg")} (RWF)</Label>
                  <Input type="number" min="0" value={inv.costPerKg || ""} onChange={e => updateInvestment(inv.id, "costPerKg", Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">{t("finance.otherCosts")} (RWF)</Label>
                  <Input type="number" min="0" value={inv.otherCosts || ""} onChange={e => updateInvestment(inv.id, "otherCosts", Number(e.target.value))} />
                </div>
              </div>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addInvestment} className="flex-1">
              <Plus className="w-4 h-4 mr-2" /> {t("finance.addMore")}
            </Button>
            <Button onClick={analyzeInvestments} disabled={isAnalyzing} className="flex-1">
              {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
              {isAnalyzing ? t("finance.analyzing") : t("finance.analyze")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Total Summary */}
      {totalSummary && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {t("finance.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">{t("finance.totalInvested")}</p>
                <p className="text-lg font-bold text-foreground">{totalSummary.totalInvested.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("finance.totalRevenue")}</p>
                <p className="text-lg font-bold text-foreground">{totalSummary.totalRevenue.toLocaleString()} RWF</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("finance.totalProfit")}</p>
                <p className={`text-lg font-bold ${totalSummary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalSummary.totalProfit >= 0 ? "+" : ""}{totalSummary.totalProfit.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-crop Results */}
      {predictions.map((pred, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{pred.cropName}</CardTitle>
              <Badge className={pred.estimatedProfit >= 0 ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}>
                {pred.estimatedProfit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {pred.profitMargin.toFixed(1)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">{t("finance.invested")}:</span>
                <span className="font-medium">{pred.investedAmount.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">{t("finance.marketPrice")}:</span>
                <span className="font-medium">{pred.currentMarketPrice.toLocaleString()} RWF/kg</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/30 rounded">
                <span className="text-muted-foreground">{t("finance.revenue")}:</span>
                <span className="font-medium">{pred.estimatedRevenue.toLocaleString()} RWF</span>
              </div>
              <div className={`flex justify-between p-2 rounded ${pred.estimatedProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <span className="text-muted-foreground">{t("finance.profit")}:</span>
                <span className={`font-bold ${pred.estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {pred.estimatedProfit >= 0 ? "+" : ""}{pred.estimatedProfit.toLocaleString()} RWF
                </span>
              </div>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-medium text-primary mb-1">💡 {t("finance.aiAdvice")}</p>
              <p className="text-sm text-muted-foreground">{pred.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FinanceCalculator;
