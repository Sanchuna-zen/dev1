
'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SessionRequests({ session }) {
  const supabase = createClient();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("session_requests")
        .select("*, requester:profiles(*)")
        .eq("session_id", session.id)
        .eq("status", "pending");
      setRequests(data || []);
    };
    fetchRequests();
  }, [session.id, supabase]);

  const handleRequest = async (request, status) => {
    const { error: requestError } = await supabase
      .from("session_requests")
      .update({ status })
      .eq("id", request.id);

    if (requestError) {
      toast.error("Error updating request: " + requestError.message);
      return;
    }
    
    if (status === 'accepted') {
        const { error: sessionError } = await supabase
        .from("sessions")
        .update({ status: 'confirmed', partner_id: request.requester_id })
        .eq("id", session.id);

        if (sessionError) {
            toast.error("Error updating session: " + sessionError.message);
        } else {
            toast.success("Request accepted and session confirmed!");
        }
    } else {
        toast.success("Request rejected.");
    }

    setRequests(requests.filter((r) => r.id !== request.id));
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>
      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={request.requester.avatar_url} alt="Avatar" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{request.requester.email}</CardTitle>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleRequest(request, 'accepted')}>Accept</Button>
                <Button variant="destructive" onClick={() => handleRequest(request, 'rejected')}>Reject</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
        {requests.length === 0 && <p>No pending requests.</p>}
      </div>
    </div>
  );
}
