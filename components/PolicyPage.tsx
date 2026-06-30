import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SimplifiedModeToggle from "@/components/SimplifiedModeToggle";

type Props = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export default function PolicyPage({ title, lastUpdated, children }: Props) {
  return (
    <>
      <div className="bg-white">
        <div className="border-b border-gray-100 px-4 py-4 md:px-8">
          <SiteNav variant="light" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#063b32]">
            VAxAI — a service by MT1L
          </p>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">{title}</h1>
          <p className="mb-12 text-sm text-gray-400">Last updated: {lastUpdated}</p>

          <div className="policy-body text-[0.9375rem] leading-[1.8] text-gray-700">
            {children}
          </div>
        </div>

        <SiteFooter />
      </div>
      <SimplifiedModeToggle />
    </>
  );
}
