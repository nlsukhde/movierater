// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-white">Checking auth…</div>;
  }
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
