/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiBell, FiChevronRight, FiGlobe, FiMonitor, FiMoon, FiSun, FiUser } from "react-icons/fi";

export default function SettingsPage() {
  const router =  useRouter();
  const { t } = useTranslation('settings');
  const [dateFormat, setDateFormat] = useState("JJ/MM/AAAA");
  const [timezone, setTimezone] = useState("UTC+1");
  const [theme, setTheme] = useState("clair");
  const [notifAll, setNotifAll] = useState(true);
  const [notifNewDocs, setNotifNewDocs] = useState(true);
  const [notifPending, setNotifPending] = useState(true);
  const [notifRejected, setNotifRejected] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-[#c5262e] px-8 py-6 flex items-center justify-between">
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-white">{t('title')}</h1>
          <p className="text-sm text-white/70 mt-1">{t('subtitle')}</p>
        </div>
        <span className="relative z-10 text-xs font-mono text-white/60 bg-white/10 px-3 py-2 rounded-lg">
          {t('admin_badge')}
        </span>
      </div>
      <div>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section Admin */}
          <div className="bg-white rounded-xl border border-neutral-100">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-[#c5262e]" />
              <h2 className="font-semibold text-neutral-800">{t("administrator")}</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t("manage_profile")}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{t("profile_description")}</p>
                </div>
                <button onClick={()=> router.push("/profil")} className="text-xs text-[#c5262e] flex items-center gap-1 font-medium cursor-pointer">
                  {t("update")} <FiChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Section Langue (fusionnée avec l'image mais garde l'esprit) */}
          <div className="bg-white rounded-xl border border-neutral-100">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
              <FiGlobe className="w-4 h-4 text-[#c5262e]" />
              <h2 className="font-semibold text-neutral-800">Langue et région</h2>
            </div>
            <div className="p-5 space-y-4">
              <LanguageSwitcher />
              <div>
                <label className="text-sm font-medium text-neutral-700">Format de date</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option>JJ/MM/AAAA</option>
                  <option>MM/JJ/AAAA</option>
                  <option>AAAA-MM-JJ</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Fuseau horaire</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option>UTC+1 — Tunis (CET)</option>
                  <option>UTC+0 — Londres</option>
                  <option>UTC+2 — Paris (été)</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 bg-neutral-50 rounded-b-xl flex justify-end gap-3">
              <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">Annuler</button>
              <button className="px-4 py-2 text-sm bg-[#c5262e] text-white rounded-lg hover:bg-[#a81f26]">Sauvegarder</button>
            </div>
          </div>

          {/* Section Apparence */}
          <div className="bg-white rounded-xl border border-neutral-100">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
              {theme === "clair" && <FiSun className="w-4 h-4 text-[#c5262e]" />}
              {theme === "sombre" && <FiMoon className="w-4 h-4 text-[#c5262e]" />}
              {theme === "auto" && <FiMonitor className="w-4 h-4 text-[#c5262e]" />}
              <h2 className="font-semibold text-neutral-800">Apparence</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("clair")}
                  className={`border rounded-xl p-3 text-center transition-all ${theme === "clair" ? "border-[#c5262e] bg-[#fef2f2]" : "border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <FiSun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs font-medium">Clair</p>
                  <p className="text-[10px] text-neutral-400">Interface lumineuse</p>
                </button>
                <button
                  onClick={() => setTheme("sombre")}
                  className={`border rounded-xl p-3 text-center transition-all ${theme === "sombre" ? "border-[#c5262e] bg-[#fef2f2]" : "border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <FiMoon className="w-5 h-5 mx-auto mb-1 text-slate-700" />
                  <p className="text-xs font-medium">Sombre</p>
                  <p className="text-[10px] text-neutral-400">Repos visuel</p>
                </button>
                <button
                  onClick={() => setTheme("auto")}
                  className={`border rounded-xl p-3 text-center transition-all ${theme === "auto" ? "border-[#c5262e] bg-[#fef2f2]" : "border-neutral-200 hover:bg-neutral-50"}`}
                >
                  <FiMonitor className="w-5 h-5 mx-auto mb-1 text-neutral-600" />
                  <p className="text-xs font-medium">Système</p>
                  <p className="text-[10px] text-neutral-400">{"Suivre l'OS"}</p>
                </button>
              </div>
            </div>
            <div className="px-5 py-4 bg-neutral-50 rounded-b-xl flex justify-end gap-3">
              <button className="px-4 py-2 text-sm text-neutral-600">Annuler</button>
              <button className="px-4 py-2 text-sm bg-[#c5262e] text-white rounded-lg">Appliquer</button>
            </div>
          </div>

          {/* Section Notifications */}
          <div className="bg-white rounded-xl border border-neutral-100">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
              <FiBell className="w-4 h-4 text-[#c5262e]" />
              <h2 className="font-semibold text-neutral-800">Notifications</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Master toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Activer toutes les notifications</p>
                  <p className="text-xs text-neutral-400">Active ou désactive tout d’un coup</p>
                </div>
                <button
                  onClick={() => setNotifAll(!notifAll)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${notifAll ? "bg-[#c5262e]" : "bg-neutral-300"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${notifAll ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="space-y-3">
                <ToggleRow
                  label="Nouveaux documents soumis"
                  description="Alerte à chaque soumission"
                  enabled={notifNewDocs}
                  onChange={setNotifNewDocs}
                  disabled={!notifAll}
                />
                <ToggleRow
                  label="Documents en attente"
                  description="Rappel quotidien des dossiers non traités"
                  enabled={notifPending}
                  onChange={setNotifPending}
                  disabled={!notifAll}
                />
                <ToggleRow
                  label="Documents rejetés"
                  description="Alerte lors d’un rejet"
                  enabled={notifRejected}
                  onChange={setNotifRejected}
                  disabled={!notifAll}
                />
                <ToggleRow
                  label="Rapport hebdomadaire"
                  description="Résumé d’activité chaque lundi matin"
                  enabled={notifWeekly}
                  onChange={setNotifWeekly}
                  disabled={!notifAll}
                />
              </div>
            </div>
            <div className="px-5 py-4 bg-neutral-50 rounded-b-xl flex justify-end gap-3">
              <button className="px-4 py-2 text-sm text-neutral-600">Annuler</button>
              <button className="px-4 py-2 text-sm bg-[#c5262e] text-white rounded-lg">Sauvegarder</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant réutilisable pour une ligne toggle
function ToggleRow({ label, description, enabled, onChange, disabled }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${disabled ? "text-neutral-400" : "text-neutral-700"}`}>{label}</p>
        <p className={`text-xs ${disabled ? "text-neutral-300" : "text-neutral-400"}`}>{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${disabled ? "bg-neutral-100 cursor-not-allowed" : enabled ? "bg-[#c5262e]" : "bg-neutral-300"}`}
        disabled={disabled}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-1"}`} />
      </button>
    </div>
  );
}