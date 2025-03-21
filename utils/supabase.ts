import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export const supabase = createClient<Database>(
  `${process.env.EXPO_PUBLIC_SERVER_URL ?? ""}:54321/`,
  process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
