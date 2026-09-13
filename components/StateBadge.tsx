import type { FreshnessState } from "@/types";

const labels: Record<FreshnessState, string> = {
  fresh: "Fresh",
  "use-soon": "Use soon",
  urgent: "Urgent sale",
  unsafe: "Remove",
};

export function StateBadge({ state }: { state: FreshnessState }) {
  return <span className={`status status-${state}`}>{labels[state]}</span>;
}
