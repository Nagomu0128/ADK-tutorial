"use client";

import { TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="w-full max-w-sm space-y-8 p-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/20">
          <TrendingUp size={28} className="text-accent-blue" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AI Stock Advisor
        </h1>
        <p className="text-center text-sm text-muted">
          AI-powered personalized investment analysis
          <br />
          with multi-agent research
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
          Sign In
        </h2>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => {
            // Firebase Google Auth placeholder
            window.location.href = "/";
          }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
        <p className="mt-4 text-center text-[10px] text-slate-600">
          By signing in, you agree that AI-generated investment analysis is for
          informational purposes only and does not constitute investment advice.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "7 AI Agents", desc: "Multi-agent analysis" },
          { label: "Personalized", desc: "Tailored to you" },
          { label: "Real-time", desc: "Live market data" },
        ].map((feature) => (
          <div
            key={feature.label}
            className="rounded-lg border border-card-border bg-card-bg p-3 text-center"
          >
            <p className="text-xs font-semibold text-accent-blue">
              {feature.label}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoginPage;
