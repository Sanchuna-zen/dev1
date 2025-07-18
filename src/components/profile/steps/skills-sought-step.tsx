
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface SkillsSoughtStepProps {
  onSave: (skills: string[]) => void;
}

export function SkillsSoughtStep({ onSave }: SkillsSoughtStepProps) {
  const [skills, setSkills] = React.useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = React.useState("");

  const handleAddSkill = () => {
    if (currentSkill.trim() !== "" && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = () => {
    if (skills.length > 0) {
      onSave(skills);
    }
  };

  return (
    <div className="grid gap-4">
      <Label htmlFor="skills-input">Skills you want to learn</Label>
      <div className="flex gap-2">
        <Input
          id="skills-input"
          placeholder="e.g., React, TypeScript, Next.js"
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSkill();
            }
          }}
        />
        <Button onClick={handleAddSkill}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
            <button
              className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => handleRemoveSkill(skill)}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
      </div>
      {skills.length === 0 && (
        <p className="text-sm text-destructive">Please add at least one skill.</p>
      )}
      <Button onClick={handleSave} disabled={skills.length === 0}>
        Save and Continue
      </Button>
    </div>
  );
}
