"use client";

type Props = {
  value: number | string;
  label: string;
  onClick: () => void;
};

export function HubMetricCard({ value, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[#111111]/8 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#063b32]/20 hover:bg-[#f7f4ea]/30"
    >
      <p className="text-2xl font-bold text-[#111111]">{value}</p>
      <p className="text-xs font-semibold text-[#6f6b62]">{label}</p>
    </button>
  );
}