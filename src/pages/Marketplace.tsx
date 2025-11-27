import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, MapPin, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity: string;
  location: string;
  image_url: string | null;
  contact_phone: string | null;
  created_at: string;
}

const Marketplace = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "crops",
    price: "",
    unit: "kg",
    quantity: "",
    location: "",
    contact_phone: ""
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({ title: "Ikosa", description: "Ntibyashobotse gukuramo ibyagurishwa", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Ikosa", description: "Ugomba kwinjira kugirango ugire icyo ugurishije", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert([{
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          unit: formData.unit,
          quantity: formData.quantity,
          location: formData.location,
          contact_phone: formData.contact_phone,
          status: 'active'
        }]);

      if (error) throw error;

      toast({ title: "Byakunze!", description: "Icyagurishwa cyawe cyongewe neza" });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "crops",
        price: "",
        unit: "kg",
        quantity: "",
        location: "",
        contact_phone: ""
      });
      fetchListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({ title: "Ikosa", description: "Ntibyashobotse kongeramo icyagurishwa", variant: "destructive" });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      crops: "bg-green-500/10 text-green-600 border-green-500/20",
      livestock: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      equipment: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      other: "bg-gray-500/10 text-gray-600 border-gray-500/20"
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Isoko ry'Abahinzi</h1>
              <p className="text-muted-foreground">Gurishanya ibihingwa n'ibikoresho</p>
            </div>
            
            {user && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ongeramo Icyagurishwa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ongeramo Icyagurishwa Gishya</DialogTitle>
                    <DialogDescription>Uzuza amakuru y'icyagurishwa cyawe</DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Izina ry'Icyagurishwa *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Urugero: Ibigori bya Quality"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ibisobanuro</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Sobanura icyagurishwa cyawe..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Ubwoko *</label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crops">Ibihingwa</SelectItem>
                            <SelectItem value="livestock">Amatungo</SelectItem>
                            <SelectItem value="equipment">Ibikoresho</SelectItem>
                            <SelectItem value="other">Ibindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Igipimo *</label>
                        <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kg</SelectItem>
                            <SelectItem value="umutwe">Umutwe</SelectItem>
                            <SelectItem value="igisenge">Igisenge</SelectItem>
                            <SelectItem value="umubumbe">Umubumbe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Igiciro (RWF) *</label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="45000"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Ingano</label>
                        <Input
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="100 kg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ahantu *</label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Kigali, Rwanda"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Nimero ya Telefoni</label>
                      <Input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+250 788 123 456"
                      />
                    </div>

                    <Button type="submit" className="w-full">Ohereza</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">Gutegura...</div>
          ) : listings.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nta cyagurishwa kiri hano ubu</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                      <Badge className={getCategoryBadge(listing.category)}>
                        {listing.category === 'crops' ? 'Ibihingwa' : 
                         listing.category === 'livestock' ? 'Amatungo' :
                         listing.category === 'equipment' ? 'Ibikoresho' : 'Ibindi'}
                      </Badge>
                    </div>
                    <CardDescription>{listing.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          {listing.price.toLocaleString()} RWF
                        </span>
                        <span className="text-sm text-muted-foreground">/{listing.unit}</span>
                      </div>
                      
                      {listing.quantity && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span>{listing.quantity}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                      
                      {listing.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${listing.contact_phone}`} className="text-primary hover:underline">
                            {listing.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
