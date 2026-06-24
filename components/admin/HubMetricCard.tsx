"use client";

type Tone = "default" | "brand" | "amber" | "notes" | "muted";

const TONE_STYLES: Record<Tone, { card: string; value: string; label: string }> = {
  default: {
    card: "border-[#111111]/10 bg-white hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/30",
    value: "text-[#111111]",
    label: "text-[#6f6b62]",
  },
  brand: {
    card: "border-[#063b32]/15 bg-[#063b32]/5 hover:border-[#063b32]/25 hover:bg-[#063b32]/8",
    value: "text-[#063b32]",
    label: "text-[#063b32]/80",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/60 hover:border-amber-300 hover:bg-amber-50",
    value: "text-amber-800",
    label: "text-amber-700",
  },
  notes: {
    card: "border-violet-200 bg-violet-50/50 hover:border-violet-300 hover:bg-violet-50",
    value: "text-violet-800",
    label: "text-violet-700",
  },
  muted: {
    card: "border-[#111111]/10 bg-[#f7f4ea]/40 hover:border-[#111111]/15 hover:bg-[#f7f4ea]/60",
    value: "text-[#111111]",
    label: "text-[#6f6b62]",
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