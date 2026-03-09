"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type {
  InvestmentStyle,
  RiskTolerance,
  ExperienceLevel,
} from "@/lib/types";

type ProfileData = {
  investmentStyle: InvestmentStyle;
  riskTolerance: RiskTolerance;
  experienceLevel: ExperienceLevel;
  interestedSectors: readonly string[];
  watchThemes: string;
};

type ProfileWizardProps = {
  readonly initialData?: Partial<ProfileData>;
  readonly onComplete: (data: ProfileData) => void;
};

const investmentStyles: readonly { value: InvestmentStyle; label: string; description: string }[] = [
  { value: "short_term", label: "Short-term Trading", description: "Day trading and quick positions" },
  { value: "swing", label: "Swing Trading", description: "Hold for days to weeks" },
  { value: "long_term", label: "Long-term Investment", description: "Hold for months to years" },
  { value: "dividend", label: "Dividend Focus", description: "Focus on dividend income" },
];

const riskLevels: readonly { value: RiskTolerance; label: string; description: string }[] = [
  { value: "conservative", label: "Conservative", description: "Prioritize capital preservation" },
  { value: "balanced", label: "Balanced", description: "Moderate risk for moderate returns" },
  { value: "aggressive", label: "Aggressive", description: "Higher risk for higher potential returns" },
];

const experienceLevels: readonly { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "New to investing" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with stocks" },
  { value: "advanced", label: "Advanced", description: "Experienced investor" },
];

const sectorOptions: readonly string[] = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer",
  "Real Estate",
  "Industrial",
  "Materials",
  "Utilities",
  "Telecom",
];

const TOTAL_STEPS = 4;
const stepLabels = ["Style", "Risk & Exp", "Sectors", "Themes"] as const;

const OptionButton = ({
  selected,
  label,
  description,
  onClick,
}: {
  readonly selected: boolean;
  readonly label: string;
  readonly description: string;
  readonly onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      "w-full rounded-xl border p-4 text-left transition-all duration-200",
      selected
        ? "border-blue-500/30 bg-blue-500/8 text-foreground shadow-sm shadow-blue-500/5"
        : "border-card-border bg-card-bg-solid/30 text-slate-400 hover:border-slate-600 hover:bg-white/[0.02]"
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
      </div>
      {selected && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
          <Check size={12} />
        </div>
      )}
    </div>
  </button>
);

const ProfileWizard = ({ initialData, onComplete }: ProfileWizardProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ProfileData>({
    investmentStyle: initialData?.investmentStyle ?? "long_term",
    riskTolerance: initialData?.riskTolerance ?? "balanced",
    experienceLevel: initialData?.experienceLevel ?? "intermediate",
    interestedSectors: initialData?.interestedSectors ?? [],
    watchThemes: initialData?.watchThemes ?? "",
  });

  const updateField = <K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSector = (sector: string) => {
    const current = data.interestedSectors;
    const updated = current.includes(sector)
      ? current.filter((s) => s !== sector)
      : [...current, sector];
    updateField("interestedSectors", updated);
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const steps = [
    // Step 0: Investment Style
    <div key="style" className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Investment Style</h2>
      <p className="text-sm text-slate-500">How do you prefer to invest?</p>
      <div className="space-y-2 pt-1">
        {investmentStyles.map((s) => (
          <OptionButton
            key={s.value}
            selected={data.investmentStyle === s.value}
            label={s.label}
            description={s.description}
            onClick={() => updateField("investmentStyle", s.value)}
          />
        ))}
      </div>
    </div>,
    // Step 1: Risk Tolerance + Experience
    <div key="risk" className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Risk Tolerance</h2>
      <p className="text-sm text-slate-500">How much risk are you comfortable with?</p>
      <div className="space-y-2 pt-1">
        {riskLevels.map((r) => (
          <OptionButton
            key={r.value}
            selected={data.riskTolerance === r.value}
            label={r.label}
            description={r.description}
            onClick={() => updateField("riskTolerance", r.value)}
          />
        ))}
      </div>
      <div className="h-px my-2 bg-gradient-to-r from-transparent via-card-border to-transparent" />
      <h2 className="text-lg font-semibold text-foreground">Experience Level</h2>
      <div className="space-y-2 pt-1">
        {experienceLevels.map((e) => (
          <OptionButton
            key={e.value}
            selected={data.experienceLevel === e.value}
            label={e.label}
            description={e.description}
            onClick={() => updateField("experienceLevel", e.value)}
          />
        ))}
      </div>
    </div>,
    // Step 2: Sectors
    <div key="sectors" className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Interested Sectors</h2>
      <p className="text-sm text-slate-500">Select sectors you are interested in (multiple)</p>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {sectorOptions.map((sector) => (
          <button
            key={sector}
            type="button"
            onClick={() => toggleSector(sector)}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200",
              data.interestedSectors.includes(sector)
                ? "border-blue-500/30 bg-blue-500/8 text-blue-400 shadow-sm shadow-blue-500/5"
                : "border-card-border text-slate-500 hover:border-slate-600 hover:text-slate-400"
            )}
          >
            {data.interestedSectors.includes(sector) && <Check size={13} />}
            {sector}
          </button>
        ))}
      </div>
      {data.interestedSectors.length > 0 && (
        <p className="text-[11px] text-slate-600">
          {data.interestedSectors.length} sector{data.interestedSectors.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>,
    // Step 3: Themes
    <div key="themes" className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Watch Themes</h2>
      <p className="text-sm text-slate-500">Enter themes you want to track (comma separated)</p>
      <input
        type="text"
        value={data.watchThemes}
        onChange={(e) => updateField("watchThemes", e.target.value)}
        placeholder="e.g., AI, EV, Semiconductor, Biotech"
        className="w-full rounded-xl border border-card-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-slate-600 transition-all duration-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
      />
      {data.watchThemes && (
        <div className="flex flex-wrap gap-2 pt-1">
          {data.watchThemes
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-xs font-medium text-blue-400"
              >
                {theme}
              </span>
            ))}
        </div>
      )}
    </div>,
  ];

  return (
    <Card>
      {/* Step indicator with labels and connecting lines */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepLabels.map((lbl, i) => (
            <div key={`indicator-${i}`} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    i < step && "bg-blue-500/20 text-blue-400",
                    i === step && "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/25",
                    i > step && "bg-slate-800 text-slate-600"
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={clsx(
                  "text-[10px] font-medium transition-colors",
                  i <= step ? "text-slate-400" : "text-slate-700"
                )}>
                  {lbl}
                </span>
              </div>
              {/* Connecting line */}
              {i < TOTAL_STEPS - 1 && (
                <div className="mx-2 flex-1 self-start mt-4">
                  <div className="h-[2px] rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ width: i < step ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="animate-fade-in" key={step}>
        {steps[step]}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft size={16} />
          Back
        </Button>
        {step < TOTAL_STEPS - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button onClick={handleComplete} glow>
            <Sparkles size={15} />
            Save Profile
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileWizard;
