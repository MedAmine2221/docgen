/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/AppSpinner";
import { FiUser, FiMail, FiShield, FiLogOut, FiLock, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { getColor, getInitials, handleLogout } from "@/utils/functions";
import { PasswordField } from "@/components/PasswordField";
import { changeUserPassword } from "@/redux/actions/users/changeUserPassword";
import { Modal } from "@/components/ConfirmModal";
import { useAppDispatch } from "@/hooks/useAppDispatch";

export default function Profil() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profil = useSelector((state: any) => state.profil?.profil);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setSaving(true);
    try {
      await dispatch(changeUserPassword({
        id: profil.id,
        data: { oldPassword: currentPassword, newPassword: confirmPassword },
      })).unwrap();
      setSuccess(true);
      localStorage.removeItem("token");
      router.replace("/auth/login");
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Mot de passe actuel incorrect.");
    } finally {
      setSaving(false);
    }
  };

  const color  = getColor(profil?.name ?? "");
  const initials = getInitials(profil?.name ?? "");
  const isAdmin = profil?.role?.name_eng === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Hero card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {/* Gradient banner */}
        <div
          className="h-28 relative"
          style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}08 60%, transparent 100%)` }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
            style={{ background: color }}
          />
          <div
            className="absolute right-24 top-6 w-16 h-16 rounded-full opacity-10"
            style={{ background: color }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + name row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold
                         border-4 border-white shadow-md shrink-0"
              style={{ background: color + "22", color }}
            >
              {initials}
            </div>
            <span
              className={`mb-1 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
                ${isAdmin
                  ? "bg-[#c5262e]/10 text-[#c5262e]"
                  : "bg-blue-50 text-blue-700"}`}
            >
              <FiShield className="w-3 h-3" />
              {profil?.role?.name_eng || profil?.role?.name_fr || "—"}
            </span>
          </div>

          <h1 className="text-xl font-semibold text-neutral-900">{profil?.name ?? "—"}</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{profil?.email ?? "—"}</p>

          {/* Stats row */}
          <div className="mt-5 pt-4 border-t border-neutral-100 grid grid-cols-3 gap-4">
            {[
              { label: "Rôle",    value: profil?.role?.name_eng || "—" },
              { label: "Statut",  value: "Actif" },
              { label: "Accès",   value: isAdmin ? "Total" : "Limité" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-semibold text-neutral-900">{value}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account info ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#c5262e]/10 flex items-center justify-center">
            <FiUser className="w-3.5 h-3.5 text-[#c5262e]" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-800">Informations du compte</h2>
        </div>
        <div className="divide-y divide-neutral-50">
          {[
            { icon: <FiUser className="w-3.5 h-3.5" />,   label: "Nom complet",     value: profil?.name },
            { icon: <FiMail className="w-3.5 h-3.5" />,   label: "Adresse e-mail",  value: profil?.email },
            { icon: <FiShield className="w-3.5 h-3.5" />, label: "Rôle",            value: profil?.role?.name_eng || profil?.role?.name_fr },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-400">{label}</p>
                <p className="text-sm font-medium text-neutral-900 mt-0.5 truncate">{value ?? "—"}</p>
              </div>
              {/* Read-only badge */}
              <span className="text-xs text-neutral-300 font-medium">lecture seule</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Change password ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
            <FiLock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-800">Changer le mot de passe</h2>
        </div>

        <form onSubmit={handleChangePassword} className="p-5 space-y-3">
          <PasswordField
            name="currentPassword"
            label="Mot de passe actuel"
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
          />
          <PasswordField
            name="newPassword"
            label="Nouveau mot de passe"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />

          {/* Password hint */}
          <p className="text-xs text-neutral-400">
            Le mot de passe doit contenir au moins 8 caractères.
          </p>

          {/* Feedback */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
              <FiAlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-2.5 rounded-xl">
              <FiCheck className="w-3.5 h-3.5 shrink-0" />
              Mot de passe modifié avec succès.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl bg-[#c5262e] text-white
                         font-medium hover:bg-[#a81e25] disabled:opacity-60 transition"
            >
              {saving ? <Spinner white /> : <FiLock className="w-3.5 h-3.5" />}
              Mettre à jour
            </button>
          </div>
        </form>
      </div>

      {/* ── Danger zone ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-red-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
            <FiAlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <h2 className="text-sm font-semibold text-red-500">Zone de danger</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">Se déconnecter</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Votre session sera terminée et vous serez redirigé vers la page de connexion.
            </p>
          </div>
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-red-200
                       text-red-500 hover:bg-red-50 hover:text-red-600 transition font-medium"
          >
            <FiLogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Logout confirm modal ───────────────────────────────── */}
      <Modal
        open={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        title="Déconnecter"
        footer={
          <>
            <button
              onClick={() => setShowConfirmLogout(false)}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={() => handleLogout(setSaving, router)}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium
                         hover:bg-red-600 disabled:opacity-60 transition flex items-center gap-2"
            >
              {saving && <Spinner white />}
              Déconnecter
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Voulez-vous vraiment vous déconnecter ?<br />
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}