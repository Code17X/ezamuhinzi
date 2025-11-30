import { Link, useLocation } from "react-router-dom";
import { Home, Cloud, DollarSign, Newspaper, Bot, User, LogOut, Settings, Users, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
const Navigation = () => {
  const location = useLocation();
  const {
    signOut
  } = useAuth();
  const {
    t
  } = useTranslation();
  const links = [{
    to: "/",
    icon: Home,
    label: t('home')
  }, {
    to: "/assistant",
    icon: Bot,
    label: t('assistant')
  }, {
    to: "/social",
    icon: Users,
    label: t('social')
  }, {
    to: "/weather",
    icon: Cloud,
    label: t('weather')
  }, {
    to: "/prices",
    icon: DollarSign,
    label: t('prices')
  }, {
    to: "/marketplace",
    icon: ShoppingBag,
    label: t('marketplace')
  }, {
    to: "/news",
    icon: Newspaper,
    label: t('news')
  }, {
    to: "/profile",
    icon: User,
    label: t('profile')
  }, {
    to: "/settings",
    icon: Settings,
    label: t('settings')
  }];
  return <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border md:top-0 md:bottom-auto z-50 transition-all duration-500 ease-out shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between md:justify-start md:gap-8 h-16">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">🌾</span>
            </div>
            <span className="font-bold text-xl text-foreground">AgriConnect</span>
          </div>
          
          <div className="flex items-center justify-around w-full md:w-auto md:gap-2">
            {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return <Link key={link.to} to={link.to} className={cn("flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out transform hover:scale-105", isActive ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                  <Icon className="w-5 h-5" />
                  
                </Link>;
          })}
            <Button variant="ghost" size="sm" onClick={signOut} className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;