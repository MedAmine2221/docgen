export default function MethodBadge({ method }: { method: string }) {
  const map: Record<string,string> = {
    GET:    "bg-blue-50 text-blue-700 border-blue-100",
    POST:   "bg-green-50 text-green-700 border-green-100",
    PUT:    "bg-amber-50 text-amber-700 border-amber-100",
    PATCH:  "bg-purple-50 text-purple-700 border-purple-100",
    DELETE: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${map[method?.toUpperCase()] ?? "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
      {method}
    </span>
  );
}