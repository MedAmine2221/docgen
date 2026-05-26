/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { PAGE_SIZE } from "@/constant";
import { formatDate, formatDateTime } from "@/utils/functions";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  FiSearch,
  FiEye,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCcw,
  FiX,
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiUser,
  FiFileText,
  FiCode,
  FiTrash2,
  FiPlus,
  FiEdit,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

/* ── types ────────────────────────────────────────────────────────── */
type LogEntry = {
  id: string;
  description: string;
  dateAction: string;
  typeAction: string;
  isRollbackable?: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

const getActionConfig = (t: (key: string) => string) => ({
  CREATE_DOC: {
    label: t('action_create_doc'),
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <FiPlus className="w-3 h-3" />,
  },
  UPDATE_DOC: {
    label: t('action_update_doc'),
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <FiEdit className="w-3 h-3" />,
  },
  DELETE_DOC: {
    label: t('action_delete_doc'),
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <FiTrash2 className="w-3 h-3" />,
  },
  CREATE_API: {
    label: t('action_create_api'),
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    icon: <FiPlus className="w-3 h-3" />,
  },
  UPDATE_API: {
    label: t('action_update_api'),
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-200",
    icon: <FiEdit className="w-3 h-3" />,
  },
  DELETE_API: {
    label: t('action_delete_api'),
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    icon: <FiTrash2 className="w-3 h-3" />,
  },
  CREATE_USER: {
    label: t('action_create_user'),
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
    icon: <FiUser className="w-3 h-3" />,
  },
  UPDATE_USER: {
    label: t('action_update_user'),
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <FiEdit className="w-3 h-3" />,
  },
  DELETE_USER: {
    label: t('action_delete_user'),
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    icon: <FiTrash2 className="w-3 h-3" />,
  },
  ROLLBACK: {
    label: t('action_rollback'),
    color: "text-neutral-700",
    bg: "bg-neutral-50 border-neutral-200",
    icon: <FiRotateCcw className="w-3 h-3" />,
  },
});

const ROLLBACKABLE_TYPES = [
  "UPDATE_DOC", "UPDATE_USER", "UPDATE_API",
  "DELETE_DOC", "DELETE_API", "DELETE_USER"
];

function extractOldData(description: string): any {
  const matchUpdate = description.match(
    /Anciennes données\s*:\s*(\{[\s\S]*?)\s*Nouvelles données/
  );
  if (matchUpdate) {
    try { return JSON.parse(matchUpdate[1]); } catch { return null; }
  }

  const matchDelete = description.match(/(\{[\s\S]*\})/);
  if (matchDelete) {
    try { return JSON.parse(matchDelete[1]); } catch { return null; }
  }

  return null;
}

function extractNewData(description: string): any {
  const match = description.match(/Nouvelles données\s*:\s*(\{[\s\S]*?)$/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function getActionIcon(typeAction: string) {
  if (typeAction.includes("DOC")) return <FiFileText className="w-4 h-4" />;
  if (typeAction.includes("API")) return <FiCode className="w-4 h-4" />;
  if (typeAction.includes("USER")) return <FiUser className="w-4 h-4" />;
  if (typeAction === "ROLLBACK") return <FiRotateCcw className="w-4 h-4" />;
  return <FiActivity className="w-4 h-4" />;
}

/* ── Toast ────────────────────────────────────────────────────────── */
type ToastType = "success" | "error";
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg
      text-sm font-medium border animate-in slide-in-from-bottom-4 duration-300
      ${
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {type === "success" ? (
        <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
      ) : (
        <FiAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <FiX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Confirm Modal ────────────────────────────────────────────────── */
function ConfirmRollbackModal({
  log,
  onConfirm,
  onCancel,
  loading,
  t,
}: {
  log: LogEntry;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  t: (key: string) => string;
}) {
  const oldData = extractOldData(log.description);
  const actionConfig = getActionConfig(t);
  const action = actionConfig[log.typeAction as keyof typeof actionConfig];

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <FiRotateCcw className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-base">
              {t('confirm_rollback_title')}
            </h3>
            <p className="text-sm text-neutral-500 mt-0.5">
              {t('confirm_rollback_description')}
            </p>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              {t('affected_action')}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${action?.bg} ${action?.color}`}
              >
                {action?.icon}
                {action?.label ?? log.typeAction}
              </span>
              <span className="text-xs text-neutral-400">
                {formatDateTime(log.dateAction)}
              </span>
            </div>

            {oldData && (
              <>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {t('state_to_restore')}
                </p>
                <pre className="text-xs bg-white rounded-lg p-3 border border-neutral-100 text-neutral-600 max-h-36 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(oldData, null, 2)}
                </pre>
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium
                       text-neutral-600 hover:bg-neutral-50 transition disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium
                       hover:bg-amber-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('restoring')}
              </>
            ) : (
              <>
                <FiRotateCcw className="w-4 h-4" />
                {t('confirm_rollback')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Modal ─────────────────────────────────────────────────── */
function LogDetailModal({
  log,
  onClose,
  onRollback,
  t,
}: {
  log: LogEntry;
  onClose: () => void;
  onRollback: (log: LogEntry) => void;
  t: (key: string) => string;
}) {
  const actionConfig = getActionConfig(t);
  const action = actionConfig[log.typeAction as keyof typeof actionConfig];
  
  const isUpdateType = ["UPDATE_DOC", "UPDATE_USER", "UPDATE_API"].includes(log.typeAction);
  const isDeleteType = ["DELETE_DOC", "DELETE_API", "DELETE_USER"].includes(log.typeAction);
  const canRollback = ROLLBACKABLE_TYPES.includes(log.typeAction) && !!log.isRollbackable;

  const oldData = (isUpdateType || isDeleteType) ? extractOldData(log.description) : null;
  const newData = isUpdateType ? extractNewData(log.description) : null;

  const diffKeys: string[] = [];
  if (isUpdateType && oldData && newData) {
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    allKeys.forEach((k) => {
      if (
        JSON.stringify(oldData[k]) !== JSON.stringify(newData[k]) &&
        k !== "password"
      ) {
        diffKeys.push(k);
      }
    });
  }

  const HIDDEN_FIELDS = ["password", "apis"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${action?.bg ?? "bg-neutral-50 border-neutral-200"} ${action?.color ?? "text-neutral-600"}`}>
              {getActionIcon(log.typeAction)}
            </div>
            <div>
              <p className="font-semibold text-neutral-900 text-sm">
                {action?.label ?? log.typeAction}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <FiClock className="w-3 h-3 text-neutral-400" />
                <span className="text-xs text-neutral-400">{formatDateTime(log.dateAction)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              {t('action_actor')}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#c5262e]/10 border border-[#c5262e]/15 flex items-center justify-center text-[#c5262e] font-semibold text-sm">
                {log.user?.name?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">{log.user?.name}</p>
                <p className="text-xs text-neutral-400">{log.user?.email}</p>
              </div>
            </div>
          </div>

          {isUpdateType && oldData && newData && diffKeys.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {t('modifications_made')}
              </p>
              <div className="rounded-xl border border-neutral-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100">
                      <th className="px-4 py-2.5 text-left font-semibold text-neutral-400 uppercase tracking-wider w-28">{t('field')}</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-red-400 uppercase tracking-wider">{t('before')}</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-emerald-500 uppercase tracking-wider">{t('after')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffKeys.map((key, i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                        <td className="px-4 py-2.5 font-medium text-neutral-500">{key}</td>
                        <td className="px-4 py-2.5">
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono break-all">
                            {typeof oldData[key] === "object" ? JSON.stringify(oldData[key]) : String(oldData[key] ?? "—")}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono break-all">
                            {typeof newData[key] === "object" ? JSON.stringify(newData[key]) : String(newData[key] ?? "—")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isUpdateType && oldData && newData && diffKeys.length === 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600 flex items-center gap-2">
              <FiCheck className="w-3.5 h-3.5 shrink-0" />
              {t('no_differences')}
            </div>
          )}

          {isDeleteType && oldData && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {t('deleted_item')}
              </p>
              <div className="rounded-xl border border-red-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-red-50 border-b border-red-100">
                      <th className="px-4 py-2.5 text-left font-semibold text-neutral-400 uppercase tracking-wider w-36">{t('field')}</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-red-400 uppercase tracking-wider">{t('value')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(oldData)
                      .filter(([key]) => !HIDDEN_FIELDS.includes(key))
                      .map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                          <td className="px-4 py-2.5 font-medium text-neutral-500">{key}</td>
                          <td className="px-4 py-2.5">
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono break-all">
                              {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isUpdateType && !isDeleteType && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {t('description')}
              </p>
              <pre className="text-xs bg-neutral-50 rounded-xl p-4 border border-neutral-100 text-neutral-600 max-h-64 overflow-auto whitespace-pre-wrap font-mono">
                {log.description}
              </pre>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between shrink-0">
          <div>
            {canRollback && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <FiAlertTriangle className="w-3.5 h-3.5" />
                {t('rollback_warning')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition"
            >
              {t('close')}
            </button>
            {canRollback && (
              <button
                onClick={() => onRollback(log)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition flex items-center gap-2"
              >
                <FiRotateCcw className="w-4 h-4" />
                {t('rollback')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */
export default function Logs() {
  const { t } = useTranslation('logs');
  const actionConfig = getActionConfig(t);
  
  const token = localStorage.getItem("token")

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [confirmLog, setConfirmLog] = useState<LogEntry | null>(null);
  const [rolling, setRolling] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: ToastType;
  } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/Activity_Log", {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: LogEntry[] = await res.json();
      data.sort(
        (a, b) =>
          new Date(b.dateAction).getTime() - new Date(a.dateAction).getTime()
      );
      setLogs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRollbackConfirm = async () => {
    if (!confirmLog) return;
    setRolling(true);
    try {
      const res = await fetch(
        `http://localhost:3001/Activity_Log/${confirmLog.id}/rollback`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? t('server_error'));
      setToast({ msg: data.message ?? t('rollback_success'), type: "success" });
      setConfirmLog(null);
      setSelected(null);
      await fetchLogs();
    } catch (e: any) {
      setToast({ msg: t('error_prefix') + e.message, type: "error" });
    } finally {
      setRolling(false);
    }
  };

  const actionTypes = useMemo(
    () => [...new Set(logs.map((l) => l.typeAction))],
    [logs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((l) => {
      const match =
        l.user?.name?.toLowerCase().includes(q) ||
        l.typeAction?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q);
      const typeMatch = filterType === "all" || l.typeAction === filterType;
      return match && typeMatch;
    });
  }, [logs, search, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      map[l.typeAction] = (map[l.typeAction] ?? 0) + 1;
    });
    return map;
  }, [logs]);

  return (
    <>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {selected && !confirmLog && (
        <LogDetailModal
          log={selected}
          onClose={() => setSelected(null)}
          onRollback={(log) => setConfirmLog(log)}
          t={t}
        />
      )}

      {confirmLog && (
        <ConfirmRollbackModal
          log={confirmLog}
          onConfirm={handleRollbackConfirm}
          onCancel={() => setConfirmLog(null)}
          loading={rolling}
          t={t}
        />
      )}

      <div className="space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: t('stat_total_logs'),
              value: logs.length,
              color: "text-neutral-700",
              bg: "bg-white",
              icon: <FiActivity className="w-4 h-4 text-neutral-400" />,
            },
            {
              label: t('stat_documents'),
              value: logs.filter(
                (l) =>
                  l.typeAction.includes("DOC") &&
                  !l.typeAction.includes("API")
              ).length,
              color: "text-blue-700",
              bg: "bg-blue-50",
              icon: <FiFileText className="w-4 h-4 text-blue-400" />,
            },
            {
              label: t('stat_users'),
              value: logs.filter((l) => l.typeAction.includes("USER")).length,
              color: "text-teal-700",
              bg: "bg-teal-50",
              icon: <FiUser className="w-4 h-4 text-teal-400" />,
            },
            {
              label: t('stat_rollbacks'),
              value: logs.filter((l) => l.typeAction === "ROLLBACK").length,
              color: "text-amber-700",
              bg: "bg-amber-50",
              icon: <FiRotateCcw className="w-4 h-4 text-amber-400" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-2xl border border-neutral-100 px-4 py-3 flex items-center gap-3`}
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className={`text-lg font-bold leading-none ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('search_placeholder')}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                         text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2
                         focus:ring-[#c5262e]/20 focus:border-[#c5262e] transition"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                       text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20
                       focus:border-[#c5262e] transition min-w-48"
          >
            <option value="all">{t('all_types')} ({logs.length})</option>
            {actionTypes.map((t) => (
              <option key={t} value={t}>
                {actionConfig[t as keyof typeof actionConfig]?.label ?? t} ({typeCounts[t] ?? 0})
              </option>
            ))}
          </select>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500
                       hover:bg-neutral-50 transition disabled:opacity-50 shrink-0"
            title={t('refresh')}
          >
            <FiRotateCcw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#c5262e]/20 border-t-[#c5262e] animate-spin" />
              <p className="text-sm text-neutral-400">{t('loading_logs')}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm font-medium text-neutral-700">{t('loading_error')}</p>
              <p className="text-xs text-neutral-400">{error}</p>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 rounded-xl bg-[#c5262e] text-white text-xs font-medium hover:bg-[#a81f27] transition"
              >
                {t('retry')}
              </button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-neutral-300" />
              </div>
              <p className="text-sm font-medium text-neutral-500">{t('no_logs')}</p>
              <p className="text-xs text-neutral-400">{t('adjust_filters')}</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      {t('table_actor')}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">
                      {t('table_action_type')}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider hidden xl:table-cell">
                      {t('table_date')}
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      {t('table_actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log) => {
                    const action = actionConfig[log.typeAction as keyof typeof actionConfig];
                    const canRollback =
                      log.isRollbackable &&
                      ROLLBACKABLE_TYPES.includes(log.typeAction);

                    return (
                      <tr
                        key={log.id}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/70 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl bg-[#c5262e]/8 border border-[#c5262e]/10
                                          flex items-center justify-center shrink-0 text-[#c5262e] font-semibold text-sm"
                            >
                              {log.user?.name?.charAt(0) ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-neutral-900 truncate leading-tight">
                                {log.user?.name}
                              </p>
                              <p className="text-xs text-neutral-400 truncate mt-0.5">
                                {log.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border
                            ${action?.bg ?? "bg-neutral-50 border-neutral-200"} ${action?.color ?? "text-neutral-600"}`}
                          >
                            {action?.icon}
                            {action?.label ?? log.typeAction}
                          </span>
                        </td>

                        <td className="px-6 py-4 hidden xl:table-cell">
                          <span className="text-xs text-neutral-400">
                            {formatDate(log.dateAction)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-0.5">
                            {canRollback && (
                              <button
                                onClick={() => setConfirmLog(log)}
                                className="p-1.5 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-50
                                           transition opacity-0 group-hover:opacity-100"
                                title={t('rollback_title')}
                              >
                                <FiRotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelected(log)}
                              className="p-1.5 rounded-lg text-[#c5262e]/40 hover:text-[#c5262e] hover:bg-[#c5262e]/5 transition"
                              title={t('view_details')}
                            >
                              <FiEye className="w-4 h-4" />
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
                  {t('showing')} {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}{" "}
                  {t('to')} {Math.min(currentPage * PAGE_SIZE, filtered.length)} {t('of')}{" "}
                  {filtered.length} {t('result')}{filtered.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400
                               hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition
                        ${n === currentPage ? "bg-[#c5262e] text-white" : "text-neutral-500 hover:bg-neutral-100"}`}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
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
    </>
  );
}