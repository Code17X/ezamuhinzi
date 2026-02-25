import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Plus, FileText, Video, Image, Loader2, Clock, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";

interface Guide {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  guide_type: string;
  file_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string;
  status: string;
  created_at: string;
  profile?: { full_name: string | null };
}

const UserGuides = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [myGuides, setMyGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [guideType, setGuideType] = useState("document");
  const [category, setCategory] = useState("general");
  const [videoUrl, setVideoUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    loadGuides();
  }, [user]);

  const loadGuides = async () => {
    setIsLoading(true);
    try {
      // Load approved guides
      const { data: approved } = await supabase
        .from("user_guides")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      setGuides((approved as Guide[]) || []);

      // Load user's own guides
      if (user) {
        const { data: mine } = await supabase
          .from("user_guides")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setMyGuides((mine as Guide[]) || []);
      }
    } catch (err) {
      console.error("Error loading guides:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "thumbnail") => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("guide-files")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("guide-files")
        .getPublicUrl(path);

      if (type === "file") setFileUrl(publicUrl);
      else setThumbnailUrl(publicUrl);

      toast({ title: t("common.success"), description: t("guides.fileUploaded") });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: t("common.error"), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) return;

    if (guideType === "video" && !videoUrl.trim()) {
      toast({ title: t("guides.videoUrlRequired"), variant: "destructive" });
      return;
    }
    if (guideType === "document" && !fileUrl) {
      toast({ title: t("guides.fileRequired"), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("user_guides").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        guide_type: guideType,
        category,
        video_url: guideType === "video" ? videoUrl.trim() : null,
        file_url: fileUrl || null,
        thumbnail_url: thumbnailUrl || null,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: t("common.success"), description: t("guides.submitSuccess") });
      resetForm();
      loadGuides();
    } catch (err) {
      console.error("Submit error:", err);
      toast({ title: t("common.error"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("user_guides").delete().eq("id", id);
      if (error) throw error;
      toast({ title: t("common.success") });
      loadGuides();
    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGuideType("document");
    setCategory("general");
    setVideoUrl("");
    setFileUrl("");
    setThumbnailUrl("");
    setShowCreate(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5" />;
      case "image": return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />{t("guides.approved")}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />{t("guides.rejected")}</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />{t("guides.pending")}</Badge>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      general: t("guides.catGeneral"),
      crops: t("guides.catCrops"),
      livestock: t("guides.catLivestock"),
      equipment: t("guides.catEquipment"),
      business: t("guides.catBusiness"),
    };
    return map[cat] || cat;
  };

  const renderGuideCard = (guide: Guide, showStatus = false, showDelete = false) => (
    <Card key={guide.id} className="hover:shadow-lg transition-shadow">
      {guide.thumbnail_url && (
        <div className="w-full h-40 overflow-hidden rounded-t-lg">
          <img src={guide.thumbnail_url} alt={guide.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getTypeIcon(guide.guide_type)}
            <Badge variant="outline">{getCategoryLabel(guide.category)}</Badge>
          </div>
          {showStatus && getStatusBadge(guide.status)}
        </div>
        <CardTitle className="text-lg mt-2">{guide.title}</CardTitle>
        {guide.description && (
          <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(guide.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            {guide.video_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={guide.video_url} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4 mr-1" />{t("guides.watchVideo")}
                </a>
              </Button>
            )}
            {guide.file_url && (
              <Button size="sm" variant="outline" asChild>
                <a href={guide.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />{t("guides.openFile")}
                </a>
              </Button>
            )}
            {showDelete && (
              <Button size="sm" variant="ghost" onClick={() => handleDelete(guide.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Guide Button */}
      {user && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t("guides.createGuide")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("guides.createGuide")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t("guides.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder={t("guides.descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={guideType} onValueChange={setGuideType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">{t("guides.typeDocument")}</SelectItem>
                    <SelectItem value="video">{t("guides.typeVideo")}</SelectItem>
                    <SelectItem value="image">{t("guides.typeImage")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t("guides.catGeneral")}</SelectItem>
                    <SelectItem value="crops">{t("guides.catCrops")}</SelectItem>
                    <SelectItem value="livestock">{t("guides.catLivestock")}</SelectItem>
                    <SelectItem value="equipment">{t("guides.catEquipment")}</SelectItem>
                    <SelectItem value="business">{t("guides.catBusiness")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {guideType === "video" && (
                <Input
                  placeholder={t("guides.videoUrlPlaceholder")}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {guideType === "video" ? t("guides.thumbnailOptional") : t("guides.uploadFile")}
                </label>
                <Input
                  type="file"
                  accept={guideType === "image" ? "image/*" : guideType === "document" ? ".pdf,.doc,.docx,.ppt,.pptx" : "image/*"}
                  onChange={(e) => handleFileUpload(e, guideType === "video" ? "thumbnail" : "file")}
                  disabled={uploading}
                />
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>

              {guideType !== "video" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("guides.thumbnailOptional")}</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "thumbnail")}
                    disabled={uploading}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">{t("guides.approvalNote")}</p>

              <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()} className="w-full">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("guides.submit")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* My Pending/Rejected Guides */}
      {myGuides.filter(g => g.status !== "approved").length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">{t("guides.myGuides")}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {myGuides.filter(g => g.status !== "approved").map(g => renderGuideCard(g, true, true))}
          </div>
        </div>
      )}

      {/* Approved Guides */}
      {guides.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t("guides.noGuides")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("guides.beFirst")}</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {guides.map(g => renderGuideCard(g, false, g.user_id === user?.id))}
        </div>
      )}
    </div>
  );
};

export default UserGuides;
