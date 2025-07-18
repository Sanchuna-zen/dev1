
import { createServerClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposeSessionForm } from "@/components/sessions/propose-session-form";

export default async function ProposeSessionPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("skills_offered, skills_sought")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return notFound();
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Propose a Session</CardTitle>
        </CardHeader>
        <CardContent>
          <ProposeSessionForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
