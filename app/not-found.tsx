"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";

export default function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f7f8] px-4">
      {/* Decorative background accents — same as login */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-120 h-120 rounded-full bg-[#c5262e]/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-90 h-90 rounded-full bg-[#c5262e]/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/8 border border-black/6 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-[#c5262e]" />

          <div className="px-10 pt-10 pb-12 flex flex-col items-center text-center">
            {/* Big 404 */}
            <div className="relative mb-6 select-none">
              <span className="text-[7rem] font-black leading-none tracking-tighter text-[#c5262e]/10">
                404
              </span>
              <span className="absolute inset-0 flex items-center justify-center text-[3.5rem] font-black leading-none tracking-tighter text-[#c5262e]">
                404
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
              Page introuvable
            </h1>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed max-w-xs">
              {"La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à l'accueil."}
            </p>

            {/* Divider */}
            <div className="w-full border-t border-neutral-100 mb-8" />

            {/* Countdown */}
            <p className="text-xs text-neutral-400 mb-5">
              Redirection automatique dans{" "}
              <span className="font-semibold text-[#c5262e]">{count}s</span>
            </p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-[#c5262e] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(count / 10) * 100}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => router.replace("/")}
                className="flex-1 py-2.5 rounded-lg bg-[#c5262e] text-white font-semibold text-sm
                           hover:bg-[#a81e25] active:scale-[0.98]
                           transition-all duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <FiHome size={20} />
                Accueil
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-neutral-400 mt-5">
          DocGen — Plateforme de gestion de documentation API
        </p>
      </div>
    </main>
  );
}