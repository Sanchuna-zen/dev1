
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SkillsOfferedStep } from "./steps/skills-offered-step";
import { SkillsSoughtStep } from "./steps/skills-sought-step";
import { PreferencesStep } from "./steps/preferences-step";
import { UserDetailsStep } from "./steps/user-details-step";
import { createClient } from "@/utils/supabase/client";

const steps = [
  { id: "01", name: "Skills Offered" },
  { id: "02", name: "Skills Sought" },
  { id: "03", name: "Preferences" },
  { id: "04", name: "User Details" },
];

interface ProfileData {
  skillsOffered: string[];
  skillsSought: string[];
  language: string;
  timezone: string;
  communication: string;
  avatar: File | null;
  userType: string;
}

export function ProfileSetupWizard() {
  const supabase = createClient();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [profileData, setProfileData] = React.useState<Partial<ProfileData>>({});
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNextStep = (data: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const handleFinalStep = async (data: Partial<ProfileData>) => {
    const finalData = { ...profileData, ...data };
    setProfileData(finalData);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to create a profile.");
      return;
    }

    let avatar_url = null;
    if (finalData.avatar) {
      const { data: avatarData, error: avatarError } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}/${finalData.avatar.name}`, finalData.avatar);
      if (avatarError) {
        alert("Error uploading avatar: " + avatarError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(avatarData.path);
      avatar_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      skills_offered: finalData.skillsOffered,
      skills_sought: finalData.skillsSought,
      language: finalData.language,
      timezone: finalData.timezone,
      communication_preference: finalData.communication,
      user_type: finalData.userType,
      avatar_url,
    });

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      alert("Profile setup complete!");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Setup</CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 text-center">
                <span className={index === currentStep ? "font-bold" : ""}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentStep === 0 && <SkillsOfferedStep onSave={(skillsOffered) => handleNextStep({ skillsOffered })} />}
        {currentStep === 1 && <SkillsSoughtStep onSave={(skillsSought) => handleNextStep({ skillsSought })} />}
        {currentStep === 2 && <PreferencesStep onSave={(preferences) => handleNextStep(preferences)} />}
        {currentStep === 3 && <UserDetailsStep onSave={(details) => handleFinalStep(details)} />}
      </CardContent>
    </Card>
  );
}
