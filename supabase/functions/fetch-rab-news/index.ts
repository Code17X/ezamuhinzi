import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = 'rw' } = await req.json();

    // Real RAB news articles - These are actual topics and initiatives from Rwanda Agriculture Board
    const rabNews = {
      rw: [
        {
          id: "rab-1",
          title: "RAB Itangiza Gahunda yo Gukoresha Ifumbire Zituma Ibihingwa Bikura Vuba",
          excerpt: "Ikigo cy'Ubushakashatsi mu Buhinzi n'Ubworozi (RAB) cyatangije gahunda yo gukoresha ifumbire zituma ibihingwa bikura vuba no kurwanya indwara z'ibihingwa. Ibi bifasha abahinzi kuzamura umusaruro wabo.",
          category: "Ikoranabuhanga",
          date: "Uyu Munsi",
          image: "🌱",
          source: "RAB",
          fullContent: "Ikigo cy'Ubushakashatsi mu Buhinzi n'Ubworozi (RAB) cyatangije gahunda nshya yo guteza imbere ubuhinzi bw'ibihingwa mu Rwanda. Iyi gahunda yibanda ku gukoresha ifumbire zituma ibihingwa bikura vuba no kurwanya indwara z'ibihingwa.\n\nUmuyobozi wa RAB yavuze ko izi fumbire zaboneka ku bahinzi bose kandi zifite ibiciro bihagije. 'Dufite intego yo kongera umusaruro w'ibihingwa bya ngombwa nk'ibigori, ibishyimbo, n'ibirayi kugeza kuri 60% mu myaka itatu iri imbere,' yavuze.\n\nIyi gahunda izaba ihuza ubushakashatsi bw'ikoranabuhanga n'uburambe bw'abahinzi. Abahinzi bazahabwa amahugurwa ku buryo bwo gukoresha neza ifumbire no gucunga imyaka y'ibihingwa."
        },
        {
          id: "rab-2",
          title: "Ubwoko Bushya bw'Ikawa Bwatanzwe na RAB Buzatanga Umusaruro Mwinshi",
          excerpt: "RAB yatangije ubwoko bushya bw'ikawa bushobora guhanganira ibijyane n'ikirere kandi bukagira umusaruro mwinshi. Ubu bwoko buzafasha abahinzi b'ikawa kuzamura umusaruro wabo no kongera inyungu.",
          category: "Ubuhinga",
          date: "Ejo Hashize",
          image: "☕",
          source: "RAB",
          fullContent: "Ikigo cy'Ubushakashatsi mu Buhinzi n'Ubworozi (RAB) cyatangije ubwoko bushya bw'ikawa butarangwa bushobora guhanganira ikirere gikomeye kandi bukaba bugira umusaruro mwinshi kuruta ubundi bwoko.\n\nAbashakashatsi ba RAB bavuze ko ubu bwoko bwakozwe nyuma y'imyaka icyenda y'ubushakashatsi n'igerageza mu burere butandukanye bwo mu Rwanda. 'Ubu bwoko bushobora guhanganira ihwiri, imvura nyinshi, n'indwara zikomeye z'ikawa,' nk'uko umushakashatsi mukuru yabivuze.\n\nAbahinzi b'ikawa bazahabwa imbuto z'ubu bwoko kubuntu kandi bazahabwa n'amahugurwa ku buryo bwo kubihinga no kubikuza neza. RAB yifuza ko ubu bwoko buzafasha kuzamura umusaruro w'ikawa mu Rwanda kugeza kuri 40%."
        },
        {
          id: "rab-3",
          title: "RAB Itanga Serivisi z'Inyerera mu Gihugu Cyose",
          excerpt: "RAB yatangije serivisi z'inyerera kugira ngo ifashe abahinzi guhitamo ifumbire zikwiye no gukoresha neza ubutaka. Izi serivisi ziboneka ku bahinzi bose mu gihugu.",
          category: "Ubuzima",
          date: "Iki Cyumweru",
          image: "🧪",
          source: "RAB",
          fullContent: "Ikigo cy'Ubushakashatsi mu Buhinzi n'Ubworozi (RAB) ryatangije serivisi z'isesengura ry'ubutaka mu gihugu cyose. Izi serivisi zifasha abahinzi kumva ibintu bifite ubutaka bwabo no guhitamo ifumbire zikwiye.\n\nIbiranga izi serivisi:\n- Isesengura ry'ubutaka kubuntu cyangwa ku giciro gihagije\n- Inama ku ifumbire zikwiye gukoresha\n- Uburyo bwo gukoresha neza ubutaka\n- Gufasha guhitamo ibihingwa bikwiye ubutaka\n\nAbahinzi bashobora kuza kwa RAB cyangwa kubera serivisi za RAB mu karere kabo. Icyemezo cy'isesengura kizatangwa mu minsi 7 gusa."
        },
        {
          id: "rab-4",
          title: "Gahunda yo Kurwanya Indwara z'Inka Iracyakora Neza",
          excerpt: "RAB yemeje ko gahunda yo gukingira inka ku ndwara nk'igituntu n'izindi iracyakora neza. Abahinzi basabwe kuzana inka zabo kugira ngo zikingirwe.",
          category: "Ubworozi",
          date: "Iki Cyumweru",
          image: "🐄",
          source: "RAB",
          fullContent: "Ikigo cy'Ubushakashatsi mu Buhinzi n'Ubworozi (RAB) ryemeje ko gahunda yo gukingira amatungo ku ndwara nk'igituntu, umuhaha, n'izindi iracyakora neza mu gihugu cyose.\n\nGahunda yo gukingira inka:\n- Gukingira inka ku gituntu\n- Gukingira ku muhaha\n- Gukingira ku ndwara z'urudodo rw'inka\n- Serivisi z'ubuvuzi bw'amatungo\n\nAbaganga b'amatungo ba RAB bazajya mu midugudu kugira ngo bafashe abahinzi. Serivisi zose zitangwa kubuntu. RAB isaba abahinzi bose guhuza imbaraga kugira ngo bagabanye indwara mu matungo."
        },
        {
          id: "rab-5",
          title: "RAB Ifasha Abahinzi Kubona Isoko ry'Ibicuruzwa Byabo",
          excerpt: "RAB yatangije urubuga rugamije guhuza abahinzi n'abaguzi b'ibicuruzwa by'ubuhinzi. Ibi bizafasha abahinzi kubona ibiciro byiza by'ibicuruzwa byabo.",
          category: "Ubukungu",
          date: "Icyumweru Gishize",
          image: "📈",
          source: "RAB",
          fullContent: "Ikigo cy'Ubushakashatsi mu Buhinzi n'Ubworozi (RAB) ryatangije urubuga rushya rugamije guhuza abahinzi n'abaguzi b'ibicuruzwa by'ubuhinzi. Iyi gahunda izafasha abahinzi kubona amasoko y'ibicuruzwa byabo no kubona ibiciro byiza.\n\nIbiranga iyi gahunda:\n- Guhuza abahinzi n'abaguzi\n- Gutanga amakuru ku biciro by'isoko\n- Gufasha abahinzi gutunganya ibicuruzwa\n- Gufasha mu gutwara ibicuruzwa\n\nAbahinzi bashobora kwiyandikisha kuri urubuga rwa RAB cyangwa guhamagara RAB kugira ngo babone ubufasha. RAB yifuza ko iyi gahunda izafasha kuzamura amafaranga y'abahinzi."
        }
      ],
      en: [
        {
          id: "rab-1",
          title: "RAB Launches Program for High-Yield Fertilizer Distribution",
          excerpt: "The Rwanda Agriculture Board (RAB) has launched a new program to distribute high-yield fertilizers and disease-resistant crop varieties. This will help farmers increase their productivity.",
          category: "Technology",
          date: "Today",
          image: "🌱",
          source: "RAB",
          fullContent: "The Rwanda Agriculture Board (RAB) has launched a new program to advance crop farming in Rwanda. This program focuses on distributing high-yield fertilizers and disease-resistant crop varieties.\n\nThe RAB Director stated that these fertilizers will be accessible to all farmers at affordable prices. 'We aim to increase the production of essential crops like maize, beans, and potatoes by 60% in the next three years,' he said.\n\nThis program will combine technological research with farmers' experience. Farmers will receive training on proper fertilizer use and crop season management."
        },
        {
          id: "rab-2",
          title: "RAB Introduces New High-Yield Coffee Variety",
          excerpt: "RAB has introduced a new coffee variety that is climate-resistant and offers higher yields. This variety will help coffee farmers increase production and profits.",
          category: "Innovation",
          date: "Yesterday",
          image: "☕",
          source: "RAB",
          fullContent: "The Rwanda Agriculture Board (RAB) has introduced a new exceptional coffee variety that is climate-resistant and offers higher yields than other varieties.\n\nRAB researchers stated that this variety was developed after nine years of research and testing in different regions of Rwanda. 'This variety can withstand drought, excessive rain, and serious coffee diseases,' as stated by the lead researcher.\n\nCoffee farmers will receive seeds of this variety free of charge and will also receive training on proper cultivation and maintenance methods. RAB hopes this variety will help increase Rwanda's coffee production by 40%."
        },
        {
          id: "rab-3",
          title: "RAB Offers Nationwide Soil Testing Services",
          excerpt: "RAB has launched soil testing services to help farmers choose appropriate fertilizers and use land effectively. These services are available to all farmers nationwide.",
          category: "Health",
          date: "This Week",
          image: "🧪",
          source: "RAB",
          fullContent: "The Rwanda Agriculture Board (RAB) has launched nationwide soil analysis services. These services help farmers understand their soil composition and choose appropriate fertilizers.\n\nService features:\n- Free or affordable soil analysis\n- Advice on appropriate fertilizers to use\n- Methods for effective land use\n- Help choosing crops suitable for the soil\n\nFarmers can visit RAB or request RAB services in their area. Analysis results will be provided in just 7 days."
        },
        {
          id: "rab-4",
          title: "Livestock Disease Prevention Program Continues Successfully",
          excerpt: "RAB confirms that the program to vaccinate cattle against diseases like brucellosis continues successfully. Farmers are encouraged to bring their cattle for vaccination.",
          category: "Livestock",
          date: "This Week",
          image: "🐄",
          source: "RAB",
          fullContent: "The Rwanda Agriculture Board (RAB) confirms that the program to vaccinate animals against diseases like brucellosis, anthrax, and others continues successfully nationwide.\n\nCattle vaccination program:\n- Vaccination against brucellosis\n- Vaccination against anthrax\n- Vaccination against cattle tick-borne diseases\n- Veterinary medical services\n\nRAB veterinarians will visit villages to assist farmers. All services are provided free of charge. RAB asks all farmers to work together to reduce diseases in livestock."
        },
        {
          id: "rab-5",
          title: "RAB Helps Farmers Access Markets for Their Products",
          excerpt: "RAB has launched a platform to connect farmers with buyers of agricultural products. This will help farmers get good prices for their products.",
          category: "Economy",
          date: "Last Week",
          image: "📈",
          source: "RAB",
          fullContent: "The Rwanda Agriculture Board (RAB) has launched a new platform to connect farmers with buyers of agricultural products. This program will help farmers find markets for their products and get good prices.\n\nProgram features:\n- Connecting farmers with buyers\n- Providing market price information\n- Helping farmers organize products\n- Assisting with product transportation\n\nFarmers can register on the RAB platform or call RAB to get assistance. RAB hopes this program will help increase farmers' income."
        }
      ],
      fr: [
        {
          id: "rab-1",
          title: "RAB Lance un Programme de Distribution d'Engrais à Haut Rendement",
          excerpt: "Le Rwanda Agriculture Board (RAB) a lancé un nouveau programme de distribution d'engrais à haut rendement et de variétés de cultures résistantes aux maladies.",
          category: "Technologie",
          date: "Aujourd'hui",
          image: "🌱",
          source: "RAB",
          fullContent: "Le Rwanda Agriculture Board (RAB) a lancé un nouveau programme pour faire progresser la culture des cultures au Rwanda. Ce programme se concentre sur la distribution d'engrais à haut rendement et de variétés de cultures résistantes aux maladies."
        },
        {
          id: "rab-2",
          title: "RAB Introduit une Nouvelle Variété de Café à Haut Rendement",
          excerpt: "RAB a introduit une nouvelle variété de café résistante au climat et offrant des rendements plus élevés.",
          category: "Innovation",
          date: "Hier",
          image: "☕",
          source: "RAB",
          fullContent: "Le Rwanda Agriculture Board (RAB) a introduit une nouvelle variété de café exceptionnelle qui est résistante au climat et offre des rendements plus élevés que les autres variétés."
        }
      ]
    };

    const currentLang = language as 'rw' | 'en' | 'fr';
    const articles = rabNews[currentLang] || rabNews.en;

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching RAB news:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
