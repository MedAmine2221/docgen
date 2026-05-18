/* eslint-disable @typescript-eslint/no-explicit-any */
export default function StatusBadge({ status }: any) {
  const s = status?.toLowerCase();
  const isApproved = s === "approve" || s === "approved";
  const isPending  = s === "pending";
  const isDraft    = s === "draft" || s === "Draft" ;
  if (isApproved) return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M8.5 2.5 4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        APPROVED
      </span>
  );
  if (isPending)  return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 3v2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        PENDING
      </span>
  );
  if (isDraft)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2h6M2 5h4M2 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        DRAFT
      </span>
    );
  return ( <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.5 2.5 7.5 7.5M7.5 2.5 2.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      REJECTED
    </span> );
}