"use client";

type Tone = "default" | "brand" | "amber" | "notes" | "muted";

const TONE_STYLES: Record<Tone, { card: string; value: string; label: string }> = {
  default: {
    card: "border-pine-900/10 bg-white hover:border-pine-900/20 hover:bg-pine-50",
    value: "text-pine-900",
    label: "text-muted",
  },
  brand: {
    card: "border-pine-900/15 bg-pine-900/[0.04] hover:border-pine-900/25 hover:bg-pine-900/[0.07]",
    value: "text-pine-900",
    label: "text-pine-800",
  },
  amber: {
    card: "border-acid/60 bg-acid/25 hover:border-acid hover:bg-acid/40",
    value: "text-ink",
    label: "text-pine-800",
  },
  notes: {
    card: "border-pine-900/12 bg-pine-50 hover:border-pine-900/25 hover:bg-pine-100",
    value: "text-pine-900",
    label: "text-pine-700",
  },
  muted: {
    card: "border-pine-900/10 bg-white hover:border-pine-900/15 hover:bg-pine-50",
    value: "text-pine-900",
    label: "text-muted",
  },
};

type Props = {
  value: number | string;
  label: string;
  onClick: () => void;
  tone?: Tone;
};

export function HubMetricCard({ value, label, onClick, tone = "default" }: Props) {
  const styles = TONE_STYLES[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left shadow-sm transition-colors ${styles.card}`}
    >
      <p className={`text-2xl font-bold tabular-nums ${styles.value}`}>{value}</p>
      <p className={`mt-0.5 text-xs font-semibold ${styles.label}`}>{label}</p>
    </button>
  );
}