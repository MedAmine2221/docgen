/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { Spinner } from "@/components/AppSpinner";
import { Modal } from "@/components/ConfirmModal";
import { NotificationBell } from "@/components/NotificationsBell";
import { NAV_BOTTOM, NAV_CLIENT_ITEMS, NAV_ITEMS, NAV_ITEMS_Dev } from "@/constant";
import { RootState } from "@/redux/store";
import { getInitials, handleLogout } from "@/utils/functions";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('layout');
  const router   = useRouter();
  const pathname = usePathname();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const me = useSelector((state: RootState) => state.profil.profil);
  
  const isActive = (path: string) => pathname.startsWith(path);
  const profil = useSelector((state: any) => state.profil?.profil);

  // Obtenir le label du titre de la page courante
  const getCurrentPageLabel = () => {
    const allNavItems = me?.role?.name_eng === "ADMIN" 
      ? [...NAV_ITEMS, ...NAV_BOTTOM]
      : me?.role?.name_eng === "CLIENT" 
        ? [...NAV_CLIENT_ITEMS, ...NAV_BOTTOM]
        : [...NAV_ITEMS_Dev, ...NAV_BOTTOM];
    
    const currentItem = allNavItems.find((i) => isActive(i.path));
    if (currentItem) {
      // Utiliser la clé de traduction stockée dans labelKey
      const labelKey = (currentItem as any).labelKey || currentItem.label?.toLowerCase().replace(/\s+/g, '_');
      return t(labelKey, (currentItem as any).label || "Dashboard");
    }
    return t('nav.dashboard');
  };

  // Filtrer les éléments pour n'afficher que ceux avec disabled === true
  const getNavItems = () => {
    const items = me?.role?.name_eng === "ADMIN" 
      ? NAV_ITEMS 
      : me?.role?.name_eng === "CLIENT" 
        ? NAV_CLIENT_ITEMS 
        : NAV_ITEMS_Dev;
    return items.filter((item) => item.disabled === true);
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`${collapsed ? "w-16" : "w-56"} bg-white border-r border-neutral-100 flex flex-col shrink-0 transition-all duration-200`}
      >
        {/* Logo */}
        <div className={`h-14 border-b border-neutral-100 flex items-center gap-3 px-4 shrink-0`}>
          <div className="w-8 h-8 rounded-lg bg-[#c5262e] flex items-center justify-center shrink-0">
            <button
              onClick={() => router.push(me?.role?.name_eng === "ADMIN" ? "/admin" : me?.role?.name_eng === "CLIENT" ? "/client" : "/developer")}
              className="cursor-pointer text-white text-xs font-semibold"
            >
              DG
            </button>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-neutral-900 leading-tight truncate">DocGen</p>
              <p className="text-xs text-neutral-400 leading-tight truncate">{profil?.name}</p>
            </div>
          )}
        </div>

        {/* Nav principal */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 pt-3 pb-1 text-xs font-medium text-neutral-400 uppercase tracking-wide">
              {t('main')}
            </p>
          )}
          {getNavItems().map((item) => (
            <NavButton
              key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={collapsed}
              onClick={() => router.push(item.path)}
              t={t}
            />
          ))}

          {!collapsed && (
            <p className="px-3 pt-4 pb-1 text-xs font-medium text-neutral-400 uppercase tracking-wide">
              {t('settings')}
            </p>
          )}
          {NAV_BOTTOM.filter(item => item.disabled === true).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={collapsed}
              onClick={() => router.push(item.path)}
              t={t}
            />
          ))}
        </nav>

      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-neutral-100 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400
                         hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              title={collapsed ? t('expand_menu') : t('collapse_menu')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1.5 3.5h13M1.5 8h13M1.5 12.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="text-sm font-medium text-neutral-900">
              {getCurrentPageLabel()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setOpenProfileMenu((prev) => !prev)}
                className="cursor-pointer w-8 h-8 rounded-full bg-[#c5262e]/10 flex items-center justify-center
                          text-xs font-semibold text-[#c5262e] hover:bg-[#c5262e]/20 transition-colors"
                title={t('my_profile')}
              >
                {getInitials(profil?.name ?? "")}
              </button>
              {openProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50"
                >
                  <button
                    onClick={() => {
                      setOpenProfileMenu(false);
                      router.push("/profil");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
                  >
                    {t('my_profile')}
                  </button>

                  <button
                    onClick={() => {
                      setOpenProfileMenu(false);
                      setShowConfirmLogout(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Logout Modal */}
      <Modal
        open={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        title={t('logout_confirm_title')}
        footer={
          <>
            <button
              onClick={() => setShowConfirmLogout(false)}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => handleLogout(setSaving, router)}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium
                         hover:bg-red-600 disabled:opacity-60 transition flex items-center gap-2"
            >
              {saving && <Spinner white />}
              {t('logout')}
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          {t('logout_confirm_message')}<br />
          {t('action_irreversible')}
        </p>
      </Modal>
    </div>
  );
}

/* ── NavButton ────────────────────────────────────────────── */
function NavButton({
  item,
  active,
  collapsed,
  onClick,
  t,
}: {
  item: { path: string; icon: React.ReactNode; label?: string; labelKey?: string };
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  // Utiliser labelKey s'il existe, sinon convertir l'ancien label en clé
  const labelKey = (item as any).labelKey || `nav.${item.label?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`;
  const translatedLabel = t(labelKey, (item as any).label || "");
  
  return (
    <button
      onClick={onClick}
      title={collapsed ? translatedLabel : undefined}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left
        ${collapsed ? "justify-center" : ""}
        ${active
          ? "bg-[#c5262e]/10 text-[#c5262e] font-medium"
          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
        }`}
    >
      <span className={active ? "text-[#c5262e]" : "text-neutral-400"}>{item.icon}</span>
      {!collapsed && translatedLabel}
    </button>
  );
}