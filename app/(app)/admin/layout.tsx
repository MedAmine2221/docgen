/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { IconLogout } from "@/components/icons/IconLogout";
import { NAV_BOTTOM, NAV_ITEMS } from "@/constant";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("tokenChange"));
    router.replace("/auth/login");
  };

  const isActive = (path: string) => pathname.startsWith(path);
  const profil = useSelector((state: any)=> state.profil?.profil)?.userInfo;  
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">

      <aside className="w-56 bg-white border-r border-neutral-100 flex flex-col flex-shrink-0">

        {/* Logo */}
        <div className="px-4 py-5 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#c5262e] flex items-center justify-center flex-shrink-0">
            <button onClick={()=> router.push("/admin")} className="cursor-pointer text-white text-xs font-semibold">DG</button>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 leading-tight">DocGen</p>
            <p className="text-xs text-neutral-400 leading-tight">{profil?.name}</p>
            <p className="text-xs text-neutral-400 leading-tight">{profil?.role.name_eng}</p>
          </div>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-3 pb-1 text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Principal
          </p>
          {NAV_ITEMS.map(item => item.disabled && (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left
                ${isActive(item.path)
                  ? "bg-[#c5262e]/10 text-[#c5262e] font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
            >
              <span className={isActive(item.path) ? "text-[#c5262e]" : "text-neutral-400"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          <p className="px-3 pt-4 pb-1 text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Paramètres
          </p>
          {NAV_BOTTOM.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left
                ${isActive(item.path)
                  ? "bg-[#c5262e]/10 text-[#c5262e] font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
            >
              <span className={isActive(item.path) ? "text-[#c5262e]" : "text-neutral-400"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-neutral-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400
                       hover:bg-red-50 hover:text-red-600 transition-colors text-left"
          >
            <IconLogout />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-neutral-100 px-6 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-neutral-900">
            {[...NAV_ITEMS, ...NAV_BOTTOM].find(i => isActive(i.path))?.label ?? "Dashboard"}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={()=> router.push("/profil")} className="cursor-pointer w-8 h-8 rounded-full bg-[#c5262e]/10 flex items-center justify-center
                            text-xs font-semibold text-[#c5262e]">
              {profil?.name?.split(" ").reduce((a: string, b: string)=> a + b[0], "")}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}