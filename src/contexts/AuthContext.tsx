import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<{ error: any }>;
  signIn: (emailOrPhone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Use phone as email if no email provided
    const authEmail = email || `${phoneNumber}@ezamuhinzi.app`;
    
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      },
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
        description: "Konti yawe yarakozwe neza!",
      });
      sessionStorage.setItem("ezamuhinzi_just_signed_up", "true");
    }

    return { error };
  };

  const signIn = async (emailOrPhone: string, password: string) => {
    // Check if input is phone number (starts with 0 or +250 or just digits)
    const isPhone = /^(\+?250|0)?7[238]\d{7}$/.test(emailOrPhone);
    const authEmail = isPhone 
      ? emailOrPhone.startsWith('0') 
        ? `${emailOrPhone}@ezamuhinzi.app`
        : `0${emailOrPhone.replace('+250', '')}@ezamuhinzi.app`
      : emailOrPhone;

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error) {
      toast({
        title: "Ikosa",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
