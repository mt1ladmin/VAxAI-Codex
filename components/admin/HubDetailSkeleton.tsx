/** Layout-matched placeholder for CRM hub detail pages — static blocks avoid wireframe flash. */
export function HubDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-[#111111]/10 px-8 py-4">
        <div className="h-5 w-56 rounded bg-[#111111]/6" />
        <div className="mt-2 h-4 w-36 rounded bg-[#111111]/4" />
      </div>
      <div className="border-b border-[#111111]/10 px-8">
        <div className="flex gap-4 py-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-20 rounded bg-[#111111]/5" />
          ))}
        </div>
      </div>
      <div className="px-8 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="h-44 rounded-xl bg-[#f7f4ea]/80" />
          <div className="h-36 rounded-xl bg-[#f7f4ea]/60" />
          <div className="h-28 rounded-xl bg-[#f7f4ea]/60" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="h-20 rounded-xl bg-[#f7f4ea]/80" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-xl bg-[#f7f4ea]/60" />
            <div className="h-24 rounded-xl bg-[#f7f4ea]/60" />
          </div>
          <div className="h-32 rounded-xl bg-[#f7f4ea]/60" />
        </div>
      </div>
    </div>
  );
}

export function TasksListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="h-8 w-24 rounded-lg bg-[#f7f4ea]" />
        <div className="h-8 w-28 rounded-lg bg-[#f7f4ea]" />
        <div className="h-8 w-32 rounded-lg bg-[#f7f4ea]" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-[#f7f4ea]/80" />
      ))}
    </div>
  );
}