import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Cloud, DollarSign, Wrench, Bot, User, LogOut, Settings, Users, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import wheatLogo from "@/assets/wheat-logo.png";

const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftFade(scrollLeft > 10);
        setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const links = [
    { to: "/", icon: Home, label: t('home') },
    { to: "/assistant", icon: Bot, label: t('assistant') },
    { to: "/marketplace", icon: Users, label: "Tanga Akazi" },
    { to: "/weather", icon: Cloud, label: t('weather') },
    { to: "/prices", icon: DollarSign, label: t('prices') },
    { to: "/tools", icon: Wrench, label: t('tools') },
    { to: "/profile", icon: User, label: t('profile') },
    { to: "/settings", icon: Settings, label: t('settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border lg:top-0 lg:bottom-auto z-50 transition-all duration-500 ease-out shadow-sm">
      <div className="container mx-auto px-2 lg:px-4">
        <div className="flex items-center justify-between lg:justify-start lg:gap-8 h-16">
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <img 
                src={wheatLogo} 
                alt="Eza Muhinzi" 
                className="w-10 h-10 drop-shadow-lg object-contain"
              />
              <div className="absolute inset-0 blur-sm rounded-full scale-110 -z-10" 
                   style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2), transparent)' }} />
            </div>
            <span className="font-bold text-xl text-foreground" style={{ fontFamily: "'Righteous', cursive" }}>
              Eza Muhinzi
            </span>
          </div>
          
          <div className="relative flex-1 md:flex-initial">
            {/* Left fade indicator */}
            <div 
              className={cn(
                "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card/95 to-transparent z-10 pointer-events-none transition-opacity duration-300 lg:hidden",
                showLeftFade ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* Right fade indicator */}
            <div 
              className={cn(
                "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/95 to-transparent z-10 pointer-events-none transition-opacity duration-300 lg:hidden",
                showRightFade ? "opacity-100" : "opacity-0"
              )}
            />
            
            <div 
              ref={scrollContainerRef}
              className="flex items-center overflow-x-auto scrollbar-hide gap-0.5 sm:gap-1 w-full lg:w-auto lg:gap-2 lg:overflow-visible pb-1 lg:pb-0 px-1" 
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex flex-col lg:flex-row items-center gap-0.5 lg:gap-2 px-2 py-1.5 lg:py-2 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 flex-shrink-0 min-w-[48px]",
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-[9px] sm:text-[10px] lg:text-sm font-medium whitespace-nowrap max-w-[50px] lg:max-w-none truncate">{link.label}</span>
                </Link>
              );
            })}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{t('logout')}</span>
            </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
