/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DocType, UserType } from "@/constant/interfaces";
import { Spinner } from "@/components/AppSpinner";
import { Modal } from "@/components/ConfirmModal";
import { Slideover } from "@/components/SlideOver";
import { IconEdit } from "@/components/icons/IconEdit";
import { IconDelete } from "@/components/icons/IconDelete";
import { IconPlus } from "@/components/icons/IconPlus";
import { API_METHOD, doc_status } from "@/constant";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { RootState } from "@/redux/store";
import { fetchDocs } from "@/redux/actions/docs/getDocs";
import { addDoc } from "@/redux/actions/docs/addDocs";
import { updateDoc } from "@/redux/actions/docs/updateDoc";
import { deleteDoc } from "@/redux/actions/docs/deleteDocs";

export default function Docs() {
  const dispatch = useAppDispatch();
  const docsList = useSelector((state: RootState) => state.docs.docs);
  const usersList = useSelector((state: RootState) => state.users.users);

  const [saving, setSaving] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocType | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocType | null>(null);

  const [showSlide, setShowSlide] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  // Fetch Docs on mount
  useEffect(() => {
    if (!docsList || docsList.length === 0) {
      dispatch(fetchDocs());
    }
  }, [dispatch, docsList]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const desc = formData.get("description") as string;
    const status = formData.get("status") as string;
    const apiMethod = formData.get("apiMethod") as string;
    const created_by = formData.get("created_by") as string;
    const bearerToken = formData.get("bearerToken") as string;
    const submissionDate = formData.get("submissionDate") as string;
    const baseUrl = formData.get("baseUrl") as string;
    const commonHeader = formData.get("commonHeader") as string;
    if (!name || !desc || !status || !apiMethod || !created_by || !bearerToken || !submissionDate || !baseUrl || !commonHeader) {
      console.log("Missing fields");
      setSaving(false);
      return;
    }
    const selectedUser = usersList.find((item: UserType)=> item.id === Number(created_by));
    
    try {
        if (!selectedUser) {
          console.error(`User with ID ${created_by} not found`);
          // Optionally show an error message to the user
          alert(`User with ID ${created_by} not found. Please select a valid user.`);
          setSaving(false);
          return;
        }
      if (editingDoc) {
        // Update existing Doc
        await dispatch(updateDoc({
          id: Number(editingDoc.id),
          docData: { name, apiMethod, baseUrl, bearerToken, commonHeader, created_by: selectedUser , description: desc, status, submissionDate }
        })).unwrap();
      } else {
        // Add new Doc
        await dispatch(addDoc({ name, apiMethod, baseUrl, bearerToken, commonHeader, created_by: selectedUser , description: desc, status, submissionDate })).unwrap();
      }
      
      setShowSlide(false);
      setEditingDoc(null);
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditingDoc(null);
    setShowSlide(true);
  };

  const openEdit = (u: DocType) => {
    setEditingDoc(u);
    setShowSlide(true);
  };

  const openDelete = (u: DocType) => {
    setDeletingDoc(u);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setSaving(true);
    try {
      await dispatch(deleteDoc(Number(deletingDoc.id))).unwrap();
      setShowDelete(false);
      setDeletingDoc(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // Stats

  if (docsList?.length === 0) {
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
          { label: "Total Docs", value: docsList?.length || 0 },
          { label: "Approved", value: docsList?.filter((item : DocType) => item.status === "approve").length || 0 },
          { label: "Pending", value: docsList?.filter((item : DocType) => item.status === "pending").length || 0 },
          { label: "Rejected", value: docsList?.filter((item : DocType) => item.status === "rejected").length || 0 },
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
          <h2 className="text-sm font-semibold text-neutral-800">Liste des documents</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#c5262e] text-white
                       text-sm font-medium hover:bg-[#a81e25] transition"
          >
            <IconPlus /> Ajouter un document
          </button>
        </div>

        {docsList?.length === 0 ? (
          <p className="text-center text-sm text-neutral-400 py-16">Aucun document trouvé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["Doc Name", "Description", "Submission Date", "Status", "Base URL", "API Method", "Common Header", "Bearer Token", "Created By", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-neutral-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {docsList?.map((u: DocType) => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 text-black">{u.name}</td>
                    <td className="px-5 py-3 text-neutral-500">{u.description}</td>
                    <td className="px-5 py-3 text-neutral-500">
                      {new Date(u.submissionDate).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full
                        ${u.status === "pending"
                          ? "bg-orange-100 text-orange-400"
                          : u.status === "Pending" ?
                          "bg-red-100 text-red-400"
                          : "bg-blue-100 text-blue-400"}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-500">{u.baseUrl}</td>
                    <td className="px-5 py-3 text-neutral-500">{u.apiMethod}</td>
                    <td className="px-5 py-3 text-neutral-500">{u.commonHeader}</td>
                    <td className="px-5 py-3 text-neutral-500">{u.bearerToken}</td>
                    <td className="px-5 py-3 text-neutral-500">{u.created_by?.name}</td>
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
          setEditingDoc(null);
        }}
        title={editingDoc ? "Modifier le document" : "Ajouter un document"}
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
              {editingDoc ? "Enregistrer" : "Ajouter"}
            </button>
          </>
        }
      >
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Doc Name</label>
          <input 
            name="name" 
            defaultValue={editingDoc?.name || ""}
            placeholder="Create User" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Description</label>
          <input 
            name="description" 
            defaultValue={editingDoc?.description || ""}
            placeholder="create user account" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Submission Date</label>
          <input 
            name="submissionDate" 
            defaultValue={editingDoc?.submissionDate || ""}
            placeholder="2025-04-13T10:30:00.000Z" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="f-role" className="block text-xs font-medium text-neutral-600">Status</label>
          <select
            id="f-role"
            name="status"
            defaultValue={editingDoc?.status.toString() || doc_status[0]?.name.toString()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50
                       text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
                       focus:border-[#c5262e] transition"
          >
            {doc_status?.map((r: any) => (
              <option key={r.id} value={String(r.name)}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Base Url</label>
          <input 
            name="baseUrl" 
            defaultValue={editingDoc?.baseUrl || ""}
            placeholder="https://localhost:3001" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="f-role" className="block text-xs font-medium text-neutral-600">API Method</label>
          <select
            id="f-role"
            name="apiMethod"
            defaultValue={editingDoc?.apiMethod.toString() || API_METHOD[0]?.name.toString()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50
                       text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
                       focus:border-[#c5262e] transition"
          >
            {API_METHOD?.map((r: any) => (
              <option key={r.id} value={String(r.name)}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Common Header</label>
          <input 
            name="commonHeader" 
            defaultValue={editingDoc?.commonHeader || ""}
            placeholder={`{\"Content-Type\":\"application/json\"}`}
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-600">Bearer Token</label>
          <input 
            name="bearerToken" 
            defaultValue={editingDoc?.bearerToken || ""}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" 
            className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-50 text-neutral-900
              placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
              focus:border-[#c5262e] transition border-neutral-200" 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="f-role" className="block text-xs font-medium text-neutral-600">Created By</label>
          <select
            id="f-role"
            name="created_by"
            defaultValue={editingDoc?.created_by?.id.toString() || usersList[0]?.id.toString()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50
                       text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/30
                       focus:border-[#c5262e] transition"
          >
            {usersList?.map((r: any) => (
              <option key={r.id} value={String(r.id)}>{r.name}</option>
            ))}
          </select>
        </div>
      </Slideover>

      {/* Delete Modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer le document"
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
          <span className="font-semibold text-neutral-900">{deletingDoc?.name}</span> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}