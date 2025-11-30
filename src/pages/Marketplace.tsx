import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, MapPin, Trash2, Building2 } from "lucide-react";

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

const Marketplace = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [newListing, setNewListing] = useState({
    service_name: '',
    provider_name: '',
    phone_number: '',
    service_cost: '',
    location: '',
    description: ''
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Tanga Akazi</h1>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Serivisi</TabsTrigger>
            <TabsTrigger value="industries">Inganda</TabsTrigger>
          </TabsList>

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
