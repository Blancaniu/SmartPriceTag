"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tag, ArrowLeft, Lock, Mail, UserCheck, ShieldCheck } from "lucide-react";
import { loginUser, signUpUser, isSupabaseConfigured } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { user, error } = await loginUser(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg(`Welcome back, ${user.email}! Redirecting...`);
          setTimeout(() => router.push("/"), 800);
        }
      } else {
        const { user, error, needsVerification } = await signUpUser(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (needsVerification) {
          setSuccessMsg(
            "Account created! Please check your email and click the verification link to activate your account."
          );
        } else if (user) {
          setSuccessMsg(`Account created for ${user.email}! Redirecting...`);
          setTimeout(() => router.push("/"), 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFDF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link */}
        <div className="mb-6 flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-[#53863D] hover:text-[#304721] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#3C9F47]" />
            Back to Dashboard
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#304721] text-white mb-3">
            <Tag className="h-6 w-6 text-[#6BB744]" />
          </div>
          <h2 className="text-3xl font-black text-[#304721] tracking-tight">
            {mode === "login" ? "Retail Owner Sign In" : "Register Retail Account"}
          </h2>
          <p className="mt-1 text-xs text-[#53863D]">
            Access SmartPriceTag dynamic inventory management
          </p>

          {/* Supabase status badge */}
          <div className="mt-3">
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3C9F47]/10 px-3 py-1 text-[11px] font-extrabold text-[#304721] border border-[#3C9F47]/30">
                <ShieldCheck className="h-3.5 w-3.5 text-[#3C9F47]" />
                Supabase Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
                ⚡ Demo Mode (Configure .env.local for Live Supabase)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200/90 rounded-3xl sm:px-10">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-[#304721] text-white"
                  : "text-slate-600 hover:text-[#304721]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-[#3C9F47] text-white"
                  : "text-slate-600 hover:text-[#304721]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl bg-[#3C9F47]/10 p-3 text-xs font-bold text-[#304721] border border-[#3C9F47]/30">
              <UserCheck className="inline h-4 w-4 mr-1 text-[#3C9F47]" />
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#304721] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#53863D]" />
                <input
                  type="email"
                  required
                  placeholder="owner@retailstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-[#304721] placeholder-slate-400 outline-none focus:border-[#3C9F47] focus:bg-white"
                  id="auth-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#304721] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#53863D]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-[#304721] placeholder-slate-400 outline-none focus:border-[#3C9F47] focus:bg-white"
                  id="auth-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-[#304721] bg-[#304721] text-xs font-bold text-white hover:bg-[#3C9F47] transition-colors"
              id="auth-submit-button"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Sign In to Dashboard"
                : "Create Retail Account"}
            </button>
          </form>

          {/* Demo Login Quick Fill */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-[#53863D] mb-2 font-medium">Quick Demo Sign In:</p>
            <button
              onClick={() => {
                setEmail("owner@freshmart.com");
                setPassword("demo123456");
              }}
              className="text-xs font-bold text-[#3C9F47] hover:underline"
            >
              Fill Demo Credentials (owner@freshmart.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
