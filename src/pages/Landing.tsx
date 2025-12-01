import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CloudSun, TrendingUp, Newspaper, Stethoscope, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-farmers.jpg";

const Landing = () => {
  const features = [
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: "Gusuzuma Indwara z'Ibihingwa",
      description: "Ohereza amafoto y'ibihingwa byawe ukabona amakuru yo gukira byihuse ukoresheje AI",
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-primary" />,
      title: "Umujyanama w'AI ku Matungo",
      description: "Inama ku buzima bw'amatungo igihe cyose na hose ukoresheje AI",
    },
    {
      icon: <CloudSun className="w-8 h-8 text-primary" />,
      title: "Ikirere n'Ibiciro",
      description: "Amakuru y'ikirere n'ibiciro bya soko yifashisha gufata ibyemezo byiza mu buhinzi",
    },
    {
      icon: <Newspaper className="w-8 h-8 text-primary" />,
      title: "Amakuru y'Ubuhinzi",
      description: "Kora kuri gahunda y'amakuru agezweho mu buhinzi, uburyo bushya, n'ubumenyi bwiza",
    },
  ];

  const innovations = [
    "Gusuzuma indwara z'ibihingwa ukoresheje AI",
    "Inama ku matungo byihuse ukoresheje AI",
    "Bika kandi ukurikirane ibizwe n'inama zawe",
    "Inama zihariye zishingiye ku mirima yawe",
    "Bikoreshwa n'abahinzi bafite uburambe n'abatangiye",
    "Bibonetse igihe cyose ku bikoresho byose",
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
            Ubuhinzi Bwihuse ku Bose
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Ibikoresho bya AI bigufasha gufata ibyemezo byiza, kurinda ibihingwa, no kwita ku matungo
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 hover-scale">
                Tangira Kubuntu
              </Button>
            </Link>
            <Link to="/auth?mode=login">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20 hover-scale">
                Injira
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Ibyo Ukeneye Byose muri Porogaramu Imwe
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
            Icyaduhindura ku Bandi
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
            Injira mu Muryango w'Abahinzi Benshi Bakoresha Iyi Porogaramu
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Niba utangiye cyangwa ufite uburambe, ibikoresho bya AI bizagufasha gutsinda
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="text-lg px-8 hover-scale">
              Fungura Konti Yawe Kubuntu
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
