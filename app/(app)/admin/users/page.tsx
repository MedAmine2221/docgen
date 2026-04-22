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
import { Slideover } from "@/components/SlideOver";
import { IconEdit } from "@/components/icons/IconEdit";
import { IconDelete } from "@/components/icons/IconDelete";
import { IconPlus } from "@/components/icons/IconPlus";
import { AVATAR_COLORS, roles } from "@/constant";
import { FiEye, FiEyeOff, FiSearch, FiX, FiUser, FiShield } from "react-icons/fi";
import { useAppDispatch } from "@/hooks/useAppDispatch";

const getInitials = (n: string) => n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const getColor = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users: userList, loading } = useSelector((state: any) => state.users);
  
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSlide, setShowSlide] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!userList || userList.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, userList]);

  const filteredUsers = userList?.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
console.log(filteredUsers);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleId = formData.get("roleId") as string;

    if (!name || !email) {
      setSaving(false);
      return;
    }

    try {
      if (editingUser) {
        await dispatch(updateUser({
          id: editingUser.id,
          userData: { name, email, role_id: roleId }
        })).unwrap();
      } else {
        const password = formData.get("password") as string;
        if (!password) {
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

  const getAdminCount = () => userList?.filter((u: any) => u.role?.name_eng === "ADMIN").length || 0;
  const getDeveloperCount = () => userList?.filter((u: any) => u.role?.name_eng === "DEVELOPER").length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor developer accounts</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5262e] to-[#a81e25] text-white text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <IconPlus />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Users", value: userList?.length || 0, icon: FiUser, color: "from-blue-500 to-blue-600" },
          { label: "Admins", value: getAdminCount(), icon: FiShield, color: "from-purple-500 to-purple-600" },
          { label: "Developers", value: getDeveloperCount(), icon: FiUser, color: "from-green-500 to-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${s.color} rounded-xl flex items-center justify-center shadow-lg`}>
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
            <h2 className="text-sm font-semibold text-gray-800">Team Members</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search developers..."
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
            <p className="text-sm text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["NAME", "EMAIL", "STATUS", "DOCS COUNT", "ACTIONS"].map((h) => (
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
                      {u.role.name_fr === "ADMIN" ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {u.role.name_fr}
                      </span>
                      :
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {u.role.name_fr}
                      </span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700">{u.docs?.length || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#c5262e] hover:bg-red-50 transition-all duration-200"
                          title="Edit"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          title="Delete"
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

      {/* Slideover Add / Edit - Modernized Form */}
      <Slideover
        open={showSlide}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowSlide(false);
          setEditingUser(null);
          setShowPassword(false);
        }}
        title={editingUser ? "Edit Developer" : "Add New Developer"}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowSlide(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#c5262e] to-[#a81e25] text-white hover:shadow-lg disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving && <Spinner white />}
              {editingUser ? "Save Changes" : "Add Developer"}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Warning message */}
          {!editingUser && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                ⚠️ The developer will receive an email verification link to activate their account.
              </p>
            </div>
          )}

          {/* First Name & Last Name in two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">First Name</label>
              <input
                name="firstName"
                defaultValue={editingUser?.name?.split(" ")[0] || ""}
                placeholder="John"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Last Name</label>
              <input
                name="lastName"
                defaultValue={editingUser?.name?.split(" ").slice(1).join(" ") || ""}
                placeholder="Doe"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
              />
            </div>
          </div>

          {/* Hidden field for full name */}
          <input type="hidden" name="name" id="fullName" />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={editingUser?.email || ""}
              placeholder="f.karbia@warning.fr"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
            />
          </div>

          {!editingUser && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
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
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Role</label>
            <select
              name="roleId"
              defaultValue={editingUser?.role?.id?.toString() || roles[0]?.id?.toString()}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30 focus:border-[#c5262e] transition"
            >
              {roles?.map((r: any) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name_eng === "ADMIN" ? "Administrator" : "Developer"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Slideover>

      {/* Delete Modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete User"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowDelete(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {saving && <Spinner white />}
              Delete
            </button>
          </div>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconDelete className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{deletingUser?.name}</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}