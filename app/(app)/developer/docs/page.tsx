/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DocType } from "@/constant/interfaces";
import { Spinner } from "@/components/AppSpinner";
import { Modal } from "@/components/ConfirmModal";
import { IconPlus } from "@/components/icons/IconPlus";
import { IconEdit } from "@/components/icons/IconEdit";
import { IconDelete } from "@/components/icons/IconDelete";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { RootState } from "@/redux/store";
import { addDoc } from "@/redux/actions/docs/addDocs";
import { updateDoc } from "@/redux/actions/docs/updateDoc";
import { deleteDoc } from "@/redux/actions/docs/deleteDocs";
import {
  FiSearch, FiEye, FiFileText, FiGlobe,
  FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiCheck, FiX,
  FiSend,
} from "react-icons/fi";
import MethodBadge from "@/components/MethodBadge";
import StatusBadge from "@/components/StatusBadge";
import { HTTP_METHODS, PAGE_SIZE } from "@/constant";
import { formatDate } from "@/utils/functions";
import { useNotifications } from "@/hooks/useNotif";
import { getMe } from "@/redux/actions/auth/login";
import { GoVersions } from "react-icons/go";

export interface ApiEntry {
  id?: number;
  apiMethod: string;
  endPoint: string;
  _markedForDelete?: boolean;
}


const inputCls = `w-full px-3 py-2 text-sm rounded-xl border bg-neutral-50 text-neutral-900
  placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20
  focus:border-[#c5262e] transition border-neutral-200`;
const labelCls = "block text-xs font-medium text-neutral-500 mb-1";

/* ── component ────────────────────────────────────────────────────── */
export default function Docs() {
  const dispatch  = useAppDispatch();
  const me = useSelector((state: RootState)=> state.profil.profil);
  
const [viewingDoc, setViewingDoc] = useState<DocType | null>(null);
const [showViewModal, setShowViewModal] = useState(false);
const openViewDetails = (doc: DocType) => {  
  setViewingDoc(doc);
  setShowViewModal(true);
};
const [showCloseConfirm, setShowCloseConfirm] = useState(false);
const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);

  const [saving,        setSaving]        = useState(false);
  const [editingDoc,    setEditingDoc]    = useState<DocType | null>(null);
  const [deletingDoc,   setDeletingDoc]   = useState<DocType | null>(null);
  const [showSlide,     setShowSlide]     = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [page,          setPage]          = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
const [initialSnapshot, setInitialSnapshot] = useState<string>("");
const [hasChanges, setHasChanges] = useState(false);
  const [apiEntries,    setApiEntries]    = useState<ApiEntry[]>([{ apiMethod: "GET", endPoint: "" }]);
  const [editingApiIdx, setEditingApiIdx] = useState<number | null>(null);
  const [editingApiDraft, setEditingApiDraft] = useState<ApiEntry>({ apiMethod: "GET", endPoint: "" });
  const usersList = useSelector((state: RootState) => state.users.users) ?? [];
  const listeClient = useMemo(()=>{
    return usersList.filter((item)=> item.role.name_fr === "CLIENT")
  },[usersList])
const buildSnapshot = (doc: DocType | null, entries: ApiEntry[]) => {
  return JSON.stringify({
    name: doc?.name ?? "",
    description: doc?.description ?? "",
    submissionDate: doc?.submissionDate ? doc.submissionDate.slice(0, 16) : new Date().toISOString().slice(0, 16),
    baseUrl: doc?.baseUrl ?? "",
    commonHeader: doc?.commonHeader ?? "",
    bearerToken: doc?.bearerToken ?? "",
    apis: entries.filter(a => !a._markedForDelete).map(a => `${a.apiMethod}:${a.endPoint}`).join("|"),
  });
};
useNotifications(
  () => {
    dispatch(getMe()); // rechargera me?.docs automatiquement
  },
  ['doc:created', 'doc:updated', 'doc:deleted']
);
const hasDocFormChanges = () => {
  if (!showSlide) return false;
  
  if (editingDoc) {
    // Mode édition - utiliser hasChanges existant
    return hasChanges;
  } else {
    // Mode ajout - vérifier si des valeurs ont été saisies
    const form = document.querySelector('form');
    if (!form) return false;
    
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const baseUrl = formData.get("baseUrl") as string;
    const hasAnyApi = apiEntries.some(api => api.endPoint.trim() !== "");
    
    return !!(name || description || baseUrl || hasAnyApi);
  }
};

