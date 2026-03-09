"use client";

import { TrendingUp, Bot, Zap, BarChart3 } from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  { icon: <Bot size={18} />, label: "7 AI Agents", desc: "Specialized multi-agent analysis" },
  { icon: <Zap size={18} />, label: "Personalized", desc: "Tailored to your style" },
  { icon: <BarChart3 size={18} />, label: "Real-time", desc: "Live market intelligence" },
] as const;

const LoginPage = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
    {/* Background decoration */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/[0.04] blur-[100px]" />
      <div className="absolute left-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/[0.03] blur-[100px]" />
      <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.03] blur-[80px]" />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>

    <div className="relative w-full max-w-[380px] space-y-8 p-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-xl shadow-blue-500/25">
          <TrendingUp size={28} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI Stock Advisor
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            AI-powered personalized investment analysis
            <br />
            with multi-agent research
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-card-border bg-card-bg p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <h2 className="mb-5 text-center text-base font-semibold text-foreground">
          Welcome Back
        </h2>
        <Button
          variant="secondary"
          size="lg"
          className="w-full !rounded-xl !py-3"
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
        <div className="mt-5 h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />
        <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-600">
          By signing in, you agree that AI-generated investment analysis is for
          informational purposes only and does not constitute investment advice.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-2.5">
        {features.map((feature) => (
          <div
            key={feature.label}
            className="group rounded-xl border border-card-border bg-card-bg/50 p-3.5 text-center backdrop-blur-sm transition-all duration-300 hover:border-card-border-hover hover:bg-card-bg"
          >
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/8 text-blue-400 transition-colors group-hover:bg-blue-500/15">
              {feature.icon}
            </div>
            <p className="text-[11px] font-semibold text-foreground">
              {feature.label}
            </p>
            <p className="mt-0.5 text-[9px] leading-tight text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoginPage;
