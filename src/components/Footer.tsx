import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="bg-background border-t border-border py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
          <div className="flex gap-6">
            <Link to="/about" className="text-sm hover:text-primary transition-colors">
              {t("footer.aboutUs")}
            </Link>
          </div>
          <p className="text-sm">
            {t("footer.copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
