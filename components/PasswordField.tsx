/* eslint-disable @typescript-eslint/no-explicit-any */
import { FiEye, FiEyeOff } from "react-icons/fi";

export function PasswordField({
  name,
  label,
  show,
  onToggle,
  value,
  onchange
}: {
  name: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  value?: any;
  onchange?: (e: any) => void
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <div className="relative">
        <input
          name={name}
          value={value ?? undefined}
          onChange={onchange ?? undefined}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
                     placeholder:text-neutral-400 focus:outline-none focus:ring-2
                     focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition border-neutral-200 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
          aria-label={show ? "Masquer" : "Afficher"}
        >
          {show ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}