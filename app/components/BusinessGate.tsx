"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { resolveCurrentSession } from "@/app/lib/supabaseClient";

export default function BusinessGate({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<"loading" | "allowed" | "denied">("loading");
  useEffect(() => {
    resolveCurrentSession().then(user => setAccess(user?.accountType === "business" ? "allowed" : "denied"))
      .catch(() => setAccess("denied"));
  }, []);
  if (access === "loading") return <p className="p-8">Checking your account…</p>;
  if (access === "denied") return <main className="mx-auto max-w-lg p-8 space-y-4"><h1 className="text-2xl font-bold">Business account required</h1><p>Sign in with a business account to manage inventory and pricing.</p><Link className="block underline" href="/login">Sign in or register for business</Link><Link className="block underline" href="/">Browse products</Link></main>;
  return children;
}
