// components/SwaggerEndpoint.tsx
"use client";
import { useState } from "react";
import { FiCopy, FiCheck, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { SwaggerMethodBadge } from "./SwaggerMethodeBadge";
import { useTranslation } from "react-i18next";

interface SwaggerEndpointProps {
  method: string;
  endpoint: string;
  baseUrl: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

export function SwaggerEndpoint({
  method,
  endpoint,
  baseUrl,
  onCopy,
  copiedId,
}: SwaggerEndpointProps) {
  const { t } = useTranslation('swagger');
  const [expanded, setExpanded] = useState(false);
  const fullUrl = `${baseUrl}${endpoint}`;
  const copyId = `${method}-${endpoint}`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition">
      {/* Endpoint Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-gray-400">
          {expanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
        </div>
        <SwaggerMethodBadge method={method} />
        <code className="text-sm font-mono text-gray-700 flex-1 truncate">
          {endpoint}
        </code>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy(fullUrl, copyId);
          }}
          className="p-1.5 text-gray-400 hover:text-[#c5262e] transition rounded-md hover:bg-gray-100"
        >
          {copiedId === copyId ? (
            <FiCheck className="w-4 h-4 text-green-500" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Endpoint Details - Expanded */}
      {expanded && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
          {/* Full URL */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('request_url')}
            </p>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-white px-3 py-2 rounded border border-gray-200 text-[#c5262e] font-mono break-all flex-1">
                {fullUrl}
              </code>
              <button
                onClick={() => onCopy(fullUrl, `${copyId}-url`)}
                className="p-2 text-gray-400 hover:text-[#c5262e] transition rounded-md hover:bg-white border border-gray-200"
              >
                {copiedId === `${copyId}-url` ? (
                  <FiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Example Request */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('example_request')}
            </p>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
              {`${method} ${endpoint}
Host: ${baseUrl.replace(/^https?:\/\//, "")}
Content-Type: application/json
Authorization: Bearer <your_token>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}