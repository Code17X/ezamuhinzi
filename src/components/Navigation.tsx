import { Link, useLocation } from "react-router-dom";
import { Home, Cloud, DollarSign, Newspaper, Bot, User, LogOut, Settings, Users, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import wheatLogo from "@/assets/wheat-logo.png";

const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const links = [
    { to: "/", icon: Home, label: t('home') },
    { to: "/assistant", icon: Bot, label: t('assistant') },
    { to: "/marketplace", icon: Users, label: "Tanga Akazi" },
    { to: "/weather", icon: Cloud, label: t('weather') },
    { to: "/prices", icon: DollarSign, label: t('prices') },
    { to: "/news", icon: Newspaper, label: t('news') },
    { to: "/profile", icon: User, label: t('profile') },
    { to: "/settings", icon: Settings, label: t('settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border md:top-0 md:bottom-auto z-50 transition-all duration-500 ease-out shadow-sm">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between md:justify-start md:gap-8 h-16">
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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
          
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-0.5 sm:gap-1 w-full md:w-auto md:gap-2 md:overflow-visible pb-1 md:pb-0 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 py-1.5 md:py-2 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 flex-shrink-0 min-w-[48px]",
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-[9px] sm:text-[10px] md:text-sm font-medium whitespace-nowrap max-w-[50px] md:max-w-none truncate">{link.label}</span>
                </Link>
              );
            })}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
