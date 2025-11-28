import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CloudSun, TrendingUp, Newspaper, Stethoscope, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-farmers.jpg";

const Landing = () => {
  const features = [
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: "Crop Disease Detection",
      description: "Upload photos of your crops and get instant AI-powered diagnosis with treatment recommendations",
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-primary" />,
      title: "AI Vet Assistant",
      description: "24/7 livestock health advice from our AI veterinarian. Get expert guidance anytime, anywhere",
    },
    {
      icon: <CloudSun className="w-8 h-8 text-primary" />,
      title: "Weather & Prices",
      description: "Real-time weather forecasts and market prices to help you make informed farming decisions",
    },
    {
      icon: <Newspaper className="w-8 h-8 text-primary" />,
      title: "Agricultural News",
      description: "Stay updated with the latest farming news, techniques, and best practices",
    },
  ];

  const innovations = [
    "AI-powered crop disease detection using computer vision",
    "Instant veterinary advice through conversational AI",
    "Save and track all your diagnoses and consultations",
    "Personalized recommendations based on your farm profile",
    "Works for both experienced and beginner farmers",
    "Available 24/7 on any device",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden animate-fade-in">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Smart Farming for Everyone
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            AI-powered tools to help farmers make better decisions, protect crops, and care for livestock
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 hover-scale">
                Get Started Free
              </Button>
            </Link>
            <Link to="/auth?mode=login">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20 hover-scale">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need in One App
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow hover-scale animate-fade-in">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-20 px-4 bg-muted/30 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {innovations.map((innovation, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{innovation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 animate-fade-in">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Thousands of Farmers Already Using Our Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you're just starting or have years of experience, our AI tools will help you succeed
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-lg px-8 hover-scale">
              Start Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
