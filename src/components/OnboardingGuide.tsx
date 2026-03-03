import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { X, Bot, Cloud, DollarSign, Newspaper, ShoppingCart, Map, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "ezamuhinzi_onboarding_done";

const OnboardingGuide = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: t("onboarding.welcome"),
      description: t("onboarding.welcomeDesc"),
      color: "from-primary to-primary/60",
    },
    {
      icon: Bot,
      title: t("assistant"),
      description: t("onboarding.assistantGuide"),
      color: "from-primary to-primary/60",
    },
    {
      icon: Cloud,
      title: t("weather"),
      description: t("onboarding.weatherGuide"),
      color: "from-blue-500 to-blue-400",
    },
    {
      icon: DollarSign,
      title: t("prices"),
      description: t("onboarding.pricesGuide"),
      color: "from-amber-500 to-amber-400",
    },
    {
      icon: Newspaper,
      title: t("news"),
      description: t("onboarding.newsGuide"),
      color: "from-green-500 to-green-400",
    },
    {
      icon: ShoppingCart,
      title: t("marketplace"),
      description: t("onboarding.marketplaceGuide"),
      color: "from-purple-500 to-purple-400",
    },
    {
      icon: Map,
      title: t("maps"),
      description: t("onboarding.mapsGuide"),
      color: "from-rose-500 to-rose-400",
    },
  ];

  useEffect(() => {
    if (user) {
      const done = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
      const justSignedUp = sessionStorage.getItem("ezamuhinzi_just_signed_up");
      if (!done && justSignedUp) {
        sessionStorage.removeItem("ezamuhinzi_just_signed_up");
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const dismiss = () => {
    setVisible(false);
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, "true");
    }
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={dismiss} />

      {/* Card */}
      <Card className="relative z-10 w-full max-w-md border-2 shadow-2xl animate-scale-in overflow-hidden">
        {/* Gradient header */}
        <div className={cn("bg-gradient-to-r p-6 text-white", step.color)}>
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">{step.title}</h3>
          </div>
        </div>

        <CardContent className="p-6">
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === currentStep
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("onboarding.prev")}
            </Button>

            <Button variant="ghost" size="sm" onClick={dismiss} className="text-muted-foreground">
              {t("onboarding.skip")}
            </Button>

            <Button size="sm" onClick={next} className="gap-1">
              {currentStep === steps.length - 1 ? t("onboarding.done") : t("onboarding.next")}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingGuide;
