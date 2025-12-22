import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import HomeButton from "@/components/HomeButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  source?: string;
  fullContent?: string;
}

const News = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRABNews();
  }, [i18n.language]);

  const fetchRABNews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rab-news', {
        body: { language: i18n.language }
      });

      if (error) throw error;
      if (data?.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching RAB news:', error);
      // Randomly select a feed from available feeds on refresh
      const feeds = allNewsFeeds[i18n.language as 'rw' | 'en' | 'fr'] || allNewsFeeds.en;
      const randomFeed = feeds[Math.floor(Math.random() * feeds.length)];
      setArticles(randomFeed);
    } finally {
      setIsLoading(false);
    }
  };

  const allNewsFeeds = {
    rw: [
      [
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
      [
        {
          id: "6",
          title: "Tekinolojiya Nshya yo Kuvomerera mu Buhinzi",
          excerpt: "Sistema ya AI ifasha abahinzi gutunganya amazi neza maze kongera umusaruro ugera kuri 35% mu bihe by'ihwiri.",
          category: "Ikoranabuhanga",
          date: "Uyu Munsi",
          image: "💧"
        },
        {
          id: "7",
          title: "Ubworozi bw'Inka buteza Imbere mu Rwanda",
          excerpt: "Gahunda nshya yo guteza imbere ubworozi bw'inka zatanze inka z'ubwoko bwiza ku bahinzi 500.",
          category: "Ubworozi",
          date: "Ejo Hashize",
          image: "🐄"
        },
        {
          id: "8",
          title: "Amata y'i Rwanda Yatsindiye Ibihembo",
          excerpt: "Amata y'i Rwanda yatsindiye ibihembo ku rwego rw'Afurika kubera ubuziranenge n'ubwiza bwayo.",
          category: "Ikoranabuhanga",
          date: "Iki Cyumweru",
          image: "🥛"
        },
        {
          id: "9",
          title: "Uburyo Bushya bwo Gutunganya Ifumbire",
          excerpt: "Ifumbire nziza ituma ibihingwa bikura neza kandi ikamaraho igihe kinini, ifasha abahinzi kuzigama amafaranga.",
          category: "Ubuhinga",
          date: "Iki Cyumweru",
          image: "🌾"
        },
        {
          id: "10",
          title: "Isoko ry'Imboga Ryagutse mu Rwanda",
          excerpt: "Ibiciro by'imboga nka shu, karoti, n'amashu byiyongereye bitewe n'isoko ryinshi.",
          category: "Ubukungu",
          date: "Icyumweru Gishize",
          image: "🥕"
        }
      ],
      [
        {
          id: "11",
          title: "Gahunda yo Kurwanya Udukoko dutandukanya Ibihingwa",
          excerpt: "Uburyo bushya bwo kurwanya udukoko dutera ibihingwa bukoresheje imiti yuzuye n'ibidukikije.",
          category: "Ubuzima",
          date: "Uyu Munsi",
          image: "🦗"
        },
        {
          id: "12",
          title: "Ubworozi bw'Inkoko buteza Imbere",
          excerpt: "Abahinzi 1,000 bongeye kwinjira mu bworozi bw'inkoko bitewe n'isoko ryinshi ry'amagi.",
          category: "Ubworozi",
          date: "Ejo Hashize",
          image: "🐔"
        },
        {
          id: "13",
          title: "Imyaka Nshya y'Ubuhinzi Itangiye",
          excerpt: "Abahinzi baratangiye guhinga ibihingwa nka soya n'ibishyimbo ku mpera z'imvura.",
          category: "Ubuhinga",
          date: "Iki Cyumweru",
          image: "🌱"
        },
        {
          id: "14",
          title: "Isuku y'Amasaka y'Amazi mu Buhinzi",
          excerpt: "Gahunda yo gushyira amasaka y'amazi yazamura umusaruro w'ibihingwa mu turere dufite imvura nke.",
          category: "Ikoranabuhanga",
          date: "Iki Cyumweru",
          image: "⛲"
        },
        {
          id: "15",
          title: "Ibirayi by'i Rwanda Byoherejwe Hanze",
          excerpt: "Abahinzi b'ibirayi bohereje toni 50 z'ibirayi mu bihugu by'i Burayi.",
          category: "Ubukungu",
          date: "Icyumweru Gishize",
          image: "🥔"
        }
      ],
      [
        {
          id: "16",
          title: "Uburyo bwo Kugabanya Igihombo cy'Ibihingwa",
          excerpt: "Tekinolojiya nshya yerekanye ko ishobora kugabanya igihombo cy'ibihingwa kugera kuri 50% binyuze mu gusuzuma ibihingwa vuba.",
          category: "Ikoranabuhanga",
          date: "Uyu Munsi",
          image: "🔬"
        },
        {
          id: "17",
          title: "Amasoko Mashya y'Ibishyimbo mu Mahanga",
          excerpt: "U Rwanda rwabonetse amasoko mashya yo kohereza ibishyimbo mu bihugu by'Uburasirazuba.",
          category: "Ubukungu",
          date: "Ejo Hashize",
          image: "🫘"
        },
        {
          id: "18",
          title: "Ubworozi bw'Impundu butangiye Gushimangirwa",
          excerpt: "Gahunda yo guteza imbere ubworozi bw'impundu yatangiye mu ntara za Burera na Rubavu.",
          category: "Ubworozi",
          date: "Iki Cyumweru",
          image: "🐟"
        },
        {
          id: "19",
          title: "Imashini Nshya zo Gusarura Ibihingwa",
          excerpt: "Abahinzi 200 bahawe imashini zo gusarura ibihingwa byihuse, bizagabanya umurimo ukomeye.",
          category: "Ubuhinga",
          date: "Iki Cyumweru",
          image: "🚜"
        },
        {
          id: "20",
          title: "Uruhare rw'Abagore mu Buhinzi",
          excerpt: "Raporo nshya yerekana ko abagore bari 65% by'abakora mu buhinzi mu Rwanda.",
          category: "Imibereho",
          date: "Icyumweru Gishize",
          image: "👩‍🌾"
        }
      ],
      [
        {
          id: "21",
          title: "Inganda Nshya zo Gutunganya Ibirayi",
          excerpt: "Inganda nshya zo gutunganya ibirayi zizafungura mu Musanze, ziteganyijwe gukora mu Nzeri.",
          category: "Ubukungu",
          date: "Uyu Munsi",
          image: "🏭"
        },
        {
          id: "22",
          title: "Gahunda yo Gushyira Imyaka y'Imbuto Nziza",
          excerpt: "Guverinoma itangije gahunda yo gutanga imbuto nziza z'ibigori n'ibirayi ku bahinzi bose.",
          category: "Ubuhinga",
          date: "Ejo Hashize",
          image: "🌾"
        },
        {
          id: "23",
          title: "Ubworozi bw'Intama buteza Imbere",
          excerpt: "Abahinzi 800 babonye amahugurwa yo guteza imbere ubworozi bw'intama mu karere ka Nyagatare.",
          category: "Ubworozi",
          date: "Iki Cyumweru",
          image: "🐑"
        },
        {
          id: "24",
          title: "Inguzanyo z'Abahinzi Ziyongereye",
          excerpt: "Banki zatangaje ko inguzanyo zihabwa abahinzi ziyongereye 30% muri uyu mwaka.",
          category: "Ubukungu",
          date: "Iki Cyumweru",
          image: "💰"
        },
        {
          id: "25",
          title: "Kooperative Nshya z'Abahinzi b'Ikawa",
          excerpt: "Kooperative 15 nshya z'abahinzi b'ikawa zashizweho mu ntara y'Amajyaruguru.",
          category: "Imibereho",
          date: "Icyumweru Gishize",
          image: "☕"
        }
      ]
    ],
    en: [
      [
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
      ]
    ],
    fr: [
      [
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
    ]
  };

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
      <HomeButton />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('news.latestNews')}
            </h1>
            <p className="text-muted-foreground">
              {t('news.agricultureUpdates')} - Rwanda Agriculture Board (RAB)
            </p>
          </div>

          {/* RAB Resource Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">RAB Urubuga Rukuru</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="https://www.rab.gov.rw/" target="_blank" rel="noopener noreferrer">
                    Sura Urubuga
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Serivisi za RAB</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="https://www.rab.gov.rw/online-services" target="_blank" rel="noopener noreferrer">
                    Serivisi kuri Enterineti
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Amatangazo & Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="https://www.rab.gov.rw/publications" target="_blank" rel="noopener noreferrer">
                    Reba Amatangazo
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No news articles available</p>
            </Card>
          ) : (
            <>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default News;
