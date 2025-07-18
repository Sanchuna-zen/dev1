
'use client';

import { createServerClient } from "@/utils/supabase/server";
import { SessionCard } from "@/components/sessions/session-card";
import { SessionFilters } from "@/components/sessions/session-filters";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";

export default function BrowseSessionsPage() {
  const supabase = createServerClient();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      let query = supabase
        .from("sessions")
        .select("*, proposer:profiles(*)")
        .eq("status", "pending");

      if (searchParams.get('skill')) {
        query = query.or(`skill_offered.eq.${searchParams.get('skill')},skill_sought.eq.${searchParams.get('skill')}`);
      }
      if (searchParams.get('language')) {
        query = query.eq('language', searchParams.get('language'));
      }
      // Time filter logic would be more complex, depending on requirements
      // For now, we'll omit it.

      const { data: sessions } = await query;
      setSessions(sessions || []);
    }

    fetchSessions();
  }, [searchParams, supabase]);

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Browse Sessions</h1>
      <SessionFilters />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
