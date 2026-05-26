'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotifications, NotificationPayload, NotificationEvent } from '@/hooks/useNotif';
import { useTranslation } from 'react-i18next';

// ─── Config visuelle par événement ───────────────────────────────────────────

const EVENT_CONFIG: Record<
  NotificationEvent,
  { labelKey: string; color: string; icon: string }
> = {
  'doc:created':    { labelKey: 'notifications.doc', color: '#0f6e56', icon: '📄' },
  'doc:updated':    { labelKey: 'notifications.doc', color: '#185fa5', icon: '✏️' },
  'doc:deleted':    { labelKey: 'notifications.doc', color: '#a32d2d', icon: '🗑️' },
  'user:created':   { labelKey: 'notifications.user', color: '#533ab7', icon: '👤' },
  'user:updated':   { labelKey: 'notifications.user', color: '#185fa5', icon: '👤' },
  'user:deleted':   { labelKey: 'notifications.user', color: '#a32d2d', icon: '👤' },
  'api:created':    { labelKey: 'notifications.api', color: '#0f6e56', icon: '🔌' },
  'api:updated':    { labelKey: 'notifications.api', color: '#185fa5', icon: '🔌' },
  'api:deleted':    { labelKey: 'notifications.api', color: '#a32d2d', icon: '🔌' },
  'activity:logged':{ labelKey: 'notifications.activity', color: '#854f0b', icon: '📊' },
  'email:sent':     { labelKey: 'notifications.email', color: '#533ab7', icon: '✉️' },
};

// ─── Types internes ───────────────────────────────────────────────────────────

interface Toast extends NotificationPayload {
  id: string;
  removing: boolean;
}

const MAX_TOASTS = 5;
const DURATION_MS = 4500;

// ─── Composant ────────────────────────────────────────────────────────────────

export function NotificationToast() {
  const { t } = useTranslation('common');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (payload: NotificationPayload) => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast: Toast = { ...payload, id, removing: false };

      setToasts((prev) => {
        const next = [toast, ...prev].slice(0, MAX_TOASTS);
        return next;
      });

      const timer = setTimeout(() => removeToast(id), DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
    },
    [],
  );

  useNotifications(addToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '0.5rem',
        maxWidth: '360px',
        width: '100%',
      }}
      role="region"
      aria-label={t('notifications.region_label')}
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const cfg = EVENT_CONFIG[toast.event];
        const eventLabel = t(cfg.labelKey);
        
        return (
          <div
            key={toast.id}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--color-background-primary)',
              border: '1px solid var(--color-border-secondary)',
              borderLeft: `4px solid ${cfg.color}`,
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              opacity: toast.removing ? 0 : 1,
              transform: toast.removing ? 'translateX(110%)' : 'translateX(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cfg.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: cfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {eventLabel}
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  wordBreak: 'break-word',
                }}
              >
                {toast.message}
              </p>
              {toast.triggeredBy && (
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {t('notifications.by')} {toast.triggeredBy}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label={t('notifications.close')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}