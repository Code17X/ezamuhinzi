import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Heart, Users } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("about.title")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("about.subtitle")}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="w-8 h-8 text-primary" />
                {t("about.mission.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
              <p>{t("about.mission.p1")}</p>
              <p>{t("about.mission.p2")}</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Eye className="w-8 h-8 text-primary" />
                {t("about.vision.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
              <p>{t("about.vision.p1")}</p>
              <p>{t("about.vision.p2")}</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="w-8 h-8 text-primary" />
                {t("about.values.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>{t("about.values.trust")}</strong> {t("about.values.trustDesc")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>{t("about.values.tech")}</strong> {t("about.values.techDesc")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>{t("about.values.collab")}</strong> {t("about.values.collabDesc")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>{t("about.values.growth")}</strong> {t("about.values.growthDesc")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="w-8 h-8 text-primary" />
                {t("about.team.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
              <p>{t("about.team.p1")}</p>
              <p>{t("about.team.p2")}</p>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  );
};

export default About;
