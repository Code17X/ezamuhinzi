import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const UserAgreement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkAgreement = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("agreed_to_terms")
        .eq("id", user.id)
        .single();

      if (data && !data.agreed_to_terms) {
        setOpen(true);
      }
    };

    checkAgreement();
  }, [user]);

  const handleAccept = async () => {
    if (!user || !agreed) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ agreed_to_terms: true } as any)
      .eq("id", user.id);

    if (error) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOpen(false);
      toast({
        title: t("common.success"),
        description: t("agreement.accepted"),
      });
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>{t("agreement.title")}</DialogTitle>
          </div>
          <DialogDescription>{t("agreement.subtitle")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[340px] rounded-md border p-4">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h3 className="font-semibold text-foreground mb-1">{t("agreement.section1Title")}</h3>
              <p>{t("agreement.section1Content")}</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-1">{t("agreement.section2Title")}</h3>
              <p>{t("agreement.section2Content")}</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-1">{t("agreement.section3Title")}</h3>
              <p>{t("agreement.section3Content")}</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-1">{t("agreement.section4Title")}</h3>
              <p>{t("agreement.section4Content")}</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-1">{t("agreement.section5Title")}</h3>
              <p>{t("agreement.section5Content")}</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-1">{t("agreement.section6Title")}</h3>
              <p>{t("agreement.section6Content")}</p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-2 pt-2">
          <Checkbox
            id="agree-terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label
            htmlFor="agree-terms"
            className="text-sm cursor-pointer leading-tight"
          >
            {t("agreement.checkboxLabel")}
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!agreed || loading}
            className="w-full"
          >
            {loading ? t("common.loading") : t("agreement.acceptButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserAgreement;
