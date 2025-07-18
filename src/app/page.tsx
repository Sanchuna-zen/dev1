import { ProfileSetupWizard } from "@/components/profile/profile-setup-wizard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <ProfileSetupWizard />
    </main>
  );
}
