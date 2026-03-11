import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import HomeButton from "@/components/HomeButton";
import UserGuides from "@/components/UserGuides";
import FinanceCalculator from "@/components/FinanceCalculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ArrowRight, Loader2, BookOpen, Newspaper, Calculator, Plus, Sprout, Droplets, Scissors, DollarSign, CheckCircle2, Circle, Trash2, CalendarDays, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, isAfter, isBefore, addDays } from "date-fns";

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

interface FarmActivity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  crop_name: string | null;
  field_name: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  is_completed: boolean | null;
  cost: number | null;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  reminder_enabled: boolean | null;
  created_at: string;
  updated_at: string;
}

const News = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  // New activity form
  const [newActivity, setNewActivity] = useState({
    activity_type: "planting",
    title: "",
    description: "",
    crop_name: "",
    field_name: "",
    scheduled_date: "",
    cost: 0,
    quantity: "",
    unit: "kg",
    notes: "",
    reminder_enabled: false,
  });

  useEffect(() => {
    fetchRABNews();
  }, [i18n.language]);

  useEffect(() => {
    if (user) fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;
    setActivitiesLoading(true);
    try {
      const { data, error } = await supabase
        .from("farm_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      setActivities((data as FarmActivity[]) || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const addActivity = async () => {
    if (!user || !newActivity.title) return;
    try {
      const { error } = await supabase.from("farm_activities").insert({
        user_id: user.id,
        ...newActivity,
        cost: newActivity.cost || 0,
      });
      if (error) throw error;
      toast({ title: t("common.success"), description: t("farm.activityAdded") });
      setShowAddDialog(false);
      setNewActivity({ activity_type: "planting", title: "", description: "", crop_name: "", field_name: "", scheduled_date: "", cost: 0, quantity: "", unit: "kg", notes: "", reminder_enabled: false });
      fetchActivities();
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const toggleComplete = async (activity: FarmActivity) => {
    try {
      const { error } = await supabase
        .from("farm_activities")
        .update({
          is_completed: !activity.is_completed,
          completed_date: !activity.is_completed ? new Date().toISOString().split("T")[0] : null,
        })
        .eq("id", activity.id);
      if (error) throw error;
      fetchActivities();
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase.from("farm_activities").delete().eq("id", id);
      if (error) throw error;
      fetchActivities();
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "planting": return <Sprout className="w-4 h-4 text-primary" />;
      case "fertilizing": return <Droplets className="w-4 h-4 text-accent" />;
      case "harvesting": return <Scissors className="w-4 h-4 text-orange-500" />;
      case "expense": return <DollarSign className="w-4 h-4 text-destructive" />;
      default: return <CalendarDays className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "planting": return "bg-primary/10 text-primary border-primary/20";
      case "fertilizing": return "bg-accent/10 text-accent border-accent/20";
      case "harvesting": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "expense": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const filteredActivities = activities.filter(a => {
    if (activeFilter === "all") return true;
    if (activeFilter === "upcoming") return !a.is_completed && a.scheduled_date && isAfter(new Date(a.scheduled_date), new Date());
    if (activeFilter === "overdue") return !a.is_completed && a.scheduled_date && isBefore(new Date(a.scheduled_date), new Date());
    if (activeFilter === "completed") return a.is_completed;
    return a.activity_type === activeFilter;
  });

  const totalExpenses = activities.filter(a => a.cost && a.cost > 0).reduce((sum, a) => sum + (a.cost || 0), 0);
  const completedCount = activities.filter(a => a.is_completed).length;
  const upcomingCount = activities.filter(a => !a.is_completed && a.scheduled_date && isAfter(new Date(a.scheduled_date), addDays(new Date(), -1))).length;
  const overdueCount = activities.filter(a => !a.is_completed && a.scheduled_date && isBefore(new Date(a.scheduled_date), new Date())).length;

  // News fetching
  const fetchRABNews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rab-news', {
        body: { language: i18n.language }
      });
      if (error) throw error;
      if (data?.articles) setArticles(data.articles);
    } catch (error) {
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
        { id: "1", title: "Ubwoko Bushya bw'Ibigori bihanganira Ihwiri", excerpt: "Abashakashatsi b'ubuhinzi batanze ubwoko bushya bw'ibigori bushobora guhanganira igihe kinini cy'ihwiri.", category: "Ikoranabuhanga", date: "Uyu Munsi", image: "🌽" },
        { id: "2", title: "Uburyo Bushya bwo Guhinga buteza Imbere", excerpt: "Uburyo bushya bwo guhinga bukoresheje ikoranabuhanga bwerekanye ko buzatanga umusaruro mwinshi ugera kuri 40%.", category: "Ubuhinga", date: "Ejo Hashize", image: "🌱" },
        { id: "3", title: "Isoko Ryabihingwa Ryiyongera mu Rwanda", excerpt: "Ibiciro by'ibihingwa byiyongereye mu Rwanda bitewe n'umusaruro mwinshi n'isoko ry'i mahanga.", category: "Ubukungu", date: "Iki Cyumweru", image: "📈" },
        { id: "4", title: "Ikawa y'i Rwanda Yatsindiye Ibihembo", excerpt: "Ikawa y'i Rwanda yongereye gukunda ku isoko ry'amahanga maze itwara ibihembo byinshi.", category: "Ikoranabuhanga", date: "Iki Cyumweru", image: "☕" },
        { id: "5", title: "Uburyo bwo Kurinda Ibihingwa ku Ndwara", excerpt: "Abahinga bw'ubuhinzi batanze uburyo bushya bwo kurinda ibihingwa ku ndwara zikunze gutera.", category: "Ubuzima", date: "Icyumweru Gishize", image: "🛡️" },
      ],
    ],
    en: [
      [
        { id: "1", title: "New Drought-Resistant Maize Variety Released", excerpt: "Agricultural researchers have developed a new maize variety that can withstand extended dry periods.", category: "Technology", date: "Today", image: "🌽" },
        { id: "2", title: "Smart Farming Technology Shows 40% Yield Increase", excerpt: "New smart farming technology using AI and sensors demonstrates significant productivity gains.", category: "Innovation", date: "Yesterday", image: "🌱" },
        { id: "3", title: "Crop Prices Rising in Rwanda Market", excerpt: "Prices for key crops have increased in Rwanda's markets, bringing good news for farmers.", category: "Economy", date: "This Week", image: "📈" },
        { id: "4", title: "Rwandan Coffee Wins International Awards", excerpt: "Rwanda's coffee continues to gain international recognition.", category: "Technology", date: "This Week", image: "☕" },
        { id: "5", title: "New Disease-Resistant Crop Protection Methods", excerpt: "Agricultural scientists have introduced new methods to protect crops from common diseases.", category: "Health", date: "Last Week", image: "🛡️" },
      ],
    ],
    fr: [
      [
        { id: "1", title: "Nouvelle Variété de Maïs Résistante à la Sécheresse", excerpt: "Les chercheurs agricoles ont développé une nouvelle variété de maïs résistante.", category: "Technologie", date: "Aujourd'hui", image: "🌽" },
        { id: "2", title: "La Technologie Agricole Intelligente Augmente le Rendement de 40%", excerpt: "La nouvelle technologie montre des gains de productivité significatifs.", category: "Innovation", date: "Hier", image: "🌱" },
        { id: "3", title: "Prix des Cultures en Hausse au Rwanda", excerpt: "Les prix des principales cultures augmentent sur les marchés rwandais.", category: "Économie", date: "Cette Semaine", image: "📈" },
      ],
    ],
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
    return colors[category] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HomeButton />

      <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">📈</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("farm.dashboardTitle")}
              </h1>
            </div>
            <p className="text-muted-foreground">{t("farm.dashboardDesc")}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activities.length}</p>
                  <p className="text-xs text-muted-foreground">{t("farm.totalActivities")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">{t("farm.completed")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
                  <p className="text-xs text-muted-foreground">{t("farm.upcoming")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalExpenses.toLocaleString()} RWF</p>
                  <p className="text-xs text-muted-foreground">{t("farm.totalExpenses")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="activities" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">{t("farm.activities")}</span>
                <span className="sm:hidden">{t("farm.activitiesShort")}</span>
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">{t("finance.tabTitle")}</span>
                <span className="sm:hidden">💰</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Newspaper className="w-4 h-4" />
                <span className="hidden sm:inline">{t("news.title")}</span>
                <span className="sm:hidden">📰</span>
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t("guides.title")}</span>
                <span className="sm:hidden">📚</span>
              </TabsTrigger>
            </TabsList>

            {/* FARM ACTIVITIES TAB */}
            <TabsContent value="activities">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {["all", "planting", "fertilizing", "harvesting", "expense", "upcoming", "overdue", "completed"].map(f => (
                    <Button
                      key={f}
                      variant={activeFilter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(f)}
                      className="text-xs"
                    >
                      {t(`farm.filter.${f}`)}
                      {f === "overdue" && overdueCount > 0 && (
                        <span className="ml-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                          {overdueCount}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      {t("farm.addActivity")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t("farm.addActivity")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">{t("farm.activityType")}</label>
                        <Select value={newActivity.activity_type} onValueChange={v => setNewActivity(p => ({ ...p, activity_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planting">🌱 {t("farm.type.planting")}</SelectItem>
                            <SelectItem value="fertilizing">💧 {t("farm.type.fertilizing")}</SelectItem>
                            <SelectItem value="harvesting">✂️ {t("farm.type.harvesting")}</SelectItem>
                            <SelectItem value="expense">💰 {t("farm.type.expense")}</SelectItem>
                            <SelectItem value="other">📋 {t("farm.type.other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">{t("farm.titleLabel")}</label>
                        <Input value={newActivity.title} onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))} placeholder={t("farm.titlePlaceholder")} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">{t("farm.cropName")}</label>
                          <Input value={newActivity.crop_name} onChange={e => setNewActivity(p => ({ ...p, crop_name: e.target.value }))} placeholder={t("farm.cropPlaceholder")} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">{t("farm.fieldName")}</label>
                          <Input value={newActivity.field_name} onChange={e => setNewActivity(p => ({ ...p, field_name: e.target.value }))} placeholder={t("farm.fieldPlaceholder")} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">{t("farm.scheduledDate")}</label>
                          <Input type="date" value={newActivity.scheduled_date} onChange={e => setNewActivity(p => ({ ...p, scheduled_date: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">{t("farm.costLabel")}</label>
                          <Input type="number" value={newActivity.cost} onChange={e => setNewActivity(p => ({ ...p, cost: Number(e.target.value) }))} placeholder="RWF" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">{t("farm.quantityLabel")}</label>
                          <Input value={newActivity.quantity} onChange={e => setNewActivity(p => ({ ...p, quantity: e.target.value }))} placeholder="100" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">{t("farm.unitLabel")}</label>
                          <Select value={newActivity.unit} onValueChange={v => setNewActivity(p => ({ ...p, unit: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="tons">tons</SelectItem>
                              <SelectItem value="bags">bags</SelectItem>
                              <SelectItem value="pieces">pieces</SelectItem>
                              <SelectItem value="liters">liters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">{t("farm.notesLabel")}</label>
                        <Textarea value={newActivity.notes || ""} onChange={e => setNewActivity(p => ({ ...p, notes: e.target.value }))} placeholder={t("farm.notesPlaceholder")} rows={2} />
                      </div>
                      <Button className="w-full" onClick={addActivity} disabled={!newActivity.title}>
                        {t("farm.saveActivity")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {activitiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredActivities.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Sprout className="w-12 h-12 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">{t("farm.noActivities")}</p>
                    <p className="text-sm text-muted-foreground">{t("farm.noActivitiesDesc")}</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map(activity => {
                    const isOverdue = !activity.is_completed && activity.scheduled_date && isBefore(new Date(activity.scheduled_date), new Date());
                    return (
                      <Card key={activity.id} className={`transition-all hover:shadow-md ${activity.is_completed ? "opacity-60" : ""} ${isOverdue ? "border-destructive/40" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleComplete(activity)} className="mt-1 flex-shrink-0">
                              {activity.is_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <Badge className={getActivityColor(activity.activity_type)} variant="outline">
                                      {getActivityIcon(activity.activity_type)}
                                      <span className="ml-1">{t(`farm.type.${activity.activity_type}`)}</span>
                                    </Badge>
                                    {isOverdue && (
                                      <Badge variant="destructive" className="text-[10px] gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {t("farm.overdue")}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className={`font-semibold text-foreground ${activity.is_completed ? "line-through" : ""}`}>
                                    {activity.title}
                                  </h3>
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                    {activity.crop_name && <span>🌾 {activity.crop_name}</span>}
                                    {activity.field_name && <span>📍 {activity.field_name}</span>}
                                    {activity.scheduled_date && (
                                      <span>📅 {format(new Date(activity.scheduled_date), "dd MMM yyyy")}</span>
                                    )}
                                    {activity.cost && activity.cost > 0 && (
                                      <span>💰 {activity.cost.toLocaleString()} RWF</span>
                                    )}
                                    {activity.quantity && (
                                      <span>📦 {activity.quantity} {activity.unit}</span>
                                    )}
                                  </div>
                                  {activity.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">📝 {activity.notes}</p>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteActivity(activity.id)} className="flex-shrink-0 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* FINANCE TAB */}
            <TabsContent value="finance">
              <FinanceCalculator />
            </TabsContent>

            {/* NEWS TAB */}
            <TabsContent value="news">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader><CardTitle className="text-lg">RAB Urubuga Rukuru</CardTitle></CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href="https://www.rab.gov.rw/" target="_blank" rel="noopener noreferrer">Sura Urubuga</a>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader><CardTitle className="text-lg">Serivisi za RAB</CardTitle></CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href="https://www.rab.gov.rw/online-services" target="_blank" rel="noopener noreferrer">Serivisi kuri Enterineti</a>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader><CardTitle className="text-lg">Amatangazo & Publications</CardTitle></CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href="https://www.rab.gov.rw/publications" target="_blank" rel="noopener noreferrer">Reba Amatangazo</a>
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
                  <Link to={`/news/${articles[0].id}`}>
                    <Card className="mb-8 hover:shadow-lg transition-shadow cursor-pointer border-2">
                      <CardHeader>
                        <Badge className={getCategoryColor(articles[0].category)}>{t('news.featured')}</Badge>
                        <CardTitle className="text-3xl mt-4 hover:text-primary transition-colors">{articles[0].title}</CardTitle>
                        <CardDescription className="text-lg mt-2">{articles[0].excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl">{articles[0].image}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" /><span>{articles[0].date}</span>
                            </div>
                          </div>
                          <Button variant="ghost">{t('news.readMore')}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{t('news.allArticles')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {articles.slice(1).map(article => (
                        <Link key={article.id} to={`/news/${article.id}`}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
                                <span className="text-3xl">{article.image}</span>
                              </div>
                              <CardTitle className="text-xl hover:text-primary transition-colors">{article.title}</CardTitle>
                              <CardDescription className="mt-2">{article.excerpt}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" /><span>{article.date}</span>
                                </div>
                                <Button variant="ghost" size="sm">{t('news.readArticle')}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* GUIDES TAB */}
            <TabsContent value="guides">
              <UserGuides />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default News;
