import { cn } from "@/lib/utils";

type FilingTabProps = {
  children: React.ReactNode;
  className?: string;
  /** Dark section backgrounds: muted pill + light rule. */
  light?: boolean;
  center?: boolean;
};

/**
 * File-folder section label: top-rounded tab sitting on a continuous
 * full-width rule that meets the tab’s bottom corners (mock screenshots).
 */
export default function FilingTab({
  children,
  className = "",
  light = false,
  center = false,
}: FilingTabProps) {
  return (
    <div
      className={cn(
        "filing-tab-row",
        light && "filing-tab-row--on-dark",
        center && "filing-tab-row--center",
        className,
      )}
    >
      <p className="filing-tab">{children}</p>
      <span className="filing-tab-rule" aria-hidden="true" />
    </div>
  );
}
