import { cn } from "@/lib/utils";

type FilingTabProps = {
  children: React.ReactNode;
  className?: string;
  /** Keep for call-site compatibility; filing tabs always use the same label treatment. */
  light?: boolean;
  center?: boolean;
  as?: "p" | "span" | "div" | "h2" | "h3";
};

/**
 * File-folder tab label used for major section headers sitewide.
 * Pale sage “paper” tab with dark type, rounded top corners, and a soft folder edge.
 */
export default function FilingTab({
  children,
  className = "",
  center = false,
  as: Tag = "p",
}: FilingTabProps) {
  return (
    <Tag
      className={cn(
        "filing-tab",
        center && "filing-tab--center",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
