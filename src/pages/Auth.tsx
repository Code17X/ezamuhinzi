import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, MailCheck, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().regex(/^(\+?250|0)?7[238]\d{7}$/, "Invalid Rwanda phone number"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "login";
  
  const [mode, setMode] = useState<"login" | "signup">(initialMode as "login" | "signup");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    message?: string;
    didYouMean?: string;
  }>({ status: 'idle' });
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    email: "",
    phoneNumber: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result?.error) {
        toast({
          title: "Ikosa",
          description: "Kwinjira na Google ntibyagenze neza. Ongera ugerageze.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Ikosa",
        description: "Kwinjira na Google ntibyagenze neza.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateEmail = async (email: string) => {
    setEmailValidation({ status: 'validating' });
    try {
      const { data, error } = await supabase.functions.invoke('validate-email', {
        body: { email },
      });

      if (error) {
        console.error('Email validation error:', error);
        setEmailValidation({ status: 'valid' }); // Allow on error
        return true;
      }

      if (data.valid) {
        setEmailValidation({ status: 'valid', message: 'Imeri yemejwe!' });
        return true;
      } else {
        const msg = data.status === 'invalid' 
          ? 'Iyi imeri ntabwo ibaho. Nyamuneka shyiramo imeri ikora.'
          : data.status === 'spamtrap' || data.status === 'abuse'
          ? 'Iyi imeri ntishobora gukoreshwa.'
          : 'Imeri ntiyemejwe. Nyamuneka shyiramo imeri ikora.';
        setEmailValidation({ 
          status: 'invalid', 
          message: msg,
          didYouMean: data.did_you_mean || undefined,
        });
        return false;
      }
    } catch (err) {
      console.error('Email validation failed:', err);
      setEmailValidation({ status: 'valid' }); // Allow on network error
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (mode === "login") {
        const validated = loginSchema.parse(formData);
        const { error } = await signIn(validated.emailOrPhone, validated.password);
        if (!error) {
          navigate("/");
        }
      } else {
        const validated = signupSchema.parse(formData);
        
        // Validate email with ZeroBounce before signup
        const isEmailValid = await validateEmail(validated.email);
        if (!isEmailValid) {
          setLoading(false);
          return;
        }

        const { error } = await signUp(
          validated.email || "", 
          validated.password, 
          validated.fullName,
          validated.phoneNumber
        );
        if (!error) {
          setShowVerificationMessage(true);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Ikosa",
        description: "Shyiramo imeri yawe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (error) {
      toast({
        title: "Ikosa",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Byagenze neza",
        description: "Reba imeri yawe kugira ngo usubize ijambo ry'ibanga",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2 px-4">
          <CardTitle className="text-xl sm:text-2xl">Murakaza neza kuri Eza Muhinzi</CardTitle>
          <CardDescription className="text-sm">
            {showForgotPassword 
              ? "Subiza ijambo ry'ibanga"
              : mode === "login" 
              ? "Injira kugira ngo ubone serivisi zawe"
              : "Kora konti kugira ngo utangire"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {showVerificationMessage ? (
            <div className="text-center space-y-4 py-6">
              <MailCheck className="w-16 h-16 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Reba Imeri Yawe!</h3>
              <p className="text-muted-foreground text-sm">
                Twohereje ubutumwa kuri imeri yawe. Kanda kuri link iri muri imeri kugirango wemeze konti yawe mbere yo kwinjira.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowVerificationMessage(false);
                  setMode("login");
                }}
                className="w-full"
              >
                Subira ku kwinjira
              </Button>
            </div>
          ) : showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Imeri</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="imeri@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Urohereza..." : "Ohereza Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Subira Inyuma
                </Button>
              </div>
            </form>
          ) : (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Injira</TabsTrigger>
                <TabsTrigger value="signup">Iyandikishe</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">Imeri cyangwa Telefoni</Label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="imeri@example.com cyangwa 0781234567"
                    value={formData.emailOrPhone}
                    onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                    required
                  />
                  {errors.emailOrPhone && <p className="text-sm text-destructive">{errors.emailOrPhone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Ijambo ry'ibanga</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Urainjira..." : "Injira"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline w-full text-center"
                  >
                    Wibagiwe ijambo ry'ibanga?
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Cyangwa</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Injira na Google
                </Button>
              </form>
            </TabsContent>
            
              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Amazina Yawe Yose</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefoni *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="0781234567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                  {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Imeri * <span className="text-xs text-muted-foreground">(imeri ikora gusa)</span></Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="imeri@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setEmailValidation({ status: 'idle' });
                      }}
                      required
                      className={`pr-10 ${emailValidation.status === 'valid' ? 'border-green-500' : emailValidation.status === 'invalid' ? 'border-destructive' : ''}`}
                    />
                    {emailValidation.status === 'validating' && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {emailValidation.status === 'valid' && (
                      <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {emailValidation.status === 'invalid' && (
                      <ShieldAlert className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                    )}
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  {emailValidation.status === 'invalid' && emailValidation.message && (
                    <p className="text-sm text-destructive">{emailValidation.message}</p>
                  )}
                  {emailValidation.didYouMean && (
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => {
                        setFormData({ ...formData, email: emailValidation.didYouMean! });
                        setEmailValidation({ status: 'idle' });
                      }}
                    >
                      Waba ushaka: {emailValidation.didYouMean}?
                    </button>
                  )}
                </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Ijambo ry'ibanga</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Emeza Ijambo ry'ibanga</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                
                  <Button type="submit" className="w-full" disabled={loading || emailValidation.status === 'validating'}>
                    {loading ? (emailValidation.status === 'validating' ? "Kwemeza imeri..." : "Urakora konti...") : "Kora Konti"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Cyangwa</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Iyandikishe na Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
