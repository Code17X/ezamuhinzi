import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  rw: {
    translation: {
      // Navigation
      home: "Ahabanza",
      assistant: "Umufasha wa AI",
      weather: "Ikirere",
      prices: "Ibiciro by'Ibihingwa",
      news: "Amakuru",
      profile: "Umwirondoro",
      settings: "Igenamiterere",
      social: "Urusobe",
      logout: "Gusohoka",
      
      // Landing Page
      "landing.title": "Murakaza neza kuri AgriConnect",
      "landing.subtitle": "Ikoranabuhanga rigufasha mu buhinzi",
      "landing.getStarted": "Tangira",
      "landing.login": "Kwinjira",
      "landing.features": "Ibikorwa",
      "landing.cropDetection": "Kumenya Indwara z'Ibihingwa",
      "landing.cropDetectionDesc": "Kureba ifoto y'igihingwa gicuza kugira ngo umenye indwara n'ubuvuzi",
      "landing.aiAssistant": "Umufasha wa AI",
      "landing.aiAssistantDesc": "Kubaza ibibazo byose ku buhinzi",
      "landing.weatherPrices": "Ikirere n'Ibiciro",
      "landing.weatherPricesDesc": "Kugenzura ikirere n'ibiciro by'ibihingwa",
      "landing.agriNews": "Amakuru y'Ubuhinzi",
      "landing.agriNewsDesc": "Kubona amakuru agezweho ku buhinzi",
      
      // Auth Page
      "auth.login": "Kwinjira",
      "auth.signup": "Kwiyandikisha",
      "auth.email": "Imeri",
      "auth.password": "Ijambo ry'ibanga",
      "auth.fullName": "Izina ryuzuye",
      "auth.noAccount": "Nta konti ufite?",
      "auth.hasAccount": "Ufite konti?",
      "auth.signupNow": "Iyandikishe",
      "auth.loginNow": "Injira",
      
      // Home Page
      "home.welcome": "Murakaza neza",
      "home.latestNews": "Amakuru Agezweho",
      "home.features": "Ibikorwa",
      
      // Settings Page
      "settings.title": "Igenamiterere",
      "settings.appearance": "Isura",
      "settings.darkMode": "Umwanya w'umwijima",
      "settings.language": "Ururimi",
      "settings.notifications": "Imenyesha",
      "settings.enableNotifications": "Gushyira imenyesha",
      "settings.emailNotifications": "Imenyesha kuri imeri",
      "settings.privacy": "Ibanga",
      "settings.profileVisibility": "Kugaragara kw'umwirondoro",
      "settings.showLocation": "Kwerekana ahantu",
      "settings.aiPreferences": "Amahitamo ya AI",
      "settings.responseDetail": "Ibisobanuro birambuye",
      "settings.simple": "Byoroshye",
      "settings.detailed": "Birambuye",
      "settings.units": "Ibipimo",
      "settings.metric": "Metrike",
      "settings.imperial": "Imperial",
      "settings.saveChanges": "Bika Impinduka",
      "settings.saved": "Igenamiterere ryabitswe!",
      "settings.smsAlerts": "Imenyesha kuri Telefoni",
      "settings.phoneNumber": "Numero ya Telefoni",
      "settings.phoneNumberPlaceholder": "+250 7XX XXX XXX",
      
      // Social Feed
      "social.title": "Urusobe",
      "social.createPost": "Kora Ubutumwa",
      "social.postPlaceholder": "Andika ikintu...",
      "social.uploadImage": "Ongera Ifoto",
      "social.cropType": "Ubwoko bw'igihingwa",
      "social.harvestQuantity": "Umubare wasaruwe",
      "social.location": "Ahantu",
      "social.postType": "Ubwoko bw'ubutumwa",
      "social.general": "Rusange",
      "social.harvest": "Isarura",
      "social.tip": "Inama",
      "social.experience": "Uburambe",
      "social.post": "Tanga",
      "social.posting": "Iri gutangwa...",
      "social.likes": "Ibyishimwe",
      "social.comments": "Ibisobanuro",
      "social.share": "Sangiza",
      "social.writeComment": "Andika igitekerezo...",
      "social.send": "Ohereza",
      "social.noPostsYet": "Nta butumwa buri hano",
      "social.beFirst": "Uba wa mbere gutanga!",
      
      // Assistant
      "assistant.title": "Umufasha wa AI",
      "assistant.chat": "Kuganira",
      "assistant.analyzeCrop": "Gusesengura Igihingwa",
      "assistant.askQuestion": "Baza ikibazo...",
      
      // Weather
      "weather.title": "Ikirere",
      "weather.currentWeather": "Ikirere Cya Uyu Munsi",
      "weather.localConditions": "Imiterere y'ikirere hano",
      "weather.forecast": "Ibiganiro by'Ikirere",
      "weather.weekOutlook": "Ikirere c'Icyumweru",
      "weather.humidity": "Ubushuhe",
      "weather.wind": "Umuyaga",
      "weather.visibility": "Kureba",
      "weather.rain": "Imvura",
      "weather.farmingRecommendations": "Inama zo Guhinga",
      "weather.basedOnConditions": "Hashingiwe ku kirere",
      
      // Prices
      "prices.title": "Ibiciro by'Ibihingwa",
      "prices.marketPrices": "Ibiciro by'Isoko",
      "prices.realTimePricing": "Amakuru y'ibiciro",
      "prices.cropPrices": "Ibiciro by'Ibihingwa",
      "prices.livestockProduce": "Amatungo n'Ibicuruzwa",
      "prices.currentRates": "Ibiciro bya None",
      "prices.marketInfo": "Amakuru y'Isoko",
      "prices.lastUpdated": "Ivugururwa rya Nyuma",
      "prices.marketStatus": "Imiterere y'Isoko",
      "prices.open": "Irafunguye",
      "prices.priceHistory": "Amateka y'Ibiciro",
      "prices.currentPrice": "Igiciro cya None",
      "prices.trending": "Igenderwaho",
      "prices.up": "Cyiyongera",
      "prices.down": "Kiragabanuka",
      "prices.stable": "Kihamye",
      
      // News
      "news.title": "Amakuru",
      "news.latestNews": "Amakuru Agezweho",
      "news.agricultureUpdates": "Amakuru y'Ubuhinzi",
      "news.featured": "Inyandiko Nkuru",
      "news.allArticles": "Inyandiko Zose",
      "news.readMore": "Soma Byinshi",
      "news.readArticle": "Soma Inyandiko",
      "news.category": "Icyiciro",
      "news.publishedDate": "Itariki yo Gutangaza",
      
      // Profile
      "profile.title": "Umwirondoro",
      "profile.personalInfo": "Amakuru Yanjye",
      "profile.chatHistory": "Amateka y'Ibiganiro",
      "profile.savedDiagnoses": "Ibigereranyo Byabitswe",
      
      // Common
      "common.loading": "Iri gupakira...",
      "common.error": "Ikosa ryabaye",
      "common.success": "Byagenze neza!",
      "common.cancel": "Kureka",
      "common.save": "Bika",
      "common.delete": "Gusiba",
      "common.edit": "Guhindura",
      "common.viewAll": "Reba byose",
    }
  },
  en: {
    translation: {
      // Navigation
      home: "Home",
      assistant: "AI Assistant",
      weather: "Weather",
      prices: "Crop Prices",
      news: "News",
      profile: "Profile",
      settings: "Settings",
      social: "Social Feed",
      logout: "Logout",
      
      // Landing Page
      "landing.title": "Welcome to AgriConnect",
      "landing.subtitle": "Technology that helps you farm better",
      "landing.getStarted": "Get Started",
      "landing.login": "Login",
      "landing.features": "Features",
      "landing.cropDetection": "Crop Disease Detection",
      "landing.cropDetectionDesc": "Upload photos of sick crops to identify diseases and get treatment advice",
      "landing.aiAssistant": "AI Vet Assistant",
      "landing.aiAssistantDesc": "Ask any question about farming and livestock",
      "landing.weatherPrices": "Weather & Prices",
      "landing.weatherPricesDesc": "Monitor weather and crop prices",
      "landing.agriNews": "Agricultural News",
      "landing.agriNewsDesc": "Get the latest farming news",
      
      // Auth Page
      "auth.login": "Login",
      "auth.signup": "Sign Up",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.fullName": "Full Name",
      "auth.noAccount": "Don't have an account?",
      "auth.hasAccount": "Already have an account?",
      "auth.signupNow": "Sign up",
      "auth.loginNow": "Login",
      
      // Home Page
      "home.welcome": "Welcome",
      "home.latestNews": "Latest News",
      "home.features": "Features",
      
      // Settings Page
      "settings.title": "Settings",
      "settings.appearance": "Appearance",
      "settings.darkMode": "Dark Mode",
      "settings.language": "Language",
      "settings.notifications": "Notifications",
      "settings.enableNotifications": "Enable Notifications",
      "settings.emailNotifications": "Email Notifications",
      "settings.privacy": "Privacy",
      "settings.profileVisibility": "Profile Visibility",
      "settings.showLocation": "Show Location",
      "settings.aiPreferences": "AI Preferences",
      "settings.responseDetail": "Response Detail",
      "settings.simple": "Simple",
      "settings.detailed": "Detailed",
      "settings.units": "Units of Measurement",
      "settings.metric": "Metric",
      "settings.imperial": "Imperial",
      "settings.saveChanges": "Save Changes",
      "settings.saved": "Settings saved successfully!",
      "settings.smsAlerts": "SMS Alerts",
      "settings.phoneNumber": "Phone Number",
      "settings.phoneNumberPlaceholder": "+250 7XX XXX XXX",
      
      // Social Feed
      "social.title": "Social Feed",
      "social.createPost": "Create Post",
      "social.postPlaceholder": "Share something...",
      "social.uploadImage": "Upload Image",
      "social.cropType": "Crop Type",
      "social.harvestQuantity": "Harvest Quantity",
      "social.location": "Location",
      "social.postType": "Post Type",
      "social.general": "General",
      "social.harvest": "Harvest",
      "social.tip": "Farming Tip",
      "social.experience": "Experience",
      "social.post": "Post",
      "social.posting": "Posting...",
      "social.likes": "Likes",
      "social.comments": "Comments",
      "social.share": "Share",
      "social.writeComment": "Write a comment...",
      "social.send": "Send",
      "social.noPostsYet": "No posts yet",
      "social.beFirst": "Be the first to share!",
      
      // Assistant
      "assistant.title": "AI Assistant",
      "assistant.chat": "Chat",
      "assistant.analyzeCrop": "Analyze Crop",
      "assistant.askQuestion": "Ask a question...",
      
      // Weather
      "weather.title": "Weather",
      "weather.currentWeather": "Current Weather",
      "weather.localConditions": "Local conditions right now",
      "weather.forecast": "5-Day Forecast",
      "weather.weekOutlook": "Weather outlook for the week",
      "weather.humidity": "Humidity",
      "weather.wind": "Wind",
      "weather.visibility": "Visibility",
      "weather.rain": "Rain",
      "weather.farmingRecommendations": "Farming Recommendations",
      "weather.basedOnConditions": "Based on current weather conditions",
      
      // Prices
      "prices.title": "Crop Prices",
      "prices.marketPrices": "Market Prices",
      "prices.realTimePricing": "Real-time pricing information for crops and livestock",
      "prices.cropPrices": "Crop Prices",
      "prices.livestockProduce": "Livestock & Produce",
      "prices.currentRates": "Current market rates",
      "prices.marketInfo": "Market Information",
      "prices.lastUpdated": "Last Updated",
      "prices.marketStatus": "Market Status",
      "prices.open": "Open",
      "prices.priceHistory": "Price History",
      "prices.currentPrice": "Current Price",
      "prices.trending": "Trending",
      "prices.up": "Price increasing",
      "prices.down": "Price decreasing",
      "prices.stable": "Price stable",
      
      // News
      "news.title": "News",
      "news.latestNews": "Latest News",
      "news.agricultureUpdates": "Agricultural news and updates",
      "news.featured": "Featured Article",
      "news.allArticles": "All Articles",
      "news.readMore": "Read More",
      "news.readArticle": "Read Article",
      "news.category": "Category",
      "news.publishedDate": "Published",
      
      // Profile
      "profile.title": "Profile",
      "profile.personalInfo": "Personal Information",
      "profile.chatHistory": "Chat History",
      "profile.savedDiagnoses": "Saved Diagnoses",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "An error occurred",
      "common.success": "Success!",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.viewAll": "View All",
    }
  },
  fr: {
    translation: {
      // Navigation
      home: "Accueil",
      assistant: "Assistant IA",
      weather: "Météo",
      prices: "Prix des Cultures",
      news: "Actualités",
      profile: "Profil",
      settings: "Paramètres",
      social: "Réseau Social",
      logout: "Déconnexion",
      
      // Landing Page
      "landing.title": "Bienvenue sur AgriConnect",
      "landing.subtitle": "La technologie pour mieux cultiver",
      "landing.getStarted": "Commencer",
      "landing.login": "Connexion",
      "landing.features": "Fonctionnalités",
      "landing.cropDetection": "Détection des Maladies",
      "landing.cropDetectionDesc": "Téléchargez des photos de cultures malades pour identifier les maladies",
      "landing.aiAssistant": "Assistant IA Vétérinaire",
      "landing.aiAssistantDesc": "Posez des questions sur l'agriculture et le bétail",
      "landing.weatherPrices": "Météo et Prix",
      "landing.weatherPricesDesc": "Surveillez la météo et les prix des cultures",
      "landing.agriNews": "Actualités Agricoles",
      "landing.agriNewsDesc": "Recevez les dernières nouvelles agricoles",
      
      // Add more French translations as needed...
      "auth.login": "Connexion",
      "auth.signup": "S'inscrire",
      "auth.email": "Email",
      "auth.password": "Mot de passe",
      "auth.fullName": "Nom complet",
      
      "settings.title": "Paramètres",
      "settings.darkMode": "Mode Sombre",
      "settings.language": "Langue",
      "settings.saveChanges": "Enregistrer",
      "settings.smsAlerts": "Alertes SMS",
      "settings.phoneNumber": "Numéro de Téléphone",
      "settings.phoneNumberPlaceholder": "+250 7XX XXX XXX",
      
      "social.title": "Réseau Social",
      "social.createPost": "Créer une Publication",
      "social.post": "Publier",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'rw',
    lng: 'rw',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
