/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DocType } from "@/constant/interfaces";
import { IconDelete } from "@/components/icons/IconDelete";
import { RootState } from "@/redux/store";
import { FiSearch, FiEye, FiFileText, FiChevronLeft, FiChevronRight } from "react-icons/fi";
/* ── helpers ──────────────────────────────────────────────────────── */
const formatDate  = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" });

const PAGE_SIZE = 8;

/* ── component ────────────────────────────────────────────────────── */
export default function Logs() {
  const docsList  = useSelector((state: RootState) => state.docs.docs) ?? [];
  const profil = useSelector((item: RootState) => item.profil.profil);  
  const filtredDocList = useMemo(()=> {
    return docsList.filter((item: any)=> item.status.toLowerCase() !== "draft")
  },[docsList])

  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [page,          setPage]          = useState(1);


  const filtered = filtredDocList.filter((d: DocType) => {
    const q = search.toLowerCase();
    const match =
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.user_creator?.name?.toLowerCase().includes(q);
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
    approved: filtredDocList.filter((d: DocType) => ["approve","approved"].includes(d.status?.toLowerCase())).length,
    pending:  filtredDocList.filter((d: DocType) => d.status?.toLowerCase() === "pending").length,
    rejected: filtredDocList.filter((d: DocType) => d.status?.toLowerCase() === "rejected").length,
  };
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
          <option value="approved">Approuvés ({counts.approved})</option>
          <option value="pending">En attente ({counts.pending})</option>
          <option value="rejected">Rejetés ({counts.rejected})</option>
        </select>
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
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden xl:table-cell">{"Acteur de l'action"}</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Type Action</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden xl:table-cell">{"Date de l'action"}</th>
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
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <span className="text-xs text-neutral-400">{formatDate(doc.submissionDate)}</span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => {}}
                            className="p-1.5 rounded-lg text-[#c5262e]/40 hover:text-[#c5262e] hover:bg-[#c5262e]/5 transition"
                            title="Voir"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {profil?.id === doc?.user_creator?.id &&
                          <>
                    
                          
                          <button
                            onClick={() => { }}
                            className="p-1.5 rounded-lg text-neutral-300 hover:text-red-600 hover:bg-red-50
                                       transition opacity-0 group-hover:opacity-100"
                                       title="Supprimer"
                          >
                            <IconDelete />
                          </button>
                          </>
                          }
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
    </div>
  );
}