import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";

const newsArticles = {
  rw: [
    {
      id: "1",
      title: "Ubwoko Bushya bw'Ibigori bihanganira Ihwiri",
      category: "Ikoranabuhanga",
      date: "Uyu Munsi",
      image: "🌽",
      excerpt: "Abashakashatsi b'ubuhinzi batanze ubwoko bushya bw'ibigori bushobora guhanganira igihe kinini cy'ihwiri...",
      content: `Abashakashatsi b'ubuhinzi batanze ubwoko bushya bw'ibigori bushobora guhanganira igihe kinini cy'ihwiri, byerekana ko hazagira umusaruro mwiza ku bahinzi bo mu turere dufite imvura nke.

Ubu bwoko bushya bwitwa "DroughtGuard Maize" bwakozwe nyuma y'imyaka 8 y'ubushakashatsi n'ibizamini. Bushobora gukomeza gukura nubwo imvura imaze ibyumweru 6 itanywe, mu gihe ibigori bisanzwe bisaba ko imvura igwa buri cyumweru.

Abahinga baravuga ko ubu bwoko buzatanga:
• Umusaruro mwinshi ku bantu bo mu turere dufite imvura nke
• Gukumira inzara no kubura ibiribwa
• Kwiyongera kw'amafaranga ku bahinzi
• Kurinda ibidukikije mu kugabanya imyuka ituma imvura nke

Abahinga babisabwe kwamamaza ubu bwoko mu gihe gito kugira ngo babone inyungu muri iyi myaka iri imbere.`
    },
    {
      id: "2",
      title: "Uburyo Bushya bwo Guhinga buteza Imbere",
      category: "Ubuhinga",
      date: "Ejo Hashize",
      image: "🌱",
      excerpt: "Uburyo bushya bwo guhinga bukoresheje ikoranabuhanga bwerekanye ko buzatanga umusaruro mwinshi...",
      content: `Uburyo bushya bwo guhinga bukoresheje ikoranabuhanga bushingiye ku AI n'ibikoresho bya tekiniki bwerekanye ko buzatanga umusaruro mwinshi ugera kuri 40% kurenza uburyo busanzwe.

Ubu buryo bwa "Smart Farming" bukoresheje:
• Senseri zo mu butaka zigenzura ubushuhe n'amazi
• Drones zigenzura imiterere y'ibihingwa
• AI isesengura amakuru kandi itanga inama ku bahinzi
• Sisitemu yo kuhira mu buryo bushimishije

Uyu murimo ukozwe n'ikigo cy'ubushakashatsi c'ubuhinzi muri Kenya werekanyije ko abahinga bakoresheje ubu buryo bashobora:
• Kugabanya amafaranga yakoresha mu guhinga
• Gukoresha neza amazi n'ifumbire
• Kumenya mbere indwara z'ibihingwa
• Kongera umusaruro mu buryo bugaragara

Ikigo kivuga ko ubu buryo buracyafite ibiciro byinshi ariko bizagabanuka mu gihe kiri imbere.`
    },
    {
      id: "3",
      title: "Isoko Ryabihingwa Ryiyongera mu Rwanda",
      category: "Ubukungu",
      date: "Iki Cyumweru",
      image: "📈",
      excerpt: "Ibiciro by'ibihingwa byiyongereye mu Rwanda bitewe n'umusaruro mwinshi n'isoko ry'i mahanga...",
      content: `Ibiciro by'ibihingwa by'ingenzi nk'ibigori, ibishyimbo, n'ibirayi byiyongereye mu Rwanda mu byumweru bishize, bitera abahinzi kwishima no gukomeza guhinga.

Impamvu z'iyiyongera ry'ibiciro:
• Umusaruro mwinshi uterwa n'ikirere cyiza
• Isoko ry'i mahanga ryongereye guhagarika ibicuruzwa
• Leta yashyize gahunda yo gufasha abahinzi
• Ubushobozi bwo kubika ibihingwa bwiyongereye

Ibiciro bishya ni ibi:
- Ibigori: 450 RWF/kg (+5%)
- Ibishyimbo: 780 RWF/kg (+8%)
- Ibirayi: 320 RWF/kg (+3%)

Abashakashatsi bavuga ko ibi biciro bizakomeza kwiyongera mu mezi atari menshi bitewe n'isoko ryiza. Barasaba abahinzi kwirinda kwiyongera kw'ibiciro ngo ntibagabanye umusaruro w'ejo.`
    }
  ],
  en: [
    {
      id: "1",
      title: "New Drought-Resistant Maize Variety Released",
      category: "Technology",
      date: "Today",
      image: "🌽",
      excerpt: "Agricultural researchers have developed a new maize variety that can withstand extended dry periods...",
      content: `Agricultural researchers have developed a new maize variety that can withstand extended dry periods, promising better yields for farmers in arid regions.

The new variety, called "DroughtGuard Maize," was developed after 8 years of research and field trials. It can survive up to 6 weeks without rainfall, compared to traditional maize varieties that require weekly watering.

Key benefits of this variety include:
• Higher yields in drought-prone areas
• Reduced risk of crop failure during dry spells
• Lower irrigation costs for farmers
• Improved food security in vulnerable regions

Farmers are encouraged to adopt this variety in the coming planting season to take advantage of its superior drought tolerance.`
    },
    {
      id: "2",
      title: "Smart Farming Technology Shows 40% Yield Increase",
      category: "Innovation",
      date: "Yesterday",
      image: "🌱",
      excerpt: "New smart farming technology using AI and sensors demonstrates significant productivity gains...",
      content: `New smart farming technology utilizing AI and IoT sensors has demonstrated yield increases of up to 40% compared to traditional farming methods.

The "Smart Farming" system includes:
• Soil moisture and nutrient sensors
• Drone-based crop monitoring
• AI-powered analytics and recommendations
• Automated irrigation systems

A pilot project in Kenya showed that farmers using this technology were able to:
• Reduce water usage by 30%
• Optimize fertilizer application
• Detect crop diseases early
• Increase overall productivity significantly

While the technology is currently expensive, costs are expected to decrease as adoption grows.`
    },
    {
      id: "3",
      title: "Crop Prices Rising in Rwanda Market",
      category: "Economy",
      date: "This Week",
      image: "📈",
      excerpt: "Prices for key crops including maize, beans, and potatoes have increased in Rwanda's markets...",
      content: `Prices for key crops including maize, beans, and potatoes have increased in Rwanda's markets this week, bringing good news for farmers.

Reasons for price increases:
• High-quality harvest due to favorable weather
• Increased export demand
• Government support programs
• Improved storage facilities

Current prices:
- Maize: 450 RWF/kg (+5%)
- Beans: 780 RWF/kg (+8%)
- Potatoes: 320 RWF/kg (+3%)

Experts predict prices will remain stable in the coming months due to strong market demand. Farmers are advised to take advantage of current prices while maintaining production quality.`
    }
  ],
  fr: [
    {
      id: "1",
      title: "Nouvelle Variété de Maïs Résistante à la Sécheresse",
      category: "Technologie",
      date: "Aujourd'hui",
      image: "🌽",
      excerpt: "Les chercheurs agricoles ont développé une nouvelle variété de maïs capable de résister aux périodes sèches prolongées...",
      content: `Les chercheurs agricoles ont développé une nouvelle variété de maïs capable de résister aux périodes sèches prolongées, promettant de meilleurs rendements pour les agriculteurs dans les régions arides.

La nouvelle variété, appelée "DroughtGuard Maize", a été développée après 8 ans de recherche et d'essais sur le terrain. Elle peut survivre jusqu'à 6 semaines sans pluie, contre les variétés traditionnelles qui nécessitent un arrosage hebdomadaire.

Avantages clés:
• Rendements plus élevés dans les zones sujettes à la sécheresse
• Risque réduit d'échec des cultures
• Coûts d'irrigation réduits
• Sécurité alimentaire améliorée

Les agriculteurs sont encouragés à adopter cette variété lors de la prochaine saison de plantation.`
    }
  ]
};

const NewsArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const currentLang = i18n.language as 'rw' | 'en' | 'fr';
  const articles = newsArticles[currentLang] || newsArticles.en;
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">{t('common.error')}</p>
              <Button onClick={() => navigate('/news')} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('news.title')}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/news')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('news.title')}
          </Button>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-6xl">{article.image}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{article.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {article.title}
                  </h1>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                {article.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-foreground mb-4 leading-relaxed whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NewsArticle;