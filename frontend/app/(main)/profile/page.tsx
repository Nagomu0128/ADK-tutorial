"use client";

import Header from "@/components/layout/Header";
import ProfileWizard from "@/components/profile/ProfileWizard";
import { mockUserProfile } from "@/lib/mock-data";
import type { InvestmentStyle, RiskTolerance, ExperienceLevel } from "@/lib/types";

const ProfilePage = () => {
  const handleComplete = (data: {
    investmentStyle: InvestmentStyle;
    riskTolerance: RiskTolerance;
    experienceLevel: ExperienceLevel;
    interestedSectors: readonly string[];
    watchThemes: string;
  }) => {
    // Mock save — would call updateProfile API
    console.info("Profile saved:", data);
    alert("Profile saved successfully!");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Profile Settings
        </h1>
        <p className="mb-8 text-sm text-muted">
          Configure your investment preferences. These settings are used by AI
          agents to personalize your research reports and suggestions.
        </p>
        <ProfileWizard
          initialData={{
            investmentStyle: mockUserProfile.investmentStyle,
            riskTolerance: mockUserProfile.riskTolerance,
            experienceLevel: mockUserProfile.experienceLevel,
            interestedSectors: mockUserProfile.interestedSectors,
            watchThemes: [...mockUserProfile.watchThemes].join(", "),
          }}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
