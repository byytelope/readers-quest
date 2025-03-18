import {
  AuthError,
  type PostgrestError,
  type Session,
} from "@supabase/supabase-js";
import { SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "@/utils/supabase";
import type { TablesUpdate } from "./database.types";
import type { User } from "./types";

type SupabaseContextProps = {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  signUp: (email: string, password: string) => Promise<AuthError | null>;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  updateUser: (
    userInfo: Omit<TablesUpdate<"user_info">, "id">,
  ) => Promise<AuthError | PostgrestError | null>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  session: null,
  user: null,
  initialized: false,
  signUp: async () => null,
  signIn: async () => null,
  signOut: async () => {},
  updateUser: async () => null,
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserInfo = async (session: Session | null) => {
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from("user_info")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user info:", error);
      return null;
    }

    return data;
  };

  const handleSessionChange = async (newSession: Session | null) => {
    setSession(newSession);

    if (newSession?.user) {
      const userData = await fetchUserInfo(newSession);
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  const signUp = async (
    email: string,
    password: string,
  ): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  const updateUser = async (
    userInfo: Omit<TablesUpdate<"user_info">, "id">,
  ) => {
    if (!session) {
      return new AuthError("User not logged in.", 403, "-1");
    }

    const { data, error } = await supabase
      .from("user_info")
      .upsert({ id: session!.user.id, ...userInfo })
      .eq("id", session!.user.id)
      .select()
      .single();

    setUser(data as User);

    return error;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: bruh
  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
      }

      await handleSessionChange(data.session);
      setInitialized(true);
      await SplashScreen.hideAsync();
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        await handleSessionChange(newSession);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        session,
        user,
        initialized,
        signUp,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
