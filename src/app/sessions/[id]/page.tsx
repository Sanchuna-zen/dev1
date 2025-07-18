
'use client';

import { createServerClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SessionRequests } from "@/components/sessions/session-requests";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SessionPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: session } = await supabase
        .from("sessions")
        .select("*, proposer:profiles(*), partner:profiles(*)")
        .eq("id", params.id)
        .single();

      if (!session) {
        return notFound();
      }
      setSession(session);
    };
    fetchSession();
  }, [params.id, supabase]);

  const handleMarkComplete = async () => {
    const { error: awardError } = await supabase.rpc('award_credits', { session_id_param: session.id })
    const { error: deductError } = await supabase.rpc('deduct_credits', { session_id_param: session.id })

    if (awardError || deductError) {
      toast.error("Error marking session as complete: " + (awardError?.message || deductError?.message));
    } else {
      toast.success("Session marked as complete and credits exchanged!");
      const { data } = await supabase.from('sessions').update({ status: 'completed' }).eq('id', session.id).select().single();
      setSession(data);
    }
  };

  if (!session) {
    return <div>Loading...</div>
  }

  const isParticipant = user && (user.id === session.proposer_id || user.id === session.partner_id);

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="font-semibold">Proposed by</h3>
            <p>{session.proposer.email}</p>
          </div>
          {session.partner && (
             <div>
                <h3 className="font-semibold">Partner</h3>
                <p>{session.partner.email}</p>
             </div>
          )}
          <div>
            <h3 className="font-semibold">Skill Offered</h3>
            <p>{session.skill_offered}</p>
          </div>
          <div>
            <h3 className="font-semibold">Skill Sought</h3>
            <p>{session.skill_sought}</p>
          </div>
          <div>
            <h3 className="font-semibold">Duration</h3>
            <p>{session.duration} minutes</p>
          </div>
          <div>
            <h3 className="font-semibold">Proposed Time Slots</h3>
            <ul className="list-disc list-inside">
              {session.time_slots.map((ts) => (
                <li key={ts}>{new Date(ts).toLocaleString()}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Language</h3>
            <p>{session.language}</p>
          </div>
          <div>
            <h3 className="font-semibold">Accessibility Needs</h3>
            <p>{session.accessibility_needs}</p>
          </div>
          <div>
            <h3 className="font-semibold">Message</h3>
            <p>{session.message}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{session.status}</p>
          </div>
        </CardContent>
      </Card>

      {isParticipant && session.status === 'confirmed' && (
        <div className="mt-8">
            <Button onClick={handleMarkComplete}>Mark as Complete</Button>
        </div>
      )}

      {user && user.id === session.proposer_id && session.status === 'pending' && <SessionRequests session={session} />}

    </div>
  );
}
