import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, MapPin, Trash2, Building2, ShoppingBag } from "lucide-react";

interface Listing {
  id: string;
  user_id: string;
  service_name: string;
  provider_name: string;
  phone_number: string;
  service_cost: string;
  location: string;
  description: string | null;
  created_at: string;
}

interface Industry {
  id: string;
  name: string;
  phone_number: string;
  location: string;
  description: string | null;
  created_at: string;
}

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  unit: string;
  quantity: string | null;
  category: string;
  location: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

const Marketplace = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newListing, setNewListing] = useState({
    service_name: '',
    provider_name: '',
    phone_number: '',
    service_cost: '',
    location: '',
    description: ''
  });
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    quantity: '',
    category: 'crop',
    location: '',
    contact_phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load service listings
    const { data: listingsData } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (listingsData) setListings(listingsData);

    // Load industries
    const { data: industriesData } = await supabase
      .from('industries')
      .select('*')
      .order('name');

    if (industriesData) setIndustries(industriesData);

    // Load products
    const { data: productsData } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (productsData) setProducts(productsData);
  };

  const handleCreateListing = async () => {
    if (!user || !newListing.service_name || !newListing.provider_name || 
        !newListing.phone_number || !newListing.service_cost || !newListing.location) {
      toast({
        title: "Uzuza byose",
        description: "Uzuza amakuru yose akenewe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('services').insert({
        user_id: user.id,
        service_name: newListing.service_name,
        provider_name: newListing.provider_name,
        phone_number: newListing.phone_number,
        service_cost: newListing.service_cost,
        location: newListing.location,
        description: newListing.description || null
      });

      if (error) throw error;

      toast({ title: "Byakozwe neza!" });
      setNewListing({
        service_name: '',
        provider_name: '',
        phone_number: '',
        service_cost: '',
        location: '',
        description: ''
      });
      setIsCreatingListing(false);
      loadData();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Byasibwe!" });
      loadData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleCreateProduct = async () => {
    if (!user || !newProduct.title || !newProduct.price || !newProduct.location || !newProduct.contact_phone) {
      toast({
        title: "Uzuza byose",
        description: "Uzuza amakuru yose akenewe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: user.id,
        title: newProduct.title,
        description: newProduct.description || null,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        quantity: newProduct.quantity || null,
        category: newProduct.category,
        location: newProduct.location,
        contact_phone: newProduct.contact_phone,
        status: 'active'
      });

      if (error) throw error;

      // Send SMS notification to subscribed users
      try {
        await supabase.functions.invoke('send-marketplace-alert', {
          body: {
            productTitle: newProduct.title,
            price: newProduct.price,
            location: newProduct.location,
            category: newProduct.category
          }
        });
      } catch (smsError) {
        console.error('Error sending SMS alert:', smsError);
        // Don't block product creation if SMS fails
      }

      toast({ title: "Icyicuruzwa cyashyizwe!" });
      setNewProduct({
        title: '',
        description: '',
        price: '',
        unit: 'kg',
        quantity: '',
        category: 'crop',
        location: '',
        contact_phone: ''
      });
      setIsCreatingProduct(false);
      loadData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Byasibwe!" });
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Tanga Akazi</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Ibicuruzwa</TabsTrigger>
            <TabsTrigger value="services">Serivisi</TabsTrigger>
            <TabsTrigger value="industries">Inganda</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {user && (
              <Card>
                <CardHeader>
                  <Button 
                    onClick={() => setIsCreatingProduct(!isCreatingProduct)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tanga Icyicuruzwa Cyawe
                  </Button>
                </CardHeader>
                
                {isCreatingProduct && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Izina ry'Icyicuruzwa</Label>
                      <Input
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="Urugero: Ibigori byiza"
                      />
                    </div>

                    <div>
                      <Label>Icyiciro</Label>
                      <Select value={newProduct.category} onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">Ibihingwa</SelectItem>
                          <SelectItem value="livestock">Amatungo</SelectItem>
                          <SelectItem value="equipment">Ibikoresho</SelectItem>
                          <SelectItem value="other">Ibindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Igiciro</Label>
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <Label>Igipimo</Label>
                        <Select value={newProduct.unit} onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="piece">piece</SelectItem>
                            <SelectItem value="bag">bag</SelectItem>
                            <SelectItem value="liter">liter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Ingano (Optional)</Label>
                      <Input
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        placeholder="Urugero: 100kg"
                      />
                    </div>

                    <div>
                      <Label>Aho Uhereye</Label>
                      <Input
                        value={newProduct.location}
                        onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                        placeholder="Urugero: Kigali, Gasabo"
                      />
                    </div>

                    <div>
                      <Label>Numero ya Telefone</Label>
                      <Input
                        type="tel"
                        value={newProduct.contact_phone}
                        onChange={(e) => setNewProduct({ ...newProduct, contact_phone: e.target.value })}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>

                    <div>
                      <Label>Ibisobanuro (Optional)</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Sobanura icyicuruzwa cyawe..."
                      />
                    </div>

                    <Button onClick={handleCreateProduct} className="w-full">
                      Ohereza
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Products List */}
            <div className="grid gap-4 md:grid-cols-2">
              {products.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nta bicuruzwa biboneka</p>
                  </CardContent>
                </Card>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{product.title}</span>
                        {user && product.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {product.price.toLocaleString()} RWF
                          <span className="text-sm font-normal text-muted-foreground ml-2">/ {product.unit}</span>
                        </p>
                        {product.quantity && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Ingano: {product.quantity}
                          </p>
                        )}
                      </div>

                      {product.contact_phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${product.contact_phone}`} className="hover:text-primary">
                            {product.contact_phone}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{product.location}</span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-muted-foreground pt-2 border-t">
                          {product.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {user && (
              <Card>
                <CardHeader>
                  <Button 
                    onClick={() => setIsCreatingListing(!isCreatingListing)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tanga Serivisi Yawe
                  </Button>
                </CardHeader>
                
                {isCreatingListing && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Izina rya Serivisi</Label>
                      <Input
                        value={newListing.service_name}
                        onChange={(e) => setNewListing({ ...newListing, service_name: e.target.value })}
                        placeholder="Urugero: Umuganga w'amatungo"
                      />
                    </div>

                    <div>
                      <Label>Amazina Yawe</Label>
                      <Input
                        value={newListing.provider_name}
                        onChange={(e) => setNewListing({ ...newListing, provider_name: e.target.value })}
                        placeholder="Izina ryawe ryuzuye"
                      />
                    </div>

                    <div>
                      <Label>Numero ya Telefone</Label>
                      <Input
                        value={newListing.phone_number}
                        onChange={(e) => setNewListing({ ...newListing, phone_number: e.target.value })}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>

                    <div>
                      <Label>Igiciro cya Serivisi</Label>
                      <Input
                        value={newListing.service_cost}
                        onChange={(e) => setNewListing({ ...newListing, service_cost: e.target.value })}
                        placeholder="Urugero: 5,000 RWF - 20,000 RWF"
                      />
                    </div>

                    <div>
                      <Label>Aho Ubarizwa</Label>
                      <Input
                        value={newListing.location}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        placeholder="Urugero: Kigali, Gasabo"
                      />
                    </div>

                    <div>
                      <Label>Ibisobanuro (Optional)</Label>
                      <Textarea
                        value={newListing.description}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                        placeholder="Sobanura serivisi yawe..."
                      />
                    </div>

                    <Button onClick={handleCreateListing} className="w-full">
                      Ohereza
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Services List */}
            <div className="grid gap-4 md:grid-cols-2">
              {listings.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">Nta serivisi ziboneka</p>
                  </CardContent>
                </Card>
              ) : (
                listings.map((listing) => (
                  <Card key={listing.id} className="hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{listing.service_name}</span>
                        {user && listing.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-semibold text-lg">{listing.provider_name}</p>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${listing.phone_number}`} className="hover:text-primary">
                          {listing.phone_number}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold text-primary">
                          Igiciro: {listing.service_cost}
                        </p>
                      </div>

                      {listing.description && (
                        <p className="text-sm text-muted-foreground pt-2">
                          {listing.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {industries.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">Nta nganda ziboneka</p>
                  </CardContent>
                </Card>
              ) : (
                industries.map((industry) => (
                  <Card key={industry.id} className="hover-scale">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {industry.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${industry.phone_number}`} className="hover:text-primary">
                          {industry.phone_number}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{industry.location}</span>
                      </div>

                      {industry.description && (
                        <p className="text-sm text-muted-foreground pt-2 border-t">
                          {industry.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Marketplace;
