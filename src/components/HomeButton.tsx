import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HomeButton = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  // Don't show on home page or landing page
  if (location.pathname === "/" || location.pathname === "/landing") {
    return null;
  }

  return (
    <Link to="/" className="fixed top-20 left-4 z-40 md:top-20">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-background/95 backdrop-blur-lg border-primary/20 hover:bg-primary/10 hover:border-primary shadow-lg"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">{t('home')}</span>
      </Button>
    </Link>
  );
};

export default HomeButton;
