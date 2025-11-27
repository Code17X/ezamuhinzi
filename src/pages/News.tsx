import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

const News = () => {
  const { t, i18n } = useTranslation();
  
  const newsArticles = {
    rw: [
      {
        id: "1",
        title: "Ubwoko Bushya bw'Ibigori bihanganira Ihwiri",
        excerpt: "Abashakashatsi b'ubuhinzi batanze ubwoko bushya bw'ibigori bushobora guhanganira igihe kinini cy'ihwiri, byerekana ko hazagira umusaruro mwiza ku bahinzi bo mu turere dufite imvura nke.",
        category: "Ikoranabuhanga",
        date: "Uyu Munsi",
        image: "🌽"
      },
      {
        id: "2",
        title: "Uburyo Bushya bwo Guhinga buteza Imbere",
        excerpt: "Uburyo bushya bwo guhinga bukoresheje ikoranabuhanga bwerekanye ko buzatanga umusaruro mwinshi ugera kuri 40% kurenza uburyo busanzwe.",
        category: "Ubuhinga",
        date: "Ejo Hashize",
        image: "🌱"
      },
      {
        id: "3",
        title: "Isoko Ryabihingwa Ryiyongera mu Rwanda",
        excerpt: "Ibiciro by'ibihingwa byiyongereye mu Rwanda bitewe n'umusaruro mwinshi n'isoko ry'i mahanga, bitera abahinzi kwishima.",
        category: "Ubukungu",
        date: "Iki Cyumweru",
        image: "📈"
      },
      {
        id: "4",
        title: "Ikawa y'i Rwanda Yatsindiye Ibihembo ku Rwego Mpuzamahanga",
        excerpt: "Ikawa y'i Rwanda yongereye gukunda ku isoko ry'amahanga maze itwara ibihembo byinshi mu marushanwa mpuzamahanga.",
        category: "Ikoranabuhanga",
        date: "Iki Cyumweru",
        image: "☕"
      },
      {
        id: "5",
        title: "Uburyo bwo Kurinda Ibihingwa ku Ndwara",
        excerpt: "Abahinga bw'ubuhinzi batanze uburyo bushya bwo kurinda ibihingwa ku ndwara zikunze gutera, bukoresheje imiti yuzuye n'ibidukikije.",
        category: "Ubuzima",
        date: "Icyumweru Gishize",
        image: "🛡️"
      }
    ],
    en: [
      {
        id: "1",
        title: "New Drought-Resistant Maize Variety Released",
        excerpt: "Agricultural researchers have developed a new maize variety that can withstand extended dry periods, promising better yields for farmers in arid regions.",
        category: "Technology",
        date: "Today",
        image: "🌽"
      },
      {
        id: "2",
        title: "Smart Farming Technology Shows 40% Yield Increase",
        excerpt: "New smart farming technology using AI and sensors demonstrates significant productivity gains over traditional methods.",
        category: "Innovation",
        date: "Yesterday",
        image: "🌱"
      },
      {
        id: "3",
        title: "Crop Prices Rising in Rwanda Market",
        excerpt: "Prices for key crops including maize, beans, and potatoes have increased in Rwanda's markets, bringing good news for farmers.",
        category: "Economy",
        date: "This Week",
        image: "📈"
      },
      {
        id: "4",
        title: "Rwandan Coffee Wins International Awards",
        excerpt: "Rwanda's coffee continues to gain international recognition, winning multiple awards at global competitions and commanding premium prices.",
        category: "Technology",
        date: "This Week",
        image: "☕"
      },
      {
        id: "5",
        title: "New Disease-Resistant Crop Protection Methods",
        excerpt: "Agricultural scientists have introduced new environmentally-friendly methods to protect crops from common diseases affecting Rwandan farmers.",
        category: "Health",
        date: "Last Week",
        image: "🛡️"
      }
    ],
    fr: [
      {
        id: "1",
        title: "Nouvelle Variété de Maïs Résistante à la Sécheresse",
        excerpt: "Les chercheurs agricoles ont développé une nouvelle variété de maïs capable de résister aux périodes sèches prolongées.",
        category: "Technologie",
        date: "Aujourd'hui",
        image: "🌽"
      },
      {
        id: "2",
        title: "La Technologie Agricole Intelligente Augmente le Rendement de 40%",
        excerpt: "La nouvelle technologie agricole utilisant l'IA et les capteurs montre des gains de productivité significatifs.",
        category: "Innovation",
        date: "Hier",
        image: "🌱"
      },
      {
        id: "3",
        title: "Prix des Cultures en Hausse au Rwanda",
        excerpt: "Les prix des principales cultures augmentent sur les marchés rwandais, apportant de bonnes nouvelles aux agriculteurs.",
        category: "Économie",
        date: "Cette Semaine",
        image: "📈"
      }
    ]
  };

  const currentLang = i18n.language as 'rw' | 'en' | 'fr';
  const articles = newsArticles[currentLang] || newsArticles.en;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Ikoranabuhanga': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Technologie': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Innovation': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Ubuhinga': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Economy': 'bg-green-500/10 text-green-600 border-green-500/20',
      'Ubukungu': 'bg-green-500/10 text-green-600 border-green-500/20',
      'Économie': 'bg-green-500/10 text-green-600 border-green-500/20',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('news.latestNews')}
            </h1>
            <p className="text-muted-foreground">
              {t('news.agricultureUpdates')}
            </p>
          </div>

          {/* Featured Article */}
          <Link to={`/news/${articles[0].id}`}>
            <Card className="mb-8 hover:shadow-lg transition-shadow cursor-pointer border-2">
              <CardHeader>
                <Badge className={getCategoryColor(articles[0].category)}>
                  {t('news.featured')}
                </Badge>
                <CardTitle className="text-3xl mt-4 hover:text-primary transition-colors">
                  {articles[0].title}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {articles[0].excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{articles[0].image}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{articles[0].date}</span>
                    </div>
                  </div>
                  <Button variant="ghost">
                    {t('news.readMore')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Other Articles */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('news.allArticles')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {articles.slice(1).map((article) => (
                <Link key={article.id} to={`/news/${article.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                        <span className="text-3xl">{article.image}</span>
                      </div>
                      <CardTitle className="text-xl hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{article.date}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t('news.readArticle')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default News;
