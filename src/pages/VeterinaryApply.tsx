import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

const VeterinaryApply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    address: "",
    latitude: -1.9403,
    longitude: 30.0588,
    phone: "",
    services: "",
    licenseNumber: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Injira kugira ngo usabe");
      return;
    }

    setLoading(true);

    try {
      const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
      
      const { error } = await supabase
        .from('veterinary_applications')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          description: formData.description,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          phone: formData.phone,
          services: servicesArray,
          license_number: formData.licenseNumber || null
        });

      if (error) throw error;

      toast.success("Icyifuzo cyawe cyoherejwe! Tuzakubwira iyo cyemerejwe.");
      navigate('/maps');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error("Habaye ikosa mu kohereza icyifuzo");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      toast.info("Turareba aho uri...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success("Aho uri habonetse!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Ntibyashobokaye kubona aho uri");
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Saba Kwandikishwa nk'Ivuriro</CardTitle>
              <CardDescription>
                Uzuza iyi fomo kugira ngo usabe kwandikishwa nk'ivuriro ku karita y'ubuhinzi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Izina ry'Ikigo *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Ibisobanuro</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Aderesi *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label>Aho Uherereye (GPS)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                      placeholder="Latitude"
                    />
                    <Input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                      placeholder="Longitude"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={getLocation} className="mt-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    Koresha Aho Ndi
                  </Button>
                </div>

                <div>
                  <Label htmlFor="phone">Telefoni *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="services">Serivisi (Tandukanya na virgule) *</Label>
                  <Input
                    id="services"
                    value={formData.services}
                    onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                    placeholder="Kuvura inka, Inkuburi, Urubanza"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">Nimero ya Lisansi</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iyohereza..." : "Ohereza Icyifuzo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VeterinaryApply;
