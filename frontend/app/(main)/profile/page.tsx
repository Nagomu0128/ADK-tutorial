"use client";

import { User } from "lucide-react";
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
    // Mock save -- would call updateProfile API
    console.info("Profile saved:", data);
    alert("Profile saved successfully!");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 ring-1 ring-blue-500/20">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Profile Settings
            </h1>
            <p className="text-sm text-slate-500">
              Configure your investment preferences for personalized AI analysis.
            </p>
          </div>
        </div>
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