const attemptClose = (closeAction: () => void) => {
  if (hasDocFormChanges()) {
    setPendingCloseAction(() => closeAction);
    setShowCloseConfirm(true);
  } else {
    closeAction();
  }
};

  const addApiEntry = () =>
    setApiEntries(prev => [...prev, { apiMethod: "GET", endPoint: "" }]);

  const removeApiEntry = (idx: number) => {
    const entry = apiEntries[idx];
    if (entry.id) {
      // Mark existing API for deletion
      setApiEntries(prev => prev.map((e, i) => 
        i === idx ? { ...e, _markedForDelete: true } : e
      ));
    } else {
      // Remove new API completely
      setApiEntries(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const startEditApi = (idx: number) => {
    setEditingApiIdx(idx);
    setEditingApiDraft({ ...apiEntries[idx] });
  };

  const confirmEditApi = (idx: number) => {
    setApiEntries(prev => prev.map((e, i) => i === idx ? { ...editingApiDraft } : e));
    setEditingApiIdx(null);
  };

  const cancelEditApi = () => setEditingApiIdx(null);

const openAdd = () => {
  setEditingDoc(null);
  setApiEntries([{ apiMethod: "GET", endPoint: "" }]);
  setEditingApiIdx(null);
  setInitialSnapshot("");
  setHasChanges(false);
  setShowSlide(true);
};

const openEdit = (doc: DocType) => {
  setEditingDoc(doc);
  const existing: ApiEntry[] = (doc?.apis ?? []).map((a: any) => ({
    id: a.id,
    apiMethod: a.apiMethod,
    endPoint: a.endPoint,
  }));
  const entries = existing.length ? existing : [{ apiMethod: "GET", endPoint: "" }];
  setApiEntries(entries);
  setEditingApiIdx(null);
  const snap = buildSnapshot(doc, entries);
  setInitialSnapshot(snap);
  setHasChanges(false);
  setShowSlide(true);
};
const checkChanges = (form: HTMLFormElement, currentEntries: ApiEntry[]) => {
  if (!editingDoc) return;
  const fd = new FormData(form);
  const g = (k: string) => (fd.get(k) as string) ?? "";
  const currentSnap = JSON.stringify({
    name: g("name"),
    description: g("description"),
    submissionDate: g("submissionDate"),
    baseUrl: g("baseUrl"),
    commonHeader: g("commonHeader"),
    bearerToken: g("bearerToken"),
    apis: currentEntries.filter(a => !a._markedForDelete).map(a => `${a.apiMethod}:${a.endPoint}`).join("|"),
  });
  setHasChanges(currentSnap !== initialSnapshot);
};
useEffect(() => {
  if (!showSlide || !editingDoc) return;
  const apiSnap = apiEntries
    .filter(a => !a._markedForDelete)
    .map(a => `${a.apiMethod}:${a.endPoint}`)
    .join("|");
  const initialParsed = initialSnapshot ? JSON.parse(initialSnapshot) : null;
  if (initialParsed && apiSnap !== initialParsed.apis) {
    setHasChanges(true);
  } else if (initialParsed && apiSnap === initialParsed.apis) {
    // Re-check form fields too — reset only if needed
    setHasChanges(false);
  }
}, [apiEntries]);
  const filtered = me?.docs?.filter((d: DocType) => {
    const q = search.toLowerCase();
    const match =
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.user_creator?.name?.toLowerCase().includes(q);
    const s = d.status?.toLowerCase();
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "draft" && s === "draft") ||
      (filterStatus === "approved" && (s === "approve" || s === "approved")) ||
      (filterStatus === "pending"  && s === "pending") ||
      (filterStatus === "rejected" && s === "rejected");
    return match && statusMatch;
  }) ?? [];

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = {
    approved: me?.docs?.filter((d: DocType) => ["approve","approved"].includes(d.status?.toLowerCase())).length ?? 0,
    pending:  me?.docs?.filter((d: DocType) => d.status?.toLowerCase() === "pending").length ?? 0,
    draft:  me?.docs?.filter((d: DocType) => d.status?.toLowerCase() === "draft").length ?? 0,
    rejected: me?.docs?.filter((d: DocType) => d.status?.toLowerCase() === "rejected").length ?? 0,
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setSaving(true);
  const fd = new FormData(e.currentTarget);
  const g  = (k: string) => fd.get(k) as string;

  // ── Validation ──────────────────────────────────────────────────
  const name           = g("name").trim();
  const description    = g("description").trim();
  const submissionDate = g("submissionDate").trim();
  const baseUrl        = g("baseUrl").trim();

  const validApis = apiEntries.filter(a => !a._markedForDelete && a.endPoint.trim() !== "");

  if (!name || !description || !submissionDate || !baseUrl) {
    setFormError("Veuillez remplir tous les champs obligatoires.");
    setSaving(false);
    return;
  }
  if (validApis.length === 0) {
    setFormError("Veuillez ajouter au moins un endpoint valide.");
    setSaving(false);
    return;
  }

  setFormError(null);

    try {
      
      // Separate APIs by operation type
      const apisToDelete = apiEntries.filter(a => a._markedForDelete && a.id);
      const apisToKeep = apiEntries.filter(a => !a._markedForDelete);
      const apisToAdd = apisToKeep.filter(a => !a.id && a.endPoint.trim() !== "");
      const apisToUpdate = apisToKeep.filter(a => a.id && a.endPoint.trim() !== "");
      const docPayload = {
        name:           g("name"),
        description:    g("description"),
        status:         "draft",
        submissionDate: g("submissionDate"),
        baseUrl:        g("baseUrl"),
        commonHeader:   g("commonHeader"),
        bearerToken:    g("bearerToken"),
        user_creator:   me?.id,
        cause: g("cause") ?? null,
        // Send separate arrays for CRUD operations
        apisToAdd,
        apisToUpdate,
        apisToDelete,
      };
      

      if (editingDoc) {
        await dispatch(updateDoc({ id: String(editingDoc.id), docData: docPayload })).unwrap();
      } else {
        
        // For new document, only send APIs to add
        await dispatch(addDoc({
          name: docPayload?.name,
          description: docPayload.description,
          submissionDate: docPayload.submissionDate,
          status: docPayload?.status,
          baseUrl: docPayload.baseUrl,
          commonHeader: docPayload.commonHeader,
          bearerToken: docPayload.bearerToken,
          user_creator: docPayload.user_creator,
          apis: apisToAdd,
          assignedTo: g("assignedTo"), // ✅ ajouter cette ligne
      })).unwrap();
      }
      setShowSlide(false);
      setEditingDoc(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setSaving(true);
    try {
      await dispatch(deleteDoc(String(deletingDoc.id))).unwrap();
      setShowDelete(false);
      setDeletingDoc(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (doc: DocType) => {
  setSaving(true);
  try {
    // ✅ Solution : envoyer toutes les données existantes + le nouveau status
    await dispatch(updateDoc({ 
      id: String(doc.id), 
      docData: { 
        name: doc.name,
        description: doc.description,
        submissionDate: doc.submissionDate,
        baseUrl: doc.baseUrl,
        commonHeader: doc.commonHeader,
        bearerToken: doc.bearerToken,
        user_creator: doc.user_creator,
        status: "pending",
        // Important : inclure les APIs existantes
        apisToUpdate: doc.apis?.filter((api: any) => api.id).map((api: any) => ({
          id: api.id,
          apiMethod: api.apiMethod,
          endPoint: api.endPoint
        })) || [],
        apisToAdd: doc.apis?.filter((api: any) => !api.id).map((api: any) => ({
          apiMethod: api.apiMethod,
          endPoint: api.endPoint
        })) || [],
        apisToDelete: []
      } 
    })).unwrap();
  } catch (err) {
    console.error(err);
  } finally {
    setSaving(false);
  }
};
  const visibleEntries = apiEntries.map((e, i) => ({ ...e, _idx: i })).filter(e => !e._markedForDelete);
  return (
    <div className="space-y-4">

      {/* Toolbar */}
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
                     focus:border-[#c5262e] transition min-w-40"
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillon ({counts.draft})</option>
          <option value="approved">Approuvés ({counts.approved})</option>
          <option value="pending">En attente ({counts.pending})</option>
          <option value="rejected">Rejetés ({counts.rejected})</option>
        </select>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c5262e] text-white
                     text-sm font-medium hover:bg-[#a81e25] transition shrink-0"
        >
          <IconPlus /> Ajouter
        </button>
      </div>

      {/* List */}
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
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">APIs</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden xl:table-cell">Mise à jour</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {paginated.map((doc: DocType) => {
                  return (
                    <tr key={doc.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#c5262e]/8 border border-[#c5262e]/10 flex items-center justify-center shrink-0">
                            <FiFileText className="w-4 h-4 text-[#c5262e]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate leading-tight">{doc.name}</p>
                            <p className="text-xs text-neutral-400 truncate mt-0.5 max-w-55">{doc.description}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={doc.status} />
                       </td>
     
                       {/* <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(doc.apis ?? []).length > 0 ? (
                            <div className="flex items-center justify-center">
                              {(doc.apis as any[]).slice(0, 1).map((api: any, i: number) => (
                                <div key={i} className="flex items-center gap-1">
                                  <MethodBadge method={api.apiMethod} />
                                  <span className="text-[10px] text-neutral-400 font-mono truncate max-w-20">
                                    {api.endPoint}
                                  </span>
                                </div>
                              ))}
                              {(doc.apis as any[]).length > 3 && (
                                <span className="text-[10px] text-neutral-400 m-4">+{(doc.apis as any[]).length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">{"Pas d'APIs"}</span>
                          )}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 hidden lg:table-cell">
  <div className="flex flex-wrap gap-1">
    {(doc.apis ?? []).length > 0 ? (
      <div className="flex items-center gap-1">
        {/* Afficher la première API */}
        <div className="flex items-center gap-1">
          <MethodBadge method={(doc.apis as any[])[0]?.apiMethod} />
          <span className="text-[10px] text-neutral-400 font-mono truncate max-w-28">
            {(doc.apis as any[])[0]?.endPoint}
          </span>
        </div>
        
        {/* Afficher le nombre d'APIs restantes */}
        {(doc.apis as any[]).length > 1 && (
          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full ml-1">
            +{(doc.apis as any[]).length - 1}
          </span>
        )}
      </div>
    ) : (
      <span className="text-xs text-neutral-400 italic">{"Pas d'APIs"}</span>
    )}
  </div>
</td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <span className="text-xs text-neutral-400">{formatDate(doc.submissionDate)}</span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                    
                            {doc.status?.toLowerCase() === "draft" && (
                              <button
                                onClick={() => handleReview(doc)}
                                disabled={saving}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                                          text-amber-600 bg-amber-50 border border-amber-200
                                          hover:bg-amber-100 disabled:opacity-50 transition shrink-0"
                                title="Soumettre pour review"
                              >
                                <FiSend className="w-3 h-3" /> Review
                              </button>
                            )}
                          <>
                            <button
                              onClick={() => openEdit(doc)}
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
                            <button
                              onClick={() => openViewDetails(doc)}
                              className="p-1.5 rounded-lg text-[#c5262e]/40 hover:text-[#c5262e] hover:bg-[#c5262e]/5 transition"
                              title="Voir"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </>
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

      {/* Modal Add / Edit - Centrée */}
      {showSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => attemptClose(() => {
              setShowSlide(false);
              setEditingDoc(null);
              setFormError(null);
            })}/>

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <h2 className="text-base font-semibold text-neutral-900">
                {editingDoc ? "Modifier le document" : "Nouveau document"}
              </h2>
              <button
                onClick={() => attemptClose(() => {
                  setShowSlide(false);
                  setEditingDoc(null);
                  setFormError(null);
                })}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body + Footer */}
              <form
                onSubmit={handleSubmit}
                onChange={(e) => checkChanges(e.currentTarget, apiEntries)}
                className="flex flex-col flex-1 overflow-hidden"
              >
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {editingDoc && <p className="text-base font-semibold text-neutral-400 tracking-wide mb-3 flex items-center gap-1.5">
                  <GoVersions className="w-4 h-4" /> Version {editingDoc?.version}
                </p>}
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                  <FiFileText className="w-3.5 h-3.5" /> Informations générales
                </p>
                <div>
                  <label className={labelCls}>Client assigné</label>
                  <select 
                    name="assignedTo" 
                    required
                    className={inputCls}
                    defaultValue=""
                    disabled={!!editingDoc}
                  >
                    <option value="" disabled>Sélectionner un client</option>
                    {listeClient.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-400 mt-1">
                    Ce client pourra consulter la documentation
                  </p>
                </div>
                {editingDoc && 
                  <div>
                    <label className={labelCls}>Cause de modification</label>
                    <select
                      name="cause"
                      className="px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                                text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20
                                focus:border-[#c5262e] transition min-w-40"
                    >
                      <option value="Bug">Bug</option>
                      <option value="Nouveau EndPoint">Nouveau EndPoint</option>
                      <option value="Changement du document">Changement du document</option>
                    </select>
                  </div>
                }
                <div>
                  <label className={labelCls}>Nom du document</label>
                  <input name="name" defaultValue={editingDoc?.name || ""} placeholder="ex: commande carrefour" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input name="description" defaultValue={editingDoc?.description || ""} placeholder="Courte description…" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date de soumission</label>
                  <input name="submissionDate" type="datetime-local"
                    defaultValue={editingDoc?.submissionDate ? editingDoc.submissionDate.slice(0, 16) : new Date().toISOString().slice(0, 16)}
                    className={inputCls} />
                </div>

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
                  <label className={labelCls}>Common Header</label>
                  <input name="commonHeader" defaultValue={editingDoc?.commonHeader || ""}
                    placeholder={`{"Content-Type":"application/json"}`} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bearer Token</label>
                  <input name="bearerToken" defaultValue={editingDoc?.bearerToken || ""}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" className={inputCls} />
                </div>

                {/* Endpoints */}
                <div className="border-t border-neutral-100 pt-4 mt-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                      <FiGlobe className="w-3.5 h-3.5" /> Endpoints
                    </p>
                    <button type="button" onClick={addApiEntry}
                      className="flex items-center gap-1 text-xs text-[#c5262e] hover:text-[#a81e25] font-medium transition">
                      <FiPlus className="w-3.5 h-3.5" /> Ajouter un endpoint
                    </button>
                  </div>

                  <div className="space-y-2">
                    {visibleEntries.map((entry) => {
                      const idx = entry._idx;
                      const isEditing = editingApiIdx === idx;
                      const isExisting = !!entry.id;

                      return (
                        <div key={idx} className={`rounded-xl border transition ${
                          isEditing ? "border-[#c5262e]/30 bg-[#c5262e]/3"
                          : isExisting ? "border-neutral-200 bg-white"
                          : "border-dashed border-neutral-200 bg-neutral-50"
                        }`}>
                          {isEditing ? (
                            <div className="flex items-center gap-2 p-2">
                              <select
                                value={editingApiDraft.apiMethod}
                                onChange={(e) => setEditingApiDraft(d => ({ ...d, apiMethod: e.target.value }))}
                                className="px-2 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-white
                                          text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20
                                          focus:border-[#c5262e] transition w-21.5 shrink-0"
                              >
                                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <input
                                value={editingApiDraft.endPoint}
                                onChange={(e) => setEditingApiDraft(d => ({ ...d, endPoint: e.target.value }))}
                                placeholder="/users/:id"
                                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 bg-white
                                          text-neutral-900 placeholder:text-neutral-400 font-mono
                                          focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20 focus:border-[#c5262e] transition"
                              />
                              <button type="button" onClick={() => confirmEditApi(idx)}
                                className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition shrink-0">
                                <FiCheck className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={cancelEditApi}
                                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition shrink-0">
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 group/api">
                              <MethodBadge method={entry.apiMethod} />
                              <span className="flex-1 text-xs font-mono text-neutral-600 truncate">
                                {entry.endPoint || <span className="text-neutral-300 italic">endpoint…</span>}
                              </span>
                              {isExisting && (
                                <span className="text-[9px] font-semibold text-neutral-300 uppercase tracking-wide shrink-0 mr-1">
                                  saved
                                </span>
                              )}
                              <button type="button" onClick={() => startEditApi(idx)}
                                className="p-1 rounded-md text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100
                                          transition opacity-0 group-hover/api:opacity-100 shrink-0">
                                <IconEdit />
                              </button>
                              {(isExisting || visibleEntries.length > 1) && (
                                <button type="button" onClick={() => removeApiEntry(idx)}
                                  className="p-1 rounded-md text-neutral-300 hover:text-red-500 hover:bg-red-50
                                            transition opacity-0 group-hover/api:opacity-100 shrink-0">
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {formError && (
                <div className="mx-6 mb-0 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                  <FiX className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs font-medium text-red-600">{formError}</p>
                </div>
              )}
              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50 shrink-0">
                <button type="button" 
                  onClick={() => attemptClose(() => {
    setShowSlide(false);
    setEditingDoc(null);
    setFormError(null);
  })}
                
                  className="px-4 py-2 text-sm rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition">
                  Annuler
                </button>
                <button
                  disabled={saving || (!!editingDoc && !hasChanges)}
                  type="submit"
                  className="px-4 py-2 text-sm rounded-xl bg-[#c5262e] text-white font-medium
                    hover:bg-[#a81e25] disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {saving && <Spinner white />}
                  {editingDoc ? "Enregistrer" : "Ajouter"}
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
      {/* Modal de détails */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Détails du document"
        footer={
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 text-sm rounded-xl bg-[#c5262e] text-white font-medium hover:bg-[#a81e25] transition"
          >
            Fermer
          </button>
        }
      >
        {viewingDoc && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Informations générales */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-3">
                Informations générales
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Nom :</span>
                  <span className="text-sm text-neutral-700 col-span-2 font-medium">{viewingDoc.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Description :</span>
                  <span className="text-sm text-neutral-600 col-span-2">{viewingDoc.description || "—"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Statut :</span>
                  <div className="col-span-2"><StatusBadge status={viewingDoc.status} /></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Date de soumission :</span>
                  <span className="text-sm text-neutral-700 col-span-2">{formatDate(viewingDoc.submissionDate)}</span>
                </div>
              </div>
            </div>

            {/* Configuration API */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-3">
                Configuration API
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Base URL :</span>
                  <span className="text-sm text-neutral-700 col-span-2 font-mono break-all">{viewingDoc.baseUrl || "—"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Common Header :</span>
                  <span className="text-sm text-neutral-700 col-span-2 font-mono break-all">{viewingDoc.commonHeader || "—"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs text-neutral-400">Bearer Token :</span>
                  <span className="text-sm text-neutral-700 col-span-2 font-mono break-all">
                    {viewingDoc.bearerToken ? viewingDoc.bearerToken.substring(0, 30) + "..." : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-3">
                Endpoints ({viewingDoc.apis?.length || 0})
              </h3>
              <div className="space-y-2">
                {(viewingDoc.apis ?? []).length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="text-left py-2 text-xs text-neutral-400 font-medium">Méthode</th>
                        <th className="text-left py-2 text-xs text-neutral-400 font-medium">Endpoint</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewingDoc.apis as any[]).map((api, idx) => (
                        <tr key={idx} className="border-b border-neutral-50 last:border-0">
                          <td className="py-2"><MethodBadge method={api.apiMethod} /></td>
                          <td className="py-2"><span className="text-xs font-mono text-neutral-600 break-all">{api.endPoint}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-neutral-400 italic text-center py-4">Aucun endpoint configuré</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
  <Modal
  open={showCloseConfirm}
  onClose={() => {
    setShowCloseConfirm(false);
    setPendingCloseAction(null);
  }}
  title="Confirmation"
  footer={
    <div className="flex gap-3">
      <button
        onClick={() => {
          setShowCloseConfirm(false);
          setPendingCloseAction(null);
        }}
        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
      >
        Rester
      </button>
      <button
        onClick={() => {
          if (pendingCloseAction) pendingCloseAction();
          setShowCloseConfirm(false);
          setPendingCloseAction(null);
        }}
        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
      >
        Quitter sans sauvegarder
      </button>
    </div>
  }
>
  <div className="text-center">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
      <FiX className="w-8 h-8 text-amber-500" />
    </div>
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Quitter sans sauvegarder ?</h3>
    <p className="text-sm text-neutral-500">
      Vous avez des modifications non enregistrées.
      <br />
      Êtes-vous sûr de vouloir quitter ?
    </p>
  </div>
</Modal>

    </div>
  );
}