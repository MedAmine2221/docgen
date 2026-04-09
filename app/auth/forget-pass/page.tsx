"use client";;
import { ForgetPwd } from "@/redux/actions/users/forgetPassword";
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";

export default function ForgetPass() {
  // const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [loading , setLoading] = useState(false);
  const [msg, setMsg] = useState("")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
    setLoading(true);
    const response = await dispatch(ForgetPwd({
      email: e.target.email.value
    })).unwrap();
    console.log("response", response);
    if(response.status == 401){
      setMsg("Aucun compte associé à cet email")
    }else if(response.status == 201) {
      setMsg("Un nouveau mot de passe a été envoyé à votre adresse email")
    }
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
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
                Forget Password
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="Email" className="block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john_doe@gmail.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-neutral-50
                             text-neutral-900 text-sm placeholder:text-neutral-400
                             focus:outline-none focus:ring-2 focus:ring-[#c5262e]/40 focus:border-[#c5262e]
                             transition"
                />
              </div>
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
                {loading ? "Sending…" : "Send Email"}
              </button>
              {msg == "Aucun compte associé à cet email" ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200
                                bg-red-50 px-4 py-2.5 text-sm text-red-700 mt-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64
                            a1 1 0 00.86-1.5L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {msg}
                </div>
              ):msg == "Un nouveau mot de passe a été envoyé à votre adresse email" ?(
                <div className="flex items-center gap-2 rounded-lg border border-green-200
                                bg-green-50 px-4 py-2.5 text-sm text-green-700 mt-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64
                            a1 1 0 00.86-1.5L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {msg}
                </div>
              ): undefined}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}