import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, Session } from './supabase';

type SubscriptionTier = 'guest' | 'free' | 'plus' | 'pro';

interface UsageInfo {
  remaining: number;
  limit: number;
  resetAt: string;
  tier: SubscriptionTier;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  usage: UsageInfo;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUsage: (usage: Partial<UsageInfo>) => void;
}

const defaultUsage: UsageInfo = {
  remaining: 5,
  limit: 5,
  resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  tier: 'guest',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageInfo>(defaultUsage);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Update default usage based on login state
      if (session?.user) {
        setUsage(prev => ({
          ...prev,
          limit: 15,
          remaining: Math.min(prev.remaining, 15),
          tier: 'free',
        }));
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          setUsage(prev => ({
            ...prev,
            limit: 15,
            tier: 'free',
          }));
        } else if (event === 'SIGNED_OUT') {
          setUsage(defaultUsage);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUsage = (newUsage: Partial<UsageInfo>) => {
    setUsage(prev => ({ ...prev, ...newUsage }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        usage,
        signIn,
        signUp,
        signOut,
        updateUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { UsageInfo, SubscriptionTier };
