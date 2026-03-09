"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
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
      "w-full rounded-lg border p-4 text-left transition-all",
      selected
        ? "border-accent-blue bg-accent-blue/10 text-foreground"
        : "border-card-border bg-card-bg text-slate-400 hover:border-slate-500"
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {selected && <Check size={18} className="text-accent-blue" />}
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
      <h2 className="text-lg font-semibold">Investment Style</h2>
      <p className="text-sm text-muted">How do you prefer to invest?</p>
      {investmentStyles.map((s) => (
        <OptionButton
          key={s.value}
          selected={data.investmentStyle === s.value}
          label={s.label}
          description={s.description}
          onClick={() => updateField("investmentStyle", s.value)}
        />
      ))}
    </div>,
    // Step 1: Risk Tolerance
    <div key="risk" className="space-y-3">
      <h2 className="text-lg font-semibold">Risk Tolerance</h2>
      <p className="text-sm text-muted">How much risk are you comfortable with?</p>
      {riskLevels.map((r) => (
        <OptionButton
          key={r.value}
          selected={data.riskTolerance === r.value}
          label={r.label}
          description={r.description}
          onClick={() => updateField("riskTolerance", r.value)}
        />
      ))}
      <div className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Experience Level</h2>
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
      <h2 className="text-lg font-semibold">Interested Sectors</h2>
      <p className="text-sm text-muted">Select sectors you are interested in (multiple)</p>
      <div className="grid grid-cols-2 gap-2">
        {sectorOptions.map((sector) => (
          <button
            key={sector}
            type="button"
            onClick={() => toggleSector(sector)}
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm transition-all",
              data.interestedSectors.includes(sector)
                ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                : "border-card-border text-muted hover:border-slate-500"
            )}
          >
            {sector}
          </button>
        ))}
      </div>
    </div>,
    // Step 3: Themes
    <div key="themes" className="space-y-3">
      <h2 className="text-lg font-semibold">Watch Themes</h2>
      <p className="text-sm text-muted">Enter themes you want to track (comma separated)</p>
      <input
        type="text"
        value={data.watchThemes}
        onChange={(e) => updateField("watchThemes", e.target.value)}
        placeholder="e.g., AI, EV, Semiconductor, Biotech"
        className="w-full rounded-lg border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-slate-600 focus:border-accent-blue focus:outline-none"
      />
      {data.watchThemes && (
        <div className="flex flex-wrap gap-2">
          {data.watchThemes
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs text-accent-blue"
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
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={`step-${i}`}
            className={clsx(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-accent-blue" : "bg-slate-700"
            )}
          />
        ))}
      </div>

      {steps[step]}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
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
          <Button onClick={handleComplete}>
            <Check size={16} />
            Save Profile
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileWizard;
