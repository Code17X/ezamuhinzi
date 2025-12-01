import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Heart, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Kuri Twe
            </h1>
            <p className="text-xl text-muted-foreground">
              Eza Muhinzi - Dufasha Abahinzi bo mu Rwanda
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="w-8 h-8 text-primary" />
                Intego Yacu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
              <p>
                Eza Muhinzi ni porogaramu yubatswe mu Rwanda kugirango ifashe abahinzi gukoresha ikoranabuhanga mu bikorwa byabo bya buri munsi. Turashaka gufasha abahinzi kubona amakuru y'ingenzi, ibiciro by'isoko, ibihe, n'ubujyanama bw'inzobere mu buhinzi.
              </p>
              <p>
                Intego yacu ni ukwongera umusaruro w'abahinzi, kubafasha gufata ibyemezo byiza, no kuba umurongo uhuriza abahinzi n'isoko ry'ibicuruzwa byabo.
              </p>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Eye className="w-8 h-8 text-primary" />
                Icyerekezo Cyacu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
              <p>
                Turashaka kuba urubuga rw'ibanze rw'abahinzi bose bo mu Rwanda, aho bashobora kubona serivisi zose bakeneye mu gihe cy'iminota mike - kuva ku makuru y'ibihe, ibiciro by'isoko, ubujyanama bw'AI, kugeza ku isoko ry'ibicuruzwa.
              </p>
              <p>
                Turateganya gufasha abahinzi miliyoni 1 mu Rwanda mu myaka 5 iri imbere, dufite ikoranabuhanga kandi duhita dufasha abahinzi kuzamura ubuzima bwabo.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="w-8 h-8 text-primary" />
                Indangagaciro Zacu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Kwizera:</strong> Twizera abahinzi kandi turashaka kubaha serivisi nziza zikwiye</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Ikoranabuhanga:</strong> Tukoresheje tekinolojiya nshya kugirango tufashe abahinzi gukora neza</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Ubufatanye:</strong> Turashaka ko abahinzi bafatanya no gusangira ubumenyi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Iterambere:</strong> Turafasha abahinzi kuzamura umusaruro wabo no kongera amafaranga yabo</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="w-8 h-8 text-primary" />
                Itsinda Ryacu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
              <p>
                Eza Muhinzi yubatswe n'itsinda ry'abanyarwanda bafite ubumenyi mu ikoranabuhanga n'ubuhinzi. Twakoranye n'abahinga b'ubuhinzi, abahinzi, n'inzobere mu iterambere ry'abahinzi kugirango tukore porogaramu ifasha abahinzi mu Rwanda.
              </p>
              <p>
                Turafite ubwiyunge bwo gufasha abahinzi gukoresha ikoranabuhanga neza kandi tukaba dufite umwanzuro wo gukomeza guteza imbere porogaramu yacu kugirango ifashe abahinzi benshi.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
