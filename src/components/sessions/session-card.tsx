
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function SessionCard({ session }) {
  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  const handleRequest = async (e) => {
    e.preventDefault(); // Prevent navigating when button inside Link is clicked
    e.stopPropagation();

    if (!user) {
      toast.error("You must be logged in to request a session.");
      return;
    }

    const { error } = await supabase.from("session_requests").insert({
      session_id: session.id,
      requester_id: user.id,
    });

    if (error) {
      toast.error("Error creating request: " + error.message);
    } else {
      toast.success("Session request sent successfully!");
    }
  };

  const isProposer = user && user.id === session.proposer_id;

  return (
    <Card className="h-full flex flex-col">
      <Link href={`/sessions/${session.id}`} className="flex-grow">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={session.proposer.avatar_url} alt="Avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{session.proposer.email}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div>
            <h3 className="font-semibold">Offering</h3>
            <Badge>{session.skill_offered}</Badge>
          </div>
          <div>
            <h3 className="font-semibold">Requesting</h3>
            <Badge variant="secondary">{session.skill_sought}</Badge>
          </div>
          <div>
            <h3 className="font-semibold">Duration</h3>
            <p>{session.duration} minutes</p>
          </div>
        </CardContent>
      </Link>
      {!isProposer && (
        <div className="p-4 pt-0 mt-auto">
          <Button onClick={handleRequest} className="w-full">Request to Join</Button>
        </div>
      )}
    </Card>
  );
}
