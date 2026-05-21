/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  FiSearch,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiCode,
  FiGlobe,
  FiAlertCircle,
  FiLock,
  FiServer,
  FiInfo,
  FiArrowRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/utils/functions";
import { PAGE_SIZE } from "@/constant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiType {
  id: string;
  apiMethod: string;
  endPoint: string;
  name?: string;
  status?: string;
  description?: string;
  parameters?: any[];
  responses?: any;
}

interface DocType {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  version?: string;
  submissionDate?: string;
  baseUrl?: string;
  commonHeader?: string;
  bearerToken?: string;
  cause?: string | null;
  apis?: ApiType[];
  user_creator?: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };
}

// ─── Method Badge ─────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  POST: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  PATCH: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  DELETE: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function MethodBadge({ method }: { method?: string }) {
  const m = method?.toUpperCase() ?? "GET";
  const colors = METHOD_COLORS[m] ?? METHOD_COLORS.GET;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold font-mono ${colors.bg} ${colors.text} border ${colors.border}`}
    >
      {m}
    </span>
  );
}

// ─── Swagger-like API Card ─────────────────────────────────────────────────

function SwaggerApiCard({ api, baseUrl }: { api: ApiType; baseUrl?: string }) {
  const [expanded, setExpanded] = useState(false);
  const fullUrl = `${baseUrl || ""}${api.endPoint || ""}`;

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* API Header */}
      <div 
        className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <MethodBadge method={api.apiMethod} />
        <code className="flex-1 text-sm font-mono text-neutral-700 truncate">
          {api.endPoint || "/"}
        </code>
        <button className="text-neutral-400 hover:text-neutral-600">
          {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* API Details */}
      {expanded && (
        <div className="p-4 space-y-3 bg-white">
          {/* Description */}
          {api.description && (
            <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
              {api.description}
            </div>
          )}

          {/* Full URL */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">URL Complète</p>
            <div className="flex items-center gap-2 text-sm font-mono bg-neutral-50 p-2 rounded-lg">
              <FiGlobe className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="text-neutral-700 break-all">{fullUrl}</span>
            </div>
          </div>

          {/* Parameters placeholder */}
          {api.parameters && api.parameters.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Paramètres</p>
              <div className="space-y-1">
                {api.parameters.map((param, idx) => (
                  <div key={idx} className="text-sm bg-neutral-50 p-2 rounded-lg">
                    {param.name}: {param.value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responses placeholder */}
          {api.responses && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Réponses</p>
              <pre className="text-xs bg-neutral-900 text-neutral-100 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(api.responses, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Swagger-like Document Card ────────────────────────────────────────────

function SwaggerDocCard({ doc }: { doc: DocType }) {
  const [expanded, setExpanded] = useState(false);
  
  // Filtrer uniquement les APIs approuvées
  const apiCount = doc?.apis?.length || 0;



  // Ne pas afficher le document s'il n'a aucune API approuvée
  if (apiCount === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Document Header */}
      <div className="p-5 border-b border-neutral-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#c5262e]/10 flex items-center justify-center shrink-0">
              <FiFileText className="w-5 h-5 text-[#c5262e]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">{doc.name}</h3>
              {doc.description && (
                <p className="text-sm text-neutral-500 mt-0.5">{doc.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="flex items-center gap-2 text-xs">
            <FiInfo className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-600">Version</span>
            <span className="font-mono text-neutral-800 ml-auto">{doc.version || "1.0.0"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FiClock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-600">Soumis le</span>
            <span className="text-neutral-800 ml-auto">{formatDate(doc?.submissionDate)}</span>
          </div>
          {doc.baseUrl && (
            <div className="flex items-center gap-2 text-xs col-span-2">
              <FiServer className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-600">Base URL</span>
              <code className="text-neutral-800 ml-auto truncate">{doc.baseUrl}</code>
            </div>
          )}
        </div>

        {/* Authentication Info */}
        {(doc.bearerToken || doc.commonHeader) && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-3 text-xs">
              {doc.bearerToken && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                  <FiLock className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-700 font-medium">Bearer Token</span>
                </div>
              )}
              {doc.commonHeader && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg">
                  <FiCode className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 font-medium">Headers: {doc.commonHeader}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Counter & Expand Button */}
        {apiCount > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition"
          >
            <span className="text-sm font-medium text-neutral-700">
              {apiCount} API{apiCount > 1 ? "s" : ""} approuvée{apiCount > 1 ? "s" : ""}
            </span>
            <span className="text-neutral-400">
              {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </span>
          </button>
        )}
      </div>

      {/* APIs Section (Swagger style) - Uniquement les APIs approuvées */}
      {expanded && apiCount > 0 && (
        <div className="p-5 bg-neutral-50/50 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <FiCode className="w-4 h-4 text-[#c5262e]" />
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              Endpoints Approuvés
            </h4>
          </div>
          <div className="space-y-2">
            {doc?.apis?.map((api) => (
              <SwaggerApiCard key={api.id} api={api} baseUrl={doc.baseUrl} />
            ))}
          </div>
        </div>
      )}

      {/* Footer with user info */}
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {doc.user_creator && (
            <span>Créé par: {doc.user_creator.name}</span>
          )}
          {doc.assignedTo && (
            <span className="flex items-center gap-1">
              <FiArrowRight className="w-3 h-3" />
              Assigné à: {doc.assignedTo.name}
            </span>
          )}
        </div>
        {doc.cause && (
          <div className="flex items-center gap-1 text-red-600">
            <FiAlertCircle className="w-3 h-3" />
            <span>Cause: {doc.cause}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientDocs() {
  const profil = useSelector((state: RootState) => state.profil.profil);
  const clientId = profil?.id;

  const [docs, setDocs] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!clientId) return;

    const fetchDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/docs/client/${clientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        const data: DocType[] = await res.json();
        
        setDocs(data);
      } catch (err: any) {
        setError(err.message ?? "Erreur lors du chargement des documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [clientId]);

  // ── Filtering & pagination ───────────────────────────────────────────────
  // Filtrer d'abord les documents qui ont au moins une API approuvée
  const docsWithApprovedApis = docs.filter(doc => doc.status?.toLowerCase() === "approved" || doc.status?.toLowerCase() === "approve");


  const totalPages = Math.max(1, Math.ceil(docsWithApprovedApis.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = docsWithApprovedApis.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

 

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-2 border-[#c5262e]/30 border-t-[#c5262e] rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">Chargement des documents...</p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <FiAlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm font-medium text-neutral-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-[#c5262e] hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Documentation API</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Explorez les endpoints approuvés disponibles
          </p>
        </div>
        
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un document par nom ou description..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20 focus:border-[#c5262e]"
          />
        </div>
      </div>

      {/* Documents Grid/List */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
            <FiFileText className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-base font-medium text-neutral-500 mt-4">
            Aucun document avec des APIs approuvées
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            Seuls les documents contenant des endpoints approuvés sont affichés
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {paginated.map((doc) => (
            <SwaggerDocCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-neutral-500">
            Affichage de {Math.min((currentPage - 1) * PAGE_SIZE + 1, docsWithApprovedApis.length)} à{" "}
            {Math.min(currentPage * PAGE_SIZE, docsWithApprovedApis.length)} sur {docsWithApprovedApis.length} documents
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    pageNum === currentPage
                      ? "bg-[#c5262e] text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}