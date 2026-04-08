/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUsers = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconDocs = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v14a2 2 0 01-2 2z" />
  </svg>
);
const IconApi = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
);

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Gérer les users", path: "/admin/users",    icon: <IconUsers />, disabled: true },
  { label: "Gérer les docs",  path: "/admin/docs",     icon: <IconDocs />, disabled: true  },
  { label: "Gérer les APIs",  path: "/admin/apis",     icon: <IconApi />, disabled: true   },
  { label: "Gérer Votre Profil",  path: "/profil",     icon: <IconApi />, disabled: false  },

];

const NAV_BOTTOM = [
  { label: "Paramètres", path: "/admin/settings", icon: <IconSettings /> },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

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

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
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