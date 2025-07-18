
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { timezones } from "@/lib/timezones";

interface PreferencesStepProps {
  onSave: (preferences: {
    language: string;
    timezone: string;
    communication: string;
  }) => void;
}

export function PreferencesStep({ onSave }: PreferencesStepProps) {
  const [language, setLanguage] = React.useState("");
  const [timezone, setTimezone] = React.useState("");
  const [communication, setCommunication] = React.useState("");

  const handleSave = () => {
    if (language && timezone && communication) {
      onSave({ language, timezone, communication });
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="language">Language</Label>
        <Select onValueChange={setLanguage} value={language}>
          <SelectTrigger id="language">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select onValueChange={setTimezone} value={timezone}>
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent className="max-h-[20rem] overflow-y-auto">
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Communication Preferences</Label>
        <RadioGroup onValueChange={setCommunication} value={communication}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="in-app" id="in-app" />
            <Label htmlFor="in-app">In-app messaging</Label>
          </div>
        </RadioGroup>
      </div>
      <Button onClick={handleSave} disabled={!language || !timezone || !communication}>
        Save and Continue
      </Button>
    </div>
  );
}
