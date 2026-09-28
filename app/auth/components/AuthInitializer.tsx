"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthInitializer() {
  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log("Existing Supabase user:", session.user.id);
        return;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error(
          "Anonymous authentication failed:",
          error.message
        );
        return;
      }

      console.log(
        "Anonymous Supabase user created:",
        data.user?.id
      );
    };

    initializeAuth();
  }, []);

  return null;
}
