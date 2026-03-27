"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/redux/actions/auth/login";
import { setUserCredentials } from "@/redux/slice/userReducer";
import { useDispatch } from "react-redux";

export default function ForgetPass() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    const data = await login({username, password})
    console.log(data);
    
    dispatch(setUserCredentials(
      {
        user: data,
      }
    ))
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f7f8] px-4">
      {/* Decorative background accents */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-120 h-120 rounded-full bg-[#c5262e]/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-90 h-90 rounded-full bg-[#c5262e]/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/8 border border-black/6 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-[#c5262e]" />

          <div className="px-10 pt-10 pb-12">
            {/* Logo + title */}
            <div className="flex flex-col items-center mb-10">
              <Image
                src="/logo-warning.png"
                alt="Warning Group"
                width={64}
                height={64}
                className="mb-4 object-contain"
                priority
                loading="eager"
              />
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Connexion à DocGen
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Plateforme de gestion de documentation API
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50
                             text-neutral-900 text-sm placeholder:text-neutral-400
                             focus:outline-none focus:ring-2 focus:ring-[#c5262e]/40 focus:border-[#c5262e]
                             transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    Mot de passe
                  </label>
                  <button
                  onClick={()=> router.push("/auth/forget-pass")}
                    type="button"
                    className="text-xs text-[#c5262e] hover:underline focus:outline-none"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-lg border border-neutral-300 bg-neutral-50
                               text-neutral-900 text-sm placeholder:text-neutral-400
                               focus:outline-none focus:ring-2 focus:ring-[#c5262e]/40 focus:border-[#c5262e]
                               transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.485A3 3 0 0013.5 13.5m-4.95-4.95A7.003 7.003 0 005.1 12c1.036 2.506 3.453 4.5 6.9 4.5a7.02 7.02 0 003.417-.894M6.343 6.343A9.965 9.965 0 002 12c1.274 3.078 4.208 6 10 6a9.979 9.979 0 005.657-1.757M15 12a3 3 0 01-3 3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 accent-[#c5262e] cursor-pointer"
                />
                <span className="text-sm text-neutral-600">Se souvenir de moi</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#c5262e] text-white font-semibold text-sm
                           hover:bg-[#a81e25] active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-150 shadow-sm
                           flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                )}
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}