import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Activity, Star, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  services: string[];
  verified: boolean;
  average_rating: number;
  total_ratings: number;
}

const Maps = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || locations.length === 0) return;

    // Initialize map centered on Rwanda
    const accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    if (!accessToken) {
      console.error("VITE_MAPBOX_PUBLIC_TOKEN ntiyashyizwe. Shyiramo Mapbox public token mu mabwiriza ya porogaramu.");
      toast.error("Ikarita ikeneye Mapbox token. Vugurura amabwiriza ya porogaramu.");
      return;
    }

    mapboxgl.accessToken = accessToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [30.0588, -1.9403], // Rwanda center
      zoom: 8
    });

      // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Enable scroll zoom for better map interaction
    map.current.scrollZoom.enable();

    // Add markers for all locations
    locations.forEach(location => {
      if (!map.current) return;

      const markerColor = 
        location.type === 'veterinary' ? '#ef4444' :
        location.type === 'market' ? '#22c55e' :
        location.type === 'rab_office' ? '#3b82f6' :
        location.type === 'factory' ? '#f97316' :
        location.type === 'industry' ? '#eab308' :
        '#a855f7';

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = markerColor;
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const ratingStars = location.average_rating > 0 
        ? '⭐'.repeat(Math.round(location.average_rating))
        : 'Nta gipimo';
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}${location.verified ? ' ✓' : ''}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${location.description}</p>
          <p style="font-size: 11px; color: #888;">${location.address}</p>
          ${location.phone ? `<p style="font-size: 11px; margin-top: 4px;"><strong>📞</strong> ${location.phone}</p>` : ''}
          ${location.total_ratings > 0 ? `<p style="font-size: 11px; margin-top: 4px;"><strong>${ratingStars}</strong> (${location.total_ratings})</p>` : ''}
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });

    return () => {
      map.current?.remove();
    };
  }, [locations]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('agricultural_locations')
        .select('*')
        .eq('verified', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const submitRating = async () => {
    if (!user || !selectedLocation || userRating === 0) {
      toast.error("Hitamo amanota");
      return;
    }

    try {
      const { error } = await supabase
        .from('location_ratings')
        .upsert({
          location_id: selectedLocation.id,
          user_id: user.id,
          rating: userRating,
          review: review || null
        });

      if (error) throw error;

      toast.success("Amanota yatanzwe neza!");
      setSelectedLocation(null);
      setUserRating(0);
      setReview("");
      fetchLocations();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error("Habaye ikosa mu gutanga amanota");
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { label: string; color: string }> = {
      veterinary: { label: "Ivuriro", color: "bg-red-500/10 text-red-600 border-red-500/20" },
      market: { label: "Isoko", color: "bg-green-500/10 text-green-600 border-green-500/20" },
      rab_office: { label: "RAB", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      cooperative: { label: "Koperative", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
      factory: { label: "Uruganda", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
      industry: { label: "Inganda", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" }
    };
    return styles[type] || { label: type, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
  };

  const filteredLocations = selectedType 
    ? locations.filter(loc => loc.type === selectedType)
    : locations;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Ikarita y'Ubuhinzi</h1>
            <p className="text-muted-foreground">Ibigo by'Ubuhinzi, Ivuriro, n'Amasoko</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => setSelectedType(null)}
            >
              Byose
            </Button>
            <Button
              variant={selectedType === 'veterinary' ? "default" : "outline"}
              onClick={() => setSelectedType('veterinary')}
            >
              🩺 Ivuriro
            </Button>
            <Button
              variant={selectedType === 'market' ? "default" : "outline"}
              onClick={() => setSelectedType('market')}
            >
              🏪 Amasoko
            </Button>
            <Button
              variant={selectedType === 'rab_office' ? "default" : "outline"}
              onClick={() => setSelectedType('rab_office')}
            >
              🏛️ RAB
            </Button>
            <Button
              variant={selectedType === 'cooperative' ? "default" : "outline"}
              onClick={() => setSelectedType('cooperative')}
            >
              🤝 Koperative
            </Button>
            <Button
              variant={selectedType === 'factory' ? "default" : "outline"}
              onClick={() => setSelectedType('factory')}
            >
              🏭 Uruganda
            </Button>
            <Button
              variant={selectedType === 'industry' ? "default" : "outline"}
              onClick={() => setSelectedType('industry')}
            >
              🏗️ Inganda
            </Button>
          </div>

          {/* Map */}
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div ref={mapContainer} className="w-full h-[500px] rounded-lg touch-pan-y" />
            </CardContent>
          </Card>

          {/* Locations List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => {
              const badge = getTypeBadge(location.type);
              return (
                <Card key={location.id} className="hover:shadow-lg transition-shadow hover-scale animate-fade-in">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        {location.verified && <Badge variant="outline" className="text-xs">✓ Byemejwe</Badge>}
                      </div>
                      <Badge className={badge.color}>{badge.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{location.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                        <span>{location.address}</span>
                      </div>
                      
                      {location.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-primary" />
                          <a href={`tel:${location.phone}`} className="text-primary hover:underline">
                            {location.phone}
                          </a>
                        </div>
                      )}
                      
                      {location.services && location.services.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <Activity className="w-4 h-4 mt-0.5 text-primary" />
                          <div className="flex flex-wrap gap-1">
                            {location.services.map((service, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {location.total_ratings > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{location.average_rating.toFixed(1)} ({location.total_ratings} abantu)</span>
                        </div>
                      )}

                      {user && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => setSelectedLocation(location)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Tanga Amanota
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Rating Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tanga Amanota - {selectedLocation?.name}</DialogTitle>
            <DialogDescription>
              Dufashe abandi abahinzi kumenya uko iyi serivisi ihagije
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Amanota</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= userRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review">Icyo Wabivugaho (optional)</Label>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Andika icyo ubona kuri iyi serivisi..."
                rows={3}
              />
            </div>

            <Button onClick={submitRating} className="w-full">
              Ohereza Amanota
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maps;
