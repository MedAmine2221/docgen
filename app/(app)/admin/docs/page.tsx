/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { DocType, UserType } from "@/constant/interfaces";
import { Spinner } from "@/components/AppSpinner";
import { Modal } from "@/components/ConfirmModal";
import { Slideover } from "@/components/SlideOver";
import { IconPlus } from "@/components/icons/IconPlus";
import { IconEdit } from "@/components/icons/IconEdit";
import { IconDelete } from "@/components/icons/IconDelete";
import { API_METHOD, doc_status } from "@/constant";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { RootState } from "@/redux/store";
import { addDoc } from "@/redux/actions/docs/addDocs";
import { updateDoc } from "@/redux/actions/docs/updateDoc";
import { deleteDoc } from "@/redux/actions/docs/deleteDocs";
import { FiSearch, FiEye, FiFileText, FiGlobe, FiChevronLeft, FiChevronRight } from "react-icons/fi";

/* ── helpers ──────────────────────────────────────────────────────── */
const PALETTE = ["#c5262e","#2563eb","#16a34a","#d97706","#7c3aed","#0891b2","#db2777"];
const avatarColor = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];
const initials    = (name = "") => name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
const formatDate  = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" });

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const isApproved = s === "approve" || s === "approved";
  const isPending  = s === "pending";
  if (isApproved)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M8.5 2.5 4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        APPROVED
      </span>
    );
  if (isPending)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 3v2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        PENDING
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.5 2.5 7.5 7.5M7.5 2.5 2.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      REJECTED
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const map: Record<string,string> = {
    GET:    "bg-blue-50 text-blue-700 border-blue-100",
    POST:   "bg-green-50 text-green-700 border-green-100",
    PUT:    "bg-amber-50 text-amber-700 border-amber-100",
    PATCH:  "bg-purple-50 text-purple-700 border-purple-100",
    DELETE: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${map[method?.toUpperCase()] ?? "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
      {method}
    </span>
  );
}

const inputCls = `w-full px-3 py-2 text-sm rounded-xl border bg-neutral-50 text-neutral-900
  placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20
  focus:border-[#c5262e] transition border-neutral-200`;
const labelCls = "block text-xs font-medium text-neutral-500 mb-1";
const PAGE_SIZE = 8;

