/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { addUser } from "@/redux/actions/users/addUser";
import { fetchUsers } from "@/redux/actions/users/getUsers";
import { updateUser } from "@/redux/actions/users/updateUser";
import { deleteUser } from "@/redux/actions/users/deleteUser";
import { UserType } from "@/constant/interfaces";
import { Spinner } from "@/components/AppSpinner";
import { Modal } from "@/components/ConfirmModal";
import { IconEdit } from "@/components/icons/IconEdit";
import { IconDelete } from "@/components/icons/IconDelete";
import { IconPlus } from "@/components/icons/IconPlus";
import { roles } from "@/constant";
import { FiEye, FiEyeOff, FiSearch, FiX, FiUser, FiShield, FiTrash2 } from "react-icons/fi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getColor, getInitials } from "@/utils/functions";
import { useTranslation } from "react-i18next";

export default function UsersPage() {
  const { t } = useTranslation('users');
  const dispatch = useAppDispatch();
  const { users: userList, loading } = useSelector((state: any) => state.users);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);

  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSlide, setShowSlide] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  
  const hasUserFormChanges = (form: HTMLFormElement | null) => {
    if (!form || !showSlide) return false;
    
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleId = formData.get("roleId") as string;
    
    if (editingUser) {
      const hasNameChanged = name !== editingUser.name;
      const hasEmailChanged = email !== editingUser.email;
      const hasRoleChanged = roleId !== editingUser.role?.id?.toString();
      return hasNameChanged || hasEmailChanged || hasRoleChanged;
    } else {
      return !!(name || email);
    }
  };
  
  const attemptClose = (closeAction: () => void) => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (hasUserFormChanges(form)) {
      setPendingCloseAction(() => closeAction);
      setShowCloseConfirm(true);
    } else {
      closeAction();
    }
  };
  
  useEffect(() => {
    if (!userList || userList.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, userList]);

  const filteredUsers = userList?.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const name   = (formData.get("name") as string).trim();
    const email  = (formData.get("email") as string).trim();
    const roleId = formData.get("roleId") as string;

    if (!name || !email) {
      setFormError(t('required_fields'));
      setSaving(false);
      return;
    }
    if (!editingUser) {
      const password = (formData.get("password") as string).trim();
      if (!password) {
        setFormError(t('password_required'));
        setSaving(false);
        return;
      }
    }
    setFormError(null);
    
    try {
      if (editingUser) {
        await dispatch(updateUser({
          id: editingUser.id,
          userData: { name, email, role_id: roleId }
        })).unwrap();
      } else {
        const password = (formData.get("password") as string).trim();
        await dispatch(
          addUser({ name, email, password, role_id: roleId })
        ).unwrap();
      }

      setShowSlide(false);
      setEditingUser(null);
      setFormError(null);

    } catch (error: any) {
      console.error("Operation failed:", error);
      setFormError(error?.message || t('error_occurred'));
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

  const getAdminCount = () => userList?.filter((u: any) => u.role?.name_eng === "ADMIN").length || 0;
  const getClientCount = () => userList?.filter((u: any) => u.role?.name_eng === "CLIENT").length || 0;
  const getDeveloperCount = () => userList?.filter((u: any) => u.role?.name_eng === "DEVELOPER").length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }
console.log("filteredUsers", filteredUsers);

  return (
    <div className="space-y-6 p-6 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#c5262e] to-[#a81e25] text-white text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <IconPlus />
          {t('add_member')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: t('total_users'), value: getClientCount(), icon: FiUser, color: "from-purple-500 to-purple-600" },
          { label: t('admins'), value: getAdminCount(), icon: FiShield, color: "from-purple-500 to-purple-600" },
          { label: t('developers'), value: getDeveloperCount(), icon: FiUser, color: "from-green-500 to-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
                </div>
                <div className={`w-12 h-12 bg-linear-to-r ${s.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-sm font-semibold text-gray-800">{t('team_members')}</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition w-full sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">{t('no_users')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[t('table_name'), t('table_email'), t('table_status'), t('table_docs_count'), t('table_actions')].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shadow-sm"
                          style={{ background: getColor(u.name) + "22", color: getColor(u.name) }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.role?.name_fr === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {t('role_admin')}
                        </span>
                      ) : u.role?.name_fr === "CLIENT" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-default text-black/60">
                          <span className="w-1.5 h-1.5 bg-black/60 rounded-full"></span>
                          {t('role_client')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {t('role_developer')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700">{u.assignedDocs?.length || u.docs?.length || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#c5262e] hover:bg-red-50 transition-all duration-200"
                          title={t('edit')}
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          title={t('delete')}
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

      {showSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => attemptClose(() => {
              setShowSlide(false);
              setEditingUser(null);
              setShowPassword(false);
              setFormError(null);
            })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingUser ? t('edit_user') : t('add_user')}
              </h2>
              <button
                onClick={() => attemptClose(() => { 
                  setShowSlide(false); 
                  setEditingUser(null); 
                  setShowPassword(false); 
                  setFormError(null); 
                })}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('fullname')}</label>
                  <input
                    name="name"
                    defaultValue={editingUser?.name || ""}
                    placeholder={t('fullname_placeholder')}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('email')}</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email || ""}
                    placeholder={t('email_placeholder')}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('password')}</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('role')}</label>
                  <select
                    name="roleId"
                    defaultValue={editingUser?.role?.id?.toString() || roles[0]?.id?.toString()}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
                  >
                    {roles?.map((r: any) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name_eng === "ADMIN" ? t('role_admin') : r.name_eng === "CLIENT" ? t('role_client') : t('role_developer')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formError && (
                <div className="mx-6 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                  <FiX className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs font-medium text-red-600">{formError}</p>
                </div>
              )}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => attemptClose(() => setShowSlide(false))}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                >
                  {t('cancel')}
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#c5262e] to-[#a81e25] text-white hover:shadow-lg disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {saving && <Spinner white />}
                  {editingUser ? t('save_changes') : t('add_user')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={t('delete_user')}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowDelete(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {saving && <Spinner white />}
              {t('delete')}
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 size={25} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('confirm_deletion')}</h3>
          <p className="text-sm text-gray-500">
            {t('delete_confirm_message')}{" "}
            <span className="font-semibold text-gray-900">{deletingUser?.name}</span>?
            <br />
            {t('action_undo')}
          </p>
        </div>
      </Modal>
      
      <Modal
        open={showCloseConfirm}
        onClose={() => {
          setShowCloseConfirm(false);
          setPendingCloseAction(null);
        }}
        title={t('confirmation')}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCloseConfirm(false);
                setPendingCloseAction(null);
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              {t('stay')}
            </button>
            <button
              onClick={() => {
                if (pendingCloseAction) pendingCloseAction();
                setShowCloseConfirm(false);
                setPendingCloseAction(null);
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              {t('leave_without_saving')}
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <FiX className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('unsaved_changes')}</h3>
          <p className="text-sm text-gray-500">
            {t('unsaved_changes_message')}
            <br />
            {t('sure_leave')}
          </p>
        </div>
      </Modal>
    </div>
  );
}