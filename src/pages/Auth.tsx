import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
          {showForgotPassword ? (
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
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="imeri@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Urakora konti..." : "Kora Konti"}
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
