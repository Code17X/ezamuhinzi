import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Check, Sparkles, TrendingUp, Loader2 } from 'lucide-react';

const Subscription = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSubscribed, subscription, loading: subLoading } = useSubscription();
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'airtel'>('momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: t('common.error'),
        description: t('subscription.phoneNumber') + ' required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          phoneNumber,
          paymentMethod,
          amount: 1000,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: t('common.success'),
          description: t('subscription.success'),
        });
        // Subscription will update automatically via realtime
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: t('subscription.error'),
        description: error.message || t('common.error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-foreground">{t('subscription.title')}</h1>
          {isSubscribed && (
            <Badge variant="default" className="animate-scale-in">
              <Check className="w-3 h-3 mr-1" />
              {t('subscription.active')}
            </Badge>
          )}
        </div>

        {isSubscribed ? (
          <Card className="card-hover animate-fade-in-up">
            <CardHeader>
              <CardTitle>{t('subscription.status')}</CardTitle>
              <CardDescription>
                {t('subscription.expires')}: {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{t('subscription.aiAccess')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{t('subscription.predictions')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-hover animate-fade-in-up stagger-item">
              <CardHeader>
                <CardTitle>{t('subscription.benefits')}</CardTitle>
                <CardDescription>{t('subscription.price')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('subscription.aiAccess')}</p>
                    <p className="text-sm text-muted-foreground">{t('landing.aiAssistantDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('subscription.predictions')}</p>
                    <p className="text-sm text-muted-foreground">{t('prices.aiAnalysis')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover animate-fade-in-up stagger-item">
              <CardHeader>
                <CardTitle>{t('subscription.selectPayment')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover-lift cursor-pointer">
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo" className="cursor-pointer flex-1">
                      <div className="font-semibold">{t('subscription.momoPayLabel')}</div>
                      <div className="text-xs text-muted-foreground">{t('subscription.momoPayDesc')}</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover-lift cursor-pointer">
                    <RadioGroupItem value="airtel" id="airtel" />
                    <Label htmlFor="airtel" className="cursor-pointer flex-1">
                      <div className="font-semibold">{t('subscription.airtelPayLabel')}</div>
                      <div className="text-xs text-muted-foreground">{t('subscription.airtelPayDesc')}</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('subscription.phoneNumber')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full button-press"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('subscription.processing')}
                    </>
                  ) : (
                    t('subscription.payNow')
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
