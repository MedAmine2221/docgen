export const Spinner = ({ white = false }: { white?: boolean }) => (
  <div className={`w-4 h-4 border-2 rounded-full animate-spin shrink-0
    ${white ? "border-white border-t-transparent" : "border-[#c5262e] border-t-transparent"}`}
  />
);