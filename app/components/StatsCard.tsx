"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accentBg: string; // background tint
  iconColor: string; // icon color
  delay?: number;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  accentBg,
  iconColor,
  delay = 0,
}: StatsCardProps) {
  return (
    <div
      className="stats-card group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#3C9F47]/40 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${accentBg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#53863D]">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-[#304721]">{value}</p>
        </div>
      </div>
    </div>
  );
}
