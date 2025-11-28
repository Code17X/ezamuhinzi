import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<MarketPrice | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    product_name: "",
    product_name_kinyarwanda: "",
    category: "crop",
    current_price: "",
    unit: "",
    location: "",
    trend: "stable",
    trend_percentage: "",
    price_factors: ""
  });

  useEffect(() => {
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchPrices();
    }
  }, [isAdmin]);

  const checkAdmin = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error("Ntabwo ufite uburenganzira bwo kubona uyu rubuga");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('product_name_kinyarwanda');

      if (error) throw error;
      setPrices(data || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error("Habaye ikosa mu gushaka ibiciro");
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      product_name_kinyarwanda: "",
      category: "crop",
      current_price: "",
      unit: "",
      location: "",
      trend: "stable",
      trend_percentage: "",
      price_factors: ""
    });
    setEditingPrice(null);
  };

  const handleEdit = (price: MarketPrice) => {
    setEditingPrice(price);
    setFormData({
      product_name: price.product_name,
      product_name_kinyarwanda: price.product_name_kinyarwanda,
      category: price.category,
      current_price: price.current_price.toString(),
      unit: price.unit,
      location: price.location,
      trend: price.trend,
      trend_percentage: price.trend_percentage?.toString() || "",
      price_factors: price.price_factors.join("\n")
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ushaka gusiba iyi mirimo?")) return;

    try {
      const { error } = await supabase
        .from('market_prices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Byasibwe neza!");
      fetchPrices();
    } catch (error) {
      console.error('Error deleting price:', error);
      toast.error("Habaye ikosa mu gusiba");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceData = {
      product_name: formData.product_name,
      product_name_kinyarwanda: formData.product_name_kinyarwanda,
      category: formData.category,
      current_price: parseFloat(formData.current_price),
      unit: formData.unit,
      location: formData.location,
      trend: formData.trend,
      trend_percentage: formData.trend_percentage ? parseFloat(formData.trend_percentage) : null,
      price_factors: formData.price_factors.split("\n").filter(f => f.trim()),
      updated_by: user?.id
    };

    try {
      if (editingPrice) {
        const { error } = await supabase
          .from('market_prices')
          .update(priceData)
          .eq('id', editingPrice.id);

        if (error) throw error;
        toast.success("Byavuguruwe neza!");
      } else {
        const { error } = await supabase
          .from('market_prices')
          .insert(priceData);

        if (error) throw error;
        toast.success("Byongeweho neza!");
      }

      setShowDialog(false);
      resetForm();
      fetchPrices();
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error("Habaye ikosa mu kubika");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Kurimo...</p>
    </div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Gucunga Ibiciro</h1>
              <p className="text-muted-foreground">Koresha, Hindura, cyangwa Siba Ibiciro ku Isoko</p>
            </div>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Ongeraho Igiciro
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.map((price) => (
              <Card key={price.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{price.product_name_kinyarwanda}</CardTitle>
                      <CardDescription>{price.location}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{price.current_price.toLocaleString()} RWF</p>
                    <p className="text-sm text-muted-foreground">ku {price.unit}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(price)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Hindura
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(price.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Siba
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPrice ? "Hindura Igiciro" : "Ongeraho Igiciro Gishya"}</DialogTitle>
            <DialogDescription>
              Uzuza amakuru yose akenewe
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_name">Izina (English)</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="product_name_kinyarwanda">Izina (Kinyarwanda)</Label>
                <Input
                  id="product_name_kinyarwanda"
                  value={formData.product_name_kinyarwanda}
                  onChange={(e) => setFormData({...formData, product_name_kinyarwanda: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Icyiciro</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop">Ibihingwa</SelectItem>
                    <SelectItem value="livestock">Amatungo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Ahantu</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Kigali, Musanze, etc."
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_price">Igiciro (RWF)</Label>
                <Input
                  id="current_price"
                  type="number"
                  value={formData.current_price}
                  onChange={(e) => setFormData({...formData, current_price: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Igipimo</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="kg, liter, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="trend">Ihinduka</Label>
                <Select value={formData.trend} onValueChange={(value) => setFormData({...formData, trend: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Irazamuka</SelectItem>
                    <SelectItem value="down">Iragabanuka</SelectItem>
                    <SelectItem value="stable">Ntihinduka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="trend_percentage">Ijanisha ry'Ihinduka (%)</Label>
              <Input
                id="trend_percentage"
                type="number"
                step="0.1"
                value={formData.trend_percentage}
                onChange={(e) => setFormData({...formData, trend_percentage: e.target.value})}
                placeholder="+5, -3, etc."
              />
            </div>

            <div>
              <Label htmlFor="price_factors">Impamvu z'Igiciro (umurongo ku murongo)</Label>
              <Textarea
                id="price_factors"
                value={formData.price_factors}
                onChange={(e) => setFormData({...formData, price_factors: e.target.value})}
                placeholder="Ibihe byiza&#10;Ikirere kiryoha&#10;Ibicuruzwa byiyongereye"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingPrice ? "Bika Impinduka" : "Ongeraho"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                Hagarika
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;