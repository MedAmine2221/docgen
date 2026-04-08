/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/AppSpinner";
import { FiUser, FiMail, FiShield, FiLogOut, FiLock, FiCheck } from "react-icons/fi";
import { getColor, getInitials } from "@/utils/functions";
import { PasswordField } from "@/components/PasswordField";
import { changeUserPassword } from "@/redux/actions/users/changeUserPassword";



export default function Profil() {
  const dispatch = useDispatch();
  const router = useRouter();
  const profil = useSelector((state: any) => state.profil?.profil)?.userInfo;

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("tokenChange"));
    router.replace("/auth/login");
  };

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
      // await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      await dispatch(changeUserPassword({
        id: profil.id,
        data: { oldPassword: currentPassword, newPassword: confirmPassword }
      })).unwrap();
      await new Promise((r) => setTimeout(r, 800)); // ← remove when wired up
      setSuccess(true);
      localStorage.removeItem("token");
      router.replace("/auth/login")
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Mot de passe actuel incorrect.");
    } finally {
      setSaving(false);
    }
  };

  const color = getColor(profil?.name ?? "");

  return (
    <div className="">
      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#c5262e]/10 via-[#c5262e]/5 to-transparent" />

        <div className="px-6 pb-6 -mt-10">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm mb-4"
            style={{ background: color + "22", color }}
          >
            {getInitials(profil?.name ?? "")}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                {profil?.name ?? "—"}
              </h1>
              <p className="text-sm text-neutral-400 mt-0.5">{profil?.email ?? "—"}</p>
            </div>

            {/* Role badge */}
            <span
              className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full
              ${profil?.role?.name_eng === "ADMIN"
                  ? "bg-[#c5262e]/10 text-[#c5262e]"
                  : "bg-blue-50 text-blue-700"
                }`}
            >
              <FiShield className="w-3 h-3" />
              {profil?.role?.name_eng || profil?.role?.name_fr || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Info fields ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-100">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-800">Informations du compte</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { icon: <FiUser />, label: "Nom complet", value: profil?.name },
            { icon: <FiMail />, label: "Adresse e-mail", value: profil?.email },
            { icon: <FiShield />, label: "Rôle", value: profil?.role?.name_eng || profil?.role?.name_fr },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-xs text-neutral-400">{label}</p>
                <p className="text-sm font-medium text-neutral-900 mt-0.5">{value ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Change password ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-100">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
          <FiLock className="text-neutral-400 w-4 h-4" />
          <h2 className="text-sm font-semibold text-neutral-800">Changer le mot de passe</h2>
        </div>

        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          {/* Current password */}
          <PasswordField
            name="currentPassword"
            label="Mot de passe actuel"
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
          />

          {/* New password */}
          <PasswordField
            name="newPassword"
            label="Nouveau mot de passe"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />

          {/* Confirm password */}
          <PasswordField
            name="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />

          {/* Feedback */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <FiCheck className="w-3.5 h-3.5" />
              Mot de passe modifié avec succès.
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#c5262e] text-white
                         font-medium hover:bg-[#a81e25] disabled:opacity-60 transition"
            >
              {saving && <Spinner white />}
              Mettre à jour
            </button>
          </div>
        </form>
      </div>

      {/* ── Danger zone ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-red-100">
        <div className="px-5 py-4 border-b border-red-100">
          <h2 className="text-sm font-semibold text-red-500">Zone de danger</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">Se déconnecter</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Vous serez redirigé vers la page de connexion.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-200
                       text-red-500 hover:bg-red-50 hover:text-red-600 transition font-medium"
          >
            <FiLogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable password input ────────────────────────────────────────────── */
