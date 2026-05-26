/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
  FiClock,
  FiPlay,
  FiX,
  FiSend,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from "react-icons/fi";
import { formatDate } from "@/utils/functions";
import { PAGE_SIZE } from "@/constant";
import { useTranslation } from "react-i18next";

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

function MethodBadge({ method, t }: { method?: string; t: (key: string) => string }) {
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

// ─── API Tester Modal ─────────────────────────────────────────────────────────

interface ApiTesterModalProps {
  api: ApiType;
  baseUrl?: string;
  documentBearerToken?: string;
  onClose: () => void;
  onResponse?: (response: any) => void;
  t: (key: string) => string;
}

function ApiTesterModal({ api, baseUrl, documentBearerToken, onClose, onResponse, t }: ApiTesterModalProps) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json"
  });
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body" | "response" | "auth">("params");
  
  const [authToken, setAuthToken] = useState(() => {
    if (documentBearerToken) return documentBearerToken;
    const token = localStorage.getItem("token");
    if (token) {
      if (token.startsWith('"') && token.endsWith('"')) {
        return token.slice(1, -1);
      }
      return token;
    }
    return "";
  });
  const [showToken, setShowToken] = useState(false);

  const fullUrl = `${baseUrl || ""}${api.endPoint || ""}`;
  
  const extractPathParams = (url: string) => {
    const matches = url.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map(m => m.slice(1, -1));
  };

  const pathParams = extractPathParams(api.endPoint || "");
  
  const buildUrl = () => {
    let url = fullUrl;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    return url;
  };

  const importTokenFromCurl = () => {
    const curlCommand = prompt(t('paste_curl_command'));
    if (curlCommand) {
      const match = curlCommand.match(/-H 'Authorization: Bearer ([^']+)'/);
      if (match && match[1]) {
        setAuthToken(match[1]);
        alert(t('token_imported'));
      } else {
        alert(t('token_not_found'));
      }
    }
  };

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setActiveTab("response");
    
    try {
      const url = buildUrl();
      const method = api.apiMethod.toUpperCase();
      
      const requestOptions: RequestInit = {
        method,
        headers: {
          ...headers,
          "Authorization": authToken ? `Bearer ${authToken}` : "",
        },
      };
      
      if (method !== "GET" && method !== "DELETE" && body.trim()) {
        try {
          JSON.parse(body);
          requestOptions.body = body;
        } catch {
          requestOptions.body = body;
        }
      }
      
      const startTime = Date.now();
      const res = await fetch(url, requestOptions);
      const endTime = Date.now();
      
      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }
      
      const fullResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        time: endTime - startTime,
      };
      
      setResponse(fullResponse);
      onResponse?.(fullResponse);
    } catch (err: any) {
      console.error("Request error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <MethodBadge method={api.apiMethod} t={t} />
            <code className="text-sm font-mono text-neutral-700">{api.endPoint}</code>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-1 p-4 border-b bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab("params")}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "params"
                ? "bg-[#c5262e] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <FiCode className="w-4 h-4" />
            {t('parameters')}
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "headers"
                ? "bg-[#c5262e] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <FiServer className="w-4 h-4" />
            {t('headers')}
          </button>
          <button
            onClick={() => setActiveTab("auth")}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "auth"
                ? "bg-[#c5262e] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <FiLock className="w-4 h-4" />
            {t('auth')}
          </button>
          {api.apiMethod !== "GET" && api.apiMethod !== "DELETE" && (
            <button
              onClick={() => setActiveTab("body")}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === "body"
                  ? "bg-[#c5262e] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <FiFileText className="w-4 h-4" />
              {t('body')}
            </button>
          )}
          <button
            onClick={() => setActiveTab("response")}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "response"
                ? "bg-[#c5262e] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <FiSend className="w-4 h-4" />
            {t('response')}
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-neutral-50">
          {activeTab === "params" && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('path_parameters')}</h3>
                {pathParams.length > 0 ? (
                  <div className="space-y-3">
                    {pathParams.map((param) => (
                      <div key={param} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-neutral-700 block mb-1">
                            {param} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={params[param] || ""}
                            onChange={(e) => setParams({...params, [param]: e.target.value})}
                            placeholder={`${t('value_for')} ${param}`}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20 focus:border-[#c5262e]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">{t('no_path_params')}</p>
                )}
              </div>
              
              {api.parameters && api.parameters.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('query_parameters')}</h3>
                  <div className="space-y-3">
                    {api.parameters.map((param, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-neutral-700 block mb-1">
                            {param.name}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type="text"
                            value={params[param.name] || ""}
                            onChange={(e) => setParams({...params, [param.name]: e.target.value})}
                            placeholder={param.description || param.name}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20 focus:border-[#c5262e]"
                          />
                        </div>
                        <div className="w-32 pt-6">
                          <span className="text-xs px-2 py-1 bg-neutral-100 rounded text-neutral-600">
                            {param.type || "string"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "headers" && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900">{t('http_headers')}</h3>
                  <button
                    onClick={() => setHeaders({...headers, "": ""})}
                    className="text-xs text-[#c5262e] hover:underline flex items-center gap-1"
                  >
                    + {t('add_header')}
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(headers).map(([key, value], idx) => (
                    <div key={idx} className="flex gap-3">
                      <input
                        value={key}
                        onChange={(e) => {
                          const newHeaders = {...headers};
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          setHeaders(newHeaders);
                        }}
                        placeholder={t('header_name')}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20"
                      />
                      <input
                        value={value}
                        onChange={(e) => setHeaders({...headers, [key]: e.target.value})}
                        placeholder={t('header_value')}
                        className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20"
                      />
                      {key !== "Content-Type" && (
                        <button
                          onClick={() => {
                            const newHeaders = {...headers};
                            delete newHeaders[key];
                            setHeaders(newHeaders);
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "auth" && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('authentication')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    {t('bearer_token')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showToken ? "text" : "password"}
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder={t('token_placeholder')}
                      className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                    >
                      {showToken ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      {showToken ? t('hide') : t('show')}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {t('token_description')}
                  </p>
                </div>
                
                {documentBearerToken && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4" />
                      {t('token_loaded_from_doc')}
                    </p>
                  </div>
                )}
                
                {authToken && !documentBearerToken && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center gap-2">
                      <FiLock className="w-4 h-4" />
                      {t('token_loaded_from_storage', { length: authToken.length })}
                    </p>
                  </div>
                )}
                
                {!authToken && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      {t('token_warning')}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={importTokenFromCurl}
                  className="mt-2 text-xs text-[#c5262e] hover:underline flex items-center gap-1"
                >
                  <FiCode className="w-3 h-3" />
                  {t('import_from_curl')}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === "body" && api.apiMethod !== "GET" && api.apiMethod !== "DELETE" && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">{t('request_body')}</h3>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{
  "key": "value"
}'
                className="w-full h-64 px-3 py-2 text-sm font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20"
              />
              <p className="text-xs text-neutral-500 mt-2">
                {t('json_expected')}
              </p>
            </div>
          )}
          
          {activeTab === "response" && (
            <div className="bg-white rounded-lg p-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-[#c5262e]/30 border-t-[#c5262e] rounded-full animate-spin" />
                  <p className="text-sm text-neutral-500 mt-3">{t('executing_request')}</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAlertCircle className="w-4 h-4" />
                    <p className="font-medium">{t('error')}</p>
                  </div>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              {response && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                      response.status < 400 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ⏱️ {response.time}ms
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 mb-2">{t('response_headers')}</h4>
                    <div className="bg-neutral-50 rounded-lg p-3 space-y-1 max-h-32 overflow-auto">
                      {Object.entries(response.headers).slice(0, 10).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="font-mono text-neutral-600">{key}:</span>{' '}
                          <span className="font-mono text-neutral-800">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 mb-2">{t('response_body')}</h4>
                    <pre className="text-xs bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                      {typeof response.data === 'object' 
                        ? JSON.stringify(response.data, null, 2)
                        : response.data}
                    </pre>
                  </div>
                </div>
              )}
              
              {!loading && !response && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiSend className="w-12 h-12 text-neutral-300 mb-3" />
                  <p className="text-sm text-neutral-500">{t('click_execute')}</p>
                  <p className="text-xs text-neutral-400 mt-1">{t('configure_params')}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
          >
            {t('close')}
          </button>
          <button
            onClick={executeRequest}
            disabled={loading}
            className="px-5 py-2 bg-[#c5262e] text-white rounded-lg text-sm font-medium hover:bg-[#a81f26] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('loading')}
              </>
            ) : (
              <>
                <FiPlay className="w-4 h-4" />
                {t('execute')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Swagger-like API Card ─────────────────────────────────────────────────

function SwaggerApiCard({ api, baseUrl, bearerToken, t }: { api: ApiType; baseUrl?: string; bearerToken?: string; t: (key: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  const [showTester, setShowTester] = useState(false);
  const fullUrl = `${baseUrl || ""}${api.endPoint || ""}`;

  return (
    <>
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div 
          className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 transition"
          onClick={() => setExpanded(!expanded)}
        >
          <MethodBadge method={api.apiMethod} t={t} />
          <code className="flex-1 text-sm font-mono text-neutral-700 truncate">
            {api.endPoint || "/"}
          </code>
          <button className="text-neutral-400 hover:text-neutral-600">
            {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="p-4 space-y-3 bg-white">
            {api.description && (
              <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                {api.description}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('full_url')}</p>
              <div className="flex items-center gap-2 text-sm font-mono bg-neutral-50 p-2 rounded-lg">
                <FiGlobe className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-700 break-all">{fullUrl}</span>
              </div>
            </div>

            {api.parameters && api.parameters.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('parameters')}</p>
                <div className="space-y-1">
                  {api.parameters.map((param, idx) => (
                    <div key={idx} className="text-sm bg-neutral-50 p-2 rounded-lg">
                      <span className="font-mono">{param.name}</span>
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                      {param.description && <span className="text-neutral-500 ml-2">- {param.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {api.responses && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('responses')}</p>
                <pre className="text-xs bg-neutral-900 text-neutral-100 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(api.responses, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTester(true);
              }}
              className="w-full mt-3 px-4 py-2.5 bg-[#c5262e] text-white rounded-lg text-sm font-medium hover:bg-[#a81f26] transition flex items-center justify-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              {t('try_it_out')}
            </button>
          </div>
        )}
      </div>

      {showTester && (
        <ApiTesterModal
          api={api}
          baseUrl={baseUrl}
          documentBearerToken={bearerToken}
          onClose={() => setShowTester(false)}
          t={t}
        />
      )}
    </>
  );
}

// ─── Swagger-like Document Card ────────────────────────────────────────────

function SwaggerDocCard({ doc, t }: { doc: DocType; t: (key: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  const apiCount = doc?.apis?.length || 0;

  if (apiCount === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="flex items-center gap-2 text-xs">
            <FiInfo className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-600">{t('version')}</span>
            <span className="font-mono text-neutral-800 ml-auto">{doc.version || "1.0.0"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FiClock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-600">{t('submitted_on')}</span>
            <span className="text-neutral-800 ml-auto">{formatDate(doc?.submissionDate)}</span>
          </div>
          {doc.baseUrl && (
            <div className="flex items-center gap-2 text-xs col-span-2">
              <FiServer className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-600">{t('base_url')}</span>
              <code className="text-neutral-800 ml-auto truncate">{doc.baseUrl}</code>
            </div>
          )}
        </div>

        {(doc.bearerToken || doc.commonHeader) && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-3 text-xs">
              {doc.bearerToken && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                  <FiLock className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-700 font-medium">{t('bearer_token_present')}</span>
                </div>
              )}
              {doc.commonHeader && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg">
                  <FiCode className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 font-medium">{t('headers_present')}: {doc.commonHeader}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {apiCount > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition"
          >
            <span className="text-sm font-medium text-neutral-700">
              {apiCount} {t('api_count', { count: apiCount })}
            </span>
            <span className="text-neutral-400">
              {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </span>
          </button>
        )}
      </div>

      {expanded && apiCount > 0 && (
        <div className="p-5 bg-neutral-50/50 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <FiCode className="w-4 h-4 text-[#c5262e]" />
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">
              {t('approved_endpoints')}
            </h4>
          </div>
          <div className="space-y-2">
            {doc?.apis?.map((api) => (
              <SwaggerApiCard 
                key={api.id} 
                api={api} 
                baseUrl={doc.baseUrl}
                bearerToken={doc.bearerToken}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {doc.user_creator && (
            <span>{t('created_by')}: {doc.user_creator.name}</span>
          )}
          {doc.assignedTo && (
            <span className="flex items-center gap-1">
              <FiArrowRight className="w-3 h-3" />
              {t('assigned_to')}: {doc.assignedTo.name}
            </span>
          )}
        </div>
        {doc.cause && (
          <div className="flex items-center gap-1 text-red-600">
            <FiAlertCircle className="w-3 h-3" />
            <span>{t('cause')}: {doc.cause}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientDocs() {
  const { t } = useTranslation('clientDocs');
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
        setError(err.message ?? t('error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [clientId, t]);

  const docsWithApprovedApis = docs.filter(doc => doc.status?.toLowerCase() === "approved" || doc.status?.toLowerCase() === "approve");

  const filteredDocs = docsWithApprovedApis.filter(doc => 
    search === "" || 
    doc.name?.toLowerCase().includes(search.toLowerCase()) ||
    doc.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredDocs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-8 h-8 border-2 border-[#c5262e]/30 border-t-[#c5262e] rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">{t('loading_docs')}</p>
      </div>
    );
  }

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
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('search_placeholder')}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#c5262e]/20 focus:border-[#c5262e]"
          />
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
            <FiFileText className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-base font-medium text-neutral-500 mt-4">
            {search ? t('no_results_search') : t('no_approved_docs')}
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            {search ? t('try_different_keywords') : t('only_approved_shown')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {paginated.map((doc) => (
            <SwaggerDocCard key={doc.id} doc={doc} t={t} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-neutral-500">
            {t('showing')} {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredDocs.length)} {t('to')}{" "}
            {Math.min(currentPage * PAGE_SIZE, filteredDocs.length)} {t('of')} {filteredDocs.length} {t('documents')}
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