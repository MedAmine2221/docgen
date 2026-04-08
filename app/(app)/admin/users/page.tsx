/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "@/redux/actions/users/addUser";
import { fetchUsers } from "@/redux/actions/users/getUsers";
import { updateUser } from "@/redux/actions/users/updateUser";
import { deleteUser } from "@/redux/actions/users/deleteUser";
import { UserType } from "@/constant/interfaces";
import { Spinner } from "@/components/AppSpinner";
import { Modal } from "@/components/ConfirmModal";
import { Slideover } from "@/components/SlideOver";
import { IconEdit } from "@/components/IconEdit";
import { IconDelete } from "@/components/IconDelete";
import { IconPlus } from "@/components/IconPlus";
import { AVATAR_COLORS, roles } from "@/constant";
import { FiEye, FiEyeOff } from "react-icons/fi";

const getInitials   = (n: string) => n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const getColor      = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];

export default function UsersPage() {
  const dispatch = useDispatch();
  const { users: userList, loading } = useSelector((state: any) => state.users);
  
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);
    const [showPassword, setShowPassword] = useState(false);

  const [showSlide, setShowSlide] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleId = formData.get("roleId") as string;

    if (!name || !email) {
      console.log("Missing fields");
      setSaving(false);
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        await dispatch(updateUser({
          id: editingUser.id,
          userData: { name, email, role_id: roleId }
        })).unwrap();
      } else {
        // Add new user
        const password = formData.get("password") as string;
        if (!password) {
          console.log("Password required for new user");
          setSaving(false);
          return;
        }
        await dispatch(addUser({ name, email, password, role_id: roleId })).unwrap();
      }
      
      setShowSlide(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditingUser(null);
    setShowSlide(true);
  };

  const openEdit = (u: UserType) => {
    setEditingUser(u);
    setShowSlide(true);
  };

  const openDelete = (u: UserType) => {
    setDeletingUser(u);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setSaving(true);
    try {
      await dispatch(deleteUser(deletingUser.id)).unwrap();
      setShowDelete(false);
      setDeletingUser(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const getAdminCount = () => userList?.filter((u: any) => u.role?.name_eng === "ADMIN").length || 0;
  const getDeveloperCount = () => userList?.filter((u: any) => u.role?.name_eng === "DEVELOPER").length || 0;

  if (loading && userList?.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total users", value: userList?.length || 0 },
          { label: "Admins", value: getAdminCount() },
          { label: "Developers", value: getDeveloperCount() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-neutral-100 px-5 py-4">
            <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-neutral-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-800">Liste des utilisateurs</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#c5262e] text-white
                       text-sm font-medium hover:bg-[#a81e25] transition"
          >
            <IconPlus /> Ajouter un user
          </button>
        </div>

        {userList?.length === 0 ? (
          <p className="text-center text-sm text-neutral-400 py-16">Aucun utilisateur trouvé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["Utilisateur", "Email", "Rôle", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-neutral-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {userList?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: getColor(u.name) + "22", color: getColor(u.name) }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <span className="font-medium text-neutral-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full
                        ${u.role?.name_eng === "ADMIN"
                          ? "bg-[#c5262e]/10 text-[#c5262e]"
                          : "bg-blue-50 text-blue-700"}`}
                      >
                        {u.role?.name_eng || u.role?.name_fr}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                          title="Modifier"
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(u)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Supprimer"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slideover Add / Edit */}
      <Slideover
        open={showSlide}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowSlide(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowSlide(false)}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
            >
              Annuler
            </button>
            <button
              disabled={saving}
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-[#c5262e] text-white font-medium
                         hover:bg-[#a81e25] disabled:opacity-60 transition flex items-center gap-2"
            >
              {saving && <Spinner white />}
              {editingUser ? "Enregistrer" : "Ajouter"}
            </button>
          </>
        }
      >
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Name</label>
          <input 
            name="name" 
            defaultValue={editingUser?.name || ""}
            placeholder="DOE John" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Email</label>
          <input 
            name="email" 
            type="email" 
            defaultValue={editingUser?.email || ""}
            placeholder="doe.john@warning.tn" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>
        {!editingUser && (
          <div className="relative">
            <label className="text-xs font-medium text-neutral-600">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
                        placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
                        focus:border-[#c5262e] transition border-neutral-200" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-0.5 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
              aria-label={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? (
                <FiEye className="cursor-pointer text-default-100" />
              ) : (
                <FiEyeOff className="cursor-pointer text-default-100" />
              )}
            </button>
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="f-role" className="block text-xs font-medium text-neutral-600">Rôle</label>
          <select
            id="f-role"
            name="roleId"
            defaultValue={editingUser?.role.id.toString() || roles[0]?.id.toString()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50
                       text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
                       focus:border-[#c5262e] transition"
          >
            {roles?.map((r: any) => (
              <option key={r.id} value={String(r.id)}>{r.name_eng}</option>
            ))}
          </select>
        </div>
      </Slideover>

      {/* Delete Modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer l'utilisateur"
        footer={
          <>
            <button
              onClick={() => setShowDelete(false)}
              className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium
                         hover:bg-red-600 disabled:opacity-60 transition flex items-center gap-2"
            >
              {saving && <Spinner white />}
              Supprimer
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-neutral-900">{deletingUser?.name}</span> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}