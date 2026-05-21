// components/SwaggerMethodBadge.tsx
"use client";

const methodColors: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 border-blue-200",
  POST: "bg-green-100 text-green-700 border-green-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  PATCH: "bg-purple-100 text-purple-700 border-purple-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

export function SwaggerMethodBadge({ method }: { method: string }) {
  const colorClass = methodColors[method.toUpperCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${colorClass}`}>
      {method.toUpperCase()}
    </span>
  );
}