/* ── component ────────────────────────────────────────────────────── */
export default function Docs() {
  const dispatch  = useAppDispatch();
  const docsList  = useSelector((state: RootState) => state.docs.docs) ?? [];
  const usersList = useSelector((state: RootState) => state.users.users) ?? [];

  const [saving,      setSaving]      = useState(false);
  const [editingDoc,  setEditingDoc]  = useState<DocType | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocType | null>(null);
  const [showSlide,   setShowSlide]   = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page,        setPage]        = useState(1);

  const filtered = docsList.filter((d: DocType) => {
    const q = search.toLowerCase();
    const match =
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.created_by?.name?.toLowerCase().includes(q);
    const s = d.status?.toLowerCase();
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "approved" && (s === "approve" || s === "approved")) ||
      (filterStatus === "pending"  && s === "pending") ||
      (filterStatus === "rejected" && s === "rejected");
    return match && statusMatch;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = {
    approved: docsList.filter((d: DocType) => ["approve","approved"].includes(d.status?.toLowerCase())).length,
    pending:  docsList.filter((d: DocType) => d.status?.toLowerCase() === "pending").length,
    rejected: docsList.filter((d: DocType) => d.status?.toLowerCase() === "rejected").length,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const g  = (k: string) => fd.get(k) as string;
    const selectedUser = usersList.find((u: UserType) => u.id === Number(g("created_by")));
    if (!selectedUser) { setSaving(false); return; }
    try {
      const payload = {
        name: g("name"), description: g("description"), status: g("status"),
        apiMethod: g("apiMethod"), bearerToken: g("bearerToken"),
        submissionDate: g("submissionDate"), baseUrl: g("baseUrl"),
        commonHeader: g("commonHeader"), created_by: selectedUser,
      };
      if (editingDoc) await dispatch(updateDoc({ id: Number(editingDoc.id), docData: payload })).unwrap();
      else            await dispatch(addDoc(payload)).unwrap();
      setShowSlide(false); setEditingDoc(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setSaving(true);
    try {
      await dispatch(deleteDoc(Number(deletingDoc.id))).unwrap();
      setShowDelete(false); setDeletingDoc(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par titre ou auteur…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                       text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                       focus:ring-[#c5262e]/20 focus:border-[#c5262e] transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                     text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20
                     focus:border-[#c5262e] transition min-w-[160px]"
        >
          <option value="all">Tous les statuts</option>
          <option value="approved">Approuvés ({counts.approved})</option>
          <option value="pending">En attente ({counts.pending})</option>
          <option value="rejected">Rejetés ({counts.rejected})</option>
        </select>
        <button
          onClick={() => { setEditingDoc(null); setShowSlide(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c5262e] text-white
                     text-sm font-medium hover:bg-[#a81e25] transition shrink-0"
        >
          <IconPlus /> Ajouter
        </button>
      </div>

      {/* ── List ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-sm font-medium text-neutral-500">Aucun document trouvé</p>
            <p className="text-xs text-neutral-400">Modifiez vos filtres ou ajoutez un nouveau document.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Auteur</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Méthode</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden xl:table-cell">Mise à jour</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((doc: DocType) => {
                  const color = avatarColor(doc.created_by?.name ?? "");
                  return (
                    <tr key={doc.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/70 transition-colors group">
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#c5262e]/8 border border-[#c5262e]/10 flex items-center justify-center shrink-0">
                            <FiFileText className="w-4 h-4 text-[#c5262e]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate leading-tight">{doc.name}</p>
                            <p className="text-xs text-neutral-400 truncate mt-0.5 max-w-[220px]">{doc.description}</p>
                          </div>
                        </div>
                      </td>
                      {/* Author */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{ background: color + "22", color }}
                          >
                            {initials(doc.created_by?.name)}
                          </div>
                          <span className="text-sm text-neutral-600 whitespace-nowrap">{doc.created_by?.name}</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={doc.status} />
                      </td>
                      {/* Method */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <MethodBadge method={doc.apiMethod} />
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <span className="text-xs text-neutral-400">{formatDate(doc.submissionDate)}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            className="p-1.5 rounded-lg text-[#c5262e]/40 hover:text-[#c5262e] hover:bg-[#c5262e]/5 transition"
                            title="Voir"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingDoc(doc); setShowSlide(true); }}
                            className="p-1.5 rounded-lg text-neutral-300 hover:text-neutral-700 hover:bg-neutral-100
                                       transition opacity-0 group-hover:opacity-100"
                            title="Modifier"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => { setDeletingDoc(doc); setShowDelete(true); }}
                            className="p-1.5 rounded-lg text-neutral-300 hover:text-red-600 hover:bg-red-50
                                       transition opacity-0 group-hover:opacity-100"
                            title="Supprimer"
                          >
                            <IconDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-3.5 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Affichage de {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)} à{" "}
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400
                             hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition
                      ${n === currentPage ? "bg-[#c5262e] text-white" : "text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400
                             hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Slideover ─────────────────────────────────────────────── */}
      <Slideover
        open={showSlide}
        onSubmit={handleSubmit}
        onClose={() => { setShowSlide(false); setEditingDoc(null); }}
        title={editingDoc ? "Modifier le document" : "Nouveau document"}
        footer={
          <>
            <button type="button" onClick={() => setShowSlide(false)}
              className="px-4 py-2 text-sm rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition">
              Annuler
            </button>
            <button disabled={saving} type="submit"
              className="px-4 py-2 text-sm rounded-xl bg-[#c5262e] text-white font-medium
                         hover:bg-[#a81e25] disabled:opacity-60 transition flex items-center gap-2">
              {saving && <Spinner white />}
              {editingDoc ? "Enregistrer" : "Ajouter"}
            </button>
          </>
        }
      >
        {/* Section générale */}
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <FiFileText className="w-3.5 h-3.5" /> Informations générales
        </p>
        <div>
          <label className={labelCls}>Nom du document</label>
          <input name="name" defaultValue={editingDoc?.name || ""} placeholder="ex: Create User" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <input name="description" defaultValue={editingDoc?.description || ""} placeholder="Courte description…" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Statut</label>
            <select name="status" defaultValue={editingDoc?.status || doc_status[0]?.name} className={inputCls}>
              {doc_status?.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Développeur</label>
            <select name="created_by" defaultValue={editingDoc?.created_by?.id?.toString() || usersList[0]?.id?.toString()} className={inputCls}>
              {usersList?.map((r: any) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Date de soumission</label>
          <input name="submissionDate" type="datetime-local"
            defaultValue={editingDoc?.submissionDate ? editingDoc.submissionDate.slice(0, 16) : ""}
            className={inputCls} />
        </div>

        {/* Section API */}
        <div className="border-t border-neutral-100 pt-4 mt-1">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FiGlobe className="w-3.5 h-3.5" /> Configuration API
          </p>
        </div>
        <div>
          <label className={labelCls}>Base URL</label>
          <input name="baseUrl" defaultValue={editingDoc?.baseUrl || ""} placeholder="https://api.example.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Méthode HTTP</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {API_METHOD?.map((r: any) => {
              const colors: Record<string, string> = {
                GET:    "peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-checked:text-white text-blue-600 border-blue-200 bg-blue-50",
                POST:   "peer-checked:bg-green-600 peer-checked:border-green-600 peer-checked:text-white text-green-700 border-green-200 bg-green-50",
                PUT:    "peer-checked:bg-amber-500 peer-checked:border-amber-500 peer-checked:text-white text-amber-700 border-amber-200 bg-amber-50",
                PATCH:  "peer-checked:bg-purple-600 peer-checked:border-purple-600 peer-checked:text-white text-purple-700 border-purple-200 bg-purple-50",
                DELETE: "peer-checked:bg-red-500 peer-checked:border-red-500 peer-checked:text-white text-red-600 border-red-200 bg-red-50",
              };
              return (
                <label key={r.id} className="cursor-pointer">
                  <input type="radio" name="apiMethod" value={r.name}
                    defaultChecked={editingDoc ? editingDoc.apiMethod === r.name : r.id === API_METHOD[0]?.id}
                    className="peer sr-only" />
                  <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg border transition ${colors[r.name?.toUpperCase()] ?? "text-neutral-600 border-neutral-200 bg-neutral-50"}`}>
                    {r.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <label className={labelCls}>Common Header</label>
          <input name="commonHeader" defaultValue={editingDoc?.commonHeader || ""}
            placeholder={`{"Content-Type":"application/json"}`} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Bearer Token</label>
          <input name="bearerToken" defaultValue={editingDoc?.bearerToken || ""}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" className={inputCls} />
        </div>
      </Slideover>

      {/* ── Delete modal ──────────────────────────────────────────── */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer le document"
        footer={
          <>
            <button onClick={() => setShowDelete(false)}
              className="px-4 py-2 text-sm rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition">
              Annuler
            </button>
            <button onClick={handleDelete} disabled={saving}
              className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-medium
                         hover:bg-red-600 disabled:opacity-60 transition flex items-center gap-2">
              {saving && <Spinner white />}
              Supprimer
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-neutral-900">«{deletingDoc?.name}»</span> ?
          <br />Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}